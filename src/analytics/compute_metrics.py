import os
import sys
import sqlite3
import math
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("analytics_compute")

def safe_div(num, denom, default=None):
    if num is None or denom is None: return default
    try:
        if abs(float(denom)) < 1e-9:
            return default
        return float(num) / float(denom)
    except (ValueError, TypeError, ZeroDivisionError):
        return default

def parse_iso_date(dt_str):
    if not dt_str: return None
    try:
        return datetime.strptime(dt_str[:10], "%Y-%m-%d")
    except (ValueError, TypeError):
        return None

def month_diff(d_later, d_earlier):
    if not d_later or not d_earlier: return None
    return (d_later.year - d_earlier.year) * 12 + (d_later.month - d_earlier.month)

def compute_all_metrics(workspace_dir: str):
    db_path = os.path.join(workspace_dir, "paimana_canonical.db")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    logger.info("Computing Whole Computational Stack (Parts A-G) for all project-month facts...")
    
    # Load all fact rows sorted by project_id and reporting_month
    cur.execute("""
        SELECT fact_id, project_id, reporting_month, reporting_date,
               original_cost_cr, revised_cost_cr, anticipated_cost_cr, cumulative_expenditure_cr,
               physical_progress_pct, approval_date, start_date, original_doc, revised_doc, anticipated_doc
        FROM fact_project_month
        ORDER BY project_id, reporting_month
    """)
    rows = cur.fetchall()
    logger.info(f"Retrieved {len(rows)} fact rows to compute deterministic features.")
    
    metrics_records = []
    
    # Track per-project chronological state
    current_pid = None
    prev_prog = None
    prev_exp = None
    prev_date = None
    prev_vel = None
    prev_exp_vel = None
    
    prog_history = []
    exp_history = []
    
    for r in rows:
        (fact_id, pid, rep_month, rep_date_str,
         orig_cost, rev_cost, ant_cost, exp,
         phys_prog, app_date_str, start_date_str, orig_doc_str, rev_doc_str, ant_doc_str) = r
         
        if pid != current_pid:
            current_pid = pid
            prev_prog = None
            prev_exp = None
            prev_date = None
            prev_vel = None
            prev_exp_vel = None
            prog_history = []
            exp_history = []
            
        rep_date = parse_iso_date(rep_date_str)
        app_date = parse_iso_date(app_date_str) or parse_iso_date(start_date_str)
        orig_doc = parse_iso_date(orig_doc_str)
        ant_doc = parse_iso_date(ant_doc_str) or parse_iso_date(rev_doc_str)
        
        # Effective cost baselines
        c_orig = orig_cost if (orig_cost is not None and orig_cost > 0) else None
        c_rev = rev_cost if (rev_cost is not None and rev_cost > 0) else c_orig
        c_exp = exp if (exp is not None and exp >= 0) else 0.0
        
        # -------------------------------------------------------------
        # Part A: Durations
        # -------------------------------------------------------------
        planned_dur = month_diff(orig_doc, app_date) if (orig_doc and app_date) else None
        elapsed_dur = month_diff(rep_date, app_date) if (rep_date and app_date) else None
        remaining_dur = month_diff(orig_doc, rep_date) if (orig_doc and rep_date) else None
        
        time_elapsed_pct = None
        time_remaining_pct = None
        if planned_dur and planned_dur > 0 and elapsed_dur is not None:
            time_elapsed_pct = round(safe_div(elapsed_dur * 100.0, planned_dur, 0.0), 2)
            time_remaining_pct = round(100.0 - time_elapsed_pct, 2)
            
        # -------------------------------------------------------------
        # Part B: Cost
        # -------------------------------------------------------------
        cost_esc_cr = None
        cost_esc_pct = None
        cost_growth = None
        exp_pct = None
        rem_exposure = None
        
        if c_rev is not None and c_orig is not None:
            cost_esc_cr = round(c_rev - c_orig, 2)
            cost_esc_pct = round(safe_div((c_rev - c_orig) * 100.0, c_orig, 0.0), 2)
            cost_growth = round(safe_div(c_rev, c_orig, 1.0), 3)
            
        if c_rev is not None and c_exp is not None:
            exp_pct = round(safe_div(c_exp * 100.0, c_rev, 0.0), 2)
            rem_exposure = round(max(0.0, c_rev - c_exp), 2)
            
        # -------------------------------------------------------------
        # Part C: Progress & Divergence
        # -------------------------------------------------------------
        fin_prog_pct = exp_pct
        phys_prog_val = phys_prog if phys_prog is not None else None
        
        gap = None
        if phys_prog_val is not None and fin_prog_pct is not None:
            gap = round(phys_prog_val - fin_prog_pct, 2)
            
        # -------------------------------------------------------------
        # Part D: Planned vs Actual
        # -------------------------------------------------------------
        expected_base = min(100.0, max(0.0, time_elapsed_pct)) if time_elapsed_pct is not None else None
        prog_dev = None
        comp_ratio = None
        if phys_prog_val is not None and expected_base is not None:
            prog_dev = round(phys_prog_val - expected_base, 2)
            comp_ratio = round(safe_div(phys_prog_val, expected_base, 1.0), 3)
            
        # -------------------------------------------------------------
        # Part E: Velocities & Acceleration (Actual Spaced Months!)
        # -------------------------------------------------------------
        months_elapsed = None
        prog_vel = None
        exp_vel = None
        prog_acc = None
        exp_acc = None
        
        if prev_date and rep_date:
            months_elapsed = max(1, month_diff(rep_date, prev_date))
            if phys_prog_val is not None and prev_prog is not None:
                prog_vel = round(safe_div(phys_prog_val - prev_prog, months_elapsed, 0.0), 3)
            if c_exp is not None and prev_exp is not None:
                exp_vel = round(safe_div(c_exp - prev_exp, months_elapsed, 0.0), 2)
                
            if prog_vel is not None and prev_vel is not None:
                prog_acc = round(safe_div(prog_vel - prev_vel, months_elapsed, 0.0), 3)
            if exp_vel is not None and prev_exp_vel is not None:
                exp_acc = round(safe_div(exp_vel - prev_exp_vel, months_elapsed, 0.0), 2)
                
        # -------------------------------------------------------------
        # Part F: Trajectory & Rolling Stats
        # -------------------------------------------------------------
        if phys_prog_val is not None:
            prog_history.append((rep_month, phys_prog_val))
        if c_exp is not None:
            exp_history.append((rep_month, c_exp))
            
        p_3m_delta = round(phys_prog_val - prog_history[-4][1], 2) if len(prog_history) >= 4 else None
        p_6m_delta = round(phys_prog_val - prog_history[-7][1], 2) if len(prog_history) >= 7 else None
        e_3m_delta = round(c_exp - exp_history[-4][1], 2) if len(exp_history) >= 4 else None
        
        # 3m rolling averages
        p_window = [p[1] for p in prog_history[-3:]]
        roll_p_avg = round(sum(p_window) / len(p_window), 2) if p_window else None
        e_window = [e[1] for e in exp_history[-3:]]
        roll_e_avg = round(sum(e_window) / len(e_window), 2) if e_window else None
        
        # Volatility
        vol_3m = None
        if len(p_window) >= 2:
            mean_p = sum(p_window) / len(p_window)
            vol_3m = round(math.sqrt(sum((x - mean_p) ** 2 for x in p_window) / len(p_window)), 3)
            
        # -------------------------------------------------------------
        # Part G: Schedule Slippage
        # -------------------------------------------------------------
        slippage_months = None
        slippage_pct = None
        is_delayed = 0
        
        if ant_doc and orig_doc:
            diff_m = month_diff(ant_doc, orig_doc)
            slippage_months = round(max(0.0, float(diff_m)), 1)
            is_delayed = 1 if slippage_months > 0 else 0
            if planned_dur and planned_dur > 0:
                slippage_pct = round(safe_div(slippage_months * 100.0, planned_dur, 0.0), 2)
                
        metrics_records.append((
            pid, rep_month,
            planned_dur, elapsed_dur, remaining_dur, time_elapsed_pct, time_remaining_pct,
            cost_esc_cr, cost_esc_pct, cost_growth, exp_pct, rem_exposure,
            fin_prog_pct, gap, expected_base, prog_dev, comp_ratio,
            months_elapsed, prog_vel, exp_vel, prog_acc, exp_acc,
            p_3m_delta, p_6m_delta, e_3m_delta, roll_p_avg, roll_e_avg, vol_3m,
            slippage_months, slippage_pct, is_delayed
        ))
        
        # Update project state trackers
        if phys_prog_val is not None: prev_prog = phys_prog_val
        if c_exp is not None: prev_exp = c_exp
        if rep_date: prev_date = rep_date
        if prog_vel is not None: prev_vel = prog_vel
        if exp_vel is not None: prev_exp_vel = exp_vel
        
    logger.info(f"Inserting {len(metrics_records)} computed analytical metrics rows into gold_project_monthly_metrics...")
    cur.executemany("""
        INSERT OR REPLACE INTO gold_project_monthly_metrics
        (project_id, reporting_month,
         duration_planned_months, duration_elapsed_months, duration_remaining_months,
         time_elapsed_pct, time_remaining_pct, cost_escalation_cr, cost_escalation_pct,
         cost_growth_factor, expenditure_pct, remaining_financial_exposure_cr,
         financial_progress_pct, physical_financial_gap, expected_baseline_progress_pct,
         progress_deviation, progress_completion_ratio, months_elapsed_since_prev_obs,
         progress_velocity_pct_per_month, expenditure_velocity_cr_per_month,
         progress_acceleration, expenditure_acceleration, progress_3m_delta,
         progress_6m_delta, expenditure_3m_delta, rolling_avg_progress_3m,
         rolling_avg_expenditure_3m, progress_volatility_3m, schedule_slippage_months,
         schedule_slippage_pct, is_schedule_delayed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, metrics_records)
    conn.commit()
    conn.close()
    logger.info("Successfully populated gold_project_monthly_metrics!")

if __name__ == "__main__":
    compute_all_metrics(r"c:\Users\kessh\OneDrive\Documents\paimana first approach")
