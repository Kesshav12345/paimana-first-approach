# PAIMANA-INTEL — Master ETL, Canonical Database & ML Pipeline Guide

## 1. System Architecture Overview

The PAIMANA-INTEL data pipeline transforms raw, heterogeneous infrastructure project reports (spanning MoSPI OCMS formats, modern PAIMANA web-generated formats, Sector Infrastructure Reviews, and macroeconomic indices) into a clean, normalized, provenance-preserving, temporally coherent, analytically complete, and ML-ready canonical database.

```
RAW SOURCES (30 PDFs + WPI Excel)
        │
        ▼
[1. Bronze Extraction] ───> data/bronze/raw_project_observations.json (26,425 records)
        │                   data/bronze/raw_sector_performance.json (87 records)
        ▼
[2. Silver Standardization] ─> Deduplication to unique (project_id, reporting_month)
        │                      Quarantine logging (data/silver/quarantine_records.json)
        ▼
[3. Entity Resolution] ───> Canonical Project Master (dim_project: 3,977 projects)
        │                   Multi-State Bridge (bridge_project_state: 4,209 rows)
        ▼
[4. Canonical DB Loader] ─> paimana_canonical.db (SQLite / Relational Core)
        │                   - dim_source_document (34 records)
        │                   - fact_project_month (23,724 fact rows)
        │                   - fact_external_macro_index (40 monthly WPI rows)
        ▼
[5. Deterministic Analytics] ─> gold_project_monthly_metrics (23,724 rows)
        │                       Whole Computational Stack Parts A through G
        ▼
[6. Risk & Early Warning] ─> gold_risk_engine_outputs (23,724 rows)
        │                    gold_warning_alerts (28,701 signals)
        │                    gold_intervention_priority (23,724 rows)
        │                    gold_project_current (3,977 active project master)
        ▼
[7. Portfolio Rollups] ────> Sector, Ministry, State, Portfolio aggregates
        │
        ▼
[8. ML Feature Datasets] ──> ml_dataset_master (23,724 snapshot rows)
        │                    4 Supervised CSVs (data/ml/*.csv - 18,256 uncensored)
        ▼
[9. ML Training & Eval] ───> Baselines vs CatBoost (ROC-AUC 0.99+, R² 0.85)
        │
        ▼
[10. Audits & Reports] ────> Automated Data Integrity (7 PASS, 0 FAIL)
                             Leakage Audit (6 PASS, 0 FAIL)
                             Comprehensive Quality Profile
```

---

## 2. Directory Structure

```
paimana first approach/
├── primary dataset/              # 30 Source PDFs (17 Flash Reports + 13 Sector Reviews)
├── Secondary dataset/            # Macroeconomic Wholesale Price Index (WPI) spreadsheets
├── data/
│   ├── bronze/                   # Raw parsed JSON dumps from PDFs
│   ├── silver/                   # Standardized JSON facts, project dimensions, quarantine logs
│   └── ml/                       # 4 Clean Supervised ML CSV datasets (isolated targets)
├── artifacts/                    # Machine-readable and executive governance reports
│   ├── data_inventory.csv / .json
│   ├── data_dictionary.csv / .json
│   ├── schema.sql
│   ├── project_identity_map.csv
│   ├── feature_registry.csv / .md
│   ├── target_definitions.md
│   ├── provenance_map.csv
│   ├── leakage_audit_report.md
│   ├── data_quality_report.md / metrics.json
│   ├── model_evaluation_report.md / metrics.json
│   ├── ml_readiness_report.md
│   └── ETL_README.md
├── src/
│   ├── etl/                      # Extraction, standardization, entity resolution, db loaders
│   ├── analytics/                # Deterministic metrics, risk engine, warnings, rollups
│   ├── ml/                       # Snapshot generator, model training, evaluation
│   └── validation/               # Integrity validator, leakage checker, quality profiler
├── paimana_canonical.db          # Populated production-grade SQLite canonical database
└── run_pipeline.py               # Master end-to-end orchestrator script
```

---

## 3. How to Reproduce the Entire Pipeline

To rebuild the entire database, compute all deterministic analytics, train the ML models, and generate all audit reports from scratch, execute:

```powershell
python run_pipeline.py
```

### Individual Step Execution

Each component is modular and can be executed independently:

1. **Source Discovery**: `python src/etl/inventory_sources.py`
2. **PDF Table Extraction**: `python src/etl/pdf_extractor.py` and `python src/etl/review_extractor.py`
3. **Data Standardization**: `python src/etl/standardizer.py`
4. **Entity Resolution**: `python src/etl/entity_resolver.py`
5. **Database Loading**: `python src/etl/loader.py` and `python src/etl/external_loader.py`
6. **Deterministic Analytics**: `python src/analytics/compute_metrics.py`
7. **Risk & Warning Engine**: `python src/analytics/risk_warning_intervention.py`
8. **Portfolio Rollups**: `python src/analytics/portfolio_rollups.py`
9. **ML Feature & Target Snapshots**: `python src/ml/generate_ml_datasets.py`
10. **ML Model Training & Benchmarking**: `python src/ml/train_evaluate_models.py`
11. **Automated Verification**: `python src/validation/validator.py`
12. **Automated Leakage Audit**: `python src/validation/leakage_checker.py`
13. **Data Quality Profiler**: `python src/validation/quality_profiler.py`

---

## 4. Key Governing Design Rules

1. **No Artificial Imputation**: Missing months are not zero-filled or linearly smoothed. Observations retain their genuine state (`OBSERVED`, `NOT_REPORTED`).
2. **Proper Spacing**: Velocities and deltas divide by actual calendar elapsed months between reports, preventing distortions when gaps exist.
3. **No Target Leakage**: Dynamic feature vectors at month $T$ reference only data available $\le T$.
4. **Censoring Awareness**: Unfinished projects with no observed delay are isolated via `is_censored = 1` rather than falsely labeled as negative outcomes.
5. **Weighted Aggregations**: Portfolio, sector, ministry, and state cost growth numbers are strictly computed as $\frac{\sum \text{revised} - \sum \text{original}}{\sum \text{original}}$, never by averaging percentages.
