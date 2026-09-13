-- ====================================================================
-- PAIMANA-INTEL CANONICAL DATABASE SCHEMA
-- Author: PAIMANA-INTEL Lead Data Architect & Engineer
-- Database: SQLite 3 / PostgreSQL Compatible
-- ====================================================================

-- Enable Foreign Keys
PRAGMA foreign_keys = ON;

-- --------------------------------------------------------------------
-- 1. ETL AUDITING & PROVENANCE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS etl_runs (
    run_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pipeline_version TEXT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status TEXT NOT NULL, -- RUNNING, SUCCESS, FAILED
    records_extracted INTEGER DEFAULT 0,
    records_loaded INTEGER DEFAULT 0,
    validation_errors INTEGER DEFAULT 0,
    validation_warnings INTEGER DEFAULT 0,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS source_documents (
    source_id TEXT PRIMARY KEY,
    source_name TEXT NOT NULL,
    repository_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    source_category TEXT NOT NULL, -- PROJECT_MONITORING, SECTOR_PERFORMANCE, EXTERNAL
    reporting_period TEXT NOT NULL, -- e.g. 'JULY 2025'
    reporting_month TEXT NOT NULL,  -- e.g. '2025-07'
    reporting_date DATE NOT NULL,   -- e.g. '2025-07-31'
    content_hash TEXT NOT NULL,
    page_count INTEGER NOT NULL,
    ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quarantine_records (
    quarantine_id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id TEXT NOT NULL,
    raw_project_code TEXT,
    raw_project_name TEXT,
    error_severity TEXT NOT NULL, -- ERROR, WARNING, INFO
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    raw_payload TEXT,
    resolution_status TEXT DEFAULT 'PENDING_REVIEW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES source_documents(source_id)
);

-- --------------------------------------------------------------------
-- 2. CANONICAL DIMENSIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dim_sector (
    sector_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_name TEXT UNIQUE NOT NULL,
    sector_category TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dim_ministry (
    ministry_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ministry_name TEXT UNIQUE NOT NULL,
    department_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dim_agency (
    agency_id INTEGER PRIMARY KEY AUTOINCREMENT,
    agency_name TEXT NOT NULL,
    agency_abbr TEXT,
    ministry_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ministry_id) REFERENCES dim_ministry(ministry_id)
);

CREATE TABLE IF NOT EXISTS dim_state (
    state_id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_name TEXT UNIQUE NOT NULL,
    region TEXT, -- North, South, East, West, Central, North-East, Multi-States
    is_northeast INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Entity Table for Projects
CREATE TABLE IF NOT EXISTS dim_project (
    project_id TEXT PRIMARY KEY, -- Canonical MoSPI Project Code (e.g. '612786', 'N24001251')
    legacy_ocms_code TEXT,
    pmgid TEXT,
    canonical_project_name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    sector_id INTEGER,
    ministry_id INTEGER,
    agency_id INTEGER,
    primary_state_id INTEGER,
    is_multi_state INTEGER DEFAULT 0,
    original_approval_date DATE,
    actual_start_date DATE,
    original_doc DATE,
    original_cost_cr REAL,
    first_monitored_month TEXT,
    latest_monitored_month TEXT,
    project_lifecycle_status TEXT DEFAULT 'Ongoing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sector_id) REFERENCES dim_sector(sector_id),
    FOREIGN KEY (ministry_id) REFERENCES dim_ministry(ministry_id),
    FOREIGN KEY (agency_id) REFERENCES dim_agency(agency_id),
    FOREIGN KEY (primary_state_id) REFERENCES dim_state(state_id)
);

-- Project State Bridge for Multi-State Attribution
CREATE TABLE IF NOT EXISTS bridge_project_state (
    project_id TEXT NOT NULL,
    state_id INTEGER NOT NULL,
    association_type TEXT DEFAULT 'PRIMARY', -- PRIMARY, PARTICIPATING
    allocated_pct REAL,
    allocated_cost_cr REAL,
    PRIMARY KEY (project_id, state_id),
    FOREIGN KEY (project_id) REFERENCES dim_project(project_id),
    FOREIGN KEY (state_id) REFERENCES dim_state(state_id)
);

-- --------------------------------------------------------------------
-- 3. CANONICAL FACT PROJECT-MONTH (HISTORICAL MONITORING SPINE)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fact_project_month (
    fact_id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    reporting_month TEXT NOT NULL, -- YYYY-MM (e.g. '2025-07')
    reporting_date DATE NOT NULL,  -- YYYY-MM-DD
    fiscal_year TEXT NOT NULL,     -- e.g. '2025-26'
    observation_status TEXT NOT NULL, -- OBSERVED, MISSING, NOT_REPORTED, NOT_APPLICABLE
    source_id TEXT,
    source_page INTEGER,
    
    -- Costs in Rs. Crore
    original_cost_cr REAL,
    revised_cost_cr REAL,
    anticipated_cost_cr REAL,
    cumulative_expenditure_cr REAL,
    
    -- Progress & Dates
    physical_progress_pct REAL,
    approval_date DATE,
    start_date DATE,
    original_doc DATE,
    revised_doc DATE,
    anticipated_doc DATE,
    
    -- Raw values for provenance
    raw_cost_str TEXT,
    raw_doc_str TEXT,
    raw_progress_str TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, reporting_month),
    FOREIGN KEY (project_id) REFERENCES dim_project(project_id),
    FOREIGN KEY (source_id) REFERENCES source_documents(source_id)
);

-- --------------------------------------------------------------------
-- 4. ANALYTICAL GOLD METRICS (WHOLE COMPUTATIONAL STACK PARTS A-G)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gold_project_monthly_metrics (
    project_id TEXT NOT NULL,
    reporting_month TEXT NOT NULL,
    
    -- Part A: Durations
    duration_planned_months REAL,
    duration_elapsed_months REAL,
    duration_remaining_months REAL,
    time_elapsed_pct REAL,
    time_remaining_pct REAL,
    
    -- Part B: Cost
    cost_escalation_cr REAL,
    cost_escalation_pct REAL,
    cost_growth_factor REAL,
    expenditure_pct REAL,
    remaining_financial_exposure_cr REAL,
    
    -- Part C: Progress & Divergence
    financial_progress_pct REAL,
    physical_financial_gap REAL,
    
    -- Part D: Planned vs Actual
    expected_baseline_progress_pct REAL,
    progress_deviation REAL,
    progress_completion_ratio REAL,
    
    -- Part E: Velocities (Computed across actual elapsed months!)
    months_elapsed_since_prev_obs REAL,
    progress_velocity_pct_per_month REAL,
    expenditure_velocity_cr_per_month REAL,
    progress_acceleration REAL,
    expenditure_acceleration REAL,
    
    -- Part F: Trajectory & Rolling Stats
    progress_3m_delta REAL,
    progress_6m_delta REAL,
    expenditure_3m_delta REAL,
    rolling_avg_progress_3m REAL,
    rolling_avg_expenditure_3m REAL,
    progress_volatility_3m REAL,
    
    -- Part G: Schedule Slippage
    schedule_slippage_months REAL,
    schedule_slippage_pct REAL,
    is_schedule_delayed INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, reporting_month),
    FOREIGN KEY (project_id) REFERENCES dim_project(project_id)
);

-- --------------------------------------------------------------------
-- 5. RISK ENGINE, WARNING ENGINE & INTERVENTIONS (PARTS 72-92)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gold_risk_engine_outputs (
    project_id TEXT NOT NULL,
    reporting_month TEXT NOT NULL,
    cost_risk_score REAL NOT NULL,      -- 0 - 100
    schedule_risk_score REAL NOT NULL,  -- 0 - 100
    progress_risk_score REAL NOT NULL,  -- 0 - 100
    overall_risk_score REAL NOT NULL,   -- 0 - 100 weighted
    risk_band TEXT NOT NULL,            -- Low, Moderate, High, Critical
    risk_change_from_prev REAL,
    risk_trajectory TEXT NOT NULL,      -- Improving, Stable, Deteriorating
    model_version TEXT DEFAULT 'V1.0_DETERMINISTIC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, reporting_month),
    FOREIGN KEY (project_id) REFERENCES dim_project(project_id)
);

CREATE TABLE IF NOT EXISTS gold_warning_alerts (
    warning_id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    reporting_month TEXT NOT NULL,
    warning_type TEXT NOT NULL,    -- COST_OVERRUN, SCHEDULE_SLIPPAGE, STAGNATION, GAP_DIVERGENCE, EXPOSURE
    severity TEXT NOT NULL,        -- Critical, High, Moderate, Low
    trigger_rule TEXT NOT NULL,
    trigger_value REAL,
    threshold_value REAL,
    persistence_months INTEGER DEFAULT 1,
    status TEXT DEFAULT 'Active',  -- Active, Resolved, Monitoring
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES dim_project(project_id)
);

CREATE TABLE IF NOT EXISTS gold_intervention_priority (
    project_id TEXT NOT NULL,
    reporting_month TEXT NOT NULL,
    intervention_priority_score REAL NOT NULL, -- 0 - 100
    intervention_rank INTEGER,
    action_category TEXT NOT NULL,             -- Milestone Recovery, Cost Audit, Agency Escalation, Inter-Ministerial
    recommended_action TEXT NOT NULL,
    action_evidence TEXT NOT NULL,
    responsible_authority TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, reporting_month),
    FOREIGN KEY (project_id) REFERENCES dim_project(project_id)
);

-- --------------------------------------------------------------------
-- 6. CURRENT PROJECT SNAPSHOT VIEW (FOR BACKEND & FRONTEND)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gold_project_current (
    project_id TEXT PRIMARY KEY,
    project_name TEXT NOT NULL,
    sector_name TEXT,
    ministry_name TEXT,
    agency_name TEXT,
    state_name TEXT,
    is_multi_state INTEGER,
    original_cost_cr REAL,
    latest_revised_cost_cr REAL,
    cumulative_expenditure_cr REAL,
    physical_progress_pct REAL,
    financial_progress_pct REAL,
    physical_financial_gap REAL,
    cost_escalation_pct REAL,
    original_doc DATE,
    anticipated_doc DATE,
    schedule_slippage_months REAL,
    overall_risk_score REAL,
    risk_band TEXT,
    risk_trajectory TEXT,
    active_warning_count INTEGER DEFAULT 0,
    intervention_priority_score REAL,
    intervention_recommendation TEXT,
    latest_reporting_month TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 7. SECTOR PERFORMANCE (FROM 13 REVIEW REPORTS) & EXTERNAL MACRO DATA
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fact_sector_performance (
    perf_id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporting_period TEXT NOT NULL,
    reporting_month TEXT NOT NULL,
    sector_name TEXT NOT NULL,
    indicator_name TEXT NOT NULL,
    unit TEXT,
    monthly_target REAL,
    monthly_actual REAL,
    monthly_achievement_pct REAL,
    source_id TEXT,
    source_page INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fact_external_macro_index (
    macro_id INTEGER PRIMARY KEY AUTOINCREMENT,
    index_month TEXT NOT NULL, -- YYYY-MM
    index_type TEXT NOT NULL,  -- WPI, OPPI, IPPI, SPPI
    commodity_or_sector TEXT NOT NULL,
    index_value REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 8. ML FEATURE SNAPSHOTS & TARGET DATASETS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ml_dataset_master (
    row_id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    snapshot_month TEXT NOT NULL,
    dataset_split TEXT NOT NULL, -- train, val, test
    
    -- As-Of Dynamic Features (Strictly knowable <= snapshot_month)
    time_elapsed_pct REAL,
    time_remaining_pct REAL,
    cost_escalation_pct REAL,
    cost_growth_factor REAL,
    expenditure_pct REAL,
    physical_progress_pct REAL,
    financial_progress_pct REAL,
    physical_financial_gap REAL,
    progress_deviation REAL,
    progress_velocity REAL,
    expenditure_velocity REAL,
    progress_3m_delta REAL,
    schedule_slippage_months REAL,
    overall_risk_score REAL,
    active_warnings_count INTEGER,
    
    -- Categorical Static Features
    sector_name TEXT,
    ministry_name TEXT,
    agency_name TEXT,
    state_name TEXT,
    
    -- Future Target Labels (For completed/observable future outcomes)
    target_cost_overrun_binary INTEGER, -- 1 if future overrun > 5%, else 0
    target_final_cost_cr REAL,
    target_cost_overrun_amount_cr REAL,
    target_cost_overrun_pct REAL,
    target_schedule_overrun_binary INTEGER, -- 1 if future delay > 3 months, else 0
    target_delay_months REAL,
    
    -- Censoring & Audit Flags
    is_censored INTEGER DEFAULT 0,
    target_observation_month TEXT,
    feature_version TEXT DEFAULT 'v1.0',
    target_version TEXT DEFAULT 'v1.0',
    leakage_check_passed INTEGER DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, snapshot_month)
);

-- --------------------------------------------------------------------
-- 9. PERFORMANCE INDEXES
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_fpm_proj_month ON fact_project_month(project_id, reporting_month);
CREATE INDEX IF NOT EXISTS idx_fpm_month ON fact_project_month(reporting_month);
CREATE INDEX IF NOT EXISTS idx_proj_sector ON dim_project(sector_id);
CREATE INDEX IF NOT EXISTS idx_proj_ministry ON dim_project(ministry_id);
CREATE INDEX IF NOT EXISTS idx_proj_state ON dim_project(primary_state_id);
CREATE INDEX IF NOT EXISTS idx_gold_risk ON gold_risk_engine_outputs(risk_band, overall_risk_score);
CREATE INDEX IF NOT EXISTS idx_gold_warning ON gold_warning_alerts(project_id, status);
CREATE INDEX IF NOT EXISTS idx_ml_split ON ml_dataset_master(dataset_split, is_censored);
