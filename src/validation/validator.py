import os
import sys
import sqlite3
import json
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("validator")

def run_validation_checks(workspace_dir: str):
    db_path = os.path.join(workspace_dir, "paimana_canonical.db")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    logger.info("Executing comprehensive automated validation checks on canonical database...")
    
    results = []
    
    # 1. Structural & Entity Integrity Checks
    cur.execute("SELECT COUNT(*), COUNT(DISTINCT project_id) FROM dim_project")
    total_proj, dist_proj = cur.fetchone()
    chk_proj_pk = (total_proj == dist_proj) and total_proj > 0
    results.append({
        "check_id": "VAL_STRUCT_01",
        "category": "Entity Integrity",
        "description": "Primary key uniqueness on dim_project(project_id)",
        "status": "PASS" if chk_proj_pk else "FAIL",
        "observed_value": f"{total_proj} rows, {dist_proj} distinct",
        "severity": "CRITICAL"
    })
    
    cur.execute("SELECT COUNT(*), COUNT(DISTINCT project_id || '_' || reporting_month) FROM fact_project_month")
    total_fpm, dist_fpm = cur.fetchone()
    chk_fpm_grain = (total_fpm == dist_fpm) and total_fpm > 0
    results.append({
        "check_id": "VAL_STRUCT_02",
        "category": "Grain Integrity",
        "description": "Composite grain uniqueness on fact_project_month(project_id, reporting_month)",
        "status": "PASS" if chk_fpm_grain else "FAIL",
        "observed_value": f"{total_fpm} facts, {dist_fpm} distinct grain pairs",
        "severity": "CRITICAL"
    })
    
    # 2. Orphan Records Check (Referential Integrity)
    cur.execute("""
        SELECT COUNT(*) FROM fact_project_month f
        LEFT JOIN dim_project p ON f.project_id = p.project_id
        WHERE p.project_id IS NULL
    """)
    orphan_fpm = cur.fetchone()[0]
    results.append({
        "check_id": "VAL_REF_01",
        "category": "Referential Integrity",
        "description": "Zero orphan facts in fact_project_month without matching dim_project",
        "status": "PASS" if orphan_fpm == 0 else "FAIL",
        "observed_value": f"{orphan_fpm} orphan records",
        "severity": "CRITICAL"
    })
    
    # 3. Numeric Bounds Checks
    cur.execute("""
        SELECT COUNT(*) FROM fact_project_month
        WHERE physical_progress_pct < 0.0 OR physical_progress_pct > 100.0
    """)
    inv_prog = cur.fetchone()[0]
    results.append({
        "check_id": "VAL_NUM_01",
        "category": "Numeric Validity",
        "description": "Physical progress percentage strictly bounded in [0.0, 100.0]",
        "status": "PASS" if inv_prog == 0 else "FAIL",
        "observed_value": f"{inv_prog} out-of-bounds records",
        "severity": "HIGH"
    })
    
    cur.execute("""
        SELECT COUNT(*) FROM fact_project_month
        WHERE original_cost_cr < 0.0 OR revised_cost_cr < 0.0 OR cumulative_expenditure_cr < 0.0
    """)
    neg_costs = cur.fetchone()[0]
    results.append({
        "check_id": "VAL_NUM_02",
        "category": "Numeric Validity",
        "description": "Zero negative monetary values in costs or cumulative expenditure",
        "status": "PASS" if neg_costs == 0 else "FAIL",
        "observed_value": f"{neg_costs} negative records",
        "severity": "HIGH"
    })
    
    # 4. Temporal Consistency Checks
    cur.execute("""
        SELECT COUNT(*) FROM fact_project_month
        WHERE approval_date IS NOT NULL AND original_doc IS NOT NULL AND approval_date > original_doc
    """)
    inv_date_order = cur.fetchone()[0]
    results.append({
        "check_id": "VAL_TEMP_01",
        "category": "Temporal Consistency",
        "description": "Sanction/Approval Date precedes Original Date of Commissioning",
        "status": "PASS" if inv_date_order == 0 else "WARNING",
        "observed_value": f"{inv_date_order} chronological inconsistencies",
        "severity": "MEDIUM"
    })
    
    # 5. Deterministic Formula Arithmetic Checks
    cur.execute("""
        SELECT COUNT(*) FROM gold_project_monthly_metrics
        WHERE cost_escalation_cr IS NOT NULL 
          AND ABS(cost_escalation_cr - (
              SELECT (revised_cost_cr - original_cost_cr) 
              FROM fact_project_month f 
              WHERE f.project_id = gold_project_monthly_metrics.project_id 
                AND f.reporting_month = gold_project_monthly_metrics.reporting_month
          )) > 0.02
    """)
    arith_mismatch = cur.fetchone()[0]
    results.append({
        "check_id": "VAL_MATH_01",
        "category": "Deterministic Arithmetic",
        "description": "Cost escalation matches exact difference between revised and original cost",
        "status": "PASS" if arith_mismatch == 0 else "FAIL",
        "observed_value": f"{arith_mismatch} arithmetic discrepancies",
        "severity": "CRITICAL"
    })
    
    # 6. Risk Engine Bounds Checks
    cur.execute("""
        SELECT COUNT(*) FROM gold_risk_engine_outputs
        WHERE overall_risk_score < 0.0 OR overall_risk_score > 100.0
    """)
    inv_risk = cur.fetchone()[0]
    results.append({
        "check_id": "VAL_RISK_01",
        "category": "Risk Engine Integrity",
        "description": "Composite risk scores strictly bounded within [0.0, 100.0]",
        "status": "PASS" if inv_risk == 0 else "FAIL",
        "observed_value": f"{inv_risk} out-of-bounds risk scores",
        "severity": "HIGH"
    })
    
    conn.close()
    
    pass_count = sum(1 for r in results if r['status'] == 'PASS')
    fail_count = sum(1 for r in results if r['status'] == 'FAIL')
    warn_count = sum(1 for r in results if r['status'] == 'WARNING')
    
    logger.info("=======================================================")
    logger.info(f"VALIDATION SUMMARY: {pass_count} PASSED | {fail_count} FAILED | {warn_count} WARNINGS")
    for r in results:
        logger.info(f"  [{r['status']}] {r['check_id']}: {r['description']} -> {r['observed_value']}")
    logger.info("=======================================================")
    
    # Save validation results JSON
    val_out = os.path.join(workspace_dir, "artifacts", "validation_report.json")
    with open(val_out, 'w', encoding='utf-8') as f:
        json.dump({
            "summary": {"pass": pass_count, "fail": fail_count, "warning": warn_count},
            "checks": results
        }, f, indent=2)
        
    return results

if __name__ == "__main__":
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    workspace = os.environ.get("WORKSPACE_DIR", repo_root)
    run_validation_checks(workspace)

