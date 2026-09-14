import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertTriangle, 
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
  FileText
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
          <span className="text-xs text-slate-400">Loading Project Intelligence (15 Dimensions)...</span>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white">Project Intelligence Unavailable</h2>
          <p className="text-xs text-slate-400 mt-1">{error || 'Unable to locate project record in canonical database'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-xs font-semibold text-white"
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
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-mono text-blue-400 font-semibold">{detail.projectId}</span>
          {detail.legacyOcmsCode && (
            <span className="text-[11px] text-slate-400 font-mono">({detail.legacyOcmsCode})</span>
          )}
          {detail.multiState && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-400 border border-indigo-800">
              MULTI-STATE
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {detail.projectName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
              <span>Sector: <strong className="text-slate-200">{detail.sectorName}</strong></span>
              <span>•</span>
              <span>Ministry: <strong className="text-slate-200">{detail.ministryName}</strong></span>
              <span>•</span>
              <span>Agency: <strong className="text-slate-200">{detail.agencyName}</strong></span>
              <span>•</span>
              <span>State: <strong className="text-slate-200">{detail.stateName}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RiskBadge band={detail.riskBand} score={detail.overallRiskScore} />
            <span className="text-xs text-slate-400">Cycle: <strong className="text-slate-200">{detail.latestReportingMonth}</strong></span>
          </div>
        </div>
      </div>

      {/* 2 & 3. Current Status & Health Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Current Project Status */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-400" />
            2. Current Project Telemetry & Accounting
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80">
              <span className="text-[11px] text-slate-400">Physical Progress</span>
              <div className="text-lg font-bold text-white mt-1">{detail.physicalProgressPct}%</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${detail.physicalProgressPct}%` }} />
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80">
              <span className="text-[11px] text-slate-400">Financial Progress</span>
              <div className="text-lg font-bold text-white mt-1">{detail.financialProgressPct}%</div>
              <span className="text-[10px] text-slate-400">Gap: {detail.physicalFinancialGap > 0 ? `+${detail.physicalFinancialGap}%` : `${detail.physicalFinancialGap}%`}</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80">
              <span className="text-[11px] text-slate-400">Sanctioned vs Revised</span>
              <div className="text-xs font-bold text-slate-200 mt-1">₹{detail.originalCostCr.toLocaleString()} Cr</div>
              <div className="text-xs font-semibold text-amber-400 mt-0.5">Rev: ₹{detail.latestRevisedCostCr.toLocaleString()} Cr</div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded border border-slate-800/80">
              <span className="text-[11px] text-slate-400">Cumulative Spend</span>
              <div className="text-lg font-bold text-emerald-400 mt-1">₹{detail.cumulativeExpenditureCr.toLocaleString()} Cr</div>
              <span className="text-[10px] text-slate-400">Rem: ₹{detail.remainingFinancialExposureCr.toLocaleString()} Cr</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-800/60 text-xs">
            <div>
              <span className="text-slate-500 block">Sanction Date</span>
              <span className="text-slate-300 font-mono">{detail.originalApprovalDate || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Original DOC</span>
              <span className="text-slate-300 font-mono">{detail.originalDoc || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Anticipated DOC</span>
              <span className="text-slate-300 font-mono text-amber-400">{detail.anticipatedDoc || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Schedule Slippage</span>
              <span className={`font-mono font-bold ${detail.scheduleSlippageMonths > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {detail.scheduleSlippageMonths > 0 ? `+${detail.scheduleSlippageMonths} Months` : 'On Schedule'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Project Health Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                3. Project Health Summary
              </h2>
              <button
                onClick={() => setActiveModalComponent('health_summary')}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-950/60 hover:bg-blue-900/80 px-2 py-0.5 rounded border border-blue-800/60 transition-colors"
                title="Inspect Health Evaluation Methodology"
              >
                <span>Inspect</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-slate-950/80 border border-slate-800 mb-3">
              <div>
                <span className="text-[11px] text-slate-400">Implementation Health</span>
                <div className={`text-sm font-bold flex items-center gap-1.5 mt-0.5 ${
                  detail.healthStatus === 'DETERIORATING' ? 'text-rose-400' :
                  detail.healthStatus === 'COMPLETED' ? 'text-emerald-400' :
                  detail.healthStatus === 'COMMISSIONING' ? 'text-blue-400' :
                  detail.healthStatus === 'IMPROVING' ? 'text-emerald-400' : 'text-slate-200'
                }`}>
                  {detail.healthStatus === 'COMPLETED' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>COMPLETED & COMMISSIONED</span>
                    </>
                  ) : detail.healthStatus === 'COMMISSIONING' ? (
                    <>
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span>COMMISSIONING & TRIAL RUNS</span>
                    </>
                  ) : (
                    detail.healthStatus
                  )}
                </div>
              </div>
              <RiskBadge band={detail.riskBand} score={detail.overallRiskScore} />
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Observed Signals</span>
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

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Active Warnings: <strong className="text-amber-400">{detail.activeWarningCount}</strong></span>
            <span>Trajectory: <strong className="text-slate-200">{detail.riskTrajectory}</strong></span>
          </div>
        </div>

      </div>

      {/* 4 & 5. Supervised Machine Learning Forecasts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* 4. Cost Forecast */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              4. Predictive Cost Forecast (CatBoost)
            </h2>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-400 border border-blue-800">
                Supervised ML
              </span>
              <button
                onClick={() => setActiveModalComponent('cost_forecast')}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-950/60 hover:bg-blue-900/80 px-2 py-0.5 rounded border border-blue-800/60 transition-colors"
                title="Inspect Cost Forecast Algorithm & Inputs"
              >
                <span>Inspect</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400">Cost Overrun Probability</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                {(detail.costOverrunProbability * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500">Threshold: &gt; 50% Significant</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400">Predicted Final Cost</span>
              <div className="text-2xl font-bold text-white mt-1">
                ₹{detail.predictedFinalCostCr.toLocaleString()} Cr
              </div>
              <span className="text-[10px] text-amber-400">
                Overrun: +₹{detail.predictedCostOverrunAmountCr.toLocaleString()} Cr (+{detail.predictedCostOverrunPct.toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Data Confidence: <strong className="text-slate-200">{detail.costForecastConfidence}</strong></span>
            <span>Model: <strong className="text-slate-300">CatBoost Regressor v1.0</strong></span>
          </div>
        </div>

        {/* 5. Schedule Forecast */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              5. Predictive Schedule Forecast (CatBoost)
            </h2>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-400 border border-blue-800">
                Supervised ML
              </span>
              <button
                onClick={() => setActiveModalComponent('schedule_forecast')}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-950/60 hover:bg-blue-900/80 px-2 py-0.5 rounded border border-blue-800/60 transition-colors"
                title="Inspect Schedule Forecast Algorithm & Inputs"
              >
                <span>Inspect</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400">Schedule Overrun Probability</span>
              <div className="text-2xl font-bold text-rose-400 mt-1">
                {(detail.scheduleOverrunProbability * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500">Likelihood of milestone slip</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400">Predicted Total Delay</span>
              <div className="text-2xl font-bold text-white mt-1">
                {detail.predictedDelayMonths.toFixed(1)} Months
              </div>
              <span className="text-[10px] text-slate-400">
                Est. Completion: <strong className="text-slate-200">{detail.predictedCompletionDate || 'Late 2027'}</strong>
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Data Confidence: <strong className="text-slate-200">{detail.scheduleForecastConfidence}</strong></span>
            <span>Model: <strong className="text-slate-300">CatBoost Classifier v1.0</strong></span>
          </div>
        </div>

      </div>

      {/* 6 & 7. Overall Risk Decomposition & Trajectory Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 6. Overall Risk Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              6. Overall Risk Score Decomposition
            </h2>
            <button
              onClick={() => setActiveModalComponent('risk_decomposition')}
              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-950/60 hover:bg-blue-900/80 px-2 py-0.5 rounded border border-blue-800/60 transition-colors"
              title="Inspect Exact Risk Score Formula"
            >
              <span>Inspect</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="text-center p-4 bg-slate-950 rounded border border-slate-800 mb-4">
            <span className="text-xs text-slate-400">Composite Risk Index</span>
            <div className="text-3xl font-bold text-rose-400 mt-1">
              {detail.overallRiskScore.toFixed(1)}
              <span className="text-sm font-normal text-slate-500"> / 100</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 inline-block">Band: <strong className="text-white">{detail.riskBand}</strong></span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Cost Risk (35% Weight)</span>
                <span className="font-mono">{detail.costRiskScore.toFixed(0)}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${detail.costRiskScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Schedule Risk (35% Weight)</span>
                <span className="font-mono">{detail.scheduleRiskScore.toFixed(0)}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${detail.scheduleRiskScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Progress Risk (30% Weight)</span>
                <span className="font-mono">{detail.progressRiskScore.toFixed(0)}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${detail.progressRiskScore}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* 7. Risk & Performance Trajectory (Chart) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                7. Risk & Performance Longitudinal Trajectory
              </h2>
              <p className="text-[11px] text-slate-500">Observed monthly time-series across monitoring cycles</p>
            </div>
            <button
              onClick={() => setActiveModalComponent('trajectory')}
              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-950/60 hover:bg-blue-900/80 px-2 py-0.5 rounded border border-blue-800/60 transition-colors"
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
              <div className="flex items-center justify-center h-full text-xs text-slate-500">
                Insufficient multi-month historical observations for line chart
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 8, 9, 10. Warnings, Why Flagged & Key Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 8. Active Warnings */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>8. Active Warnings ({detail.activeWarnings.length})</span>
            </h2>
            <button
              onClick={() => setActiveModalComponent('active_warnings')}
              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-950/60 hover:bg-blue-900/80 px-2 py-0.5 rounded border border-blue-800/60 transition-colors"
              title="Inspect Warning Heuristics & Severity Rules"
            >
              <span>Inspect</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {detail.activeWarnings.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                <p className="font-semibold text-slate-300">Zero active warning alerts</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  {detail.projectLifecycleStatus === 'Completed' || detail.physicalProgressPct >= 98.0
                    ? 'Physical construction finished — All historical construction bottlenecks resolved'
                    : 'All operational and financial metrics within statutory tolerance'}
                </p>
              </div>
            ) : (
              detail.activeWarnings.map((w, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{w.warningType}</span>
                    <SeverityBadge severity={w.severity} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{w.triggerCondition}</p>
                  <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
                    <span>Persistence: {w.persistencePeriods} mos</span>
                    <span className="text-amber-400 font-semibold">Alert Severity: {w.interventionPriorityScore.toFixed(0)} / 100</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 9. Why Flagged? */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              9. Why Is Project Flagged?
            </h2>
            <button
              onClick={() => setActiveModalComponent('why_flagged')}
              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-950/60 hover:bg-blue-900/80 px-2 py-0.5 rounded border border-blue-800/60 transition-colors"
              title="Inspect Detailed Flagging Reasoning"
            >
              <span>Inspect</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {detail.flaggingReasons.map((f, idx) => (
              <div key={idx} className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-xs">
                <span className="font-semibold text-amber-400 block">{f.signal_type}</span>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 10. Key Risk Drivers (SHAP / Statistical) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              10. Key Model Risk Drivers (SHAP)
            </h2>
            <button
              onClick={() => setActiveModalComponent('shap_drivers')}
              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-950/60 hover:bg-blue-900/80 px-2 py-0.5 rounded border border-blue-800/60 transition-colors"
              title="Inspect SHAP Additive Feature Contributions"
            >
              <span>Inspect</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {detail.riskDrivers && detail.riskDrivers.length > 0 ? (
              detail.riskDrivers.map((d, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-slate-300">{d.feature}</span>
                    <span className={`block text-[10px] ${
                      d.direction === 'INCREASES_RISK' ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {d.direction.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-slate-200">
                    +{d.contribution}%
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">Tree contributions unavailable</div>
            )}
          </div>
        </div>

      </div>

      {/* 11, 12, 13. Peer Benchmarks, Official Attention, Recommended Measures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 11. Peer Benchmark */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              11. Peer Cohort Benchmark
            </h2>
            <button
              onClick={() => setActiveModalComponent('peer_benchmark')}
              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-950/60 hover:bg-blue-900/80 px-2 py-0.5 rounded border border-blue-800/60 transition-colors"
              title="Inspect Peer Cohort Methodology"
            >
              <span>Inspect</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {detail.peerBenchmark ? (
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400">Cohort Definition</span>
                <div className="font-semibold text-white mt-0.5">{detail.peerBenchmark.peer_group}</div>
                <span className="text-[10px] text-slate-500">Sample Size: {detail.peerBenchmark.peer_count} Projects</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Peer Avg Progress</span>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{detail.peerBenchmark.peer_avg_progress}%</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Peer Avg Delay</span>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{detail.peerBenchmark.peer_avg_delay} Mos</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-4 text-center">No comparable peer cohort</div>
          )}
        </div>

        {/* 12. Areas Requiring Official Attention */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              12. Official Attention Priorities
            </h2>
            <button
              onClick={() => setActiveModalComponent('attention_priorities')}
              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-950/60 hover:bg-blue-900/80 px-2 py-0.5 rounded border border-blue-800/60 transition-colors"
              title="Inspect Priority Assessment Criteria"
            >
              <span>Inspect</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {detail.officialAttentionPriorities.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">{item.priority} • {item.area}</span>
                <p className="text-[11px] text-slate-300 mt-0.5 font-medium">{item.evidence}</p>
                <p className="text-[10px] text-slate-500 mt-1 italic">{item.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 13. Recommended Interventions */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              13. Recommended Interventions
            </h2>
            <button
              onClick={() => setActiveModalComponent('recommended_interventions')}
              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-950/60 hover:bg-blue-900/80 px-2 py-0.5 rounded border border-blue-800/60 transition-colors"
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
                className="p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200 line-clamp-1">{rec.measure}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    rec.priority === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>{rec.priority}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{rec.reason}</p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Authority: <strong className="text-slate-400">{rec.responsible_authority}</strong></span>
                  <span className="text-blue-400 flex items-center gap-0.5">Details →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 14 & 15. Intervention Tracking & Empirical Effectiveness */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                14 & 15. Intervention Governance & Operational Status
              </h2>
              <button
                onClick={() => setActiveModalComponent('intervention_governance')}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-950/60 hover:bg-blue-900/80 px-2 py-0.5 rounded border border-blue-800/60 transition-colors"
                title="Inspect Intervention Governance Lifecycle"
              >
                <span>Inspect Governance</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Formal implementation decisions originating from the Early Warning Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            {detail.interventions.length > 0 ? (
              <StatusChip status={detail.interventionEffectivenessStatus} />
            ) : (detail.projectLifecycleStatus === 'Completed' || detail.healthStatus === 'COMPLETED' || detail.physicalProgressPct >= 98.0) ? (
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                PROJECT COMPLETED & COMMISSIONED
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                NO INTERVENTION SCHEDULED
              </span>
            )}
          </div>
        </div>

        {detail.interventions.length === 0 ? (
          (detail.projectLifecycleStatus === 'Completed' || detail.healthStatus === 'COMPLETED' || detail.physicalProgressPct >= 98.0) ? (
            <div className="bg-slate-950/80 border border-emerald-800/50 rounded-lg p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Physical Implementation Completed & Commissioned
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This project has successfully completed physical construction and commercial commissioning (Current Progress: <strong className="text-emerald-400">{detail.physicalProgressPct}%</strong>). Zero active construction delays or operational bottlenecks remain. Official actions are limited to routine contractor final bill reconciliations, asset capitalization, and formal Project Completion Report (PCR) submission.
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-400">
                    <span>Lifecycle Status: <strong className="text-emerald-400 font-semibold">Completed & Commissioned</strong></span>
                    <span>•</span>
                    <span>Active Warnings: <strong className="text-emerald-400 font-bold">0</strong></span>
                    <span>•</span>
                    <span>Post-Commissioning Measure: <strong className="text-slate-200">{detail.recommendedInterventions[0]?.measure || 'Final Commercial Settlement & PCR Submission'}</strong></span>
                  </div>
                </div>

                <div className="flex-shrink-0 px-4 py-2.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Asset Operational</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Awaiting Formal Decision in Early Warning Dashboard
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    To ensure full operational transparency, PAIMANA tracks actual interventions only after they are officially sanctioned and scheduled through the <strong className="text-slate-200">Early Warning Dashboard</strong>. No restructuring or ministerial taskforce has been initiated for this project yet.
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-400">
                    <span>Priority Score: <strong className="text-amber-400 font-mono font-bold">{(detail.interventionPriorityScore ?? 0).toFixed(1)} / 100</strong></span>
                    <span>•</span>
                    <span>Active Warnings: <strong className="text-rose-400 font-bold">{detail.activeWarnings.length}</strong></span>
                    <span>•</span>
                    <span>Recommended Action: <strong className="text-slate-200">{detail.recommendedInterventions[0]?.measure || 'Routine Monitoring'}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/early-warning')}
                  className="flex-shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/30"
                >
                  <span>Schedule in Early Warning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 uppercase text-[10px] font-semibold text-slate-400">
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
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="px-4 py-2 font-medium text-white">{iv.recommendedIntervention}</td>
                    <td className="px-4 py-2 text-slate-400">{iv.responsibleAuthority}</td>
                    <td className="px-4 py-2 text-center"><StatusChip status={iv.interventionStatus} /></td>
                    <td className="px-4 py-2 font-mono text-slate-400">{iv.actualStartDate || iv.plannedDate}</td>
                    <td className="px-4 py-2 font-mono text-slate-400">{iv.followUpDate}</td>
                    <td className="px-4 py-2 text-slate-300">{iv.latestActionNotes}</td>
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Technical Evaluation & Methodological Deep-Dive
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300">
          {renderEvaluationDetails(componentKey, detail, onNavigateEarlyWarning)}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Project ID: <strong className="text-slate-200 font-mono">{detail.projectId}</strong></span>
            <span>•</span>
            <span>Cycle: <strong className="text-slate-200 font-mono">{detail.latestReportingMonth}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold transition-colors"
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
    case 'health_summary':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              Dimension 3: Project Health & Signal Evaluation
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic health classification synthesizing physical progress velocity, schedule delay trends, and warning alert pressure.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Evaluation Methodology</span>
            <p className="text-xs leading-relaxed text-slate-300">
              Project Health assesses whether project trajectory is <strong className="text-emerald-400">IMPROVING</strong>, <strong className="text-slate-200">STABLE</strong>, or <strong className="text-rose-400">DETERIORATING</strong>. When a project suffers persistent schedule slippage or physical velocity drops while financial exposure continues to accumulate, health status degrades to DETERIORATING.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Assigned Health</span>
              <div className="text-base font-bold text-white mt-1">{detail.healthStatus}</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Risk Trajectory</span>
              <div className="text-base font-bold text-amber-400 mt-1">{detail.riskTrajectory}</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Active Warnings</span>
              <div className="text-base font-bold text-rose-400 mt-1">{detail.activeWarningCount}</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Progress Gap</span>
              <div className="text-base font-bold text-white mt-1">{detail.physicalFinancialGap}%</div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Signals Judgement</span>
            <div className="space-y-1.5 text-xs">
              {detail.negativeSignals.map((s, i) => (
                <div key={i} className="p-2.5 rounded bg-rose-950/20 border border-rose-900/50 text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                  <span><strong>Adverse Factor:</strong> {s}</span>
                </div>
              ))}
              {detail.positiveSignals.map((s, i) => (
                <div key={i} className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/50 text-emerald-300 flex items-start gap-2">
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
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Dimension 4: Supervised Cost Escalation Forecast (CatBoost ML)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              CatBoost gradient-boosted regression trained on 19,755 project-month longitudinal observations.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Algorithmic Formulation</span>
            <pre className="text-[11px] font-mono bg-slate-900 p-2.5 rounded text-amber-300 overflow-x-auto">
              Predicted Final Cost = RevisedCost + f_CatBoost(ExpenditureVelocity, TimeElapsedRatio, SectorEscalationRate, ApprovedCostTier)
            </pre>
            <p className="text-xs leading-relaxed text-slate-300">
              The model evaluates non-linear cost escalation patterns by analyzing the ratio of expenditure burn relative to physical milestones delivered. If expenditure velocity significantly outpaces physical delivery, the probability of exceeding the latest sanctioned budget escalates exponentially.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Sanctioned Cost</span>
              <div className="text-sm font-bold text-slate-200 mt-1">₹{detail.originalCostCr.toLocaleString()} Cr</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Latest Revised Sanction</span>
              <div className="text-sm font-bold text-amber-400 mt-1">₹{detail.latestRevisedCostCr.toLocaleString()} Cr</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Current Cumulative Spend</span>
              <div className="text-sm font-bold text-emerald-400 mt-1">₹{detail.cumulativeExpenditureCr.toLocaleString()} Cr</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Predicted Final Cost</span>
              <div className="text-sm font-bold text-white mt-1">₹{detail.predictedFinalCostCr.toLocaleString()} Cr</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Predicted Overrun</span>
              <div className="text-sm font-bold text-rose-400 mt-1">+{detail.predictedCostOverrunPct.toFixed(1)}%</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Overrun Probability</span>
              <div className="text-sm font-bold text-amber-400 mt-1">{(detail.costOverrunProbability * 100).toFixed(1)}%</div>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded border border-slate-800 text-xs space-y-1">
            <span className="font-bold text-slate-200">Statutory Governance Implication:</span>
            <p className="text-slate-400">
              Under Ministry of Finance GFR Rule 130, any project with cost escalation exceeding 20% or ₹500 Cr requires formal Revised Cost Committee (RCC) appraisal before further treasury releases.
            </p>
          </div>
        </div>
      );

    case 'schedule_forecast':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Dimension 5: Supervised Schedule Delay Forecast (CatBoost ML)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              CatBoost dual classifier & quantile regressor estimating milestone completion date and delay likelihood.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Algorithmic Formulation</span>
            <pre className="text-[11px] font-mono bg-slate-900 p-2.5 rounded text-amber-300 overflow-x-auto">
              Predicted Delay Months = g_CatBoost(TimeElapsedMonths, RemainingProgressPct, ExecutionVelocity3M, StateClearanceIndex)
            </pre>
            <p className="text-xs leading-relaxed text-slate-300">
              Calculates projected completion by analyzing time elapsed versus remaining physical deliverables. When trailing 3-month physical velocity indicates completion cannot mathematically occur before the anticipated Date of Commissioning (DOC), slippage months are projected using empirical distributions of similar peer projects.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Original DOC</span>
              <div className="text-sm font-bold text-slate-200 mt-1">{detail.originalDoc || 'N/A'}</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Anticipated DOC</span>
              <div className="text-sm font-bold text-amber-400 mt-1">{detail.anticipatedDoc || 'N/A'}</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Observed Slippage</span>
              <div className="text-sm font-bold text-rose-400 mt-1">+{detail.scheduleSlippageMonths} Months</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Schedule Overrun Prob.</span>
              <div className="text-sm font-bold text-amber-400 mt-1">{(detail.scheduleOverrunProbability * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Predicted Delay at Close</span>
              <div className="text-sm font-bold text-white mt-1">{detail.predictedDelayMonths.toFixed(1)} Months</div>
            </div>
            <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Forecast Confidence</span>
              <div className="text-sm font-bold text-blue-400 mt-1">{detail.scheduleForecastConfidence}</div>
            </div>
          </div>
        </div>
      );

    case 'risk_decomposition':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-400" />
              Dimension 6: Composite Risk Score Decomposition & Weights
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Multi-criteria mathematical formulation combining cost, schedule, and execution progress risks into a standardized 0-100 index.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Canonical Weighting Formula</span>
            <div className="p-3 bg-slate-900 rounded font-mono text-xs text-emerald-400">
              Composite Risk = (0.35 × CostRisk) + (0.35 × ScheduleRisk) + (0.30 × ProgressRisk)
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <p>• <strong>Cost Risk (35%):</strong> Normalized from cost escalation percentage and remaining exposure.</p>
              <p>• <strong>Schedule Risk (35%):</strong> Evaluated from schedule slippage months against project baseline duration.</p>
              <p>• <strong>Progress Risk (30%):</strong> Evaluated from physical-financial divergence gap and monthly velocity stagnation.</p>
              <p className="pt-1 text-emerald-400 font-medium">• <strong>Lifecycle-Aware Modulation:</strong> Projects with &ge; 98% progress or verified commercial commissioning have schedule and execution risks attenuated to 0.0 with construction alerts retired, focusing purely on final audited cost variance.</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Project Score Breakdown</span>
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
                <span className="font-mono text-blue-400 font-bold">{detail.progressRiskScore.toFixed(1)} × 0.30 = {(detail.progressRiskScore * 0.30).toFixed(1)} pts</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
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
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Dimension 7: Longitudinal Trajectory & Velocity Momentum
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Time-series longitudinal tracking across monthly flash report monitoring cycles.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Trajectory Evaluation Logic</span>
            <p className="text-xs leading-relaxed text-slate-300">
              Assesses the directional velocity of implementation over the trailing 6 to 12 cycles. If physical progress delta continues to fall below 0.2% per month while cost claims continue to grow, the trajectory is stamped <strong className="text-rose-400">DETERIORATING</strong>. If monthly physical completion exceeds historical velocity, the project qualifies as <strong className="text-emerald-400">IMPROVING</strong>.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs">
            <span className="text-slate-400">Current Assigned Trajectory:</span>
            <div className="text-base font-bold text-white mt-1">{detail.riskTrajectory}</div>
            <p className="text-slate-400 mt-1">
              Based on empirical monthly history recorded in canonical data cycle {detail.latestReportingMonth}.
            </p>
          </div>
        </div>
      );

    case 'active_warnings':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Dimension 8: Active Early Warning Heuristics & Persistence
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic rule engine triggering prioritized alerts based on statistical threshold breaches.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Early Warning Triggers Architecture</span>
            <div className="text-xs text-slate-300 space-y-1">
              <p>• <strong>EW-COST-01:</strong> Cost Escalation &ge; 20% above sanctioned estimate.</p>
              <p>• <strong>EW-SCHED-01:</strong> Schedule Slippage &ge; 12 Months beyond original DOC.</p>
              <p>• <strong>EW-VEL-01:</strong> Physical velocity stagnation (&lt; 0.2%/mo over 3 cycles).</p>
              <p>• <strong>EW-GAP-01:</strong> Physical-Financial Divergence gap &lt; -15% (disbursements outpacing deliverables).</p>
              <p>• <strong>EW-PERS-01:</strong> Critical trigger persistence &ge; 3 consecutive months.</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Alert Triggers ({detail.activeWarnings.length})</span>
            {detail.activeWarnings.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                <p className="font-semibold text-slate-200">Zero Active Alert Triggers</p>
                <p className="text-xs text-slate-400">
                  {detail.projectLifecycleStatus === 'Completed' || detail.physicalProgressPct >= 98.0
                    ? 'Physical construction is finished. All historical construction bottlenecks and delay alerts have been formally retired.'
                    : 'No statutory threshold breaches detected in the latest reporting cycle.'}
                </p>
              </div>
            ) : (
              detail.activeWarnings.map((w, idx) => (
                <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{w.warningType}</span>
                    <SeverityBadge severity={w.severity} />
                  </div>
                  <p className="text-slate-300">{w.triggerCondition}</p>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>Persistence: <strong className="text-slate-200">{w.persistencePeriods} consecutive cycles</strong></span>
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
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              Dimension 9: Root Cause Flagging Diagnostics
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Comprehensive diagnostic reasoning detailing why the monitoring engine flagged this project for intervention review.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Evaluation Rationale</span>
            <p className="text-xs leading-relaxed text-slate-300">
              The project is flagged when telemetry crosses predefined risk thresholds, indicating systemic delivery bottlenecks that cannot be resolved through routine divisional supervision.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Flagged Criteria & Diagnostics</span>
            {detail.flaggingReasons.map((f, idx) => (
              <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-amber-400 uppercase text-[11px]">{f.signal_type}</span>
                <p className="text-slate-200 leading-relaxed">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'shap_drivers':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-purple-400" />
              Dimension 10: TreeSHAP Feature Attributions
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Game-theoretic Shapley values decomposing individual feature contributions to model risk forecasts.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Mathematical Methodology</span>
            <div className="p-2.5 bg-slate-900 rounded font-mono text-xs text-purple-300">
              f(x) = E[f(x)] + ∑ φ_i(x)
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              TreeSHAP computes the marginal contribution of each project metric toward increasing or decreasing the predicted risk relative to the baseline portfolio average.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Decomposed Feature Weights</span>
            {detail.riskDrivers.map((d, idx) => (
              <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-200">{d.feature}</span>
                  <span className={`block text-[10px] ${d.direction === 'INCREASES_RISK' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {d.direction.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="font-mono text-sm font-bold text-white">+{d.contribution}%</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'peer_benchmark':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              Dimension 11: Sector & Scale Peer Cohort Clustering
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Unsupervised clustering matching projects against comparable infrastructure peers by Sector, Outlay, and Geography.
            </p>
          </div>

          {detail.peerBenchmark ? (
            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Peer Cohort Definition</span>
                <div className="text-sm font-bold text-white mt-1">{detail.peerBenchmark.peer_group}</div>
                <span className="text-xs text-slate-500">Cohort Sample Size: {detail.peerBenchmark.peer_count} Capital Projects</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-400">Peer Average Physical Progress</span>
                  <div className="text-base font-bold text-slate-200 mt-1">{detail.peerBenchmark.peer_avg_progress}%</div>
                  <span className="text-[10px] text-slate-500">This Project: {detail.physicalProgressPct}%</span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-400">Peer Average Schedule Delay</span>
                  <div className="text-base font-bold text-slate-200 mt-1">{detail.peerBenchmark.peer_avg_delay} Months</div>
                  <span className="text-[10px] text-rose-400">This Project: {detail.scheduleSlippageMonths} Months</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-6">No comparable peer cohort identified in current dataset</div>
          )}
        </div>
      );

    case 'attention_priorities':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" />
              Dimension 12: Multi-Criteria Official Attention Priorities
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Algorithmic prioritization ranking areas requiring statutory, administrative, and inter-agency intervention.
            </p>
          </div>

          <div className="space-y-2">
            {detail.officialAttentionPriorities.map((p, idx) => (
              <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{p.area}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">{p.priority}</span>
                </div>
                <p className="text-slate-300"><strong>Evidence:</strong> {p.evidence}</p>
                <p className="text-slate-400"><strong>Recommended Action:</strong> {p.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'recommended_interventions':
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              Dimension 13: Data-Driven Recommended Interventions
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Tailored, logic-evaluated operational measures calculated from factual project risk triggers rather than generic templates.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Evaluation Rules & Decision Tree</span>
            <div className="text-xs text-slate-300 space-y-1">
              <p>• <strong>Chronic Delay (&ge;24 mos):</strong> Triggers Critical Path Acceleration & Taskforce Deployment.</p>
              <p>• <strong>Severe Cost Escalation (&ge;20% / &ge;₹500 Cr):</strong> Triggers Revised Cost Committee (RCC) & Quantity Survey Audit.</p>
              <p>• <strong>Physical-Financial Gap (&lt;-15%):</strong> Triggers Physical Output Verification & Staged Disbursement Freeze.</p>
              <p>• <strong>Compound Crisis:</strong> Triggers Inter-Ministerial Restructuring & Cabinet Appraisal.</p>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tailored Measures for This Project</span>
            {detail.recommendedInterventions.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-white">{rec.measure}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rec.priority === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>{rec.priority}</span>
                </div>
                
                <p className="text-slate-300 leading-relaxed">
                  <strong>Trigger Reason:</strong> {rec.reason}
                </p>

                {rec.evaluation_logic && (
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-blue-300">
                    <strong>Algorithmic Evaluation:</strong> {rec.evaluation_logic}
                  </div>
                )}

                {rec.action_plan && (
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                    <strong>Operational Action Plan:</strong> {rec.action_plan}
                  </div>
                )}

                {rec.expected_impact && (
                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-900/50 text-[11px] text-emerald-300">
                    <strong>Expected Governance Impact:</strong> {rec.expected_impact}
                  </div>
                )}

                <div className="pt-1 text-[11px] text-slate-500">
                  Responsible Governance Authority: <strong className="text-slate-300">{rec.responsible_authority}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={onNavigateEarlyWarning}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/30"
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
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Dimensions 14 & 15: Intervention Governance & Lifecycle
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Institutional policy governing operational decision-making, transparent action scheduling, and post-intervention audit.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Institutional Mandate</span>
            <p className="text-xs leading-relaxed text-slate-300">
              PAIMANA maintains a strict separation between <em>algorithmic recommendation</em> (Dimension 13) and <em>formal operational intervention</em> (Dimensions 14 & 15). Recommendations are evaluated automatically by analytical models. Formal interventions, however, are decided and scheduled exclusively through the <strong className="text-slate-200">Early Warning Dashboard</strong> by authorized ministry nodal officers and inter-ministerial taskforces.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Operational State</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Scheduled Actions</span>
                <div className="text-sm font-bold text-white mt-1">
                  {detail.interventions.length > 0 ? `${detail.interventions.length} Active` : '0 (Awaiting Review)'}
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Intervention Priority</span>
                <div className="text-sm font-bold text-amber-400 mt-1">
                  {(detail.interventionPriorityScore ?? 0).toFixed(1)} / 100
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Lifecycle Status</span>
                <div className="text-sm font-bold text-slate-200 mt-1">
                  {detail.interventionEffectivenessStatus}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed pt-1">
              {detail.interventions.length === 0 ? (
                <p>
                  Because no formal intervention has been initiated for this project yet, the system transparently reports <strong className="text-slate-200">NO FORMAL INTERVENTION SCHEDULED</strong> rather than generating placeholder dates. You can schedule an intervention using the Early Warning workflow below.
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
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/30"
          >
            <span>Open Early Warning Dashboard to Manage Interventions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      );

    default:
      return (
        <div className="text-xs text-slate-400 py-6 text-center">
          Evaluation methodology details for this component are currently being finalized.
        </div>
      );
  }
}
