import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Layers, 
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
  SectorSummary, 
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
  ministry: 'ALL',
  riskBand: 'ALL',
  trajectory: 'ALL',
  costFilter: 'ALL',
  delayFilter: 'ALL',
  warningFilter: 'ALL',
  multiState: 'ALL',
  sortBy: 'cost'
};

export const SectorAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Sector Overview State
  const [sectors, setSectors] = useState<SectorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter Metadata from backend
  const [meta, setMeta] = useState<FilterMetadata | null>(null);

  // Active chart visualization tab
  const [activeChartTab, setActiveChartTab] = useState<'CAPITAL' | 'COST_DELAY' | 'RISK' | 'PROGRESS'>('CAPITAL');
  const [chartCohort, setChartCohort] = useState<'ALL' | 'MEGA' | 'SPECIALIZED'>('ALL');
  const [riskViewMode, setRiskViewMode] = useState<'COUNT' | 'PERCENT'>('COUNT');

  // Filter State: Draft vs Applied
  const [draftFilters, setDraftFilters] = useState<AnalyticalFilterParams>(() => ({
    state: searchParams.get('state') || 'ALL',
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
  const [selectedSector, setSelectedSector] = useState<string | null>(searchParams.get('sectorDetail') || null);
  const [selectedState, setSelectedState] = useState<string | null>(searchParams.get('stateDetail') || null);
  const [sectorStates, setSectorStates] = useState<Array<{ state_name: string; project_count: number; total_revised_cost_cr: number; avg_progress_pct: number; high_risk_count: number }>>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [page, setPage] = useState(1);
  const [loadingDrilldown, setLoadingDrilldown] = useState(false);

  // Load canonical filter metadata on mount
  useEffect(() => {
    api.getFilterMetadata()
      .then(setMeta)
      .catch(err => console.error('Failed to load filter metadata:', err));
  }, []);

  // Fetch Sectors based on applied filters
  const fetchSectors = useCallback(async (filters: AnalyticalFilterParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSectors(filters);
      setSectors(res || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load sector analytics');
      setSectors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync applied state to URL
  const syncUrl = useCallback((filters: AnalyticalFilterParams, secDetail: string | null, stDetail: string | null) => {
    const sp = new URLSearchParams();
    if (filters.state && filters.state !== 'ALL') sp.set('state', filters.state);
    if (filters.ministry && filters.ministry !== 'ALL') sp.set('ministry', filters.ministry);
    if (filters.riskBand && filters.riskBand !== 'ALL') sp.set('riskBand', filters.riskBand);
    if (filters.trajectory && filters.trajectory !== 'ALL') sp.set('trajectory', filters.trajectory);
    if (filters.costFilter && filters.costFilter !== 'ALL') sp.set('costFilter', filters.costFilter);
    if (filters.delayFilter && filters.delayFilter !== 'ALL') sp.set('delayFilter', filters.delayFilter);
    if (filters.warningFilter && filters.warningFilter !== 'ALL') sp.set('warningFilter', filters.warningFilter);
    if (filters.multiState && filters.multiState !== 'ALL') sp.set('multiState', filters.multiState);
    if (filters.sortBy && filters.sortBy !== 'cost') sp.set('sortBy', filters.sortBy);
    if (secDetail) sp.set('sectorDetail', secDetail);
    if (stDetail) sp.set('stateDetail', stDetail);
    setSearchParams(sp, { replace: true });
  }, [setSearchParams]);

  // Initial load
  useEffect(() => {
    fetchSectors(appliedFilters);
  }, []);

  // Apply Action: Commit draft filters and trigger query
  const handleApply = () => {
    setAppliedFilters(draftFilters);
    syncUrl(draftFilters, selectedSector, selectedState);
    fetchSectors(draftFilters);
  };

  // Reset Action: Restore defaults and query national aggregate
  const handleReset = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    syncUrl(DEFAULT_FILTERS, selectedSector, selectedState);
    fetchSectors(DEFAULT_FILTERS);
  };

  // Quick Preset
  const handlePreset = (preset: Partial<AnalyticalFilterParams>) => {
    const updated: AnalyticalFilterParams = {
      ...DEFAULT_FILTERS,
      ...preset
    };
    setDraftFilters(updated);
    setAppliedFilters(updated);
    syncUrl(updated, selectedSector, selectedState);
    fetchSectors(updated);
  };

  // Remove Chip
  const handleRemoveChip = (key: string) => {
    const updated = { ...appliedFilters, [key]: 'ALL' };
    setDraftFilters(updated);
    setAppliedFilters(updated);
    syncUrl(updated, selectedSector, selectedState);
    fetchSectors(updated);
  };

  // Check unsaved changes
  const hasUnsavedChanges = JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters);

  // Convert applied filters to chips
  const activeChips: ActiveChip[] = [
    appliedFilters.state && appliedFilters.state !== 'ALL' ? { key: 'state', label: 'State', value: appliedFilters.state, onRemove: () => handleRemoveChip('state') } : null,
    appliedFilters.ministry && appliedFilters.ministry !== 'ALL' ? { key: 'ministry', label: 'Ministry', value: appliedFilters.ministry, onRemove: () => handleRemoveChip('ministry') } : null,
    appliedFilters.riskBand && appliedFilters.riskBand !== 'ALL' ? { key: 'riskBand', label: 'Risk Band', value: appliedFilters.riskBand, onRemove: () => handleRemoveChip('riskBand') } : null,
    appliedFilters.costFilter && appliedFilters.costFilter !== 'ALL' ? { key: 'costFilter', label: 'Cost Profile', value: appliedFilters.costFilter.replace(/_/g, ' '), onRemove: () => handleRemoveChip('costFilter') } : null,
    appliedFilters.delayFilter && appliedFilters.delayFilter !== 'ALL' ? { key: 'delayFilter', label: 'Delay Profile', value: appliedFilters.delayFilter.replace(/_/g, ' '), onRemove: () => handleRemoveChip('delayFilter') } : null,
    appliedFilters.warningFilter && appliedFilters.warningFilter !== 'ALL' ? { key: 'warningFilter', label: 'Warnings', value: appliedFilters.warningFilter.replace(/_/g, ' '), onRemove: () => handleRemoveChip('warningFilter') } : null,
    appliedFilters.multiState && appliedFilters.multiState !== 'ALL' ? { key: 'multiState', label: 'Multi-State', value: appliedFilters.multiState, onRemove: () => handleRemoveChip('multiState') } : null,
  ].filter(Boolean) as ActiveChip[];

  // Quick Presets
  const presets: QuickPreset[] = [
    { id: 'all', label: 'All Sectors (National)', onApply: handleReset },
    { id: 'crit', label: 'Critical Risk Only', onApply: () => handlePreset({ riskBand: 'CRITICAL' }) },
    { id: 'cost20', label: 'Cost Overrun ≥ 20%', onApply: () => handlePreset({ costFilter: 'HIGH_ESCALATION' }) },
    { id: 'delay12', label: 'Delayed ≥ 12 Mo', onApply: () => handlePreset({ delayFilter: 'SEVERE_DELAY' }) },
    { id: 'multi', label: 'Multi-State Corridors', onApply: () => handlePreset({ multiState: 'YES' }) },
  ];

  // Drilldown data loader: inherits appliedFilters
  const loadDrilldown = useCallback(async (secName: string, stName: string | null, currentPage: number) => {
    setLoadingDrilldown(true);
    try {
      const [stRes, projRes] = await Promise.all([
        api.getSectorStates(secName, appliedFilters),
        api.getSectorProjects(secName, stName || undefined, currentPage, 20, appliedFilters)
      ]);
      setSectorStates(stRes || []);
      setProjects(projRes || []);
    } catch (e) {
      console.error('Failed to load sector drilldown:', e);
    } finally {
      setLoadingDrilldown(false);
    }
  }, [appliedFilters]);

  // Handle Explore Sector from table or dropdown
  const handleSelectSector = (secName: string) => {
    setSelectedSector(secName);
    setSelectedState(null);
    setPage(1);
    syncUrl(appliedFilters, secName, null);
    loadDrilldown(secName, null, 1);
  };

  // Handle Select State in drill-down dropdown
  const handleSelectState = (stName: string | null) => {
    const cleanSt = stName && stName !== 'ALL' ? stName : null;
    setSelectedState(cleanSt);
    setPage(1);
    if (selectedSector) {
      syncUrl(appliedFilters, selectedSector, cleanSt);
      loadDrilldown(selectedSector, cleanSt, 1);
    }
  };

  // Detail Page Change
  const handleDrilldownPageChange = (newPage: number) => {
    setPage(newPage);
    if (selectedSector) {
      loadDrilldown(selectedSector, selectedState, newPage);
    }
  };

  // Trigger drilldown if initial URL has sectorDetail
  useEffect(() => {
    if (selectedSector) {
      loadDrilldown(selectedSector, selectedState, page);
    }
  }, []);

  // Aggregated Portfolio Totals for Top KPI Cards
  const kpi = useMemo(() => {
    const totalProjects = sectors.reduce((acc, s) => acc + s.projectCount, 0);
    const totalRevisedCost = sectors.reduce((acc, s) => acc + s.totalRevisedCostCr, 0);
    const totalOrigCost = sectors.reduce((acc, s) => acc + s.totalOriginalCostCr, 0);
    const totalSpend = sectors.reduce((acc, s) => acc + s.totalCumulativeExpenditureCr, 0);
    const totalHighCritical = sectors.reduce((acc, s) => acc + s.highRiskCount + s.criticalRiskCount, 0);
    const totalWarnings = sectors.reduce((acc, s) => acc + s.activeWarningCount, 0);
    const portfolioCostEscalation = totalOrigCost > 0 ? ((totalRevisedCost - totalOrigCost) / totalOrigCost) * 100 : 0;
    const avgDelay = sectors.length > 0
      ? sectors.reduce((acc, s) => acc + (s.avgScheduleDelayMonths || 0) * s.projectCount, 0) / (totalProjects || 1)
      : 0;

    return {
      totalProjects,
      sectorsCount: sectors.length,
      totalRevisedCost,
      totalSpend,
      portfolioCostEscalation,
      totalHighCritical,
      totalWarnings,
      avgDelay
    };
  }, [sectors]);

  const megaSectorsCount = useMemo(() => sectors.filter(s => s.totalRevisedCostCr >= 100000).length, [sectors]);
  const specializedSectorsCount = useMemo(() => sectors.filter(s => s.totalRevisedCostCr < 100000).length, [sectors]);

  // Chart Data preparation with Cohort filtering & Risk normalization
  const chartData = useMemo(() => {
    let cohortSectors = sectors;
    if (chartCohort === 'MEGA') {
      cohortSectors = sectors.filter(s => s.totalRevisedCostCr >= 100000);
    } else if (chartCohort === 'SPECIALIZED') {
      cohortSectors = sectors.filter(s => s.totalRevisedCostCr < 100000);
    }

    return cohortSectors.map(s => {
      const totalPrjs = Math.max(1, s.projectCount);
      const modLow = Math.max(0, s.projectCount - (s.highRiskCount + s.criticalRiskCount));
      return {
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
        moderateLowRiskCount: modLow,
        criticalRiskPct: Number(((s.criticalRiskCount / totalPrjs) * 100).toFixed(1)),
        highRiskPct: Number(((s.highRiskCount / totalPrjs) * 100).toFixed(1)),
        moderateLowRiskPct: Number(((modLow / totalPrjs) * 100).toFixed(1)),
        warningCount: s.activeWarningCount,
      };
    });
  }, [sectors, chartCohort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Section with Authentic Infrastructure Context */}
      <div className="bg-[#FAF8F5] border border-[#DDD9D0] rounded-xl p-5 sm:p-6 shadow-xs relative overflow-hidden border-l-4 border-l-[#173F35] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Subtle authentic infrastructure contextual backdrop */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-cover bg-center hidden md:block"
          style={{ 
            backgroundImage: `url(${
              selectedSector?.toLowerCase().includes('road') ? '/banner4-BesNf3Ns.png' :
              selectedSector?.toLowerCase().includes('port') || selectedSector?.toLowerCase().includes('rail') ? '/banner2-AZrNp54C.png' :
              selectedSector?.toLowerCase().includes('aviation') || selectedSector?.toLowerCase().includes('civil') ? '/banner3-BkFJVKqW.png' :
              selectedSector?.toLowerCase().includes('power') || selectedSector?.toLowerCase().includes('energy') ? '/banner1-1razA4xw.jpeg' :
              '/banner4-BesNf3Ns.png'
            })`,
            maskImage: 'linear-gradient(to right, transparent, black 80%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 80%)'
          }} 
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#267A69] font-semibold text-xs uppercase tracking-wider mb-1">
            {selectedSector ? (
              <button
                onClick={() => { setSelectedSector(null); setSelectedState(null); syncUrl(appliedFilters, null, null); }}
                className="flex items-center gap-1 hover:underline text-[#52605B] hover:text-[#267A69]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sector Overview
              </button>
            ) : (
              <>
                <Layers className="w-4 h-4 text-[#267A69]" />
                <span>Sector Portfolio Intelligence</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-[#173F35] tracking-tight">
            {selectedSector ? `${selectedSector} Detailed Analytics` : 'Infrastructure Sector Comparison & Analytics'}
          </h1>
          <p className="text-xs text-[#52605B] mt-1 max-w-3xl leading-relaxed">
            {selectedSector
              ? `State-wise performance breakdown, capital burn, and project execution drill-down for ${selectedSector}.`
              : 'Comparative pictorial and tabular intelligence across central infrastructure sectors. Filter by state, ministry, and risk criteria to evaluate capital allocation and delivery.'}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-lg bg-white border border-[#DDD9D0] text-[#173F35] text-xs font-semibold flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#267A69]" />
            <span>{sectors.length} Sectors Active</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OVERVIEW MODE: FILTERS -> KPIS -> CHARTS -> COMPARISON TABLE             */}
      {/* ========================================================================= */}
      {!selectedSector && (
        <div className="space-y-6">
          
          {/* Analytical Filter Panel */}
          <AnalyticalFilterPanel
            title="Sector Analytical Scope"
            subtitle="Configure cohort criteria. Visual charts and sector rankings reflect applied filters."
            onApply={handleApply}
            onReset={handleReset}
            loading={loading}
            hasUnsavedChanges={hasUnsavedChanges}
            applyButtonLabel="Apply Sector Filters"
            presets={presets}
            activeChips={activeChips}
            onClearAllChips={handleReset}
            totalMatching={kpi.totalProjects}
            entityLabel="projects"
          >
            {/* State / UT */}
            <FilterSelect
              label="State / Union Territory"
              value={draftFilters.state || 'ALL'}
              onChange={(v) => setDraftFilters(prev => ({ ...prev, state: v }))}
              options={meta?.states || []}
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

            {/* Cost Escalation Profile */}
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

            {/* Schedule Slippage Profile */}
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

            {/* Warning Profile */}
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
              label="Rank Sectors By"
              value={draftFilters.sortBy || 'cost'}
              onChange={(v) => setDraftFilters(prev => ({ ...prev, sortBy: v }))}
              options={[
                { value: 'cost', label: 'Revised Outlay (Highest)' },
                { value: 'projects', label: 'Project Count (Highest)' },
                { value: 'escalation', label: 'Cost Escalation % (Highest)' },
                { value: 'delay', label: 'Average Delay (Longest)' },
                { value: 'risk', label: 'High/Critical Risk (Highest)' },
                { value: 'name', label: 'Sector Name (A-Z)' },
              ]}
            />
          </AnalyticalFilterPanel>

          {/* Filtered KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <div className="bg-white border border-[#DDD9D0] rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-[#66736D]">Filtered Projects</p>
              <p className="text-lg font-bold text-[#173F35] mt-0.5">{kpi.totalProjects.toLocaleString()}</p>
              <p className="text-[10px] text-[#8C9893] mt-0.5">{kpi.sectorsCount} Sectors Active</p>
            </div>
            <div className="bg-white border border-[#DDD9D0] rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-[#66736D]">Revised Outlay</p>
              <p className="text-lg font-bold text-[#173F35] mt-0.5">₹{Math.round(kpi.totalRevisedCost).toLocaleString()}</p>
              <p className="text-[10px] text-[#8C9893] mt-0.5">Cr Capital Exposure</p>
            </div>
            <div className="bg-white border border-[#DDD9D0] rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-[#66736D]">Expenditure</p>
              <p className="text-lg font-bold text-[#267A69] mt-0.5">₹{Math.round(kpi.totalSpend).toLocaleString()}</p>
              <p className="text-[10px] text-[#8C9893] mt-0.5">Cr Cumulative Burn</p>
            </div>
            <div className="bg-white border border-[#DDD9D0] rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-[#66736D]">Weighted Escalation</p>
              <p className={`text-lg font-bold mt-0.5 ${kpi.portfolioCostEscalation > 15 ? 'text-amber-600' : 'text-[#173F35]'}`}>
                +{kpi.portfolioCostEscalation.toFixed(1)}%
              </p>
              <p className="text-[10px] text-[#8C9893] mt-0.5">Cost Growth vs Sanction</p>
            </div>
            <div className="bg-white border border-[#DDD9D0] rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-[#66736D]">Average Delay</p>
              <p className={`text-lg font-bold mt-0.5 ${kpi.avgDelay > 12 ? 'text-orange-600' : 'text-[#173F35]'}`}>
                {kpi.avgDelay.toFixed(1)} Mo
              </p>
              <p className="text-[10px] text-[#8C9893] mt-0.5">Weighted Slippage</p>
            </div>
            <div className="bg-white border border-[#DDD9D0] rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-[#66736D]">High / Critical Risk</p>
              <p className="text-lg font-bold text-rose-600 mt-0.5">{kpi.totalHighCritical.toLocaleString()}</p>
              <p className="text-[10px] text-[#8C9893] mt-0.5">Flagged Projects</p>
            </div>
            <div className="bg-white border border-[#DDD9D0] rounded-xl p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-[#66736D]">Active Warnings</p>
              <p className="text-lg font-bold text-amber-500 mt-0.5">{kpi.totalWarnings.toLocaleString()}</p>
              <p className="text-[10px] text-[#8C9893] mt-0.5">Rule Anomaly Signals</p>
            </div>
          </div>

          {/* Context statement */}
          <div className="flex items-center justify-between text-xs text-[#66736D] px-1">
            <span>
              Comparing <strong className="text-[#26312D]">{sectors.length} sectors</strong> across <strong className="text-[#26312D]">{kpi.totalProjects.toLocaleString()} projects</strong> matching applied analytical scope.
            </span>
            <span className="text-[11px] text-[#8C9893]">
              Click any sector row or bar to inspect state breakdown & project cohort
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-700 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => fetchSectors(appliedFilters)} className="underline hover:text-rose-900 font-semibold">
                Retry
              </button>
            </div>
          )}

          {/* Graphical Pictorial Comparison Tabs */}
          <div className="bg-white rounded-xl border-2 border-[#B8D9F2] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#B8D9F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F0F6FB]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0A365C]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0A365C]">
                  Sector Comparative Visual Analytics
                </span>
              </div>

              {/* Chart Tabs */}
              <div className="flex bg-[#E1EFF9] p-0.5 rounded-lg text-xs self-start sm:self-auto border border-[#B8D9F2]">
                <button
                  onClick={() => setActiveChartTab('CAPITAL')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition ${
                    activeChartTab === 'CAPITAL' ? 'bg-[#0A365C] text-white shadow-xs' : 'text-[#4B647D] hover:text-[#0A365C]'
                  }`}
                >
                  Capital &amp; Delivery
                </button>
                <button
                  onClick={() => setActiveChartTab('COST_DELAY')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition ${
                    activeChartTab === 'COST_DELAY' ? 'bg-[#0A365C] text-white shadow-xs' : 'text-[#4B647D] hover:text-[#0A365C]'
                  }`}
                >
                  Cost vs Schedule Delay
                </button>
                <button
                  onClick={() => setActiveChartTab('RISK')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition ${
                    activeChartTab === 'RISK' ? 'bg-[#0A365C] text-white shadow-xs' : 'text-[#4B647D] hover:text-[#0A365C]'
                  }`}
                >
                  Risk Concentration &amp; Alerts
                </button>
                <button
                  onClick={() => setActiveChartTab('PROGRESS')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition ${
                    activeChartTab === 'PROGRESS' ? 'bg-[#0A365C] text-white shadow-xs' : 'text-[#4B647D] hover:text-[#0A365C]'
                  }`}
                >
                  Execution Progress
                </button>
              </div>
            </div>

            {/* Sub-controls: Cohort Selection & View Mode */}
            <div className="px-4 sm:px-6 py-2.5 bg-[#F4F9FD] border-b border-[#D8EBF8] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-[#4B647D] text-[11px] font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1BA0E2]" />
                {activeChartTab === 'CAPITAL' && 'Fiscal commitment comparison: Original Sanction vs Revised Outlay vs Certified Spend.'}
                {activeChartTab === 'COST_DELAY' && 'Dual-axis comparison: Weighted Cost Escalation (% left) vs Average Schedule Delay (Months right).'}
                {activeChartTab === 'RISK' && (riskViewMode === 'COUNT' ? 'Volume distribution: Absolute project count in each risk category.' : 'Normalized risk exposure: Percentage share of sector portfolio in each risk band.')}
                {activeChartTab === 'PROGRESS' && 'Delivery pace: Certified physical progress (%) vs financial expenditure ratio (%).'}
              </div>

              <div className="flex items-center gap-2">
                {/* Cohort Selector with Live Counts */}
                <div className="flex items-center gap-1 bg-white border border-[#B8D9F2] p-0.5 rounded-lg text-[11px]">
                  <span className="px-2 py-0.5 text-[#7E97B0] font-semibold uppercase text-[9px] tracking-wider">Cohort:</span>
                  <button
                    onClick={() => setChartCohort('ALL')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition ${chartCohort === 'ALL' ? 'bg-[#1BA0E2] text-white shadow-2xs' : 'text-[#4B647D] hover:text-[#0A365C]'}`}
                  >
                    All ({sectors.length})
                  </button>
                  <button
                    onClick={() => setChartCohort('MEGA')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition ${chartCohort === 'MEGA' ? 'bg-[#1BA0E2] text-white shadow-2xs' : 'text-[#4B647D] hover:text-[#0A365C]'}`}
                    title="Sectors with Revised Outlay ≥ ₹1 Lakh Cr"
                  >
                    Mega (≥₹1L Cr) ({megaSectorsCount})
                  </button>
                  <button
                    onClick={() => setChartCohort('SPECIALIZED')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition ${chartCohort === 'SPECIALIZED' ? 'bg-[#1BA0E2] text-white shadow-2xs' : 'text-[#4B647D] hover:text-[#0A365C]'}`}
                    title="Sectors with Revised Outlay < ₹1 Lakh Cr (Zoom into smaller units)"
                  >
                    Specialized (&lt;₹1L Cr) ({specializedSectorsCount})
                  </button>
                </div>

                {/* Risk Mode Toggle */}
                {activeChartTab === 'RISK' && (
                  <div className="flex items-center gap-1 bg-white border border-[#B8D9F2] p-0.5 rounded-lg text-[11px]">
                    <span className="px-2 py-0.5 text-[#7E97B0] font-semibold uppercase text-[9px] tracking-wider">Metric:</span>
                    <button
                      onClick={() => setRiskViewMode('COUNT')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition ${riskViewMode === 'COUNT' ? 'bg-[#1BA0E2] text-white shadow-2xs' : 'text-[#4B647D] hover:text-[#0A365C]'}`}
                    >
                      Project Count (#)
                    </button>
                    <button
                      onClick={() => setRiskViewMode('PERCENT')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition ${riskViewMode === 'PERCENT' ? 'bg-[#1BA0E2] text-white shadow-2xs' : 'text-[#4B647D] hover:text-[#0A365C]'}`}
                      title="100% Stacked Bar: Risk share percentage"
                    >
                      Risk Share (%)
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6 h-[420px]">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-[#7E97B0]">
                  Recomputing visual comparison across sectors...
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-xs text-[#4B647D] p-6 text-center">
                  <BarChart3 className="w-8 h-8 text-[#90C3E8] mb-2" />
                  <p className="font-semibold text-[#0A365C]">
                    No sectors found in the {chartCohort === 'MEGA' ? 'Mega (≥₹1L Cr)' : chartCohort === 'SPECIALIZED' ? 'Specialized (<₹1L Cr)' : ''} cohort.
                  </p>
                  <p className="text-[11px] text-[#7E97B0] mt-1">Adjust your filters or switch back to the complete portfolio.</p>
                  <button 
                    onClick={() => setChartCohort('ALL')} 
                    className="mt-3 px-3.5 py-1.5 bg-[#1BA0E2] text-white rounded-md text-xs font-semibold hover:bg-[#148AC4] transition-colors shadow-xs"
                  >
                    View All Sectors ({sectors.length})
                  </button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {activeChartTab === 'CAPITAL' ? (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 65 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D8EBF8" />
                      <XAxis dataKey="shortName" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#4B647D' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#4B647D' }} tickFormatter={(v) => v >= 1000 ? `₹${(v/1000).toFixed(0)}k Cr` : `₹${v} Cr`} />
                      <Tooltip 
                        formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString()} Cr`, name]}
                        labelFormatter={(label) => `Sector: ${chartData.find(d => d.shortName === label)?.name || label}`}
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#B8D9F2', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="originalCost" name="Original Sanction" fill="#90C3E8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="revisedCost" name="Revised Outlay" fill="#0A365C" radius={[4, 4, 0, 0]} onClick={(d: any) => { if (d?.name) handleSelectSector(d.name); }} className="cursor-pointer" />
                      <Bar dataKey="expenditure" name="Cumulative Expenditure" fill="#1BA0E2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : activeChartTab === 'COST_DELAY' ? (
                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 65 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D8EBF8" />
                      <XAxis dataKey="shortName" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#4B647D' }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#4B647D' }} tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#4B647D' }} tickFormatter={(v) => `${v} Mo`} />
                      <Tooltip 
                        formatter={(val: any, name: any, item: any) => [
                          item?.dataKey === 'costEscalationPct' 
                            ? `${Number(val) > 0 ? '+' : ''}${Number(val).toFixed(1)}%` 
                            : `${Number(val).toFixed(1)} Months`,
                          name
                        ]}
                        labelFormatter={(label) => `Sector: ${chartData.find(d => d.shortName === label)?.name || label}`}
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#B8D9F2', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar yAxisId="left" dataKey="costEscalationPct" name="Weighted Cost Escalation" fill="#D97706" radius={[4, 4, 0, 0]} onClick={(d: any) => { if (d?.name) handleSelectSector(d.name); }} className="cursor-pointer" />
                      <Line yAxisId="right" type="monotone" dataKey="scheduleDelayMonths" name="Average Schedule Delay" stroke="#C53030" strokeWidth={3} dot={{ r: 4, fill: '#C53030' }} />
                    </ComposedChart>
                  ) : activeChartTab === 'RISK' ? (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 65 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D8EBF8" />
                      <XAxis dataKey="shortName" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#4B647D' }} />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#4B647D' }} 
                        domain={riskViewMode === 'PERCENT' ? [0, 100] : ['auto', 'auto']}
                        tickFormatter={riskViewMode === 'PERCENT' ? (v) => `${v}%` : undefined}
                      />
                      <Tooltip 
                        formatter={(val: any, name: any, item: any) => {
                          if (riskViewMode === 'PERCENT') {
                            const countKey = name.includes('Critical') ? 'criticalRiskCount' : name.includes('High') ? 'highRiskCount' : 'moderateLowRiskCount';
                            const rawCount = item?.payload?.[countKey] || 0;
                            return [`${val}% (${rawCount} prjs)`, name];
                          }
                          return [`${val} projects`, name];
                        }}
                        labelFormatter={(label) => `Sector: ${chartData.find(d => d.shortName === label)?.name || label}`}
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#B8D9F2', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar 
                        dataKey={riskViewMode === 'PERCENT' ? 'criticalRiskPct' : 'criticalRiskCount'} 
                        name={riskViewMode === 'PERCENT' ? 'Critical Risk (%)' : 'Critical Risk'} 
                        stackId="a" 
                        fill="#C53030" 
                        onClick={(d: any) => { if (d?.name) handleSelectSector(d.name); }} 
                        className="cursor-pointer" 
                      />
                      <Bar 
                        dataKey={riskViewMode === 'PERCENT' ? 'highRiskPct' : 'highRiskCount'} 
                        name={riskViewMode === 'PERCENT' ? 'High Risk (%)' : 'High Risk'} 
                        stackId="a" 
                        fill="#D97706" 
                      />
                      <Bar 
                        dataKey={riskViewMode === 'PERCENT' ? 'moderateLowRiskPct' : 'moderateLowRiskCount'} 
                        name={riskViewMode === 'PERCENT' ? 'Moderate / Low Risk (%)' : 'Moderate / Low Risk'} 
                        stackId="a" 
                        fill="#7E97B0" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  ) : (
                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 65 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D8EBF8" />
                      <XAxis dataKey="shortName" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#4B647D' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#4B647D' }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                      <Tooltip 
                        formatter={(val: any, name: any) => [`${val}%`, name]}
                        labelFormatter={(label) => `Sector: ${chartData.find(d => d.shortName === label)?.name || label}`}
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#B8D9F2', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="physicalProgressPct" name="Average Certified Physical Progress" fill="#1BA0E2" radius={[4, 4, 0, 0]} onClick={(d: any) => { if (d?.name) handleSelectSector(d.name); }} className="cursor-pointer" />
                      <Line type="monotone" dataKey="expenditurePct" name="Cumulative Expenditure / Revised Outlay" stroke="#0A365C" strokeWidth={3} dot={{ r: 4, fill: '#0A365C' }} />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Numerical Sector Comparison Table */}
          <div className="bg-white border border-[#DDD9D0] rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-[#DDD9D0] bg-[#FAF8F5]/70 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#26312D]">
                Detailed Sector Portfolio Comparison ({sectors.length})
              </span>
              <span className="text-xs text-[#66736D]">
                Ordered by {appliedFilters.sortBy === 'cost' ? 'Revised Outlay' : appliedFilters.sortBy}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#26312D]">
                <thead className="bg-[#FAF8F5]/70 border-b border-[#DDD9D0] uppercase text-[11px] font-semibold text-[#66736D]">
                  <tr>
                    <th className="px-4 py-3">Sector Name</th>
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
                      <td colSpan={11} className="text-center py-12 text-[#8C9893]">
                        Querying sector portfolio cohort...
                      </td>
                    </tr>
                  ) : sectors.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-12 space-y-2">
                        <p className="text-sm font-medium text-[#66736D]">No sectors contain projects matching the selected scope.</p>
                        <p className="text-xs text-[#8C9893]">Broaden your filters or reset to national comparison.</p>
                        <button
                          onClick={handleReset}
                          className="mt-2 px-3 py-1.5 bg-[#173F35] hover:bg-[#267A69] text-white rounded text-xs font-semibold"
                        >
                          Reset Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    sectors.map((s) => (
                      <tr key={s.sectorName} className="hover:bg-[#E8F0EC]/40 transition">
                        <td className="px-4 py-3 font-semibold text-[#173F35] max-w-sm truncate" title={s.sectorName}>
                          {s.sectorName}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[#26312D]">{s.projectCount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono text-[#66736D]">₹{Math.round(s.totalOriginalCostCr).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-[#173F35]">₹{Math.round(s.totalRevisedCostCr).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className={s.weightedCostEscalationPct > 15 ? 'text-amber-600 font-semibold' : 'text-[#66736D]'}>
                            +{s.weightedCostEscalationPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[#267A69] font-medium">₹{Math.round(s.totalCumulativeExpenditureCr).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono font-medium text-[#26312D]">{s.avgPhysicalProgressPct.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className={s.avgScheduleDelayMonths > 12 ? 'text-orange-600 font-semibold' : 'text-[#66736D]'}>
                            {(s.avgScheduleDelayMonths || 0).toFixed(1)} Mo
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={s.highRiskCount + s.criticalRiskCount > 0 ? 'text-rose-600 font-bold' : 'text-[#8C9893]'}>
                            {s.highRiskCount + s.criticalRiskCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-amber-600 font-medium">{s.activeWarningCount}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleSelectSector(s.sectorName)}
                            className="px-3 py-1 bg-[#173F35] hover:bg-[#267A69] text-white rounded text-[11px] font-semibold transition flex items-center gap-1 mx-auto shadow-2xs"
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
      {selectedSector && (
        <div className="space-y-6">
          
          {/* Top Drill-Down Selectors Panel */}
          <div className="bg-white rounded-xl border border-[#DDD9D0] p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#267A69]">
                  Detailed Sector Drill-Down
                </span>
                <p className="text-xs text-[#66736D] mt-0.5">
                  Scope inherited from overview: {activeChips.length > 0 ? activeChips.map(c => `${c.label}: ${c.value}`).join(' · ') : 'National Aggregate (All criteria)'}
                </p>
              </div>

              <button
                onClick={() => { setSelectedSector(null); setSelectedState(null); syncUrl(appliedFilters, null, null); }}
                className="px-3 py-1.5 rounded-lg border border-[#DDD9D0] hover:bg-[#FAF8F5] text-xs font-semibold text-[#26312D] transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
              </button>
            </div>

            {/* Conventional Compact Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sector Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-[#26312D] mb-1">
                  Selected Sector
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => handleSelectSector(e.target.value)}
                  className="w-full bg-white border border-[#DDD9D0] rounded-lg px-3 py-2 text-xs text-[#26312D] font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                >
                  {(meta?.sectors && meta.sectors.length > 0 
                    ? meta.sectors 
                    : sectors.map(s => s.sectorName)
                  ).map(secName => {
                    const secObj = sectors.find(s => s.sectorName === secName);
                    return (
                      <option key={secName} value={secName}>
                        {secName} {secObj ? `(${secObj.projectCount} projects)` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* State / Territory Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-[#26312D] mb-1">
                  State / Territory
                </label>
                <select
                  value={selectedState || 'ALL'}
                  onChange={(e) => handleSelectState(e.target.value)}
                  className="w-full bg-white border border-[#DDD9D0] rounded-lg px-3 py-2 text-xs text-[#26312D] font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                >
                  <option value="ALL">All States & UTs ({sectorStates.reduce((acc, s) => acc + s.project_count, 0)})</option>
                  {sectorStates.map(st => (
                    <option key={st.state_name} value={st.state_name}>
                      {st.state_name} ({st.project_count} projects{st.high_risk_count > 0 ? ` · ${st.high_risk_count} high-risk` : ''})
                    </option>
                  ))}
                </select>
              </div>

              {/* Scoped Entity Summary Pill */}
              <div className="flex flex-col justify-end">
                <div className="p-2 rounded-lg bg-[#E8F0EC]/70 border border-[#BED6CB] text-xs text-blue-900 flex items-center justify-between">
                  <span className="font-semibold">Matching Sector Projects:</span>
                  <span className="font-mono font-bold text-sm text-[#173F35]">
                    {selectedState 
                      ? sectorStates.find(s => s.state_name === selectedState)?.project_count || projects.length
                      : sectorStates.reduce((acc, s) => acc + s.project_count, 0) || projects.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Cohort Table inheriting overview filters */}
          <div className="bg-white border border-[#DDD9D0] rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 bg-[#FAF8F5] border-b border-[#DDD9D0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#26312D]">
                  Project Cohort: {selectedSector} {selectedState ? `→ ${selectedState}` : '(All States)'}
                </span>
                <p className="text-[11px] text-[#66736D] mt-0.5">
                  Displaying projects satisfying inherited overview filters
                </p>
              </div>
              <span className="text-xs text-[#66736D] font-mono">
                {projects.length} displayed on page {page}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#26312D]">
                <thead className="bg-[#FAF8F5]/70 border-b border-[#DDD9D0] uppercase text-[11px] font-semibold text-[#66736D]">
                  <tr>
                    <th className="px-4 py-2.5">Project ID</th>
                    <th className="px-4 py-2.5">Project Name</th>
                    <th className="px-4 py-2.5">Agency</th>
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
                      <td colSpan={9} className="text-center py-12 text-[#8C9893]">
                        Loading sector project cohort...
                      </td>
                    </tr>
                  ) : projects.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-[#8C9893]">
                        No projects found under this sector/state matching the applied filters.
                      </td>
                    </tr>
                  ) : (
                    projects.map((p) => (
                      <tr key={p.projectId} className="hover:bg-[#FAF8F5]/80 transition">
                        <td className="px-4 py-2.5 font-mono text-[#66736D]">{p.projectId}</td>
                        <td className="px-4 py-2.5 font-medium text-[#173F35] max-w-xs truncate" title={p.projectName}>
                          {p.projectName}
                        </td>
                        <td className="px-4 py-2.5 text-[#66736D] truncate max-w-[150px]">{p.agencyName}</td>
                        <td className="px-4 py-2.5 text-[#66736D]">{p.stateName}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-[#173F35]">
                          ₹{p.latestRevisedCostCr.toLocaleString()} Cr
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-[#26312D]">{p.physicalProgressPct}%</td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          <span className={p.scheduleSlippageMonths > 0 ? 'text-amber-600 font-semibold' : 'text-[#66736D]'}>
                            {p.scheduleSlippageMonths}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <RiskBadge band={p.riskBand} score={p.overallRiskScore} />
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => navigate(`/projects/${p.projectId}`)}
                            className="px-2.5 py-1 bg-[#E8F0EC] hover:bg-blue-100 text-[#173F35] rounded text-xs font-semibold border border-[#BED6CB] transition inline-flex items-center gap-1"
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
