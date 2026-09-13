import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import type { MinistrySummary, ProjectSummary } from '../types';
import { RiskBadge } from '../components/common/Badges';
import { Pagination } from '../components/common/Pagination';

export const MinistryAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [ministries, setMinistries] = useState<MinistrySummary[]>([]);
  const [selectedMinistry, setSelectedMinistry] = useState<string | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);

  const [ministryAgencies, setMinistryAgencies] = useState<Array<{ agency_name: string; project_count: number; total_revised_cost_cr: number; avg_progress_pct: number; high_risk_count: number }>>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMinistries()
      .then(res => {
        setMinistries(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelectMinistry = (minName: string) => {
    setSelectedMinistry(minName);
    setSelectedAgency(null);
    setPage(1);
    api.getMinistryAgencies(minName).then(setMinistryAgencies);
    api.getMinistryProjects(minName, undefined, 1, 20).then(setProjects);
  };

  const handleSelectAgency = (agName: string) => {
    setSelectedAgency(agName);
    setPage(1);
    if (selectedMinistry) {
      api.getMinistryProjects(selectedMinistry, agName, 1, 20).then(setProjects);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            {selectedMinistry && (
              <button
                onClick={() => { setSelectedMinistry(null); setSelectedAgency(null); }}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              {selectedMinistry ? selectedMinistry : 'Central Ministry Infrastructure Analytics'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedMinistry 
              ? `Interface 2 & 3: Executing agencies and projects under ${selectedMinistry}`
              : 'Interface 1: Line ministries oversight and portfolio capital distribution'}
          </p>
        </div>
      </div>

      {/* Interface 1: Ministry Overview */}
      {!selectedMinistry && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 uppercase text-[11px] font-semibold text-slate-400">
                <tr>
                  <th className="px-4 py-3">Ministry Name</th>
                  <th className="px-4 py-3 text-right">Projects</th>
                  <th className="px-4 py-3 text-right">Approved (₹ Cr)</th>
                  <th className="px-4 py-3 text-right">Revised (₹ Cr)</th>
                  <th className="px-4 py-3 text-right">Escalation (%)</th>
                  <th className="px-4 py-3 text-right">Avg Progress</th>
                  <th className="px-4 py-3 text-right">High / Critical</th>
                  <th className="px-4 py-3 text-right">Alerts</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ministries.map((m) => (
                  <tr key={m.ministryName} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-semibold text-white max-w-sm truncate" title={m.ministryName}>
                      {m.ministryName}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{m.projectCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono">₹{m.totalOriginalCostCr.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono">₹{m.totalRevisedCostCr.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span className={m.weightedCostEscalationPct > 15 ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                        +{m.weightedCostEscalationPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{m.avgPhysicalProgressPct.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-rose-400 font-semibold">{m.highRiskCount + m.criticalRiskCount}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-amber-400 font-mono">{m.activeWarningCount}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleSelectMinistry(m.ministryName)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-white text-[11px] font-medium transition"
                      >
                        Explore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interface 2: Ministry -> Agency Performance & Projects */}
      {selectedMinistry && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Implementing Agencies under {selectedMinistry}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
              <button
                onClick={() => handleSelectAgency('')}
                className={`p-2.5 rounded border text-left text-xs transition ${
                  !selectedAgency ? 'bg-indigo-950 border-indigo-500 text-white font-semibold' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                All Agencies ({ministryAgencies.reduce((acc, c) => acc + c.project_count, 0)})
              </button>
              {ministryAgencies.slice(0, 11).map((ag) => (
                <button
                  key={ag.agency_name}
                  onClick={() => handleSelectAgency(ag.agency_name)}
                  className={`p-2.5 rounded border text-left text-xs transition truncate ${
                    selectedAgency === ag.agency_name ? 'bg-indigo-950 border-indigo-500 text-white font-semibold' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate font-medium" title={ag.agency_name}>{ag.agency_name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>{ag.project_count} proj</span>
                    {ag.high_risk_count > 0 && <span className="text-rose-400">{ag.high_risk_count} risk</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interface 3: Projects Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
            <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Projects in {selectedMinistry} {selectedAgency ? `→ ${selectedAgency}` : ''}
              </span>
              <span className="text-xs text-slate-400">{projects.length} displayed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 uppercase text-[11px] font-semibold text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5">Project ID</th>
                    <th className="px-4 py-2.5">Project Name</th>
                    <th className="px-4 py-2.5">Sector</th>
                    <th className="px-4 py-2.5">State</th>
                    <th className="px-4 py-2.5 text-right">Revised Cost</th>
                    <th className="px-4 py-2.5 text-right">Progress</th>
                    <th className="px-4 py-2.5 text-right">Delay (Mos)</th>
                    <th className="px-4 py-2.5 text-center">Risk</th>
                    <th className="px-4 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {projects.map((p) => (
                    <tr key={p.projectId} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-2.5 font-mono text-slate-400">{p.projectId}</td>
                      <td className="px-4 py-2.5 font-medium text-white max-w-xs truncate" title={p.projectName}>
                        {p.projectName}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400">{p.sectorName}</td>
                      <td className="px-4 py-2.5 text-slate-400">{p.stateName}</td>
                      <td className="px-4 py-2.5 text-right font-mono">₹{p.latestRevisedCostCr.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{p.physicalProgressPct}%</td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        <span className={p.scheduleSlippageMonths > 0 ? 'text-amber-400' : 'text-slate-400'}>
                          {p.scheduleSlippageMonths}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <RiskBadge band={p.riskBand} score={p.overallRiskScore} />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => navigate(`/projects/${p.projectId}`)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded text-xs border border-slate-700 transition"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              totalPages={Math.ceil(projects.length / 20) || 1}
              total={projects.length}
              size={20}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

    </div>
  );
};
