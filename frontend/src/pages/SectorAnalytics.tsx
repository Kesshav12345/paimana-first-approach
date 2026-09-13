import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  ArrowLeft, 
  Filter, 
  RotateCcw, 
  MapPin, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { api } from '../services/api';
import type { SectorSummary, ProjectSummary, FilterMetadata } from '../types';
import { RiskBadge } from '../components/common/Badges';
import { Pagination } from '../components/common/Pagination';

export const SectorAnalytics: React.FC = () => {
  const navigate = useNavigate();

  // Sector Overview State
  const [sectors, setSectors] = useState<SectorSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter Metadata from backend
  const [meta, setMeta] = useState<FilterMetadata | null>(null);

  // Filter Form State
  const [state, setState] = useState('ALL');
  const [ministry, setMinistry] = useState('ALL');
  const [riskBand, setRiskBand] = useState('ALL');
  const [trajectory, setTrajectory] = useState('ALL');
  const [costFilter, setCostFilter] = useState('ALL');
  const [delayFilter, setDelayFilter] = useState('ALL');
  const [warningFilter, setWarningFilter] = useState('ALL');
  const [multiState, setMultiState] = useState('ALL');
  const [sortBy, setSortBy] = useState('cost');

  // Active chart visualization tab
  const [activeChartTab, setActiveChartTab] = useState<'CAPITAL' | 'COST_DELAY' | 'RISK' | 'PROGRESS'>('CAPITAL');

  // Interface 2 & 3: Sector Detail Drill-Down
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [sectorStates, setSectorStates] = useState<Array<{ state_name: string; project_count: number; total_revised_cost_cr: number; avg_progress_pct: number; high_risk_count: number }>>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [page, setPage] = useState(1);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Fetch filter metadata on mount
  useEffect(() => {
    api.getProjectFilters()
      .then(setMeta)
      .catch(err => console.error('Failed to load filter metadata:', err));
  }, []);

  // Fetch Sectors based on current filters
  const fetchSectors = useCallback(() => {
    setLoading(true);
    api.getSectors({
      state,
      ministry,
      riskBand,
      trajectory,
      costFilter,
      delayFilter,
      warningFilter,
      multiState,
      sortBy
    })
      .then(res => {
        setSectors(res || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch sectors:', err);
        setSectors([]);
        setLoading(false);
      });
  }, [state, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState, sortBy]);

  // Initial load
  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  // Handle Preset Quick Filters
  const applyPreset = (preset: {
    riskBand?: string;
    costFilter?: string;
    delayFilter?: string;
    warningFilter?: string;
    multiState?: string;
  }) => {
    setState('ALL');
    setMinistry('ALL');
    setRiskBand(preset.riskBand || 'ALL');
    setTrajectory('ALL');
    setCostFilter(preset.costFilter || 'ALL');
    setDelayFilter(preset.delayFilter || 'ALL');
    setWarningFilter(preset.warningFilter || 'ALL');
    setMultiState(preset.multiState || 'ALL');
    setSortBy('cost');

    setLoading(true);
    api.getSectors({
      ...preset,
      sortBy: 'cost'
    }).then(res => {
      setSectors(res || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  // Reset Filters to National Default
  const resetFilters = () => {
    setState('ALL');
    setMinistry('ALL');
    setRiskBand('ALL');
    setTrajectory('ALL');
    setCostFilter('ALL');
    setDelayFilter('ALL');
    setWarningFilter('ALL');
    setMultiState('ALL');
    setSortBy('cost');

    setLoading(true);
    api.getSectors().then(res => {
      setSectors(res || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  // Active filter count
  const activeCount = [
    state !== 'ALL',
    ministry !== 'ALL',
    riskBand !== 'ALL',
    trajectory !== 'ALL',
    costFilter !== 'ALL',
    delayFilter !== 'ALL',
    warningFilter !== 'ALL',
    multiState !== 'ALL',
  ].filter(Boolean).length;

  // Handle Sector Selection (Drill-Down to Interface 2 & 3)
  const handleSelectSector = (secName: string) => {
    setSelectedSector(secName);
    setSelectedState(null);
    setPage(1);
    setLoadingProjects(true);
    api.getSectorStates(secName).then(setSectorStates);
    api.getSectorProjects(secName, undefined, 1, 20)
      .then(res => {
        setProjects(res || []);
        setLoadingProjects(false);
      })
      .catch(() => setLoadingProjects(false));
  };

  const handleSelectState = (stName: string) => {
    setSelectedState(stName);
    setPage(1);
    if (selectedSector) {
      setLoadingProjects(true);
      api.getSectorProjects(selectedSector, stName || undefined, 1, 20)
        .then(res => {
          setProjects(res || []);
          setLoadingProjects(false);
        })
        .catch(() => setLoadingProjects(false));
    }
  };

  // Aggregated Portfolio Totals for Top KPI Cards
  const totalProjects = sectors.reduce((acc, s) => acc + s.projectCount, 0);
  const totalRevisedCost = sectors.reduce((acc, s) => acc + s.totalRevisedCostCr, 0);
  const totalOrigCost = sectors.reduce((acc, s) => acc + s.totalOriginalCostCr, 0);
  const totalSpend = sectors.reduce((acc, s) => acc + s.totalCumulativeExpenditureCr, 0);
  const totalHighCritical = sectors.reduce((acc, s) => acc + s.highRiskCount + s.criticalRiskCount, 0);
  const totalWarnings = sectors.reduce((acc, s) => acc + s.activeWarningCount, 0);
  const portfolioCostEscalation = totalOrigCost > 0 ? ((totalRevisedCost - totalOrigCost) / totalOrigCost) * 100 : 0;

  // Chart Data preparation
  const chartData = sectors.map(s => ({
    name: s.sectorName,
    shortName: s.sectorName.length > 14 ? s.sectorName.substring(0, 12) + '...' : s.sectorName,
    projects: s.projectCount,
    originalCost: Math.round(s.totalOriginalCostCr),
    revisedCost: Math.round(s.totalRevisedCostCr),
    expenditure: Math.round(s.totalCumulativeExpenditureCr),
    costEscalationPct: Number(s.weightedCostEscalationPct.toFixed(1)),
    expenditurePct: Number(s.weightedExpenditurePct.toFixed(1)),
    physicalProgressPct: Number(s.avgPhysicalProgressPct.toFixed(1)),
    scheduleDelayMonths: Number((s.avgScheduleDelayMonths || 0).toFixed(1)),
    criticalRiskCount: s.criticalRiskCount,
    highRiskCount: s.highRiskCount,
    moderateLowRiskCount: Math.max(0, s.projectCount - (s.highRiskCount + s.criticalRiskCount)),
    warningCount: s.activeWarningCount,
  }));

  // Color Palette for Sectors
  const SECTOR_COLORS = [
    '#2563eb', '#3b82f6', '#0ea5e9', '#06b6d4', 
    '#10b981', '#059669', '#f59e0b', '#d97706', 
    '#ef4444', '#dc2626', '#8b5cf6', '#6366f1'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
            {selectedSector ? (
              <button
                onClick={() => { setSelectedSector(null); setSelectedState(null); }}
                className="flex items-center gap-1 hover:underline text-slate-500 hover:text-blue-600"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sector Overview
              </button>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                <span>Sector Portfolio Intelligence</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {selectedSector ? `${selectedSector} Detailed Analytics` : 'Infrastructure Sector Comparison & Analytics'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            {selectedSector
              ? `State-wise performance breakdown, capital burn, and project execution drill-down for ${selectedSector}.`
              : 'Comparative pictorial and tabular intelligence across central infrastructure sectors. Filter by state, ministry, and risk criteria to evaluate capital allocation and delivery.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>{sectors.length} Sectors Active</span>
          </div>
        </div>
      </div>

      {/* Main Sector Overview Mode (When no specific sector drill-down is open) */}
      {!selectedSector && (
        <>
          {/* TOP SECTION: Multi-Attribute Filtering System */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Filter Header & Quick Presets Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-slate-800">
                    Sector Analytical Filtering System
                  </span>
                  {activeCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white">
                      {activeCount} active criteria
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Showing All 12 Sectors (National Aggregate)
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500">
                  Select filters to update pictorial comparisons and table below
                </div>
              </div>

              {/* Quick Preset Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Presets:
                </span>
                <button
                  onClick={resetFilters}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                    activeCount === 0
                      ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  All Sectors (National)
                </button>
                <button
                  onClick={() => applyPreset({ riskBand: 'CRITICAL' })}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition flex items-center gap-1 ${
                    riskBand === 'CRITICAL'
                      ? 'bg-red-600 text-white border-red-700 shadow-sm'
                      : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                  }`}
                >
                  <ShieldAlert className="w-3 h-3" />
                  Critical Risk Only
                </button>
                <button
                  onClick={() => applyPreset({ costFilter: 'HIGH_ESCALATION' })}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition flex items-center gap-1 ${
                    costFilter === 'HIGH_ESCALATION'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <TrendingUp className="w-3 h-3" />
                  Cost Overrun &ge; 20%
                </button>
                <button
                  onClick={() => applyPreset({ delayFilter: 'SEVERE_DELAY' })}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition flex items-center gap-1 ${
                    delayFilter === 'SEVERE_DELAY'
                      ? 'bg-orange-600 text-white border-orange-700 shadow-sm'
                      : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  Delayed &ge; 12 Mo
                </button>
                <button
                  onClick={() => applyPreset({ multiState: 'YES' })}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition flex items-center gap-1 ${
                    multiState === 'YES'
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                      : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  Multi-State Corridors
                </button>
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                
                {/* 1. State / Geography */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    State / Territory Filter
                  </label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="ALL">All States & UTs (National)</option>
                    {meta?.states?.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Ministry Filter */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Administrative Ministry
                  </label>
                  <select
                    value={ministry}
                    onChange={e => setMinistry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="ALL">All Ministries</option>
                    {meta?.ministries?.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Risk Band */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Project Risk Classification
                  </label>
                  <select
                    value={riskBand}
                    onChange={e => setRiskBand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="ALL">All Risk Bands</option>
                    <option value="CRITICAL">Critical Risk</option>
                    <option value="HIGH">High Risk</option>
                    <option value="MODERATE">Moderate Risk</option>
                    <option value="LOW">Low Risk</option>
                  </select>
                </div>

                {/* 4. Cost Escalation Profile */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Budget Escalation Profile
                  </label>
                  <select
                    value={costFilter}
                    onChange={e => setCostFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="ALL">All Budget Profiles</option>
                    <option value="ESCALATED">Cost Overrun (&gt;0%)</option>
                    <option value="HIGH_ESCALATION">High Escalation (&ge;20%)</option>
                    <option value="SEVERE_ESCALATION">Severe Escalation (&ge;50%)</option>
                    <option value="WITHIN_BUDGET">Within Sanctioned Budget</option>
                  </select>
                </div>

                {/* 5. Schedule Delay Profile */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Schedule Slippage Profile
                  </label>
                  <select
                    value={delayFilter}
                    onChange={e => setDelayFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="ALL">All Schedule Profiles</option>
                    <option value="DELAYED">Any Delay (&gt;0 mo)</option>
                    <option value="SEVERE_DELAY">Severe Delay (&ge;12 mo)</option>
                    <option value="CRITICAL_DELAY">Critical Delay (&ge;24 mo)</option>
                    <option value="ON_TIME">On Schedule or Ahead</option>
                  </select>
                </div>

                {/* 6. Active Warning Signals */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Early Warning Alerts
                  </label>
                  <select
                    value={warningFilter}
                    onChange={e => setWarningFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="ALL">All Alert Levels</option>
                    <option value="HAS_WARNINGS">Active Warnings (&ge;1)</option>
                    <option value="MULTI_WARNING">Multi-Warning Alerted (&ge;2)</option>
                    <option value="NO_WARNINGS">Zero Warnings</option>
                  </select>
                </div>

                {/* 7. Geographic Footprint */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Geographic Footprint
                  </label>
                  <select
                    value={multiState}
                    onChange={e => setMultiState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="ALL">All Geographies</option>
                    <option value="YES">Multi-State Corridors Only</option>
                    <option value="NO">Single State Projects Only</option>
                  </select>
                </div>

                {/* 8. Metric Sort Order */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sector Sort & Rank Metric
                  </label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="cost">Total Revised Outlay (Highest First)</option>
                    <option value="escalation">Cost Escalation % (Highest First)</option>
                    <option value="delay">Average Delay (Most Delayed First)</option>
                    <option value="progress">Physical Progress % (Lowest First)</option>
                    <option value="risk">High / Critical Risk Projects Count</option>
                    <option value="name">Sector Name (A to Z)</option>
                  </select>
                </div>

              </div>

              {/* Action Buttons Row */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchSectors}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow flex items-center gap-1.5"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Apply Sector Filters</span>
                  </button>

                  <button
                    onClick={resetFilters}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-300 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All</span>
                  </button>
                </div>

                {/* Active Filter Tags summary */}
                <div className="text-xs text-slate-500">
                  <span>Evaluating <strong>{sectors.length} sectors</strong> across <strong>{totalProjects.toLocaleString()} projects</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* PORTFOLIO SNAPSHOT KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Filtered Projects</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalProjects.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Across {sectors.length} Sectors</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Revised Capital Outlay</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">₹{Math.round(totalRevisedCost).toLocaleString()} Cr</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Spend: ₹{Math.round(totalSpend).toLocaleString()} Cr</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Weighted Cost Growth</span>
              <div className="text-2xl font-extrabold text-red-600 mt-1 font-mono">+{portfolioCostEscalation.toFixed(1)}%</div>
              <div className="text-[11px] text-slate-400 mt-0.5">₹{(totalRevisedCost - totalOrigCost).toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr Overrun</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">High / Critical Risk</span>
              <div className="text-2xl font-extrabold text-rose-600 mt-1">{totalHighCritical.toLocaleString()}</div>
              <div className="text-[11px] text-amber-600 mt-0.5">{totalWarnings.toLocaleString()} Active Warnings</div>
            </div>
          </div>

          {/* MIDDLE SECTION: Pictorial & Graphical Comparison of Sectors */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Visualizer Tab Navigation Bar */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" />
                  Pictorial Sector Comparison Suite
                </span>
                <h2 className="text-base font-extrabold text-slate-800 tracking-tight mt-0.5">
                  Multi-Factor Graphical Visualizations
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg">
                <button
                  onClick={() => setActiveChartTab('CAPITAL')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    activeChartTab === 'CAPITAL'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1. Capital Allocation & Outlay
                </button>

                <button
                  onClick={() => setActiveChartTab('COST_DELAY')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    activeChartTab === 'COST_DELAY'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2. Cost Growth vs Delay Divergence
                </button>

                <button
                  onClick={() => setActiveChartTab('RISK')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    activeChartTab === 'RISK'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  3. Risk Concentration & Warnings
                </button>

                <button
                  onClick={() => setActiveChartTab('PROGRESS')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    activeChartTab === 'PROGRESS'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  4. Progress vs Expenditure Burn
                </button>
              </div>
            </div>

            {/* Chart Canvas Area */}
            <div className="p-5">
              {loading ? (
                <div className="flex items-center justify-center min-h-[380px]">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : sectors.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  No sector data matches the selected filter parameters.
                </div>
              ) : (
                <>
                  {/* CHART 1: Capital Allocation & Financial Exposure */}
                  {activeChartTab === 'CAPITAL' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          Comparison: Original Approved Outlay vs Revised Cost vs Cumulative Spend (₹ Crores)
                        </span>
                        <span>Unit: ₹ Crores</span>
                      </div>
                      <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis 
                              dataKey="shortName" 
                              tick={{ fontSize: 11, fill: '#64748b' }} 
                              angle={-30} 
                              textAnchor="end"
                              interval={0}
                            />
                            <YAxis 
                              tick={{ fontSize: 11, fill: '#64748b' }}
                              tickFormatter={v => `₹${(v / 1000).toFixed(0)}k Cr`}
                            />
                            <Tooltip 
                              formatter={(value: any) => [`₹${Number(value).toLocaleString()} Cr`, '']}
                              labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Bar dataKey="originalCost" name="Sanctioned Cost (₹ Cr)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="revisedCost" name="Current Revised Cost (₹ Cr)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenditure" name="Cumulative Expenditure (₹ Cr)" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* CHART 2: Cost Growth vs Schedule Delay Divergence */}
                  {activeChartTab === 'COST_DELAY' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          Dual-Axis Divergence: Weighted Cost Escalation % (Bar) vs Average Delay Months (Line)
                        </span>
                        <span className="text-red-600 font-semibold">Identifies Compounding Risk Sectors</span>
                      </div>
                      <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis 
                              dataKey="shortName" 
                              tick={{ fontSize: 11, fill: '#64748b' }} 
                              angle={-30} 
                              textAnchor="end"
                              interval={0}
                            />
                            <YAxis 
                              yAxisId="left" 
                              orientation="left" 
                              tick={{ fontSize: 11, fill: '#ef4444' }}
                              tickFormatter={v => `${v}%`}
                              label={{ value: 'Cost Escalation %', angle: -90, position: 'insideLeft', fill: '#ef4444', fontSize: 11 }}
                            />
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              tick={{ fontSize: 11, fill: '#f59e0b' }}
                              tickFormatter={v => `${v} mo`}
                              label={{ value: 'Average Delay (Months)', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 11 }}
                            />
                            <Tooltip 
                              formatter={(value: any, name: any) => [
                                name.includes('Escalation') ? `${value}%` : `${value} months`,
                                name
                              ]}
                              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Bar yAxisId="left" dataKey="costEscalationPct" name="Cost Escalation (%)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="scheduleDelayMonths" name="Avg Delay (Months)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5, fill: '#f59e0b' }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* CHART 3: Risk Concentration & Alert Density */}
                  {activeChartTab === 'RISK' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          Sector Risk Classification Breakdown: Critical Risk vs High Risk vs Moderate/Low
                        </span>
                        <span className="text-purple-600 font-semibold">Priority Monitoring Focus</span>
                      </div>
                      <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis 
                              dataKey="shortName" 
                              tick={{ fontSize: 11, fill: '#64748b' }} 
                              angle={-30} 
                              textAnchor="end"
                              interval={0}
                            />
                            <YAxis 
                              tick={{ fontSize: 11, fill: '#64748b' }}
                              label={{ value: 'Project Count', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                            />
                            <Tooltip 
                              formatter={(value: any) => [`${value} projects`, '']}
                              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Bar dataKey="criticalRiskCount" name="Critical Risk Projects" stackId="risk" fill="#dc2626" />
                            <Bar dataKey="highRiskCount" name="High Risk Projects" stackId="risk" fill="#f97316" />
                            <Bar dataKey="moderateLowRiskCount" name="Moderate / Low Risk" stackId="risk" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* CHART 4: Progress vs Financial Burn % */}
                  {activeChartTab === 'PROGRESS' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          Execution Divergence: Certified Physical Progress % vs Weighted Financial Expenditure %
                        </span>
                        <span className="text-blue-600 font-semibold">Flags Premature Capital Burn</span>
                      </div>
                      <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis 
                              dataKey="shortName" 
                              tick={{ fontSize: 11, fill: '#64748b' }} 
                              angle={-30} 
                              textAnchor="end"
                              interval={0}
                            />
                            <YAxis 
                              tick={{ fontSize: 11, fill: '#64748b' }}
                              tickFormatter={v => `${v}%`}
                              label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                            />
                            <Tooltip 
                              formatter={(value: any) => [`${value}%`, '']}
                              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Bar dataKey="physicalProgressPct" name="Avg Physical Progress (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenditurePct" name="Weighted Expenditure Burn (%)" fill="#059669" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* BOTTOM SECTION: Sector Comparison Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Sector Comparison Matrix (Tabular View)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Detailed numerical data corresponding to the pictorial representations above
                </p>
              </div>

              <div className="text-xs text-slate-500">
                Showing <strong>{sectors.length} sectors</strong> sorted by {sortBy}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/75 text-slate-600 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">Sector Name</th>
                    <th className="px-4 py-3.5 text-right">Projects</th>
                    <th className="px-4 py-3.5 text-right">Sanctioned Outlay</th>
                    <th className="px-4 py-3.5 text-right">Revised Cost</th>
                    <th className="px-4 py-3.5 text-right">Cost Escalation</th>
                    <th className="px-4 py-3.5 text-right">Expenditure</th>
                    <th className="px-4 py-3.5 text-right">Physical Progress</th>
                    <th className="px-4 py-3.5 text-center">Avg Delay</th>
                    <th className="px-4 py-3.5 text-center">Risk Cohort</th>
                    <th className="px-4 py-3.5 text-center">Alerts</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sectors.map((s, idx) => (
                    <tr 
                      key={s.sectorName} 
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => handleSelectSector(s.sectorName)}
                    >
                      {/* Sector Name */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length] }} 
                          />
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {s.sectorName}
                          </span>
                        </div>
                      </td>

                      {/* Project Count */}
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800">
                        {s.projectCount.toLocaleString()}
                      </td>

                      {/* Sanctioned Cost */}
                      <td className="px-4 py-3.5 text-right font-mono text-slate-500 whitespace-nowrap">
                        ₹{Math.round(s.totalOriginalCostCr).toLocaleString()} Cr
                      </td>

                      {/* Revised Cost */}
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        ₹{Math.round(s.totalRevisedCostCr).toLocaleString()} Cr
                      </td>

                      {/* Cost Escalation */}
                      <td className="px-4 py-3.5 text-right font-mono whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          s.weightedCostEscalationPct >= 20 ? 'bg-red-100 text-red-700' :
                          s.weightedCostEscalationPct > 0 ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {s.weightedCostEscalationPct > 0 ? '+' : ''}{s.weightedCostEscalationPct.toFixed(1)}%
                        </span>
                      </td>

                      {/* Cumulative Spend */}
                      <td className="px-4 py-3.5 text-right font-mono text-slate-700 whitespace-nowrap">
                        <div>₹{Math.round(s.totalCumulativeExpenditureCr).toLocaleString()} Cr</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          ({s.weightedExpenditurePct.toFixed(1)}% burn)
                        </div>
                      </td>

                      {/* Physical Progress */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="font-bold font-mono text-slate-800">
                          {s.avgPhysicalProgressPct.toFixed(1)}%
                        </div>
                        <div className="w-20 ml-auto bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${
                              s.avgPhysicalProgressPct >= 75 ? 'bg-emerald-500' :
                              s.avgPhysicalProgressPct >= 40 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, s.avgPhysicalProgressPct))}%` }}
                          />
                        </div>
                      </td>

                      {/* Average Delay */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {(s.avgScheduleDelayMonths || 0) > 0 ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            (s.avgScheduleDelayMonths || 0) >= 24 ? 'bg-red-100 text-red-700' :
                            (s.avgScheduleDelayMonths || 0) >= 12 ? 'bg-orange-100 text-orange-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            +{(s.avgScheduleDelayMonths || 0).toFixed(1)} mo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                            On Time
                          </span>
                        )}
                      </td>

                      {/* High & Critical Risk Count */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold">
                          {s.criticalRiskCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700">
                              {s.criticalRiskCount} Crit
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-100 text-orange-700">
                            {s.highRiskCount} High
                          </span>
                        </span>
                      </td>

                      {/* Warning Alerts */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {s.activeWarningCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">
                            <AlertTriangle className="w-3 h-3" />
                            {s.activeWarningCount}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Action Explore Button */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleSelectSector(s.sectorName)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg font-semibold text-xs transition border border-blue-200 hover:border-blue-600 shadow-sm"
                        >
                          <span>Explore</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* INTERFACE 2 & 3: Sector Specific Drill-Down (State Distribution & Project List) */}
      {selectedSector && (
        <div className="space-y-6">
          
          {/* Top Quick Navigation Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setSelectedSector(null); setSelectedState(null); }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-300 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to All Sectors Comparison</span>
              </button>

              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-500">
                Currently Inspecting: <strong className="text-slate-900">{selectedSector}</strong>
              </span>
            </div>

            <div className="text-xs text-slate-500">
              Select a state below to filter projects within this sector
            </div>
          </div>

          {/* Interface 2: State Performance Distribution Cards */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                State Distribution & Footprint for {selectedSector}
              </h3>
              <span className="text-[11px] text-slate-400">
                Click any state card to filter the project cohort
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
              <button
                onClick={() => handleSelectState('')}
                className={`p-3 rounded-lg border text-left text-xs transition ${
                  !selectedState
                    ? 'bg-blue-600 border-blue-700 text-white font-bold shadow'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>All States</div>
                <div className={`text-[11px] mt-1 ${!selectedState ? 'text-blue-100' : 'text-slate-400'}`}>
                  {sectorStates.reduce((acc, c) => acc + c.project_count, 0)} Projects
                </div>
              </button>

              {sectorStates.map(st => (
                <button
                  key={st.state_name}
                  onClick={() => handleSelectState(st.state_name)}
                  className={`p-3 rounded-lg border text-left text-xs transition truncate ${
                    selectedState === st.state_name
                      ? 'bg-blue-600 border-blue-700 text-white font-bold shadow'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate font-semibold">{st.state_name}</div>
                  <div className={`text-[11px] mt-1 flex items-center justify-between ${
                    selectedState === st.state_name ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    <span>{st.project_count} proj</span>
                    {st.high_risk_count > 0 && (
                      <span className={selectedState === st.state_name ? 'text-amber-200 font-bold' : 'text-red-600 font-bold'}>
                        {st.high_risk_count} risk
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interface 3: Projects Table in this Sector */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Projects in {selectedSector} {selectedState ? `→ ${selectedState}` : '(All States)'}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700">
                  {projects.length} Records
                </span>
              </div>

              <div className="text-xs text-slate-500">
                Click <span className="font-semibold text-blue-600">"Inspect"</span> on any row to drill down into 15 analytical dimensions
              </div>
            </div>

            {loadingProjects ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs text-slate-400">Loading projects...</span>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No projects found in this sector for the selected state.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/75 text-slate-600 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Project & Identity</th>
                      <th className="px-4 py-3">Executing Agency</th>
                      <th className="px-4 py-3">State</th>
                      <th className="px-4 py-3 text-right">Revised Cost</th>
                      <th className="px-4 py-3 text-right">Progress</th>
                      <th className="px-4 py-3 text-center">Delay</th>
                      <th className="px-4 py-3 text-center">Risk</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projects.map(p => (
                      <tr 
                        key={p.projectId} 
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/projects/${p.projectId}`)}
                      >
                        <td className="px-4 py-3 max-w-xs">
                          <div className="font-mono text-[11px] font-semibold text-blue-600 mb-0.5">
                            {p.projectId}
                          </div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition truncate" title={p.projectName}>
                            {p.projectName}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-600 truncate max-w-[180px]" title={p.agencyName}>
                          {p.agencyName}
                        </td>

                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                          {p.stateName || 'Multi-State'}
                        </td>

                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          ₹{p.latestRevisedCostCr.toLocaleString()} Cr
                        </td>

                        <td className="px-4 py-3 text-right font-mono whitespace-nowrap">
                          {p.physicalProgressPct}%
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {p.scheduleSlippageMonths > 0 ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              p.scheduleSlippageMonths >= 24 ? 'bg-red-100 text-red-700' :
                              p.scheduleSlippageMonths >= 12 ? 'bg-orange-100 text-orange-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              +{p.scheduleSlippageMonths} mo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                              On Time
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <RiskBadge band={p.riskBand} score={p.overallRiskScore} />
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/projects/${p.projectId}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg font-semibold text-xs transition border border-blue-200 hover:border-blue-600 shadow-sm"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

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
