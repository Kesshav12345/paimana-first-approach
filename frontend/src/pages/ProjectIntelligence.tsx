import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertTriangle, 
  AlertOctagon,
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  BarChart2, 
  Activity, 
  HelpCircle,
  ExternalLink,
  X,
  Layers,
  ArrowRight,
  Calculator,
  Sliders,
  CheckCircle,
  UserCheck,
  FileText,
  Globe,
  Database,
  BookOpen
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { api } from '../services/api';
import type { ProjectDetail } from '../types';
import { RiskBadge, SeverityBadge, StatusChip } from '../components/common/Badges';

export const ProjectIntelligence: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModalComponent, setActiveModalComponent] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getProjectIntelligence(id)
      .then(res => {
        setDetail(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Project not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#66736D]">Loading Project Intelligence (15 Dimensions)...</span>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-white border border-[#DDD9D0] rounded-lg p-8">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-[#173F35]">Project Intelligence Unavailable</h2>
          <p className="text-xs text-[#66736D] mt-1">{error || 'Unable to locate project record in canonical database'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-[#267A69] hover:bg-blue-600 rounded text-xs font-semibold text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. Project Header & Identity */}
      <div className="bg-white border border-[#DDD9D0] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-[#66736D] hover:text-[#173F35] flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className="text-[#66736D]">|</span>
          <span className="text-xs font-mono text-[#267A69] font-semibold">{detail.projectId}</span>
          {detail.legacyOcmsCode && (
            <span className="text-[11px] text-[#66736D] font-mono">({detail.legacyOcmsCode})</span>
          )}
          {detail.multiState && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              MULTI-STATE
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#173F35] tracking-tight leading-snug">
              {detail.projectName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-[#66736D]">
              <span>Sector: <strong className="text-[#26312D]">{detail.sectorName}</strong></span>
              <span>•</span>
              <span>Ministry: <strong className="text-[#26312D]">{detail.ministryName}</strong></span>
              <span>•</span>
              <span>Agency: <strong className="text-[#26312D]">{detail.agencyName}</strong></span>
              <span>•</span>
              <span>State: <strong className="text-[#26312D]">{detail.stateName}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RiskBadge band={detail.riskBand} score={detail.overallRiskScore} />
            <span className="text-xs text-[#66736D]">Cycle: <strong className="text-[#26312D]">{detail.latestReportingMonth}</strong></span>
          </div>
        </div>

        {/* Provenance Classification & Freshness Bar */}
        <div className="mt-4 pt-3 border-t border-[#DDD9D0] flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#66736D] font-medium mr-1">Data Lineage:</span>
            <span className="px-2 py-0.5 rounded bg-[#E8F0EC] text-blue-700 border border-[#BED6CB] font-mono text-[10px]" title="Authoritative Extract from MoSPI Monthly Monitoring Report">
              [OFFICIAL REPORT: MoSPI {detail.latestReportingMonth}]
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px]" title="Deterministic Mathematics (Escalation, Gaps, Velocity)">
              [DETERMINISTIC METRIC: Engine v2.4]
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono text-[10px]" title="Point-in-time CatBoost Supervised ML Model">
              [CATBOOST FORECAST: {detail.modelVersion || 'v2026.07'}]
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950 text-[#C89432] border border-amber-800 font-mono text-[10px]" title="External Multi-Tier Internet Research & Causal Claims">
              [EXTERNAL EVIDENCE: {detail.researchSummary ? `${detail.researchSummary.sourceCount} Sources` : 'Gov Direct / PIB'}]
            </span>
          </div>

          <div className="flex items-center gap-3 text-[#66736D] text-[11px]">
            <span>External Intel: <strong className="text-[#26312D]">{detail.researchSummary?.completedAt ? new Date(detail.researchSummary.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Current Cycle'}</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Zero Future Leakage</span>
          </div>
        </div>

        {/* Evidence Verification & Dossier Trigger */}
        {detail.researchSummary ? (
          <div className="mt-3 pt-3 border-t border-[#DDD9D0] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wide flex items-center gap-1.5 ${
                detail.researchSummary.status === 'COMPLETED' 
                  ? 'bg-emerald-950/80 text-[#173F35] border border-emerald-700/60' 
                  : 'bg-amber-950/80 text-[#C89432] border border-amber-700/60'
              }`}>
                <Globe className="w-3.5 h-3.5" />
                DEEP-DIVE EVIDENCE: {detail.researchSummary.status} ({Math.round(detail.researchSummary.completenessScore)}% COMPLETE)
              </span>
              <span className="text-[11px] text-[#66736D] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#DDD9D0]">
                Confidence: <strong className="text-emerald-400 font-semibold">{detail.researchSummary.causalConfidence}</strong>
              </span>
              <span className="text-[11px] text-[#66736D] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#DDD9D0]">
                Verified Sources: <strong className="text-[#26312D] font-semibold">{detail.researchSummary.sourceCount}</strong>
              </span>
              <span className="text-[11px] text-[#66736D] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#DDD9D0]">
                Causal Factors: <strong className="text-[#C89432] font-semibold">{detail.researchSummary.causalFactorCount}</strong>
              </span>
            </div>

            <button
              onClick={() => setActiveModalComponent('evidence_dossier')}
              className="px-3 py-1.5 bg-[#173F35] hover:bg-[#267A69] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Evidence Dossier & Non-CUF Provenance</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-[#DDD9D0] flex items-center justify-between text-xs text-[#66736D]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FAF8F5]/70 text-[#66736D] border border-[#DDD9D0]">
                Quantitative Baseline Telemetry (Evidence Research Queued)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* "What Changed This Month?" Delta Tracking Card */}
      {(() => {
        const history = detail.monthlyHistory || [];
        const currRecord = history.length > 0 ? history[history.length - 1] : null;
        const prevRecord = history.length > 1 ? history[history.length - 2] : null;

        const parseNum = (val: any) => {
          const n = Number(val);
          return isNaN(n) ? 0 : n;
        };

        const hasPrev = !!prevRecord;
        const costDelta = hasPrev && currRecord ? parseNum(currRecord.revised_cost_cr) - parseNum(prevRecord.revised_cost_cr) : 0;
        const progressDelta = hasPrev && currRecord ? +(parseNum(currRecord.physical_progress_pct) - parseNum(prevRecord.physical_progress_pct)).toFixed(2) : 0;
        const spendDelta = hasPrev && currRecord ? +(parseNum(currRecord.cumulative_expenditure_cr) - parseNum(prevRecord.cumulative_expenditure_cr)).toFixed(2) : 0;
        const slippageDelta = hasPrev && currRecord ? parseNum(currRecord.schedule_slippage_months) - parseNum(prevRecord.schedule_slippage_months) : 0;
        const riskDelta = hasPrev && currRecord ? +(parseNum(currRecord.overall_risk_score) - parseNum(prevRecord.overall_risk_score)).toFixed(1) : 0;

        return (
          <div className="bg-white border border-[#DDD9D0] rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#173F35] via-[#267A69] to-[#C89432]" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-[#173F35] text-white uppercase tracking-wider">
                  DELTA TRACKING
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#173F35] uppercase tracking-wide">
                  {hasPrev ? `What Changed Since Previous Report (${prevRecord.reporting_month})?` : `Baseline Intelligence Benchmark (${currRecord?.reporting_month || detail.latestReportingMonth})`}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#FAF8F5] border border-[#DDD9D0] text-[#66736D] text-[11px] font-medium">
                  Latest Cycle: <strong className="text-[#173F35] font-bold">{detail.latestReportingMonth}</strong>
                  {hasPrev ? (
                    <> vs <strong className="text-[#26312D] font-bold">{prevRecord.reporting_month}</strong></>
                  ) : (
                    <span className="ml-1 text-[#267A69] font-medium">(First Ingestion Baseline)</span>
                  )}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              {/* 1. Revised Cost Shift */}
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#DDD9D0] flex flex-col justify-between">
                <div>
                  <span className="text-[#66736D] text-[10px] font-bold uppercase tracking-wider block">Revised Cost Shift</span>
                  <div className={`text-base font-extrabold mt-1 tabular-nums ${
                    costDelta > 0 ? 'text-[#B74436]' : costDelta < 0 ? 'text-[#267A69]' : 'text-[#26312D]'
                  }`}>
                    {hasPrev 
                      ? (costDelta > 0 ? `+₹${costDelta.toLocaleString()} Cr` : costDelta < 0 ? `-₹${Math.abs(costDelta).toLocaleString()} Cr` : '₹0 Cr (No Revision)')
                      : `₹${parseNum(detail.latestRevisedCostCr).toLocaleString()} Cr`}
                  </div>
                </div>
                <span className="text-[10px] text-[#66736D] mt-1.5 pt-1.5 border-t border-[#EAE6DF]">
                  {hasPrev ? (costDelta !== 0 ? 'Sanction Revision' : 'Sanction Ceiling Maintained') : 'Current Approved Baseline'}
                </span>
              </div>

              {/* 2. Progress Velocity */}
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#DDD9D0] flex flex-col justify-between">
                <div>
                  <span className="text-[#66736D] text-[10px] font-bold uppercase tracking-wider block">Progress Velocity (1M)</span>
                  <div className={`text-base font-extrabold mt-1 tabular-nums ${
                    progressDelta > 0 ? 'text-[#267A69]' : progressDelta === 0 ? 'text-[#C89432]' : 'text-[#B74436]'
                  }`}>
                    {hasPrev
                      ? (progressDelta > 0 ? `+${progressDelta}%` : progressDelta === 0 ? '0.0% (Stagnant)' : `${progressDelta}%`)
                      : `${detail.physicalProgressPct}%`}
                  </div>
                </div>
                <span className="text-[10px] text-[#66736D] mt-1.5 pt-1.5 border-t border-[#EAE6DF]">
                  {hasPrev ? 'Monthly Physical Advance' : 'Total Certified Physical'}
                </span>
              </div>

              {/* 3. Monthly Disbursement Burn */}
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#DDD9D0] flex flex-col justify-between">
                <div>
                  <span className="text-[#66736D] text-[10px] font-bold uppercase tracking-wider block">Expenditure Outflow</span>
                  <div className="text-base font-extrabold mt-1 tabular-nums text-[#173F35]">
                    {hasPrev
                      ? (spendDelta > 0 ? `+₹${spendDelta.toLocaleString()} Cr` : spendDelta < 0 ? `-₹${Math.abs(spendDelta).toLocaleString()} Cr` : '₹0 Cr')
                      : `₹${parseNum(detail.cumulativeExpenditureCr).toLocaleString()} Cr`}
                  </div>
                </div>
                <div className="text-[10px] mt-1.5 pt-1.5 border-t border-[#EAE6DF]">
                  {hasPrev && progressDelta === 0 && spendDelta > 0 ? (
                    <span className="text-[#B74436] font-bold flex items-center gap-1">
                      <span>⚠️ Spend w/o Progress</span>
                    </span>
                  ) : hasPrev ? (
                    <span className="text-[#66736D]">Monthly Incurred Spend</span>
                  ) : (
                    <span className="text-[#66736D]">Cumulative Expenditure</span>
                  )}
                </div>
              </div>

              {/* 4. Schedule Drift Delta */}
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#DDD9D0] flex flex-col justify-between">
                <div>
                  <span className="text-[#66736D] text-[10px] font-bold uppercase tracking-wider block">Schedule Drift Delta</span>
                  <div className={`text-base font-extrabold mt-1 tabular-nums ${
                    slippageDelta > 0 ? 'text-[#B74436]' : slippageDelta < 0 ? 'text-[#267A69]' : 'text-[#26312D]'
                  }`}>
                    {hasPrev
                      ? (slippageDelta > 0 ? `+${slippageDelta} Mo (Delayed)` : slippageDelta < 0 ? `${slippageDelta} Mo (Recovered)` : '0 Mo (Stable DOC)')
                      : `${detail.scheduleSlippageMonths} Months`}
                  </div>
                </div>
                <span className="text-[10px] text-[#66736D] mt-1.5 pt-1.5 border-t border-[#EAE6DF]">
                  {hasPrev ? 'Anticipated Target Shift' : 'Total Cumulative Delay'}
                </span>
              </div>

              {/* 5. Risk Score Delta */}
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#DDD9D0] flex flex-col justify-between">
                <div>
                  <span className="text-[#66736D] text-[10px] font-bold uppercase tracking-wider block">Risk Score Delta</span>
                  <div className={`text-base font-extrabold mt-1 tabular-nums ${
                    riskDelta > 0 ? 'text-[#B74436]' : riskDelta < 0 ? 'text-[#267A69]' : 'text-[#26312D]'
                  }`}>
                    {hasPrev
                      ? (riskDelta > 0 ? `+${riskDelta} pts` : riskDelta < 0 ? `${riskDelta} pts` : '0.0 pts (Unchanged)')
                      : `${detail.overallRiskScore.toFixed(1)} pts`}
                  </div>
                </div>
                <span className="text-[10px] text-[#66736D] mt-1.5 pt-1.5 border-t border-[#EAE6DF] truncate">
                  Band: {detail.riskBand} ({detail.riskTrajectory})
                </span>
              </div>
            </div>

            {/* Contextual Intelligence Insight if Factors exist */}
            <div className="mt-3 pt-3 border-t border-[#EAE6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              {detail.causalFactors && detail.causalFactors.length > 0 ? (
                <div className="flex items-center gap-2 truncate min-w-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5EEDB] text-[#C89432] border border-[#DFCBB0] uppercase shrink-0">
                    Active Bottleneck Factor
                  </span>
                  <span className="font-semibold text-[#26312D] truncate">
                    {detail.causalFactors[0].factorTitle}
                  </span>
                  <span className="text-[10px] text-[#66736D] bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#DDD9D0] shrink-0">
                    ({detail.causalFactors[0].status})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-[#66736D]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#267A69]" />
                  <span>No critical physical impediment or land bottleneck flagged for current reporting cycle.</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setActiveModalComponent('evidence_dossier')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173F35] hover:text-[#267A69] transition-colors shrink-0 cursor-pointer self-end sm:self-auto"
              >
                <span>Inspect Evidence Dossier</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#267A69]" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* 2 & 3. Current Status & Health Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Current Project Status */}
        <div className="lg:col-span-2 bg-white border border-[#DDD9D0] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#66736D] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#267A69]" />
              2. Current Project Telemetry & Accounting
            </h2>
            <div className="flex items-center gap-2">
              {detail.costRevisions && detail.costRevisions.length > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#E8F0EC] text-[#173F35] border border-[#BED6CB]">
                  {detail.costRevisions.length} Revisions Logged
                </span>
              )}
              <button
                onClick={() => setActiveModalComponent('telemetry_accounting')}
                className="text-[11px] font-semibold text-[#173F35] hover:text-[#267A69] flex items-center gap-1 bg-white hover:bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#DDD9D0] hover:border-[#173F35] transition-colors shadow-2xs cursor-pointer"
                title="Inspect Telemetry Ledger & Revision Audit Trail"
              >
                <span>Inspect</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
              <span className="text-[11px] text-[#66736D]">Physical Progress</span>
              <div className="text-lg font-bold text-[#173F35] mt-1">{detail.physicalProgressPct}%</div>
              <div className="w-full bg-[#FAF8F5] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#267A69] h-full rounded-full" style={{ width: `${detail.physicalProgressPct}%` }} />
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
              <span className="text-[11px] text-[#66736D]">Financial Progress</span>
              <div className="text-lg font-bold text-[#173F35] mt-1">{detail.financialProgressPct}%</div>
              <span className="text-[10px] text-[#66736D]">Gap: {detail.physicalFinancialGap > 0 ? `+${detail.physicalFinancialGap}%` : `${detail.physicalFinancialGap}%`}</span>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
              <span className="text-[11px] text-[#66736D]">Sanctioned vs Revised</span>
              <div className="text-xs font-bold text-[#26312D] mt-1">₹{detail.originalCostCr.toLocaleString()} Cr</div>
              <div className="text-xs font-semibold text-amber-400 mt-0.5">Rev: ₹{detail.latestRevisedCostCr.toLocaleString()} Cr</div>
              {detail.latestCabinetRaaCostCr && detail.latestCabinetRaaCostCr > detail.latestRevisedCostCr && (
                <div className="text-[10px] text-indigo-300 font-semibold mt-0.5" title="Latest Approved Multi-Tier Revised Administrative Sanction (RAA)">
                  {detail.costRevisions && detail.costRevisions.length > 0 && detail.costRevisions[detail.costRevisions.length - 1].revisionTitle.includes('RAA')
                    ? detail.costRevisions[detail.costRevisions.length - 1].revisionTitle.replace(/\(.*\)/, '').trim()
                    : 'Admin Ceiling'}: ₹{detail.latestCabinetRaaCostCr.toLocaleString()} Cr
                </div>
              )}
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
              <span className="text-[11px] text-[#66736D]">Cumulative Spend</span>
              <div className="text-lg font-bold text-emerald-400 mt-1">₹{detail.cumulativeExpenditureCr.toLocaleString()} Cr</div>
              <div className="text-[10px] mt-0.5">
                {detail.cumulativeExpenditureCr > detail.latestRevisedCostCr && detail.physicalProgressPct < 95.0 ? (
                  <span className="text-rose-400 font-semibold" title={`Approved budget exceeded by ₹${(detail.cumulativeExpenditureCr - detail.latestRevisedCostCr).toFixed(1)} Cr. Estimated unfunded cost to complete: ₹${detail.remainingFinancialExposureCr.toLocaleString()} Cr`}>
                    Exhausted • Unfunded: ₹{detail.remainingFinancialExposureCr.toLocaleString()} Cr
                  </span>
                ) : (
                  <span className="text-[#66736D]">
                    Remaining: ₹{detail.remainingFinancialExposureCr.toLocaleString()} Cr
                  </span>
                )}
              </div>
              {detail.latestCabinetRaaCostCr && detail.latestCabinetRaaCostCr > detail.latestRevisedCostCr && (
                <span className="block text-[9px] text-[#66736D] mt-0.5 font-mono">
                  {((detail.cumulativeExpenditureCr / detail.latestCabinetRaaCostCr) * 100).toFixed(1)}% of {detail.costRevisions && detail.costRevisions.length > 0 && detail.costRevisions[detail.costRevisions.length - 1].revisionTitle.includes('RAA')
                    ? detail.costRevisions[detail.costRevisions.length - 1].revisionTitle.replace(/\(.*\)/, '').trim()
                    : 'Admin Ceiling'}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#DDD9D0] text-xs">
            <div>
              <span className="text-[#66736D] block">Sanction Date</span>
              <span className="text-[#26312D] font-mono">{detail.originalApprovalDate || 'N/A'}</span>
              {detail.initialInceptionYear && detail.initialInceptionCostCr && (
                <span className="block text-[9px] text-[#66736D] font-mono mt-0.5" title="Initial State Inception Approval">
                  Inception: {detail.initialInceptionYear} (₹{detail.initialInceptionCostCr.toLocaleString()} Cr)
                </span>
              )}
            </div>
            <div>
              <span className="text-[#66736D] block">Original DOC</span>
              <span className="text-[#26312D] font-mono">{detail.originalDoc || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[#66736D] block">Anticipated DOC</span>
              <span className="text-[#26312D] font-mono text-amber-400">{detail.anticipatedDoc || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[#66736D] block">Schedule Slippage</span>
              <span className={`font-mono font-bold ${detail.scheduleSlippageMonths > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {detail.scheduleSlippageMonths > 0 ? `+${detail.scheduleSlippageMonths} Months` : 'On Schedule'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Project Health Summary */}
        <div className="bg-white border border-[#DDD9D0] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#66736D] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                3. Project Health Summary
              </h2>
              <button
                onClick={() => setActiveModalComponent('health_summary')}
                className="text-[11px] font-semibold text-[#173F35] hover:text-[#267A69] flex items-center gap-1 bg-white hover:bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#DDD9D0] hover:border-[#173F35] transition-colors shadow-2xs cursor-pointer"
                title="Inspect Health Evaluation Methodology"
              >
                <span>Inspect</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-white/60 border border-[#DDD9D0] mb-3">
              <div>
                <span className="text-[11px] text-[#66736D]">Implementation Health</span>
                <div className={`text-sm font-bold flex items-center gap-1.5 mt-0.5 ${
                  detail.healthStatus.includes('CRITICAL') ? 'text-rose-400' :
                  detail.healthStatus.includes('HIGH RISK') ? 'text-amber-400' :
                  detail.healthStatus.includes('MODERATE') ? 'text-yellow-300' :
                  detail.healthStatus.includes('COMPLETED') ? 'text-emerald-400' :
                  detail.healthStatus.includes('COMMISSIONING') ? 'text-[#267A69]' :
                  detail.healthStatus.includes('HEALTHY') || detail.healthStatus === 'IMPROVING' ? 'text-emerald-400' : 'text-[#26312D]'
                }`}>
                  {detail.healthStatus.includes('COMPLETED') ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{detail.healthStatus}</span>
                    </>
                  ) : detail.healthStatus.includes('COMMISSIONING') ? (
                    <>
                      <Activity className="w-4 h-4 text-[#267A69] flex-shrink-0" />
                      <span>{detail.healthStatus}</span>
                    </>
                  ) : detail.healthStatus.includes('CRITICAL') ? (
                    <>
                      <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>{detail.healthStatus}</span>
                    </>
                  ) : detail.healthStatus.includes('HIGH RISK') ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{detail.healthStatus}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{detail.healthStatus}</span>
                    </>
                  )}
                </div>
              </div>
              <RiskBadge band={detail.riskBand} score={detail.overallRiskScore} />
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-semibold text-[#66736D] uppercase tracking-wider">Observed Signals</span>
              {detail.positiveSignals.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="line-clamp-1">{s}</span>
                </div>
              ))}
              {detail.negativeSignals.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="line-clamp-1">{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DDD9D0] text-[11px] text-[#66736D] flex justify-between">
            <span>Active Warnings: <strong className="text-amber-400">{detail.activeWarningCount}</strong></span>
            <span>Trajectory: <strong className="text-[#26312D]">{detail.riskTrajectory}</strong></span>
          </div>
        </div>

      </div>

      {/* 4 & 5. Supervised Machine Learning Forecasts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* 4. Cost Forecast */}
        <div className="bg-white border border-[#DDD9D0] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#66736D] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#267A69]" />
              4. Predictive Cost Forecast (CatBoost)
            </h2>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#E8F0EC] text-[#173F35] border border-[#BED6CB]">
                Supervised ML
              </span>
              <button
                onClick={() => setActiveModalComponent('cost_forecast')}
                className="text-[11px] font-semibold text-[#173F35] hover:text-[#267A69] flex items-center gap-1 bg-white hover:bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#DDD9D0] hover:border-[#173F35] transition-colors shadow-2xs cursor-pointer"
                title="Inspect Cost Forecast Algorithm & Inputs"
              >
                <span>Inspect</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-[#FAF8F5]/70 p-4 rounded border border-[#DDD9D0]">
            <div>
              <span className="text-[11px] text-[#66736D]">Cost Overrun Probability</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                {(detail.costOverrunProbability * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-[#66736D]">Threshold: &gt; 50% Significant</span>
            </div>

            <div>
              <span className="text-[11px] text-[#66736D]">Predicted Final Cost</span>
              <div className="text-2xl font-bold text-[#173F35] mt-1">
                ₹{detail.predictedFinalCostCr.toLocaleString()} Cr
              </div>
              <span className="text-[10px] text-amber-400">
                Overrun: +₹{detail.predictedCostOverrunAmountCr.toLocaleString()} Cr (+{detail.predictedCostOverrunPct.toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#66736D]">
            <span>Data Confidence: <strong className="text-[#26312D]">{detail.costForecastConfidence}</strong></span>
            <span>Model: <strong className="text-[#26312D]">CatBoost Regressor v1.0</strong></span>
          </div>
        </div>

        {/* 5. Schedule Forecast */}
        <div className="bg-white border border-[#DDD9D0] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#66736D] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              5. Predictive Schedule Forecast (CatBoost)
            </h2>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#E8F0EC] text-[#173F35] border border-[#BED6CB]">
                Supervised ML
              </span>
              <button
                onClick={() => setActiveModalComponent('schedule_forecast')}
                className="text-[11px] font-semibold text-[#173F35] hover:text-[#267A69] flex items-center gap-1 bg-white hover:bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#DDD9D0] hover:border-[#173F35] transition-colors shadow-2xs cursor-pointer"
                title="Inspect Schedule Forecast Algorithm & Inputs"
              >
                <span>Inspect</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-[#FAF8F5]/70 p-4 rounded border border-[#DDD9D0]">
            <div>
              <span className="text-[11px] text-[#66736D]">Schedule Overrun Probability</span>
              <div className="text-2xl font-bold text-rose-400 mt-1">
                {(detail.scheduleOverrunProbability * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-[#66736D]">Likelihood of milestone slip</span>
            </div>

            <div>
              <span className="text-[11px] text-[#66736D]">Predicted Total Delay</span>
              <div className="text-2xl font-bold text-[#173F35] mt-1">
                {detail.predictedDelayMonths.toFixed(1)} Months
              </div>
              <span className="text-[10px] text-[#66736D]">
                Est. Completion: <strong className="text-[#26312D]">{detail.predictedCompletionDate || 'Late 2027'}</strong>
                {detail.scheduleSlippageMonths > 0 && (
                  <span className="block text-[9px] text-[#66736D] mt-0.5 font-mono">
                    (Current Slip: {detail.scheduleSlippageMonths.toFixed(1)} mo • Est. Residual: +{Math.max(0, detail.predictedDelayMonths - detail.scheduleSlippageMonths).toFixed(1)} mo)
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#66736D]">
            <span>Data Confidence: <strong className="text-[#26312D]">{detail.scheduleForecastConfidence}</strong></span>
            <span>Model: <strong className="text-[#26312D]">CatBoost Classifier v1.0</strong></span>
          </div>
        </div>

      </div>

      {/* 6 & 7. Overall Risk Decomposition & Trajectory Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 6. Overall Risk Breakdown */}
        <div className="bg-white border border-[#DDD9D0] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#66736D]">
              6. Overall Risk Score Decomposition
            </h2>
            <button
              onClick={() => setActiveModalComponent('risk_decomposition')}
              className="text-[11px] font-semibold text-[#173F35] hover:text-[#267A69] flex items-center gap-1 bg-white hover:bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#DDD9D0] hover:border-[#173F35] transition-colors shadow-2xs cursor-pointer"
              title="Inspect Exact Risk Score Formula"
            >
              <span>Inspect</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="text-center p-4 bg-[#FAF8F5] rounded border border-[#DDD9D0] mb-4">
            <span className="text-xs text-[#66736D]">Composite Risk Index</span>
            <div className="text-3xl font-bold text-rose-400 mt-1">
              {detail.overallRiskScore.toFixed(1)}
              <span className="text-sm font-normal text-[#66736D]"> / 100</span>
            </div>
            <span className="text-xs text-[#66736D] mt-1 inline-block">Band: <strong className="text-[#173F35]">{detail.riskBand}</strong></span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[#26312D] mb-1">
                <span>Cost Risk (35% Weight)</span>
                <span className="font-mono">{detail.costRiskScore.toFixed(0)}</span>
              </div>
              <div className="w-full bg-[#FAF8F5] h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${detail.costRiskScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#26312D] mb-1">
                <span>Schedule Risk (35% Weight)</span>
                <span className="font-mono">{detail.scheduleRiskScore.toFixed(0)}</span>
              </div>
              <div className="w-full bg-[#FAF8F5] h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${detail.scheduleRiskScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#26312D] mb-1">
                <span>Progress Risk (30% Weight)</span>
                <span className="font-mono">{detail.progressRiskScore.toFixed(0)}</span>
              </div>
              <div className="w-full bg-[#FAF8F5] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#267A69] h-full rounded-full" style={{ width: `${detail.progressRiskScore}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* 7. Risk & Performance Trajectory (Chart) */}
        <div className="lg:col-span-2 bg-white border border-[#DDD9D0] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#66736D]">
                7. Risk & Performance Longitudinal Trajectory
              </h2>
              <p className="text-[11px] text-[#66736D]">Observed monthly time-series across monitoring cycles</p>
            </div>
            <button
              onClick={() => setActiveModalComponent('trajectory')}
              className="text-[11px] font-semibold text-[#173F35] hover:text-[#267A69] flex items-center gap-1 bg-white hover:bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#DDD9D0] hover:border-[#173F35] transition-colors shadow-2xs cursor-pointer"
              title="Inspect Trajectory Methodology"
            >
              <span>Inspect</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="h-60 w-full">
            {detail.monthlyHistory && detail.monthlyHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={detail.monthlyHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="reporting_month" stroke="#64748b" textAnchor="end" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="physical_progress_pct" name="Physical Progress (%)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="overall_risk_score" name="Risk Score (0-100)" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="cost_escalation_pct" name="Cost Escalation (%)" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-[#66736D]">
                Insufficient multi-month historical observations for line chart
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 8, 9, 10. Warnings, Why Flagged & Key Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 8. Active Warnings */}
        <div className="bg-white border border-[#DDD9D0] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#66736D] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>8. Active Warnings ({detail.activeWarnings.length})</span>
            </h2>
            <button
              onClick={() => setActiveModalComponent('active_warnings')}
              className="text-[11px] font-semibold text-[#173F35] hover:text-[#267A69] flex items-center gap-1 bg-white hover:bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#DDD9D0] hover:border-[#173F35] transition-colors shadow-2xs cursor-pointer"
              title="Inspect Warning Heuristics & Severity Rules"
            >
              <span>Inspect</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {detail.activeWarnings.length === 0 ? (
              <div className="text-xs text-[#66736D] py-4 text-center space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                <p className="font-semibold text-[#26312D]">Zero active warning alerts</p>
                <p className="text-[11px] text-[#66736D] max-w-xs mx-auto">
                  {detail.projectLifecycleStatus === 'Completed' || detail.physicalProgressPct >= 98.0
                    ? 'Physical construction finished — All historical construction bottlenecks resolved'
                    : 'All operational and financial metrics within statutory tolerance'}
                </p>
              </div>
            ) : (
              detail.activeWarnings.map((w, idx) => (
                <div key={idx} className="p-2.5 rounded bg-[#FAF8F5]/70 border border-[#DDD9D0] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#26312D]">{w.warningType}</span>
                    <SeverityBadge severity={w.severity} />
                  </div>
                  <p className="text-[11px] text-[#66736D] mt-1">{w.triggerCondition}</p>
                  <div className="mt-1.5 flex justify-between text-[10px] text-[#66736D]">
                    <span>Persistence: {w.persistencePeriods} mos</span>
                    <span className="text-amber-400 font-semibold">Alert Severity: {w.interventionPriorityScore.toFixed(0)} / 100</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 9. Why Flagged? */}
        <div className="bg-white border border-[#DDD9D0] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#66736D] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#267A69]" />
              9. Why Is Project Flagged?
            </h2>
            <button
              onClick={() => setActiveModalComponent('why_flagged')}
              className="text-[11px] font-semibold text-[#173F35] hover:text-[#267A69] flex items-center gap-1 bg-white hover:bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#DDD9D0] hover:border-[#173F35] transition-colors shadow-2xs cursor-pointer"
              title="Inspect Detailed Flagging Reasoning"
            >
              <span>Inspect</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {detail.flaggingReasons.map((f, idx) => (
              <div key={idx} className="p-2.5 rounded bg-[#FAF8F5]/70 border border-[#DDD9D0] text-xs">
                <span className="font-semibold text-amber-400 block">{f.signal_type}</span>
                <p className="text-[11px] text-[#26312D] mt-1 leading-relaxed whitespace-pre-line">{f.detail}</p>
              </div>
            ))}

            {detail.researchSummary && (
              <div className="pt-2 border-t border-[#DDD9D0] flex justify-end">
                <button
                  onClick={() => setActiveModalComponent('evidence_dossier')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>View Court Orders & Official Documents in Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 10. Key Risk Drivers (SHAP / Statistical) */}
        <div className="bg-white border border-[#DDD9D0] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#66736D] flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              10. Key Model Risk Drivers (SHAP)
            </h2>
            <button
              onClick={() => setActiveModalComponent('shap_drivers')}
              className="text-[11px] font-semibold text-[#173F35] hover:text-[#267A69] flex items-center gap-1 bg-white hover:bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#DDD9D0] hover:border-[#173F35] transition-colors shadow-2xs cursor-pointer"
              title="Inspect SHAP Additive Feature Contributions"
            >
              <span>Inspect</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {detail.riskDrivers && detail.riskDrivers.length > 0 ? (
              detail.riskDrivers.map((d, idx) => (
                <div key={idx} className="p-2 rounded bg-[#FAF8F5] border border-[#DDD9D0] flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[#26312D]">{d.feature}</span>
                    <span className={`block text-[10px] ${
                      d.direction === 'INCREASES_RISK' ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {d.direction.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-[#26312D]">
                    +{d.contribution}%
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#66736D] py-4 text-center">Tree contributions unavailable</div>
            )}
          </div>
        </div>

      </div>

      {/* 11, 12, 13. Peer Benchmarks, Official Attention, Recommended Measures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 11. Peer Benchmark */}
        <div className="bg-white border border-[#DDD9D0] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#66736D]">
              11. Peer Cohort Benchmark
            </h2>
            <button
              onClick={() => setActiveModalComponent('peer_benchmark')}
              className="text-[11px] font-semibold text-[#173F35] hover:text-[#267A69] flex items-center gap-1 bg-white hover:bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#DDD9D0] hover:border-[#173F35] transition-colors shadow-2xs cursor-pointer"
              title="Inspect Peer Cohort Methodology"
            >
              <span>Inspect</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {detail.peerBenchmark ? (
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded bg-[#FAF8F5] border border-[#DDD9D0]">
                <span className="text-[11px] text-[#66736D]">Cohort Definition</span>
                <div className="font-semibold text-[#173F35] mt-0.5">{detail.peerBenchmark.peer_group}</div>
                <span className="text-[10px] text-[#66736D]">Sample Size: {detail.peerBenchmark.peer_count} Projects</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-[#FAF8F5] border border-[#DDD9D0]">
                  <span className="text-[#66736D]">Peer Avg Progress</span>
                  <div className="text-sm font-bold text-[#26312D] mt-0.5">{detail.peerBenchmark.peer_avg_progress}%</div>
                </div>
                <div className="p-2 rounded bg-[#FAF8F5] border border-[#DDD9D0]">
                  <span className="text-[#66736D]">Peer Avg Delay</span>
                  <div className="text-sm font-bold text-[#26312D] mt-0.5">{detail.peerBenchmark.peer_avg_delay} Mos</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#66736D] py-4 text-center">No comparable peer cohort</div>
          )}
        </div>

        {/* 12. Areas Requiring Official Attention */}
        <div className="bg-white border border-[#DDD9D0] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#66736D]">
              12. Official Attention Priorities
            </h2>
            <button
              onClick={() => setActiveModalComponent('attention_priorities')}
              className="text-[11px] font-semibold text-[#173F35] hover:text-[#267A69] flex items-center gap-1 bg-white hover:bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#DDD9D0] hover:border-[#173F35] transition-colors shadow-2xs cursor-pointer"
              title="Inspect Priority Assessment Criteria"
            >
              <span>Inspect</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {detail.officialAttentionPriorities.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded bg-[#FAF8F5] border border-[#DDD9D0]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">{item.priority} • {item.area}</span>
                <p className="text-[11px] text-[#26312D] mt-0.5 font-medium">{item.evidence}</p>
                <p className="text-[10px] text-[#66736D] mt-1 italic">{item.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 13. Recommended Interventions */}
        <div className="bg-white border border-[#DDD9D0] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#66736D]">
              13. Recommended Interventions
            </h2>
            <button
              onClick={() => setActiveModalComponent('recommended_interventions')}
              className="text-[11px] font-semibold text-[#173F35] hover:text-[#267A69] flex items-center gap-1 bg-white hover:bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#DDD9D0] hover:border-[#173F35] transition-colors shadow-2xs cursor-pointer"
              title="Inspect Data-Driven Recommendation Logic"
            >
              <span>Inspect</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {detail.recommendedInterventions.map((rec, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveModalComponent('recommended_interventions')}
                className="p-2.5 rounded bg-[#FAF8F5] border border-[#DDD9D0] hover:border-[#DDD9D0] cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#26312D] line-clamp-1">{rec.measure}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    rec.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>{rec.priority}</span>
                </div>
                <p className="text-[11px] text-[#66736D] mt-1 line-clamp-2">{rec.reason}</p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#66736D]">
                  <span>Authority: <strong className="text-[#66736D]">{rec.responsible_authority}</strong></span>
                  <span className="text-[#267A69] flex items-center gap-0.5">Details →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 14 & 15. Intervention Tracking & Empirical Effectiveness */}
      <div className="bg-white border border-[#DDD9D0] rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#66736D]">
                14 & 15. Intervention Governance & Operational Status
              </h2>
              <button
                onClick={() => setActiveModalComponent('intervention_governance')}
                className="text-[11px] font-semibold text-[#173F35] hover:text-[#267A69] flex items-center gap-1 bg-white hover:bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#DDD9D0] hover:border-[#173F35] transition-colors shadow-2xs cursor-pointer"
                title="Inspect Intervention Governance Lifecycle"
              >
                <span>Inspect Governance</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-[#66736D] mt-0.5">Formal implementation decisions originating from the Early Warning Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            {detail.interventions.length > 0 ? (
              <StatusChip status={detail.interventionEffectivenessStatus} />
            ) : (detail.projectLifecycleStatus === 'Completed' || detail.healthStatus === 'COMPLETED' || detail.physicalProgressPct >= 98.0) ? (
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                PROJECT COMPLETED & COMMISSIONED
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-[#FAF8F5] text-[#26312D] border border-[#DDD9D0] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                NO INTERVENTION SCHEDULED
              </span>
            )}
          </div>
        </div>

        {detail.interventions.length === 0 ? (
          (detail.projectLifecycleStatus === 'Completed' || detail.healthStatus === 'COMPLETED' || detail.physicalProgressPct >= 98.0) ? (
            <div className="bg-white/60 border border-emerald-800/50 rounded-lg p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xs font-bold text-[#173F35] uppercase tracking-wider">
                      Physical Implementation Completed & Commissioned
                    </h3>
                  </div>
                  <p className="text-xs text-[#26312D] leading-relaxed">
                    This project has successfully completed physical construction and commercial commissioning (Current Progress: <strong className="text-emerald-400">{detail.physicalProgressPct}%</strong>). Zero active construction delays or operational bottlenecks remain. Official actions are limited to routine contractor final bill reconciliations, asset capitalization, and formal Project Completion Report (PCR) submission.
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-[#66736D]">
                    <span>Lifecycle Status: <strong className="text-emerald-400 font-semibold">Completed & Commissioned</strong></span>
                    <span>•</span>
                    <span>Active Warnings: <strong className="text-emerald-400 font-bold">0</strong></span>
                    <span>•</span>
                    <span>Post-Commissioning Measure: <strong className="text-[#26312D]">{detail.recommendedInterventions[0]?.measure || 'Final Commercial Settlement & PCR Submission'}</strong></span>
                  </div>
                </div>

                <div className="flex-shrink-0 px-4 py-2.5 bg-emerald-950/80 border border-emerald-800 text-[#173F35] rounded text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Asset Operational</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/60 border border-[#DDD9D0]/90 rounded-lg p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-[#173F35] uppercase tracking-wider">
                      Awaiting Formal Decision in Early Warning Dashboard
                    </h3>
                  </div>
                  <p className="text-xs text-[#66736D] leading-relaxed">
                    To ensure full operational transparency, PAIMANA tracks actual interventions only after they are officially sanctioned and scheduled through the <strong className="text-[#26312D]">Early Warning Dashboard</strong>. No restructuring or ministerial taskforce has been initiated for this project yet.
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-[#66736D]">
                    <span>Priority Score: <strong className="text-amber-400 font-mono font-bold">{(detail.interventionPriorityScore ?? 0).toFixed(1)} / 100</strong></span>
                    <span>•</span>
                    <span>Active Warnings: <strong className="text-rose-400 font-bold">{detail.activeWarnings.length}</strong></span>
                    <span>•</span>
                    <span>Recommended Action: <strong className="text-[#26312D]">{detail.recommendedInterventions[0]?.measure || 'Routine Monitoring'}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/early-warning')}
                  className="flex-shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-[#267A69] text-[#173F35] rounded text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/30"
                >
                  <span>Schedule in Early Warning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#26312D]">
              <thead className="bg-[#FAF8F5] border-b border-[#DDD9D0] uppercase text-[10px] font-semibold text-[#66736D]">
                <tr>
                  <th className="px-4 py-2">Action Description</th>
                  <th className="px-4 py-2">Authority</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2">Start Date</th>
                  <th className="px-4 py-2">Follow-up</th>
                  <th className="px-4 py-2">Action Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {detail.interventions.map((iv, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F5]/30">
                    <td className="px-4 py-2 font-medium text-[#173F35]">{iv.recommendedIntervention}</td>
                    <td className="px-4 py-2 text-[#66736D]">{iv.responsibleAuthority}</td>
                    <td className="px-4 py-2 text-center"><StatusChip status={iv.interventionStatus} /></td>
                    <td className="px-4 py-2 font-mono text-[#66736D]">{iv.actualStartDate || iv.plannedDate}</td>
                    <td className="px-4 py-2 font-mono text-[#66736D]">{iv.followUpDate}</td>
                    <td className="px-4 py-2 text-[#26312D]">{iv.latestActionNotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Component Evaluation & Deep-Dive Modal */}
      {activeModalComponent && (
        <EvaluationModal 
          componentKey={activeModalComponent} 
          detail={detail} 
          onClose={() => setActiveModalComponent(null)}
          onNavigateEarlyWarning={() => {
            setActiveModalComponent(null);
            navigate('/early-warning');
          }}
        />
      )}

    </div>
  );
};

// -----------------------------------------------------------------------------
// Component Evaluation & Deep-Dive Modal Implementation
// -----------------------------------------------------------------------------

interface EvaluationModalProps {
  componentKey: string;
  detail: ProjectDetail;
  onClose: () => void;
  onNavigateEarlyWarning: () => void;
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({
  componentKey,
  detail,
  onClose,
  onNavigateEarlyWarning
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-[#DDD9D0] rounded-xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD9D0] bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            {componentKey === 'evidence_dossier' ? (
              <>
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#173F35]">
                  Project Evidence Dossier & Non-CUF Provenance
                </span>
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 text-[#267A69]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#66736D]">
                  Technical Evaluation & Methodological Deep-Dive
                </span>
              </>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-[#66736D] hover:text-[#173F35] hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#26312D]">
          {renderEvaluationDetails(componentKey, detail, onNavigateEarlyWarning)}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#DDD9D0] bg-white/60 flex items-center justify-between text-xs text-[#66736D]">
          <div className="flex items-center gap-2">
            <span>Project ID: <strong className="text-[#26312D] font-mono">{detail.projectId}</strong></span>
            <span>•</span>
            <span>Cycle: <strong className="text-[#26312D] font-mono">{detail.latestReportingMonth}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#FAF8F5] hover:bg-slate-700 text-[#173F35] rounded text-xs font-semibold transition-colors"
          >
            Close Deep-Dive
          </button>
        </div>
      </div>
    </div>
  );
};

function renderEvaluationDetails(
  key: string, 
  detail: ProjectDetail, 
  onNavigateEarlyWarning: () => void
): React.ReactNode {
  switch (key) {
    case 'telemetry_accounting':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#173F35] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#267A69]" />
              Dimension 2: Current Project Telemetry & Accounting Ledger
            </h3>
            <p className="text-xs text-[#66736D] mt-1">
              Multi-source synthesis integrating Primary MoSPI / OCMS central baseline telemetry with ground-truth administrative approvals (RAA).
            </p>
          </div>

          {/* Section A: Primary Dataset Telemetry Grid */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#267A69] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              A. Primary Central Telemetry Ledger (MoSPI / OCMS Baseline)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
                <span className="text-[#66736D] block">Physical Progress</span>
                <div className="text-base font-bold text-[#173F35] mt-1">{detail.physicalProgressPct}%</div>
                <span className="text-[10px] text-[#66736D]">Certified field deliverables</span>
              </div>
              <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
                <span className="text-[#66736D] block">Financial Progress</span>
                <div className="text-base font-bold text-[#173F35] mt-1">{detail.financialProgressPct}%</div>
                <span className="text-[10px] text-[#66736D]">Expenditure / Rev. Cost</span>
              </div>
              <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
                <span className="text-[#66736D] block">Physical-Financial Gap</span>
                <div className={`text-base font-bold mt-1 ${detail.physicalFinancialGap < -15 ? 'text-rose-400' : 'text-[#26312D]'}`}>
                  {detail.physicalFinancialGap > 0 ? `+${detail.physicalFinancialGap}%` : `${detail.physicalFinancialGap}%`}
                </div>
                <span className="text-[10px] text-[#66736D]">Physical minus Financial</span>
              </div>
              <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
                <span className="text-[#66736D] block">Schedule Slippage</span>
                <div className={`text-base font-bold mt-1 ${detail.scheduleSlippageMonths > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  +{detail.scheduleSlippageMonths} Months
                </div>
                <span className="text-[10px] text-[#66736D]">Against original DOC</span>
              </div>
              <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
                <span className="text-[#66736D] block">Original Sanction</span>
                <div className="text-sm font-bold text-[#26312D] mt-1">₹{detail.originalCostCr.toLocaleString()} Cr</div>
                <span className="text-[10px] text-[#66736D] font-mono">Date: {detail.originalApprovalDate || 'N/A'}</span>
              </div>
              <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
                <span className="text-[#66736D] block">Latest Central Revised</span>
                <div className="text-sm font-bold text-amber-400 mt-1">₹{detail.latestRevisedCostCr.toLocaleString()} Cr</div>
                <span className="text-[10px] text-[#66736D] font-mono">Escalation: +{detail.costEscalationPct.toFixed(1)}%</span>
              </div>
              <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
                <span className="text-[#66736D] block">Cumulative Spend</span>
                <div className="text-sm font-bold text-emerald-400 mt-1">₹{detail.cumulativeExpenditureCr.toLocaleString()} Cr</div>
                <span className="text-[10px] text-[#66736D] font-mono">Burn to date</span>
              </div>
              <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
                <span className="text-[#66736D] block">Remaining / Unfunded</span>
                <div className={`text-sm font-bold mt-1 ${detail.cumulativeExpenditureCr > detail.latestRevisedCostCr ? 'text-rose-400' : 'text-[#26312D]'}`}>
                  ₹{detail.remainingFinancialExposureCr.toLocaleString()} Cr
                </div>
                <span className="text-[10px] text-[#66736D] font-mono">
                  {detail.cumulativeExpenditureCr > detail.latestRevisedCostCr ? 'Unfunded Completion' : 'Balance Sanction'}
                </span>
              </div>
            </div>
          </div>

          {/* Section B: Inception & Multi-Tier Administrative Revisions Audit Trail */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                B. Chronological Inception & Administrative Cost Revisions (RAA) Audit Trail
              </span>
              {detail.costRevisions && (
                <span className="text-[11px] text-[#66736D]">
                  {detail.costRevisions.length} Milestone Action{detail.costRevisions.length === 1 ? '' : 's'} Documented
                </span>
              )}
            </div>

            {detail.costRevisions && detail.costRevisions.length > 0 ? (
              <div className="border border-[#DDD9D0] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs text-[#26312D]">
                  <thead className="bg-[#FAF8F5] border-b border-[#DDD9D0] uppercase text-[10px] font-semibold text-[#66736D]">
                    <tr>
                      <th className="px-3 py-2">Year / Date</th>
                      <th className="px-3 py-2">Administrative Milestone</th>
                      <th className="px-3 py-2 text-right">Sanctioned Cost</th>
                      <th className="px-3 py-2">Approving Authority</th>
                      <th className="px-3 py-2">Target DOC</th>
                      <th className="px-3 py-2">Scope & Justification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {detail.costRevisions.map((rev, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF8F5]/30">
                        <td className="px-3 py-2.5 font-mono text-[#66736D] whitespace-nowrap">
                          {rev.revisionYear}
                          {rev.approvalDate && <span className="block text-[10px] text-[#66736D]">{rev.approvalDate}</span>}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-[#173F35]">
                          {rev.revisionTitle}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-amber-400 whitespace-nowrap">
                          ₹{rev.sanctionedCostCr.toLocaleString()} Cr
                        </td>
                        <td className="px-3 py-2.5 text-[#26312D] whitespace-nowrap">
                          {rev.approvingAuthority}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[#66736D] whitespace-nowrap">
                          {rev.targetDoc || 'N/A'}
                        </td>
                        <td className="px-3 py-2.5 text-[#66736D] leading-relaxed max-w-xs sm:max-w-md">
                          {rev.scopeAndReasons}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#DDD9D0] text-xs text-[#66736D]">
                <p>Initial sanction approved on <strong className="text-[#26312D]">{detail.originalApprovalDate || 'N/A'}</strong> at <strong className="text-[#26312D]">₹{detail.originalCostCr.toLocaleString()} Cr</strong>. Current active sanction stands at <strong className="text-amber-400">₹{detail.latestRevisedCostCr.toLocaleString()} Cr</strong>.</p>
              </div>
            )}
          </div>

          {/* Section C: Dual-Baseline Accounting & Governance Reconciliation */}
          <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#DDD9D0] space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              C. Dual-Lens Accounting & Governance Reconciliation
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#26312D]">
              <div className="p-3 rounded bg-[#FAF8F5] border border-[#DDD9D0] space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <span>Lens 1: Central Ministry (MoSPI OCMS) Governance</span>
                </div>
                <p className="text-[#66736D] leading-relaxed text-[11px]">
                  Central statutory records benchmark against the approved central ceiling of <strong className="text-[#26312D]">₹{detail.latestRevisedCostCr.toLocaleString()} Cr</strong>. With cumulative disbursements of <strong className="text-emerald-400">₹{detail.cumulativeExpenditureCr.toLocaleString()} Cr</strong>, budget utilization is <strong className="text-rose-400">{detail.financialProgressPct}%</strong>.
                </p>
                <p className="text-[#66736D] leading-relaxed text-[11px]">
                  Until formal central Revised Cost Committee (RCC) ratification is gazetted, the surplus spend of ₹{(detail.cumulativeExpenditureCr - detail.latestRevisedCostCr).toFixed(1)} Cr is treated as central budget exhaustion with estimated unfunded completion exposure of ₹{detail.remainingFinancialExposureCr.toLocaleString()} Cr.
                </p>
              </div>

              <div className="p-3 rounded bg-[#FAF8F5] border border-[#DDD9D0] space-y-1.5">
                <div className="font-bold text-indigo-400 flex items-center gap-1">
                  <span>Lens 2: Ground Execution & Administrative Ceiling (RAA / Multi-Tier Sanction)</span>
                </div>
                {detail.latestCabinetRaaCostCr && detail.latestCabinetRaaCostCr > detail.latestRevisedCostCr ? (
                  <>
                    <p className="text-[#66736D] leading-relaxed text-[11px]">
                      Statutory authorization has been accorded by <strong className="text-[#26312D] font-semibold">{detail.costRevisions && detail.costRevisions.length > 0 ? detail.costRevisions[detail.costRevisions.length - 1].approvingAuthority : 'the Competent Administrative Authority'}</strong> up to <strong className="text-indigo-300 font-bold">₹{detail.latestCabinetRaaCostCr.toLocaleString()} Cr</strong> under {detail.costRevisions && detail.costRevisions.length > 0 ? detail.costRevisions[detail.costRevisions.length - 1].revisionTitle : 'Revised Administrative Approval (RAA)'}.
                    </p>
                    {detail.costRevisions && detail.costRevisions.length > 0 && detail.costRevisions[detail.costRevisions.length - 1].scopeAndReasons && (
                      <p className="text-[#66736D] leading-relaxed text-[11px] italic bg-[#FAF8F5] p-2 rounded border border-[#DDD9D0]">
                        "{detail.costRevisions[detail.costRevisions.length - 1].scopeAndReasons}"
                      </p>
                    )}
                    <p className="text-[#66736D] leading-relaxed text-[11px]">
                      Against this comprehensive administrative ceiling, cumulative spend to date represents <strong className="text-emerald-400 font-bold">{((detail.cumulativeExpenditureCr / detail.latestCabinetRaaCostCr) * 100).toFixed(1)}% financial progress</strong>, aligning with <strong className="text-[#26312D]">{detail.physicalProgressPct}% physical progress</strong> and validating targeted commissioning by <strong className="text-[#26312D]">{detail.anticipatedDoc || 'scheduled completion date'}</strong>.
                    </p>
                  </>
                ) : (
                  <p className="text-[#66736D] leading-relaxed text-[11px]">
                    Project physical deliverables ({detail.physicalProgressPct}%) and cumulative disbursements (₹{detail.cumulativeExpenditureCr.toLocaleString()} Cr) are reconciled against the latest sanctioned administrative approval.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );

    case 'health_summary':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#173F35] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              Dimension 3: Project Health & Signal Evaluation
            </h3>
            <p className="text-xs text-[#66736D] mt-1">
              Deterministic health classification synthesizing physical progress velocity, schedule delay trends, and warning alert pressure.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#DDD9D0] space-y-2">
            <span className="text-xs font-bold text-[#267A69] uppercase tracking-wider">Evaluation Methodology</span>
            <p className="text-xs leading-relaxed text-[#26312D]">
              Implementation Health is evaluated independently of trajectory to reflect absolute distress severity: <strong className="text-rose-400">CRITICAL DISTRESS</strong> (Risk &ge; 70.0 or budget exhausted with physical milestones incomplete), <strong className="text-amber-400">HIGH RISK / VULNERABLE</strong> (50.0–69.9), <strong className="text-yellow-400">MODERATE / WATCHLIST</strong> (25.0–49.9), or <strong className="text-emerald-400">HEALTHY / ON TRACK</strong> (&lt; 25.0). Completed projects are tagged <strong className="text-[#173F35]">COMPLETED & COMMISSIONED</strong>.
            </p>
            <p className="text-xs leading-relaxed text-[#66736D] pt-1 border-t border-[#DDD9D0]">
              <strong className="text-[#26312D]">Risk Trajectory</strong> monitors momentum: projects stalled at high risk without progress are classified as <strong className="text-rose-300">Chronic Stagnation</strong>, preventing severe distress projects from erroneously appearing benign or "Stable".
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Assigned Health</span>
              <div className="text-base font-bold text-[#173F35] mt-1">{detail.healthStatus}</div>
            </div>
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Risk Trajectory</span>
              <div className="text-base font-bold text-amber-400 mt-1">{detail.riskTrajectory}</div>
            </div>
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Active Warnings</span>
              <div className="text-base font-bold text-rose-400 mt-1">{detail.activeWarningCount}</div>
            </div>
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Progress Gap</span>
              <div className="text-base font-bold text-[#173F35] mt-1">{detail.physicalFinancialGap}%</div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#66736D]">Signals Judgement</span>
            <div className="space-y-1.5 text-xs">
              {detail.negativeSignals.map((s, i) => (
                <div key={i} className="p-2.5 rounded bg-rose-950/20 border border-rose-900/50 text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                  <span><strong>Adverse Factor:</strong> {s}</span>
                </div>
              ))}
              {detail.positiveSignals.map((s, i) => (
                <div key={i} className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/50 text-[#173F35] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                  <span><strong>Mitigating Factor:</strong> {s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'cost_forecast':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#173F35] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#267A69]" />
              Dimension 4: Supervised Cost Escalation Forecast (CatBoost ML)
            </h3>
            <p className="text-xs text-[#66736D] mt-1">
              CatBoost gradient-boosted regression trained on 19,755 project-month longitudinal observations.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#DDD9D0] space-y-2">
            <span className="text-xs font-bold text-[#267A69] uppercase tracking-wider">Algorithmic Formulation</span>
            <pre className="text-[11px] font-mono bg-white p-2.5 rounded text-[#C89432] overflow-x-auto">
              Predicted Final Cost = RevisedCost + f_CatBoost(ExpenditureVelocity, TimeElapsedRatio, SectorEscalationRate, ApprovedCostTier)
            </pre>
            <p className="text-xs leading-relaxed text-[#26312D]">
              The model evaluates non-linear cost escalation patterns by analyzing the ratio of expenditure burn relative to physical milestones delivered. If expenditure velocity significantly outpaces physical delivery, the probability of exceeding the latest sanctioned budget escalates exponentially.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Sanctioned Cost</span>
              <div className="text-sm font-bold text-[#26312D] mt-1">₹{detail.originalCostCr.toLocaleString()} Cr</div>
            </div>
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Latest Revised Sanction</span>
              <div className="text-sm font-bold text-amber-400 mt-1">₹{detail.latestRevisedCostCr.toLocaleString()} Cr</div>
            </div>
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Current Cumulative Spend</span>
              <div className="text-sm font-bold text-emerald-400 mt-1">₹{detail.cumulativeExpenditureCr.toLocaleString()} Cr</div>
            </div>
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Predicted Final Cost</span>
              <div className="text-sm font-bold text-[#173F35] mt-1">₹{detail.predictedFinalCostCr.toLocaleString()} Cr</div>
            </div>
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Predicted Overrun</span>
              <div className="text-sm font-bold text-rose-400 mt-1">+{detail.predictedCostOverrunPct.toFixed(1)}%</div>
            </div>
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Overrun Probability</span>
              <div className="text-sm font-bold text-amber-400 mt-1">{(detail.costOverrunProbability * 100).toFixed(1)}%</div>
            </div>
          </div>

          <div className="bg-white/60 p-3 rounded border border-[#DDD9D0] text-xs space-y-1">
            <span className="font-bold text-[#26312D]">Statutory Governance Implication:</span>
            <p className="text-[#66736D]">
              Under Ministry of Finance GFR Rule 130, any project with cost escalation exceeding 20% or ₹500 Cr requires formal Revised Cost Committee (RCC) appraisal before further treasury releases.
            </p>
          </div>
        </div>
      );

    case 'schedule_forecast':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#173F35] flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Dimension 5: Supervised Schedule Delay Forecast (CatBoost ML)
            </h3>
            <p className="text-xs text-[#66736D] mt-1">
              CatBoost dual classifier & quantile regressor estimating milestone completion date and delay likelihood.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#DDD9D0] space-y-2">
            <span className="text-xs font-bold text-[#267A69] uppercase tracking-wider">Algorithmic Formulation</span>
            <pre className="text-[11px] font-mono bg-white p-2.5 rounded text-[#C89432] overflow-x-auto">
              Predicted Delay Months = g_CatBoost(TimeElapsedMonths, RemainingProgressPct, ExecutionVelocity3M, StateClearanceIndex)
            </pre>
            <p className="text-xs leading-relaxed text-[#26312D]">
              Calculates projected completion by analyzing time elapsed versus remaining physical deliverables. When trailing 3-month physical velocity indicates completion cannot mathematically occur before the anticipated Date of Commissioning (DOC), slippage months are projected using empirical distributions of similar peer projects.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Original DOC</span>
              <div className="text-sm font-bold text-[#26312D] mt-1">{detail.originalDoc || 'N/A'}</div>
            </div>
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Anticipated DOC</span>
              <div className="text-sm font-bold text-amber-400 mt-1">{detail.anticipatedDoc || 'N/A'}</div>
            </div>
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Observed Slippage</span>
              <div className="text-sm font-bold text-rose-400 mt-1">+{detail.scheduleSlippageMonths} Months</div>
            </div>
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Schedule Overrun Prob.</span>
              <div className="text-sm font-bold text-amber-400 mt-1">{(detail.scheduleOverrunProbability * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Predicted Delay at Close</span>
              <div className="text-sm font-bold text-[#173F35] mt-1">{detail.predictedDelayMonths.toFixed(1)} Months</div>
            </div>
            <div className="bg-[#FAF8F5]/70 p-3 rounded border border-[#DDD9D0]">
              <span className="text-[#66736D]">Forecast Confidence</span>
              <div className="text-sm font-bold text-[#267A69] mt-1">{detail.scheduleForecastConfidence}</div>
            </div>
          </div>
        </div>
      );

    case 'risk_decomposition':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#173F35] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#267A69]" />
              Dimension 6: Composite Risk Score Decomposition & Weights
            </h3>
            <p className="text-xs text-[#66736D] mt-1">
              Multi-criteria mathematical formulation combining cost, schedule, and execution progress risks into a standardized 0-100 index.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#DDD9D0] space-y-2">
            <span className="text-xs font-bold text-[#267A69] uppercase tracking-wider">Canonical Weighting Formula</span>
            <div className="p-3 bg-white rounded font-mono text-xs text-emerald-400">
              Composite Risk = (0.35 × CostRisk) + (0.35 × ScheduleRisk) + (0.30 × ProgressRisk)
            </div>
            <div className="text-xs text-[#26312D] space-y-1">
              <p>• <strong>Cost Risk (35%):</strong> Normalized from cost escalation percentage and remaining exposure.</p>
              <p>• <strong>Schedule Risk (35%):</strong> Evaluated from schedule slippage months against project baseline duration.</p>
              <p>• <strong>Progress Risk (30%):</strong> Evaluated from physical-financial divergence gap and monthly velocity stagnation.</p>
              <p className="pt-1 text-emerald-400 font-medium">• <strong>Lifecycle-Aware Modulation:</strong> Projects with &ge; 98% progress or verified commercial commissioning have schedule and execution risks attenuated to 0.0 with construction alerts retired, focusing purely on final audited cost variance.</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#DDD9D0] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#66736D]">Project Score Breakdown</span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>Cost Component (Escalation: {detail.costEscalationPct.toFixed(1)}%)</span>
                <span className="font-mono text-amber-400 font-bold">{detail.costRiskScore.toFixed(1)} × 0.35 = {(detail.costRiskScore * 0.35).toFixed(1)} pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Schedule Component (Slippage: {detail.scheduleSlippageMonths} mos)</span>
                <span className="font-mono text-rose-400 font-bold">{detail.scheduleRiskScore.toFixed(1)} × 0.35 = {(detail.scheduleRiskScore * 0.35).toFixed(1)} pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Progress Component (Gap: {detail.physicalFinancialGap}%)</span>
                <span className="font-mono text-[#267A69] font-bold">{detail.progressRiskScore.toFixed(1)} × 0.30 = {(detail.progressRiskScore * 0.30).toFixed(1)} pts</span>
              </div>
              <div className="pt-2 border-t border-[#DDD9D0] flex justify-between items-center text-sm font-bold text-[#173F35]">
                <span>Total Evaluated Risk Score</span>
                <span className="text-rose-400 font-mono">{detail.overallRiskScore.toFixed(1)} / 100 ({detail.riskBand} Band)</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'trajectory':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#173F35] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#267A69]" />
              Dimension 7: Longitudinal Trajectory & Velocity Momentum
            </h3>
            <p className="text-xs text-[#66736D] mt-1">
              Time-series longitudinal tracking across monthly flash report monitoring cycles.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#DDD9D0] space-y-2">
            <span className="text-xs font-bold text-[#267A69] uppercase tracking-wider">Trajectory Evaluation Logic</span>
            <p className="text-xs leading-relaxed text-[#26312D]">
              Assesses the directional velocity of implementation over the trailing 6 to 12 cycles. If physical progress delta continues to fall below 0.2% per month while cost claims continue to grow, the trajectory is stamped <strong className="text-rose-400">DETERIORATING</strong>. If monthly physical completion exceeds historical velocity, the project qualifies as <strong className="text-emerald-400">IMPROVING</strong>.
            </p>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded border border-[#DDD9D0] text-xs">
            <span className="text-[#66736D]">Current Assigned Trajectory:</span>
            <div className="text-base font-bold text-[#173F35] mt-1">{detail.riskTrajectory}</div>
            <p className="text-[#66736D] mt-1">
              Based on empirical monthly history recorded in canonical data cycle {detail.latestReportingMonth}.
            </p>
          </div>
        </div>
      );

    case 'active_warnings':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#173F35] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Dimension 8: Active Early Warning Heuristics & Persistence
            </h3>
            <p className="text-xs text-[#66736D] mt-1">
              Deterministic rule engine triggering prioritized alerts based on statistical threshold breaches.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#DDD9D0] space-y-2">
            <span className="text-xs font-bold text-[#267A69] uppercase tracking-wider">Early Warning Triggers Architecture</span>
            <div className="text-xs text-[#26312D] space-y-1">
              <p>• <strong>EW-COST-01:</strong> Cost Escalation &ge; 20% above sanctioned estimate.</p>
              <p>• <strong>EW-SCHED-01:</strong> Schedule Slippage &ge; 12 Months beyond original DOC.</p>
              <p>• <strong>EW-VEL-01:</strong> Physical velocity stagnation (&lt; 0.2%/mo over 3 cycles).</p>
              <p>• <strong>EW-GAP-01:</strong> Physical-Financial Divergence gap &lt; -15% (disbursements outpacing deliverables).</p>
              <p>• <strong>EW-PERS-01:</strong> Critical trigger persistence &ge; 3 consecutive months.</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#66736D]">Active Alert Triggers ({detail.activeWarnings.length})</span>
            {detail.activeWarnings.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#DDD9D0] text-center space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                <p className="font-semibold text-[#26312D]">Zero Active Alert Triggers</p>
                <p className="text-xs text-[#66736D]">
                  {detail.projectLifecycleStatus === 'Completed' || detail.physicalProgressPct >= 98.0
                    ? 'Physical construction is finished. All historical construction bottlenecks and delay alerts have been formally retired.'
                    : 'No statutory threshold breaches detected in the latest reporting cycle.'}
                </p>
              </div>
            ) : (
              detail.activeWarnings.map((w, idx) => (
                <div key={idx} className="p-3 rounded bg-[#FAF8F5] border border-[#DDD9D0] text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#173F35]">{w.warningType}</span>
                    <SeverityBadge severity={w.severity} />
                  </div>
                  <p className="text-[#26312D]">{w.triggerCondition}</p>
                  <div className="flex justify-between text-[11px] text-[#66736D] pt-1">
                    <span>Persistence: <strong className="text-[#26312D]">{w.persistencePeriods} consecutive cycles</strong></span>
                    <span>Alert Severity Score: <strong className="text-amber-400 font-bold">{w.interventionPriorityScore.toFixed(0)} / 100</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );

    case 'why_flagged':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#173F35] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#267A69]" />
              Dimension 9: Root Cause Flagging Diagnostics
            </h3>
            <p className="text-xs text-[#66736D] mt-1">
              Comprehensive diagnostic reasoning detailing why the monitoring engine flagged this project for intervention review.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#DDD9D0] space-y-2">
            <span className="text-xs font-bold text-[#267A69] uppercase tracking-wider">Evaluation Rationale</span>
            <p className="text-xs leading-relaxed text-[#26312D]">
              The project is flagged when telemetry crosses predefined risk thresholds, indicating systemic delivery bottlenecks that cannot be resolved through routine divisional supervision.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#66736D]">Flagged Criteria & Diagnostics</span>
            {detail.flaggingReasons.map((f, idx) => (
              <div key={idx} className="p-3 rounded bg-[#FAF8F5] border border-[#DDD9D0] text-xs space-y-1">
                <span className="font-bold text-amber-400 uppercase text-[11px]">{f.signal_type}</span>
                <p className="text-[#26312D] leading-relaxed">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'shap_drivers':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#173F35] flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-purple-400" />
              Dimension 10: TreeSHAP Feature Attributions
            </h3>
            <p className="text-xs text-[#66736D] mt-1">
              Game-theoretic Shapley values decomposing individual feature contributions to model risk forecasts.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#DDD9D0] space-y-2">
            <span className="text-xs font-bold text-[#267A69] uppercase tracking-wider">Mathematical Methodology</span>
            <div className="p-2.5 bg-white rounded font-mono text-xs text-purple-300">
              f(x) = E[f(x)] + ∑ φ_i(x)
            </div>
            <p className="text-xs leading-relaxed text-[#26312D]">
              TreeSHAP computes the marginal contribution of each project metric toward increasing or decreasing the predicted risk relative to the baseline portfolio average.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#66736D]">Decomposed Feature Weights</span>
            {detail.riskDrivers.map((d, idx) => (
              <div key={idx} className="p-2.5 rounded bg-[#FAF8F5] border border-[#DDD9D0] flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono font-bold text-[#26312D]">{d.feature}</span>
                  <span className={`block text-[10px] ${d.direction === 'INCREASES_RISK' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {d.direction.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="font-mono text-sm font-bold text-[#173F35]">+{d.contribution}%</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'peer_benchmark':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#173F35] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#267A69]" />
              Dimension 11: Sector & Scale Peer Cohort Clustering
            </h3>
            <p className="text-xs text-[#66736D] mt-1">
              Unsupervised clustering matching projects against comparable infrastructure peers by Sector, Outlay, and Geography.
            </p>
          </div>

          {detail.peerBenchmark ? (
            <div className="space-y-3">
              <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#DDD9D0]">
                <span className="text-xs font-bold text-[#267A69] uppercase tracking-wider">Peer Cohort Definition</span>
                <div className="text-sm font-bold text-[#173F35] mt-1">{detail.peerBenchmark.peer_group}</div>
                <span className="text-xs text-[#66736D]">Cohort Sample Size: {detail.peerBenchmark.peer_count} Capital Projects</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
                  <span className="text-[#66736D]">Peer Average Physical Progress</span>
                  <div className="text-base font-bold text-[#26312D] mt-1">{detail.peerBenchmark.peer_avg_progress}%</div>
                  <span className="text-[10px] text-[#66736D]">This Project: {detail.physicalProgressPct}%</span>
                </div>
                <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
                  <span className="text-[#66736D]">Peer Average Schedule Delay</span>
                  <div className="text-base font-bold text-[#26312D] mt-1">{detail.peerBenchmark.peer_avg_delay} Months</div>
                  <span className="text-[10px] text-rose-400">This Project: {detail.scheduleSlippageMonths} Months</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#66736D] text-center py-6">No comparable peer cohort identified in current dataset</div>
          )}
        </div>
      );

    case 'attention_priorities':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#173F35] flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" />
              Dimension 12: Multi-Criteria Official Attention Priorities
            </h3>
            <p className="text-xs text-[#66736D] mt-1">
              Algorithmic prioritization ranking areas requiring statutory, administrative, and inter-agency intervention.
            </p>
          </div>

          <div className="space-y-2">
            {detail.officialAttentionPriorities.map((p, idx) => (
              <div key={idx} className="p-3 rounded bg-[#FAF8F5] border border-[#DDD9D0] text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#173F35]">{p.area}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">{p.priority}</span>
                </div>
                <p className="text-[#26312D]"><strong>Evidence:</strong> {p.evidence}</p>
                <p className="text-[#66736D]"><strong>Recommended Action:</strong> {p.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'recommended_interventions':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#173F35] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              Dimension 13: Data-Driven Recommended Interventions
            </h3>
            <p className="text-xs text-[#66736D] mt-1">
              Tailored, logic-evaluated operational measures calculated from factual project risk triggers rather than generic templates.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#DDD9D0] space-y-2">
            <span className="text-xs font-bold text-[#267A69] uppercase tracking-wider">Evaluation Rules & Decision Tree</span>
            <div className="text-xs text-[#26312D] space-y-1">
              <p>• <strong>Chronic Delay (&ge;24 mos):</strong> Triggers Critical Path Acceleration & Taskforce Deployment.</p>
              <p>• <strong>Severe Cost Escalation (&ge;20% / &ge;₹500 Cr):</strong> Triggers Revised Cost Committee (RCC) & Quantity Survey Audit.</p>
              <p>• <strong>Physical-Financial Gap (&lt;-15%):</strong> Triggers Physical Output Verification & Staged Disbursement Freeze.</p>
              <p>• <strong>Compound Crisis:</strong> Triggers Inter-Ministerial Restructuring & Cabinet Appraisal.</p>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#66736D]">Tailored Measures for This Project</span>
            {detail.recommendedInterventions.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-[#FAF8F5] border border-[#DDD9D0] text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-[#173F35]">{rec.measure}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rec.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>{rec.priority}</span>
                </div>
                
                <p className="text-[#26312D] leading-relaxed">
                  <strong>Trigger Reason:</strong> {rec.reason}
                </p>

                {rec.evaluation_logic && (
                  <div className="p-2.5 rounded bg-white border border-[#DDD9D0] text-[11px] text-blue-300">
                    <strong>Algorithmic Evaluation:</strong> {rec.evaluation_logic}
                  </div>
                )}

                {rec.action_plan && (
                  <div className="p-2.5 rounded bg-white border border-[#DDD9D0] text-[11px] text-[#26312D]">
                    <strong>Operational Action Plan:</strong> {rec.action_plan}
                  </div>
                )}

                {rec.expected_impact && (
                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-900/50 text-[11px] text-[#173F35]">
                    <strong>Expected Governance Impact:</strong> {rec.expected_impact}
                  </div>
                )}

                <div className="pt-1 text-[11px] text-[#66736D]">
                  Responsible Governance Authority: <strong className="text-[#26312D]">{rec.responsible_authority}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={onNavigateEarlyWarning}
              className="w-full py-2.5 bg-blue-600 hover:bg-[#267A69] text-[#173F35] rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/30"
            >
              <span>Review & Schedule in Early Warning Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );

    case 'intervention_governance':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#173F35] flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Dimensions 14 & 15: Intervention Governance & Lifecycle
            </h3>
            <p className="text-xs text-[#66736D] mt-1">
              Institutional policy governing operational decision-making, transparent action scheduling, and post-intervention audit.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#DDD9D0] space-y-2">
            <span className="text-xs font-bold text-[#267A69] uppercase tracking-wider">Institutional Mandate</span>
            <p className="text-xs leading-relaxed text-[#26312D]">
              PAIMANA maintains a strict separation between <em>algorithmic recommendation</em> (Dimension 13) and <em>formal operational intervention</em> (Dimensions 14 & 15). Recommendations are evaluated automatically by analytical models. Formal interventions, however, are decided and scheduled exclusively through the <strong className="text-[#26312D]">Early Warning Dashboard</strong> by authorized ministry nodal officers and inter-ministerial taskforces.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#DDD9D0] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#66736D]">Current Operational State</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-white border border-[#DDD9D0]">
                <span className="text-[#66736D]">Scheduled Actions</span>
                <div className="text-sm font-bold text-[#173F35] mt-1">
                  {detail.interventions.length > 0 ? `${detail.interventions.length} Active` : '0 (Awaiting Review)'}
                </div>
              </div>
              <div className="p-2.5 rounded bg-white border border-[#DDD9D0]">
                <span className="text-[#66736D]">Intervention Priority</span>
                <div className="text-sm font-bold text-amber-400 mt-1">
                  {(detail.interventionPriorityScore ?? 0).toFixed(1)} / 100
                </div>
              </div>
              <div className="p-2.5 rounded bg-white border border-[#DDD9D0]">
                <span className="text-[#66736D]">Lifecycle Status</span>
                <div className="text-sm font-bold text-[#26312D] mt-1">
                  {detail.interventionEffectivenessStatus}
                </div>
              </div>
            </div>

            <div className="text-xs text-[#66736D] leading-relaxed pt-1">
              {detail.interventions.length === 0 ? (
                <p>
                  Because no formal intervention has been initiated for this project yet, the system transparently reports <strong className="text-[#26312D]">NO FORMAL INTERVENTION SCHEDULED</strong> rather than generating placeholder dates. You can schedule an intervention using the Early Warning workflow below.
                </p>
              ) : (
                <p>
                  Formal intervention is currently active and undergoing monthly empirical tracking to evaluate velocity recovery and cost stabilization.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onNavigateEarlyWarning}
            className="w-full py-2.5 bg-blue-600 hover:bg-[#267A69] text-[#173F35] rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/30"
          >
            <span>Open Early Warning Dashboard to Manage Interventions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      );

    case 'evidence_dossier':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#173F35] flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              Project Evidence Dossier & Non-CUF Provenance
            </h3>
            <p className="text-xs text-[#66736D] mt-1">
              Multi-source empirical investigation integrating central telemetry, court records, parliamentary disclosures, and gazette notifications.
            </p>
          </div>

          {!detail.researchSummary ? (
            <div className="bg-[#FAF8F5] p-6 rounded-lg border border-[#DDD9D0] text-center space-y-3">
              <Database className="w-8 h-8 text-[#66736D] mx-auto" />
              <h4 className="text-sm font-bold text-[#26312D]">Quantitative Baseline Only</h4>
              <p className="text-xs text-[#66736D] max-w-md mx-auto">
                This project is currently queued in the continuous batch processing pipeline. Quantitative telemetry and ML predictions are authoritative, and empirical web deep-dive enrichment will attach upon batch completion.
              </p>
            </div>
          ) : (
            <>
              {/* Section A: Investigation Metadata & Confidence Decomposition */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  A. Investigation Metadata & 3-Way Confidence Decomposition
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
                    <span className="text-[#66736D]">Research Status</span>
                    <div className="mt-1">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        detail.researchSummary.status === 'COMPLETED' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-950 text-[#C89432] border border-amber-800'
                      }`}>
                        {detail.researchSummary.status}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
                    <span className="text-[#66736D]">Completeness Score</span>
                    <div className="text-sm font-bold text-slate-100 mt-1 flex items-center gap-2">
                      <span>{Math.round(detail.researchSummary.completenessScore)}%</span>
                      <div className="w-16 h-1.5 bg-[#FAF8F5] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${detail.researchSummary.completenessScore}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
                    <span className="text-[#66736D]">Model Engine</span>
                    <div className="text-xs font-mono font-semibold text-[#267A69] mt-1">
                      {detail.researchSummary.modelUsed || 'Gemini-3.8-Flash-High'}
                    </div>
                  </div>

                  <div className="bg-[#FAF8F5] p-3 rounded border border-[#DDD9D0]">
                    <span className="text-[#66736D]">Evidence Depth</span>
                    <div className="text-xs text-[#26312D] mt-1">
                      <strong>{detail.researchSummary.sourceCount}</strong> Sources • <strong>{detail.researchSummary.causalFactorCount}</strong> Root Causes
                    </div>
                  </div>
                </div>

                {/* 3-Way Confidence Decomposition */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white/60 p-2.5 rounded border border-[#DDD9D0] flex items-center justify-between">
                    <span className="text-[#66736D]">Data Confidence (Primary Telemetry):</span>
                    <span className="font-bold text-[#267A69] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#DDD9D0]">
                      {detail.researchSummary.dataConfidence}
                    </span>
                  </div>
                  <div className="bg-white/60 p-2.5 rounded border border-[#DDD9D0] flex items-center justify-between">
                    <span className="text-[#66736D]">External Evidence Confidence:</span>
                    <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60">
                      {detail.researchSummary.researchConfidence}
                    </span>
                  </div>
                  <div className="bg-white/60 p-2.5 rounded border border-[#DDD9D0] flex items-center justify-between">
                    <span className="text-[#66736D]">Causal Attribution Confidence:</span>
                    <span className="font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/60">
                      {detail.researchSummary.causalConfidence}
                    </span>
                  </div>
                </div>

                {detail.researchSummary.notes && (
                  <div className="p-3 bg-[#FAF8F5]/90 rounded border border-[#DDD9D0] text-xs">
                    <span className="font-semibold text-[#26312D] block mb-0.5">Methodological Research Notes:</span>
                    <p className="text-[#66736D] leading-relaxed">{detail.researchSummary.notes}</p>
                  </div>
                )}
              </div>

              {/* Section B: Evidence-Adjusted Outlook & Qualitative Interpretation */}
              {detail.evidenceOutlook && (
                <div className="space-y-3 pt-2 border-t border-[#DDD9D0]">
                  <span className="text-xs font-bold text-[#267A69] uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    B. Evidence-Adjusted Outlook & Qualitative Interpretation
                  </span>

                  <div className="p-3.5 bg-[#FAF8F5] rounded-lg border border-[#DDD9D0] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#26312D]">Forecast Alignment Status:</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E8F0EC] text-[#173F35] border border-[#BED6CB]">
                        {detail.evidenceOutlook.forecastConcern.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#26312D]">
                      {detail.evidenceOutlook.evidenceInterpretation}
                    </p>

                    {detail.evidenceOutlook.unresolvedRisks && detail.evidenceOutlook.unresolvedRisks.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#DDD9D0]">
                        <span className="text-[11px] font-bold text-rose-400 block mb-1">Active Critical Path Bottlenecks:</span>
                        <ul className="list-disc list-inside space-y-1 text-xs text-[#B74436]">
                          {detail.evidenceOutlook.unresolvedRisks.map((risk, rIdx) => (
                            <li key={rIdx} className="leading-relaxed">{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section C: Empirical Causal Attribution Ledger */}
              {detail.causalFactors && detail.causalFactors.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-[#DDD9D0]">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    C. Empirical Causal Attribution Ledger ({detail.causalFactors.length} Factors)
                  </span>

                  <div className="space-y-3">
                    {detail.causalFactors.map((factor, fIdx) => (
                      <div key={fIdx} className="p-3.5 bg-[#FAF8F5] rounded-lg border border-[#DDD9D0] text-xs space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF8F5] text-[#C89432] uppercase tracking-wider">
                              {factor.category}
                            </span>
                            <span className="font-bold text-[#173F35] text-xs">{factor.factorTitle}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              factor.status === 'UNRESOLVED' 
                                ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            }`}>
                              {factor.status}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F0EC] text-blue-700 border border-[#BED6CB]">
                              Confidence: {factor.causalConfidence}
                            </span>
                          </div>
                        </div>

                        <p className="text-[#26312D] leading-relaxed">{factor.factorDescription}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-[#66736D] bg-[#FAF8F5] p-2 rounded">
                          <div>
                            <strong>Quantitative Impact:</strong> <span className="text-[#26312D]">{factor.quantitativeConsequence || 'Schedule & cost divergence'}</span>
                          </div>
                          <div>
                            <strong>Temporal Period:</strong> <span className="text-[#26312D]">{factor.startDate || 'Active'} {factor.endDate ? `to ${factor.endDate}` : '(Ongoing)'}</span>
                          </div>
                          {factor.affectedPackages && (
                            <div>
                              <strong>Affected Packages:</strong> <span className="text-[#26312D]">{factor.affectedPackages}</span>
                            </div>
                          )}
                          {factor.unresolvedDetail && (
                            <div className="sm:col-span-2 text-[#C89432]">
                              <strong>Unresolved Condition:</strong> {factor.unresolvedDetail}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section D: Claim-Level Provenance & Source Ledger */}
              {detail.evidenceClaims && detail.evidenceClaims.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-[#DDD9D0]">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    D. Claim-Level Provenance & Authoritative Document Ledger ({detail.evidenceClaims.length} Claims)
                  </span>

                  <div className="space-y-3">
                    {detail.evidenceClaims.map((claim, cIdx) => (
                      <div key={cIdx} className="p-3.5 bg-[#FAF8F5] rounded-lg border border-[#DDD9D0] text-xs space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-[#26312D] leading-snug">
                            "{claim.claimText}"
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {claim.evidenceStrength}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              Component {claim.targetComponent}
                            </span>
                          </div>
                        </div>

                        {claim.quantitativeSignal && (
                          <div className="text-[11px] text-[#66736D]">
                            <strong>Corroborates Quantitative Telemetry:</strong> <span className="text-[#C89432]">{claim.quantitativeSignal}</span>
                          </div>
                        )}

                        {claim.source && (
                          <div className="mt-2 p-2.5 bg-[#FAF8F5] rounded border border-[#DDD9D0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-[#26312D] flex items-center gap-1.5">
                                <BookOpen className="w-3 h-3 text-[#267A69]" />
                                {claim.source.title}
                              </div>
                              <div className="text-[11px] text-[#66736D]">
                                Publisher: <strong className="text-[#26312D]">{claim.source.publisher}</strong> • Type: <strong className="text-[#26312D]">{claim.source.sourceType}</strong> • Quality: <strong className="text-emerald-400">{claim.source.sourceQuality.toFixed(2)}</strong>
                              </div>
                            </div>

                            <a
                              href={claim.source.canonicalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/80 hover:bg-blue-600 text-[#173F35] text-[11px] font-medium transition-colors shrink-0"
                            >
                              <span>Inspect Source</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {claim.limitations && (
                          <div className="text-[10px] text-[#66736D] italic">
                            Known Limitations: {claim.limitations}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section E: Non-CUF Secondary Datasets Enriched */}
              {detail.nonCufDatasets && detail.nonCufDatasets.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-[#DDD9D0]">
                  <span className="text-xs font-bold text-[#267A69] uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    E. Non-CUF Secondary Datasets Actually Enriched ({detail.nonCufDatasets.length} Datasets)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {detail.nonCufDatasets.map((ds, dsIdx) => (
                      <div key={dsIdx} className="p-3 bg-[#FAF8F5] rounded-lg border border-[#DDD9D0] text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#173F35] text-xs">{ds.datasetName}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FAF8F5] text-blue-300">
                            {ds.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#26312D] leading-relaxed">
                          <strong>Evidence Basis:</strong> {ds.whyRelevant}
                        </p>
                        <div className="flex items-center justify-between pt-1 text-[10px] text-[#66736D] border-t border-[#DDD9D0]">
                          <span>Window: <strong>{ds.observationPeriod}</strong></span>
                          <span>Target: <strong>{ds.componentAffected}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );

    default:
      return (
        <div className="text-xs text-[#66736D] py-6 text-center">
          Evaluation methodology details for this component are currently being finalized.
        </div>
      );
  }
}
