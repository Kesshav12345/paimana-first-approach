# PAIMANA-INTEL — Infrastructure Project Monitoring & Early Warning Decision Support System

> **Production-Ready Enterprise Web Application & MLOps Platform**  
> Built strictly to the governing specifications of the **PAIMANA General Approach** and **The Whole Computational Stack of ML**.

---

## 1. System Architecture Overview

PAIMANA-INTEL delivers an end-to-end, multi-tier decision support platform designed for central ministries, state infrastructure departments, and statutory monitoring authorities (MoSPI). It operates on a unified canonical data foundation spanning **3,977 major infrastructure projects**, **23,724 monthly observations**, **57,402 active early warning alerts**, and multi-target machine learning models.

```
+-------------------------------------------------------------------------+
|                              REACT FRONTEND                             |
|        (TypeScript 5 + React 19 + Tailwind CSS + Recharts + Lucide)    |
|   Port 5173 (Dev) / Port 80 (Nginx Production)                         |
+-------------------------------------------------------------------------+
                                   |
                                   | HTTPS / REST (JSON)
                                   v
+-------------------------------------------------------------------------+
|                           JAVA SPRING BOOT API                          |
|         (Java 21/24 + Spring Boot 3.3.5 + JdbcTemplate)                 |
|   Port 8080                                                             |
|   - Orchestration, Security, Query Optimization, REST DTO Contracts     |
+-------------------------------------------------------------------------+
          /                                              \
         / SQL                                            \ Internal REST
        v                                                  v
+-----------------------+              +----------------------------------+
|   CANONICAL DATABASE  |              |       PYTHON ML MICROSERVICE     |
| (SQLite / PostgreSQL) |              |   (FastAPI + CatBoost + SHAP)    |
| paimana_canonical.db  |              |   Port 8000                      |
| - 3,977 Dim Projects  |              |   - Multi-Target ML Inference    |
| - 23,724 Fact Records |              |   - SHAP Attribution & Drivers   |
| - Precomputed Gold    |              |   - Automated PDF Ingestion ETL  |
|   Portfolio Metrics   |              |   - Candidate Retraining MLOps   |
+-----------------------+              +----------------------------------+
```

---

## 2. Core Functional Dashboards

1. **Portfolio Overview (Home)** (`/`):
   - Key Performance Indicators: Total Monitored Projects (3,977), Approved Baseline (₹61.82L Cr), Revised Sanctioned Cost (₹75.36L Cr), Cumulative Expenditure (₹82.02L Cr), and Projects Requiring Attention (1,052).
   - Interactive State & UT Geographic Density & Risk Concentration Map.
   - Priority Flagged Projects queue with instantaneous status triage.

2. **Sector Analytics** (`/sectors`):
   - 3-tier drilldown: Sector Overview $\to$ Sector-State Breakdown $\to$ Project Queue.
   - Sector-wide cost escalation, expenditure rates, delay profiles, and warning counts.

3. **Ministry Analytics** (`/ministries`):
   - 3-tier drilldown: Ministry Overview $\to$ Implementing Agency Breakdown $\to$ Contributing Projects.
   - Portfolio exposure tracking across executing authorities.

4. **State Analytics** (`/states`):
   - 3-tier drilldown: State Overview $\to$ State-Sector Breakdown $\to$ Project Intelligence.
   - State-level capital allocations with strict multi-state project inflation guards.

5. **Early Warning System** (`/early-warning`):
   - **Active Alert Queue**: Dual-dimension filtered triage (Cost Overruns, Critical Delays, Progress Stagnation, Expenditure Divergence).
   - **Intervention Workflow**: Tracking intervention lifecycles (`Under Review`, `Action Initiated`, `Monitoring`, `Resolved`) with audit logs.

6. **Project Intelligence** (`/projects/:id`):
   - Deep analysis encompassing all **15 authoritative analytical areas**:
     1. Project Header & Identity (ID, Sector, Ministry, State, Lifecycle Phase)
     2. Current Project Status (Physical progress, financial expenditure, sanctioned cost)
     3. Project Health Summary (Deterministic status decomposition, signals)
     4. Cost Forecast (CatBoost Regressor predicted cost, overrun probability, confidence)
     5. Schedule Forecast (CatBoost Classifier slippage risk, predicted delay months)
     6. Overall Implementation Risk Index (Cost, schedule, and progress risk decomposition)
     7. Risk & Performance Trajectory (Longitudinal time-series charts)
     8. Active Warnings & Early-Warning Triggers
     9. Why Is the Project Being Flagged? (Evidence-based reasoning)
     10. Key Risk Drivers (Feature importance & directional risk indicators)
     11. Warning & Risk History
     12. Benchmark Against Similar Projects (Cohort peer comparisons)
     13. Areas Requiring Official Attention (Priority 1/2/3 action items)
     14. Recommended Interventions (Evidence-backed mitigation measures)
     15. Intervention Tracking & Progress (Lifecycle history & outcomes)

7. **Data & Model Operations (MLOps)** (`/operations`):
   - Real-time pipeline health telemetry (Total projects, facts, active models, quarantine records).
   - **Automated PDF Ingestion**: Upload new MoSPI Flash Reports or CPR PDF documents directly via web UI $\to$ Triggers background extraction, entity resolution, canonical database updates, feature recalculation, and whole-portfolio predictions refresh.
   - **MLOps Lifecycle Controls**: Train candidate models, compare validation metrics, hot-swap production models, and refresh predictions across all projects with zero downtime.

---

## 3. Technology Stack & Prerequisites

- **Java Development Kit (JDK)**: Java 21 or 24 (`javac`, `java`)
- **Maven**: Version 3.8+ (`mvn`)
- **Python**: Python 3.10+ (with `pip`, `fastapi`, `uvicorn`, `catboost`, `scikit-learn`, `pandas`, `pymupdf`)
- **Node.js**: Node 18+ (`node`, `npm`)
- **Docker & Docker Compose**: Optional for containerized deployment

---

## 4. Local Quickstart (Running Natively)

### Step 1: Start the Python ML Microservice (Port 8000)
```powershell
# In project root:
python -m uvicorn main:app --app-dir ml-service --host 127.0.0.1 --port 8000
```
*Models will automatically serialize/load into memory:*
- `models/cb_cost_cls.cbm` (Cost Overrun Classifier)
- `models/cb_final_cost_reg.cbm` (Final Cost Regressor)
- `models/cb_sched_cls.cbm` (Schedule Overrun Classifier)
- `models/cb_delay_reg.cbm` (Delay Duration Regressor)

### Step 2: Build & Start the Java Spring Boot Backend (Port 8080)
```powershell
# In backend/ directory:
mvn clean package -DskipTests
java -jar target/paimana-backend-1.0.0.jar
```
*Backend initializes in ~2.3 seconds, connects to `paimana_canonical.db`, and binds to `http://localhost:8080`.*

### Step 3: Start the React Frontend (Port 5173)
```powershell
# In frontend/ directory:
npm install
npm run dev
```
*Open your browser at `http://localhost:5173` to access the full live application.*

---

## 5. Dockerized Startup (One-Command Deployment)

To run the entire multi-tier system with containerized networking:
```bash
docker compose up --build -d
```
Services will be launched:
- `paimana-frontend`: `http://localhost:80` (or `http://localhost:5173`)
- `paimana-backend`: `http://localhost:8080`
- `paimana-ml-service`: `http://localhost:8000`

---

## 6. Verification & Automated Test Pass

Run automated checks across all layers:
```powershell
# 1. Verify ML Service Health:
curl.exe -s http://127.0.0.1:8000/health

# 2. Verify Backend Core Endpoints:
curl.exe -s http://127.0.0.1:8080/api/v1/home
curl.exe -s http://127.0.0.1:8080/api/v1/sectors
curl.exe -s http://127.0.0.1:8080/api/v1/early-warning/alerts?page=1&size=5
curl.exe -s http://127.0.0.1:8080/api/v1/operations/status

# 3. Verify Project Intelligence deep dive:
curl.exe -s http://127.0.0.1:8080/api/v1/projects/400298

# 4. Verify Frontend Production Build:
cd frontend
npm run build
```

---

## 7. Manual GitHub Push & Deployment Instructions for the User

Follow these exact steps to push this production-ready application to your remote repository:

1. **Inspect Git Status**:
   ```bash
   git status
   ```
2. **Stage All Production Components**:
   ```bash
   git add .
   ```
3. **Commit the Integrated Codebase**:
   ```bash
   git commit -m "feat(paimana-intel): complete production-ready full-stack application with ML MLOps and operations dashboard"
   ```
4. **Push to Remote Repository**:
   ```bash
   git push origin main
   ```
5. **Deploy to Target Infrastructure**:
   - **Docker Host / Cloud VM**: Clone repository, configure `.env` (if using PostgreSQL), and run `docker compose up -d`.
   - **PaaS (AWS ECS, Render, Railway, DigitalOcean)**:
     - Deploy `ml-service/Dockerfile` as the internal ML microservice.
     - Deploy `backend/Dockerfile` as the backend service with `PYTHON_SERVICE_URL` pointed to the ML service.
     - Deploy `frontend/Dockerfile` (or static `dist/` on Vercel/Netlify/Cloudflare Pages) with API rewrite rules pointing to the backend.
