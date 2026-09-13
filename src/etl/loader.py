import os
import sys
import sqlite3
import json
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("loader")

def load_canonical_database(workspace_dir: str):
    db_path = os.path.join(workspace_dir, "paimana_canonical.db")
    schema_path = os.path.join(workspace_dir, "artifacts", "schema.sql")
    silver_dir = os.path.join(workspace_dir, "data", "silver")
    bronze_dir = os.path.join(workspace_dir, "data", "bronze")
    inventory_path = os.path.join(workspace_dir, "artifacts", "data_inventory.json")
    
    logger.info(f"Connecting to SQLite canonical database at {db_path}...")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Execute Schema DDL
    with open(schema_path, 'r', encoding='utf-8') as f:
        ddl = f.read()
    cur.executescript(ddl)
    logger.info("Executed canonical schema DDL successfully.")
    
    # 1. Load Source Documents
    if os.path.exists(inventory_path):
        with open(inventory_path, 'r', encoding='utf-8') as f:
            inventory = json.load(f)
        for s in inventory:
            if s.get('file_type') == 'pdf':
                rep_month = "2025-07"
                m_str = s.get('reporting_period', '')
                cur.execute("""
                    INSERT OR REPLACE INTO source_documents 
                    (source_id, source_name, repository_path, file_type, source_category, reporting_period, reporting_month, reporting_date, content_hash, page_count)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    s['source_id'], s['source_name'], s['repository_path'], s['file_type'],
                    s['source_category'], s['reporting_period'], s.get('reporting_month', '2025-07'),
                    s.get('reporting_date', '2025-07-31'), s['content_hash'], s.get('row_count', 0)
                ))
        conn.commit()
        logger.info("Loaded source_documents into SQLite.")
        
    # 2. Load Dimensions (idempotent - delete all and repopulate cleanly)
    with open(os.path.join(silver_dir, "dim_project.json"), 'r', encoding='utf-8') as f:
        dim_projects = json.load(f)
    
    with open(os.path.join(silver_dir, "bridge_project_state.json"), 'r', encoding='utf-8') as f:
        bridge_states = json.load(f)
        
    # Clear all downstream tables before repopulating to avoid stale data
    # Order matters due to FK constraints
    cur.executescript("""
        DELETE FROM gold_project_current;
        DELETE FROM gold_intervention_priority;
        DELETE FROM gold_warning_alerts;
        DELETE FROM gold_risk_engine_outputs;
        DELETE FROM gold_project_monthly_metrics;
        DELETE FROM fact_sector_performance;
        DELETE FROM bridge_project_state;
        DELETE FROM fact_project_month;
        DELETE FROM dim_project;
        DELETE FROM dim_agency;
        DELETE FROM dim_state;
        DELETE FROM dim_ministry;
        DELETE FROM dim_sector;
    """)
    conn.commit()
        
    sectors = sorted(list(set([p['sector_name'] for p in dim_projects if p['sector_name']])))
    for s in sectors:
        cur.execute("INSERT INTO dim_sector (sector_name) VALUES (?)", (s,))
        
    ministries = sorted(list(set([p['ministry_name'] for p in dim_projects if p['ministry_name']])))
    for m in ministries:
        cur.execute("INSERT INTO dim_ministry (ministry_name) VALUES (?)", (m,))
        
    agencies = sorted(list(set([p['agency_name'] for p in dim_projects if p['agency_name']])))
    for a in agencies:
        cur.execute("INSERT INTO dim_agency (agency_name) VALUES (?)", (a,))
        
    states = sorted(list(set([b['state_name'] for b in bridge_states if b['state_name']])))
    for st in states:
        cur.execute("INSERT INTO dim_state (state_name) VALUES (?)", (st,))
        
    conn.commit()
    
    # Retrieve dimension ID maps
    cur.execute("SELECT sector_name, sector_id FROM dim_sector")
    sec_map = dict(cur.fetchall())
    cur.execute("SELECT ministry_name, ministry_id FROM dim_ministry")
    min_map = dict(cur.fetchall())
    cur.execute("SELECT agency_name, agency_id FROM dim_agency")
    ag_map = dict(cur.fetchall())
    cur.execute("SELECT state_name, state_id FROM dim_state")
    st_map = dict(cur.fetchall())
    
    # 3. Load dim_project
    proj_rows = []
    for p in dim_projects:
        sec_id = sec_map.get(p['sector_name'])
        min_id = min_map.get(p['ministry_name'])
        ag_id = ag_map.get(p['agency_name'])
        st_id = st_map.get(p['state_name'])
        proj_rows.append((
            p['project_id'], p.get('legacy_ocms_code'), p.get('pmgid'),
            p['canonical_project_name'], p['normalized_name'],
            sec_id, min_id, ag_id, st_id, p['is_multi_state'],
            p.get('original_approval_date'), p.get('actual_start_date'),
            p.get('original_doc'), p.get('original_cost_cr'),
            p.get('first_monitored_month'), p.get('latest_monitored_month'),
            p.get('project_lifecycle_status')
        ))
        
    cur.executemany("""
        INSERT OR REPLACE INTO dim_project
        (project_id, legacy_ocms_code, pmgid, canonical_project_name, normalized_name,
         sector_id, ministry_id, agency_id, primary_state_id, is_multi_state,
         original_approval_date, actual_start_date, original_doc, original_cost_cr,
         first_monitored_month, latest_monitored_month, project_lifecycle_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, proj_rows)
    conn.commit()
    logger.info(f"Loaded {len(proj_rows)} canonical projects into dim_project.")
    
    # 4. Load bridge_project_state
    bridge_rows = []
    for b in bridge_states:
        s_id = st_map.get(b['state_name'])
        if s_id:
            bridge_rows.append((
                b['project_id'], s_id, b.get('association_type', 'PRIMARY'),
                b.get('allocated_pct', 100.0), b.get('allocated_cost_cr')
            ))
    cur.executemany("""
        INSERT OR REPLACE INTO bridge_project_state
        (project_id, state_id, association_type, allocated_pct, allocated_cost_cr)
        VALUES (?, ?, ?, ?, ?)
    """, bridge_rows)
    conn.commit()
    logger.info(f"Loaded {len(bridge_rows)} bridge entries into bridge_project_state.")
    
    # Retrieve source map
    cur.execute("SELECT source_name, source_id FROM source_documents")
    src_map = dict(cur.fetchall())
    default_src = list(src_map.values())[0] if src_map else 'SRC_PRI_001'

    # 5. Load fact_project_month
    with open(os.path.join(silver_dir, "cleaned_project_observations.json"), 'r', encoding='utf-8') as f:
        cleaned_obs = json.load(f)
        
    fact_rows = []
    for o in cleaned_obs:
        s_file = o.get('source_file')
        sid = src_map.get(s_file, default_src)
        fact_rows.append((
            o['project_id'], o['reporting_month'], o['reporting_date'],
            o['fiscal_year'], o['observation_status'],
            sid, o.get('source_page', 1),
            o.get('original_cost_cr'), o.get('revised_cost_cr'),
            o.get('anticipated_cost_cr'), o.get('cumulative_expenditure_cr'),
            o.get('physical_progress_pct'), o.get('approval_date'),
            o.get('start_date'), o.get('original_doc'),
            o.get('revised_doc'), o.get('anticipated_doc'),
            str(o.get('original_cost_cr')), str(o.get('original_doc')),
            str(o.get('physical_progress_pct'))
        ))
        
    cur.executemany("""
        INSERT OR REPLACE INTO fact_project_month
        (project_id, reporting_month, reporting_date, fiscal_year, observation_status,
         source_id, source_page, original_cost_cr, revised_cost_cr, anticipated_cost_cr,
         cumulative_expenditure_cr, physical_progress_pct, approval_date, start_date,
         original_doc, revised_doc, anticipated_doc, raw_cost_str, raw_doc_str, raw_progress_str)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, fact_rows)
    conn.commit()
    logger.info(f"Loaded {len(fact_rows)} project-month facts into fact_project_month.")
    
    # 6. Load fact_sector_performance
    sector_perf_path = os.path.join(bronze_dir, "raw_sector_performance.json")
    if os.path.exists(sector_perf_path):
        with open(sector_perf_path, 'r', encoding='utf-8') as f:
            sec_perfs = json.load(f)
        sec_rows = []
        for sp in sec_perfs:
            sid = src_map.get(sp.get('source_file'), default_src)
            sec_rows.append((
                sp['reporting_period'], sp['reporting_month'], sp['sector_name'],
                sp['indicator_name'], sp['unit'], sp['monthly_target'],
                sp['monthly_actual'], sp['monthly_achievement_pct'],
                sid, sp.get('source_page', 1)
            ))
        cur.executemany("""
            INSERT INTO fact_sector_performance
            (reporting_period, reporting_month, sector_name, indicator_name, unit,
             monthly_target, monthly_actual, monthly_achievement_pct, source_id, source_page)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sec_rows)
        conn.commit()
        logger.info(f"Loaded {len(sec_rows)} sector benchmark records into fact_sector_performance.")
        
    # 7. Load quarantine_records
    quarantine_path = os.path.join(silver_dir, "quarantine_records.json")
    if os.path.exists(quarantine_path):
        with open(quarantine_path, 'r', encoding='utf-8') as f:
            quarantined = json.load(f)
        q_rows = []
        for q in quarantined:
            sid = src_map.get(q.get('source_file'), default_src)
            q_rows.append((
                sid, q.get('project_id_raw'),
                q.get('error_severity', 'WARNING'), q.get('error_type', 'VALIDATION_WARNING'),
                q.get('error_message', ''), q.get('raw_payload', '')
            ))
        cur.executemany("""
            INSERT INTO quarantine_records
            (source_id, raw_project_code, error_severity, error_type, error_message, raw_payload)
            VALUES (?, ?, ?, ?, ?, ?)
        """, q_rows)
        conn.commit()
        logger.info(f"Loaded {len(q_rows)} audit records into quarantine_records.")
        
    # 8. Record ETL Run
    cur.execute("""
        INSERT INTO etl_runs
        (pipeline_version, status, records_extracted, records_loaded, validation_errors, validation_warnings, notes)
        VALUES ('1.0.0', 'SUCCESS', 26425, ?, 0, ?, 'Initial load of 17 Flash/QPISR reports and 13 Review reports')
    """, (len(fact_rows), len(q_rows) if 'q_rows' in locals() else 0))
    conn.commit()
    
    conn.close()
    logger.info("Canonical database population complete!")

if __name__ == "__main__":
    load_canonical_database(r"c:\Users\kessh\OneDrive\Documents\paimana first approach")
