import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Cpu,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import type { PortfolioSummary, ProjectSummary, SectorSummary } from '../types';
import { KpiCard } from '../components/common/KpiCard';
import { RiskBadge } from '../components/common/Badges';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { IndiaMap } from '../components/map/IndiaMap';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PortfolioSummary | null>(null);
  const [priorityProjects, setPriorityProjects] = useState<ProjectSummary[]>([]);
  const [sectors, setSectors] = useState<SectorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getHomeSummary(),
      api.getProjects({ riskBand: 'CRITICAL', sortBy: 'risk', size: 6 }).catch(() => null),
      api.getSectors().catch(() => [])
    ])
      .then(([homeData, criticalPrjs, sectorsData]) => {
        setData(homeData);
        if (criticalPrjs?.projects && criticalPrjs.projects.length > 0) {
          setPriorityProjects(criticalPrjs.projects);
        }
        if (sectorsData && Array.isArray(sectorsData)) {
          setSectors(sectorsData.slice(0, 8));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to initialize executive infrastructure telemetry');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#1877C9] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading National Infrastructure Telemetry...
          </span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center max-w-xl mx-auto shadow-xs">
          <AlertTriangle className="w-10 h-10 mx-auto text-[#C62828] mb-3" />
          <h3 className="font-bold text-slate-900 text-base">Unable to Load Portfolio Telemetry</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            {error || 'Unable to establish secure handshake with the canonical monitoring database.'}
          </p>
          <button 
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 px-4 py-2 text-xs font-semibold bg-[#1877C9] hover:bg-[#123B63] text-white rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Retry Telemetry Handshake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-12">
      {/* SECTION B: Hero Image Carousel (Full-bleed across screen width) */}
      <section aria-label="National Infrastructure Highlights" className="w-full">
        <HeroCarousel />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* SECTION C: National Infrastructure Snapshot */}
        <section aria-label="National Infrastructure Snapshot" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#D9E1EA]">
          <div>
            <span className="text-[11px] font-bold text-[#1877C9] uppercase tracking-wider">
              Executive Telemetry Strip
            </span>
            <h2 className="text-lg font-extrabold text-[#0B2945] tracking-tight">
              National Infrastructure Snapshot
            </h2>
          </div>
          <div className="text-xs text-slate-500">
            Reporting Period: <strong className="text-[#123B63] font-semibold">{data.latestReportingPeriod}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          <KpiCard
            title="Projects Monitored"
            value={data.totalProjects.toLocaleString()}
            subtitle="Central Sector (₹150 Cr+)"
            colorClass="text-[#0B2945]"
            icon={<Building className="w-4 h-4 text-[#1877C9]" />}
          />

          <KpiCard
            title="Revised Cost"
            value={`₹${(data.totalRevisedCostCr / 100000).toFixed(2)}L Cr`}
            subtitle={`Original: ₹${(data.totalOriginalCostCr / 100000).toFixed(2)}L Cr`}
            trendDirection="up"
            trend={`+${data.portfolioCostEscalationPct.toFixed(1)}%`}
            colorClass="text-[#123B63]"
            icon={<TrendingUp className="w-4 h-4 text-amber-500" />}
          />

          <KpiCard
            title="Cumulative Spend"
            value={`₹${(data.totalCumulativeExpenditureCr / 100000).toFixed(2)}L Cr`}
            subtitle={`Financial Spend: ${data.portfolioExpenditurePct.toFixed(1)}%`}
            colorClass="text-[#1877C9]"
          />

          <KpiCard
            title="Attention Required"
            value={data.projectsRequiringAttentionCount.toLocaleString()}
            subtitle={`${data.criticalRiskCount} Critical | ${data.highRiskCount} High Risk`}
            colorClass="text-[#C62828]"
            icon={<ShieldAlert className="w-4 h-4 text-[#C62828]" />}
          />

          <KpiCard
            title="Avg Progress"
            value={`${data.averagePhysicalProgressPct.toFixed(1)}%`}
            subtitle="Weighted Physical Completion"
            colorClass="text-emerald-700"
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          />

          <KpiCard
            title="Active Warnings"
            value={data.activeWarningsCount.toLocaleString()}
            subtitle="Triggered Triage Signals"
            colorClass="text-amber-700"
            icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
          />
        </div>
      </section>

      {/* SECTION D: Real Interactive India Map */}
      <section aria-label="India Infrastructure Pulse">
        <IndiaMap
          states={data.stateDistribution || []}
          selectedState={selectedState}
          onSelectState={setSelectedState}
          title="India Infrastructure Pulse & State Density"
          subtitle="Explore geographic investment volumes, project clusters, and regional risk alerts"
        />
      </section>

      {/* SECTION E: Projects Requiring Immediate Attention */}
      <section aria-label="Projects Requiring Attention" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D9E1EA]">
          <div>
            <div className="flex items-center gap-2 text-[#C62828] text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Priority Flagged Projects</span>
            </div>
            <h2 className="text-lg font-extrabold text-[#0B2945] tracking-tight">
              Projects Requiring Immediate Executive Attention
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by composite risk severity, cost escalation magnitude, and active early warning signals.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/early-warning')}
            className="px-3.5 py-2 rounded-lg bg-white border border-[#D9E1EA] hover:border-[#1877C9] text-xs font-semibold text-[#123B63] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Open Early Warning Queue</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#1877C9]" />
          </button>
        </div>

        {/* Prioritized Table of Attention Projects */}
        <div className="bg-white border border-[#D9E1EA] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse gov-table">
              <thead>
                <tr>
                  <th className="w-1/3">Project & Identity</th>
                  <th>Sector & Ministry</th>
                  <th>State</th>
                  <th>Risk Band</th>
                  <th className="text-right">Cost Escalation</th>
                  <th className="text-right">Schedule Delay</th>
                  <th className="text-center">Active Warnings</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(priorityProjects.length > 0 
                  ? priorityProjects 
                  : data.recentChanges.slice(0, 6).map((rc) => ({
                      projectId: rc.project_id,
                      projectName: rc.project_name,
                      sectorName: rc.sector_name,
                      ministryName: 'Central Implementing Ministry',
                      agencyName: '',
                      stateName: 'National Corridor',
                      multiState: false,
                      originalCostCr: 0,
                      latestRevisedCostCr: 0,
                      cumulativeExpenditureCr: 0,
                      physicalProgressPct: 0,
                      costEscalationPct: 0,
                      scheduleSlippageMonths: 0,
                      overallRiskScore: rc.overall_risk_score,
                      riskBand: rc.risk_band,
                      riskTrajectory: rc.risk_trajectory,
                      activeWarningCount: rc.active_warning_count,
                      interventionPriorityScore: 0,
                      interventionRecommendation: 'Executive review recommended',
                      latestReportingMonth: data.latestReportingPeriod
                    }))
                ).map((prj) => (
                  <tr key={prj.projectId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-1">
                        {prj.projectName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                        ID: {prj.projectId}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-600">
                      <div className="font-medium text-slate-800">{prj.sectorName}</div>
                      <div className="text-[11px] text-slate-600 line-clamp-1">{prj.ministryName}</div>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-700">
                      {prj.stateName}
                    </td>

                    <td className="py-3 px-4">
                      <RiskBadge band={prj.riskBand} score={prj.overallRiskScore} />
                    </td>

                    <td className="py-3 px-4 text-xs font-semibold text-right text-slate-800">
                      {prj.costEscalationPct > 0 ? (
                        <span className="text-amber-700">+{prj.costEscalationPct.toFixed(1)}%</span>
                      ) : (
                        <span className="text-slate-600">0.0%</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs font-semibold text-right text-slate-800">
                      {prj.scheduleSlippageMonths > 0 ? (
                        <span className="text-rose-700">{prj.scheduleSlippageMonths} mo</span>
                      ) : (
                        <span className="text-emerald-700">On Track</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {prj.activeWarningCount}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/projects/${prj.projectId}`)}
                        className="px-2.5 py-1.5 rounded-md bg-blue-50 hover:bg-[#1877C9] text-[#1877C9] hover:text-white border border-blue-200 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION F: Sector Intelligence Overview */}
      <section aria-label="Sector Intelligence" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D9E1EA]">
          <div>
            <div className="flex items-center gap-2 text-[#1877C9] text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Sectoral Distribution</span>
            </div>
            <h2 className="text-lg font-extrabold text-[#0B2945] tracking-tight">
              Infrastructure Sector Intelligence
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Portfolio distribution, capital intensity, and execution pace across central infrastructure sectors.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/sectors')}
            className="px-3.5 py-2 rounded-lg bg-white border border-[#D9E1EA] hover:border-[#1877C9] text-xs font-semibold text-[#123B63] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Explore All 12 Sectors</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#1877C9]" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sectors.map((sec) => (
            <div
              key={sec.sectorName}
              onClick={() => navigate(`/sectors?sectorDetail=${encodeURIComponent(sec.sectorName)}`)}
              className="bg-white border border-[#D9E1EA] rounded-xl p-4 shadow-xs hover:border-[#1877C9] hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-[#0B2945] text-sm line-clamp-1">
                    {sec.sectorName}
                  </h3>
                  <span className="text-xs font-bold text-[#1877C9] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex-shrink-0">
                    {sec.projectCount} prjs
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Revised Outlay:</span>
                    <span className="font-semibold text-slate-800">
                      ₹{(sec.totalRevisedCostCr / 1000).toFixed(1)}k Cr
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Avg Progress:</span>
                    <span className="font-semibold text-emerald-700">
                      {sec.avgPhysicalProgressPct !== undefined ? sec.avgPhysicalProgressPct.toFixed(1) : '0.0'}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Critical / High:</span>
                    <span className="font-semibold text-[#C62828]">
                      {(sec.criticalRiskCount || 0) + (sec.highRiskCount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#1877C9] font-semibold">
                <span>View Sector Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION G & H: How PAIMANA Works & Methodology Credibility Strip */}
      <section aria-label="Methodology and Credibility" className="bg-white border border-[#D9E1EA] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl mb-6">
          <div className="flex items-center gap-2 text-[#1877C9] text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            <span>Methodological Rigor</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#0B2945] tracking-tight mt-1">
            How PAIMANA Intelligence Operates
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            A dual-engine infrastructure monitoring architecture combining authoritative deterministic calculations with point-in-time supervised machine learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#1877C9] flex items-center justify-center font-bold text-xs mb-3">
              01
            </div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">MoSPI Ingestion & Resolution</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Automated extraction of monthly Flash and Monthly Monitoring Reports with Levenshtein-based entity resolution across project nomenclature shifts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mb-3">
              02
            </div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Deterministic Metrics Engine</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Mathematical computation of cost growth factors, physical-financial slippage gaps, expenditure velocity, and historical revision trajectories.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mb-3">
              03
            </div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">CatBoost MLOps Layer</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Leakage-free point-in-time forecasting models predicting final cost escalation, probability of severe delay, and completion horizons with SHAP attributions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs mb-3">
              04
            </div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Early Warning & Decision Support</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Multi-criteria triage engine prioritizing projects for Empowered Committee interventions with evidence provenance and causal factor mapping.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Read complete mathematical formulations, loss functions, and data lineage documentation.
          </span>
          <button
            type="button"
            onClick={() => navigate('/methodology')}
            className="px-4 py-2 rounded-lg bg-[#0B2945] hover:bg-[#123B63] text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-300" />
            <span>Inspect Technical Methodology</span>
          </button>
        </div>
      </section>

      </div>
    </div>
  );
};
