# PAIMANA-INTEL — Canonical Feature Registry

This document defines all deterministic, temporal, trend, risk, and ML features calculated in the PAIMANA-INTEL canonical data pipeline.

## 1. Feature Architecture Principles

1. **Deterministic Separation**: Quantities directly derivable from source facts (cost escalation, elapsed time, progress deviation, physical-financial gaps) are computed using exact algebraic definitions. ML is never used for basic accounting.
2. **Explicit Time Spacing**: Rates of change and velocities account for the actual calendar elapsed months between reports, preserving gaps rather than assuming uniform 1-month spacing.
3. **Zero Future Leakage**: Every feature vector at snapshot $T$ references only data published at or before $T$.

## 2. Master Feature Table

| Feature Name | Group | Type | Storage Table | Formula / Computation | Lookback | Leakage Policy |
|---|:---:|:---:|---|---|:---:|:---:|
| `duration_planned_months` | `duration` | `integer` | `gold_project_monthly_metrics` | `ROUND((original_doc - approval_date) / 30.4375)` | 0 (static snapshot) | Safe (static baseline known at sanction) |
| `duration_elapsed_months` | `duration` | `integer` | `gold_project_monthly_metrics` | `ROUND((reporting_date - approval_date) / 30.4375)` | 0 (as-of reporting date) | Safe (uses only past reporting dates) |
| `duration_remaining_months` | `duration` | `integer` | `gold_project_monthly_metrics` | `ROUND((original_doc - reporting_date) / 30.4375)` | 0 (as-of reporting date) | Safe (evaluates remaining time to planned baseline) |
| `time_elapsed_pct` | `duration` | `float` | `gold_project_monthly_metrics` | `(duration_elapsed_months / duration_planned_months) * 100` | 0 (as-of reporting date) | Safe (as-of ratio) |
| `time_remaining_pct` | `duration` | `float` | `gold_project_monthly_metrics` | `100.0 - time_elapsed_pct` | 0 (as-of reporting date) | Safe (deterministic complement) |
| `cost_escalation_cr` | `cost` | `float` | `gold_project_monthly_metrics` | `revised_cost_cr - original_cost_cr` | 0 (current reported revision) | Safe (records currently sanctioned revision at time T) |
| `cost_escalation_pct` | `cost` | `float` | `gold_project_monthly_metrics` | `((revised_cost_cr - original_cost_cr) / original_cost_cr) * 100` | 0 (current reported revision) | Safe (uses only revisions enacted <= T) |
| `cost_growth_factor` | `cost` | `float` | `gold_project_monthly_metrics` | `revised_cost_cr / original_cost_cr` | 0 (current reported revision) | Safe (cost multiple known at T) |
| `expenditure_pct` | `cost` | `float` | `gold_project_monthly_metrics` | `(cumulative_expenditure_cr / revised_cost_cr) * 100` | 0 (current reported expenditure) | Safe (cumulative spend realized <= T) |
| `remaining_financial_exposure_cr` | `cost` | `float` | `gold_project_monthly_metrics` | `MAX(0.0, revised_cost_cr - cumulative_expenditure_cr)` | 0 (current reported state) | Safe (unspent capital allocation as of T) |
| `physical_progress_pct` | `progress` | `float` | `fact_project_month` | `MIN(100.0, MAX(0.0, raw_physical_progress))` | 0 (reported progress at T) | Safe (observed physical completion at T) |
| `financial_progress_pct` | `progress` | `float` | `gold_project_monthly_metrics` | `expenditure_pct` | 0 (reported expenditure at T) | Safe (financial utilization at T) |
| `physical_financial_gap` | `progress` | `float` | `gold_project_monthly_metrics` | `physical_progress_pct - financial_progress_pct` | 0 (reported at T) | Safe (deterministic cross-dimensional gap) |
| `expected_baseline_progress_pct` | `planned_vs_actual` | `float` | `gold_project_monthly_metrics` | `MIN(100.0, MAX(0.0, time_elapsed_pct))` | 0 (time-based linear baseline) | Safe (standardized baseline schedule pace) |
| `progress_deviation` | `planned_vs_actual` | `float` | `gold_project_monthly_metrics` | `physical_progress_pct - expected_baseline_progress_pct` | 0 (as-of T) | Safe (as-of performance deficit) |
| `progress_completion_ratio` | `planned_vs_actual` | `float` | `gold_project_monthly_metrics` | `physical_progress_pct / expected_baseline_progress_pct` | 0 (as-of T) | Safe (ratio of achievement to expectation) |
| `months_elapsed_since_prev_obs` | `velocity` | `integer` | `gold_project_monthly_metrics` | `month_diff(reporting_date_t, reporting_date_prev)` | 1 previous observation | Safe (tracks actual elapsed gap between reports) |
| `progress_velocity_pct_per_month` | `velocity` | `float` | `gold_project_monthly_metrics` | `(physical_progress_t - physical_progress_prev) / months_elapsed_since_prev_obs` | 1 previous observation (spaced) | Safe (uses only past observation) |
| `expenditure_velocity_cr_per_month` | `velocity` | `float` | `gold_project_monthly_metrics` | `(expenditure_t - expenditure_prev) / months_elapsed_since_prev_obs` | 1 previous observation (spaced) | Safe (uses only past expenditure) |
| `progress_acceleration` | `velocity` | `float` | `gold_project_monthly_metrics` | `progress_velocity_t - progress_velocity_prev` | 2 previous observations | Safe (second derivative of past progress) |
| `progress_3m_delta` | `trend` | `float` | `gold_project_monthly_metrics` | `physical_progress_t - physical_progress_{t-3}` | 3 previous observations | Safe (pure backward lookback) |
| `progress_6m_delta` | `trend` | `float` | `gold_project_monthly_metrics` | `physical_progress_t - physical_progress_{t-6}` | 6 previous observations | Safe (pure backward lookback) |
| `rolling_avg_progress_3m` | `trend` | `float` | `gold_project_monthly_metrics` | `AVG(physical_progress) over last 3 observations` | 3 previous observations | Safe (rolling lookback <= T) |
| `progress_volatility_3m` | `volatility` | `float` | `gold_project_monthly_metrics` | `STDDEV(physical_progress) over last 3 observations` | 3 previous observations | Safe (historical volatility <= T) |
| `schedule_slippage_months` | `schedule` | `integer` | `gold_project_monthly_metrics` | `MAX(0, ROUND((anticipated_doc - original_doc) / 30.4375))` | 0 (reported schedule at T) | Safe (monitored anticipated delay at T) |
| `is_schedule_delayed` | `schedule` | `integer` | `gold_project_monthly_metrics` | `CASE WHEN schedule_slippage_months > 0 THEN 1 ELSE 0 END` | 0 (reported schedule at T) | Safe (binary delay indicator) |
| `cost_risk_score` | `risk` | `float` | `gold_risk_engine_outputs` | `35% weight on cost escalation magnitude + 65% weight on financial progress deficit` | 0 (deterministic risk engine) | Safe (deterministic risk logic <= T) |
| `schedule_risk_score` | `risk` | `float` | `gold_risk_engine_outputs` | `50% weight on normalized slippage months + 50% weight on time consumed vs remaining` | 0 (deterministic risk engine) | Safe (deterministic risk logic <= T) |
| `progress_risk_score` | `risk` | `float` | `gold_risk_engine_outputs` | `60% weight on progress deviation + 40% weight on physical-financial gap` | 0 (deterministic risk engine) | Safe (deterministic risk logic <= T) |
| `overall_risk_score` | `risk` | `float` | `gold_risk_engine_outputs` | `0.35 * cost_risk + 0.35 * schedule_risk + 0.30 * progress_risk` | 0 (deterministic composite) | Safe (governed weighted composite formula) |
| `risk_band` | `risk` | `text` | `gold_risk_engine_outputs` | `CASE WHEN overall_risk >= 75 THEN 'CRITICAL' WHEN >= 50 THEN 'HIGH' WHEN >= 25 THEN 'MODERATE' ELSE 'LOW' END` | 0 (deterministic threshold) | Safe (calibrated categorical band) |
| `active_warnings_count` | `warning` | `integer` | `gold_project_current / ml_dataset_master` | `COUNT(DISTINCT warning_type) triggered at snapshot T` | 0 (active alerts at T) | Safe (rule-based alert triggers <= T) |

## 3. Feature Descriptions & Governance

### `duration_planned_months`
- **Group**: `duration` | **Type**: `integer` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `ROUND((original_doc - approval_date) / 30.4375)`
- **Lookback Window**: 0 (static snapshot)
- **Missingness Policy**: NULL if either date missing
- **Leakage Policy**: Safe (static baseline known at sanction)
- **Description**: Total originally planned project execution duration in months.

### `duration_elapsed_months`
- **Group**: `duration` | **Type**: `integer` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `ROUND((reporting_date - approval_date) / 30.4375)`
- **Lookback Window**: 0 (as-of reporting date)
- **Missingness Policy**: NULL if approval_date missing
- **Leakage Policy**: Safe (uses only past reporting dates)
- **Description**: Chronological months elapsed from sanction/approval to current reporting period.

### `duration_remaining_months`
- **Group**: `duration` | **Type**: `integer` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `ROUND((original_doc - reporting_date) / 30.4375)`
- **Lookback Window**: 0 (as-of reporting date)
- **Missingness Policy**: NULL if original_doc missing
- **Leakage Policy**: Safe (evaluates remaining time to planned baseline)
- **Description**: Remaining planned duration to original commissioning date (can be negative if delayed).

### `time_elapsed_pct`
- **Group**: `duration` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `(duration_elapsed_months / duration_planned_months) * 100`
- **Lookback Window**: 0 (as-of reporting date)
- **Missingness Policy**: NULL if planned duration <= 0 or missing
- **Leakage Policy**: Safe (as-of ratio)
- **Description**: Percentage of planned execution timeline consumed as of current reporting date.

### `time_remaining_pct`
- **Group**: `duration` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `100.0 - time_elapsed_pct`
- **Lookback Window**: 0 (as-of reporting date)
- **Missingness Policy**: NULL if time_elapsed_pct is NULL
- **Leakage Policy**: Safe (deterministic complement)
- **Description**: Remaining execution timeline percentage.

### `cost_escalation_cr`
- **Group**: `cost` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `revised_cost_cr - original_cost_cr`
- **Lookback Window**: 0 (current reported revision)
- **Missingness Policy**: 0.0 if revised cost unpopulated (defaults to original cost)
- **Leakage Policy**: Safe (records currently sanctioned revision at time T)
- **Description**: Absolute cost escalation in ₹ Crore as sanctioned at reporting period.

### `cost_escalation_pct`
- **Group**: `cost` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `((revised_cost_cr - original_cost_cr) / original_cost_cr) * 100`
- **Lookback Window**: 0 (current reported revision)
- **Missingness Policy**: 0.0 if revised == original; NULL if original_cost <= 0
- **Leakage Policy**: Safe (uses only revisions enacted <= T)
- **Description**: Percentage cost escalation over original sanctioned baseline.

### `cost_growth_factor`
- **Group**: `cost` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `revised_cost_cr / original_cost_cr`
- **Lookback Window**: 0 (current reported revision)
- **Missingness Policy**: 1.0 if unrevised; NULL if original_cost <= 0
- **Leakage Policy**: Safe (cost multiple known at T)
- **Description**: Multiplicative factor of cost revision (e.g. 1.25 = 25% cost growth).

### `expenditure_pct`
- **Group**: `cost` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `(cumulative_expenditure_cr / revised_cost_cr) * 100`
- **Lookback Window**: 0 (current reported expenditure)
- **Missingness Policy**: 0.0 if expenditure missing; NULL if revised_cost <= 0
- **Leakage Policy**: Safe (cumulative spend realized <= T)
- **Description**: Financial burn percentage against latest revised sanctioned cost.

### `remaining_financial_exposure_cr`
- **Group**: `cost` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `MAX(0.0, revised_cost_cr - cumulative_expenditure_cr)`
- **Lookback Window**: 0 (current reported state)
- **Missingness Policy**: revised_cost_cr if expenditure is 0.0
- **Leakage Policy**: Safe (unspent capital allocation as of T)
- **Description**: Remaining unspent capital outlay in ₹ Crore required to complete project.

### `physical_progress_pct`
- **Group**: `progress` | **Type**: `float` | **Table**: `fact_project_month`
- **Formula**: `MIN(100.0, MAX(0.0, raw_physical_progress))`
- **Lookback Window**: 0 (reported progress at T)
- **Missingness Policy**: 0.0 if unobserved
- **Leakage Policy**: Safe (observed physical completion at T)
- **Description**: Certified physical progress percentage on site as of reporting period.

### `financial_progress_pct`
- **Group**: `progress` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `expenditure_pct`
- **Lookback Window**: 0 (reported expenditure at T)
- **Missingness Policy**: 0.0 if unspent
- **Leakage Policy**: Safe (financial utilization at T)
- **Description**: Financial progress percentage defined as cumulative spend / revised cost.

### `physical_financial_gap`
- **Group**: `progress` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `physical_progress_pct - financial_progress_pct`
- **Lookback Window**: 0 (reported at T)
- **Missingness Policy**: NULL if either component missing
- **Leakage Policy**: Safe (deterministic cross-dimensional gap)
- **Description**: Divergence between physical progress and financial burn. Negative values indicate fund expenditure outpacing physical work.

### `expected_baseline_progress_pct`
- **Group**: `planned_vs_actual` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `MIN(100.0, MAX(0.0, time_elapsed_pct))`
- **Lookback Window**: 0 (time-based linear baseline)
- **Missingness Policy**: NULL if time_elapsed_pct is NULL
- **Leakage Policy**: Safe (standardized baseline schedule pace)
- **Description**: Linear time-elapsed progress baseline expectation in absence of S-curve milestones.

### `progress_deviation`
- **Group**: `planned_vs_actual` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `physical_progress_pct - expected_baseline_progress_pct`
- **Lookback Window**: 0 (as-of T)
- **Missingness Policy**: NULL if expected baseline missing
- **Leakage Policy**: Safe (as-of performance deficit)
- **Description**: Gap between site physical progress and expected baseline progress. Negative indicates project lagging schedule.

### `progress_completion_ratio`
- **Group**: `planned_vs_actual` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `physical_progress_pct / expected_baseline_progress_pct`
- **Lookback Window**: 0 (as-of T)
- **Missingness Policy**: 1.0 if expected == 0.0; NULL if denominator missing
- **Leakage Policy**: Safe (ratio of achievement to expectation)
- **Description**: Relative progress achievement ratio (< 1.0 implies under-delivery).

### `months_elapsed_since_prev_obs`
- **Group**: `velocity` | **Type**: `integer` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `month_diff(reporting_date_t, reporting_date_prev)`
- **Lookback Window**: 1 previous observation
- **Missingness Policy**: NULL if first observed month
- **Leakage Policy**: Safe (tracks actual elapsed gap between reports)
- **Description**: Exact calendar months elapsed between current and preceding observation (prevents assuming 1-month step when gaps exist).

### `progress_velocity_pct_per_month`
- **Group**: `velocity` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `(physical_progress_t - physical_progress_prev) / months_elapsed_since_prev_obs`
- **Lookback Window**: 1 previous observation (spaced)
- **Missingness Policy**: NULL if first observation or gap <= 0
- **Leakage Policy**: Safe (uses only past observation)
- **Description**: Actual physical progress velocity normalized per calendar month.

### `expenditure_velocity_cr_per_month`
- **Group**: `velocity` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `(expenditure_t - expenditure_prev) / months_elapsed_since_prev_obs`
- **Lookback Window**: 1 previous observation (spaced)
- **Missingness Policy**: NULL if first observation or gap <= 0
- **Leakage Policy**: Safe (uses only past expenditure)
- **Description**: Actual monthly cash expenditure burn rate in ₹ Crore per month.

### `progress_acceleration`
- **Group**: `velocity` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `progress_velocity_t - progress_velocity_prev`
- **Lookback Window**: 2 previous observations
- **Missingness Policy**: NULL if < 2 previous observations
- **Leakage Policy**: Safe (second derivative of past progress)
- **Description**: Rate of change of progress velocity (positive = accelerating, negative = decelerating).

### `progress_3m_delta`
- **Group**: `trend` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `physical_progress_t - physical_progress_{t-3}`
- **Lookback Window**: 3 previous observations
- **Missingness Policy**: NULL if fewer than 3 historical periods
- **Leakage Policy**: Safe (pure backward lookback)
- **Description**: Net physical progress achieved over preceding 3 reporting observations.

### `progress_6m_delta`
- **Group**: `trend` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `physical_progress_t - physical_progress_{t-6}`
- **Lookback Window**: 6 previous observations
- **Missingness Policy**: NULL if fewer than 6 historical periods
- **Leakage Policy**: Safe (pure backward lookback)
- **Description**: Net physical progress achieved over preceding 6 reporting observations.

### `rolling_avg_progress_3m`
- **Group**: `trend` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `AVG(physical_progress) over last 3 observations`
- **Lookback Window**: 3 previous observations
- **Missingness Policy**: Current value if < 3 observations
- **Leakage Policy**: Safe (rolling lookback <= T)
- **Description**: Rolling 3-observation average of physical progress.

### `progress_volatility_3m`
- **Group**: `volatility` | **Type**: `float` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `STDDEV(physical_progress) over last 3 observations`
- **Lookback Window**: 3 previous observations
- **Missingness Policy**: 0.0 if < 2 observations
- **Leakage Policy**: Safe (historical volatility <= T)
- **Description**: Standard deviation of reported progress over recent monitoring cycles.

### `schedule_slippage_months`
- **Group**: `schedule` | **Type**: `integer` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `MAX(0, ROUND((anticipated_doc - original_doc) / 30.4375))`
- **Lookback Window**: 0 (reported schedule at T)
- **Missingness Policy**: 0 if anticipated_doc missing or equal to original_doc
- **Leakage Policy**: Safe (monitored anticipated delay at T)
- **Description**: Official schedule delay in months between original commissioning date and latest anticipated completion date.

### `is_schedule_delayed`
- **Group**: `schedule` | **Type**: `integer` | **Table**: `gold_project_monthly_metrics`
- **Formula**: `CASE WHEN schedule_slippage_months > 0 THEN 1 ELSE 0 END`
- **Lookback Window**: 0 (reported schedule at T)
- **Missingness Policy**: 0 if slippage is NULL or 0
- **Leakage Policy**: Safe (binary delay indicator)
- **Description**: Flag indicating project has recorded an official commissioning date slippage.

### `cost_risk_score`
- **Group**: `risk` | **Type**: `float` | **Table**: `gold_risk_engine_outputs`
- **Formula**: `35% weight on cost escalation magnitude + 65% weight on financial progress deficit`
- **Lookback Window**: 0 (deterministic risk engine)
- **Missingness Policy**: Bounded in [0.0, 100.0]
- **Leakage Policy**: Safe (deterministic risk logic <= T)
- **Description**: Sub-score evaluating project fiscal stress, budget revisions, and cost escalation.

### `schedule_risk_score`
- **Group**: `risk` | **Type**: `float` | **Table**: `gold_risk_engine_outputs`
- **Formula**: `50% weight on normalized slippage months + 50% weight on time consumed vs remaining`
- **Lookback Window**: 0 (deterministic risk engine)
- **Missingness Policy**: Bounded in [0.0, 100.0]
- **Leakage Policy**: Safe (deterministic risk logic <= T)
- **Description**: Sub-score evaluating schedule delay duration and remaining time pressure.

### `progress_risk_score`
- **Group**: `risk` | **Type**: `float` | **Table**: `gold_risk_engine_outputs`
- **Formula**: `60% weight on progress deviation + 40% weight on physical-financial gap`
- **Lookback Window**: 0 (deterministic risk engine)
- **Missingness Policy**: Bounded in [0.0, 100.0]
- **Leakage Policy**: Safe (deterministic risk logic <= T)
- **Description**: Sub-score evaluating execution stall and physical delivery divergence.

### `overall_risk_score`
- **Group**: `risk` | **Type**: `float` | **Table**: `gold_risk_engine_outputs`
- **Formula**: `0.35 * cost_risk + 0.35 * schedule_risk + 0.30 * progress_risk`
- **Lookback Window**: 0 (deterministic composite)
- **Missingness Policy**: Bounded in [0.0, 100.0]
- **Leakage Policy**: Safe (governed weighted composite formula)
- **Description**: Overall composite project implementation risk score (0.0 = minimal risk, 100.0 = critical risk).

### `risk_band`
- **Group**: `risk` | **Type**: `text` | **Table**: `gold_risk_engine_outputs`
- **Formula**: `CASE WHEN overall_risk >= 75 THEN 'CRITICAL' WHEN >= 50 THEN 'HIGH' WHEN >= 25 THEN 'MODERATE' ELSE 'LOW' END`
- **Lookback Window**: 0 (deterministic threshold)
- **Missingness Policy**: 'LOW' if risk score 0
- **Leakage Policy**: Safe (calibrated categorical band)
- **Description**: Operational risk band for executive prioritization.

### `active_warnings_count`
- **Group**: `warning` | **Type**: `integer` | **Table**: `gold_project_current / ml_dataset_master`
- **Formula**: `COUNT(DISTINCT warning_type) triggered at snapshot T`
- **Lookback Window**: 0 (active alerts at T)
- **Missingness Policy**: 0 if no warnings active
- **Leakage Policy**: Safe (rule-based alert triggers <= T)
- **Description**: Number of concurrent rule-based warning signals active for project at reporting month.

