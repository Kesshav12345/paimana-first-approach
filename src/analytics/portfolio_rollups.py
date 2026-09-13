import os
import sys
import sqlite3
import json
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("portfolio_rollups")

def build_portfolio_rollups(workspace_dir: str):
    db_path = os.path.join(workspace_dir, "paimana_canonical.db")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    logger.info("Computing Portfolio, Sector, Ministry, and State weighted aggregations...")
    
    # Create views/tables for aggregations
    cur.execute("DROP TABLE IF EXISTS gold_portfolio_summary")
    cur.execute("""
        CREATE TABLE gold_portfolio_summary AS
        SELECT 
            COUNT(DISTINCT project_id) AS total_projects,
            ROUND(SUM(original_cost_cr), 2) AS total_original_cost_cr,
            ROUND(SUM(latest_revised_cost_cr), 2) AS total_revised_cost_cr,
            ROUND(SUM(cumulative_expenditure_cr), 2) AS total_expenditure_cr,
            ROUND(((SUM(latest_revised_cost_cr) - SUM(original_cost_cr)) / SUM(original_cost_cr)) * 100.0, 2) AS weighted_cost_escalation_pct,
            ROUND((SUM(cumulative_expenditure_cr) / SUM(latest_revised_cost_cr)) * 100.0, 2) AS weighted_expenditure_pct,
            ROUND(AVG(physical_progress_pct), 2) AS unweighted_avg_physical_progress_pct,
            SUM(CASE WHEN risk_band = 'Critical' THEN 1 ELSE 0 END) AS critical_risk_projects,
            SUM(CASE WHEN risk_band = 'High' THEN 1 ELSE 0 END) AS high_risk_projects,
            SUM(CASE WHEN risk_band IN ('High', 'Critical') THEN 1 ELSE 0 END) AS total_requiring_attention,
            SUM(CASE WHEN schedule_slippage_months > 0 THEN 1 ELSE 0 END) AS delayed_projects,
            SUM(active_warning_count) AS total_active_warnings,
            CURRENT_TIMESTAMP AS computed_at
        FROM gold_project_current
    """)
    
    cur.execute("DROP TABLE IF EXISTS gold_sector_summary")
    cur.execute("""
        CREATE TABLE gold_sector_summary AS
        SELECT 
            sector_name,
            COUNT(DISTINCT project_id) AS project_count,
            ROUND(SUM(original_cost_cr), 2) AS total_original_cost_cr,
            ROUND(SUM(latest_revised_cost_cr), 2) AS total_revised_cost_cr,
            ROUND(SUM(cumulative_expenditure_cr), 2) AS total_expenditure_cr,
            ROUND(((SUM(latest_revised_cost_cr) - SUM(original_cost_cr)) / SUM(original_cost_cr)) * 100.0, 2) AS weighted_cost_escalation_pct,
            ROUND((SUM(cumulative_expenditure_cr) / SUM(latest_revised_cost_cr)) * 100.0, 2) AS weighted_expenditure_pct,
            ROUND(AVG(physical_progress_pct), 2) AS avg_physical_progress_pct,
            ROUND(AVG(schedule_slippage_months), 1) AS avg_delay_months,
            SUM(CASE WHEN risk_band IN ('High', 'Critical') THEN 1 ELSE 0 END) AS projects_requiring_attention,
            SUM(active_warning_count) AS total_warnings
        FROM gold_project_current
        GROUP BY sector_name
        ORDER BY total_revised_cost_cr DESC
    """)
    
    cur.execute("DROP TABLE IF EXISTS gold_ministry_summary")
    cur.execute("""
        CREATE TABLE gold_ministry_summary AS
        SELECT 
            ministry_name,
            COUNT(DISTINCT project_id) AS project_count,
            ROUND(SUM(original_cost_cr), 2) AS total_original_cost_cr,
            ROUND(SUM(latest_revised_cost_cr), 2) AS total_revised_cost_cr,
            ROUND(SUM(cumulative_expenditure_cr), 2) AS total_expenditure_cr,
            ROUND(((SUM(latest_revised_cost_cr) - SUM(original_cost_cr)) / SUM(original_cost_cr)) * 100.0, 2) AS weighted_cost_escalation_pct,
            ROUND((SUM(cumulative_expenditure_cr) / SUM(latest_revised_cost_cr)) * 100.0, 2) AS weighted_expenditure_pct,
            ROUND(AVG(physical_progress_pct), 2) AS avg_physical_progress_pct,
            ROUND(AVG(schedule_slippage_months), 1) AS avg_delay_months,
            SUM(CASE WHEN UPPER(risk_band) IN ('HIGH', 'CRITICAL') THEN 1 ELSE 0 END) AS projects_requiring_attention,
            SUM(active_warning_count) AS total_warnings
        FROM gold_project_current
        GROUP BY ministry_name
        ORDER BY total_revised_cost_cr DESC
    """)
    
    cur.execute("DROP TABLE IF EXISTS gold_state_summary")
    cur.execute("""
        CREATE TABLE gold_state_summary AS
        SELECT 
            COALESCE(st.state_name, c.state_name, 'Multi-State') AS state_name,
            COUNT(DISTINCT c.project_id) AS project_count,
            ROUND(SUM(COALESCE(b.allocated_cost_cr, c.original_cost_cr)), 2) AS allocated_cost_cr,
            ROUND(SUM(c.latest_revised_cost_cr), 2) AS total_project_value_cr,
            ROUND(SUM(c.cumulative_expenditure_cr), 2) AS total_expenditure_cr,
            ROUND(AVG(c.physical_progress_pct), 2) AS avg_physical_progress_pct,
            SUM(CASE WHEN UPPER(c.risk_band) IN ('HIGH', 'CRITICAL') THEN 1 ELSE 0 END) AS projects_requiring_attention,
            SUM(c.active_warning_count) AS total_warnings
        FROM gold_project_current c
        LEFT JOIN bridge_project_state b ON c.project_id = b.project_id
        LEFT JOIN dim_state st ON b.state_id = st.state_id
        GROUP BY COALESCE(st.state_name, c.state_name, 'Multi-State')
        ORDER BY allocated_cost_cr DESC
    """)
    
    conn.commit()
    
    # Print Portfolio KPI Summary
    cur.execute("SELECT * FROM gold_portfolio_summary")
    res = cur.fetchone()
    logger.info("=======================================================")
    logger.info("PORTFOLIO KPI SUMMARY (GOLD TRUTH):")
    logger.info(f"  Total Projects Monitored     : {res[0]:,}")
    logger.info(f"  Total Approved Cost Baseline : Rs. {res[1]:,.2f} Cr")
    logger.info(f"  Total Revised Cost           : Rs. {res[2]:,.2f} Cr")
    logger.info(f"  Total Cumulative Expenditure : Rs. {res[3]:,.2f} Cr")
    logger.info(f"  Weighted Cost Escalation %   : +{res[4]:.2f}%")
    logger.info(f"  Weighted Expenditure %       : {res[5]:.2f}%")
    logger.info(f"  Average Physical Progress    : {res[6]:.2f}%")
    logger.info(f"  Projects Requiring Attention : {res[9]:,} ({res[7]} Critical, {res[8]} High Risk)")
    logger.info(f"  Delayed Projects             : {res[10]:,}")
    logger.info(f"  Active Warnings              : {res[11]:,}")
    logger.info("=======================================================")
    
    conn.close()

if __name__ == "__main__":
    build_portfolio_rollups(r"c:\Users\kessh\OneDrive\Documents\paimana first approach")
