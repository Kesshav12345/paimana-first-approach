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
  HelpCircle
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              3. Project Health Summary
            </h2>

            <div className="flex items-center justify-between p-3 rounded bg-slate-950/80 border border-slate-800 mb-3">
              <div>
                <span className="text-[11px] text-slate-400">Implementation Health</span>
                <div className={`text-sm font-bold ${
                  detail.healthStatus === 'DETERIORATING' ? 'text-rose-400' : detail.healthStatus === 'IMPROVING' ? 'text-emerald-400' : 'text-slate-200'
                }`}>
                  {detail.healthStatus}
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
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-400 border border-blue-800">
              Supervised ML
            </span>
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
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-400 border border-blue-800">
              Supervised ML
            </span>
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            6. Overall Risk Score Decomposition
          </h2>

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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>8. Active Warnings ({detail.activeWarnings.length})</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </h2>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {detail.activeWarnings.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">Zero active warning alerts</div>
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
                    <span className="text-amber-400">Score: {w.interventionPriorityScore.toFixed(1)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 9. Why Flagged? */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            9. Why Is Project Flagged?
          </h2>

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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            10. Key Model Risk Drivers (SHAP)
          </h2>

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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            11. Peer Cohort Benchmark
          </h2>

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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            12. Official Attention Priorities
          </h2>

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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            13. Recommended Interventions
          </h2>

          <div className="space-y-2 text-xs">
            {detail.recommendedInterventions.map((rec, idx) => (
              <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">{rec.measure}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-800">{rec.priority}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{rec.reason}</p>
                <span className="text-[10px] text-slate-500 mt-1 block">Authority: {rec.responsible_authority}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 14 & 15. Intervention Tracking & Effectiveness */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              14 & 15. Intervention Tracking & Empirical Effectiveness
            </h2>
            <p className="text-[11px] text-slate-500">Operational action status and observed performance impact</p>
          </div>
          <StatusChip status={detail.interventionEffectivenessStatus} />
        </div>

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
      </div>

    </div>
  );
};
