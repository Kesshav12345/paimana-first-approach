import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import type { StateSummary, ProjectSummary } from '../types';
import { RiskBadge } from '../components/common/Badges';
import { Pagination } from '../components/common/Pagination';

export const StateAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [states, setStates] = useState<StateSummary[]>([]);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const [stateSectors, setStateSectors] = useState<Array<{ sector_name: string; project_count: number; total_revised_cost_cr: number; avg_progress_pct: number; high_risk_count: number }>>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStates()
      .then(res => {
        setStates(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelectState = (stName: string) => {
    setSelectedState(stName);
    setSelectedSector(null);
    setPage(1);
    api.getStateSectors(stName).then(setStateSectors);
    api.getStateProjects(stName, undefined, 1, 20).then(setProjects);
  };

  const handleSelectSector = (secName: string) => {
    setSelectedSector(secName);
    setPage(1);
    if (selectedState) {
      api.getStateProjects(selectedState, secName, 1, 20).then(setProjects);
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
            {selectedState && (
              <button
                onClick={() => { setSelectedState(null); setSelectedSector(null); }}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              {selectedState ? `${selectedState} Analytics` : 'State & Regional Infrastructure Analytics'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedState 
              ? `Interface 2 & 3: Sectoral performance and projects within ${selectedState}`
              : 'Interface 1: State-level capital allocations and regional infrastructure progress'}
          </p>
        </div>
      </div>

      {/* Interface 1: State Overview */}
      {!selectedState && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 uppercase text-[11px] font-semibold text-slate-400">
                <tr>
                  <th className="px-4 py-3">State / UT</th>
                  <th className="px-4 py-3 text-right">Projects</th>
                  <th className="px-4 py-3 text-right">Total Investment (₹ Cr)</th>
                  <th className="px-4 py-3 text-right">Cumulative Spend (₹ Cr)</th>
                  <th className="px-4 py-3 text-right">Escalation (%)</th>
                  <th className="px-4 py-3 text-right">Avg Progress</th>
                  <th className="px-4 py-3 text-right">High / Critical</th>
                  <th className="px-4 py-3 text-right">Alerts</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {states.map((st) => (
                  <tr key={st.stateName} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-semibold text-white">{st.stateName}</td>
                    <td className="px-4 py-3 text-right font-mono">{st.projectCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono">₹{st.totalInvestmentCr.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono">₹{st.totalCumulativeExpenditureCr.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span className={st.weightedCostEscalationPct > 15 ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                        +{st.weightedCostEscalationPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{st.avgPhysicalProgressPct.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-rose-400 font-semibold">{st.highRiskCount + st.criticalRiskCount}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-amber-400 font-mono">{st.activeWarningCount}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleSelectState(st.stateName)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white text-[11px] font-medium transition"
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

      {/* Interface 2: State -> Sector Performance & Projects */}
      {selectedState && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Sectors Active in {selectedState}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
              <button
                onClick={() => handleSelectSector('')}
                className={`p-2.5 rounded border text-left text-xs transition ${
                  !selectedSector ? 'bg-emerald-950 border-emerald-500 text-white font-semibold' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                All Sectors ({stateSectors.reduce((acc, c) => acc + c.project_count, 0)})
              </button>
              {stateSectors.map((sec) => (
                <button
                  key={sec.sector_name}
                  onClick={() => handleSelectSector(sec.sector_name)}
                  className={`p-2.5 rounded border text-left text-xs transition truncate ${
                    selectedSector === sec.sector_name ? 'bg-emerald-950 border-emerald-500 text-white font-semibold' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate font-medium">{sec.sector_name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>{sec.project_count} proj</span>
                    {sec.high_risk_count > 0 && <span className="text-rose-400">{sec.high_risk_count} risk</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interface 3: Projects Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
            <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Projects in {selectedState} {selectedSector ? `→ ${selectedSector}` : ''}
              </span>
              <span className="text-xs text-slate-400">{projects.length} displayed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 uppercase text-[11px] font-semibold text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5">Project ID</th>
                    <th className="px-4 py-2.5">Project Name</th>
                    <th className="px-4 py-2.5">Agency</th>
                    <th className="px-4 py-2.5">Sector</th>
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
                      <td className="px-4 py-2.5 text-slate-400 truncate max-w-[150px]">{p.agencyName}</td>
                      <td className="px-4 py-2.5 text-slate-400">{p.sectorName}</td>
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
