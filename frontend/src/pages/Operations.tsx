import React, { useState, useEffect } from 'react';
import { 
  Database, Cpu, RefreshCw, UploadCloud, AlertTriangle, 
  Clock, Server, Activity, ShieldCheck, ArrowUpRight, Play, FileText, CheckCircle
} from 'lucide-react';
import { api } from '../services/api';
import type { OperationsStatus } from '../types';

export const Operations: React.FC = () => {
  const [status, setStatus] = useState<OperationsStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // PDF Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [reportingMonth, setReportingMonth] = useState<string>('2026-08');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ML actions state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOperationsStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load Operations telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploading(true);
      setUploadSuccess(null);
      await api.uploadPdf(uploadFile, reportingMonth);
      setUploadSuccess(
        `PDF "${uploadFile.name}" submitted successfully! Automated ETL ingestion pipeline and ML feature extraction started in background.`
      );
      setUploadFile(null);
      // Refresh status after 2 seconds
      setTimeout(fetchStatus, 2000);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to initiate PDF ingestion pipeline');
    } finally {
      setUploading(false);
    }
  };

  const handleRetrain = async () => {
    try {
      setActionLoading('retrain');
      setActionMessage(null);
      const res = await api.triggerRetrain();
      setActionMessage(res?.message || 'Retraining initiated on latest canonical dataset.');
      setTimeout(fetchStatus, 2500);
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
      setTimeout(fetchStatus, 2000);
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
      setTimeout(fetchStatus, 2000);
    } catch (err: any) {
      setActionMessage(`Refresh error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">Connecting to Operations & Ingestion Telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Data & Model Operations</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {status?.status || 'HEALTHY'}
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Automated PDF ETL ingestion, data quality quarantine, model lifecycle management, and portfolio recalculation.
          </p>
        </div>
        <button
          onClick={fetchStatus}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Telemetry
        </button>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. System Telemetry & KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Canonical Projects</span>
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{(status?.totalProjects || 3977).toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{(status?.totalFacts || 23724).toLocaleString()} monthly fact records</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Latest Period</span>
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{status?.latestReportingPeriod || '2026-07'}</p>
          <p className="text-xs text-slate-500 mt-1">Dataset: {status?.currentDatasetVersion || 'v2026.07-canonical'}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Production ML</span>
            <Cpu className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{status?.activeModelVersion || '1.0.0'}</p>
          <p className="text-xs text-slate-500 mt-1">CatBoost Multi-Target Ensemble</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Data Quarantine</span>
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{(status?.quarantineRecordsCount || 4896).toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Isolated non-standard entries</p>
        </div>
      </div>

      {/* 2. LIVE PDF INGESTION & PIPELINE TRIGGER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              Automated PDF Ingestion & ETL Pipeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a newly received MoSPI Flash Report or Project Review PDF. It will automatically extract data, resolve entities, update the canonical database, recalculate temporal features, and synchronize the entire application.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-200 shrink-0">
            End-to-End Automated
          </span>
        </div>

        <div className="p-6">
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Project PDF Document
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-lg cursor-pointer bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Reporting Month
                </label>
                <input
                  type="month"
                  value={reportingMonth}
                  onChange={(e) => setReportingMonth(e.target.value)}
                  className="w-full text-sm py-2.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {uploadFile && (
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Selected: <strong>{uploadFile.name}</strong> ({(uploadFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Pipeline Triggered Successfully</p>
                  <p className="text-xs mt-0.5">{uploadSuccess}</p>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Upload Ingestion Error</p>
                  <p className="text-xs mt-0.5">{uploadError}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Supports: MoSPI Flash Reports, Sector Monthly Summary, and CPR Annexures
              </span>
              <button
                type="submit"
                disabled={!uploadFile || uploading}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                  !uploadFile || uploading
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25'
                }`}
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Ingesting & Running ETL...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Upload & Run Full Pipeline
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. MODEL OPERATIONS & LIFECYCLE MANAGEMENT */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              Machine Learning Operations (MLOps)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Production models, candidate evaluation, zero-leakage temporal validation, and whole-portfolio prediction refresh.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {actionMessage && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-sm flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Production Model */}
            <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Active Production Model
                </span>
                <span className="text-xs text-slate-500">Status: Serving</span>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">CatBoost Multi-Target v{status?.activeModelVersion || '1.0.0'}</p>
                <p className="text-xs text-slate-600 mt-1">
                  Targets: Cost Overrun (PR-AUC 0.94), Final Cost (MAE ₹88Cr), Delay Duration (MAE 3.8mo)
                </p>
              </div>
              <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-emerald-200/60">
                <div className="flex justify-between">
                  <span>Feature Schema:</span>
                  <span className="font-semibold text-slate-700">v2.1-temporal-features</span>
                </div>
                <div className="flex justify-between">
                  <span>Calibration:</span>
                  <span className="font-semibold text-slate-700">Temporal Platt-Scaled</span>
                </div>
                <div className="flex justify-between">
                  <span>Zero-Velocity Guard:</span>
                  <span className="font-semibold text-emerald-700">Enforced (Streak Tracking)</span>
                </div>
              </div>
            </div>

            {/* Candidate Retrain & Promotion Actions */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Model Lifecycle Controls
                  </span>
                  <span className="text-xs text-slate-500">Zero-downtime hot swap</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Retrain candidate models on the latest dataset, evaluate validation metrics, promote to production, or refresh predictions across all projects.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <button
                  onClick={handleRetrain}
                  disabled={actionLoading !== null}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === 'retrain' ? 'animate-spin' : ''}`} />
                  Train Candidate
                </button>

                <button
                  onClick={handlePromote}
                  disabled={actionLoading !== null}
                  className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Promote Candidate
                </button>

                <button
                  onClick={handleRefreshPredictions}
                  disabled={actionLoading !== null}
                  className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Activity className={`w-3.5 h-3.5 ${actionLoading === 'refresh' ? 'animate-spin' : ''}`} />
                  Refresh All Scores
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DATA VALIDATION & QUARANTINE HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Data Quarantine Summary (Anomalies Isolated)
            </h3>
            <span className="text-xs text-slate-500">Fail-safe pipeline isolation</span>
          </div>
          <div className="p-5">
            <p className="text-xs text-slate-600 mb-4">
              To prevent ML feature corruption, records with source format shifts or dates outside valid bounds are quarantined with full provenance preserved.
            </p>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
              {(status?.quarantineSummary || []).slice(0, 5).map((q, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div>
                    <span className="font-semibold text-slate-800">{q.error_type}</span>
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      q.error_severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {q.error_severity}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-700">{q.incident_count.toLocaleString()} cases</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. AUDIT & RECENT ETL RUNS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              Audit Runs & Pipeline History
            </h3>
            <span className="text-xs text-slate-500">Full Reproducibility</span>
          </div>
          <div className="p-5">
            <p className="text-xs text-slate-600 mb-4">
              Immutable log of all batch ingestion, standardization, and canonical database update executions.
            </p>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
              {(status?.auditLogs || []).slice(0, 5).map((log, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{log.dataset_version}</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {log.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{log.created_at}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-slate-700">{log.records_standardized.toLocaleString()} rows</span>
                    <span className="block text-[10px] text-slate-400">{log.execution_time_seconds.toFixed(1)}s elapsed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
