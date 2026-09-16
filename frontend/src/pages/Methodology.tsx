import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Database,
  Cpu,
  Layers,
  AlertTriangle,
  Search,
  Activity,
  Clock,
  FileCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
  BarChart2,
  Lock,
  Workflow,
  Server,
  Compass,
  FileText,
  Eye
} from 'lucide-react';
import { api } from '../services/api';
import type { MethodologyMetadata } from '../types';

export const Methodology: React.FC = () => {
  const [telemetry, setTelemetry] = useState<MethodologyMetadata | null>(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('sec-5'); // Default to Chapter 5 as per user reference
  const [viewMode, setViewMode] = useState<'focused' | 'all'>('focused');

  useEffect(() => {
    async function loadMeta() {
      try {
        const data = await api.getMethodologySummary();
        setTelemetry(data);
      } catch (err) {
        console.error('Failed to load methodology metadata:', err);
      } finally {
        setLoadingTelemetry(false);
      }
    }
    loadMeta();
  }, []);

  const sections = [
    { id: 'sec-1', label: '1. Mission & Scope' },
    { id: 'sec-2', label: '2. System Architecture' },
    { id: 'sec-3', label: '3. 12-Stage Intelligence Pipeline' },
    { id: 'sec-4', label: '4. Data Foundations & Tiers' },
    { id: 'sec-5', label: '5. Deterministic Metrics' },
    { id: 'sec-6', label: '6. Early Warning Engine' },
    { id: 'sec-7', label: '7. CatBoost ML & TreeSHAP' },
    { id: 'sec-8', label: '8. External Evidence Subsystem' },
    { id: 'sec-9', label: '9. Full Lineage Provenance' },
    { id: 'sec-10', label: '10. Quality Gates & Governance' },
    { id: 'sec-11', label: '11. Operational Ingestion' },
    { id: 'sec-12', label: '12. Auditing & Limitations' },
  ];

  const activeIndex = sections.findIndex(s => s.id === activeSection);

  const selectSection = (id: string) => {
    setActiveSection(id);
    if (viewMode === 'all') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      const container = document.getElementById('methodology-content-root');
      if (container) {
        const rect = container.getBoundingClientRect();
        if (rect.top < 80) {
          window.scrollTo({
            top: window.scrollY + rect.top - 90,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  const goToPrev = () => {
    if (activeIndex > 0) {
      selectSection(sections[activeIndex - 1].id);
    }
  };

  const goToNext = () => {
    if (activeIndex < sections.length - 1) {
      selectSection(sections[activeIndex + 1].id);
    }
  };

  const renderSectionContent = (id: string) => {
    switch (id) {
      case 'sec-1':
        return (
          <section id="sec-1" className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD9D0]/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3 text-[#267A69]">
              <Compass className="w-6 h-6" />
              <h2 className="text-xl font-bold text-[#173F35]">1. What PAIMANA-INTEL Does</h2>
            </div>
            <p className="text-[#26312D] text-sm leading-relaxed">
              PAIMANA-INTEL is an institutional decision-support system built to monitor mega-infrastructure projects 
              (projects sanctioned at ₹150 Crore and above) across India. It bridges the gap between periodic official 
              compliance reporting and active field realities.
            </p>
            <div className="bg-[#FAF8F5] border border-[#DDD9D0] rounded-xl p-5 grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
              <div className="p-3 bg-white rounded-lg border border-[#DDD9D0]">
                <span className="text-xs font-bold text-[#173F35] block mb-1">Official Facts</span>
                <span className="text-[11px] text-[#66736D]">MoSPI Flash Reports, Inception & Cabinet approvals</span>
              </div>
              <div className="flex items-center justify-center text-[#8C9893] font-bold">+</div>
              <div className="p-3 bg-white rounded-lg border border-[#DDD9D0]">
                <span className="text-xs font-bold text-indigo-700 block mb-1">Historical Curves</span>
                <span className="text-[11px] text-[#66736D]">Multi-year monthly panel curves & trajectory velocity</span>
              </div>
              <div className="flex items-center justify-center text-[#8C9893] font-bold">+</div>
              <div className="p-3 bg-white rounded-lg border border-[#DDD9D0]">
                <span className="text-xs font-bold text-purple-700 block mb-1">External Evidence</span>
                <span className="text-[11px] text-[#66736D]">PIB, Ministry releases, environmental & judicial signals</span>
              </div>
            </div>
            <div className="bg-[#E8F0EC]/70 border-l-4 border-blue-600 p-4 rounded-r-lg text-xs text-blue-900 leading-relaxed flex items-start gap-3">
              <Info className="w-5 h-5 text-[#267A69] shrink-0 mt-0.5" />
              <div>
                <strong>Authoritative Boundary:</strong> PAIMANA-INTEL does not replace official government reporting. 
                Official audited figures remain the ground truth for budgetary allocations. The platform provides early 
                triangulation, identifying emergent risks months before they manifest as formal cost revisions.
              </div>
            </div>
          </section>
        );

      case 'sec-2':
        return (
          <section id="sec-2" className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD9D0]/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3 text-indigo-600">
              <Layers className="w-6 h-6" />
              <h2 className="text-xl font-bold text-[#173F35]">2. System Architecture & Boundaries</h2>
            </div>
            <p className="text-[#26312D] text-sm leading-relaxed">
              The platform implements a clean multi-tier architecture with strict separation of concerns, ensuring high 
              concurrency, point-in-time analytical safety, and zero data corruption:
            </p>

            <div className="bg-slate-900 text-slate-200 p-6 rounded-xl border border-slate-800 space-y-4 text-xs font-mono">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Workflow className="w-4 h-4" />
                  <span>React 18 + TypeScript Client</span>
                </div>
                <span className="text-[#8C9893] text-[11px]">15-Area Project Intelligence, Operator Console, Analytics</span>
              </div>

              <div className="flex justify-center text-[#66736D]">↓ REST / JSON Contracts (Strict DTOs)</div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Server className="w-4 h-4" />
                  <span>Spring Boot 3 API Gateway & Orchestrator</span>
                </div>
                <span className="text-[#8C9893] text-[11px]">Lifecycle Security, Job State, Transactional Boundaries</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <span className="text-purple-400 font-bold block mb-1">Canonical SQLite / Postgres</span>
                  <span className="text-[#8C9893] text-[11px]">Idempotent facts, cost revisions, quarantine, research snapshots</span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <span className="text-amber-400 font-bold block mb-1">Python FastAPI ML & Research Engine</span>
                  <span className="text-[#8C9893] text-[11px]">CatBoost MLOps, TreeSHAP, SearchProvider, ClaimExtractor</span>
                </div>
              </div>
            </div>
          </section>
        );

      case 'sec-3':
        return (
          <section id="sec-3" className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD9D0]/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3 text-[#267A69]">
              <Workflow className="w-6 h-6" />
              <h2 className="text-xl font-bold text-[#173F35]">3. The 12-Stage Monthly Intelligence Lifecycle</h2>
            </div>
            <p className="text-[#26312D] text-sm leading-relaxed">
              When an operator uploads a MoSPI Flash Report PDF, PAIMANA-INTEL executes a fully transactional, 
              incremental intelligence refresh across twelve deterministic gates:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { stage: '1. Document Validation', desc: 'Verifies PDF cryptographic checksum, checks MoSPI table formatting, and asserts idempotency against previously ingested reports.' },
                { stage: '2. Bronze Extraction', desc: 'Parses high-density tabular pages into structured raw records using PyMuPDF and pdfplumber with column alignment recovery.' },
                { stage: '3. Silver Normalization', desc: 'Standardizes numerical types (Crores, Pct, Months), validates date boundaries, and routes anomalies to the Quarantine ledger.' },
                { stage: '4. Project Entity Resolution', desc: 'Maps reported project names and package variants to canonical project IDs using exact matching, alias lookup, and sector/state cross-checks.' },
                { stage: '5. Canonical Facts Ingestion', desc: 'Inserts point-in-time monthly project observations (cost, progress, expenditure, completion targets) without mutating historical rows.' },
                { stage: '6. Affected Scope Identification', desc: 'Isolates the subset of projects updated or newly introduced in the uploaded report, avoiding costly unneeded portfolio-wide sweeps.' },
                { stage: '7. External Internet Deep Dive', desc: 'Executes domain-aware research planning across official portals, PIB, and specialized infrastructure news with zero fake web generation.' },
                { stage: '8. Evidence Resolution & Ranking', desc: 'Filters retrieved sources against a 5-tier trust hierarchy, extracts structured claims, collapses syndicated stories, and detects conflicts.' },
                { stage: '9. Deterministic Metrics Refresh', desc: 'Recomputes cost escalation, physical-financial gaps, progress velocities, and schedule slippage across affected entities.' },
                { stage: '10. Early Warnings & Interventions', desc: 'Evaluates multi-period persistent warning rules, lifecycle suppression, and updates intervention urgency priorities.' },
                { stage: '11. CatBoost Inference & SHAP', desc: 'Refreshes production CatBoost cost and delay probability forecasts with point-in-time safe feature vectors and SHAP attributions.' },
                { stage: '12. Quality Gate & Publication', desc: 'Executes integrity audits, verifies absence of temporal target leakage, updates portfolio rollups, and atomically publishes state.' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-[#DDD9D0] bg-[#FAF8F5]/50 hover:bg-[#FAF8F5] transition-colors">
                  <div className="font-bold text-[#26312D] flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-[#173F35] flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{item.stage}</span>
                  </div>
                  <p className="text-[#66736D] text-[11px] leading-relaxed pl-7">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case 'sec-4':
        return (
          <section id="sec-4" className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD9D0]/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3 text-emerald-600">
              <Database className="w-6 h-6" />
              <h2 className="text-xl font-bold text-[#173F35]">4. Data Foundation & Conceptual Tiers</h2>
            </div>
            <p className="text-[#26312D] text-sm leading-relaxed">
              PAIMANA-INTEL follows the Lakehouse medallion architecture adapted for regulatory compliance and auditability:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="border border-amber-200 bg-amber-50/60 p-4 rounded-xl space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">BRONZE LAYER</span>
                <h4 className="font-bold text-[#173F35]">Raw Source Artifacts</h4>
                <p className="text-[#66736D] text-[11px]">
                  Immutable binary PDFs, raw parsed text segments, unmodified external HTML snippets, and source document hashes.
                </p>
              </div>

              <div className="border border-[#DDD9D0] bg-[#FAF8F5] p-4 rounded-xl space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-[#26312D]">SILVER LAYER</span>
                <h4 className="font-bold text-[#173F35]">Canonical Standardized Data</h4>
                <p className="text-[#66736D] text-[11px]">
                  Resolved projects, validated monthly observations, initial inception baselines, Cabinet RAA revisions, and quarantine records.
                </p>
              </div>

              <div className="border border-[#BED6CB] bg-[#E8F0EC]/60 p-4 rounded-xl space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-200 text-blue-900">GOLD LAYER</span>
                <h4 className="font-bold text-[#173F35]">Analytical Features</h4>
                <p className="text-[#66736D] text-[11px]">
                  Rolling progress velocity, physical-financial gaps, baseline expected progress curves, and multi-period persistence counters.
                </p>
              </div>

              <div className="border border-purple-200 bg-purple-50/60 p-4 rounded-xl space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-200 text-purple-900">INTELLIGENCE</span>
                <h4 className="font-bold text-[#173F35]">Decision Support Outputs</h4>
                <p className="text-[#66736D] text-[11px]">
                  CatBoost ML forecasts, TreeSHAP attributions, early-warning alerts, prioritized interventions, and structured evidence claims.
                </p>
              </div>
            </div>
          </section>
        );

      case 'sec-5':
        return (
          <section id="sec-5" className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD9D0]/90 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-[#267A69]">
              <BarChart2 className="w-6 h-6" />
              <h2 className="text-xl font-bold text-[#173F35]">5. Core Deterministic Metrics & Mathematics</h2>
            </div>
            <p className="text-[#26312D] text-sm leading-relaxed">
              Before running predictive ML, PAIMANA-INTEL computes explicit, auditable metrics from canonical records. 
              No black-box adjustments are applied to official numbers:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-[#DDD9D0] bg-[#FAF8F5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#173F35]">Cost Escalation Percentage</span>
                  <span className="text-[10px] bg-blue-100 text-[#173F35] px-1.5 py-0.5 rounded font-mono">Formula</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-[#DDD9D0] font-mono text-blue-900 text-[11px]">
                  ((Revised Cost - Original Cost) / Original Cost) * 100
                </div>
                <p className="text-[#66736D] text-[11px]">
                  Measures total financial inflation approved or anticipated over the initial sanctioned investment baseline.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#DDD9D0] bg-[#FAF8F5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#173F35]">Physical-Financial Gap</span>
                  <span className="text-[10px] bg-blue-100 text-[#173F35] px-1.5 py-0.5 rounded font-mono">Formula</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-[#DDD9D0] font-mono text-blue-900 text-[11px]">
                  Physical Progress % - (Cumulative Expenditure / Revised Cost * 100)
                </div>
                <p className="text-[#66736D] text-[11px]">
                  A large negative gap indicates financial expenditure significantly outpacing actual on-ground engineering completion.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#DDD9D0] bg-[#FAF8F5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#173F35]">Progress Velocity (Velocity_3M)</span>
                  <span className="text-[10px] bg-blue-100 text-[#173F35] px-1.5 py-0.5 rounded font-mono">Formula</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-[#DDD9D0] font-mono text-blue-900 text-[11px]">
                  (Progress_T - Progress_T-3) / 3.0 [Monthly % Rate]
                </div>
                <p className="text-[#66736D] text-[11px]">
                  Evaluates recent delivery momentum. Near-zero velocity over 3 consecutive cycles signals structural stagnation.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#DDD9D0] bg-[#FAF8F5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#173F35]">Schedule Slippage (Months)</span>
                  <span className="text-[10px] bg-blue-100 text-[#173F35] px-1.5 py-0.5 rounded font-mono">Formula</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-[#DDD9D0] font-mono text-blue-900 text-[11px]">
                  (Anticipated Completion Date - Original Completion Date) in Months
                </div>
                <p className="text-[#66736D] text-[11px]">
                  Quantifies total certified calendar drift against the Cabinet or Ministry-sanctioned milestone target.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-2">
              <span className="font-bold text-indigo-950 text-xs">Composite Risk Index & Lifecycle Damping</span>
              <p className="text-[#26312D] text-xs leading-relaxed">
                The overall project risk score (0–100) balances <strong>Cost Pressure (30%)</strong>, 
                <strong> Schedule Slippage (40%)</strong>, and <strong>Progress Velocity Deficit (30%)</strong>. 
                Crucially, projects in late-stage commissioning (&gt;95% complete) or formally completed status 
                receive automatic lifecycle damping to avoid false-alarm construction alerts.
              </p>
            </div>
          </section>
        );

      case 'sec-6':
        return (
          <section id="sec-6" className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD9D0]/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-bold text-[#173F35]">6. Early Warning Generation & Persistence</h2>
            </div>
            <p className="text-[#26312D] text-sm leading-relaxed">
              PAIMANA-INTEL flags structural vulnerabilities using rule-based criteria combined with multi-cycle persistence tracking:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-[#DDD9D0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <strong className="text-[#173F35] block">Severe Cost Escalation Alert</strong>
                  <span className="text-[#66736D] text-[11px]">Triggered when Revised Cost &gt; Original Cost by &ge; 50% or ₹1,000 Crore</span>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-semibold text-[10px]">CRITICAL</span>
              </div>

              <div className="p-3 rounded-lg border border-[#DDD9D0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <strong className="text-[#173F35] block">Chronic Schedule Drift</strong>
                  <span className="text-[#66736D] text-[11px]">Triggered when Schedule Slippage exceeds 36 months or 50% of sanctioned timeline</span>
                </div>
                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-semibold text-[10px]">HIGH SEVERITY</span>
              </div>

              <div className="p-3 rounded-lg border border-[#DDD9D0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <strong className="text-[#173F35] block">Stagnation / Delivery Freeze</strong>
                  <span className="text-[#66736D] text-[11px]">Physical progress change &lt; 0.5% over 3+ consecutive monthly reporting periods</span>
                </div>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded font-semibold text-[10px]">OPERATIONAL FREEZE</span>
              </div>

              <div className="p-3 rounded-lg border border-[#DDD9D0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <strong className="text-[#173F35] block">Physical-Financial Asymmetry</strong>
                  <span className="text-[#66736D] text-[11px]">Financial expenditure &gt; 80% while certified physical completion &lt; 50%</span>
                </div>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded font-semibold text-[10px]">FISCAL LEAKAGE RISK</span>
              </div>
            </div>
            <p className="text-xs text-[#66736D] italic">
              * Alerts track their active persistence period (e.g. "Triggered for 6 consecutive months"). Unresolved warnings escalate intervention priority scores.
            </p>
          </section>
        );

      case 'sec-7':
        return (
          <section id="sec-7" className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD9D0]/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3 text-purple-600">
              <Cpu className="w-6 h-6" />
              <h2 className="text-xl font-bold text-[#173F35]">7. Machine Learning: CatBoost & TreeSHAP</h2>
            </div>
            <p className="text-[#26312D] text-sm leading-relaxed">
              To forecast forward-looking probabilities, the platform deploys gradient-boosted decision trees using 
              <strong> CatBoost</strong>. These models predict the probability of future cost escalations and schedule slippages:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DDD9D0] space-y-2">
                <span className="font-bold text-[#173F35] block">Dual Classifier & Regressor Architecture</span>
                <p className="text-[#66736D] text-[11px] leading-relaxed">
                  Stage 1 predicts the probability that a project will exceed sanctioned cost/timeline. Stage 2 forecasts the 
                  expected magnitude in Crores or Months. Predictions are framed strictly as probabilistic estimates, not certainty.
                </p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DDD9D0] space-y-2">
                <span className="font-bold text-[#173F35] block">TreeSHAP Local Explainability</span>
                <p className="text-[#66736D] text-[11px] leading-relaxed">
                  Every inference generates exact Shapley additive explanations (TreeSHAP), decomposing the model output 
                  into positive and negative contributions from features like sector, elapsed duration, agency history, and velocity.
                </p>
              </div>
            </div>

            <div className="bg-purple-50/70 border-l-4 border-purple-600 p-4 rounded-r-lg text-xs text-purple-950 space-y-1">
              <strong className="block">Strict Point-in-Time Temporal Split:</strong>
              <p className="text-[#66736D] text-[11px]">
                Training sets are constructed using temporal cutoff validation (e.g. train on data through 2024, validate on 2025–2026). 
                Zero future leakage is tolerated. External evidence retrieved today is never injected into past historical training vectors.
              </p>
            </div>
          </section>
        );

      case 'sec-8':
        return (
          <section id="sec-8" className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD9D0]/90 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-[#267A69]">
              <Search className="w-6 h-6" />
              <h2 className="text-xl font-bold text-[#173F35]">8. External Intelligence Subsystem & Trust Hierarchy</h2>
            </div>
            <p className="text-[#26312D] text-sm leading-relaxed">
              Official monthly reports often lag fast-moving on-ground events by 30–60 days. The External Intelligence 
              subsystem conducts targeted, domain-aware research to uncover emerging blockers and positive milestones:
            </p>

            {/* Source Tier Hierarchy Table */}
            <div className="border border-[#DDD9D0] rounded-xl overflow-hidden text-xs">
              <div className="bg-[#FAF8F5] p-3 font-bold text-[#26312D] border-b border-[#DDD9D0] flex justify-between">
                <span>5-Tier Evidence Source Trust Hierarchy</span>
                <span className="text-[11px] text-[#66736D] font-normal">Methodology v2.4</span>
              </div>
              <div className="divide-y divide-slate-200 bg-white">
                <div className="p-3 flex items-start gap-4">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold shrink-0">Tier 1 (0.98)</span>
                  <div>
                    <strong className="text-[#173F35] block">Primary Authoritative Sources</strong>
                    <span className="text-[#66736D] text-[11px]">PIB, Ministry Press Releases, Implementing Agency Portals (NHAI, RVNL, NTPC), Cabinet Decisions, Court Orders.</span>
                  </div>
                </div>
                <div className="p-3 flex items-start gap-4">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-[#173F35] font-bold shrink-0">Tier 2 (0.85)</span>
                  <div>
                    <strong className="text-[#173F35] block">Institutional Disclosures</strong>
                    <span className="text-[#66736D] text-[11px]">Stock exchange filings (BSE/NSE), annual reports, multilateral lender releases (ADB, World Bank, JICA).</span>
                  </div>
                </div>
                <div className="p-3 flex items-start gap-4">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold shrink-0">Tier 3 (0.70)</span>
                  <div>
                    <strong className="text-[#173F35] block">High-Quality Investigative Journalism</strong>
                    <span className="text-[#66736D] text-[11px]">Major business dailies, national newspapers, and specialist infrastructure engineering publications.</span>
                  </div>
                </div>
                <div className="p-3 flex items-start gap-4">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold shrink-0">Tier 4 (0.45)</span>
                  <div>
                    <strong className="text-[#173F35] block">Secondary Aggregators</strong>
                    <span className="text-[#66736D] text-[11px]">General news portals, industry press digests. Used solely for lead discovery, never as sole authority.</span>
                  </div>
                </div>
                <div className="p-3 flex items-start gap-4">
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-[#26312D] font-bold shrink-0">Tier 5 (0.20)</span>
                  <div>
                    <strong className="text-[#173F35] block">Unverified Web & Community Signals</strong>
                    <span className="text-[#66736D] text-[11px]">Social media, local forums. Strictly quarantined; cannot independently establish project claims.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 text-xs text-red-950 space-y-1">
              <strong className="flex items-center gap-1.5 text-red-800">
                <Lock className="w-4 h-4" /> Cardinal Data-Governance Rule:
              </strong>
              <p className="text-[#26312D] text-[11px] leading-relaxed">
                External internet intelligence <strong>CANNOT and NEVER WILL silently overwrite canonical facts</strong> extracted from 
                official reports (sanctioned cost, physical progress, expenditure). External observations live in segregated 
                evidence tables and provide explanatory attribution and context flags.
              </p>
            </div>
          </section>
        );

      case 'sec-9':
        return (
          <section id="sec-9" className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD9D0]/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3 text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
              <h2 className="text-xl font-bold text-[#173F35]">9. System-Wide Provenance & Trust</h2>
            </div>
            <p className="text-[#26312D] text-sm leading-relaxed">
              Every critical value rendered in PAIMANA-INTEL carries an unambiguous provenance tag:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-lg border border-[#BED6CB] bg-[#E8F0EC]/60">
                <span className="font-bold text-[#173F35] block text-[11px]">[OFFICIAL REPORT]</span>
                <span className="text-[10px] text-[#66736D]">MoSPI Flash Report / CPR extract</span>
              </div>
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60">
                <span className="font-bold text-emerald-800 block text-[11px]">[DETERMINISTIC METRIC]</span>
                <span className="text-[10px] text-[#66736D]">Mathematical formula calculation</span>
              </div>
              <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/60">
                <span className="font-bold text-purple-800 block text-[11px]">[CATBOOST FORECAST]</span>
                <span className="text-[10px] text-[#66736D]">ML probabilistic prediction</span>
              </div>
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60">
                <span className="font-bold text-amber-800 block text-[11px]">[EXTERNAL EVIDENCE]</span>
                <span className="text-[10px] text-[#66736D]">Web researched & ranked claim</span>
              </div>
            </div>

            <p className="text-xs text-[#66736D] leading-relaxed">
              Full lineage tracing allows any stakeholder to trace: 
              <code className="bg-[#FAF8F5] text-[#26312D] px-1.5 py-0.5 rounded font-mono text-[11px]">
                Displayed Value → Analytical Metric → Canonical Fact → Source Document Hash → Ingestion Run ID
              </code>.
            </p>
          </section>
        );

      case 'sec-10':
        return (
          <section id="sec-10" className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD9D0]/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3 text-[#267A69]">
              <FileCheck className="w-6 h-6" />
              <h2 className="text-xl font-bold text-[#173F35]">10. Data Quality Gates & Quarantine</h2>
            </div>
            <p className="text-[#26312D] text-sm leading-relaxed">
              To prevent corrupt or inconsistent rows from entering downstream aggregations, the pipeline applies 
              automated quality gates at every ingestion cycle:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#DDD9D0] space-y-1">
                <strong className="text-[#173F35] block">Boundary Checks</strong>
                <p className="text-[#66736D] text-[11px]">
                  Physical progress strictly in 0–100%. Expenditure cannot be negative. Dates must conform to valid calendar ranges.
                </p>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#DDD9D0] space-y-1">
                <strong className="text-[#173F35] block">Quarantine Isolation</strong>
                <p className="text-[#66736D] text-[11px]">
                  Records with missing project identifiers or unparseable currency fields are quarantined for operator inspection.
                </p>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#DDD9D0] space-y-1">
                <strong className="text-[#173F35] block">Idempotent Hashes</strong>
                <p className="text-[#66736D] text-[11px]">
                  Uploading identical monthly reports verifies the content hash and prevents duplicate observations from being inserted.
                </p>
              </div>
            </div>
          </section>
        );

      case 'sec-11':
        return (
          <section id="sec-11" className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD9D0]/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3 text-[#26312D]">
              <Activity className="w-6 h-6 text-[#267A69]" />
              <h2 className="text-xl font-bold text-[#173F35]">11. Operational Lifecycle: New Flash Report</h2>
            </div>
            <p className="text-[#26312D] text-sm leading-relaxed">
              The platform is operated by uploading official monthly monitoring reports through the Operator Console (`/operations`). 
              The system automatically sequences through extraction, resolution, targeted research, metric recalculation, and prediction refresh:
            </p>

            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#DDD9D0] text-xs text-[#26312D] space-y-2">
              <div className="flex items-center gap-2 text-[#173F35] font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero Manual Button Mashing</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#66736D]">
                Operators do not need to manually click separate buttons to refresh metrics, predictions, or rollups. 
                The 12-stage orchestrator handles dependent rollups atomically, leaving dashboards in a unified, consistent state.
              </p>
            </div>
          </section>
        );

      case 'sec-12':
        return (
          <section id="sec-12" className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD9D0]/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3 text-[#26312D]">
              <Clock className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold text-[#173F35]">12. Limitations & Responsible Interpretation</h2>
            </div>
            <p className="text-[#26312D] text-sm leading-relaxed">
              To ensure responsible governance and credible auditing, users should interpret PAIMANA-INTEL with the following 
              explicit boundaries in mind:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 space-y-1">
                <strong className="text-amber-950 block">Official Reporting Lag</strong>
                <p className="text-[#66736D] text-[11px]">
                  MoSPI Flash Reports reflect data submitted by implementing agencies as of the end of the previous month. 
                  Rapid on-ground shifts may take one reporting cycle to appear in official documentation.
                </p>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 space-y-1">
                <strong className="text-amber-950 block">Probabilistic Predictions</strong>
                <p className="text-[#66736D] text-[11px]">
                  CatBoost model forecasts represent empirical risk probabilities based on historical project patterns. 
                  They are guidance tools, not deterministic guarantees of future project performance.
                </p>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 space-y-1">
                <strong className="text-amber-950 block">External Evidence Coverage</strong>
                <p className="text-[#66736D] text-[11px]">
                  Absence of external internet evidence does not imply absence of project risk. Remote or lower-profile packages 
                  may receive less media coverage than high-profile national corridors.
                </p>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 space-y-1">
                <strong className="text-amber-950 block">Decisive Interventions</strong>
                <p className="text-[#66736D] text-[11px]">
                  Intervention recommendations are prioritized using multi-factor heuristics (cost, persistence, severity). 
                  They highlight areas for administrative inquiry, not automatic executive directives.
                </p>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const formatSearchProvider = (provider?: string) => {
    if (!provider) return 'Composite Gov Direct';
    if (provider.toLowerCase().includes('composite')) return 'Composite Gov Direct';
    if (provider.toLowerCase().includes('duckduckgo')) return 'Public Web Intel';
    if (provider.toLowerCase().includes('serp')) return 'SerpAPI Search';
    return provider.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 22);
  };

  return (
    <div id="methodology-content-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner - Institutional Warm Editorial Theme with authentic engineering context */}
      <div className="bg-[#FAF8F5] border border-[#DDD9D0] rounded-xl p-6 sm:p-8 shadow-xs relative overflow-hidden border-l-4 border-l-[#173F35]">
        {/* Subtle authentic infrastructure contextual backdrop */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none bg-cover bg-right hidden md:block"
          style={{ 
            backgroundImage: 'url(/banner4-BesNf3Ns.png)',
            maskImage: 'linear-gradient(to right, transparent, black 70%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 70%)'
          }} 
        />

        <div className="relative z-10 max-w-4xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#E8F0EC] text-[#173F35] border border-[#BED6CB] text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-[#267A69]" />
            <span>Decision Support Methodology & Engineering Specification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#173F35]">
            Systems Architecture & Analytical Methodology
          </h1>
          <p className="text-xs sm:text-sm text-[#52605B] leading-relaxed max-w-3xl">
            PAIMANA Intelligence fuses official infrastructure monitoring records, historical project trajectories, 
            deterministic analytics, predictive CatBoost ML models, and multi-tier external intelligence to surface 
            early-warning signals and explain why they matter for governance and timely intervention.
          </p>
        </div>

        {/* Dynamic Telemetry Strip */}
        <div className="relative z-10 mt-6 pt-5 border-t border-[#E5E0D8] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-lg p-3 border border-[#DDD9D0] shadow-2xs hover:border-[#BED6CB] transition-colors border-t-2 border-t-[#267A69]">
            <span className="text-[11px] text-[#66736D] block font-medium">Methodology Version</span>
            <span className="text-sm font-bold text-[#173F35]">
              {loadingTelemetry ? '...' : telemetry?.active_methodology_version || 'v2.4.0'}
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-[#DDD9D0] shadow-2xs hover:border-[#BED6CB] transition-colors border-t-2 border-t-[#173F35]">
            <span className="text-[11px] text-[#66736D] block font-medium">Production ML</span>
            <span className="text-sm font-bold text-[#173F35]">
              {loadingTelemetry ? '...' : telemetry?.production_model_version || 'CatBoost v2026.07'}
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-[#DDD9D0] shadow-2xs hover:border-[#BED6CB] transition-colors border-t-2 border-t-[#C85A32]">
            <span className="text-[11px] text-[#66736D] block font-medium">Reporting Cycle</span>
            <span className="text-sm font-bold text-[#C85A32]">
              {loadingTelemetry ? '...' : telemetry?.latest_dataset_period || 'Jul 2026'}
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-[#DDD9D0] shadow-2xs hover:border-[#BED6CB] transition-colors border-t-2 border-t-[#173F35]">
            <span className="text-[11px] text-[#66736D] block font-medium">Monitored Projects</span>
            <span className="text-sm font-bold text-[#173F35]">
              {loadingTelemetry ? '...' : (telemetry?.total_monitored_projects?.toLocaleString() || '1,892')}
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-[#DDD9D0] shadow-2xs hover:border-[#BED6CB] transition-colors border-t-2 border-t-[#267A69]">
            <span className="text-[11px] text-[#66736D] block font-medium">Evidence Claims</span>
            <span className="text-sm font-bold text-[#267A69]">
              {loadingTelemetry ? '...' : (telemetry?.total_evidence_claims?.toLocaleString() || '4,280')}
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-[#DDD9D0] shadow-2xs hover:border-[#BED6CB] transition-colors border-t-2 border-t-[#52605B]">
            <span className="text-[11px] text-[#66736D] block font-medium">Search Provider</span>
            <span className="text-sm font-bold text-[#26312D] truncate block" title={telemetry?.search_provider}>
              {loadingTelemetry ? '...' : formatSearchProvider(telemetry?.search_provider)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="bg-white p-5 rounded-2xl border border-[#DDD9D0]/90 shadow-sm space-y-3 lg:sticky lg:top-20">
          <div className="flex items-center justify-between px-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C9893]">
              Methodology Chapters
            </div>
            {/* View Mode Toggle Button */}
            <button
              onClick={() => setViewMode(viewMode === 'focused' ? 'all' : 'focused')}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#66736D] hover:text-[#267A69] bg-[#FAF8F5] hover:bg-[#E8F0EC] px-2 py-0.5 rounded border border-[#DDD9D0] transition-colors"
              title={viewMode === 'focused' ? 'Switch to Continuous Full Document' : 'Switch to Solitary Focused Card View'}
            >
              {viewMode === 'focused' ? (
                <>
                  <Eye className="w-3 h-3 text-[#267A69]" />
                  <span>Focused</span>
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3 text-[#66736D]" />
                  <span>All Docs</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-1.5">
            {sections.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => selectSection(s.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                    isActive
                      ? 'border-2 border-blue-500 bg-[#E8F0EC]/40 text-[#267A69] font-bold shadow-sm'
                      : 'text-[#66736D] hover:text-[#173F35] hover:bg-[#FAF8F5] border border-transparent font-medium'
                  }`}
                >
                  <span>{s.label}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-[#267A69] translate-x-0.5' : 'text-[#8C9893]'}`} />
                </button>
              );
            })}
          </div>

          {/* Quick Info Box */}
          <div className="pt-2 border-t border-[#EAE6DF]">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD9D0]/70 text-[11px] text-[#66736D] leading-relaxed">
              <span className="font-semibold text-[#26312D] block mb-0.5">Auditable Rigor</span>
              Clicking any chapter displays its complete mathematical specification, provenance boundaries, and operational logic.
            </div>
          </div>
        </aside>

        {/* Content Body: Aligned with Sidebar Top */}
        <div className="lg:col-span-3">
          {viewMode === 'focused' ? (
            <div className="space-y-6">
              {/* Solitary Chapter Card - 100% In View */}
              {renderSectionContent(activeSection)}

              {/* Bottom Navigation Pagination Bar */}
              <div className="bg-white p-4 rounded-xl border border-[#DDD9D0]/90 shadow-sm flex items-center justify-between">
                <button
                  onClick={goToPrev}
                  disabled={activeIndex === 0}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeIndex === 0
                      ? 'text-slate-300 cursor-not-allowed bg-[#FAF8F5]'
                      : 'text-[#26312D] bg-white hover:bg-[#FAF8F5] border border-[#DDD9D0] shadow-sm'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Chapter</span>
                </button>

                <div className="text-center">
                  <span className="text-xs text-[#8C9893] font-medium">
                    Chapter {activeIndex + 1} of {sections.length}
                  </span>
                  <span className="text-xs font-bold text-[#26312D] block truncate max-w-[200px] sm:max-w-xs">
                    {sections[activeIndex]?.label}
                  </span>
                </div>

                <button
                  onClick={goToNext}
                  disabled={activeIndex === sections.length - 1}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeIndex === sections.length - 1
                      ? 'text-slate-300 cursor-not-allowed bg-[#FAF8F5]'
                      : 'text-[#267A69] bg-[#E8F0EC] hover:bg-blue-100 border border-[#BED6CB] shadow-sm'
                  }`}
                >
                  <span>Next Chapter</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {sections.map(s => (
                <div key={s.id}>
                  {renderSectionContent(s.id)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
