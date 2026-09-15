import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  MapPin, 
  ArrowLeft, 
  ExternalLink,
  ChevronRight,
  BarChart3
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
import type { 
  StateSummary, 
  ProjectSummary, 
  FilterMetadata, 
  AnalyticalFilterParams 
} from '../types';
import { RiskBadge } from '../components/common/Badges';
import { Pagination } from '../components/common/Pagination';
import { AnalyticalFilterPanel } from '../components/common/AnalyticalFilterPanel';
import type { QuickPreset } from '../components/common/AnalyticalFilterPanel';
import { FilterSelect } from '../components/common/FilterSelect';
import type { ActiveChip } from '../components/common/ActiveFilterChips';

const DEFAULT_FILTERS: AnalyticalFilterParams = {
  sector: 'ALL',
  ministry: 'ALL',
  riskBand: 'ALL',
  trajectory: 'ALL',
  costFilter: 'ALL',
  delayFilter: 'ALL',
  warningFilter: 'ALL',
  multiState: 'ALL',
  sortBy: 'cost'
};

export const StateAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Overview States State
  const [states, setStates] = useState<StateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter Metadata from backend
  const [meta, setMeta] = useState<FilterMetadata | null>(null);

  // Active chart visualization tab
  const [activeChartTab, setActiveChartTab] = useState<'CAPITAL' | 'COST_DELAY' | 'RISK' | 'PROGRESS'>('CAPITAL');

  // Filter State: Draft vs Applied
  const [draftFilters, setDraftFilters] = useState<AnalyticalFilterParams>(() => ({
    sector: searchParams.get('sector') || 'ALL',
    ministry: searchParams.get('ministry') || 'ALL',
    riskBand: searchParams.get('riskBand') || 'ALL',
    trajectory: searchParams.get('trajectory') || 'ALL',
    costFilter: searchParams.get('costFilter') || 'ALL',
    delayFilter: searchParams.get('delayFilter') || 'ALL',
    warningFilter: searchParams.get('warningFilter') || 'ALL',
    multiState: searchParams.get('multiState') || 'ALL',
    sortBy: searchParams.get('sortBy') || 'cost'
  }));

  const [appliedFilters, setAppliedFilters] = useState<AnalyticalFilterParams>(draftFilters);

  // Drill-down State
  const [selectedState, setSelectedState] = useState<string | null>(searchParams.get('stateDetail') || null);
  const [selectedSector, setSelectedSector] = useState<string | null>(searchParams.get('sectorDetail') || null);
  const [sectors, setSectors] = useState<Array<{ sector_name: string; project_count: number; total_revised_cost_cr: number; avg_progress_pct: number; high_risk_count: number }>>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [page, setPage] = useState(1);
  const [loadingDrilldown, setLoadingDrilldown] = useState(false);

  // Load canonical filter metadata on mount
  useEffect(() => {
    api.getFilterMetadata()
      .then(setMeta)
      .catch(err => console.error('Failed to load filter metadata:', err));
  }, []);

  // Fetch overview states
  const fetchStates = useCallback(async (filters: AnalyticalFilterParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getStates(filters);
      setStates(res || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load regional and state analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync applied state to URL
  const syncUrl = useCallback((filters: AnalyticalFilterParams, stDetail: string | null, secDetail: string | null) => {
    const sp = new URLSearchParams();
    if (filters.sector && filters.sector !== 'ALL') sp.set('sector', filters.sector);
    if (filters.ministry && filters.ministry !== 'ALL') sp.set('ministry', filters.ministry);
    if (filters.riskBand && filters.riskBand !== 'ALL') sp.set('riskBand', filters.riskBand);
    if (filters.trajectory && filters.trajectory !== 'ALL') sp.set('trajectory', filters.trajectory);
    if (filters.costFilter && filters.costFilter !== 'ALL') sp.set('costFilter', filters.costFilter);
    if (filters.delayFilter && filters.delayFilter !== 'ALL') sp.set('delayFilter', filters.delayFilter);
    if (filters.warningFilter && filters.warningFilter !== 'ALL') sp.set('warningFilter', filters.warningFilter);
    if (filters.multiState && filters.multiState !== 'ALL') sp.set('multiState', filters.multiState);
    if (filters.sortBy && filters.sortBy !== 'cost') sp.set('sortBy', filters.sortBy);
    if (stDetail) sp.set('stateDetail', stDetail);
    if (secDetail) sp.set('sectorDetail', secDetail);
    setSearchParams(sp, { replace: true });
  }, [setSearchParams]);

  // Initial load
  useEffect(() => {
    fetchStates(appliedFilters);
  }, []);

  // Apply Action
  const handleApply = () => {
    setAppliedFilters(draftFilters);
    syncUrl(draftFilters, selectedState, selectedSector);
    fetchStates(draftFilters);
  };

  // Reset Action
  const handleReset = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    syncUrl(DEFAULT_FILTERS, selectedState, selectedSector);
    fetchStates(DEFAULT_FILTERS);
  };

  // Quick Preset
  const handlePreset = (preset: Partial<AnalyticalFilterParams>) => {
    const updated: AnalyticalFilterParams = {
      ...DEFAULT_FILTERS,
      ...preset
    };
    setDraftFilters(updated);
    setAppliedFilters(updated);
    syncUrl(updated, selectedState, selectedSector);
    fetchStates(updated);
  };

  // Remove Chip
  const handleRemoveChip = (key: string) => {
    const updated = { ...appliedFilters, [key]: 'ALL' };
    setDraftFilters(updated);
    setAppliedFilters(updated);
    syncUrl(updated, selectedState, selectedSector);
    fetchStates(updated);
  };

  // Check unsaved changes
  const hasUnsavedChanges = JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters);

  // Convert applied filters to chips
  const activeChips: ActiveChip[] = [
    appliedFilters.sector && appliedFilters.sector !== 'ALL' ? { key: 'sector', label: 'Sector', value: appliedFilters.sector, onRemove: () => handleRemoveChip('sector') } : null,
    appliedFilters.ministry && appliedFilters.ministry !== 'ALL' ? { key: 'ministry', label: 'Ministry', value: appliedFilters.ministry, onRemove: () => handleRemoveChip('ministry') } : null,
    appliedFilters.riskBand && appliedFilters.riskBand !== 'ALL' ? { key: 'riskBand', label: 'Risk Band', value: appliedFilters.riskBand, onRemove: () => handleRemoveChip('riskBand') } : null,
    appliedFilters.costFilter && appliedFilters.costFilter !== 'ALL' ? { key: 'costFilter', label: 'Cost Profile', value: appliedFilters.costFilter.replace(/_/g, ' '), onRemove: () => handleRemoveChip('costFilter') } : null,
    appliedFilters.delayFilter && appliedFilters.delayFilter !== 'ALL' ? { key: 'delayFilter', label: 'Delay Profile', value: appliedFilters.delayFilter.replace(/_/g, ' '), onRemove: () => handleRemoveChip('delayFilter') } : null,
    appliedFilters.warningFilter && appliedFilters.warningFilter !== 'ALL' ? { key: 'warningFilter', label: 'Warnings', value: appliedFilters.warningFilter.replace(/_/g, ' '), onRemove: () => handleRemoveChip('warningFilter') } : null,
    appliedFilters.multiState && appliedFilters.multiState !== 'ALL' ? { key: 'multiState', label: 'Multi-State', value: appliedFilters.multiState, onRemove: () => handleRemoveChip('multiState') } : null,
  ].filter(Boolean) as ActiveChip[];

  // Quick Presets
  const presets: QuickPreset[] = [
    { id: 'all', label: 'All States (National)', onApply: handleReset },
    { id: 'crit', label: 'Critical Risk Only', onApply: () => handlePreset({ riskBand: 'CRITICAL' }) },
    { id: 'cost20', label: 'Cost Overrun ≥ 20%', onApply: () => handlePreset({ costFilter: 'HIGH_ESCALATION' }) },
    { id: 'delay12', label: 'Delayed ≥ 12 Mo', onApply: () => handlePreset({ delayFilter: 'SEVERE_DELAY' }) },
    { id: 'warn', label: 'Active Warnings', onApply: () => handlePreset({ warningFilter: 'ACTIVE_WARNINGS' }) },
  ];

  // Drilldown data loader
  const loadDrilldown = useCallback(async (stName: string, secName: string | null, currentPage: number) => {
    setLoadingDrilldown(true);
    try {
      const [secRes, projRes] = await Promise.all([
        api.getStateSectors(stName, appliedFilters),
        api.getStateProjects(stName, secName || undefined, currentPage, 20, appliedFilters)
      ]);
      setSectors(secRes || []);
      setProjects(projRes || []);
    } catch (e) {
      console.error('Failed to load state drilldown:', e);
    } finally {
      setLoadingDrilldown(false);
    }
  }, [appliedFilters]);

  // Handle Explore State from table or dropdown
  const handleSelectState = (stName: string) => {
    setSelectedState(stName);
    setSelectedSector(null);
    setPage(1);
    syncUrl(appliedFilters, stName, null);
    loadDrilldown(stName, null, 1);
  };

  // Handle Select Sector in drill-down
  const handleSelectSector = (secName: string | null) => {
    const cleanSec = secName && secName !== 'ALL' ? secName : null;
    setSelectedSector(cleanSec);
    setPage(1);
    if (selectedState) {
      syncUrl(appliedFilters, selectedState, cleanSec);
      loadDrilldown(selectedState, cleanSec, 1);
    }
  };

  // Detail Page Change
  const handleDrilldownPageChange = (newPage: number) => {
    setPage(newPage);
    if (selectedState) {
      loadDrilldown(selectedState, selectedSector, newPage);
    }
  };

  // Trigger drilldown if initial URL has stateDetail
  useEffect(() => {
    if (selectedState) {
      loadDrilldown(selectedState, selectedSector, page);
    }
  }, []);

  // Compute Aggregates from current cohort
  const kpi = useMemo(() => {
    const totalProjects = states.reduce((acc, s) => acc + s.projectCount, 0);
    const totalRevised = states.reduce((acc, s) => acc + (s.totalRevisedCostCr ?? s.totalInvestmentCr), 0);
    const totalOriginal = states.reduce((acc, s) => acc + (s.totalOriginalCostCr ?? (s.totalInvestmentCr / (1 + (s.weightedCostEscalationPct || 0)/100))), 0);
    const totalExp = states.reduce((acc, s) => acc + s.totalCumulativeExpenditureCr, 0);
    const totalHighCritical = states.reduce((acc, s) => acc + (s.highRiskCount + s.criticalRiskCount), 0);
    const totalWarnings = states.reduce((acc, s) => acc + s.activeWarningCount, 0);
    const weightedEscalation = totalOriginal > 0 ? ((totalRevised - totalOriginal) / totalOriginal) * 100 : 0;
    const avgDelay = states.length > 0
      ? states.reduce((acc, s) => acc + (s.avgScheduleDelayMonths || 0) * s.projectCount, 0) / (totalProjects || 1)
      : 0;

    return {
      totalProjects,
      statesCount: states.length,
      totalRevised,
      totalExp,
      weightedEscalation,
      totalHighCritical,
      totalWarnings,
      avgDelay
    };
  }, [states]);

  // Chart dataset
  const chartData = useMemo(() => {
    return states.map(s => ({
      name: s.stateName,
      shortName: s.stateName.length > 14 ? s.stateName.substring(0, 12) + '...' : s.stateName,
      projects: s.projectCount,
      revisedCost: Math.round(s.totalRevisedCostCr ?? s.totalInvestmentCr),
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
  }, [states]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & Analytical Orientation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs uppercase tracking-wider mb-1">
            {selectedState ? (
              <button
                onClick={() => { setSelectedState(null); setSelectedSector(null); syncUrl(appliedFilters, null, null); }}
                className="flex items-center gap-1 hover:underline text-slate-500 hover:text-emerald-600"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to State Overview
              </button>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>Regional & State Portfolio</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {selectedState ? `${selectedState} Regional Analytics` : 'State & Regional Infrastructure Analytics'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            {selectedState
              ? `Sectoral distribution, capital delivery, and project triage within ${selectedState}.`
              : 'Formulate an analytical cohort across states and Union Territories to compare regional capital allocation, delivery delays, and risk concentration.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>{states.length} States / UTs Active</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OVERVIEW MODE: FILTERS -> KPIS -> CHARTS -> COMPARISON TABLE             */}
      {/* ========================================================================= */}
      {!selectedState && (
        <div className="space-y-6">
          
          {/* Analytical Filter Panel */}
          <AnalyticalFilterPanel
            title="State Analytical Scope"
            subtitle="Configure regional cohort criteria. Visual charts and state rankings reflect applied filters."
            onApply={handleApply}
            onReset={handleReset}
            loading={loading}
            hasUnsavedChanges={hasUnsavedChanges}
            applyButtonLabel="Apply State Filters"
            presets={presets}
            activeChips={activeChips}
            onClearAllChips={handleReset}
            totalMatching={kpi.totalProjects}
            entityLabel="projects"
          >
            {/* Sector */}
            <FilterSelect
              label="Infrastructure Sector"
              value={draftFilters.sector || 'ALL'}
              onChange={(v) => setDraftFilters(prev => ({ ...prev, sector: v }))}
              options={meta?.sectors || []}
            />

            {/* Ministry */}
            <FilterSelect
              label="Administrative Ministry"
              value={draftFilters.ministry || 'ALL'}
              onChange={(v) => setDraftFilters(prev => ({ ...prev, ministry: v }))}
              options={meta?.ministries || []}
            />

            {/* Risk Band */}
            <FilterSelect
              label="Project Risk Band"
              value={draftFilters.riskBand || 'ALL'}
              onChange={(v) => setDraftFilters(prev => ({ ...prev, riskBand: v }))}
              options={[
                { value: 'ALL', label: 'All Risk Bands' },
                { value: 'CRITICAL', label: 'Critical Risk' },
                { value: 'HIGH', label: 'High Risk' },
                { value: 'MODERATE', label: 'Moderate Risk' },
                { value: 'LOW', label: 'Low Risk' },
              ]}
            />

            {/* Cost Escalation */}
            <FilterSelect
              label="Cost Escalation Profile"
              value={draftFilters.costFilter || 'ALL'}
              onChange={(v) => setDraftFilters(prev => ({ ...prev, costFilter: v }))}
              options={[
                { value: 'ALL', label: 'All Budget Profiles' },
                { value: 'ESCALATED', label: 'Any Cost Overrun (> 0%)' },
                { value: 'HIGH_ESCALATION', label: 'High Escalation (≥ 20%)' },
                { value: 'SEVERE_ESCALATION', label: 'Severe Escalation (≥ 50%)' },
                { value: 'WITHIN_BUDGET', label: 'Within Sanction (≤ 0%)' },
              ]}
            />

            {/* Schedule Delay */}
            <FilterSelect
              label="Schedule Slippage Profile"
              value={draftFilters.delayFilter || 'ALL'}
              onChange={(v) => setDraftFilters(prev => ({ ...prev, delayFilter: v }))}
              options={[
                { value: 'ALL', label: 'All Schedule Profiles' },
                { value: 'DELAYED', label: 'Any Slippage (> 0 Mo)' },
                { value: 'MODERATE_DELAY', label: 'Moderate Delay (1 - 11 Mo)' },
                { value: 'SEVERE_DELAY', label: 'Severe Delay (≥ 12 Mo)' },
                { value: 'CRITICAL_DELAY', label: 'Critical Delay (≥ 24 Mo)' },
                { value: 'ON_TIME', label: 'On Schedule or Ahead' },
              ]}
            />

            {/* Warnings */}
            <FilterSelect
              label="Warning Signal Status"
              value={draftFilters.warningFilter || 'ALL'}
              onChange={(v) => setDraftFilters(prev => ({ ...prev, warningFilter: v }))}
              options={[
                { value: 'ALL', label: 'All Alert Levels' },
                { value: 'HAS_WARNINGS', label: 'Has Active Warnings' },
                { value: 'MULTI_WARNING', label: 'Multiple Warnings (≥ 2)' },
                { value: 'NO_WARNINGS', label: 'Clean (No Warnings)' },
              ]}
            />

            {/* Multi-State Footprint */}
            <FilterSelect
              label="Corridor Footprint"
              value={draftFilters.multiState || 'ALL'}
              onChange={(v) => setDraftFilters(prev => ({ ...prev, multiState: v }))}
              options={[
                { value: 'ALL', label: 'All Corridor Footprints' },
                { value: 'YES', label: 'Multi-State Corridors Only' },
                { value: 'NO', label: 'Single State Projects Only' },
              ]}
            />

            {/* Sort Metric */}
            <FilterSelect
              label="Rank States By"
              value={draftFilters.sortBy || 'cost'}
              onChange={(v) => setDraftFilters(prev => ({ ...prev, sortBy: v }))}
              options={[
                { value: 'cost', label: 'Revised Outlay (Highest)' },
                { value: 'projects', label: 'Project Count (Highest)' },
                { value: 'escalation', label: 'Cost Escalation % (Highest)' },
                { value: 'delay', label: 'Average Delay (Longest)' },
                { value: 'risk', label: 'High/Critical Risk (Highest)' },
                { value: 'name', label: 'State Name (A-Z)' },
              ]}
            />
          </AnalyticalFilterPanel>

          {/* Filtered KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-slate-500">Matching Projects</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{kpi.totalProjects.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{kpi.statesCount} States/UTs</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-slate-500">Revised Outlay</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">₹{Math.round(kpi.totalRevised).toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Cr Capital Exposure</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-slate-500">Cumulative Spend</p>
              <p className="text-lg font-bold text-emerald-600 mt-0.5">₹{Math.round(kpi.totalExp).toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Cr Expenditure</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-slate-500">Weighted Escalation</p>
              <p className={`text-lg font-bold mt-0.5 ${kpi.weightedEscalation > 15 ? 'text-amber-600' : 'text-slate-900'}`}>
                +{kpi.weightedEscalation.toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Cost Growth vs Sanction</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-slate-500">Average Delay</p>
              <p className={`text-lg font-bold mt-0.5 ${kpi.avgDelay > 12 ? 'text-orange-600' : 'text-slate-900'}`}>
                {kpi.avgDelay.toFixed(1)} Mo
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Weighted Slippage</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-slate-500">High / Critical Risk</p>
              <p className="text-lg font-bold text-rose-600 mt-0.5">{kpi.totalHighCritical.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Flagged Projects</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-slate-500">Active Warnings</p>
              <p className="text-lg font-bold text-amber-500 mt-0.5">{kpi.totalWarnings.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Rule Anomaly Signals</p>
            </div>
          </div>

          {/* Context statement */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Comparing <strong className="text-slate-800">{states.length} states/UTs</strong> across <strong className="text-slate-800">{kpi.totalProjects.toLocaleString()} projects</strong> matching applied analytical scope.
            </span>
            <span className="text-[11px] text-slate-400">
              Click any state row or bar to inspect active sectors & project cohort
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-700 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => fetchStates(appliedFilters)} className="underline hover:text-rose-900 font-semibold">
                Retry
              </button>
            </div>
          )}

          {/* Graphical Pictorial Comparison Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Regional Comparative Visual Analytics
                </span>
              </div>

              {/* Chart Tabs */}
              <div className="flex bg-slate-200/70 p-0.5 rounded-lg text-xs self-start sm:self-auto">
                <button
                  onClick={() => setActiveChartTab('CAPITAL')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeChartTab === 'CAPITAL' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Capital & Delivery
                </button>
                <button
                  onClick={() => setActiveChartTab('COST_DELAY')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeChartTab === 'COST_DELAY' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cost vs Schedule Delay
                </button>
                <button
                  onClick={() => setActiveChartTab('RISK')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeChartTab === 'RISK' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Risk Concentration & Alerts
                </button>
                <button
                  onClick={() => setActiveChartTab('PROGRESS')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeChartTab === 'PROGRESS' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Execution Progress
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 h-[380px]">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Recomputing visual comparison across regional states...
                </div>
              ) : states.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No states match the selected criteria.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {activeChartTab === 'CAPITAL' ? (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="shortName" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k Cr`} />
                      <Tooltip 
                        formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString()} Cr`, name === 'revisedCost' ? 'Revised Outlay' : 'Cumulative Spend']}
                        labelFormatter={(label) => `State: ${chartData.find(d => d.shortName === label)?.name || label}`}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="revisedCost" name="Revised Outlay (₹ Cr)" fill="#059669" radius={[4, 4, 0, 0]} onClick={(d: any) => { if (d?.name) handleSelectState(d.name); }} className="cursor-pointer" />
                      <Bar dataKey="expenditure" name="Cumulative Spend (₹ Cr)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : activeChartTab === 'COST_DELAY' ? (
                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="shortName" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `+${v}%`} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v} Mo`} />
                      <Tooltip 
                        formatter={(val: any, name: any) => [name === 'costEscalationPct' ? `+${val}%` : `${val} Months`, name === 'costEscalationPct' ? 'Weighted Cost Escalation' : 'Average Schedule Delay']}
                        labelFormatter={(label) => `State: ${chartData.find(d => d.shortName === label)?.name || label}`}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar yAxisId="left" dataKey="costEscalationPct" name="Weighted Cost Escalation (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} onClick={(d: any) => { if (d?.name) handleSelectState(d.name); }} className="cursor-pointer" />
                      <Line yAxisId="right" type="monotone" dataKey="scheduleDelayMonths" name="Average Delay (Months)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                    </ComposedChart>
                  ) : activeChartTab === 'RISK' ? (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="shortName" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip 
                        formatter={(val: any, name: any) => [`${val} projects`, name === 'criticalRiskCount' ? 'Critical Risk' : name === 'highRiskCount' ? 'High Risk' : 'Moderate / Low Risk']}
                        labelFormatter={(label) => `State: ${chartData.find(d => d.shortName === label)?.name || label}`}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="criticalRiskCount" name="Critical Risk" stackId="a" fill="#e11d48" onClick={(d: any) => { if (d?.name) handleSelectState(d.name); }} className="cursor-pointer" />
                      <Bar dataKey="highRiskCount" name="High Risk" stackId="a" fill="#ea580c" />
                      <Bar dataKey="moderateLowRiskCount" name="Moderate / Low Risk" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="shortName" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                      <Tooltip 
                        formatter={(val: any, name: any) => [`${val}%`, name === 'physicalProgressPct' ? 'Average Physical Progress' : 'Weighted Expenditure Burn']}
                        labelFormatter={(label) => `State: ${chartData.find(d => d.shortName === label)?.name || label}`}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="physicalProgressPct" name="Average Physical Progress (%)" fill="#10b981" radius={[4, 4, 0, 0]} onClick={(d: any) => { if (d?.name) handleSelectState(d.name); }} className="cursor-pointer" />
                      <Line type="monotone" dataKey="expenditurePct" name="Expenditure / Revised Outlay (%)" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Numerical State Comparison Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed State & UT Portfolio Comparison ({states.length})
              </span>
              <span className="text-xs text-slate-500">
                Ordered by {appliedFilters.sortBy === 'cost' ? 'Revised Outlay' : appliedFilters.sortBy}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/70 border-b border-slate-200 uppercase text-[11px] font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">State / UT</th>
                    <th className="px-4 py-3 text-right">Projects</th>
                    <th className="px-4 py-3 text-right">Revised Outlay (₹ Cr)</th>
                    <th className="px-4 py-3 text-right">Escalation (%)</th>
                    <th className="px-4 py-3 text-right">Expenditure (₹ Cr)</th>
                    <th className="px-4 py-3 text-right">Avg Progress</th>
                    <th className="px-4 py-3 text-right">Avg Delay</th>
                    <th className="px-4 py-3 text-right">High / Critical</th>
                    <th className="px-4 py-3 text-right">Warnings</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-slate-400">
                        Querying regional state cohort...
                      </td>
                    </tr>
                  ) : states.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 space-y-2">
                        <p className="text-sm font-medium text-slate-600">No states contain projects matching the selected scope.</p>
                        <p className="text-xs text-slate-400">Broaden your filters or reset to national comparison.</p>
                        <button
                          onClick={handleReset}
                          className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                        >
                          Reset Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    states.map((st) => (
                      <tr key={st.stateName} className="hover:bg-emerald-50/40 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900 max-w-sm truncate" title={st.stateName}>
                          {st.stateName}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700">{st.projectCount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                          ₹{Math.round(st.totalRevisedCostCr ?? st.totalInvestmentCr).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className={st.weightedCostEscalationPct > 15 ? 'text-amber-600 font-semibold' : 'text-slate-600'}>
                            +{st.weightedCostEscalationPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-600 font-medium">₹{Math.round(st.totalCumulativeExpenditureCr).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono font-medium text-slate-700">{st.avgPhysicalProgressPct.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className={st.avgScheduleDelayMonths > 12 ? 'text-orange-600 font-semibold' : 'text-slate-600'}>
                            {(st.avgScheduleDelayMonths || 0).toFixed(1)} Mo
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={st.highRiskCount + st.criticalRiskCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                            {st.highRiskCount + st.criticalRiskCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-amber-600 font-medium">{st.activeWarningCount}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleSelectState(st.stateName)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition flex items-center gap-1 mx-auto shadow-2xs"
                          >
                            Explore <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* DRILL-DOWN MODE: DROPDOWN SELECTORS -> CONTEXT SUMMARY -> PROJECTS TABLE  */}
      {/* ========================================================================= */}
      {selectedState && (
        <div className="space-y-6">
          
          {/* Top Drill-Down Selectors Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Detailed State & Sector Drill-Down
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scope inherited from overview: {activeChips.length > 0 ? activeChips.map(c => `${c.label}: ${c.value}`).join(' · ') : 'National Aggregate (All criteria)'}
                </p>
              </div>

              <button
                onClick={() => { setSelectedState(null); setSelectedSector(null); syncUrl(appliedFilters, null, null); }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
              </button>
            </div>

            {/* Conventional Compact Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* State Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Selected State / UT
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => handleSelectState(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                >
                  {(meta?.states && meta.states.length > 0
                    ? meta.states
                    : states.map(s => s.stateName)
                  ).map(stName => {
                    const stObj = states.find(s => s.stateName === stName);
                    return (
                      <option key={stName} value={stName}>
                        {stName} {stObj ? `(${stObj.projectCount} projects)` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Sector Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Infrastructure Sector
                </label>
                <select
                  value={selectedSector || 'ALL'}
                  onChange={(e) => handleSelectSector(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                >
                  <option value="ALL">All Sectors ({sectors.reduce((acc, s) => acc + s.project_count, 0)})</option>
                  {sectors.map(sec => (
                    <option key={sec.sector_name} value={sec.sector_name}>
                      {sec.sector_name} ({sec.project_count} projects{sec.high_risk_count > 0 ? ` · ${sec.high_risk_count} high-risk` : ''})
                    </option>
                  ))}
                </select>
              </div>

              {/* Scoped Entity Summary Pill */}
              <div className="flex flex-col justify-end">
                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 flex items-center justify-between">
                  <span className="font-semibold">Matching Regional Projects:</span>
                  <span className="font-mono font-bold text-sm text-emerald-700">
                    {selectedSector 
                      ? sectors.find(s => s.sector_name === selectedSector)?.project_count || projects.length
                      : sectors.reduce((acc, s) => acc + s.project_count, 0) || projects.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Cohort Table inheriting overview filters */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Project Cohort: {selectedState} {selectedSector ? `→ ${selectedSector}` : ''}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Displaying projects satisfying inherited overview filters
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {projects.length} displayed on page {page}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/70 border-b border-slate-200 uppercase text-[11px] font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Project ID</th>
                    <th className="px-4 py-2.5">Project Name</th>
                    <th className="px-4 py-2.5">Agency</th>
                    <th className="px-4 py-2.5">Sector</th>
                    <th className="px-4 py-2.5 text-right">Revised Cost</th>
                    <th className="px-4 py-2.5 text-right">Progress</th>
                    <th className="px-4 py-2.5 text-right">Delay (Mos)</th>
                    <th className="px-4 py-2.5 text-center">Risk</th>
                    <th className="px-4 py-2.5 text-center">Intelligence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingDrilldown ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400">
                        Loading state project cohort...
                      </td>
                    </tr>
                  ) : projects.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400">
                        No projects found under this state/sector matching the applied filters.
                      </td>
                    </tr>
                  ) : (
                    projects.map((p) => (
                      <tr key={p.projectId} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-2.5 font-mono text-slate-500">{p.projectId}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-900 max-w-xs truncate" title={p.projectName}>
                          {p.projectName}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 truncate max-w-[150px]">{p.agencyName}</td>
                        <td className="px-4 py-2.5 text-slate-600">{p.sectorName}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">
                          ₹{p.latestRevisedCostCr.toLocaleString()} Cr
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-700">{p.physicalProgressPct}%</td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          <span className={p.scheduleSlippageMonths > 0 ? 'text-amber-600 font-semibold' : 'text-slate-500'}>
                            {p.scheduleSlippageMonths}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <RiskBadge band={p.riskBand} score={p.overallRiskScore} />
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => navigate(`/projects/${p.projectId}`)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-xs font-semibold border border-emerald-200 transition inline-flex items-center gap-1"
                          >
                            Details <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {projects.length > 0 && (
              <Pagination
                page={page}
                totalPages={Math.ceil(projects.length / 20) || 1}
                total={projects.length}
                size={20}
                onPageChange={handleDrilldownPageChange}
              />
            )}
          </div>

        </div>
      )}

    </div>
  );
};
