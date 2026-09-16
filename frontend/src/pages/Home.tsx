import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  AlertTriangle, 
  ArrowRight,
  ShieldAlert,
  Cpu,
  ChevronRight,
  BookOpen,
  Workflow
} from 'lucide-react';
import { api } from '../services/api';
import type { PortfolioSummary, ProjectSummary, SectorSummary } from '../types';
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
          <div className="w-9 h-9 border-3 border-[#267A69] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#66736D] uppercase tracking-wider">
            Loading National Infrastructure Telemetry...
          </span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white border border-[#E5B8B2] rounded-xl p-8 text-center max-w-xl mx-auto shadow-xs">
          <AlertTriangle className="w-10 h-10 mx-auto text-[#B74436] mb-3" />
          <h3 className="font-bold text-[#26312D] text-base">Unable to Load Portfolio Telemetry</h3>
          <p className="text-xs text-[#66736D] mt-1.5 leading-relaxed">
            {error || 'Unable to establish secure handshake with the canonical monitoring database.'}
          </p>
          <button 
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 px-4 py-2 text-xs font-semibold bg-[#173F35] hover:bg-[#267A69] text-white rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Retry Telemetry Handshake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 pb-16">
      
      {/* 1. Full-Bleed Infrastructure Hero Carousel */}
      <section aria-label="National Infrastructure Highlights" className="w-full">
        <HeroCarousel />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* 2. National Infrastructure Snapshot: Clean Editorial Statistic Strip */}
        <section aria-label="National Infrastructure Snapshot">
          <div className="bg-white border border-[#DDD9D0] rounded-xl p-6 sm:p-7 shadow-xs">
            
            {/* Strip Header */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[#EAE6DF]">
              <div>
                <span className="text-[10px] font-bold text-[#267A69] uppercase tracking-widest">
                  Executive Brief
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#173F35] tracking-tight">
                  National Infrastructure Snapshot
                </h2>
              </div>
              <div className="text-xs text-[#66736D]">
                MoSPI Reporting Cycle: <strong className="text-[#173F35] font-semibold tabular-nums">{data.latestReportingPeriod}</strong>
              </div>
            </div>

            {/* 6 Metrics in an Integrated Divided Editorial Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y lg:divide-y-0 lg:divide-x divide-[#EAE6DF] pt-5">
              
              {/* Stat 1 */}
              <div className="px-3 sm:px-4 py-3 first:pl-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#66736D]">
                  Monitored Projects
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#173F35] tracking-tight tabular-nums mt-1">
                  {data.totalProjects.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#66736D] mt-0.5">
                  Central Sector (₹150 Cr+)
                </div>
              </div>

              {/* Stat 2 */}
              <div className="px-3 sm:px-4 py-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#66736D]">
                  Revised Outlay
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#173F35] tracking-tight tabular-nums mt-1">
                  ₹{(data.totalRevisedCostCr / 100000).toFixed(2)}L Cr
                </div>
                <div className="text-[11px] text-[#C89432] font-semibold mt-0.5 tabular-nums">
                  +{data.portfolioCostEscalationPct.toFixed(1)}% Escalation
                </div>
              </div>

              {/* Stat 3 */}
              <div className="px-3 sm:px-4 py-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#66736D]">
                  Cumulative Spend
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#267A69] tracking-tight tabular-nums mt-1">
                  ₹{(data.totalCumulativeExpenditureCr / 100000).toFixed(2)}L Cr
                </div>
                <div className="text-[11px] text-[#66736D] mt-0.5 tabular-nums">
                  Financial: {data.portfolioExpenditurePct.toFixed(1)}%
                </div>
              </div>

              {/* Stat 4 */}
              <div className="px-3 sm:px-4 py-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#66736D]">
                  Attention Required
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#B74436] tracking-tight tabular-nums mt-1">
                  {data.projectsRequiringAttentionCount.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#B74436] font-medium mt-0.5 tabular-nums">
                  {data.criticalRiskCount} Critical | {data.highRiskCount} High
                </div>
              </div>

              {/* Stat 5 */}
              <div className="px-3 sm:px-4 py-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#66736D]">
                  Average Progress
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#173F35] tracking-tight tabular-nums mt-1">
                  {data.averagePhysicalProgressPct.toFixed(1)}%
                </div>
                <div className="text-[11px] text-[#267A69] font-medium mt-0.5">
                  Physical Completion
                </div>
              </div>

              {/* Stat 6 */}
              <div className="px-3 sm:px-4 py-3 last:pr-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#66736D]">
                  Active Warnings
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#C89432] tracking-tight tabular-nums mt-1">
                  {data.activeWarningsCount.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#66736D] mt-0.5">
                  Triggered Triage Signals
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. Real Geographical India Map: India Infrastructure Pulse */}
        <section aria-label="India Infrastructure Pulse">
          <IndiaMap
            states={data.stateDistribution || []}
            selectedState={selectedState}
            onSelectState={setSelectedState}
            title="India Infrastructure Pulse"
            subtitle="Explore geographic investment volumes, project clusters, and regional risk alerts across India's states and territories."
          />
        </section>

        {/* 4. Projects Requiring Immediate Attention: Authoritative Table */}
        <section aria-label="Projects Requiring Attention" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDD9D0]">
            <div>
              <div className="flex items-center gap-2 text-[#B74436] text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Executive Prioritization</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#173F35] tracking-tight mt-0.5">
                Projects Requiring Executive Attention
              </h2>
              <p className="text-xs text-[#66736D] mt-0.5">
                Ranked by composite risk severity, cost escalation magnitude, and active early warning signals.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/early-warning')}
              className="px-3.5 py-2 rounded-lg bg-white border border-[#DDD9D0] hover:border-[#173F35] text-xs font-semibold text-[#173F35] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>View Early Warning Center</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#267A69]" />
            </button>
          </div>

          {/* Authoritative Table */}
          <div className="bg-white border border-[#DDD9D0] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse atlas-table">
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
                <tbody className="divide-y divide-[#EAE6DF]">
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
                  ).map((prj) => {
                    const isCritical = prj.riskBand === 'CRITICAL';
                    const isHigh = prj.riskBand === 'HIGH';

                    return (
                      <tr 
                        key={prj.projectId} 
                        className={`transition-colors ${
                          isCritical ? 'bg-[#FDF9F8] hover:bg-[#FBEFEE]' : isHigh ? 'bg-[#FCFAF4] hover:bg-[#F8F3E6]' : 'hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#173F35] text-xs sm:text-sm line-clamp-1">
                            {prj.projectName}
                          </div>
                          <div className="text-[11px] font-mono text-[#66736D] mt-0.5">
                            ID: {prj.projectId}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-xs text-[#26312D]">
                          <div className="font-semibold text-[#173F35]">{prj.sectorName}</div>
                          <div className="text-[11px] text-[#66736D] line-clamp-1">{prj.ministryName}</div>
                        </td>

                        <td className="py-3 px-4 text-xs text-[#66736D]">
                          {prj.stateName}
                        </td>

                        <td className="py-3 px-4">
                          <RiskBadge band={prj.riskBand} score={prj.overallRiskScore} />
                        </td>

                        <td className="py-3 px-4 text-xs font-semibold text-right tabular-nums">
                          {prj.costEscalationPct > 0 ? (
                            <span className="text-[#B74436]">+{prj.costEscalationPct.toFixed(1)}%</span>
                          ) : (
                            <span className="text-[#66736D]">0.0%</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-xs font-semibold text-right tabular-nums">
                          {prj.scheduleSlippageMonths > 0 ? (
                            <span className="text-[#B74436]">{prj.scheduleSlippageMonths} mo</span>
                          ) : (
                            <span className="text-[#267A69]">On Track</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-[#F5EEDB] text-[#C89432] border border-[#DFCBB0] tabular-nums">
                            {prj.activeWarningCount}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => navigate(`/projects/${prj.projectId}`)}
                            className="px-2.5 py-1.5 rounded-md bg-white hover:bg-[#173F35] text-[#173F35] hover:text-white border border-[#DDD9D0] text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. Sector Intelligence Overview */}
        <section aria-label="Sector Intelligence" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDD9D0]">
            <div>
              <div className="flex items-center gap-2 text-[#267A69] text-xs font-bold uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                <span>Sector Intelligence</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#173F35] tracking-tight mt-0.5">
                Central Infrastructure Sectors
              </h2>
              <p className="text-xs text-[#66736D] mt-0.5">
                Portfolio distribution, capital intensity, and execution pace across major infrastructure sectors.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/sectors')}
              className="px-3.5 py-2 rounded-lg bg-white border border-[#DDD9D0] hover:border-[#173F35] text-xs font-semibold text-[#173F35] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>Explore All 12 Sectors</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#267A69]" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectors.map((sec) => (
              <div
                key={sec.sectorName}
                onClick={() => navigate(`/sectors?sectorDetail=${encodeURIComponent(sec.sectorName)}`)}
                className="bg-white border border-[#DDD9D0] rounded-xl p-4 sm:p-5 shadow-xs hover:border-[#267A69] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <h3 className="font-bold text-[#173F35] text-sm line-clamp-1">
                      {sec.sectorName}
                    </h3>
                    <span className="text-xs font-bold text-[#173F35] bg-[#E8F0EC] px-2 py-0.5 rounded border border-[#BED6CB] flex-shrink-0 tabular-nums">
                      {sec.projectCount} prjs
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#66736D] mt-3">
                    <div className="flex items-center justify-between">
                      <span>Revised Outlay:</span>
                      <span className="font-bold text-[#26312D] tabular-nums">
                        ₹{(sec.totalRevisedCostCr / 1000).toFixed(1)}k Cr
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Avg Progress:</span>
                      <span className="font-semibold text-[#267A69] tabular-nums">
                        {sec.avgPhysicalProgressPct !== undefined ? sec.avgPhysicalProgressPct.toFixed(1) : '0.0'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Critical / High:</span>
                      <span className="font-semibold text-[#B74436] tabular-nums">
                        {(sec.criticalRiskCount || 0) + (sec.highRiskCount || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EAE6DF] flex items-center justify-between text-[11px] text-[#267A69] font-bold">
                  <span>Sector Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Early Warning & Intervention Story */}
        <section aria-label="Early Warning Intervention Story" className="bg-[#FAF8F5] border border-[#DDD9D0] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl mb-6">
            <div className="flex items-center gap-2 text-[#C89432] text-xs font-bold uppercase tracking-wider">
              <Workflow className="w-3.5 h-3.5" />
              <span>Closed-Loop Decision Support</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#173F35] tracking-tight mt-1">
              From Early Warning Signals to Verified Interventions
            </h2>
            <p className="text-xs sm:text-sm text-[#66736D] mt-1 leading-relaxed">
              PAIMANA translates raw data anomalies into systematic decision-support actions for project authorities and empowered committees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-white border border-[#DDD9D0]">
              <span className="text-[10px] font-mono font-bold text-[#66736D]">PHASE 01</span>
              <div className="font-bold text-[#173F35] text-xs sm:text-sm mt-1">DETECTED</div>
              <p className="text-[11px] text-[#66736D] mt-1">Automated early warning flags triggered by deterministic and ML thresholds.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#DDD9D0]">
              <span className="text-[10px] font-mono font-bold text-[#66736D]">PHASE 02</span>
              <div className="font-bold text-[#173F35] text-xs sm:text-sm mt-1">REVIEWED</div>
              <p className="text-[11px] text-[#66736D] mt-1">Underlying risk drivers, TreeSHAP attributions, and peer benchmarks analyzed.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#DDD9D0]">
              <span className="text-[10px] font-mono font-bold text-[#66736D]">PHASE 03</span>
              <div className="font-bold text-[#C89432] text-xs sm:text-sm mt-1">ACTION INITIATED</div>
              <p className="text-[11px] text-[#66736D] mt-1">Recommended intervention assigned with responsible authority and target outcome.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#DDD9D0]">
              <span className="text-[10px] font-mono font-bold text-[#66736D]">PHASE 04</span>
              <div className="font-bold text-[#267A69] text-xs sm:text-sm mt-1">MONITORING</div>
              <p className="text-[11px] text-[#66736D] mt-1">Monthly cycle tracking of expenditure velocity, physical progress, and milestone recovery.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#DDD9D0]">
              <span className="text-[10px] font-mono font-bold text-[#66736D]">PHASE 05</span>
              <div className="font-bold text-[#173F35] text-xs sm:text-sm mt-1">RESOLVED</div>
              <p className="text-[11px] text-[#66736D] mt-1">Risk trajectory stabilization confirmed against dual-baseline audit trail.</p>
            </div>
          </div>
        </section>

        {/* 7. How PAIMANA Works & Methodology Credibility Strip */}
        <section aria-label="Methodology and Credibility" className="bg-white border border-[#DDD9D0] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl mb-6">
            <div className="flex items-center gap-2 text-[#267A69] text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              <span>Institutional Rigor</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#173F35] tracking-tight mt-1">
              How PAIMANA Intelligence Operates
            </h2>
            <p className="text-xs sm:text-sm text-[#66736D] mt-1 leading-relaxed">
              A dual-engine infrastructure monitoring architecture combining authoritative deterministic calculations with point-in-time supervised machine learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD9D0]">
              <div className="w-7 h-7 rounded-lg bg-[#E8F0EC] text-[#173F35] flex items-center justify-center font-bold text-xs mb-3 font-mono">
                01
              </div>
              <h4 className="font-bold text-[#173F35] text-xs sm:text-sm">MoSPI Ingestion & Resolution</h4>
              <p className="text-xs text-[#66736D] mt-1.5 leading-relaxed">
                Automated extraction of monthly Flash and Monthly Monitoring Reports with Levenshtein-based entity resolution across project nomenclature shifts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD9D0]">
              <div className="w-7 h-7 rounded-lg bg-[#F5EEDB] text-[#C89432] flex items-center justify-center font-bold text-xs mb-3 font-mono">
                02
              </div>
              <h4 className="font-bold text-[#173F35] text-xs sm:text-sm">Deterministic Metrics Engine</h4>
              <p className="text-xs text-[#66736D] mt-1.5 leading-relaxed">
                Mathematical computation of cost growth factors, physical-financial slippage gaps, expenditure velocity, and historical revision trajectories.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD9D0]">
              <div className="w-7 h-7 rounded-lg bg-[#E8F0EC] text-[#267A69] flex items-center justify-center font-bold text-xs mb-3 font-mono">
                03
              </div>
              <h4 className="font-bold text-[#173F35] text-xs sm:text-sm">CatBoost MLOps Layer</h4>
              <p className="text-xs text-[#66736D] mt-1.5 leading-relaxed">
                Leakage-free point-in-time forecasting models predicting final cost escalation, probability of severe delay, and completion horizons with SHAP attributions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD9D0]">
              <div className="w-7 h-7 rounded-lg bg-[#F5E7E4] text-[#B74436] flex items-center justify-center font-bold text-xs mb-3 font-mono">
                04
              </div>
              <h4 className="font-bold text-[#173F35] text-xs sm:text-sm">Early Warning & Triage</h4>
              <p className="text-xs text-[#66736D] mt-1.5 leading-relaxed">
                Multi-criteria triage engine prioritizing projects for Empowered Committee interventions with evidence provenance and causal factor mapping.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAE6DF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[#66736D]">
              Read complete mathematical formulations, loss functions, and data lineage documentation.
            </span>
            <button
              type="button"
              onClick={() => navigate('/methodology')}
              className="px-4 py-2 rounded-lg bg-[#173F35] hover:bg-[#267A69] text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#F5EEDB]" />
              <span>Inspect Technical Methodology</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};
