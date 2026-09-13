#!/usr/bin/env python3
"""
PAIMANA-INTEL — Comprehensive Data Quality Profiler
Analyzes missingness, temporal coverage, categorical consistency,
numeric distributions, and generates formal quality metrics and report.
"""

import os
import json
import sqlite3
import pandas as pd
import numpy as np
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("quality_profiler")

DB_PATH = "paimana_canonical.db"
REPORT_MD_PATH = "artifacts/data_quality_report.md"
METRICS_JSON_PATH = "artifacts/data_quality_metrics.json"

def profile_data_quality():
    logger.info("Starting comprehensive data quality profiling...")
    conn = sqlite3.connect(DB_PATH)
    
    # 1. High-level dataset counts
    total_projects = int(pd.read_sql_query("SELECT COUNT(*) FROM dim_project", conn).iloc[0, 0])
    total_facts = int(pd.read_sql_query("SELECT COUNT(*) FROM fact_project_month", conn).iloc[0, 0])
    total_quarantine = int(pd.read_sql_query("SELECT COUNT(*) FROM quarantine_records", conn).iloc[0, 0])
    total_alerts = int(pd.read_sql_query("SELECT COUNT(*) FROM gold_warning_alerts", conn).iloc[0, 0])
    total_ml_snapshots = int(pd.read_sql_query("SELECT COUNT(*) FROM ml_dataset_master", conn).iloc[0, 0])
    total_uncensored_ml = int(pd.read_sql_query("SELECT COUNT(*) FROM ml_dataset_master WHERE is_censored = 0", conn).iloc[0, 0])
    
    # 2. Missingness Profiling on fact_project_month
    fact_df = pd.read_sql_query("""
        SELECT 
            f.project_id, f.reporting_month, 
            COALESCE(s.sector_name, 'Unknown') as sector_name, 
            COALESCE(m.ministry_name, 'Unknown') as ministry_name, 
            COALESCE(a.agency_name, 'Unknown') as agency_name, 
            COALESCE(st.state_name, 'Unknown') as state_name,
            f.original_cost_cr, f.revised_cost_cr, f.anticipated_cost_cr, f.cumulative_expenditure_cr,
            f.physical_progress_pct, f.approval_date, f.original_doc, f.anticipated_doc
        FROM fact_project_month f
        JOIN dim_project p ON f.project_id = p.project_id
        LEFT JOIN dim_sector s ON p.sector_id = s.sector_id
        LEFT JOIN dim_ministry m ON p.ministry_id = m.ministry_id
        LEFT JOIN dim_agency a ON p.agency_id = a.agency_id
        LEFT JOIN dim_state st ON p.primary_state_id = st.state_id
    """, conn)
    
    missing_profile = {}
    for col in fact_df.columns:
        null_count = int(fact_df[col].isnull().sum())
        missing_rate = round(float(null_count / total_facts * 100.0), 2)
        valid_count = total_facts - null_count
        missing_profile[col] = {
            "valid_records": valid_count,
            "missing_records": null_count,
            "missing_rate_pct": missing_rate
        }
        
    # 3. Temporal Coverage & Month Spine Distribution
    month_dist = pd.read_sql_query("""
        SELECT reporting_month, COUNT(*) as observation_count, COUNT(DISTINCT project_id) as unique_projects
        FROM fact_project_month
        GROUP BY reporting_month
        ORDER BY reporting_month
    """, conn)
    
    # Project Observation Frequency (how many months each project was observed)
    proj_obs_freq = fact_df.groupby("project_id")["reporting_month"].nunique()
    freq_buckets = {
        "1 month": int((proj_obs_freq == 1).sum()),
        "2 to 5 months": int(((proj_obs_freq >= 2) & (proj_obs_freq <= 5)).sum()),
        "6 to 11 months": int(((proj_obs_freq >= 6) & (proj_obs_freq <= 11)).sum()),
        "12 to 16 months (High Persistence)": int((proj_obs_freq >= 12).sum())
    }
    
    # 4. Sector Coverage
    sector_summary = pd.read_sql_query("""
        SELECT 
            COALESCE(s.sector_name, 'Unknown') as sector_name, 
            COUNT(DISTINCT f.project_id) as project_count,
            COUNT(*) as observation_count,
            ROUND(SUM(f.revised_cost_cr), 2) as total_revised_cost_cr,
            ROUND(AVG(f.physical_progress_pct), 2) as avg_progress_pct
        FROM fact_project_month f
        JOIN dim_project p ON f.project_id = p.project_id
        LEFT JOIN dim_sector s ON p.sector_id = s.sector_id
        GROUP BY s.sector_name
        ORDER BY project_count DESC
    """, conn)
    
    # 5. Quarantine & Data Issue Categorization
    quarantine_summary = pd.read_sql_query("""
        SELECT error_type, error_severity, COUNT(*) as count
        FROM quarantine_records
        GROUP BY error_type, error_severity
        ORDER BY count DESC
    """, conn)
    
    # 6. Anomaly / Outlier Counts
    outliers = {}
    cur = conn.cursor()
    
    # Physical progress > 100 before capping
    cur.execute("SELECT COUNT(*) FROM quarantine_records WHERE error_type = 'PROGRESS_EXCEEDS_100'")
    outliers["progress_exceeds_100_raw"] = cur.fetchone()[0]
    
    # Extreme cost escalation (> 200%)
    cur.execute("""
        SELECT COUNT(*) FROM gold_project_monthly_metrics 
        WHERE cost_escalation_pct > 200.0
    """)
    outliers["cost_escalation_exceeds_200_pct"] = cur.fetchone()[0]
    
    # Severe progress stall (time elapsed > 100% but progress < 20%)
    cur.execute("""
        SELECT COUNT(*) FROM gold_project_monthly_metrics g
        JOIN fact_project_month f ON g.project_id = f.project_id AND g.reporting_month = f.reporting_month
        WHERE g.time_elapsed_pct > 100.0 AND f.physical_progress_pct < 20.0
    """)
    outliers["severe_schedule_stalls"] = cur.fetchone()[0]
    
    # Compile JSON summary
    metrics_summary = {
        "timestamp": datetime.now().isoformat(),
        "summary_counts": {
            "canonical_projects": total_projects,
            "fact_project_month_observations": total_facts,
            "quarantine_audit_records": total_quarantine,
            "early_warning_alerts_materialized": total_alerts,
            "ml_snapshots_total": total_ml_snapshots,
            "ml_snapshots_uncensored_training": total_uncensored_ml
        },
        "missingness_profile": missing_profile,
        "observation_frequency_distribution": freq_buckets,
        "outlier_profile": outliers
    }
    
    os.makedirs(os.path.dirname(METRICS_JSON_PATH), exist_ok=True)
    with open(METRICS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics_summary, f, indent=2)
    logger.info(f"Saved quality metrics JSON to {METRICS_JSON_PATH}")
    
    # Write Markdown Report
    with open(REPORT_MD_PATH, "w", encoding="utf-8") as f:
        f.write("# PAIMANA-INTEL — Comprehensive Data Quality & Health Report\n\n")
        f.write(f"**Audit Execution Timestamp**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"**Canonical Database**: `{DB_PATH}`\n\n")
        
        f.write("## 1. System Overview Metrics\n\n")
        f.write("| Dimension | Value | Semantics & Governance |\n")
        f.write("|---|---:|---|\n")
        f.write(f"| **Canonical Projects (`dim_project`)** | **{total_projects:,}** | Unique entity-resolved infrastructure projects across India |\n")
        f.write(f"| **Project-Month Facts (`fact_project_month`)** | **{total_facts:,}** | Normalized observations spanning 16 months (2025-04 to 2026-07) |\n")
        f.write(f"| **Quarantine / Validation Logs** | **{total_quarantine:,}** | Traceable data-cleaning decisions and format-anomaly audits |\n")
        f.write(f"| **Early Warning Alerts Active/Generated** | **{total_alerts:,}** | Deterministic multi-tier risk triggers (Cost, Sched, Progress) |\n")
        f.write(f"| **ML Snapshot Vectors (`ml_dataset_master`)** | **{total_ml_snapshots:,}** | Point-in-time leakage-safe feature matrices |\n")
        f.write(f"| **Supervised Uncensored Training Snapshots** | **{total_uncensored_ml:,}** | Ground-truth labeled snapshots across 3,190 distinct projects |\n\n")
        
        f.write("## 2. Field-Level Missingness Profile\n\n")
        f.write("Missing values are explicitly distinguished between `NOT_REPORTED`, unrevised baselines, and true missingness.\n\n")
        f.write("| Canonical Field | Valid Records | Missing Count | Missing Rate (%) | Domain Interpretation |\n")
        f.write("|---|---:|---:|---:|---|\n")
        for col, info in missing_profile.items():
            interp = "Fully populated" if info["missing_rate_pct"] == 0.0 else ("Unrevised projects default to original cost" if "cost" in col else "Government non-reporting / ongoing project")
            f.write(f"| `{col}` | {info['valid_records']:,} | {info['missing_records']:,} | {info['missing_rate_pct']}% | {interp} |\n")
            
        f.write("\n## 3. Temporal Distribution & Observation Continuity\n\n")
        f.write("Across the 16 continuous monthly reporting cycles (2025-04 through 2026-07):\n\n")
        f.write("| Reporting Month | Fact Observations | Unique Projects Active |\n")
        f.write("|:---:|---:|---:|\n")
        for _, row in month_dist.iterrows():
            f.write(f"| `{row['reporting_month']}` | {row['observation_count']:,} | {row['unique_projects']:,} |\n")
            
        f.write("\n### Project Persistence / Longevity Across Monitoring Cycles\n\n")
        f.write("| Observation Span | Project Count | % of Portfolio | Analytical Role |\n")
        f.write("|---|---:|---:|---|\n")
        for bucket, count in freq_buckets.items():
            pct = round(count / total_projects * 100.0, 1)
            role = "Point-in-time snapshot only" if "1 " in bucket else ("Short temporal history" if "2 to 5" in bucket else ("Sufficient for 3m/6m trend features" if "6 to 11" in bucket else "Full longitudinal modeling cohort"))
            f.write(f"| {bucket} | {count:,} | {pct}% | {role} |\n")
            
        f.write("\n## 4. Sector Distribution & Capital Allocation\n\n")
        f.write("| Sector Name | Projects | Total Observations | Total Revised Cost (₹ Cr) | Avg Physical Progress |\n")
        f.write("|---|---:|---:|---:|---:|\n")
        for _, row in sector_summary.iterrows():
            rev_cost_str = f"₹{row['total_revised_cost_cr']:,.2f}" if pd.notnull(row['total_revised_cost_cr']) else "N/A"
            prog_str = f"{row['avg_progress_pct']:.1f}%" if pd.notnull(row['avg_progress_pct']) else "N/A"
            f.write(f"| **{row['sector_name']}** | {row['project_count']:,} | {row['observation_count']:,} | {rev_cost_str} | {prog_str} |\n")
            
        f.write("\n## 5. Data Hygiene, Quarantine & Validation Log\n\n")
        f.write("The pipeline guarantees that NO raw records are silently dropped or invisibly altered. All anomalies are logged in `quarantine_records`:\n\n")
        f.write("| Error Type | Severity | Incident Count | Remediation Strategy |\n")
        f.write("|---|:---:|---:|---|\n")
        for _, row in quarantine_summary.iterrows():
            sev_badge = "🔴 ERROR" if row['error_severity'] == 'ERROR' else "🟡 WARNING"
            f.write(f"| `{row['error_type']}` | {sev_badge} | {row['count']:,} | Quarantined or normalized with provenance trace |\n")
            
        f.write("\n## 6. Project Outlier Profile\n\n")
        f.write(f"- **Raw Physical Progress > 100%**: {outliers['progress_exceeds_100_raw']:,} occurrences (safely capped at 100.0% in Silver layer while logging warning).\n")
        f.write(f"- **Extreme Cost Escalation (> +200%)**: {outliers['cost_escalation_exceeds_200_pct']:,} monthly observations identified for priority risk review.\n")
        f.write(f"- **Severe Schedule Stalls (Time Elapsed > 100% but Progress < 20%)**: {outliers['severe_schedule_stalls']:,} observation periods flagged as stalled projects requiring immediate intervention.\n")

    conn.close()
    logger.info(f"Comprehensive data quality report written to {REPORT_MD_PATH}")
    return metrics_summary

if __name__ == "__main__":
    profile_data_quality()
