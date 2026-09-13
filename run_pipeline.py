#!/usr/bin/env python3
"""
PAIMANA-INTEL — Master End-to-End Orchestrator Pipeline
Executes complete data engineering lifecycle:
Ingestion -> Bronze Extraction -> Standardization & Quarantine ->
Entity Resolution -> Canonical Database Loading -> Deterministic Analytics ->
Risk Engine & Early Warnings -> Portfolio Rollups -> ML Dataset Generation ->
Model Training & Evaluation -> Quality & Leakage Audits.
"""

import sys
import time
import subprocess
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("pipeline_orchestrator")

STEPS = [
    ("Source Inventory & Cataloging", "python src/etl/build_inventory.py"),
    ("Data Dictionary Generation", "python src/etl/build_data_dictionary.py"),
    ("Bronze Extraction: Project Monitoring Reports (17 PDFs)", "python src/etl/pdf_extractor.py"),
    ("Bronze Extraction: Sector Review Reports (13 PDFs)", "python src/etl/review_extractor.py"),
    ("Silver Standardization, Validation & Quarantine", "python src/etl/standardizer.py"),
    ("Entity Resolution & Multi-State Bridge Mapping", "python src/etl/entity_resolver.py"),
    ("Canonical Database Schema & Data Loading", "python src/etl/loader.py"),
    ("External Macroeconomic WPI Ingestion", "python src/etl/external_loader.py"),
    ("Deterministic Metrics Computation (Stack Parts A-G)", "python src/analytics/compute_metrics.py"),
    ("Risk Engine, Early Warning Alerts & Intervention Priority", "python src/analytics/risk_warning_intervention.py"),
    ("Weighted Portfolio, Sector & Ministry Rollups", "python src/analytics/portfolio_rollups.py"),
    ("Point-in-Time Leakage-Safe ML Datasets Generation", "python src/ml/generate_ml_datasets.py"),
    ("ML Training & Evaluation (Baselines vs CatBoost)", "python src/ml/train_evaluate_models.py"),
    ("Automated Integrity & Relational Verification", "python src/validation/validator.py"),
    ("Automated Leakage & Temporal Boundary Audit", "python src/validation/leakage_checker.py"),
    ("Comprehensive Data Quality & Health Profiling", "python src/validation/quality_profiler.py"),
    ("Feature Registry Generation", "python src/analytics/generate_feature_registry.py"),
    ("Source Provenance Map Generation", "python src/etl/generate_provenance_map.py")
]

def run_master_pipeline():
    start_time = time.time()
    logger.info("================================================================================")
    logger.info("        PAIMANA-INTEL — MASTER DATA ENGINEERING & ML PIPELINE EXECUTION         ")
    logger.info("================================================================================")
    logger.info(f"Start Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    for i, (name, cmd) in enumerate(STEPS, 1):
        step_start = time.time()
        logger.info(f"\n>>> [Step {i}/{len(STEPS)}] Running: {name}...")
        logger.info(f"    Command: {cmd}")
        
        proc = subprocess.run(cmd, shell=True)
        if proc.returncode != 0:
            logger.error(f"❌ [Step {i}] FAILED with exit code {proc.returncode}: {name}")
            sys.exit(proc.returncode)
            
        elapsed = time.time() - step_start
        logger.info(f"✅ [Step {i}] COMPLETED in {elapsed:.2f}s: {name}")
        
    total_elapsed = time.time() - start_time
    logger.info("\n================================================================================")
    logger.info(f"🎉 MASTER PIPELINE COMPLETED SUCCESSFULLY IN {total_elapsed:.2f}s!")
    logger.info("   Canonical Database: paimana_canonical.db (SQLite)")
    logger.info("   All Gold Tables, Early Warnings, Risk Scores, and ML Datasets are Fully Populated.")
    logger.info("================================================================================")

if __name__ == "__main__":
    run_master_pipeline()
