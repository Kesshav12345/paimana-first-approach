import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Search } from 'lucide-react';
import { api } from '../services/api';
import type { EarlyWarningAlert, Intervention } from '../types';
import { SeverityBadge, StatusChip } from '../components/common/Badges';
import { Pagination } from '../components/common/Pagination';

export const EarlyWarning: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'alerts' | 'interventions'>('alerts');

  // Alerts State
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>([]);
  const [alertTotal, setAlertTotal] = useState(0);
  const [alertPage, setAlertPage] = useState(1);
  const [alertSeverity, setAlertSeverity] = useState('');
  const [alertSearch, setAlertSearch] = useState('');

  // Interventions State
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [intPage, setIntPage] = useState(1);
  const [intStatus, setIntStatus] = useState('');

  // Loading & Action state
  const [loading, setLoading] = useState(true);
  const [modalProject, setModalProject] = useState<Intervention | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    if (tab === 'alerts') {
      setLoading(true);
      api.getActiveAlerts({
        severity: alertSeverity,
        search: alertSearch,
        page: alertPage,
        size: 20
      })
        .then(res => {
          setAlerts(res.alerts);
          setAlertTotal(res.total);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(true);
      api.getInterventions(intStatus, intPage, 20)
        .then(res => {
          setInterventions(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [tab, alertPage, alertSeverity, alertSearch, intPage, intStatus]);

  const handleUpdateStatus = async () => {
    if (!modalProject || !newStatus) return;
    try {
      await api.updateInterventionStatus(modalProject.projectId, newStatus, newNotes);
      setModalProject(null);
      // Reload interventions
      const updated = await api.getInterventions(intStatus, intPage, 20);
      setInterventions(updated);
    } catch (e: any) {
      alert(e.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header with Dual Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Infrastructure Early Warning & Intervention System
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Rule-governed trigger signals, multi-tier risk escalation, and operational action tracking
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setTab('alerts')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              tab === 'alerts'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Alert Signals ({alertTotal > 0 ? alertTotal.toLocaleString() : '57,402'})
          </button>
          <button
            onClick={() => setTab('interventions')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              tab === 'interventions'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Intervention Workflow
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE ALERTS */}
      {tab === 'alerts' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search alert by project name or ID..."
                value={alertSearch}
                onChange={(e) => { setAlertSearch(e.target.value); setAlertPage(1); }}
                className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={alertSeverity}
              onChange={(e) => { setAlertSeverity(e.target.value); setAlertPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 uppercase text-[11px] font-semibold text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5">Project ID</th>
                    <th className="px-4 py-2.5">Project Name</th>
                    <th className="px-4 py-2.5">Warning Signal</th>
                    <th className="px-4 py-2.5 text-center">Severity</th>
                    <th className="px-4 py-2.5">Trigger Condition</th>
                    <th className="px-4 py-2.5 text-right">Persistence</th>
                    <th className="px-4 py-2.5">Recommended Action</th>
                    <th className="px-4 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-500">
                        Loading active alert telemetry...
                      </td>
                    </tr>
                  ) : alerts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-500">
                        No alerts matching current filters
                      </td>
                    </tr>
                  ) : (
                    alerts.map((a) => (
                      <tr key={a.alertId} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-2.5 font-mono text-slate-400">{a.projectId}</td>
                        <td className="px-4 py-2.5 font-medium text-white max-w-xs truncate" title={a.projectName}>
                          {a.projectName}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-slate-200">{a.warningType}</td>
                        <td className="px-4 py-2.5 text-center">
                          <SeverityBadge severity={a.severity} />
                        </td>
                        <td className="px-4 py-2.5 text-slate-400 text-[11px] max-w-xs truncate" title={a.triggerCondition}>
                          {a.triggerCondition}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          <span className={a.persistencePeriods >= 3 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                            {a.persistencePeriods} mo{a.persistencePeriods > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-300 max-w-xs truncate" title={a.recommendedIntervention}>
                          {a.recommendedIntervention}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => navigate(`/projects/${a.projectId}`)}
                            className="px-2.5 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded text-[11px] font-medium transition"
                          >
                            Triage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={alertPage}
              totalPages={Math.ceil(alertTotal / 20) || 1}
              total={alertTotal}
              size={20}
              onPageChange={setAlertPage}
            />
          </div>
        </div>
      )}

      {/* TAB 2: INTERVENTION WORKFLOW */}
      {tab === 'interventions' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Filter Lifecycle State:</span>
            {['ALL', 'ACTION_INITIATED', 'UNDER_REVIEW', 'MONITORING', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => { setIntStatus(st === 'ALL' ? '' : st); setIntPage(1); }}
                className={`px-3 py-1 rounded text-xs transition ${
                  (intStatus === '' && st === 'ALL') || intStatus === st
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Interventions List */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 uppercase text-[11px] font-semibold text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5">Project ID</th>
                    <th className="px-4 py-2.5">Project Name</th>
                    <th className="px-4 py-2.5">Responsible Authority</th>
                    <th className="px-4 py-2.5">Recommended Measure</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5 text-right">Priority Score</th>
                    <th className="px-4 py-2.5">Action Notes</th>
                    <th className="px-4 py-2.5 text-center">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {interventions.map((iv) => (
                    <tr key={iv.projectId} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-2.5 font-mono text-slate-400">{iv.projectId}</td>
                      <td className="px-4 py-2.5 font-medium text-white max-w-xs truncate" title={iv.projectName}>
                        {iv.projectName}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400">{iv.responsibleAuthority || iv.ministryName}</td>
                      <td className="px-4 py-2.5 text-slate-300 max-w-xs truncate" title={iv.recommendedIntervention}>
                        {iv.recommendedIntervention}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <StatusChip status={iv.interventionStatus} />
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-amber-400">
                        {iv.interventionPriorityScore.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 text-[11px] max-w-xs truncate">
                        {iv.latestActionNotes || 'No updates logged yet'}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => {
                            setModalProject(iv);
                            setNewStatus(iv.interventionStatus);
                            setNewNotes(iv.latestActionNotes || '');
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] border border-slate-700 transition"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Intervention Update Modal */}
      {modalProject && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Update Intervention Status</h3>
            <p className="text-xs text-slate-400 truncate">{modalProject.projectName} ({modalProject.projectId})</p>

            <div>
              <label className="block text-xs text-slate-400 mb-1">State Machine Lifecycle</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
              >
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="PLANNED">Planned</option>
                <option value="ACTION_INITIATED">Action Initiated</option>
                <option value="MONITORING">Monitoring</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Action Notes / Resolution Details</label>
              <textarea
                rows={3}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Log official meeting decisions, committee orders, or contractor directives..."
                className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalProject(null)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white"
              >
                Save Transition
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
