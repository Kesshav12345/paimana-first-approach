import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Building2, 
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
  MinistrySummary, 
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
  state: 'ALL',
  sector: 'ALL',
  riskBand: 'ALL',
  trajectory: 'ALL',
  costFilter: 'ALL',
  delayFilter: 'ALL',
  warningFilter: 'ALL',
  multiState: 'ALL',
  sortBy: 'cost'
};

export const MinistryAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Overview Ministries State
  const [ministries, setMinistries] = useState<MinistrySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter Metadata from backend
  const [meta, setMeta] = useState<FilterMetadata | null>(null);

  // Active chart visualization tab
  const [activeChartTab, setActiveChartTab] = useState<'CAPITAL' | 'COST_DELAY' | 'RISK' | 'PROGRESS'>('CAPITAL');

  // Filter State: Draft vs Applied
  const [draftFilters, setDraftFilters] = useState<AnalyticalFilterParams>(() => ({
    state: searchParams.get('state') || 'ALL',
    sector: searchParams.get('sector') || 'ALL',
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
  const [selectedMinistry, setSelectedMinistry] = useState<string | null>(searchParams.get('ministryDetail') || null);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(searchParams.get('agencyDetail') || null);
  const [agencies, setAgencies] = useState<Array<{ agency_name: string; project_count: number; total_revised_cost_cr: number; avg_progress_pct: number; high_risk_count: number }>>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [page, setPage] = useState(1);
  const [loadingDrilldown, setLoadingDrilldown] = useState(false);

  // Load canonical filter metadata on mount
  useEffect(() => {
    api.getFilterMetadata()
      .then(setMeta)
      .catch(err => console.error('Failed to load filter metadata:', err));
  }, []);

  // Fetch overview ministries
  const fetchMinistries = useCallback(async (filters: AnalyticalFilterParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMinistries(filters);
      setMinistries(res || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load central ministry analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync applied state to URL
  const syncUrl = useCallback((filters: AnalyticalFilterParams, minDetail: string | null, agDetail: string | null) => {
    const sp = new URLSearchParams();
    if (filters.state && filters.state !== 'ALL') sp.set('state', filters.state);
    if (filters.sector && filters.sector !== 'ALL') sp.set('sector', filters.sector);
    if (filters.riskBand && filters.riskBand !== 'ALL') sp.set('riskBand', filters.riskBand);
    if (filters.trajectory && filters.trajectory !== 'ALL') sp.set('trajectory', filters.trajectory);
    if (filters.costFilter && filters.costFilter !== 'ALL') sp.set('costFilter', filters.costFilter);
    if (filters.delayFilter && filters.delayFilter !== 'ALL') sp.set('delayFilter', filters.delayFilter);
    if (filters.warningFilter && filters.warningFilter !== 'ALL') sp.set('warningFilter', filters.warningFilter);
    if (filters.multiState && filters.multiState !== 'ALL') sp.set('multiState', filters.multiState);
    if (filters.sortBy && filters.sortBy !== 'cost') sp.set('sortBy', filters.sortBy);
    if (minDetail) sp.set('ministryDetail', minDetail);
    if (agDetail) sp.set('agencyDetail', agDetail);
    setSearchParams(sp, { replace: true });
  }, [setSearchParams]);

  // Initial load
  useEffect(() => {
    fetchMinistries(appliedFilters);
  }, []);

  // Apply Action
  const handleApply = () => {
    setAppliedFilters(draftFilters);
    syncUrl(draftFilters, selectedMinistry, selectedAgency);
    fetchMinistries(draftFilters);
  };

  // Reset Action
  const handleReset = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    syncUrl(DEFAULT_FILTERS, selectedMinistry, selectedAgency);
    fetchMinistries(DEFAULT_FILTERS);
  };

  // Quick Preset
  const handlePreset = (preset: Partial<AnalyticalFilterParams>) => {
    const updated: AnalyticalFilterParams = {
      ...DEFAULT_FILTERS,
      ...preset
    };
    setDraftFilters(updated);
    setAppliedFilters(updated);
    syncUrl(updated, selectedMinistry, selectedAgency);
    fetchMinistries(updated);
  };

  // Remove Chip
  const handleRemoveChip = (key: string) => {
    const updated = { ...appliedFilters, [key]: 'ALL' };
    setDraftFilters(updated);
    setAppliedFilters(updated);
    syncUrl(updated, selectedMinistry, selectedAgency);
    fetchMinistries(updated);
  };

  // Check unsaved changes
  const hasUnsavedChanges = JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters);

  // Convert applied filters to chips
  const activeChips: ActiveChip[] = [
    appliedFilters.sector && appliedFilters.sector !== 'ALL' ? { key: 'sector', label: 'Sector', value: appliedFilters.sector, onRemove: () => handleRemoveChip('sector') } : null,
    appliedFilters.state && appliedFilters.state !== 'ALL' ? { key: 'state', label: 'State', value: appliedFilters.state, onRemove: () => handleRemoveChip('state') } : null,
    appliedFilters.riskBand && appliedFilters.riskBand !== 'ALL' ? { key: 'riskBand', label: 'Risk Band', value: appliedFilters.riskBand, onRemove: () => handleRemoveChip('riskBand') } : null,
    appliedFilters.costFilter && appliedFilters.costFilter !== 'ALL' ? { key: 'costFilter', label: 'Cost Profile', value: appliedFilters.costFilter.replace(/_/g, ' '), onRemove: () => handleRemoveChip('costFilter') } : null,
    appliedFilters.delayFilter && appliedFilters.delayFilter !== 'ALL' ? { key: 'delayFilter', label: 'Delay Profile', value: appliedFilters.delayFilter.replace(/_/g, ' '), onRemove: () => handleRemoveChip('delayFilter') } : null,
    appliedFilters.warningFilter && appliedFilters.warningFilter !== 'ALL' ? { key: 'warningFilter', label: 'Warnings', value: appliedFilters.warningFilter.replace(/_/g, ' '), onRemove: () => handleRemoveChip('warningFilter') } : null,
    appliedFilters.multiState && appliedFilters.multiState !== 'ALL' ? { key: 'multiState', label: 'Multi-State', value: appliedFilters.multiState, onRemove: () => handleRemoveChip('multiState') } : null,
  ].filter(Boolean) as ActiveChip[];

  // Quick Presets
  const presets: QuickPreset[] = [
    { id: 'all', label: 'All Ministries (National)', onApply: handleReset },
    { id: 'crit', label: 'Critical Risk Only', onApply: () => handlePreset({ riskBand: 'CRITICAL' }) },
    { id: 'cost20', label: 'Cost Overrun ≥ 20%', onApply: () => handlePreset({ costFilter: 'HIGH_ESCALATION' }) },
    { id: 'delay12', label: 'Delayed ≥ 12 Mo', onApply: () => handlePreset({ delayFilter: 'SEVERE_DELAY' }) },
    { id: 'warn', label: 'Active Warnings', onApply: () => handlePreset({ warningFilter: 'ACTIVE_WARNINGS' }) },
  ];

  // Drilldown data loader
  const loadDrilldown = useCallback(async (minName: string, agName: string | null, currentPage: number) => {
    setLoadingDrilldown(true);
    try {
      const [agRes, projRes] = await Promise.all([
        api.getMinistryAgencies(minName, appliedFilters),
        api.getMinistryProjects(minName, agName || undefined, currentPage, 20, appliedFilters)
      ]);
      setAgencies(agRes || []);
      setProjects(projRes || []);
    } catch (e) {
      console.error('Failed to load ministry drilldown:', e);
    } finally {
      setLoadingDrilldown(false);
    }
  }, [appliedFilters]);

  // Handle Explore Ministry from table or dropdown
  const handleSelectMinistry = (minName: string) => {
    setSelectedMinistry(minName);
    setSelectedAgency(null);
    setPage(1);
    syncUrl(appliedFilters, minName, null);
    loadDrilldown(minName, null, 1);
  };

  // Handle Select Implementing Agency
  const handleSelectAgency = (agName: string | null) => {
    const cleanAg = agName && agName !== 'ALL' ? agName : null;
    setSelectedAgency(cleanAg);
    setPage(1);
    if (selectedMinistry) {
      syncUrl(appliedFilters, selectedMinistry, cleanAg);
      loadDrilldown(selectedMinistry, cleanAg, 1);
    }
  };

  // Detail Page Change
  const handleDrilldownPageChange = (newPage: number) => {
    setPage(newPage);
    if (selectedMinistry) {
      loadDrilldown(selectedMinistry, selectedAgency, newPage);
    }
  };

  // Trigger drilldown if initial URL has ministryDetail
  useEffect(() => {
    if (selectedMinistry) {
      loadDrilldown(selectedMinistry, selectedAgency, page);
    }
  }, []);

  // Compute Aggregates from current cohort
  const kpi = useMemo(() => {
    const totalProjects = ministries.reduce((acc, m) => acc + m.projectCount, 0);
    const totalOriginal = ministries.reduce((acc, m) => acc + m.totalOriginalCostCr, 0);
    const totalRevised = ministries.reduce((acc, m) => acc + m.totalRevisedCostCr, 0);
    const totalExp = ministries.reduce((acc, m) => acc + m.totalCumulativeExpenditureCr, 0);
    const totalHighCritical = ministries.reduce((acc, m) => acc + (m.highRiskCount + m.criticalRiskCount), 0);
    const totalWarnings = ministries.reduce((acc, m) => acc + m.activeWarningCount, 0);
    const weightedEscalation = totalOriginal > 0 ? ((totalRevised - totalOriginal) / totalOriginal) * 100 : 0;
    const avgDelay = ministries.length > 0 
      ? ministries.reduce((acc, m) => acc + (m.avgScheduleDelayMonths || 0) * m.projectCount, 0) / (totalProjects || 1)
      : 0;

    return {
      totalProjects,
      ministriesCount: ministries.length,
      totalRevised,
      totalExp,
      weightedEscalation,
      totalHighCritical,
      totalWarnings,
      avgDelay
    };
  }, [ministries]);

  // Chart dataset
  const chartData = useMemo(() => {
    return ministries.map(m => ({
      name: m.ministryName,
      shortName: m.ministryName.length > 18 ? m.ministryName.substring(0, 16) + '...' : m.ministryName,
      projects: m.projectCount,
      originalCost: Math.round(m.totalOriginalCostCr),
      revisedCost: Math.round(m.totalRevisedCostCr),
      expenditure: Math.round(m.totalCumulativeExpenditureCr),
      costEscalationPct: Number(m.weightedCostEscalationPct.toFixed(1)),
      expenditurePct: Number(m.weightedExpenditurePct.toFixed(1)),
      physicalProgressPct: Number(m.avgPhysicalProgressPct.toFixed(1)),
      scheduleDelayMonths: Number((m.avgScheduleDelayMonths || 0).toFixed(1)),
      criticalRiskCount: m.criticalRiskCount,
      highRiskCount: m.highRiskCount,
      moderateLowRiskCount: Math.max(0, m.projectCount - (m.highRiskCount + m.criticalRiskCount)),
      warningCount: m.activeWarningCount,
    }));
  }, [ministries]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & Analytical Orientation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            {selectedMinistry ? (
              <button
                onClick={() => { setSelectedMinistry(null); setSelectedAgency(null); syncUrl(appliedFilters, null, null); }}
                className="flex items-center gap-1 hover:underline text-slate-500 hover:text-indigo-600"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Ministry Overview
              </button>
            ) : (
              <>
                <Building2 className="w-4 h-4" />
                <span>Central Line Ministries Portfolio</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {selectedMinistry ? `${selectedMinistry} Detailed Analytics` : 'Central Ministry Infrastructure Analytics'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            {selectedMinistry
              ? `Implementing agency breakdown, capital execution, and project triage under ${selectedMinistry}.`
              : 'Formulate an analytical cohort across line ministries to compare capital outlay, cost escalation, delivery delays, and warning concentration.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>{ministries.length} Ministries Represented</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OVERVIEW MODE: FILTERS -> KPIS -> CHARTS -> COMPARISON TABLE             */}
      {/* ========================================================================= */}
      {!selectedMinistry && (
        <div className="space-y-6">
          
          {/* Analytical Filter Panel */}
          <AnalyticalFilterPanel
            title="Ministry Analytical Scope"
            subtitle="Configure cohort criteria. Results, comparison charts, and numerical rankings reflect applied filters."
            onApply={handleApply}
            onReset={handleReset}
            loading={loading}
            hasUnsavedChanges={hasUnsavedChanges}
            applyButtonLabel="Apply Ministry Filters"
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

            {/* State */}
            <FilterSelect
              label="State / Union Territory"
              value={draftFilters.state || 'ALL'}
              onChange={(v) => setDraftFilters(prev => ({ ...prev, state: v }))}
              options={meta?.states || []}
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
              label="Rank Ministries By"
              value={draftFilters.sortBy || 'cost'}
              onChange={(v) => setDraftFilters(prev => ({ ...prev, sortBy: v }))}
              options={[
                { value: 'cost', label: 'Revised Outlay (Highest)' },
                { value: 'projects', label: 'Project Count (Highest)' },
                { value: 'escalation', label: 'Cost Escalation % (Highest)' },
                { value: 'delay', label: 'Average Delay (Longest)' },
                { value: 'risk', label: 'High/Critical Risk (Highest)' },
                { value: 'name', label: 'Ministry Name (A-Z)' },
              ]}
            />
          </AnalyticalFilterPanel>

          {/* Filtered KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-slate-500">Matching Projects</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{kpi.totalProjects.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{kpi.ministriesCount} Ministries</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-slate-500">Revised Outlay</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">₹{Math.round(kpi.totalRevised).toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Cr Capital Exposure</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-slate-500">Expenditure</p>
              <p className="text-lg font-bold text-blue-600 mt-0.5">₹{Math.round(kpi.totalExp).toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Cr Cumulative Burn</p>
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
              Comparing <strong className="text-slate-800">{ministries.length} ministries</strong> across <strong className="text-slate-800">{kpi.totalProjects.toLocaleString()} projects</strong> matching applied analytical scope.
            </span>
            <span className="text-[11px] text-slate-400">
              Click any ministry row or bar to inspect implementing agencies & project cohort
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-700 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => fetchMinistries(appliedFilters)} className="underline hover:text-rose-900 font-semibold">
                Retry
              </button>
            </div>
          )}

          {/* Graphical Pictorial Comparison Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Visual Comparative Analytics
                </span>
              </div>

              {/* Chart Tabs */}
              <div className="flex bg-slate-200/70 p-0.5 rounded-lg text-xs self-start sm:self-auto">
                <button
                  onClick={() => setActiveChartTab('CAPITAL')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeChartTab === 'CAPITAL' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Capital & Delivery
                </button>
                <button
                  onClick={() => setActiveChartTab('COST_DELAY')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeChartTab === 'COST_DELAY' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cost vs Schedule Delay
                </button>
                <button
                  onClick={() => setActiveChartTab('RISK')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeChartTab === 'RISK' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Risk Concentration & Alerts
                </button>
                <button
                  onClick={() => setActiveChartTab('PROGRESS')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeChartTab === 'PROGRESS' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Execution Progress
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 h-[380px]">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Recomputing visual comparison across ministries...
                </div>
              ) : ministries.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No ministries match the selected criteria.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {activeChartTab === 'CAPITAL' ? (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="shortName" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k Cr`} />
                      <Tooltip 
                        formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString()} Cr`, name === 'revisedCost' ? 'Revised Outlay' : name === 'originalCost' ? 'Original Cost' : 'Cumulative Expenditure']}
                        labelFormatter={(label) => `Ministry: ${chartData.find(d => d.shortName === label)?.name || label}`}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="originalCost" name="Original Cost" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="revisedCost" name="Revised Outlay" fill="#4f46e5" radius={[4, 4, 0, 0]} onClick={(d: any) => { if (d?.name) handleSelectMinistry(d.name); }} className="cursor-pointer" />
                      <Bar dataKey="expenditure" name="Cumulative Expenditure" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : activeChartTab === 'COST_DELAY' ? (
                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="shortName" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `+${v}%`} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v} Mo`} />
                      <Tooltip 
                        formatter={(val: any, name: any) => [name === 'costEscalationPct' ? `+${val}%` : `${val} Months`, name === 'costEscalationPct' ? 'Weighted Cost Escalation' : 'Average Schedule Delay']}
                        labelFormatter={(label) => `Ministry: ${chartData.find(d => d.shortName === label)?.name || label}`}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar yAxisId="left" dataKey="costEscalationPct" name="Weighted Cost Escalation (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} onClick={(d: any) => { if (d?.name) handleSelectMinistry(d.name); }} className="cursor-pointer" />
                      <Line yAxisId="right" type="monotone" dataKey="scheduleDelayMonths" name="Average Delay (Months)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                    </ComposedChart>
                  ) : activeChartTab === 'RISK' ? (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="shortName" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip 
                        formatter={(val: any, name: any) => [`${val} projects`, name === 'criticalRiskCount' ? 'Critical Risk' : name === 'highRiskCount' ? 'High Risk' : 'Moderate / Low Risk']}
                        labelFormatter={(label) => `Ministry: ${chartData.find(d => d.shortName === label)?.name || label}`}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="criticalRiskCount" name="Critical Risk" stackId="a" fill="#e11d48" onClick={(d: any) => { if (d?.name) handleSelectMinistry(d.name); }} className="cursor-pointer" />
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
                        labelFormatter={(label) => `Ministry: ${chartData.find(d => d.shortName === label)?.name || label}`}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="physicalProgressPct" name="Average Physical Progress (%)" fill="#10b981" radius={[4, 4, 0, 0]} onClick={(d: any) => { if (d?.name) handleSelectMinistry(d.name); }} className="cursor-pointer" />
                      <Line type="monotone" dataKey="expenditurePct" name="Expenditure / Revised Outlay (%)" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Numerical Ministry Comparison Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Ministry Portfolio Comparison ({ministries.length})
              </span>
              <span className="text-xs text-slate-500">
                Ordered by {appliedFilters.sortBy === 'cost' ? 'Revised Outlay' : appliedFilters.sortBy}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/70 border-b border-slate-200 uppercase text-[11px] font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Ministry Name</th>
                    <th className="px-4 py-3 text-right">Projects</th>
                    <th className="px-4 py-3 text-right">Approved (₹ Cr)</th>
                    <th className="px-4 py-3 text-right">Revised (₹ Cr)</th>
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
                      <td colSpan={11} className="text-center py-12 text-slate-400">
                        Querying ministry portfolio cohort...
                      </td>
                    </tr>
                  ) : ministries.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-12 space-y-2">
                        <p className="text-sm font-medium text-slate-600">No ministries contain projects matching the selected scope.</p>
                        <p className="text-xs text-slate-400">Broaden your filters or reset to national comparison.</p>
                        <button
                          onClick={handleReset}
                          className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold"
                        >
                          Reset Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    ministries.map((m) => (
                      <tr key={m.ministryName} className="hover:bg-indigo-50/40 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900 max-w-sm truncate" title={m.ministryName}>
                          {m.ministryName}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700">{m.projectCount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-500">₹{Math.round(m.totalOriginalCostCr).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">₹{Math.round(m.totalRevisedCostCr).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className={m.weightedCostEscalationPct > 15 ? 'text-amber-600 font-semibold' : 'text-slate-600'}>
                            +{m.weightedCostEscalationPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-blue-600 font-medium">₹{Math.round(m.totalCumulativeExpenditureCr).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono font-medium text-slate-700">{m.avgPhysicalProgressPct.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className={m.avgScheduleDelayMonths > 12 ? 'text-orange-600 font-semibold' : 'text-slate-600'}>
                            {(m.avgScheduleDelayMonths || 0).toFixed(1)} Mo
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={m.highRiskCount + m.criticalRiskCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                            {m.highRiskCount + m.criticalRiskCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-amber-600 font-medium">{m.activeWarningCount}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleSelectMinistry(m.ministryName)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold transition flex items-center gap-1 mx-auto shadow-2xs"
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
      {selectedMinistry && (
        <div className="space-y-6">
          
          {/* Top Drill-Down Selectors Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Detailed Ministry Drill-Down
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scope inherited from overview: {activeChips.length > 0 ? activeChips.map(c => `${c.label}: ${c.value}`).join(' · ') : 'National Aggregate (All criteria)'}
                </p>
              </div>

              <button
                onClick={() => { setSelectedMinistry(null); setSelectedAgency(null); syncUrl(appliedFilters, null, null); }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
              </button>
            </div>

            {/* Conventional Compact Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Ministry Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Selected Ministry
                </label>
                <select
                  value={selectedMinistry}
                  onChange={(e) => handleSelectMinistry(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                >
                  {(meta?.ministries && meta.ministries.length > 0
                    ? meta.ministries
                    : ministries.map(m => m.ministryName)
                  ).map(minName => {
                    const minObj = ministries.find(m => m.ministryName === minName);
                    return (
                      <option key={minName} value={minName}>
                        {minName} {minObj ? `(${minObj.projectCount} projects)` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Implementing Agency Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Implementing Agency
                </label>
                <select
                  value={selectedAgency || 'ALL'}
                  onChange={(e) => handleSelectAgency(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                >
                  <option value="ALL">All Implementing Agencies ({agencies.reduce((acc, a) => acc + a.project_count, 0)})</option>
                  {agencies.map(ag => (
                    <option key={ag.agency_name} value={ag.agency_name}>
                      {ag.agency_name} ({ag.project_count} projects{ag.high_risk_count > 0 ? ` · ${ag.high_risk_count} high-risk` : ''})
                    </option>
                  ))}
                </select>
              </div>

              {/* Scoped Entity Summary Pill */}
              <div className="flex flex-col justify-end">
                <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
                  <span className="font-semibold">Matching Scoped Projects:</span>
                  <span className="font-mono font-bold text-sm text-indigo-700">
                    {selectedAgency 
                      ? agencies.find(a => a.agency_name === selectedAgency)?.project_count || projects.length
                      : agencies.reduce((acc, a) => acc + a.project_count, 0) || projects.length}
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
                  Project Cohort: {selectedMinistry} {selectedAgency ? `→ ${selectedAgency}` : ''}
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
                    <th className="px-4 py-2.5">Sector</th>
                    <th className="px-4 py-2.5">State</th>
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
                        Loading ministry project cohort...
                      </td>
                    </tr>
                  ) : projects.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400">
                        No projects found under this ministry/agency matching the applied filters.
                      </td>
                    </tr>
                  ) : (
                    projects.map((p) => (
                      <tr key={p.projectId} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-2.5 font-mono text-slate-500">{p.projectId}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-900 max-w-xs truncate" title={p.projectName}>
                          {p.projectName}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">{p.sectorName}</td>
                        <td className="px-4 py-2.5 text-slate-600">{p.stateName}</td>
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
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-xs font-semibold border border-indigo-200 transition inline-flex items-center gap-1"
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
