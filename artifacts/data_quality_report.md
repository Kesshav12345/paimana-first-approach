# PAIMANA-INTEL — Comprehensive Data Quality & Health Report

**Audit Execution Timestamp**: 2026-09-13 13:16:09
**Canonical Database**: `paimana_canonical.db`

## 1. System Overview Metrics

| Dimension | Value | Semantics & Governance |
|---|---:|---|
| **Canonical Projects (`dim_project`)** | **3,977** | Unique entity-resolved infrastructure projects across India |
| **Project-Month Facts (`fact_project_month`)** | **23,724** | Normalized observations spanning 16 months (2025-04 to 2026-07) |
| **Quarantine / Validation Logs** | **9,792** | Traceable data-cleaning decisions and format-anomaly audits |
| **Early Warning Alerts Active/Generated** | **57,402** | Deterministic multi-tier risk triggers (Cost, Sched, Progress) |
| **ML Snapshot Vectors (`ml_dataset_master`)** | **23,724** | Point-in-time leakage-safe feature matrices |
| **Supervised Uncensored Training Snapshots** | **18,256** | Ground-truth labeled snapshots across 3,190 distinct projects |

## 2. Field-Level Missingness Profile

Missing values are explicitly distinguished between `NOT_REPORTED`, unrevised baselines, and true missingness.

| Canonical Field | Valid Records | Missing Count | Missing Rate (%) | Domain Interpretation |
|---|---:|---:|---:|---|
| `project_id` | 23,724 | 0 | 0.0% | Fully populated |
| `reporting_month` | 23,724 | 0 | 0.0% | Fully populated |
| `sector_name` | 23,724 | 0 | 0.0% | Fully populated |
| `ministry_name` | 23,724 | 0 | 0.0% | Fully populated |
| `agency_name` | 23,724 | 0 | 0.0% | Fully populated |
| `state_name` | 23,724 | 0 | 0.0% | Fully populated |
| `original_cost_cr` | 22,634 | 1,090 | 4.59% | Unrevised projects default to original cost |
| `revised_cost_cr` | 23,721 | 3 | 0.01% | Unrevised projects default to original cost |
| `anticipated_cost_cr` | 23,721 | 3 | 0.01% | Unrevised projects default to original cost |
| `cumulative_expenditure_cr` | 23,722 | 2 | 0.01% | Government non-reporting / ongoing project |
| `physical_progress_pct` | 23,724 | 0 | 0.0% | Fully populated |
| `approval_date` | 23,676 | 48 | 0.2% | Government non-reporting / ongoing project |
| `original_doc` | 23,453 | 271 | 1.14% | Government non-reporting / ongoing project |
| `anticipated_doc` | 22,990 | 734 | 3.09% | Government non-reporting / ongoing project |

## 3. Temporal Distribution & Observation Continuity

Across the 16 continuous monthly reporting cycles (2025-04 through 2026-07):

| Reporting Month | Fact Observations | Unique Projects Active |
|:---:|---:|---:|
| `2025-04` | 1,704 | 1,704 |
| `2025-05` | 1,685 | 1,685 |
| `2025-06` | 1,734 | 1,734 |
| `2025-07` | 791 | 791 |
| `2025-08` | 800 | 800 |
| `2025-09` | 794 | 794 |
| `2025-10` | 820 | 820 |
| `2025-11` | 823 | 823 |
| `2025-12` | 1,392 | 1,392 |
| `2026-01` | 1,702 | 1,702 |
| `2026-02` | 1,948 | 1,948 |
| `2026-03` | 1,941 | 1,941 |
| `2026-04` | 1,981 | 1,981 |
| `2026-05` | 1,987 | 1,987 |
| `2026-06` | 1,847 | 1,847 |
| `2026-07` | 1,775 | 1,775 |

### Project Persistence / Longevity Across Monitoring Cycles

| Observation Span | Project Count | % of Portfolio | Analytical Role |
|---|---:|---:|---|
| 1 month | 82 | 2.1% | Point-in-time snapshot only |
| 2 to 5 months | 1,978 | 49.7% | Short temporal history |
| 6 to 11 months | 1,288 | 32.4% | Point-in-time snapshot only |
| 12 to 16 months (High Persistence) | 629 | 15.8% | Full longitudinal modeling cohort |

## 4. Sector Distribution & Capital Allocation

| Sector Name | Projects | Total Observations | Total Revised Cost (₹ Cr) | Avg Physical Progress |
|---|---:|---:|---:|---:|
| **Civil Aviation** | 1,763 | 5,458 | ₹9,072,364.42 | 81.3% |
| **Roads & Highways** | 1,187 | 7,976 | ₹10,385,539.35 | 64.8% |
| **Railways** | 300 | 3,225 | ₹11,051,196.37 | 48.4% |
| **Coal** | 259 | 2,890 | ₹9,194,446.07 | 40.5% |
| **Energy Storage** | 132 | 1,406 | ₹6,390,021.57 | 62.0% |
| **Construction** | 81 | 764 | ₹4,496,583.48 | 62.0% |
| **Healthcare** | 65 | 475 | ₹422,037.14 | 56.3% |
| **Water Resources** | 56 | 600 | ₹3,333,382.15 | 75.4% |
| **Telecommunications** | 35 | 198 | ₹3,234,786.73 | 83.9% |
| **Education** | 35 | 393 | ₹177,404.92 | 70.0% |
| **Inland Waterways** | 33 | 73 | ₹78,780.86 | 23.5% |
| **Metals & Mining** | 31 | 266 | ₹262,893.76 | 55.8% |

## 5. Data Hygiene, Quarantine & Validation Log

The pipeline guarantees that NO raw records are silently dropped or invisibly altered. All anomalies are logged in `quarantine_records`:

| Error Type | Severity | Incident Count | Remediation Strategy |
|---|:---:|---:|---|
| `PROGRESS_EXCEEDS_100` | 🟡 WARNING | 9,792 | Quarantined or normalized with provenance trace |

## 6. Project Outlier Profile

- **Raw Physical Progress > 100%**: 9,792 occurrences (safely capped at 100.0% in Silver layer while logging warning).
- **Extreme Cost Escalation (> +200%)**: 251 monthly observations identified for priority risk review.
- **Severe Schedule Stalls (Time Elapsed > 100% but Progress < 20%)**: 617 observation periods flagged as stalled projects requiring immediate intervention.
