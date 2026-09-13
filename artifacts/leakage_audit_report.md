# PAIMANA-INTEL — Formal Leakage Audit & Temporal Verification Report

**Audit Execution Timestamp**: 2026-09-13 13:16:08
**Audited Database**: `paimana_canonical.db`
**Audited ML Datasets**: `data/ml/*.csv`

## 1. Executive Summary

> [!NOTE]
> **ALL LEAKAGE AUDITS PASSED**: The canonical feature pipeline strictly complies with temporal information boundary constraints. Zero future information, zero secondary target contamination, and zero retroactive backcasting were detected.

## 2. Audit Matrix

| Check ID | Description | Status | Violations | Detail |
|---|---|:---:|:---:|---|
| `LEAK_01_TEMPORAL_HORIZON` | Target observation month strictly >= feature snapshot month (no retroactive backcasting) | ✅ PASS | 0 | 0 instances where target observation preceded snapshot |
| `LEAK_02_FEATURE_TARGET_DISJOINTNESS` | Predictor feature column set strictly disjoint from target column set | ✅ PASS | 0 | Complete isolation |
| `LEAK_03_CSV_TARGET_CONTAMINATION` | Individual ML training CSVs contain only their designated target and no secondary targets | ✅ PASS | 0 | All 4 training datasets isolate only their designated supervised label |
| `LEAK_04_CHRONOLOGICAL_SPLIT_ORDER` | Strict temporal ordering: Train periods < Val periods < Test periods (No future shuffle) | ✅ PASS | 0 | Train: <= 2026-01 | Val: 2026-02 to 2026-04 | Test: >= 2026-05 |
| `LEAK_05_POINT_IN_TIME_FEATURE_FREEZING` | Dynamic feature vector at snapshot T exactly matches observed values at T without forward revision pull | ✅ PASS | 0 | 0 discrepancies between snapshot vector and monthly fact state |
| `LEAK_06_RIGHT_CENSORING_SEPARATION` | Projects with incomplete terminal status explicitly identified as censored to prevent false negatives | ✅ PASS | 0 | Total uncensored training candidates: 18,256 | Right-censored snapshots: 5,468 |

## 3. Methodological Enforcements

1. **Strict Information Horizon ($T$)**: Every feature vector for project $i$ at month $T$ is derived strictly from data published in or before month $T$. Even if a project was later revised in July 2026, its state in May 2025 retains the May 2025 approval and cost numbers.
2. **Target Isolation**: Supervised target variables (`target_cost_overrun_binary`, `target_final_cost_cr`, `target_schedule_overrun_binary`, `target_delay_months`) are materialized solely for training supervision and are structurally barred from predictive feature matrices.
3. **Non-Overlapping Temporal Split**: The chronological split is configured as:
   - **Training Set**: Snapshots $\le$ 2025-12 (Historic baseline)
   - **Validation Set**: 2026-01 to 2026-04 (Intermediate validation)
   - **Test Set**: Snapshots $\ge$ 2026-05 (Out-of-time test)
   This guarantees zero test-set data is seen during training.
4. **Censoring Governance**: Incomplete projects with no observed final terminal state are not naively imputed as 'no overrun' (which would introduce massive false-negative label bias). They are isolated via `is_censored = 1`.
