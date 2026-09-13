import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  AlertTriangle, 
  ShieldAlert, 
  Building2, 
  MapPin, 
  Clock, 
  TrendingUp,
  FolderKanban,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import type { FilterMetadata, ProjectSummary } from '../types';
import { RiskBadge } from '../components/common/Badges';
import { Pagination } from '../components/common/Pagination';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter metadata loaded from backend
  const [meta, setMeta] = useState<FilterMetadata | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Filter form state (initialized from URL search params if present)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sector, setSector] = useState(searchParams.get('sector') || 'ALL');
  const [ministry, setMinistry] = useState(searchParams.get('ministry') || 'ALL');
  const [state, setState] = useState(searchParams.get('state') || 'ALL');
  const [riskBand, setRiskBand] = useState(searchParams.get('riskBand') || 'ALL');
  const [trajectory, setTrajectory] = useState(searchParams.get('trajectory') || 'ALL');
  const [costFilter, setCostFilter] = useState(searchParams.get('costFilter') || 'ALL');
  const [delayFilter, setDelayFilter] = useState(searchParams.get('delayFilter') || 'ALL');
  const [warningFilter, setWarningFilter] = useState(searchParams.get('warningFilter') || 'ALL');
  const [multiState, setMultiState] = useState(searchParams.get('multiState') || 'ALL');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'risk');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Query state
  const hasInitialParams = searchParams.toString().length > 0;
  const [hasApplied, setHasApplied] = useState(hasInitialParams);
  const [loadingResults, setLoadingResults] = useState(false);
  const [results, setResults] = useState<ProjectSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Load filter metadata
  useEffect(() => {
    api.getProjectFilters()
      .then(data => {
        setMeta(data);
        setLoadingMeta(false);
      })
      .catch(err => {
        console.error('Failed to load filter metadata:', err);
        setLoadingMeta(false);
      });
  }, []);

  // Execute Search function
  const executeQuery = useCallback((currentPage: number = 1) => {
    setLoadingResults(true);
    setHasApplied(true);

    const params: {
      search?: string;
      sector?: string;
      ministry?: string;
      state?: string;
      riskBand?: string;
      trajectory?: string;
      costFilter?: string;
      delayFilter?: string;
      warningFilter?: string;
      multiState?: string;
      sortBy?: string;
      page: number;
      size: number;
    } = {
      page: currentPage,
      size: 20,
    };

    const sp = new URLSearchParams();

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
      sp.set('search', searchTerm.trim());
    }
    if (sector !== 'ALL') {
      params.sector = sector;
      sp.set('sector', sector);
    }
    if (ministry !== 'ALL') {
      params.ministry = ministry;
      sp.set('ministry', ministry);
    }
    if (state !== 'ALL') {
      params.state = state;
      sp.set('state', state);
    }
    if (riskBand !== 'ALL') {
      params.riskBand = riskBand;
      sp.set('riskBand', riskBand);
    }
    if (trajectory !== 'ALL') {
      params.trajectory = trajectory;
      sp.set('trajectory', trajectory);
    }
    if (costFilter !== 'ALL') {
      params.costFilter = costFilter;
      sp.set('costFilter', costFilter);
    }
    if (delayFilter !== 'ALL') {
      params.delayFilter = delayFilter;
      sp.set('delayFilter', delayFilter);
    }
    if (warningFilter !== 'ALL') {
      params.warningFilter = warningFilter;
      sp.set('warningFilter', warningFilter);
    }
    if (multiState !== 'ALL') {
      params.multiState = multiState;
      sp.set('multiState', multiState);
    }
    if (sortBy !== 'risk') {
      params.sortBy = sortBy;
      sp.set('sortBy', sortBy);
    }
    if (currentPage > 1) {
      sp.set('page', String(currentPage));
    }

    setSearchParams(sp, { replace: true });

    api.searchProjects(params)
      .then(res => {
        setResults(res.projects || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 0);
        setPage(currentPage);
        setLoadingResults(false);
      })
      .catch(err => {
        console.error('Failed to search projects:', err);
        setResults([]);
        setTotal(0);
        setTotalPages(0);
        setLoadingResults(false);
      });
  }, [searchTerm, sector, ministry, state, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState, sortBy, setSearchParams]);

  // If initial URL had query parameters, run query immediately on mount
  useEffect(() => {
    if (hasInitialParams) {
      executeQuery(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quick preset pill handler
  const applyPreset = (preset: {
    riskBand?: string;
    costFilter?: string;
    delayFilter?: string;
    warningFilter?: string;
    multiState?: string;
    trajectory?: string;
  }) => {
    setSearchTerm('');
    setSector('ALL');
    setMinistry('ALL');
    setState('ALL');
    setRiskBand(preset.riskBand || 'ALL');
    setTrajectory(preset.trajectory || 'ALL');
    setCostFilter(preset.costFilter || 'ALL');
    setDelayFilter(preset.delayFilter || 'ALL');
    setWarningFilter(preset.warningFilter || 'ALL');
    setMultiState(preset.multiState || 'ALL');
    setSortBy('risk');
    setPage(1);

    setLoadingResults(true);
    setHasApplied(true);

    const sp = new URLSearchParams();
    if (preset.riskBand && preset.riskBand !== 'ALL') sp.set('riskBand', preset.riskBand);
    if (preset.trajectory && preset.trajectory !== 'ALL') sp.set('trajectory', preset.trajectory);
    if (preset.costFilter && preset.costFilter !== 'ALL') sp.set('costFilter', preset.costFilter);
    if (preset.delayFilter && preset.delayFilter !== 'ALL') sp.set('delayFilter', preset.delayFilter);
    if (preset.warningFilter && preset.warningFilter !== 'ALL') sp.set('warningFilter', preset.warningFilter);
    if (preset.multiState && preset.multiState !== 'ALL') sp.set('multiState', preset.multiState);
    setSearchParams(sp, { replace: true });

    api.searchProjects({
      ...preset,
      page: 1,
      size: 20
    }).then(res => {
      setResults(res.projects || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 0);
      setPage(1);
      setLoadingResults(false);
    }).catch(err => {
      console.error(err);
      setLoadingResults(false);
    });
  };

  // Reset all filters to unapplied state
  const resetFilters = () => {
    setSearchTerm('');
    setSector('ALL');
    setMinistry('ALL');
    setState('ALL');
    setRiskBand('ALL');
    setTrajectory('ALL');
    setCostFilter('ALL');
    setDelayFilter('ALL');
    setWarningFilter('ALL');
    setMultiState('ALL');
    setSortBy('risk');
    setPage(1);
    setHasApplied(false);
    setResults([]);
    setTotal(0);
    setTotalPages(0);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Active filter count
  const activeCount = [
    searchTerm.trim(),
    sector !== 'ALL',
    ministry !== 'ALL',
    state !== 'ALL',
    riskBand !== 'ALL',
    trajectory !== 'ALL',
    costFilter !== 'ALL',
    delayFilter !== 'ALL',
    warningFilter !== 'ALL',
    multiState !== 'ALL',
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>Infrastructure Projects Registry</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Projects Portfolio & Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Multi-attribute query and drill-down engine across all 3,977 central infrastructure projects. 
            Configure jurisdictional, financial, risk, and early warning criteria below to inspect matching cohorts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>3,977 Projects Monitored</span>
          </div>
        </div>
      </div>

      {/* Quick Filter Presets */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            Quick Query Presets
          </span>
          <span className="text-[11px] text-slate-400">Click any preset to instantly apply filter</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset({ riskBand: 'CRITICAL' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              riskBand === 'CRITICAL' && costFilter === 'ALL' && delayFilter === 'ALL'
                ? 'bg-red-600 text-white border-red-700 shadow-sm ring-2 ring-red-200'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Critical Risk Projects</span>
          </button>

          <button
            onClick={() => applyPreset({ costFilter: 'HIGH_ESCALATION' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              costFilter === 'HIGH_ESCALATION'
                ? 'bg-amber-600 text-white border-amber-700 shadow-sm ring-2 ring-amber-200'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cost Overrun &ge; 20%</span>
          </button>

          <button
            onClick={() => applyPreset({ delayFilter: 'SEVERE_DELAY' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              delayFilter === 'SEVERE_DELAY'
                ? 'bg-orange-600 text-white border-orange-700 shadow-sm ring-2 ring-orange-200'
                : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Delayed &ge; 12 Months</span>
          </button>

          <button
            onClick={() => applyPreset({ warningFilter: 'MULTI_WARNING' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              warningFilter === 'MULTI_WARNING'
                ? 'bg-purple-600 text-white border-purple-700 shadow-sm ring-2 ring-purple-200'
                : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Multi-Warning Alerted (&ge;2)</span>
          </button>

          <button
            onClick={() => applyPreset({ trajectory: 'DETERIORATING' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              trajectory === 'DETERIORATING'
                ? 'bg-rose-600 text-white border-rose-700 shadow-sm ring-2 ring-rose-200'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span>Deteriorating Trajectory</span>
          </button>

          <button
            onClick={() => applyPreset({ multiState: 'YES' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              multiState === 'YES'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-200'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Inter-State Corridors</span>
          </button>
        </div>
      </div>

      {/* Main Filter Command Center */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">
              Multi-Dimensional Filter & Search System
            </span>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white">
                {activeCount} active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Select criteria and click <strong>Apply Filters</strong></span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Section 1: Search & Sort Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Free-Text Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by Project Name, Project ID (e.g. PRJ_...), OCMS code..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && executeQuery(1)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Result Sort Order
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="risk">Overall Risk Score (Highest First)</option>
                <option value="cost">Revised Cost (Highest First)</option>
                <option value="escalation">Cost Escalation % (Highest First)</option>
                <option value="delay">Schedule Slippage (Most Delayed)</option>
                <option value="progress">Physical Progress % (Lowest First)</option>
                <option value="name">Project Name (A to Z)</option>
              </select>
            </div>
          </div>

          {/* Section 2: Jurisdictional & Administrative */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              1. Jurisdictional & Administrative Filters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sector ({meta?.sectors?.length || 12})
                </label>
                <select
                  value={sector}
                  onChange={e => setSector(e.target.value)}
                  disabled={loadingMeta}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="ALL">All Sectors</option>
                  {meta?.sectors?.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ministry ({meta?.ministries?.length || 16})
                </label>
                <select
                  value={ministry}
                  onChange={e => setMinistry(e.target.value)}
                  disabled={loadingMeta}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="ALL">All Ministries</option>
                  {meta?.ministries?.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State / UT ({meta?.states?.length || 34})
                </label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  disabled={loadingMeta}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="ALL">All States & UTs</option>
                  {meta?.states?.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Geographic Footprint
                </label>
                <select
                  value={multiState}
                  onChange={e => setMultiState(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="ALL">All Geographies</option>
                  <option value="YES">Multi-State Corridors Only</option>
                  <option value="NO">Single State Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Risk, Trajectory & Early Warning */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              2. Risk Classification & Early Warning Signals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Risk Band
                </label>
                <select
                  value={riskBand}
                  onChange={e => setRiskBand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="ALL">All Risk Bands</option>
                  <option value="CRITICAL">Critical Risk</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MODERATE">Moderate Risk</option>
                  <option value="LOW">Low Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Risk Trajectory
                </label>
                <select
                  value={trajectory}
                  onChange={e => setTrajectory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="ALL">All Trajectories</option>
                  <option value="DETERIORATING">Deteriorating (Worsening)</option>
                  <option value="STABLE">Stable (Unchanged)</option>
                  <option value="IMPROVING">Improving (Recovery)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Budget Escalation Profile
                </label>
                <select
                  value={costFilter}
                  onChange={e => setCostFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  {meta?.costFilters?.map(cf => (
                    <option key={cf.id} value={cf.id}>{cf.label}</option>
                  )) || (
                    <>
                      <option value="ALL">All Budget Profiles</option>
                      <option value="ESCALATED">Cost Escalation (&gt;0%)</option>
                      <option value="HIGH_ESCALATION">High Escalation (&ge;20%)</option>
                      <option value="SEVERE_ESCALATION">Severe Escalation (&ge;50%)</option>
                      <option value="WITHIN_BUDGET">Within Sanctioned Budget</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Schedule Slippage & Delay
                </label>
                <select
                  value={delayFilter}
                  onChange={e => setDelayFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  {meta?.delayFilters?.map(df => (
                    <option key={df.id} value={df.id}>{df.label}</option>
                  )) || (
                    <>
                      <option value="ALL">All Schedule Profiles</option>
                      <option value="DELAYED">Any Slippage (&gt;0 mo)</option>
                      <option value="SEVERE_DELAY">Major Delay (&ge;12 mo)</option>
                      <option value="CRITICAL_DELAY">Critical Delay (&ge;24 mo)</option>
                      <option value="ON_TIME">On Schedule or Ahead</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => executeQuery(1)}
                disabled={loadingResults}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow flex items-center gap-2 disabled:opacity-50"
              >
                {loadingResults ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Apply Filters & Query Projects</span>
              </button>

              <button
                onClick={resetFilters}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>

            <div className="text-xs text-slate-500">
              {hasApplied ? (
                <span>Found <strong className="text-slate-800 font-bold">{total.toLocaleString()}</strong> matching projects</span>
              ) : (
                <span className="text-slate-400 italic">Configure filters above and click Apply to view projects</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasApplied && activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Active Criteria:</span>
          {searchTerm.trim() && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
              Keyword: "{searchTerm.trim()}"
              <button onClick={() => { setSearchTerm(''); executeQuery(1); }} className="hover:text-blue-950 font-bold ml-1">&times;</button>
            </span>
          )}
          {sector !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300">
              Sector: {sector}
              <button onClick={() => { setSector('ALL'); executeQuery(1); }} className="hover:text-slate-950 font-bold ml-1">&times;</button>
            </span>
          )}
          {ministry !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300">
              Ministry: {ministry}
              <button onClick={() => { setMinistry('ALL'); executeQuery(1); }} className="hover:text-slate-950 font-bold ml-1">&times;</button>
            </span>
          )}
          {state !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300">
              State: {state}
              <button onClick={() => { setState('ALL'); executeQuery(1); }} className="hover:text-slate-950 font-bold ml-1">&times;</button>
            </span>
          )}
          {riskBand !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-800 border border-red-200">
              Risk: {riskBand}
              <button onClick={() => { setRiskBand('ALL'); executeQuery(1); }} className="hover:text-red-950 font-bold ml-1">&times;</button>
            </span>
          )}
          {trajectory !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
              Trajectory: {trajectory}
              <button onClick={() => { setTrajectory('ALL'); executeQuery(1); }} className="hover:text-rose-950 font-bold ml-1">&times;</button>
            </span>
          )}
          {costFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
              Budget: {costFilter}
              <button onClick={() => { setCostFilter('ALL'); executeQuery(1); }} className="hover:text-amber-950 font-bold ml-1">&times;</button>
            </span>
          )}
          {delayFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-800 border border-orange-200">
              Delay: {delayFilter}
              <button onClick={() => { setDelayFilter('ALL'); executeQuery(1); }} className="hover:text-orange-950 font-bold ml-1">&times;</button>
            </span>
          )}
          {multiState !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200">
              Multi-State: {multiState}
              <button onClick={() => { setMultiState('ALL'); executeQuery(1); }} className="hover:text-indigo-950 font-bold ml-1">&times;</button>
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Results or Initial Guidance Section */}
      {!hasApplied ? (
        /* INITIAL STATE: Clean guidance panel, no mass table dump */
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Filter className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              Filter System Ready
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              To inspect projects, select your criteria from the filters above and click{' '}
              <strong className="text-blue-600">"Apply Filters & Query Projects"</strong>, or choose one of the{' '}
              <strong className="text-slate-700">Quick Query Presets</strong> above.
            </p>
          </div>

          {/* Statistical Overview Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-lg font-bold text-slate-800">3,977</span>
              <span className="text-[11px] text-slate-500">Total Projects</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-lg font-bold text-slate-800">12</span>
              <span className="text-[11px] text-slate-500">Sectors</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-lg font-bold text-slate-800">16</span>
              <span className="text-[11px] text-slate-500">Ministries</span>
            </div>
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <span className="block text-lg font-bold text-red-700">1,052</span>
              <span className="text-[11px] text-red-600 font-medium">Critical / High Risk</span>
            </div>
          </div>
        </div>
      ) : loadingResults ? (
        /* LOADING STATE */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-700">Querying canonical database...</p>
          <p className="text-[11px] text-slate-400 mt-1">Evaluating multi-dimensional filters across 3,977 projects</p>
        </div>
      ) : results.length === 0 ? (
        /* EMPTY STATE */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">No Projects Matched Selected Criteria</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            No projects in the canonical repository satisfied all your active filter conditions. 
            Try clearing some filters or selecting "All" on specific criteria.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            Clear Filters & Reset
          </button>
        </div>
      ) : (
        /* RESULTS TABLE */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Matching Projects</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700">
                {total.toLocaleString()} Records
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Click <span className="font-semibold text-blue-600">"Explore"</span> on any project row to view all 15 analytical dimensions
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Project & Identity</th>
                  <th className="px-4 py-3">Sector / Ministry</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3 text-right">Sanctioned & Revised Cost</th>
                  <th className="px-4 py-3 text-right">Physical Progress</th>
                  <th className="px-4 py-3 text-center">Delay</th>
                  <th className="px-4 py-3 text-center">Risk Assessment</th>
                  <th className="px-4 py-3 text-center">Alerts</th>
                  <th className="px-4 py-3 text-right">Drill Down</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map(p => (
                  <tr 
                    key={p.projectId} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/projects/${p.projectId}`)}
                  >
                    {/* 1. Project ID & Name */}
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {p.projectId}
                        </span>
                        {p.multiState && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            MULTI-STATE
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition truncate" title={p.projectName}>
                        {p.projectName}
                      </div>
                    </td>

                    {/* 2. Sector & Ministry */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{p.sectorName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]" title={p.ministryName}>
                        {p.ministryName}
                      </div>
                    </td>

                    {/* 3. State */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{p.stateName || 'Multi-State'}</span>
                      </div>
                    </td>

                    {/* 4. Cost Exposure */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">
                        ₹{(p.latestRevisedCostCr || p.originalCostCr).toLocaleString()} Cr
                      </div>
                      <div className="text-[11px] flex items-center justify-end gap-1 mt-0.5">
                        <span className="text-slate-400">Orig: ₹{p.originalCostCr?.toLocaleString()} Cr</span>
                        {p.costEscalationPct > 0 ? (
                          <span className="text-red-600 font-semibold font-mono">
                            (+{p.costEscalationPct}%)
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold font-mono">
                            (0%)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. Physical Progress */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="font-bold font-mono text-slate-900">
                        {p.physicalProgressPct}%
                      </div>
                      <div className="w-20 ml-auto bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${
                            p.physicalProgressPct >= 75 ? 'bg-emerald-500' :
                            p.physicalProgressPct >= 40 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, p.physicalProgressPct))}%` }}
                        />
                      </div>
                    </td>

                    {/* 6. Schedule Delay */}
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

                    {/* 7. Risk Band */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <RiskBadge band={p.riskBand} score={p.overallRiskScore} />
                    </td>

                    {/* 8. Alerts */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {p.activeWarningCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">
                          <AlertTriangle className="w-3 h-3" />
                          {p.activeWarningCount}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* 9. Drill Down Action */}
                    <td className="px-4 py-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/projects/${p.projectId}`)}
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

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            size={20}
            onPageChange={newPage => executeQuery(newPage)}
          />
        </div>
      )}

    </div>
  );
};
