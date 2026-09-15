# PAIMANA-INTEL Analytical Dashboards Redesign Walkthrough

## 1. Executive Summary & Product Architecture

The PAIMANA-INTEL analytical dashboards (`Projects`, `EarlyWarning`, `SectorAnalytics`, `MinistryAnalytics`, `StateAnalytics`) have been comprehensively evolved to adhere to a deliberate, consistent, and analytically meaningful interaction model:

```
QUESTION 
  → DEFINE SCOPE WITH DRAFT FILTERS 
  → APPLY CRITERIA 
  → FILTERED KPI SNAPSHOT 
  → VISUAL COMPARISON (4 Chart Perspectives) 
  → NUMERICAL RANKING TABLE 
  → EXPLORE ENTITY 
  → CONVENTIONAL DROPDOWN DRILL-DOWN 
  → SCOPED PROJECT COHORT (Inheriting Overview Filters) 
  → PROJECT INTELLIGENCE DEEP DIVE
```

### Key Architectural Invariants Enforced
1. **Draft vs Applied Filter Cohort Separation**: Dropdown and input changes modify a draft filter state without silently re-querying the database or updating charts prematurely. The dataset only updates on explicit `Apply Filters`, quick preset selection, or `Reset`.
2. **Unsaved Filter Indicator**: When draft filters diverge from the applied cohort, an amber "Filters changed — Apply to update results" indicator alerts the analyst.
3. **Inherited Analytical Context**: When drilling down from an overview (e.g., Critical Risk projects in Maharashtra), the drill-down queries (`getSectorProjects`, `getMinistryProjects`, `getStateProjects`) retain those exact filters, ensuring the project count strictly reconciles with the aggregate overview.
4. **Conventional Dropdown Drill-Down**: Large, unweildy card grids have been replaced with traditional, compact, accessible analytical dropdowns (`Selected Entity` + `Secondary Sub-entity`).
5. **Early Warning Query-First Landing**: The page no longer dumps 57,000+ alerts upon arrival. It presents an analytical scope configuration panel with presets and guidance, querying only when the user commits an analytical scope.
6. **URL State Synchronization**: Applied analytical filters are seamlessly mirrored into URL parameters for bookmarking, sharing, and browser back/forward navigation.

---

## 2. Shared Frontend Components & Types

### 1. `AnalyticalFilterPanel.tsx` (`frontend/src/components/common/AnalyticalFilterPanel.tsx`)
- Container enforcing the draft vs. applied lifecycle.
- Displays panel header, subtitle, unsaved changes badge, quick presets bar, active filter tags with single-click dismiss, and primary `Apply` / secondary `Reset` action buttons.

### 2. `FilterSelect.tsx` (`frontend/src/components/common/FilterSelect.tsx`)
- Accessible, clean select component featuring floating labels, option counts, full-name tooltip on truncated text, and responsive layout.

### 3. `ActiveFilterChips.tsx` (`frontend/src/components/common/ActiveFilterChips.tsx`)
- Applied criteria chips allowing analysts to remove individual filters, which immediately updates the applied cohort and triggers a single re-query.

### 4. `frontend/src/types/index.ts`
- Added unified analytical interfaces:
  - `AnalyticalFilterParams` (`state`, `ministry`, `sector`, `riskBand`, `trajectory`, `costFilter`, `delayFilter`, `warningFilter`, `multiState`, `sortBy`)
  - `EarlyWarningFilterParams` (`sector`, `ministry`, `state`, `severity`, `warningType`, `persistence`, `riskBand`, `interventionStatus`, `search`, `page`, `size`)
  - `EarlyWarningSummary` (`matchingProjects`, `activeWarnings`, `criticalSignals`, `multiWarningProjects`, `interventionCandidates`, `activeInterventions`)
  - `InterventionFilterParams`
  - Added `avgScheduleDelayMonths`, `totalOriginalCostCr`, `totalRevisedCostCr` to `MinistrySummary` and `StateSummary`.
  - Added `projectInterventionStatus` to `EarlyWarningAlert`.

### 5. `frontend/src/services/api.ts`
- Unified filter query builder `appendAnalyticalFilters`.
- Extended `getSectors`, `getSectorStates`, `getSectorProjects` to accept `AnalyticalFilterParams`.
- Extended `getMinistries`, `getMinistryAgencies`, `getMinistryProjects` to accept `AnalyticalFilterParams`.
- Extended `getStates`, `getStateSectors`, `getStateProjects` to accept `AnalyticalFilterParams`.
- Extended `getActiveAlerts`, `getEarlyWarningSummary`, and `getInterventions` with server-aware pagination.

---

## 3. Dashboard Implementations

### A. Early Warning & Intervention System (`EarlyWarning.tsx`)
- **Initial Landing State**:
  - Unqueried guidance card with quick preset recommendations.
  - Dynamic tab counts: Removed static/hardcoded `(57,402)` count fallback. Displays exact active count once queried.
- **Active Warning Filters**:
  - Project search, Sector, Ministry, State, Warning Signal Type, Trigger Severity, Persistence Duration, Overall Risk Band, Intervention Relationship.
  - Quick Presets: "Critical Warnings", "Persistent Warnings (≥3 Mo)", "Severe Delay Alerts", "Cost Overrun Alerts", "Critical + No Intervention".
- **KPI Summary Cards**:
  - Matching Projects, Active Warning Signals, Critical Signals, Compound Risk (≥ 2 alerts), Intervention Candidates, Active Interventions.
- **Project-Centric Triage Table**:
  - Displays project identity, administrative scope, warning signal, severity badge, risk badge, persistence duration in months, intervention status chip, and "Triage" modal action + "Project Intelligence" link.
- **Intervention Workflow Tab**:
  - Full filter panel + horizontal stage tracker cards (`Under Review`, `Action Initiated`, `Monitoring`, `Resolved`) with counts. Clicking a stage instantly filters the cohort.
  - Modal allows editing status and logging action notes without losing pagination or applied filters.

### B. Ministry Analytics (`MinistryAnalytics.tsx`)
- **Overview Mode**:
  - Header with orientation microcopy and represented ministries badge.
  - Analytical filter panel with quick presets and unsaved changes indicator.
  - Filtered KPI snapshot: Matching Projects, Revised Outlay (₹ Cr), Expenditure (₹ Cr), Weighted Escalation (%), Average Delay (Mos), High / Critical Risk, Active Warnings.
  - 4 Visual Comparison Chart Tabs:
    1. *Capital & Delivery* (Original vs Revised vs Expenditure)
    2. *Cost vs Schedule Delay* (Dual-axis Cost Escalation % vs Delay Months)
    3. *Risk Concentration & Alerts* (Stacked Critical, High, Moderate/Low bars)
    4. *Execution Progress* (Physical Progress vs Cumulative Spend %)
  - Numerical Ministry Table with clickable column headers and "Explore" action.
- **Detail Drill-Down Mode**:
  - Top conventional dropdown selectors: `Selected Ministry` and `Implementing Agency`.
  - Displays inherited overview scope.
  - Filter-propagated project table with server-aware pagination and link to `/projects/:id`.

### C. State Analytics (`StateAnalytics.tsx`)
- **Overview Mode**:
  - Same deliberate analytical layout as Sector and Ministry dashboards.
  - Filter panel with multi-state corridor filter, risk bands, escalation, slippage, and warning profiles.
  - 7 KPI summary cards computed from canonical database aggregations.
  - 4 Recharts visual comparison tabs with click-through from state bars directly into drilldown.
  - Detailed State & UT comparison table.
- **Detail Drill-Down Mode**:
  - Replaced large grid of sector cards with compact conventional dropdown selectors: `Selected State / UT` and `Infrastructure Sector`.
  - Inherited overview scope badge and scoped project cohort table.

### D. Sector Analytics (`SectorAnalytics.tsx`)
- **Draft vs. Applied State**:
  - Refactored `useEffect` query lifecycle so dropdown selections alter draft state without premature refetches.
  - Apply button commits changes and updates KPIs, charts, and tables in a unified cohort.
- **Detail Drill-Down Mode**:
  - Replaced state distribution card grid with conventional `Sector Selector` and `State / Territory Selector` dropdowns.
  - Overview filter criteria are passed directly to `getSectorProjects` so drilldown cohorts reflect overview constraints.

---

## 4. Backend Query Architecture & Spring Boot APIs

### 1. `EarlyWarningRepository.java`, `EarlyWarningService.java`, `EarlyWarningController.java`
- Added multi-dimensional query filters: `sector`, `ministry`, `state`, `severity`, `warningType`, `persistence` (months calculation), `riskBand`, `interventionStatus`, `search`.
- Implemented `/api/v1/early-warning/summary` computing distinct matching projects, total alerts, critical alerts, multi-warning projects, intervention candidates (score ≥ 50), and active interventions.
- Implemented paginated `/api/v1/early-warning/interventions` with sort metrics (`priority`, `cost`, `delay`, `name`).

### 2. `MinistryRepository.java`, `MinistryService.java`, `MinistryController.java`
- Dynamic SQL queries against `gold_project_current` supporting multi-dimensional filters (`sector`, `state`, `riskBand`, `trajectory`, `costFilter`, `delayFilter`, `warningFilter`, `multiState`, `sortBy`).
- Filter-aware `getMinistryAgencyBreakdown` and `getMinistryProjects`.

### 3. `StateRepository.java`, `StateService.java`, `StateController.java`
- Dynamic SQL queries against `gold_project_current` with multi-dimensional filters.
- Filter-aware `getStateSectorBreakdown` and `getStateProjects`.

### 4. `SectorRepository.java`, `SectorService.java`, `SectorController.java`
- Added filter overloads for `getSectorStateBreakdown` and `getSectorProjects`.

---

## 5. Verification & Test Results

### 1. Backend Automated Integration Tests
An automated test suite `AnalyticalDashboardsTest.java` was created and executed:
- Command: `./mvnw test`
- Results:
  ```
  [INFO] Running org.paimana.AnalyticalDashboardsTest
  [INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 3.854 s -- in org.paimana.AnalyticalDashboardsTest
  [INFO] BUILD SUCCESS
  ```
- Verified test cases:
  - `testSectorAnalyticsQueries`: Default national aggregation, critical risk filtering, state breakdown, and project drill-down context inheritance.
  - `testMinistryAnalyticsQueries`: Default line ministries aggregation, risk band filtering, agency breakdown, and project drill-down context inheritance.
  - `testStateAnalyticsQueries`: Default regional states aggregation, risk band filtering, sector breakdown, and project drill-down context inheritance.
  - `testEarlyWarningAndInterventionQueries`: Active warnings filtering by severity, summary reconciliation, paginated interventions, and idempotent status update transition.

### 2. Frontend Build Verification
- Command: `npm run build`
- Results:
  ```
  > frontend@0.0.0 build
  > tsc -b && vite build

  vite v8.3.0 building client environment for production...
  transforming...
  ✓ 2463 modules transformed.
  rendering chunks...
  dist/index.html                     0.45 kB │ gzip:   0.29 kB
  dist/assets/index-CGwqjyR4.css     72.33 kB │ gzip:  11.73 kB
  dist/assets/index-DMpycdIT.js   1,019.60 kB │ gzip: 256.48 kB
  ✓ built in 1.04s
  ```
- Zero TypeScript errors across all pages and components.
