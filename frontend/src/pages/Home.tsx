import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Layers, 
  MapPin, 
  AlertTriangle, 
  Database, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import type { PortfolioSummary } from '../types';
import { KpiCard } from '../components/common/KpiCard';
import { RiskBadge } from '../components/common/Badges';
import { IndiaRiskMap } from '../components/map/IndiaRiskMap';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    api.getHomeSummary()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Loading Portfolio Telemetry...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-rose-950/40 border border-rose-800 rounded-lg p-6 text-center text-rose-300">
          <AlertTriangle className="w-8 h-8 mx-auto text-rose-400 mb-2" />
          <h3 className="font-semibold">Failed to load portfolio overview</h3>
          <p className="text-xs text-slate-400 mt-1">{error || 'Unknown error'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-1.5 text-xs bg-rose-900 hover:bg-rose-800 rounded text-white"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Executive Infrastructure Portfolio</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time monitoring across Central Sector Infrastructure Projects (₹150 Cr & Above)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300">
            Reporting Period: <strong className="text-blue-400">{data.latestReportingPeriod}</strong>
          </span>
        </div>
      </div>

      {/* 5 Core Governing KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Projects Monitored"
          value={data.totalProjects.toLocaleString()}
          subtitle="Entity-resolved projects"
          colorClass="text-white"
          icon={<Building className="w-4 h-4" />}
        />
        <KpiCard
          title="Sanctioned Cost"
          value={`₹${(data.totalOriginalCostCr / 100000).toFixed(2)}L Cr`}
          subtitle="Original approved baseline"
          colorClass="text-slate-200"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KpiCard
          title="Revised Cost"
          value={`₹${(data.totalRevisedCostCr / 100000).toFixed(2)}L Cr`}
          subtitle={`Escalation: +${data.portfolioCostEscalationPct.toFixed(1)}%`}
          trendDirection="up"
          trend={`+₹${((data.totalRevisedCostCr - data.totalOriginalCostCr) / 100000).toFixed(2)}L Cr`}
          colorClass="text-amber-400"
        />
        <KpiCard
          title="Cumulative Spend"
          value={`₹${(data.totalCumulativeExpenditureCr / 100000).toFixed(2)}L Cr`}
          subtitle={`Financial utilization: ${data.portfolioExpenditurePct.toFixed(1)}%`}
          colorClass="text-blue-400"
        />
        <KpiCard
          title="Requiring Attention"
          value={data.projectsRequiringAttentionCount.toLocaleString()}
          subtitle={`${data.criticalRiskCount} Critical | ${data.highRiskCount} High Risk`}
          colorClass="text-rose-400"
          icon={<ShieldAlert className="w-4 h-4 text-rose-400" />}
        />
      </div>

      {/* Geographic Density & Critical Projects Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map / State Distribution */}
        <div className="lg:col-span-2">
          <IndiaRiskMap
            states={data.stateDistribution || []}
            selectedState={selectedState}
            onSelectState={setSelectedState}
          />
        </div>

        {/* Priority Projects Requiring Immediate Attention */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Priority Flagged Projects
              </h3>
              <span className="text-[11px] text-slate-400">{data.activeWarningsCount} active alerts</span>
            </div>

            <div className="space-y-2.5">
              {data.recentChanges.slice(0, 5).map((p) => (
                <div
                  key={p.project_id}
                  onClick={() => navigate(`/projects/${p.project_id}`)}
                  className="p-3 rounded bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-950 cursor-pointer transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {p.project_name}
                    </span>
                    <RiskBadge band={p.risk_band} score={p.overall_risk_score} />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
                    <span>{p.sector_name}</span>
                    <span className="text-amber-400 font-medium">
                      {p.active_warning_count} alerts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/early-warning')}
            className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition"
          >
            Open Early Warning Queue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Exploration Cards */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Explore Analytical Dimensions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div
            onClick={() => navigate('/sectors')}
            className="p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/80 cursor-pointer transition group"
          >
            <Layers className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform mb-2" />
            <h4 className="text-sm font-semibold text-white">Sector Analytics</h4>
            <p className="text-xs text-slate-400 mt-1">Drill down across 12 infrastructure sectors and state performance.</p>
          </div>

          <div
            onClick={() => navigate('/ministries')}
            className="p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/80 cursor-pointer transition group"
          >
            <Building className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform mb-2" />
            <h4 className="text-sm font-semibold text-white">Ministry Analytics</h4>
            <p className="text-xs text-slate-400 mt-1">Track line ministries, implementing agencies, and executing bodies.</p>
          </div>

          <div
            onClick={() => navigate('/states')}
            className="p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/80 cursor-pointer transition group"
          >
            <MapPin className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform mb-2" />
            <h4 className="text-sm font-semibold text-white">State Analytics</h4>
            <p className="text-xs text-slate-400 mt-1">Geographic investments, regional execution pace, and local bottlenecks.</p>
          </div>

          <div
            onClick={() => navigate('/early-warning')}
            className="p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/80 cursor-pointer transition group"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform mb-2" />
            <h4 className="text-sm font-semibold text-white">Early Warning</h4>
            <p className="text-xs text-slate-400 mt-1">Multi-criteria triage queue and intervention workflow management.</p>
          </div>

          <div
            onClick={() => navigate('/operations')}
            className="p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 cursor-pointer transition group"
          >
            <Database className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform mb-2" />
            <h4 className="text-sm font-semibold text-white">Data & Model Operations</h4>
            <p className="text-xs text-slate-400 mt-1">Upload new PDF reports, retrain ML models, and audit pipeline data.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
