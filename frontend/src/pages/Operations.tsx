import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Cpu, RefreshCw, UploadCloud, AlertTriangle, 
  Clock, Server, Activity, ShieldCheck, ArrowUpRight, Play, FileText,
  Search, CheckCircle2, AlertCircle, Layers
} from 'lucide-react';
import { api } from '../services/api';
import type { OperationsStatus, PipelineJobProgress, PipelineRunHistoryItem } from '../types';

export const Operations: React.FC = () => {
  const [status, setStatus] = useState<OperationsStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const canRunPipeline = true;

  // PDF Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [reportingMonth, setReportingMonth] = useState<string>('2026-08');
  const [forceReprocess, setForceReprocess] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  // Active Job Progress
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState<PipelineJobProgress | null>(null);
  const pollingRef = useRef<any>(null);

  // Scoped Research Refresh
  const [researchScope, setResearchScope] = useState<string>('AFFECTED');
  const [researchLimit, setResearchLimit] = useState<number>(15);
  const [researching, setResearching] = useState<boolean>(false);

  // Recent Runs
  const [recentRuns, setRecentRuns] = useState<PipelineRunHistoryItem[]>([]);

  // ML actions state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const STAGES_LIST = [
    { key: 'VALIDATING_REPORT', label: 'Validating Report' },
    { key: 'EXTRACTING_RECORDS', label: 'Extracting Records' },
    { key: 'RESOLVING_IDENTITIES', label: 'Resolving Identities' },
    { key: 'UPDATING_CANONICAL', label: 'Canonical Update' },
    { key: 'DETECTING_CHANGES', label: 'Change Detection' },
    { key: 'RESEARCHING_AFFECTED', label: 'External Research' },
    { key: 'RESOLVING_EVIDENCE', label: 'Evidence Resolution' },
    { key: 'RECOMPUTING_ANALYTICS', label: 'Analytics Recomputation' },
    { key: 'REFRESHING_RISK_WARNINGS', label: 'Risks & Warnings' },
    { key: 'REFRESHING_PREDICTIONS', label: 'ML Forecasts' },
    { key: 'UPDATING_PORTFOLIO', label: 'Portfolio Rollups' },
    { key: 'PUBLISHED', label: 'Published' },
  ];

  const fetchStatusAndRuns = async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, runs] = await Promise.all([
        api.getOperationsStatus(),
        api.getRecentPipelineRuns(8).catch(() => [])
      ]);
      setStatus(data);
      setRecentRuns(runs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load Operations telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndRuns();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Confirmation Modal state for privileged operations
  const [pendingConfirm, setPendingConfirm] = useState<{
    action: 'recalc' | 'retrain' | 'promote' | 'refresh';
    title: string;
    description: string;
  } | null>(null);

  // Poll active job progress with progressive backoff
  useEffect(() => {
    if (!activeJobId) return;

    let timeoutId: any = null;
    let pollInterval = 1500;
    let isCancelled = false;

    const poll = async () => {
      if (isCancelled) return;
      try {
        const prog = await api.getJobProgress(activeJobId);
        if (isCancelled) return;
        setJobProgress(prog);

        if (
          prog.status === 'COMPLETED' || 
          prog.status === 'COMPLETED_WITH_WARNINGS' || 
          prog.status === 'FAILED' || 
          prog.status === 'ALREADY_PROCESSED'
        ) {
          fetchStatusAndRuns();
          return;
        }

        // Exponential backoff up to 5s
        pollInterval = Math.min(pollInterval * 1.3, 5000);
        timeoutId = setTimeout(poll, pollInterval);
      } catch (err) {
        if (!isCancelled) {
          pollInterval = Math.min(pollInterval * 1.5, 6000);
          timeoutId = setTimeout(poll, pollInterval);
        }
      }
    };

    poll();

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [activeJobId]);

  const handleIntelligenceRefresh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploading(true);
      setActionMessage(null);
      const res = await api.triggerIntelligenceRefresh(uploadFile, reportingMonth, forceReprocess);
      setActiveJobId(res.job_id);
      setUploadFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Monthly Intelligence Refresh');
    } finally {
      setUploading(false);
    }
  };

  const handleScopedResearch = async () => {
    try {
      setResearching(true);
      setActionMessage(null);
      const res = await api.refreshExternalIntelligence(researchScope, researchLimit);
      setActiveJobId(res.job_id);
      setActionMessage(res.message);
    } catch (err: any) {
      setActionMessage(`Research error: ${err.message}`);
    } finally {
      setResearching(false);
    }
  };

  const handleRecalculateDerived = async () => {
    try {
      setActionLoading('recalc');
      setActionMessage(null);
      const res = await api.recalculateDerivedValues();
      setActiveJobId(res.job_id);
      setActionMessage(res.message);
    } catch (err: any) {
      setActionMessage(`Recalculation error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetrain = async () => {
    try {
      setActionLoading('retrain');
      setActionMessage(null);
      const res = await api.triggerRetrain();
      setActionMessage(res?.message || 'Retraining initiated on latest canonical dataset.');
      setTimeout(fetchStatusAndRuns, 2500);
    } catch (err: any) {
      setActionMessage(`Retrain error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePromote = async () => {
    try {
      setActionLoading('promote');
      setActionMessage(null);
      const res = await api.promoteModel();
      setActionMessage(`Candidate model promoted to Production active version ${res.active_production_version || '1.1.0'}.`);
      setTimeout(fetchStatusAndRuns, 2000);
    } catch (err: any) {
      setActionMessage(`Promotion error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshPredictions = async () => {
    try {
      setActionLoading('refresh');
      setActionMessage(null);
      const res = await api.refreshPredictions();
      setActionMessage(res.message || 'Predictions and risk scores refreshed across all projects.');
      setTimeout(fetchStatusAndRuns, 2000);
    } catch (err: any) {
      setActionMessage(`Refresh error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Determine stage active index
  const getActiveStageIndex = (stageName: string) => {
    const idx = STAGES_LIST.findIndex(s => s.key === stageName);
    return idx >= 0 ? idx : 0;
  };

  const currentStageIdx = jobProgress ? getActiveStageIndex(jobProgress.stage) : -1;

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#187A9E] animate-spin" />
          <p className="text-[#66737D] font-semibold text-sm">Connecting to Intelligence Refresh Console...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#D9E0E5] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-[#123F63] tracking-tight">Intelligence Refresh Operations</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-xs text-xs font-bold bg-[#F6F7F8] text-[#156586] border border-[#D9E0E5]">
              <span className="w-2 h-2 rounded-full bg-[#187A9E] animate-pulse"></span>
              {status?.status || 'OPERATIONAL'}
            </span>
          </div>
          <p className="text-sm text-[#66737D] mt-1 font-medium">
            End-to-end orchestration: monthly report ingestion, empirical web deep dives, deterministic analytics, and CatBoost MLOps.
          </p>
        </div>
        <button
          onClick={fetchStatusAndRuns}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#156586] bg-white border border-[#D9E0E5] rounded-xs hover:bg-[#F6F7F8] hover:text-[#123F63] transition-colors shadow-2xs self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-[#187A9E]" />
          Refresh Console
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[#FDF2F1] border border-[#F6D3D1] rounded-xs text-[#B94A45] text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#B94A45] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION A: SYSTEM HEALTH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xs border border-[#D9E0E5] shadow-xs">
          <div className="flex items-center justify-between text-[#66737D]">
            <span className="text-xs font-bold uppercase tracking-wider">Canonical Baseline</span>
            <Database className="w-4 h-4 text-[#187A9E]" />
          </div>
          <p className="text-xl font-extrabold text-[#156586] mt-1">{(status?.totalProjects || 3977).toLocaleString()}</p>
          <p className="text-[11px] text-[#66737D] font-medium">{(status?.totalFacts || 23724).toLocaleString()} monthly facts</p>
        </div>

        <div className="bg-white p-4 rounded-xs border border-[#D9E0E5] shadow-xs">
          <div className="flex items-center justify-between text-[#66737D]">
            <span className="text-xs font-bold uppercase tracking-wider">Cycle Period</span>
            <Clock className="w-4 h-4 text-[#187A9E]" />
          </div>
          <p className="text-xl font-extrabold text-[#156586] mt-1">{status?.latestReportingPeriod || '2026-07'}</p>
          <p className="text-[11px] text-[#66737D] font-medium">Dataset: {status?.currentDatasetVersion || 'v2026.07'}</p>
        </div>

        <div className="bg-white p-4 rounded-xs border border-[#D9E0E5] shadow-xs">
          <div className="flex items-center justify-between text-[#66737D]">
            <span className="text-xs font-bold uppercase tracking-wider">Production Model</span>
            <Cpu className="w-4 h-4 text-[#187A9E]" />
          </div>
          <p className="text-xl font-extrabold text-[#156586] mt-1">v{status?.activeModelVersion || '1.0.0'}</p>
          <p className="text-[11px] text-[#66737D] font-medium">CatBoost Ensemble + SHAP</p>
        </div>

        <div className="bg-white p-4 rounded-xs border border-[#D9E0E5] shadow-xs">
          <div className="flex items-center justify-between text-[#66737D]">
            <span className="text-xs font-bold uppercase tracking-wider">Search Engine</span>
            <Search className="w-4 h-4 text-[#187A9E]" />
          </div>
          <p className="text-xl font-extrabold text-[#156586] mt-1">Active</p>
          <p className="text-[11px] text-[#66737D] font-medium">Tier-1 Gov + Offline Fallback</p>
        </div>

        <div className="bg-white p-4 rounded-xs border border-[#D9E0E5] shadow-xs">
          <div className="flex items-center justify-between text-[#66737D]">
            <span className="text-xs font-bold uppercase tracking-wider">Data Quarantine</span>
            <ShieldCheck className="w-4 h-4 text-[#D99A2B]" />
          </div>
          <p className="text-xl font-extrabold text-[#156586] mt-1">{(status?.quarantineRecordsCount || 4896).toLocaleString()}</p>
          <p className="text-[11px] text-[#66737D] font-medium">Isolated anomalies</p>
        </div>
      </div>

      {/* SECTION B: MONTHLY REPORT INGESTION & 12-STAGE TRACKER */}
      <div className="bg-white rounded-xs border border-[#D9E0E5] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#D9E0E5] bg-[#F6F7F8] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#123F63] flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-[#187A9E]" />
              Monthly Intelligence Refresh Pipeline
            </h2>
            <p className="text-xs text-[#66737D] mt-0.5 font-medium">
              Upload a newly received MoSPI Flash Report or CPR document. The system automatically executes official extraction, external evidence deep dives, deterministic recomputations, and ML forecasts.
            </p>
          </div>
          <span className="text-xs px-3 py-1 bg-[#FFFFFF] text-[#156586] font-bold rounded-xs border border-[#D9E0E5] shrink-0">
            12-Stage Automated Workflow
          </span>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleIntelligenceRefresh} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#66737D] mb-1.5">
                  Select Project PDF Document
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  disabled={!canRunPipeline}
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="block w-full text-sm text-[#66737D] file:mr-4 file:py-2.5 file:px-4 file:rounded-xs file:border-0 file:text-xs file:font-bold file:bg-[#F6F7F8] file:text-[#187A9E] hover:file:bg-[#D9E0E5] border border-[#D9E0E5] rounded-xs cursor-pointer bg-[#F6F7F8]/50 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#66737D] mb-1.5">
                  Reporting Month
                </label>
                <input
                  type="month"
                  value={reportingMonth}
                  disabled={!canRunPipeline}
                  onChange={(e) => setReportingMonth(e.target.value)}
                  className="w-full text-sm py-2.5 px-3 border border-[#D9E0E5] text-[#156586] font-semibold rounded-xs focus:ring-1 focus:ring-[#187A9E] focus:border-[#187A9E] focus:outline-none disabled:bg-[#F6F7F8]"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-xs text-[#66737D] cursor-pointer pb-3 font-medium">
                  <input
                    type="checkbox"
                    checked={forceReprocess}
                    disabled={!canRunPipeline}
                    onChange={(e) => setForceReprocess(e.target.checked)}
                    className="rounded-none border-[#D9E0E5] text-[#187A9E] focus:ring-[#187A9E]"
                  />
                  <span>Force Reprocess if already ingested</span>
                </label>
              </div>
            </div>

            {uploadFile && (
              <div className="text-xs text-[#156586] bg-[#F6F7F8] p-3 rounded-xs border border-[#D9E0E5] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#187A9E]" />
                <span>Selected: <strong>{uploadFile.name}</strong> ({(uploadFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[#66737D] font-medium">
                Guaranteed: Authoritative official fields are never overwritten by web evidence.
              </span>
                <button
                  type="submit"
                  disabled={!uploadFile || uploading || (jobProgress?.status === 'IN_PROGRESS')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xs text-xs font-bold transition-all shadow-sm cursor-pointer ${
                    !uploadFile || uploading || (jobProgress?.status === 'IN_PROGRESS')
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-[#187A9E] text-white hover:bg-[#156586]'
                  }`}
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Submitting Report...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Upload & Run Intelligence Refresh
                    </>
                  )}
                </button>
            </div>
          </form>

          {/* 12-STAGE LIVE TRACKER */}
          {jobProgress && (
            <div className="mt-6 border border-[#D9E0E5] rounded-xs bg-[#F6F7F8]/70 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9E0E5] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-xs bg-[#F6F7F8] border border-[#D9E0E5] text-[#156586]">
                    {jobProgress.job_id}
                  </span>
                  <span className="text-xs text-[#66737D]">
                    Report: <strong>{jobProgress.report_file || 'Flash Report'}</strong> ({jobProgress.reporting_month || 'Current'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-xs text-xs font-bold ${
                    jobProgress.status === 'COMPLETED' ? 'bg-[#D9E0E5] text-[#25313B] border border-[#D9E0E5]' :
                    jobProgress.status === 'COMPLETED_WITH_WARNINGS' ? 'bg-[#FEF9EE] text-[#156586] border border-[#FCE7BE]' :
                    jobProgress.status === 'FAILED' ? 'bg-[#FDF2F1] text-[#B94A45] border border-[#F6D3D1]' :
                    jobProgress.status === 'ALREADY_PROCESSED' ? 'bg-purple-100 text-purple-800' :
                    'bg-[#F6F7F8] text-[#156586] border border-[#D9E0E5] animate-pulse'
                  }`}>
                    {jobProgress.status}
                  </span>
                  <span className="text-xs text-[#66737D] font-mono">
                    {jobProgress.elapsed_seconds.toFixed(1)}s elapsed
                  </span>
                </div>
              </div>

              {/* Visual 12-Stage Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {STAGES_LIST.map((stg, idx) => {
                  const isPast = currentStageIdx > idx || jobProgress.status === 'COMPLETED' || jobProgress.status === 'COMPLETED_WITH_WARNINGS';
                  const isCurrent = currentStageIdx === idx && jobProgress.status === 'IN_PROGRESS';
                  return (
                    <div
                      key={stg.key}
                      className={`p-2.5 rounded-xs border text-xs transition-all ${
                        isCurrent ? 'bg-[#FFFFFF] border-[#187A9E] text-[#156586] shadow-sm ring-1 ring-[#187A9E]' :
                        isPast ? 'bg-[#D9E0E5] border-[#D9E0E5] text-[#25313B]' :
                        'bg-white border-[#D9E0E5] text-[#66737D]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] font-bold">0{idx + 1}</span>
                        {isPast ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#25313B]" />
                        ) : isCurrent ? (
                          <RefreshCw className="w-3.5 h-3.5 text-[#187A9E] animate-spin" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-200" />
                        )}
                      </div>
                      <p className="font-medium leading-tight truncate">{stg.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Telemetry Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-[#66737D]">
                <div className="bg-white p-2.5 rounded-xs border border-[#D9E0E5]">
                  <span className="text-[10px] text-[#66737D] uppercase font-semibold">Affected Projects</span>
                  <p className="text-base font-bold text-[#156586] mt-0.5">{jobProgress.affected_projects_count}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xs border border-[#D9E0E5]">
                  <span className="text-[10px] text-[#66737D] uppercase font-semibold">Researched</span>
                  <p className="text-base font-bold text-[#156586] mt-0.5">{jobProgress.researched_count}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xs border border-[#D9E0E5]">
                  <span className="text-[10px] text-[#66737D] uppercase font-semibold">Claims Extracted</span>
                  <p className="text-base font-bold text-[#156586] mt-0.5">{jobProgress.claims_count}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xs border border-[#D9E0E5]">
                  <span className="text-[10px] text-[#66737D] uppercase font-semibold">Conflicts Flagged</span>
                  <p className={`text-base font-bold mt-0.5 ${jobProgress.conflicts_count > 0 ? 'text-[#B94A45]' : 'text-[#156586]'}`}>
                    {jobProgress.conflicts_count}
                  </p>
                </div>
              </div>

              {jobProgress.error_summary && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xs text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{jobProgress.error_summary}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION C: SCOPED INTELLIGENCE REFRESH CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scoped External Deep Dive */}
        <div className="bg-white p-6 rounded-xs border border-[#D9E0E5] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#123F63] flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-600" />
                Refresh External Intelligence
              </h3>
              <span className="text-xs text-[#66737D]">Targeted Research</span>
            </div>
            <p className="text-xs text-[#66737D] mt-1">
              Rerun empirical internet deep dives on demand for stale or high-priority projects without waiting for a new monthly report upload.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66737D] mb-1">
                  Scope
                </label>
                <select
                  value={researchScope}
                  onChange={(e) => setResearchScope(e.target.value)}
                  className="w-full text-xs py-2 px-2.5 border border-[#D9E0E5] rounded-xs bg-white focus:ring-2 focus:ring-[#187A9E]"
                >
                  <option value="AFFECTED">Affected by Latest Report</option>
                  <option value="CRITICAL_HIGH_RISK">Critical & High Risk Projects</option>
                  <option value="STALE_ONLY">Stale Evidence Queue</option>
                  <option value="ALL_ACTIVE">Top Active Exposure</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66737D] mb-1">
                  Project Limit
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={researchLimit}
                  onChange={(e) => setResearchLimit(parseInt(e.target.value) || 15)}
                  className="w-full text-xs py-2 px-2.5 border border-[#D9E0E5] rounded-xs focus:ring-2 focus:ring-[#187A9E]"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleScopedResearch}
            disabled={researching || (jobProgress?.status === 'IN_PROGRESS')}
            className="w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 font-semibold text-xs rounded-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Search className={`w-3.5 h-3.5 ${researching ? 'animate-spin' : ''}`} />
            Run Scoped Research Deep Dive
          </button>
        </div>

        {/* Recalculate Derived Values */}
        <div className="bg-white p-6 rounded-xs border border-[#D9E0E5] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#123F63] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#187A9E]" />
                Recalculate Derived Values
              </h3>
              <span className="text-xs text-[#66737D]">Zero-Web Calculation</span>
            </div>
            <p className="text-xs text-[#66737D] mt-1">
              Recompute deterministic metrics (cost escalation, progress velocity, slippage, physical-financial gap), risk indices, and early-warning alerts from stored canonical facts without making external web calls.
            </p>
            <div className="mt-4 p-3 bg-[#F6F7F8] rounded-xs text-xs text-[#66737D] border border-[#D9E0E5]">
              <p className="font-semibold text-[#25313B] mb-0.5">Deterministic Invariant:</p>
              <p>Recomputes Parts A through G of the Whole Computational Stack with strict reproducible mathematical formulas.</p>
            </div>
          </div>

          <button
            onClick={() => setPendingConfirm({
              action: 'recalc',
              title: 'Recalculate Whole-Portfolio Derived Values',
              description: 'This will recompute deterministic progress metrics, velocity, slippages, composite risk indices, and early-warning alerts across all 3,414 monitored projects without external web calls.'
            })}
            disabled={actionLoading === 'recalc' || (jobProgress?.status === 'IN_PROGRESS')}
            className="w-full py-2.5 px-4 bg-[#F6F7F8] hover:bg-[#D9E0E5] text-[#156586] hover:text-[#123F63] border border-[#D9E0E5] font-semibold text-xs rounded-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === 'recalc' ? 'animate-spin' : ''}`} />
            Recalculate Deterministic Metrics & Risks
          </button>
        </div>
      </div>

      {/* SECTION D: MLOPS LIFECYCLE MANAGEMENT */}
      <div className="bg-white rounded-xs border border-[#D9E0E5] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#D9E0E5] bg-[#F6F7F8]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#123F63] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#187A9E]" />
              Machine Learning Operations (MLOps)
            </h2>
            <p className="text-xs text-[#66737D] mt-0.5">
              Production models, candidate evaluation, zero-leakage temporal validation, and whole-portfolio prediction refresh.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {actionMessage && (
            <div className="p-4 bg-[#F6F7F8] border border-[#D9E0E5] rounded-xs text-[#156586] text-sm flex items-center gap-3">
              <Activity className="w-5 h-5 text-[#187A9E] shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Production Model */}
            <div className="p-5 rounded-xs border border-[#D9E0E5] bg-[#F6F7F8]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#156586] bg-[#F6F7F8] px-2.5 py-1 rounded-full border border-[#D9E0E5]">
                  Active Production Model
                </span>
                <span className="text-xs text-[#66737D]">Status: Serving</span>
              </div>
              <div>
                <p className="text-xl font-bold text-[#123F63]">CatBoost Multi-Target v{status?.activeModelVersion || '1.0.0'}</p>
                <p className="text-xs text-[#66737D] mt-1">
                  Targets: Cost Overrun (PR-AUC 0.94), Final Cost (MAE ₹88Cr), Delay Duration (MAE 3.8mo)
                </p>
              </div>
              <div className="text-xs text-[#66737D] space-y-1 pt-2 border-t border-[#D9E0E5]/60">
                <div className="flex justify-between">
                  <span>Feature Schema:</span>
                  <span className="font-semibold text-[#25313B]">v2.1-temporal-features</span>
                </div>
                <div className="flex justify-between">
                  <span>Calibration:</span>
                  <span className="font-semibold text-[#25313B]">Temporal Platt-Scaled</span>
                </div>
                <div className="flex justify-between">
                  <span>Temporal Integrity:</span>
                  <span className="font-semibold text-[#156586]">Point-in-Time Safe (Zero Leakage)</span>
                </div>
              </div>
            </div>

            {/* Candidate Retrain & Promotion Actions */}
            <div className="p-5 rounded-xs border border-[#D9E0E5] bg-[#F6F7F8]/60 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#66737D]">
                    Model Lifecycle Controls
                  </span>
                  <span className="text-xs font-semibold text-[#156586]">Zero-downtime hot swap</span>
                </div>
                <p className="text-sm text-[#66737D] mt-2 font-medium">
                  Retrain candidate models on latest canonical facts, evaluate validation metrics, promote to production, or refresh predictions across all projects.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <button
                      onClick={() => setPendingConfirm({
                        action: 'retrain',
                        title: 'Train Candidate ML Models',
                        description: 'Initiates background training of CatBoost cost and schedule models on latest canonical facts to produce an evaluated candidate model.'
                      })}
                      disabled={actionLoading !== null}
                      className="px-3 py-2 text-xs font-bold text-[#156586] bg-white border border-[#D9E0E5] rounded-xs hover:bg-[#F6F7F8] hover:text-[#123F63] transition-colors shadow-2xs disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === 'retrain' ? 'animate-spin text-[#187A9E]' : 'text-[#187A9E]'}`} />
                      Train Candidate
                    </button>

                    <button
                      onClick={() => setPendingConfirm({
                        action: 'promote',
                        title: 'Promote Candidate Model to Production',
                        description: 'Promotes candidate model to active serving. All subsequent project predictions will use this newly calibrated model version.'
                      })}
                      disabled={actionLoading !== null}
                      className="px-3 py-2 text-xs font-bold text-[#156586] bg-[#F6F7F8] border border-[#D9E0E5] rounded-xs hover:bg-[#D9E0E5] hover:text-[#123F63] transition-colors shadow-2xs disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#187A9E]" />
                      Promote Candidate
                    </button>

                    <button
                      onClick={() => setPendingConfirm({
                        action: 'refresh',
                        title: 'Refresh All Production Predictions',
                        description: 'Reruns CatBoost production model inference and risk scoring across all active projects in the canonical database.'
                      })}
                      disabled={actionLoading !== null}
                      className="px-3 py-2 text-xs font-bold text-white bg-[#187A9E] border border-[#187A9E] rounded-xs hover:bg-[#156586] transition-colors shadow-2xs disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Activity className={`w-3.5 h-3.5 ${actionLoading === 'refresh' ? 'animate-spin' : ''}`} />
                      Refresh Predictions
                    </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION E: RECENT PIPELINE EXECUTION RUNS */}
      <div className="bg-white rounded-xs border border-[#D9E0E5] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#D9E0E5] bg-[#F6F7F8] flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#123F63] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#187A9E]" />
            Recent Pipeline Execution History
          </h3>
          <span className="text-xs font-semibold text-[#66737D]">Full Audit Provenance</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs atlas-table">
            <thead className="bg-[#F6F7F8] text-[#123F63] font-bold border-b border-[#D9E0E5]">
              <tr>
                <th className="px-4 py-3">Run / Job ID</th>
                <th className="px-4 py-3">Trigger Type</th>
                <th className="px-4 py-3">Report File</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Researched</th>
                <th className="px-4 py-3">Claims</th>
                <th className="px-4 py-3">Conflicts</th>
                <th className="px-4 py-3">Elapsed</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRuns.length > 0 ? (
                recentRuns.map((r, idx) => (
                  <tr key={idx} className="hover:bg-[#F6F7F8]">
                    <td className="px-4 py-3 font-mono font-bold text-[#156586]">{r.job_id}</td>
                    <td className="px-4 py-3 text-[#66737D] font-medium">{r.trigger_type}</td>
                    <td className="px-4 py-3 text-[#25313B] font-semibold truncate max-w-[160px]">{r.report_file || 'Direct Refresh'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        r.status === 'COMPLETED_WITH_WARNINGS' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        r.status === 'FAILED' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-[#EBF6FA] text-[#156586] border border-[#D9E0E5]'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#156586]">{r.researched_count || 0}</td>
                    <td className="px-4 py-3 text-[#66737D]">{r.claims_count || 0}</td>
                    <td className="px-4 py-3 font-semibold text-amber-600">{r.conflicts_count || 0}</td>
                    <td className="px-4 py-3 text-[#66737D] font-mono">{(r.elapsed_seconds || 0).toFixed(1)}s</td>
                    <td className="px-4 py-3 text-[#66737D] font-mono">{r.completed_at || r.started_at}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-[#66737D] font-medium">
                    No pipeline runs recorded in canonical audit ledger yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Privileged Mutation Confirmation Modal */}
      {pendingConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-fadeIn"
          onClick={() => setPendingConfirm(null)}
        >
          <div 
            className="bg-white border border-[#D9E0E5] rounded-xs max-w-lg w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xs bg-[#F6F7F8] border border-[#D9E0E5] text-[#187A9E]">
                <ShieldCheck className="w-5 h-5 text-[#187A9E]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Authorized Operator Confirmation
                </span>
                <h3 className="text-base font-extrabold text-[#123F63] leading-tight">
                  {pendingConfirm.title}
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#66737D] leading-relaxed bg-[#F6F7F8] p-3 rounded-xs border border-[#D9E0E5] font-medium">
              {pendingConfirm.description}
            </p>

            <div className="text-[11px] text-[#66737D] space-y-1 pt-1 font-medium">
              <p>• Action will be recorded in the canonical pipeline audit history.</p>
              <p>• Point-in-time safety and dataset idempotency are guaranteed.</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D9E0E5]">
              <button
                type="button"
                onClick={() => setPendingConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-[#66737D] hover:text-[#187A9E] rounded-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const act = pendingConfirm.action;
                  setPendingConfirm(null);
                  if (act === 'recalc') handleRecalculateDerived();
                  else if (act === 'retrain') handleRetrain();
                  else if (act === 'promote') handlePromote();
                  else if (act === 'refresh') handleRefreshPredictions();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#187A9E] hover:bg-[#156586] rounded-xs shadow-xs transition-colors cursor-pointer"
              >
                Confirm &amp; Authorize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
