#!/usr/bin/env python3
"""
PAIMANA-INTEL — Feature Registry Generator
Generates canonical feature registry in CSV and Markdown formats
documenting definitions, formulas, lookback windows, leakage policies, and types.
"""

import os
import pandas as pd

REGISTRY = [
    # -------------------------------------------------------------
    # Group A: Project Duration & Time
    # -------------------------------------------------------------
    {
        "feature_name": "duration_planned_months",
        "feature_group": "duration",
        "feature_type": "integer",
        "table_name": "gold_project_monthly_metrics",
        "formula": "ROUND((original_doc - approval_date) / 30.4375)",
        "lookback_window": "0 (static snapshot)",
        "missingness_policy": "NULL if either date missing",
        "leakage_policy": "Safe (static baseline known at sanction)",
        "description": "Total originally planned project execution duration in months."
    },
    {
        "feature_name": "duration_elapsed_months",
        "feature_group": "duration",
        "feature_type": "integer",
        "table_name": "gold_project_monthly_metrics",
        "formula": "ROUND((reporting_date - approval_date) / 30.4375)",
        "lookback_window": "0 (as-of reporting date)",
        "missingness_policy": "NULL if approval_date missing",
        "leakage_policy": "Safe (uses only past reporting dates)",
        "description": "Chronological months elapsed from sanction/approval to current reporting period."
    },
    {
        "feature_name": "duration_remaining_months",
        "feature_group": "duration",
        "feature_type": "integer",
        "table_name": "gold_project_monthly_metrics",
        "formula": "ROUND((original_doc - reporting_date) / 30.4375)",
        "lookback_window": "0 (as-of reporting date)",
        "missingness_policy": "NULL if original_doc missing",
        "leakage_policy": "Safe (evaluates remaining time to planned baseline)",
        "description": "Remaining planned duration to original commissioning date (can be negative if delayed)."
    },
    {
        "feature_name": "time_elapsed_pct",
        "feature_group": "duration",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "(duration_elapsed_months / duration_planned_months) * 100",
        "lookback_window": "0 (as-of reporting date)",
        "missingness_policy": "NULL if planned duration <= 0 or missing",
        "leakage_policy": "Safe (as-of ratio)",
        "description": "Percentage of planned execution timeline consumed as of current reporting date."
    },
    {
        "feature_name": "time_remaining_pct",
        "feature_group": "duration",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "100.0 - time_elapsed_pct",
        "lookback_window": "0 (as-of reporting date)",
        "missingness_policy": "NULL if time_elapsed_pct is NULL",
        "leakage_policy": "Safe (deterministic complement)",
        "description": "Remaining execution timeline percentage."
    },

    # -------------------------------------------------------------
    # Group B: Cost Escalation & Financial Exposure
    # -------------------------------------------------------------
    {
        "feature_name": "cost_escalation_cr",
        "feature_group": "cost",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "revised_cost_cr - original_cost_cr",
        "lookback_window": "0 (current reported revision)",
        "missingness_policy": "0.0 if revised cost unpopulated (defaults to original cost)",
        "leakage_policy": "Safe (records currently sanctioned revision at time T)",
        "description": "Absolute cost escalation in ₹ Crore as sanctioned at reporting period."
    },
    {
        "feature_name": "cost_escalation_pct",
        "feature_group": "cost",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "((revised_cost_cr - original_cost_cr) / original_cost_cr) * 100",
        "lookback_window": "0 (current reported revision)",
        "missingness_policy": "0.0 if revised == original; NULL if original_cost <= 0",
        "leakage_policy": "Safe (uses only revisions enacted <= T)",
        "description": "Percentage cost escalation over original sanctioned baseline."
    },
    {
        "feature_name": "cost_growth_factor",
        "feature_group": "cost",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "revised_cost_cr / original_cost_cr",
        "lookback_window": "0 (current reported revision)",
        "missingness_policy": "1.0 if unrevised; NULL if original_cost <= 0",
        "leakage_policy": "Safe (cost multiple known at T)",
        "description": "Multiplicative factor of cost revision (e.g. 1.25 = 25% cost growth)."
    },
    {
        "feature_name": "expenditure_pct",
        "feature_group": "cost",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "(cumulative_expenditure_cr / revised_cost_cr) * 100",
        "lookback_window": "0 (current reported expenditure)",
        "missingness_policy": "0.0 if expenditure missing; NULL if revised_cost <= 0",
        "leakage_policy": "Safe (cumulative spend realized <= T)",
        "description": "Financial burn percentage against latest revised sanctioned cost."
    },
    {
        "feature_name": "remaining_financial_exposure_cr",
        "feature_group": "cost",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "MAX(0.0, revised_cost_cr - cumulative_expenditure_cr)",
        "lookback_window": "0 (current reported state)",
        "missingness_policy": "revised_cost_cr if expenditure is 0.0",
        "leakage_policy": "Safe (unspent capital allocation as of T)",
        "description": "Remaining unspent capital outlay in ₹ Crore required to complete project."
    },

    # -------------------------------------------------------------
    # Group C: Progress & Divergence
    # -------------------------------------------------------------
    {
        "feature_name": "physical_progress_pct",
        "feature_group": "progress",
        "feature_type": "float",
        "table_name": "fact_project_month",
        "formula": "MIN(100.0, MAX(0.0, raw_physical_progress))",
        "lookback_window": "0 (reported progress at T)",
        "missingness_policy": "0.0 if unobserved",
        "leakage_policy": "Safe (observed physical completion at T)",
        "description": "Certified physical progress percentage on site as of reporting period."
    },
    {
        "feature_name": "financial_progress_pct",
        "feature_group": "progress",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "expenditure_pct",
        "lookback_window": "0 (reported expenditure at T)",
        "missingness_policy": "0.0 if unspent",
        "leakage_policy": "Safe (financial utilization at T)",
        "description": "Financial progress percentage defined as cumulative spend / revised cost."
    },
    {
        "feature_name": "physical_financial_gap",
        "feature_group": "progress",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "physical_progress_pct - financial_progress_pct",
        "lookback_window": "0 (reported at T)",
        "missingness_policy": "NULL if either component missing",
        "leakage_policy": "Safe (deterministic cross-dimensional gap)",
        "description": "Divergence between physical progress and financial burn. Negative values indicate fund expenditure outpacing physical work."
    },

    # -------------------------------------------------------------
    # Group D: Planned Baseline vs Actual
    # -------------------------------------------------------------
    {
        "feature_name": "expected_baseline_progress_pct",
        "feature_group": "planned_vs_actual",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "MIN(100.0, MAX(0.0, time_elapsed_pct))",
        "lookback_window": "0 (time-based linear baseline)",
        "missingness_policy": "NULL if time_elapsed_pct is NULL",
        "leakage_policy": "Safe (standardized baseline schedule pace)",
        "description": "Linear time-elapsed progress baseline expectation in absence of S-curve milestones."
    },
    {
        "feature_name": "progress_deviation",
        "feature_group": "planned_vs_actual",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "physical_progress_pct - expected_baseline_progress_pct",
        "lookback_window": "0 (as-of T)",
        "missingness_policy": "NULL if expected baseline missing",
        "leakage_policy": "Safe (as-of performance deficit)",
        "description": "Gap between site physical progress and expected baseline progress. Negative indicates project lagging schedule."
    },
    {
        "feature_name": "progress_completion_ratio",
        "feature_group": "planned_vs_actual",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "physical_progress_pct / expected_baseline_progress_pct",
        "lookback_window": "0 (as-of T)",
        "missingness_policy": "1.0 if expected == 0.0; NULL if denominator missing",
        "leakage_policy": "Safe (ratio of achievement to expectation)",
        "description": "Relative progress achievement ratio (< 1.0 implies under-delivery)."
    },

    # -------------------------------------------------------------
    # Group E: Velocity & Acceleration (Actual Spaced Months)
    # -------------------------------------------------------------
    {
        "feature_name": "months_elapsed_since_prev_obs",
        "feature_group": "velocity",
        "feature_type": "integer",
        "table_name": "gold_project_monthly_metrics",
        "formula": "month_diff(reporting_date_t, reporting_date_prev)",
        "lookback_window": "1 previous observation",
        "missingness_policy": "NULL if first observed month",
        "leakage_policy": "Safe (tracks actual elapsed gap between reports)",
        "description": "Exact calendar months elapsed between current and preceding observation (prevents assuming 1-month step when gaps exist)."
    },
    {
        "feature_name": "progress_velocity_pct_per_month",
        "feature_group": "velocity",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "(physical_progress_t - physical_progress_prev) / months_elapsed_since_prev_obs",
        "lookback_window": "1 previous observation (spaced)",
        "missingness_policy": "NULL if first observation or gap <= 0",
        "leakage_policy": "Safe (uses only past observation)",
        "description": "Actual physical progress velocity normalized per calendar month."
    },
    {
        "feature_name": "expenditure_velocity_cr_per_month",
        "feature_group": "velocity",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "(expenditure_t - expenditure_prev) / months_elapsed_since_prev_obs",
        "lookback_window": "1 previous observation (spaced)",
        "missingness_policy": "NULL if first observation or gap <= 0",
        "leakage_policy": "Safe (uses only past expenditure)",
        "description": "Actual monthly cash expenditure burn rate in ₹ Crore per month."
    },
    {
        "feature_name": "progress_acceleration",
        "feature_group": "velocity",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "progress_velocity_t - progress_velocity_prev",
        "lookback_window": "2 previous observations",
        "missingness_policy": "NULL if < 2 previous observations",
        "leakage_policy": "Safe (second derivative of past progress)",
        "description": "Rate of change of progress velocity (positive = accelerating, negative = decelerating)."
    },

    # -------------------------------------------------------------
    # Group F: Multi-Month Deltas, Rolling Means & Volatility
    # -------------------------------------------------------------
    {
        "feature_name": "progress_3m_delta",
        "feature_group": "trend",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "physical_progress_t - physical_progress_{t-3}",
        "lookback_window": "3 previous observations",
        "missingness_policy": "NULL if fewer than 3 historical periods",
        "leakage_policy": "Safe (pure backward lookback)",
        "description": "Net physical progress achieved over preceding 3 reporting observations."
    },
    {
        "feature_name": "progress_6m_delta",
        "feature_group": "trend",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "physical_progress_t - physical_progress_{t-6}",
        "lookback_window": "6 previous observations",
        "missingness_policy": "NULL if fewer than 6 historical periods",
        "leakage_policy": "Safe (pure backward lookback)",
        "description": "Net physical progress achieved over preceding 6 reporting observations."
    },
    {
        "feature_name": "rolling_avg_progress_3m",
        "feature_group": "trend",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "AVG(physical_progress) over last 3 observations",
        "lookback_window": "3 previous observations",
        "missingness_policy": "Current value if < 3 observations",
        "leakage_policy": "Safe (rolling lookback <= T)",
        "description": "Rolling 3-observation average of physical progress."
    },
    {
        "feature_name": "progress_volatility_3m",
        "feature_group": "volatility",
        "feature_type": "float",
        "table_name": "gold_project_monthly_metrics",
        "formula": "STDDEV(physical_progress) over last 3 observations",
        "lookback_window": "3 previous observations",
        "missingness_policy": "0.0 if < 2 observations",
        "leakage_policy": "Safe (historical volatility <= T)",
        "description": "Standard deviation of reported progress over recent monitoring cycles."
    },

    # -------------------------------------------------------------
    # Group G: Schedule Slippage & Delays
    # -------------------------------------------------------------
    {
        "feature_name": "schedule_slippage_months",
        "feature_group": "schedule",
        "feature_type": "integer",
        "table_name": "gold_project_monthly_metrics",
        "formula": "MAX(0, ROUND((anticipated_doc - original_doc) / 30.4375))",
        "lookback_window": "0 (reported schedule at T)",
        "missingness_policy": "0 if anticipated_doc missing or equal to original_doc",
        "leakage_policy": "Safe (monitored anticipated delay at T)",
        "description": "Official schedule delay in months between original commissioning date and latest anticipated completion date."
    },
    {
        "feature_name": "is_schedule_delayed",
        "feature_group": "schedule",
        "feature_type": "integer",
        "table_name": "gold_project_monthly_metrics",
        "formula": "CASE WHEN schedule_slippage_months > 0 THEN 1 ELSE 0 END",
        "lookback_window": "0 (reported schedule at T)",
        "missingness_policy": "0 if slippage is NULL or 0",
        "leakage_policy": "Safe (binary delay indicator)",
        "description": "Flag indicating project has recorded an official commissioning date slippage."
    },

    # -------------------------------------------------------------
    # Group H: Composite Risk & Early Warning Engine
    # -------------------------------------------------------------
    {
        "feature_name": "cost_risk_score",
        "feature_group": "risk",
        "feature_type": "float",
        "table_name": "gold_risk_engine_outputs",
        "formula": "35% weight on cost escalation magnitude + 65% weight on financial progress deficit",
        "lookback_window": "0 (deterministic risk engine)",
        "missingness_policy": "Bounded in [0.0, 100.0]",
        "leakage_policy": "Safe (deterministic risk logic <= T)",
        "description": "Sub-score evaluating project fiscal stress, budget revisions, and cost escalation."
    },
    {
        "feature_name": "schedule_risk_score",
        "feature_group": "risk",
        "feature_type": "float",
        "table_name": "gold_risk_engine_outputs",
        "formula": "50% weight on normalized slippage months + 50% weight on time consumed vs remaining",
        "lookback_window": "0 (deterministic risk engine)",
        "missingness_policy": "Bounded in [0.0, 100.0]",
        "leakage_policy": "Safe (deterministic risk logic <= T)",
        "description": "Sub-score evaluating schedule delay duration and remaining time pressure."
    },
    {
        "feature_name": "progress_risk_score",
        "feature_group": "risk",
        "feature_type": "float",
        "table_name": "gold_risk_engine_outputs",
        "formula": "60% weight on progress deviation + 40% weight on physical-financial gap",
        "lookback_window": "0 (deterministic risk engine)",
        "missingness_policy": "Bounded in [0.0, 100.0]",
        "leakage_policy": "Safe (deterministic risk logic <= T)",
        "description": "Sub-score evaluating execution stall and physical delivery divergence."
    },
    {
        "feature_name": "overall_risk_score",
        "feature_group": "risk",
        "feature_type": "float",
        "table_name": "gold_risk_engine_outputs",
        "formula": "0.35 * cost_risk + 0.35 * schedule_risk + 0.30 * progress_risk",
        "lookback_window": "0 (deterministic composite)",
        "missingness_policy": "Bounded in [0.0, 100.0]",
        "leakage_policy": "Safe (governed weighted composite formula)",
        "description": "Overall composite project implementation risk score (0.0 = minimal risk, 100.0 = critical risk)."
    },
    {
        "feature_name": "risk_band",
        "feature_group": "risk",
        "feature_type": "text",
        "table_name": "gold_risk_engine_outputs",
        "formula": "CASE WHEN overall_risk >= 75 THEN 'CRITICAL' WHEN >= 50 THEN 'HIGH' WHEN >= 25 THEN 'MODERATE' ELSE 'LOW' END",
        "lookback_window": "0 (deterministic threshold)",
        "missingness_policy": "'LOW' if risk score 0",
        "leakage_policy": "Safe (calibrated categorical band)",
        "description": "Operational risk band for executive prioritization."
    },
    {
        "feature_name": "active_warnings_count",
        "feature_group": "warning",
        "feature_type": "integer",
        "table_name": "gold_project_current / ml_dataset_master",
        "formula": "COUNT(DISTINCT warning_type) triggered at snapshot T",
        "lookback_window": "0 (active alerts at T)",
        "missingness_policy": "0 if no warnings active",
        "leakage_policy": "Safe (rule-based alert triggers <= T)",
        "description": "Number of concurrent rule-based warning signals active for project at reporting month."
    }
]

def generate_registry():
    df = pd.DataFrame(REGISTRY)
    
    # Save CSV
    csv_path = "artifacts/feature_registry.csv"
    os.makedirs("artifacts", exist_ok=True)
    df.to_csv(csv_path, index=False)
    print(f"Saved feature registry CSV to {csv_path}")
    
    # Save Markdown
    md_path = "artifacts/feature_registry.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# PAIMANA-INTEL — Canonical Feature Registry\n\n")
        f.write("This document defines all deterministic, temporal, trend, risk, and ML features calculated in the PAIMANA-INTEL canonical data pipeline.\n\n")
        f.write("## 1. Feature Architecture Principles\n\n")
        f.write("1. **Deterministic Separation**: Quantities directly derivable from source facts (cost escalation, elapsed time, progress deviation, physical-financial gaps) are computed using exact algebraic definitions. ML is never used for basic accounting.\n")
        f.write("2. **Explicit Time Spacing**: Rates of change and velocities account for the actual calendar elapsed months between reports, preserving gaps rather than assuming uniform 1-month spacing.\n")
        f.write("3. **Zero Future Leakage**: Every feature vector at snapshot $T$ references only data published at or before $T$.\n\n")
        f.write("## 2. Master Feature Table\n\n")
        f.write("| Feature Name | Group | Type | Storage Table | Formula / Computation | Lookback | Leakage Policy |\n")
        f.write("|---|:---:|:---:|---|---|:---:|:---:|\n")
        for _, r in df.iterrows():
            f.write(f"| `{r['feature_name']}` | `{r['feature_group']}` | `{r['feature_type']}` | `{r['table_name']}` | `{r['formula']}` | {r['lookback_window']} | {r['leakage_policy']} |\n")
            
        f.write("\n## 3. Feature Descriptions & Governance\n\n")
        for _, r in df.iterrows():
            f.write(f"### `{r['feature_name']}`\n")
            f.write(f"- **Group**: `{r['feature_group']}` | **Type**: `{r['feature_type']}` | **Table**: `{r['table_name']}`\n")
            f.write(f"- **Formula**: `{r['formula']}`\n")
            f.write(f"- **Lookback Window**: {r['lookback_window']}\n")
            f.write(f"- **Missingness Policy**: {r['missingness_policy']}\n")
            f.write(f"- **Leakage Policy**: {r['leakage_policy']}\n")
            f.write(f"- **Description**: {r['description']}\n\n")
            
    print(f"Saved feature registry Markdown to {md_path}")

if __name__ == "__main__":
    generate_registry()
