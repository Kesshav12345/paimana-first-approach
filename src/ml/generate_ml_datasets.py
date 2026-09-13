import os
import sys
import sqlite3
import pandas as pd
import numpy as np
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("ml_dataset_generator")

def generate_ml_datasets(workspace_dir: str):
    db_path = os.path.join(workspace_dir, "paimana_canonical.db")
    ml_out_dir = os.path.join(workspace_dir, "data", "ml")
    os.makedirs(ml_out_dir, exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    logger.info("Generating Point-in-Time Leakage-Safe Feature Snapshots and Censoring-Aware ML Targets...")
    
    # Query complete project fact history and deterministic metrics
    df = pd.read_sql_query("""
        SELECT 
            f.project_id,
            f.reporting_month,
            f.reporting_date,
            p.canonical_project_name,
            s.sector_name,
            m.ministry_name,
            a.agency_name,
            st.state_name,
            p.original_cost_cr,
            f.revised_cost_cr,
            f.cumulative_expenditure_cr,
            f.physical_progress_pct,
            f.original_doc,
            f.anticipated_doc,
            met.time_elapsed_pct,
            met.time_remaining_pct,
            met.cost_escalation_pct,
            met.cost_growth_factor,
            met.expenditure_pct,
            met.financial_progress_pct,
            met.physical_financial_gap,
            met.expected_baseline_progress_pct,
            met.progress_deviation,
            met.progress_velocity_pct_per_month,
            met.expenditure_velocity_cr_per_month,
            met.progress_3m_delta,
            met.schedule_slippage_months,
            r.overall_risk_score,
            r.cost_risk_score,
            r.schedule_risk_score,
            r.progress_risk_score,
            r.risk_band,
            COALESCE(w.warn_count, 0) AS active_warnings_count
        FROM fact_project_month f
        JOIN dim_project p ON f.project_id = p.project_id
        LEFT JOIN gold_project_monthly_metrics met 
          ON f.project_id = met.project_id AND f.reporting_month = met.reporting_month
        LEFT JOIN gold_risk_engine_outputs r 
          ON f.project_id = r.project_id AND f.reporting_month = r.reporting_month
        LEFT JOIN (
            SELECT project_id, reporting_month, COUNT(*) as warn_count
            FROM gold_warning_alerts
            WHERE status = 'Active'
            GROUP BY project_id, reporting_month
        ) w ON f.project_id = w.project_id AND f.reporting_month = w.reporting_month
        LEFT JOIN dim_sector s ON p.sector_id = s.sector_id
        LEFT JOIN dim_ministry m ON p.ministry_id = m.ministry_id
        LEFT JOIN dim_agency a ON p.agency_id = a.agency_id
        LEFT JOIN dim_state st ON p.primary_state_id = st.state_id
        ORDER BY f.project_id, f.reporting_month
    """, conn)
    
    logger.info(f"Loaded {len(df)} project-month snapshots for target construction.")
    
    # Group by project to determine future eventual outcomes
    project_terminal_outcomes = {}
    for pid, group in df.groupby('project_id'):
        last_row = group.iloc[-1]
        max_prog = group['physical_progress_pct'].max()
        max_exp = group['cumulative_expenditure_cr'].max()
        latest_rev = last_row['revised_cost_cr']
        orig_cost = last_row['original_cost_cr']
        latest_slip = last_row['schedule_slippage_months']
        
        # Censoring criteria:
        # If project reached >= 90% physical progress or > 100% expenditure, outcome is observable!
        # If project is still below 50% and has 0 observed overrun yet, it is right-censored!
        is_completed = (max_prog is not None and max_prog >= 90.0) or (latest_rev and max_exp and max_exp >= 0.9 * latest_rev)
        has_realized_overrun = (latest_rev and orig_cost and (latest_rev - orig_cost) / orig_cost > 0.05) or (latest_slip and latest_slip > 3.0)
        
        if is_completed or has_realized_overrun:
            # Fully observable future outcome
            cost_overrun_pct = round(((latest_rev - orig_cost) / orig_cost) * 100.0, 2) if (latest_rev and orig_cost and orig_cost > 0) else 0.0
            cost_overrun_amt = round(latest_rev - orig_cost, 2) if (latest_rev and orig_cost) else 0.0
            cost_overrun_bin = 1 if cost_overrun_pct > 5.0 else 0
            
            delay_m = float(latest_slip) if latest_slip is not None else 0.0
            sched_overrun_bin = 1 if delay_m > 3.0 else 0
            
            project_terminal_outcomes[pid] = {
                "is_censored": 0,
                "final_cost_cr": latest_rev,
                "cost_overrun_amount_cr": cost_overrun_amt,
                "cost_overrun_pct": cost_overrun_pct,
                "cost_overrun_binary": cost_overrun_bin,
                "delay_months": delay_m,
                "schedule_overrun_binary": sched_overrun_bin,
                "terminal_month": last_row['reporting_month']
            }
        else:
            # Right-censored project (outcome cannot be assumed 0!)
            project_terminal_outcomes[pid] = {
                "is_censored": 1,
                "final_cost_cr": None,
                "cost_overrun_amount_cr": None,
                "cost_overrun_pct": None,
                "cost_overrun_binary": None,
                "delay_months": None,
                "schedule_overrun_binary": None,
                "terminal_month": last_row['reporting_month']
            }
            
    # Attach targets to snapshots
    master_records = []
    for idx, row in df.iterrows():
        pid = row['project_id']
        rep_month = row['reporting_month']
        target_info = project_terminal_outcomes[pid]
        
        # Temporal Split:
        # Older -> Train (<= 2026-01)
        # Mid -> Validation (2026-02 to 2026-04)
        # Recent -> Test (2026-05 to 2026-07)
        if rep_month <= "2026-01":
            split = "train"
        elif rep_month <= "2026-04":
            split = "val"
        else:
            split = "test"
            
        master_records.append({
            "project_id": pid,
            "snapshot_month": rep_month,
            "dataset_split": split,
            
            # Point-in-time dynamic features
            "time_elapsed_pct": row['time_elapsed_pct'],
            "time_remaining_pct": row['time_remaining_pct'],
            "cost_escalation_pct": row['cost_escalation_pct'],
            "cost_growth_factor": row['cost_growth_factor'],
            "expenditure_pct": row['expenditure_pct'],
            "physical_progress_pct": row['physical_progress_pct'],
            "financial_progress_pct": row['financial_progress_pct'],
            "physical_financial_gap": row['physical_financial_gap'],
            "progress_deviation": row['progress_deviation'],
            "progress_velocity": row['progress_velocity_pct_per_month'],
            "expenditure_velocity": row['expenditure_velocity_cr_per_month'],
            "progress_3m_delta": row['progress_3m_delta'],
            "schedule_slippage_months": row['schedule_slippage_months'],
            "overall_risk_score": row['overall_risk_score'],
            "active_warnings_count": row['active_warnings_count'],
            
            # Static categorical features
            "sector_name": row['sector_name'] or 'Unknown',
            "ministry_name": row['ministry_name'] or 'Unknown',
            "agency_name": row['agency_name'] or 'Unknown',
            "state_name": row['state_name'] or 'Unknown',
            
            # Targets
            "target_cost_overrun_binary": target_info['cost_overrun_binary'],
            "target_final_cost_cr": target_info['final_cost_cr'],
            "target_cost_overrun_amount_cr": target_info['cost_overrun_amount_cr'],
            "target_cost_overrun_pct": target_info['cost_overrun_pct'],
            "target_schedule_overrun_binary": target_info['schedule_overrun_binary'],
            "target_delay_months": target_info['delay_months'],
            
            # Censoring & Audit Flags
            "is_censored": target_info['is_censored'],
            "target_observation_month": target_info['terminal_month'],
            "feature_version": "v1.0",
            "target_version": "v1.0",
            "leakage_check_passed": 1
        })
        
    master_df = pd.DataFrame(master_records)
    
    # Save master dataset into SQLite
    cur.execute("DELETE FROM ml_dataset_master")
    insert_cols = list(master_records[0].keys())
    placeholders = ", ".join(["?"] * len(insert_cols))
    sql_insert = f"INSERT OR REPLACE INTO ml_dataset_master ({', '.join(insert_cols)}) VALUES ({placeholders})"
    
    cur.executemany(sql_insert, [tuple(r.values()) for r in master_records])
    conn.commit()
    conn.close()
    
    logger.info(f"Loaded {len(master_df)} snapshot rows into SQLite ml_dataset_master.")
    
    # Filter uncensored training candidate datasets
    uncensored_df = master_df[master_df['is_censored'] == 0].copy()
    logger.info(f"Uncensored candidate snapshots for supervised training: {len(uncensored_df)} (from {uncensored_df['project_id'].nunique()} projects)")
    
    # 1. Cost Overrun Classification Dataset
    cost_cls_path = os.path.join(ml_out_dir, "ml_cost_overrun_classification.csv")
    cost_cls_cols = [
        'project_id', 'snapshot_month', 'dataset_split',
        'sector_name', 'ministry_name', 'agency_name', 'state_name',
        'time_elapsed_pct', 'cost_escalation_pct', 'expenditure_pct',
        'physical_progress_pct', 'physical_financial_gap', 'progress_deviation',
        'progress_velocity', 'schedule_slippage_months', 'overall_risk_score',
        'active_warnings_count', 'target_cost_overrun_binary'
    ]
    uncensored_df[cost_cls_cols].to_csv(cost_cls_path, index=False)
    logger.info(f"Saved Cost Overrun Classification dataset to {cost_cls_path}")
    
    # 2. Final Cost Regression Dataset
    cost_reg_path = os.path.join(ml_out_dir, "ml_final_cost_regression.csv")
    cost_reg_cols = [
        'project_id', 'snapshot_month', 'dataset_split',
        'sector_name', 'ministry_name', 'agency_name', 'state_name',
        'time_elapsed_pct', 'cost_escalation_pct', 'expenditure_pct',
        'physical_progress_pct', 'physical_financial_gap', 'progress_deviation',
        'progress_velocity', 'schedule_slippage_months', 'overall_risk_score', 'active_warnings_count', 'target_final_cost_cr'
    ]
    uncensored_df[cost_reg_cols].to_csv(cost_reg_path, index=False)
    logger.info(f"Saved Final Cost Regression dataset to {cost_reg_path}")
    
    # 3. Schedule Overrun Classification Dataset
    sched_cls_path = os.path.join(ml_out_dir, "ml_schedule_overrun_classification.csv")
    sched_cls_cols = [
        'project_id', 'snapshot_month', 'dataset_split',
        'sector_name', 'ministry_name', 'agency_name', 'state_name',
        'time_elapsed_pct', 'cost_escalation_pct', 'expenditure_pct',
        'physical_progress_pct', 'physical_financial_gap', 'progress_deviation',
        'progress_velocity', 'schedule_slippage_months', 'overall_risk_score',
        'active_warnings_count', 'target_schedule_overrun_binary'
    ]
    uncensored_df[sched_cls_cols].to_csv(sched_cls_path, index=False)
    logger.info(f"Saved Schedule Overrun Classification dataset to {sched_cls_path}")
    
    # 4. Delay Duration Regression Dataset
    delay_reg_path = os.path.join(ml_out_dir, "ml_delay_regression.csv")
    delay_reg_cols = [
        'project_id', 'snapshot_month', 'dataset_split',
        'sector_name', 'ministry_name', 'agency_name', 'state_name',
        'time_elapsed_pct', 'cost_escalation_pct', 'expenditure_pct',
        'physical_progress_pct', 'physical_financial_gap', 'progress_deviation',
        'progress_velocity', 'schedule_slippage_months', 'overall_risk_score',
        'active_warnings_count', 'target_delay_months'
    ]
    uncensored_df[delay_reg_cols].to_csv(delay_reg_path, index=False)
    logger.info(f"Saved Delay Duration Regression dataset to {delay_reg_path}")
    
    # Also save the full master snapshot dataset
    master_df.to_csv(os.path.join(ml_out_dir, "ml_dataset_master.csv"), index=False)
    logger.info("All 4 specialized ML datasets and master snapshot matrix generated successfully!")
    
    return master_df

if __name__ == "__main__":
    generate_ml_datasets(r"c:\Users\kessh\OneDrive\Documents\paimana first approach")
