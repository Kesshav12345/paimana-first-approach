# PAIMANA-INTEL — Master ML Target Definitions & Censoring Governance

**Document Version**: 1.0.0  
**Governing Standard**: *The Whole Computational Stack of ML* & *PAIMANA General Approach*  
**Pipeline Integration**: `src/ml/generate_ml_datasets.py` & `ml_dataset_master`

---

## 1. Core Architectural Principle

The PAIMANA-INTEL architecture separates:
1. **WHAT HAS HAPPENED?** $\rightarrow$ Raw source observations + exact deterministic calculations + historical statistics.
2. **WHAT IS LIKELY TO HAPPEN?** $\rightarrow$ Supervised ML predicting unknown future outcomes.
3. **WHAT DESERVES ATTENTION?** $\rightarrow$ Transparent risk scoring and rule-based early-warning alerts.

Supervised Machine Learning is restricted strictly to predicting unknown future outcomes:
- **Cost Overrun Probability** (Binary Classification)
- **Final Project Cost** (Continuous Regression)
- **Schedule Overrun Probability** (Binary Classification)
- **Delay Duration in Months** (Continuous Regression)

All derivative indicators (such as Cost Overrun Amount, Cost Overrun Percentage, and Portfolio Cost Exposure) are computed **deterministically from the primary model predictions**, eliminating redundant and contradictory models.

---

## 2. Supervised Target Specifications

### Target 1: Cost Overrun Probability (`target_cost_overrun_binary`)
- **Target Concept**: Given all project telemetry known at snapshot month $T$, what is the probability that the project will eventually experience a significant cost overrun over its original sanctioned baseline?
- **Mathematical Definition**:
  $$\text{target\_cost\_overrun\_binary}_i = \begin{cases} 1 & \text{if } \text{final\_revised\_cost}_i > \text{original\_cost}_i \text{ (or } \text{cost\_escalation} > 0.01\% \text{)} \\ 0 & \text{if } \text{final\_revised\_cost}_i \le \text{original\_cost}_i \end{cases}$$
- **Recommended Model Family**: `CatBoostClassifier` (benchmarked against `LogisticRegression` baseline).
- **Target Balance**: Observed 37.0% positive (overrun) vs 63.0% negative (within budget) across uncensored candidate snapshots.

### Target 2: Predicted Final Cost (`target_final_cost_cr`)
- **Target Concept**: Direct regression prediction of the ultimate total capital expenditure required to complete the infrastructure asset (in ₹ Crore).
- **Mathematical Definition**:
  $$\text{target\_final\_cost\_cr}_i = \text{terminal\_anticipated\_or\_revised\_cost}_i \text{ (as of latest observed monitoring period)}$$
- **Deterministic Downstream Derivations**:
  $$\text{predicted\_cost\_overrun\_amount\_cr} = \max(0.0, \widehat{\text{final\_cost}} - \text{original\_cost})$$
  $$\text{predicted\_cost\_overrun\_pct} = \frac{\widehat{\text{final\_cost}} - \text{original\_cost}}{\text{original\_cost}} \times 100$$
  $$\text{portfolio\_expected\_cost\_exposure} = \sum_{i} \widehat{P}(\text{overrun}_i) \times \widehat{\text{cost\_overrun\_amount}}_i$$
- **Recommended Model Family**: `CatBoostRegressor` with Log1p target transformation (benchmarked against `Ridge` regression baseline).

### Target 3: Schedule Overrun Probability (`target_schedule_overrun_binary`)
- **Target Concept**: Given execution telemetry at snapshot month $T$, what is the probability that the project's actual commissioning date will exceed its originally approved commissioning milestone?
- **Mathematical Definition**:
  $$\text{target\_schedule\_overrun\_binary}_i = \begin{cases} 1 & \text{if } \text{terminal\_doc}_i > \text{original\_doc}_i \text{ (or } \text{slippage} \ge 1 \text{ month)} \\ 0 & \text{if } \text{terminal\_doc}_i \le \text{original\_doc}_i \end{cases}$$
- **Recommended Model Family**: `CatBoostClassifier` (benchmarked against `LogisticRegression` baseline).
- **Target Balance**: Observed 86.8% positive (delayed) vs 13.2% negative across uncensored candidate snapshots.

### Target 4: Delay Duration in Months (`target_delay_months`)
- **Target Concept**: Continuous regression prediction of the total calendar delay in months beyond the original date of commissioning (DOC).
- **Mathematical Definition**:
  $$\text{target\_delay\_months}_i = \max\left(0, \text{round}\left(\frac{\text{terminal\_anticipated\_doc}_i - \text{original\_doc}_i}{30.4375}\right)\right)$$
- **Deterministic Downstream Derivation**:
  $$\widehat{\text{predicted\_completion\_date}} = \text{original\_doc} + \widehat{\text{target\_delay\_months}} \text{ months}$$
- **Recommended Model Family**: `CatBoostRegressor` (benchmarked against `Ridge` regression baseline).

---

## 3. Censoring Governance & Incomplete Projects

A central pitfall in infrastructure data engineering is **right-censoring**. Active, ongoing projects that have not yet reached completion cannot naively be treated as "no overrun":
- An ongoing project that is currently at month 10 with 0 months of reported delay might still experience severe delay at month 30.
- Marking such incomplete projects as $0$ (negative outcome) would inject severe **false-negative bias** into model training.

### Operational Censoring Rule:
In `ml_dataset_master`:
$$\text{is\_censored} = \begin{cases} 1 & \text{if project is active, observed progress } < 95\%, \text{ cost growth } = 1.0, \text{ and delay } = 0 \\ 0 & \text{if terminal outcome is observed or definitive overrun has already materialized} \end{cases}$$

- **Uncensored Training Candidates**: **18,256 snapshots** across 3,190 distinct projects.
- **Right-Censored Snapshots**: **5,468 snapshots** (isolated from supervised ground-truth label evaluation to ensure training dataset purity).

---

## 4. Temporal Split Architecture

To evaluate models under conditions identical to real-world deployment, random $k$-fold cross-validation across snapshots is **prohibited** (it leaks future information between near-adjacent monthly snapshots of the same project).

The temporal split is enforced strictly on calendar time:
- **TRAINING COHORT**: Snapshots with `snapshot_month` $\le$ **2025-12** (12,245 snapshots).
- **VALIDATION COHORT**: Snapshots from **2026-01** through **2026-04** (5,870 snapshots).
- **OUT-OF-TIME TEST COHORT**: Snapshots with `snapshot_month` $\ge$ **2026-05** (5,609 snapshots).

This ensures models are trained on historical data and tested exclusively on future time horizons.
