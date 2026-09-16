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
  const [homeSummary, setHomeSummary] = useState<any>(null);
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
    Promise.all([api.getProjectFilters(), api.getHomeSummary().catch(() => null)])
      .then(([filtersData, hData]) => {
        if (hData) setHomeSummary(hData);
        setMeta(filtersData);
        setLoadingMeta(false);
      })
      .catch((err: unknown) => {
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b-2 border-[#B8D9F2] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#1BA0E2] font-bold text-xs uppercase tracking-wider mb-1">
            <FolderKanban className="w-4 h-4 text-[#1BA0E2]" />
            <span>Infrastructure Projects Registry</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A365C] tracking-tight">
            Projects Portfolio & Intelligence
          </h1>
          <p className="text-xs text-[#4A6572] mt-1 max-w-3xl leading-relaxed font-medium">
            Multi-attribute query and drill-down engine across all monitored central sector infrastructure projects. 
            Configure jurisdictional, financial, risk, and early warning criteria below to inspect matching cohorts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#E1EFF9] border border-[#B8D9F2] text-[#0A365C] text-xs font-bold flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#1BA0E2] animate-pulse" />
            <span>{homeSummary?.totalProjects ? `${homeSummary.totalProjects.toLocaleString()} Projects Monitored` : 'Central Portfolio Monitored'}</span>
          </div>
        </div>
      </div>

      {/* Quick Filter Presets */}
      <div className="bg-white rounded-xl border-2 border-[#B8D9F2] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0A365C] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#1BA0E2]" />
            Quick Query Presets
          </span>
          <span className="text-[11px] text-[#4A6572] font-medium">Click any preset to instantly apply filter</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset({ riskBand: 'CRITICAL' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              riskBand === 'CRITICAL' && costFilter === 'ALL' && delayFilter === 'ALL'
                ? 'bg-red-600 text-white border-red-700 shadow-sm ring-2 ring-red-200'
                : 'bg-[#F5E7E4] text-[#B74436] border-[#E5B8B2] hover:bg-red-100'
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
                : 'bg-[#F5EEDB] text-[#C89432] border-[#DFCBB0] hover:bg-amber-100'
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
      <div className="bg-white rounded-xl border border-[#DDD9D0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-[#FAF8F5] border-b border-[#DDD9D0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#267A69]" />
            <span className="text-sm font-bold text-[#26312D]">
              Multi-Dimensional Filter & Search System
            </span>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#173F35] text-white">
                {activeCount} active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#66736D]">
            <span>Select criteria and click <strong>Apply Filters</strong></span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Section 1: Search & Sort Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#26312D] mb-1">
                Project Free-Text Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#8C9893] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by Project Name, Project ID (e.g. PRJ_...), OCMS code..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && executeQuery(1)}
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-[#DDD9D0] rounded-lg text-xs text-[#26312D] focus:outline-none focus:ring-2 focus:ring-[#267A69] focus:bg-white transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-xs text-[#8C9893] hover:text-slate-600"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#26312D] mb-1">
                Result Sort Order
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD9D0] rounded-lg text-xs text-[#26312D] focus:outline-none focus:ring-2 focus:ring-[#267A69] transition"
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
          <div className="pt-2 border-t border-[#EAE6DF]">
            <h3 className="text-xs font-bold text-[#66736D] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#8C9893]" />
              1. Jurisdictional & Administrative Filters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#26312D] mb-1">
                  Sector ({meta?.sectors?.length || 12})
                </label>
                <select
                  value={sector}
                  onChange={e => setSector(e.target.value)}
                  disabled={loadingMeta}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD9D0] rounded-lg text-xs text-[#26312D] focus:outline-none focus:ring-2 focus:ring-[#267A69] transition"
                >
                  <option value="ALL">All Sectors</option>
                  {meta?.sectors?.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26312D] mb-1">
                  Ministry ({meta?.ministries?.length || 16})
                </label>
                <select
                  value={ministry}
                  onChange={e => setMinistry(e.target.value)}
                  disabled={loadingMeta}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD9D0] rounded-lg text-xs text-[#26312D] focus:outline-none focus:ring-2 focus:ring-[#267A69] transition"
                >
                  <option value="ALL">All Ministries</option>
                  {meta?.ministries?.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26312D] mb-1">
                  State / UT ({meta?.states?.length || 34})
                </label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  disabled={loadingMeta}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD9D0] rounded-lg text-xs text-[#26312D] focus:outline-none focus:ring-2 focus:ring-[#267A69] transition"
                >
                  <option value="ALL">All States & UTs</option>
                  {meta?.states?.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26312D] mb-1">
                  Geographic Footprint
                </label>
                <select
                  value={multiState}
                  onChange={e => setMultiState(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD9D0] rounded-lg text-xs text-[#26312D] focus:outline-none focus:ring-2 focus:ring-[#267A69] transition"
                >
                  <option value="ALL">All Geographies</option>
                  <option value="YES">Multi-State Corridors Only</option>
                  <option value="NO">Single State Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Risk, Trajectory & Early Warning */}
          <div className="pt-2 border-t border-[#EAE6DF]">
            <h3 className="text-xs font-bold text-[#66736D] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#8C9893]" />
              2. Risk Classification & Early Warning Signals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#26312D] mb-1">
                  Risk Band
                </label>
                <select
                  value={riskBand}
                  onChange={e => setRiskBand(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD9D0] rounded-lg text-xs text-[#26312D] focus:outline-none focus:ring-2 focus:ring-[#267A69] transition"
                >
                  <option value="ALL">All Risk Bands</option>
                  <option value="CRITICAL">Critical Risk</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MODERATE">Moderate Risk</option>
                  <option value="LOW">Low Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26312D] mb-1">
                  Risk Trajectory
                </label>
                <select
                  value={trajectory}
                  onChange={e => setTrajectory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD9D0] rounded-lg text-xs text-[#26312D] focus:outline-none focus:ring-2 focus:ring-[#267A69] transition"
                >
                  <option value="ALL">All Trajectories</option>
                  <option value="DETERIORATING">Deteriorating (Worsening)</option>
                  <option value="STABLE">Stable (Unchanged)</option>
                  <option value="IMPROVING">Improving (Recovery)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26312D] mb-1">
                  Budget Escalation Profile
                </label>
                <select
                  value={costFilter}
                  onChange={e => setCostFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD9D0] rounded-lg text-xs text-[#26312D] focus:outline-none focus:ring-2 focus:ring-[#267A69] transition"
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
                <label className="block text-xs font-semibold text-[#26312D] mb-1">
                  Schedule Slippage & Delay
                </label>
                <select
                  value={delayFilter}
                  onChange={e => setDelayFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD9D0] rounded-lg text-xs text-[#26312D] focus:outline-none focus:ring-2 focus:ring-[#267A69] transition"
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
          <div className="pt-3 border-t border-[#DDD9D0] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => executeQuery(1)}
                disabled={loadingResults}
                className="px-5 py-2.5 bg-[#173F35] hover:bg-[#267A69] text-white rounded-lg text-xs font-bold transition shadow flex items-center gap-2 disabled:opacity-50"
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
                className="px-4 py-2.5 bg-[#F6F3EC] hover:bg-[#EAE6DF] text-[#26312D] rounded-lg text-xs font-semibold transition border border-[#DDD9D0] flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>

            <div className="text-xs text-[#52605B]">
              <span>Showing <strong className="text-[#173F35] font-bold">{total.toLocaleString()}</strong> central sector projects</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasApplied && activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          <span className="text-xs font-semibold text-[#66736D] mr-1">Active Criteria:</span>
          {searchTerm.trim() && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#E8F0EC] text-blue-800 border border-[#BED6CB]">
              Keyword: "{searchTerm.trim()}"
              <button onClick={() => { setSearchTerm(''); executeQuery(1); }} className="hover:text-blue-950 font-bold ml-1">&times;</button>
            </span>
          )}
          {sector !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F6F3EC] text-[#26312D] border border-[#DDD9D0]">
              Sector: {sector}
              <button onClick={() => { setSector('ALL'); executeQuery(1); }} className="hover:text-slate-950 font-bold ml-1">&times;</button>
            </span>
          )}
          {ministry !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F6F3EC] text-[#26312D] border border-[#DDD9D0]">
              Ministry: {ministry}
              <button onClick={() => { setMinistry('ALL'); executeQuery(1); }} className="hover:text-slate-950 font-bold ml-1">&times;</button>
            </span>
          )}
          {state !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F6F3EC] text-[#26312D] border border-[#DDD9D0]">
              State: {state}
              <button onClick={() => { setState('ALL'); executeQuery(1); }} className="hover:text-slate-950 font-bold ml-1">&times;</button>
            </span>
          )}
          {riskBand !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F5E7E4] text-[#B74436] border border-[#E5B8B2]">
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
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F5EEDB] text-[#C89432] border border-[#DFCBB0]">
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
            className="text-xs text-[#267A69] hover:text-blue-800 font-semibold underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Results or Initial Guidance Section */}
      {!hasApplied ? (
        /* INITIAL STATE: Clean guidance panel, no mass table dump */
        <div className="bg-white rounded-xl border-2 border-dashed border-[#B8D9F2] p-8 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#E1EFF9] text-[#1BA0E2] flex items-center justify-center mx-auto border border-[#B8D9F2]">
              <Filter className="w-6 h-6" />
            </div>
            <h2 className="text-base font-extrabold text-[#0A365C]">
              Filter System Ready
            </h2>
            <p className="text-xs text-[#4A6572] leading-relaxed font-medium">
              To inspect projects, select your criteria from the filters above and click{' '}
              <strong className="text-[#1BA0E2]">"Apply Filters & Query Projects"</strong>, or choose one of the{' '}
              <strong className="text-[#0A365C]">Quick Query Presets</strong> above.
            </p>
          </div>

          {/* Statistical Overview Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
            <div className="p-3 rounded-lg bg-[#F0F6FB] border border-[#B8D9F2]">
              <span className="block text-lg font-bold text-[#0A365C] tabular-nums">{homeSummary?.totalProjects?.toLocaleString() || '—'}</span>
              <span className="text-[11px] text-[#4A6572] font-medium">Total Projects</span>
            </div>
            <div className="p-3 rounded-lg bg-[#F0F6FB] border border-[#B8D9F2]">
              <span className="block text-lg font-bold text-[#0A365C] tabular-nums">{meta?.sectors?.length || 12}</span>
              <span className="text-[11px] text-[#4A6572] font-medium">Sectors</span>
            </div>
            <div className="p-3 rounded-lg bg-[#F0F6FB] border border-[#B8D9F2]">
              <span className="block text-lg font-bold text-[#0A365C] tabular-nums">{meta?.ministries?.length || 16}</span>
              <span className="text-[11px] text-[#4A6572] font-medium">Ministries</span>
            </div>
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <span className="block text-lg font-bold text-[#C53030] tabular-nums">{homeSummary?.projectsRequiringAttentionCount?.toLocaleString() || '—'}</span>
              <span className="text-[11px] text-[#C53030] font-bold">Critical / High Risk</span>
            </div>
          </div>
        </div>
      ) : loadingResults ? (
        /* LOADING STATE */
        <div className="bg-white rounded-xl border-2 border-[#B8D9F2] p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#1BA0E2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-[#0A365C]">Querying canonical database...</p>
          <p className="text-[11px] text-[#4A6572] mt-1 font-medium">Evaluating multi-dimensional filters across the central infrastructure portfolio</p>
        </div>
      ) : results.length === 0 ? (
        /* EMPTY STATE */
        <div className="bg-white rounded-xl border-2 border-[#B8D9F2] p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-[#0A365C]">No Projects Matched Selected Criteria</h2>
          <p className="text-xs text-[#4A6572] mt-1 max-w-md mx-auto font-medium">
            No projects in the canonical repository satisfied all your active filter conditions. 
            Try clearing some filters or selecting "All" on specific criteria.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-[#1BA0E2] hover:bg-[#0A365C] text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
          >
            Clear Filters & Reset
          </button>
        </div>
      ) : (
        /* RESULTS TABLE */
        <div className="bg-white rounded-xl border-2 border-[#B8D9F2] shadow-xs overflow-hidden">
          
          <div className="px-5 py-3.5 bg-[#F0F6FB] border-b-2 border-[#B8D9F2] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0A365C]">Matching Projects</span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#E1EFF9] text-[#0A365C] border border-[#B8D9F2]">
                {total.toLocaleString()} Records
              </span>
            </div>
            <div className="text-xs text-[#4A6572] font-medium">
              Click <span className="font-bold text-[#1BA0E2]">"Explore"</span> on any project row to view all 15 analytical dimensions
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs atlas-table">
              <thead className="bg-[#E1EFF9] text-[#0A365C] uppercase text-[10px] tracking-wider font-bold border-b border-[#B8D9F2]">
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
                    className="hover:bg-[#F0F6FB] transition-colors group cursor-pointer"
                    onClick={() => navigate(`/projects/${p.projectId}`)}
                  >
                    {/* 1. Project ID & Name */}
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[11px] font-bold text-[#0A365C] bg-[#E1EFF9] px-1.5 py-0.5 rounded border border-[#B8D9F2]">
                          {p.projectId}
                        </span>
                        {p.multiState && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            MULTI-STATE
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-[#0A365C] group-hover:text-[#1BA0E2] transition truncate" title={p.projectName}>
                        {p.projectName}
                      </div>
                    </td>

                    {/* 2. Sector & Ministry */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-[#0A365C]">{p.sectorName}</div>
                      <div className="text-[11px] text-[#4A6572] font-medium truncate max-w-[180px]" title={p.ministryName}>
                        {p.ministryName}
                      </div>
                    </td>

                    {/* 3. State */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-[#0A365C] font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#1BA0E2] shrink-0" />
                        <span>{p.stateName || 'Multi-State'}</span>
                      </div>
                    </td>

                    {/* 4. Cost Exposure */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="font-mono font-bold text-[#0A365C]">
                        ₹{(p.latestRevisedCostCr || p.originalCostCr).toLocaleString()} Cr
                      </div>
                      <div className="text-[11px] flex items-center justify-end gap-1 mt-0.5">
                        <span className="text-[#4A6572] font-medium">Orig: ₹{p.originalCostCr?.toLocaleString()} Cr</span>
                        {p.costEscalationPct > 0 ? (
                          <span className="text-[#B74436] font-semibold font-mono">
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
                      <div className="font-bold font-mono text-[#173F35]">
                        {p.physicalProgressPct}%
                      </div>
                      <div className="w-20 ml-auto bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${
                            p.physicalProgressPct >= 75 ? 'bg-[#267A69]' :
                            p.physicalProgressPct >= 40 ? 'bg-[#519E8F]' : 'bg-[#C89432]'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, p.physicalProgressPct))}%` }}
                        />
                      </div>
                    </td>

                    {/* 6. Schedule Delay */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {p.scheduleSlippageMonths > 0 ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          p.scheduleSlippageMonths >= 24 ? 'bg-red-100 text-[#B74436]' :
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
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-[#B74436]">
                          <AlertTriangle className="w-3 h-3" />
                          {p.activeWarningCount}
                        </span>
                      ) : (
                        <span className="text-[#8C9893] text-xs">—</span>
                      )}
                    </td>

                    {/* 9. Drill Down Action */}
                    <td className="px-4 py-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/projects/${p.projectId}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E8F0EC] hover:bg-[#173F35] text-[#173F35] hover:text-white rounded-lg font-semibold text-xs transition border border-[#BED6CB] hover:border-blue-600 shadow-sm"
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
