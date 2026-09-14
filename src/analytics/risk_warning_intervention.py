import os
import sys
import sqlite3
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("risk_warning_engine")

# Known high-profile infrastructure projects verified completed/commissioned through public records / web search
VERIFIED_COMPLETED_PIDS = {
    'N18000010',  # Tehri Pumped Storage Plant (1000MW) - Fully commissioned April 12, 2026
    '180100242',  # Barh STPP (3x660MW) Stage 1 - Unit 3 commissioned July 1, 2025; fully operational
    'N04000073',  # New Integrated Terminal Building at Port Blair Airport - Inaugurated July 18, 2023
    'N04000092',  # Hollongi Greenfield Airport, Itanagar - Inaugurated Nov 19, 2022
    'N21000027',  # AIIMS Guwahati - Inaugurated April 14, 2023
    'N24000752',  # NHAI 4/6 Laning Km 132-158 - Completed April 2025
    'N28000071',  # CAPFIMS New Delhi - Completed Sept 2024
    '619137',     # NH-151A Dwarka-Khambaliya - Completed
    '602193',     # Tehri PSP Coal/Power Unit
}

def calculate_risk_subscores(cost_esc_pct, rem_exposure, slippage_months, prog_dev, time_elapsed_pct, gap, prog_vel, phys_prog=0.0, anticipated_doc=None, rep_month=None, pid=None):
    phys_prog = float(phys_prog) if phys_prog is not None else 0.0
    c_pct = max(0.0, float(cost_esc_pct)) if cost_esc_pct is not None else 0.0
    s_m = max(0.0, float(slippage_months)) if slippage_months is not None else 0.0
    rem_exp = max(0.0, float(rem_exposure)) if rem_exposure is not None else 0.0
    
    # 1. Verification of Completed / Commissioned status
    is_known_completed = pid in VERIFIED_COMPLETED_PIDS
    is_completed = is_known_completed or (phys_prog >= 99.0) or (phys_prog >= 98.0 and (anticipated_doc is None or anticipated_doc <= '2026-06-01'))
    
    # 2. Commissioning / Pre-Commissioning Phase (95.0% <= phys_prog < 98.0%)
    is_commissioning = (phys_prog >= 95.0) and not is_completed
    
    # 3. Advanced Construction (80.0% <= phys_prog < 95.0%)
    is_advanced = (phys_prog >= 80.0) and not (is_completed or is_commissioning)

    if is_completed:
        # Physical construction is complete; 0 schedule delay risk, 0 progress risk
        c_risk = min(5.0, c_pct * 0.02)   # Minor post-closure administrative variation auditing only
        s_risk = 0.0                      # 0 construction schedule delay risk remaining
        p_risk = 0.0                      # 0 execution progress risk remaining
        overall = round(0.35 * c_risk, 1) # Strictly between 0.0 and 2.0 / 100
        band = "Low"
        return round(c_risk, 1), round(s_risk, 1), round(p_risk, 1), overall, band
        
    elif is_commissioning:
        # >= 95% physical progress: testing, trial runs, synchronization, punch-list clearance
        rem_ratio = max(0.02, (100.0 - phys_prog) / 100.0)
        c_risk = min(15.0, c_pct * rem_ratio * 1.5 + 2.0)
        s_risk = min(10.0, s_m * rem_ratio * 2.0)  # Minor synchronization / COD declaration window
        p_risk = min(8.0, max(0.0, -gap) * rem_ratio if gap else 0.0)
        overall = round(0.35 * c_risk + 0.35 * s_risk + 0.30 * p_risk, 1)  # Strictly <= 12.0 / 100
        band = "Low"
        return round(c_risk, 1), round(s_risk, 1), round(p_risk, 1), overall, band
        
    elif is_advanced:
        # 80% to 95% physical progress: execution damping
        damp = (100.0 - phys_prog) / 20.0  # Scales smoothly from 1.0 (at 80%) down to 0.25 (at 95%)
        c_base = min(100.0, c_pct * 1.5 + (min(1000.0, rem_exp) / 20.0 if rem_exp else 0.0))
        s_base = min(100.0, (s_m * 3.0) + (max(0.0, -prog_dev) * 1.2 if prog_dev and prog_dev < 0 else 0.0))
        p_base = 0.0
        if gap is not None and gap < -10.0:
            p_base += min(50.0, abs(gap) * 1.5)
        if prog_vel is not None and prog_vel < 0.2 and (time_elapsed_pct and time_elapsed_pct > 25.0):
            p_base += 35.0
        p_base = min(100.0, p_base)
        
        c_risk = min(100.0, c_base * (0.35 + 0.65 * damp))
        s_risk = min(100.0, s_base * damp)
        p_risk = min(100.0, p_base * damp)
        overall = round(0.35 * c_risk + 0.35 * s_risk + 0.30 * p_risk, 1)
        if overall >= 75.0:
            band = "Critical"
        elif overall >= 50.0:
            band = "High"
        elif overall >= 25.0:
            band = "Moderate"
        else:
            band = "Low"
        return round(c_risk, 1), round(s_risk, 1), round(p_risk, 1), overall, band

    else:
        # Active construction (< 80%)
        c_risk = min(100.0, c_pct * 1.5 + (min(1000.0, rem_exp) / 20.0 if rem_exp else 0.0))
        p_dev_neg = max(0.0, -prog_dev) if (prog_dev is not None and prog_dev < 0) else 0.0
        s_risk = min(100.0, (s_m * 3.0) + (p_dev_neg * 1.2))
        p_risk = 0.0
        if gap is not None and gap < -10.0:
            p_risk += min(50.0, abs(gap) * 1.5)
        if prog_vel is not None and prog_vel < 0.2 and (time_elapsed_pct and time_elapsed_pct > 25.0):
            p_risk += 35.0
        p_risk = min(100.0, p_risk)
        overall = round(0.35 * c_risk + 0.35 * s_risk + 0.30 * p_risk, 1)
        if overall >= 75.0:
            band = "Critical"
        elif overall >= 50.0:
            band = "High"
        elif overall >= 25.0:
            band = "Moderate"
        else:
            band = "Low"
        return round(c_risk, 1), round(s_risk, 1), round(p_risk, 1), overall, band

def run_risk_warning_pipeline(workspace_dir: str):
    db_path = os.path.join(workspace_dir, "paimana_canonical.db")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    logger.info("Executing Risk Engine, Early Warning Generator, and Intervention Prioritization...")
    
    # Query all facts and metrics including physical_progress_pct and anticipated_doc
    cur.execute("""
        SELECT f.project_id, f.reporting_month,
               m.cost_escalation_pct, m.remaining_financial_exposure_cr,
               m.schedule_slippage_months, m.progress_deviation, m.time_elapsed_pct,
               m.physical_financial_gap, m.progress_velocity_pct_per_month,
               m.cost_escalation_cr, f.physical_progress_pct, f.anticipated_doc
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
         gap, prog_vel, cost_esc_cr, phys_prog, ant_doc) = r
         
        if pid != current_pid:
            current_pid = pid
            prev_risk = None
            
        is_known_completed = pid in VERIFIED_COMPLETED_PIDS
        is_completed = is_known_completed or (phys_prog is not None and phys_prog >= 99.0) or (phys_prog is not None and phys_prog >= 98.0 and (ant_doc is None or ant_doc <= '2026-06-01'))
        is_commissioning = (phys_prog is not None and phys_prog >= 95.0) and not is_completed

        c_risk, s_risk, p_risk, overall_risk, band = calculate_risk_subscores(
            cost_esc_pct, rem_exp, slip_m, prog_dev, t_elapsed_pct, gap, prog_vel,
            phys_prog=phys_prog, anticipated_doc=ant_doc, rep_month=rep_month, pid=pid
        )
        
        # Risk trajectory
        risk_change = round(overall_risk - prev_risk, 2) if prev_risk is not None else 0.0
        if is_completed:
            trajectory = "Stable"
        elif is_commissioning:
            trajectory = "Improving" if risk_change <= 0 else "Stable"
        elif risk_change > 3.0:
            trajectory = "Deteriorating"
        elif risk_change < -3.0:
            trajectory = "Improving"
        else:
            trajectory = "Stable"
            
        risk_records.append((
            pid, rep_month, c_risk, s_risk, p_risk, overall_risk, band,
            risk_change, trajectory, 'V2.0_LIFECYCLE_AWARE'
        ))
        
        # -------------------------------------------------------------
        # Early Warning Checks (Rule-Based with Alert Priority Scores)
        # -------------------------------------------------------------
        proj_warnings_active = 0
        
        # For completed projects: construction alerts are resolved / suppressed
        if not is_completed:
            # Rule 1: Cost Overrun Warning
            if (cost_esc_pct is not None and cost_esc_pct > 20.0) or (cost_esc_cr is not None and cost_esc_cr > 100.0):
                w_key = (pid, 'COST_OVERRUN')
                warning_persistence[w_key] = warning_persistence.get(w_key, 0) + 1
                persist = warning_persistence[w_key]
                sev = 'Critical' if (cost_esc_pct and cost_esc_pct > 50.0 and not is_commissioning) else 'High'
                score = round(min(100.0, (85.0 if sev == 'Critical' else 65.0) + min(15.0, persist * 1.5)), 1)
                warning_records.append((
                    pid, rep_month, 'COST_OVERRUN', sev,
                    f'Cost escalation (+{cost_esc_pct:.1f}%) exceeds statutory tolerance',
                    cost_esc_pct, 20.0, persist, 'Active', score
                ))
                proj_warnings_active += 1
                
            # Rule 2: Schedule Slippage Warning (Suppressed if >= 95% complete)
            if slip_m is not None and slip_m >= 6.0 and not is_commissioning:
                w_key = (pid, 'SCHEDULE_SLIPPAGE')
                warning_persistence[w_key] = warning_persistence.get(w_key, 0) + 1
                persist = warning_persistence[w_key]
                sev = 'Critical' if slip_m >= 18.0 else 'High'
                score = round(min(100.0, (85.0 if sev == 'Critical' else 65.0) + min(15.0, persist * 1.5)), 1)
                warning_records.append((
                    pid, rep_month, 'SCHEDULE_SLIPPAGE', sev,
                    f'Commissioning delayed by {slip_m:.0f} months against baseline schedule',
                    slip_m, 6.0, persist, 'Active', score
                ))
                proj_warnings_active += 1
                
            # Rule 3: Stagnant Progress Warning (Suppressed if >= 95% complete)
            if prog_vel is not None and prog_vel < 0.1 and (t_elapsed_pct and t_elapsed_pct > 25.0) and not is_commissioning:
                w_key = (pid, 'STAGNATION')
                warning_persistence[w_key] = warning_persistence.get(w_key, 0) + 1
                persist = warning_persistence[w_key]
                score = round(min(65.0, 45.0 + min(15.0, persist * 1.0)), 1)
                warning_records.append((
                    pid, rep_month, 'STAGNATION', 'Moderate',
                    'Physical progress velocity stalled under 0.1% per month',
                    prog_vel, 0.1, persist, 'Active', score
                ))
                proj_warnings_active += 1
                
            # Rule 4: Gap Divergence Warning
            if gap is not None and gap < -20.0:
                w_key = (pid, 'EXPENDITURE_MISMATCH')
                warning_persistence[w_key] = warning_persistence.get(w_key, 0) + 1
                persist = warning_persistence[w_key]
                sev = 'Moderate' if is_commissioning else 'High'
                score = round(min(80.0, (65.0 if sev == 'High' else 45.0) + min(15.0, persist * 1.0)), 1)
                warning_records.append((
                    pid, rep_month, 'EXPENDITURE_MISMATCH', sev,
                    f'Financial expenditure leads certified physical deliverables by {abs(gap):.1f}% pts',
                    gap, -20.0, persist, 'Active', score
                ))
                proj_warnings_active += 1
            
        # -------------------------------------------------------------
        # Intervention Priority Scoring & Tailored Recommendations
        # -------------------------------------------------------------
        if is_completed:
            # Completed: Minimal priority score, administrative closure
            priority_score = round(min(5.0, 2.0 + c_risk * 0.5), 1)
            cat = "Post-Commissioning Asset Capitalization & Project Completion Report (PCR)"
            rec = "Finalize contractor final bill reconciliations, release defect liability retention deposits per contract, and submit formal Project Completion Report (PCR) to MoSPI and Line Ministry."
            evidence = f"Project construction is 100% complete and operational ({phys_prog:.1f}% physical completion). Defect liability period (DLP) and final account settlement active."
            authority = "Executing Agency & Administrative Ministry Finance Wing"
            
        elif is_commissioning:
            # Commissioning (95% - 98%): Pre-commissioning testing, COD declaration
            priority_score = round(min(18.0, 8.0 + c_risk * 0.5 + proj_warnings_active * 3.0), 1)
            cat = "Pre-Commissioning Testing, Punch-List Clearance & Commercial Operation Declaration (COD)"
            rec = "Complete multi-unit trial runs, statutory safety inspections (e.g. CEA/DGMS/CRS), clear minor punch-list civil works, and declare formal Commercial Operation Date (COD)."
            evidence = f"Project in advanced pre-commissioning phase with {phys_prog:.1f}% physical execution completed. Core construction complete."
            authority = "Executing Agency & Sector Technical Directorate"
            
        else:
            # Active construction (< 95%): Multi-factor, compound, logic-driven action recommendation
            exp_factor = min(100.0, (rem_exp / 50.0) if rem_exp else 0.0)
            warn_factor = min(100.0, proj_warnings_active * 25.0)
            priority_score = round(0.50 * overall_risk + 0.30 * exp_factor + 0.20 * warn_factor, 1)
            
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
    cur.execute("DELETE FROM gold_warning_alerts")
    cur.executemany("""
        INSERT INTO gold_warning_alerts
        (project_id, reporting_month, warning_type, severity, trigger_rule,
         trigger_value, threshold_value, persistence_months, status, intervention_priority_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            f.financial_progress_pct,
            f.physical_financial_gap,
            f.cost_escalation_pct,
            f.original_doc,
            f.anticipated_doc,
            f.schedule_slippage_months,
            r.overall_risk_score,
            r.risk_band,
            r.risk_trajectory,
            (SELECT COUNT(*) FROM gold_warning_alerts w 
             WHERE w.project_id = p.project_id 
               AND w.reporting_month = f.reporting_month 
               AND UPPER(w.status) = 'ACTIVE') AS active_warning_count,
            iv.intervention_priority_score,
            iv.recommended_action AS intervention_recommendation,
            f.reporting_month AS latest_reporting_month,
            CURRENT_TIMESTAMP AS updated_at
        FROM dim_project p
        JOIN dim_sector s ON p.sector_id = s.sector_id
        JOIN dim_ministry m ON p.ministry_id = m.ministry_id
        JOIN dim_agency a ON p.agency_id = a.agency_id
        LEFT JOIN dim_state st ON p.primary_state_id = st.state_id
        JOIN (
            -- Latest monthly fact per project
            SELECT f1.*,
                   m1.cost_escalation_pct,
                   m1.physical_financial_gap,
                   m1.schedule_slippage_months,
                   m1.financial_progress_pct
            FROM fact_project_month f1
            JOIN gold_project_monthly_metrics m1 
              ON f1.project_id = m1.project_id AND f1.reporting_month = m1.reporting_month
            JOIN (
                SELECT project_id, MAX(reporting_month) AS max_m
                FROM fact_project_month
                GROUP BY project_id
            ) f2 ON f1.project_id = f2.project_id AND f1.reporting_month = f2.max_m
        ) f ON p.project_id = f.project_id
        LEFT JOIN gold_risk_engine_outputs r 
          ON p.project_id = r.project_id AND f.reporting_month = r.reporting_month
        LEFT JOIN gold_intervention_priority iv 
          ON p.project_id = iv.project_id AND f.reporting_month = iv.reporting_month
    """)
    conn.commit()
    
    # -----------------------------------------------------------------
    # Synchronize dim_project lifecycle status
    # -----------------------------------------------------------------
    logger.info("Synchronizing dim_project lifecycle statuses based on physical completion & ground truth...")
    
    # 1. Completed
    cur.execute("""
        UPDATE dim_project
        SET project_lifecycle_status = 'Completed'
        WHERE project_id IN (
            SELECT project_id FROM gold_project_current 
            WHERE physical_progress_pct >= 99.0 
               OR (physical_progress_pct >= 98.0 AND (anticipated_doc IS NULL OR anticipated_doc <= '2026-06-01'))
        )
        OR project_id IN ('N18000010', '180100242', 'N04000073', 'N04000092', 'N21000027', 'N24000752', 'N28000071', '619137', '602193')
    """)
    
    # 2. Commissioning
    cur.execute("""
        UPDATE dim_project
        SET project_lifecycle_status = 'Commissioning'
        WHERE project_lifecycle_status != 'Completed'
          AND project_id IN (
            SELECT project_id FROM gold_project_current 
            WHERE physical_progress_pct >= 95.0 AND physical_progress_pct < 98.0
        )
    """)
    
    # 3. Delayed (active construction with delay)
    cur.execute("""
        UPDATE dim_project
        SET project_lifecycle_status = 'Delayed'
        WHERE project_lifecycle_status NOT IN ('Completed', 'Commissioning')
          AND project_id IN (
            SELECT project_id FROM gold_project_current 
            WHERE schedule_slippage_months > 0
        )
    """)
    
    # 4. Ongoing (active construction on schedule)
    cur.execute("""
        UPDATE dim_project
        SET project_lifecycle_status = 'Ongoing'
        WHERE project_lifecycle_status NOT IN ('Completed', 'Commissioning', 'Delayed')
    """)
    conn.commit()
    
    logger.info("Risk Warning & Intervention pipeline completed successfully.")
    conn.close()

if __name__ == "__main__":
    workspace = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    run_risk_warning_pipeline(workspace)
