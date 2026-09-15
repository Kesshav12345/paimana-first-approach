# PAIMANA-INTEL — Comprehensive Data Quality & Health Report

**Audit Execution Timestamp**: 2026-09-15 19:38:56
**Canonical Database**: `paimana_canonical.db`

## 1. System Overview Metrics

| Dimension | Value | Semantics & Governance |
|---|---:|---|
| **Canonical Projects (`dim_project`)** | **3,414** | Unique entity-resolved infrastructure projects across India |
| **Project-Month Facts (`fact_project_month`)** | **19,755** | Normalized observations spanning 16 months (2025-04 to 2026-07) |
| **Quarantine / Validation Logs** | **20,448** | Traceable data-cleaning decisions and format-anomaly audits |
| **Early Warning Alerts Active/Generated** | **17,312** | Deterministic multi-tier risk triggers (Cost, Sched, Progress) |
| **ML Snapshot Vectors (`ml_dataset_master`)** | **23,724** | Point-in-time leakage-safe feature matrices |
| **Supervised Uncensored Training Snapshots** | **18,256** | Ground-truth labeled snapshots across 3,190 distinct projects |

## 2. Field-Level Missingness Profile

Missing values are explicitly distinguished between `NOT_REPORTED`, unrevised baselines, and true missingness.

| Canonical Field | Valid Records | Missing Count | Missing Rate (%) | Domain Interpretation |
|---|---:|---:|---:|---|
| `project_id` | 19,755 | 0 | 0.0% | Fully populated |
| `reporting_month` | 19,755 | 0 | 0.0% | Fully populated |
| `sector_name` | 19,755 | 0 | 0.0% | Fully populated |
| `ministry_name` | 19,755 | 0 | 0.0% | Fully populated |
| `agency_name` | 19,755 | 0 | 0.0% | Fully populated |
| `state_name` | 19,755 | 0 | 0.0% | Fully populated |
| `original_cost_cr` | 19,752 | 3 | 0.02% | Unrevised projects default to original cost |
| `revised_cost_cr` | 19,752 | 3 | 0.02% | Unrevised projects default to original cost |
| `anticipated_cost_cr` | 19,752 | 3 | 0.02% | Unrevised projects default to original cost |
| `cumulative_expenditure_cr` | 19,755 | 0 | 0.0% | Fully populated |
| `physical_progress_pct` | 19,755 | 0 | 0.0% | Fully populated |
| `approval_date` | 19,741 | 14 | 0.07% | Government non-reporting / ongoing project |
| `original_doc` | 19,592 | 163 | 0.83% | Government non-reporting / ongoing project |
| `anticipated_doc` | 19,601 | 154 | 0.78% | Government non-reporting / ongoing project |

## 3. Temporal Distribution & Observation Continuity

Across the 16 continuous monthly reporting cycles (2025-04 through 2026-07):

| Reporting Month | Fact Observations | Unique Projects Active |
|:---:|---:|---:|
| `2025-04` | 1,704 | 1,704 |
| `2025-05` | 1,685 | 1,685 |
| `2025-06` | 1,642 | 1,642 |
| `2025-07` | 790 | 790 |
| `2025-08` | 794 | 794 |
| `2025-09` | 790 | 790 |
| `2025-10` | 817 | 817 |
| `2025-11` | 821 | 821 |
| `2025-12` | 1,077 | 1,077 |
| `2026-01` | 1,269 | 1,269 |
| `2026-02` | 1,424 | 1,424 |
| `2026-03` | 1,407 | 1,407 |
| `2026-04` | 1,438 | 1,438 |
| `2026-05` | 1,436 | 1,436 |
| `2026-06` | 1,359 | 1,359 |
| `2026-07` | 1,302 | 1,302 |

### Project Persistence / Longevity Across Monitoring Cycles

| Observation Span | Project Count | % of Portfolio | Analytical Role |
|---|---:|---:|---|
| 1 month | 108 | 3.2% | Point-in-time snapshot only |
| 2 to 5 months | 1,913 | 56.0% | Short temporal history |
| 6 to 11 months | 770 | 22.6% | Point-in-time snapshot only |
| 12 to 16 months (High Persistence) | 623 | 18.2% | Full longitudinal modeling cohort |

## 4. Sector Distribution & Capital Allocation

| Sector Name | Projects | Total Observations | Total Revised Cost (₹ Cr) | Avg Physical Progress |
|---|---:|---:|---:|---:|
| **Road Transport & Highways** | 1,644 | 7,085 | ₹7,975,607.08 | 70.5% |
| **Railways** | 514 | 3,800 | ₹11,873,585.41 | 51.1% |
| **Coal** | 376 | 3,232 | ₹9,983,044.85 | 39.6% |
| **Power** | 252 | 1,727 | ₹7,655,321.46 | 59.4% |
| **Petroleum & Natural Gas** | 112 | 352 | ₹1,438,840.72 | 56.8% |
| **Urban Development** | 98 | 822 | ₹5,013,979.95 | 58.4% |
| **Steel** | 75 | 398 | ₹1,154,003.72 | 57.2% |
| **Health & Family Welfare** | 70 | 490 | ₹516,788.67 | 52.2% |
| **Civil Aviation** | 70 | 452 | ₹381,536.13 | 59.2% |
| **Education** | 66 | 483 | ₹263,194.43 | 67.7% |
| **Water Resources** | 57 | 600 | ₹2,691,934.61 | 73.8% |
| **Telecommunications** | 40 | 213 | ₹3,469,849.75 | 83.5% |
| **Shipping & Ports** | 23 | 42 | ₹43,846.40 | 13.0% |
| **Logistics Infrastructure** | 11 | 42 | ₹77,020.81 | 30.3% |
| **Industrial Development** | 2 | 6 | ₹94,371.00 | 75.5% |
| **Home Affairs** | 2 | 5 | ₹1,230.67 | 56.6% |
| **Social Development** | 1 | 3 | ₹512.97 | 63.0% |
| **Finance** | 1 | 3 | ₹685.50 | 85.0% |

## 5. Data Hygiene, Quarantine & Validation Log

The pipeline guarantees that NO raw records are silently dropped or invisibly altered. All anomalies are logged in `quarantine_records`:

| Error Type | Severity | Incident Count | Remediation Strategy |
|---|:---:|---:|---|
| `PROGRESS_EXCEEDS_100` | 🟡 WARNING | 20,448 | Quarantined or normalized with provenance trace |

## 6. Project Outlier Profile

- **Raw Physical Progress > 100%**: 20,448 occurrences (safely capped at 100.0% in Silver layer while logging warning).
- **Extreme Cost Escalation (> +200%)**: 195 monthly observations identified for priority risk review.
- **Severe Schedule Stalls (Time Elapsed > 100% but Progress < 20%)**: 410 observation periods flagged as stalled projects requiring immediate intervention.
