import os
import sys
import sqlite3
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("risk_warning_engine")

def calculate_risk_subscores(cost_esc_pct, rem_exposure, slippage_months, prog_dev, time_elapsed_pct, gap, prog_vel):
    # 1. Cost Risk (0-100)
    # Scaled by escalation % and remaining exposure
    c_pct = max(0.0, cost_esc_pct) if cost_esc_pct is not None else 0.0
    c_risk = min(100.0, c_pct * 1.5 + (min(1000.0, rem_exposure) / 20.0 if rem_exposure else 0.0))
    
    # 2. Schedule Risk (0-100)
    # Scaled by delay months and deviation
    s_m = max(0.0, slippage_months) if slippage_months is not None else 0.0
    p_dev_neg = max(0.0, -prog_dev) if (prog_dev is not None and prog_dev < 0) else 0.0
    s_risk = min(100.0, (s_m * 3.0) + (p_dev_neg * 1.2))
    
    # 3. Progress Risk (0-100)
    # Stagnation and physical-financial gap
    p_risk = 0.0
    if gap is not None and gap < -10.0:
        p_risk += min(50.0, abs(gap) * 1.5)
    if prog_vel is not None and prog_vel < 0.2 and (time_elapsed_pct and time_elapsed_pct > 25.0):
        p_risk += 35.0
    p_risk = min(100.0, p_risk)
    
    # 4. Overall Weighted Risk (0-100)
    overall = round(0.35 * c_risk + 0.35 * s_risk + 0.30 * p_risk, 2)
    
    # Risk Band
    if overall >= 75.0:
        band = "Critical"
    elif overall >= 50.0:
        band = "High"
    elif overall >= 25.0:
        band = "Moderate"
    else:
        band = "Low"
        
    return round(c_risk, 2), round(s_risk, 2), round(p_risk, 2), overall, band

def run_risk_warning_pipeline(workspace_dir: str):
    db_path = os.path.join(workspace_dir, "paimana_canonical.db")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    logger.info("Executing Risk Engine, Early Warning Generator, and Intervention Prioritization...")
    
    # Query all facts and metrics
    cur.execute("""
        SELECT f.project_id, f.reporting_month,
               m.cost_escalation_pct, m.remaining_financial_exposure_cr,
               m.schedule_slippage_months, m.progress_deviation, m.time_elapsed_pct,
               m.physical_financial_gap, m.progress_velocity_pct_per_month,
               m.cost_escalation_cr
        FROM fact_project_month f
        JOIN gold_project_monthly_metrics m 
          ON f.project_id = m.project_id AND f.reporting_month = m.reporting_month
        ORDER BY f.project_id, f.reporting_month
    """)
    rows = cur.fetchall()
    
    risk_records = []
    warning_records = []
    intervention_records = []
    
    # Track state per project
    current_pid = None
    prev_risk = None
    warning_persistence = {}
    
    for r in rows:
        (pid, rep_month, cost_esc_pct, rem_exp,
         slip_m, prog_dev, t_elapsed_pct,
         gap, prog_vel, cost_esc_cr) = r
         
        if pid != current_pid:
            current_pid = pid
            prev_risk = None
            
        c_risk, s_risk, p_risk, overall_risk, band = calculate_risk_subscores(
            cost_esc_pct, rem_exp, slip_m, prog_dev, t_elapsed_pct, gap, prog_vel
        )
        
        # Risk trajectory
        risk_change = round(overall_risk - prev_risk, 2) if prev_risk is not None else 0.0
        if risk_change > 3.0:
            trajectory = "Deteriorating"
        elif risk_change < -3.0:
            trajectory = "Improving"
        else:
            trajectory = "Stable"
            
        risk_records.append((
            pid, rep_month, c_risk, s_risk, p_risk, overall_risk, band,
            risk_change, trajectory, 'V1.0_DETERMINISTIC'
        ))
        
        # -------------------------------------------------------------
        # Early Warning Checks (Rule-Based)
        # -------------------------------------------------------------
        proj_warnings_active = 0
        
        # Rule 1: Cost Overrun Warning
        if (cost_esc_pct is not None and cost_esc_pct > 20.0) or (cost_esc_cr is not None and cost_esc_cr > 100.0):
            w_key = (pid, 'COST_OVERRUN')
            warning_persistence[w_key] = warning_persistence.get(w_key, 0) + 1
            warning_records.append((
                pid, rep_month, 'COST_OVERRUN',
                'Critical' if (cost_esc_pct and cost_esc_pct > 50.0) else 'High',
                'Cost escalation exceeds 20% or 100 Cr threshold',
                cost_esc_pct, 20.0, warning_persistence[w_key], 'Active'
            ))
            proj_warnings_active += 1
            
        # Rule 2: Schedule Slippage Warning
        if slip_m is not None and slip_m >= 6.0:
            w_key = (pid, 'SCHEDULE_SLIPPAGE')
            warning_persistence[w_key] = warning_persistence.get(w_key, 0) + 1
            warning_records.append((
                pid, rep_month, 'SCHEDULE_SLIPPAGE',
                'Critical' if slip_m >= 18.0 else 'High',
                f'Commissioning delayed by {slip_m} months',
                slip_m, 6.0, warning_persistence[w_key], 'Active'
            ))
            proj_warnings_active += 1
            
        # Rule 3: Stagnant Progress Warning
        if prog_vel is not None and prog_vel < 0.1 and (t_elapsed_pct and t_elapsed_pct > 25.0):
            w_key = (pid, 'STAGNATION')
            warning_persistence[w_key] = warning_persistence.get(w_key, 0) + 1
            warning_records.append((
                pid, rep_month, 'STAGNATION', 'Moderate',
                'Physical progress velocity stalled under 0.1% per month',
                prog_vel, 0.1, warning_persistence[w_key], 'Active'
            ))
            proj_warnings_active += 1
            
        # Rule 4: Gap Divergence Warning
        if gap is not None and gap < -20.0:
            w_key = (pid, 'EXPENDITURE_MISMATCH')
            warning_persistence[w_key] = warning_persistence.get(w_key, 0) + 1
            warning_records.append((
                pid, rep_month, 'EXPENDITURE_MISMATCH', 'High',
                f'Financial progress exceeds physical progress by {abs(gap):.1f}% pts',
                gap, -20.0, warning_persistence[w_key], 'Active'
            ))
            proj_warnings_active += 1
            
        # -------------------------------------------------------------
        # Intervention Priority Scoring (0-100)
        # -------------------------------------------------------------
        # Scale: 0.5 * overall_risk + 0.3 * exposure_factor + 0.2 * warnings_factor
        exp_factor = min(100.0, (rem_exp / 50.0) if rem_exp else 0.0)
        warn_factor = min(100.0, proj_warnings_active * 25.0)
        priority_score = round(0.50 * overall_risk + 0.30 * exp_factor + 0.20 * warn_factor, 2)
        
        # Multi-factor, compound, logic-driven action recommendation
        has_critical_delay = slip_m is not None and slip_m >= 24.0
        has_moderate_delay = slip_m is not None and slip_m >= 6.0
        has_severe_overrun = (cost_esc_pct is not None and cost_esc_pct >= 25.0) or (cost_esc_cr is not None and cost_esc_cr >= 500.0)
        has_moderate_overrun = (cost_esc_pct is not None and cost_esc_pct >= 10.0) or (cost_esc_cr is not None and cost_esc_cr >= 100.0)
        has_gap_divergence = gap is not None and gap < -15.0
        has_stagnant_velocity = prog_vel is not None and prog_vel < 0.2 and (t_elapsed_pct and t_elapsed_pct > 25.0)
        
        if has_critical_delay and has_severe_overrun:
            cat = "Inter-Ministerial Project Restructuring & Revised Cost Committee"
            rec = "Convene Cabinet Committee on Economic Affairs (CCEA) / EFC Joint Review to approve realistic Revised Cost Estimate (RCE) and restructure critical path."
            evidence = f"Compounding crisis: {slip_m:.0f} months schedule delay and +{cost_esc_pct:.1f}% (+Rs. {cost_esc_cr:,.1f} Cr) cost escalation."
            authority = "Cabinet Committee on Economic Affairs / Expenditure Finance Committee"
        elif has_critical_delay:
            cat = "Critical Path Acceleration & Taskforce Deployment"
            rec = "Deploy Central Ministry High-Level Taskforce to institute weekly critical-path audits and resolve site clearance bottlenecks."
            evidence = f"Chronic commissioning delay of {slip_m:.0f} months against approved schedule."
            authority = "Central Line Ministry Project Review Cell"
        elif has_severe_overrun:
            cat = "Comprehensive Financial & Quantity Survey Audit"
            rec = "Institute independent third-party quantity survey audit to verify price variation clauses and scope escalation before releasing further funds."
            evidence = f"Sanctioned cost expanded by {cost_esc_pct:.1f}% (+Rs. {cost_esc_cr:,.1f} Cr over baseline)."
            authority = "Ministry Financial Advisor & Chief Controller of Accounts"
        elif has_gap_divergence:
            cat = "Physical Output Verification & Disbursement Staging"
            rec = "Conduct joint technical inspection to verify certified work and freeze milestone disbursements until physical progress catches up with expenditure."
            evidence = f"Financial expenditure utilization leads physical progress certification by {abs(gap):.1f}% points."
            authority = "Chief Vigilance Officer & Third-Party Inspection Agency"
        elif has_stagnant_velocity:
            cat = "Contractor Performance Cure Notice"
            rec = "Issue formal contractual cure notice to non-performing EPC contractors with 30-day performance rectification deadline."
            evidence = f"Monthly execution velocity stalled at {prog_vel:.2f}% despite {t_elapsed_pct:.1f}% contract duration elapsed."
            authority = "Executing Agency Project Director"
        elif has_moderate_delay:
            cat = "Milestone Recovery Catch-Up Plan"
            rec = "Mandate executing agency to submit compressed resource augmentation work-program to arrest slippage."
            evidence = f"Schedule slippage of {slip_m:.0f} months recorded."
            authority = "Executing Agency Project Director"
        elif has_moderate_overrun:
            cat = "Cost Engineering & Variation Review"
            rec = "Conduct itemized rate and variation review to freeze uncommitted contingencies."
            evidence = f"Observed cost escalation of +{cost_esc_pct:.1f}% (+Rs. {cost_esc_cr:,.1f} Cr)."
            authority = "Agency Chief Engineer / Finance Wing"
        else:
            cat = "Routine Monitoring & Commissioning Protocol"
            rec = "Continue standard monthly OCMS milestone surveillance; no special remedial intervention warranted."
            evidence = f"Operational metrics remain within allowable baseline tolerances (Overall Risk: {overall_risk:.1f})."
            authority = "Field Project Implementation Unit (PIU)"
            
        intervention_records.append((
            pid, rep_month, priority_score, 1, cat, rec, evidence, authority
        ))
        
        prev_risk = overall_risk
        
    logger.info(f"Writing {len(risk_records)} rows into gold_risk_engine_outputs...")
    cur.executemany("""
        INSERT OR REPLACE INTO gold_risk_engine_outputs
        (project_id, reporting_month, cost_risk_score, schedule_risk_score,
         progress_risk_score, overall_risk_score, risk_band, risk_change_from_prev,
         risk_trajectory, model_version)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, risk_records)
    conn.commit()
    
    logger.info(f"Writing {len(warning_records)} alerts into gold_warning_alerts...")
    cur.executemany("""
        INSERT INTO gold_warning_alerts
        (project_id, reporting_month, warning_type, severity, trigger_rule,
         trigger_value, threshold_value, persistence_months, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, warning_records)
    conn.commit()
    
    logger.info(f"Writing {len(intervention_records)} records into gold_intervention_priority...")
    cur.executemany("""
        INSERT OR REPLACE INTO gold_intervention_priority
        (project_id, reporting_month, intervention_priority_score, intervention_rank,
         action_category, recommended_action, action_evidence, responsible_authority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, intervention_records)
    conn.commit()
    
    # -----------------------------------------------------------------
    # Materialize gold_project_current
    # -----------------------------------------------------------------
    logger.info("Materializing gold_project_current for high-performance backend querying...")
    cur.execute("DELETE FROM gold_project_current")
    cur.execute("""
        INSERT INTO gold_project_current
        SELECT 
            p.project_id,
            p.canonical_project_name AS project_name,
            s.sector_name,
            m.ministry_name,
            a.agency_name,
            COALESCE(st.state_name, 'Multi-State') AS state_name,
            p.is_multi_state,
            f.original_cost_cr,
            f.revised_cost_cr AS latest_revised_cost_cr,
            f.cumulative_expenditure_cr,
            f.physical_progress_pct,
            met.financial_progress_pct,
            met.physical_financial_gap,
            met.cost_escalation_pct,
            f.original_doc,
            f.anticipated_doc,
            met.schedule_slippage_months,
            r.overall_risk_score,
            r.risk_band,
            r.risk_trajectory,
            COALESCE(w.warn_count, 0) AS active_warning_count,
            i.intervention_priority_score,
            i.recommended_action AS intervention_recommendation,
            f.reporting_month AS latest_reporting_month,
            CURRENT_TIMESTAMP AS updated_at
        FROM dim_project p
        JOIN fact_project_month f ON p.project_id = f.project_id AND p.latest_monitored_month = f.reporting_month
        LEFT JOIN gold_project_monthly_metrics met ON f.project_id = met.project_id AND f.reporting_month = met.reporting_month
        LEFT JOIN gold_risk_engine_outputs r ON f.project_id = r.project_id AND f.reporting_month = r.reporting_month
        LEFT JOIN gold_intervention_priority i ON f.project_id = i.project_id AND f.reporting_month = i.reporting_month
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
    """)
    conn.commit()
    cur.execute("SELECT COUNT(*) FROM gold_project_current")
    current_count = cur.fetchone()[0]
    logger.info(f"Materialized {current_count} active projects in gold_project_current.")
    
    conn.close()
    logger.info("Risk, Warning, Intervention, and Current Project pipelines completed successfully!")

if __name__ == "__main__":
    run_risk_warning_pipeline(r"c:\Users\kessh\OneDrive\Documents\paimana first approach")
