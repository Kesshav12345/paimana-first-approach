import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  AlertTriangle, 
  Search, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  Workflow
} from 'lucide-react';
import { api } from '../services/api';
import type { 
  EarlyWarningAlert, 
  Intervention, 
  EarlyWarningSummary, 
  EarlyWarningFilterParams, 
  InterventionFilterParams,
  FilterMetadata 
} from '../types';
import { SeverityBadge, RiskBadge, StatusChip } from '../components/common/Badges';
import { Pagination } from '../components/common/Pagination';
import { AnalyticalFilterPanel } from '../components/common/AnalyticalFilterPanel';
import type { QuickPreset } from '../components/common/AnalyticalFilterPanel';
import { FilterSelect } from '../components/common/FilterSelect';
import type { ActiveChip } from '../components/common/ActiveFilterChips';

const DEFAULT_ALERT_FILTERS: EarlyWarningFilterParams = {
  search: '',
  sector: 'ALL',
  ministry: 'ALL',
  state: 'ALL',
  severity: 'ALL',
  warningType: 'ALL',
  persistence: 'ALL',
  riskBand: 'ALL',
  interventionStatus: 'ALL',
  page: 1,
  size: 20
};

const DEFAULT_INT_FILTERS: InterventionFilterParams = {
  search: '',
  sector: 'ALL',
  ministry: 'ALL',
  state: 'ALL',
  riskBand: 'ALL',
  status: 'ALL',
  sortBy: 'priority',
  page: 1,
  size: 20
};

export const EarlyWarning: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'alerts' | 'interventions'
  const initialTab = (searchParams.get('tab') as 'alerts' | 'interventions') || 'alerts';
  const [tab, setTab] = useState<'alerts' | 'interventions'>(initialTab);

  // Metadata for filter dropdowns
  const [meta, setMeta] = useState<FilterMetadata | null>(null);

  // === TAB 1: ACTIVE ALERTS STATE ===
  const [hasAppliedAlerts, setHasAppliedAlerts] = useState<boolean>(() => {
    return searchParams.has('severity') || searchParams.has('sector') || searchParams.has('search') || searchParams.has('warningType') || searchParams.has('persistence');
  });

  const [draftAlertFilters, setDraftAlertFilters] = useState<EarlyWarningFilterParams>(() => ({
    search: searchParams.get('search') || '',
    sector: searchParams.get('sector') || 'ALL',
    ministry: searchParams.get('ministry') || 'ALL',
    state: searchParams.get('state') || 'ALL',
    severity: searchParams.get('severity') || 'ALL',
    warningType: searchParams.get('warningType') || 'ALL',
    persistence: searchParams.get('persistence') || 'ALL',
    riskBand: searchParams.get('riskBand') || 'ALL',
    interventionStatus: searchParams.get('interventionStatus') || 'ALL',
    page: Number(searchParams.get('page')) || 1,
    size: 20
  }));

  const [appliedAlertFilters, setAppliedAlertFilters] = useState<EarlyWarningFilterParams>(draftAlertFilters);

  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>([]);
  const [alertSummary, setAlertSummary] = useState<EarlyWarningSummary | null>(null);
  const [alertTotal, setAlertTotal] = useState(0);
  const [alertTotalPages, setAlertTotalPages] = useState(1);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [alertError, setAlertError] = useState<string | null>(null);

  // === TAB 2: INTERVENTION WORKFLOW STATE ===
  const [hasAppliedInt, setHasAppliedInt] = useState<boolean>(() => {
    return tab === 'interventions' && (searchParams.has('intStatus') || searchParams.has('intSector'));
  });

  const [draftIntFilters, setDraftIntFilters] = useState<InterventionFilterParams>(() => ({
    search: searchParams.get('intSearch') || '',
    sector: searchParams.get('intSector') || 'ALL',
    ministry: searchParams.get('intMinistry') || 'ALL',
    state: searchParams.get('intState') || 'ALL',
    riskBand: searchParams.get('intRiskBand') || 'ALL',
    status: searchParams.get('intStatus') || 'ALL',
    sortBy: searchParams.get('intSortBy') || 'priority',
    page: Number(searchParams.get('intPage')) || 1,
    size: 20
  }));

  const [appliedIntFilters, setAppliedIntFilters] = useState<InterventionFilterParams>(draftIntFilters);

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [intTotal, setIntTotal] = useState(0);
  const [intTotalPages, setIntTotalPages] = useState(1);
  const [loadingInt, setLoadingInt] = useState(false);
  const [intError, setIntError] = useState<string | null>(null);

  // Status Counts for Horizontal Stage tracker
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({
    UNDER_REVIEW: 0,
    ACTION_INITIATED: 0,
    MONITORING: 0,
    RESOLVED: 0
  });

  // Action / Transition Modal State
  const [modalProject, setModalProject] = useState<Intervention | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Load canonical filter metadata on mount
  useEffect(() => {
    api.getFilterMetadata()
      .then(res => setMeta(res))
      .catch(err => console.error('Failed to load filter metadata:', err));
  }, []);

  // Fetch alerts when appliedAlertFilters change
  const fetchAlerts = useCallback(async (filters: EarlyWarningFilterParams) => {
    setLoadingAlerts(true);
    setAlertError(null);
    try {
      const [alertsRes, summaryRes] = await Promise.all([
        api.getActiveAlerts(filters),
        api.getEarlyWarningSummary(filters)
      ]);
      setAlerts(alertsRes.alerts);
      setAlertTotal(alertsRes.total);
      setAlertTotalPages(alertsRes.totalPages);
      setAlertSummary(summaryRes);
    } catch (e: any) {
      setAlertError(e.message || 'Failed to load active early warning alerts');
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  // Fetch interventions when appliedIntFilters change
  const fetchInterventions = useCallback(async (filters: InterventionFilterParams) => {
    setLoadingInt(true);
    setIntError(null);
    try {
      const res = await api.getInterventions(filters);
      setInterventions(res.interventions);
      setIntTotal(res.total);
      setIntTotalPages(res.totalPages);

      // Fetch overview counts for the lifecycle stage tracker
      const [revRes, actRes, monRes, resRes] = await Promise.all([
        api.getInterventions({ ...filters, status: 'UNDER_REVIEW', size: 1 }),
        api.getInterventions({ ...filters, status: 'ACTION_INITIATED', size: 1 }),
        api.getInterventions({ ...filters, status: 'MONITORING', size: 1 }),
        api.getInterventions({ ...filters, status: 'RESOLVED', size: 1 }),
      ]);
      setStageCounts({
        UNDER_REVIEW: revRes.total,
        ACTION_INITIATED: actRes.total,
        MONITORING: monRes.total,
        RESOLVED: resRes.total
      });
    } catch (e: any) {
      setIntError(e.message || 'Failed to load intervention workflow items');
    } finally {
      setLoadingInt(false);
    }
  }, []);

  // Synchronize URL on tab or filter change
  const syncUrl = useCallback((newTab: 'alerts' | 'interventions', alertF: EarlyWarningFilterParams, intF: InterventionFilterParams) => {
    const sp = new URLSearchParams();
    sp.set('tab', newTab);

    if (newTab === 'alerts') {
      if (alertF.search) sp.set('search', alertF.search);
      if (alertF.sector && alertF.sector !== 'ALL') sp.set('sector', alertF.sector);
      if (alertF.ministry && alertF.ministry !== 'ALL') sp.set('ministry', alertF.ministry);
      if (alertF.state && alertF.state !== 'ALL') sp.set('state', alertF.state);
      if (alertF.severity && alertF.severity !== 'ALL') sp.set('severity', alertF.severity);
      if (alertF.warningType && alertF.warningType !== 'ALL') sp.set('warningType', alertF.warningType);
      if (alertF.persistence && alertF.persistence !== 'ALL') sp.set('persistence', alertF.persistence);
      if (alertF.riskBand && alertF.riskBand !== 'ALL') sp.set('riskBand', alertF.riskBand);
      if (alertF.interventionStatus && alertF.interventionStatus !== 'ALL') sp.set('interventionStatus', alertF.interventionStatus);
      if (alertF.page && alertF.page > 1) sp.set('page', String(alertF.page));
    } else {
      if (intF.search) sp.set('intSearch', intF.search);
      if (intF.sector && intF.sector !== 'ALL') sp.set('intSector', intF.sector);
      if (intF.ministry && intF.ministry !== 'ALL') sp.set('intMinistry', intF.ministry);
      if (intF.state && intF.state !== 'ALL') sp.set('intState', intF.state);
      if (intF.riskBand && intF.riskBand !== 'ALL') sp.set('intRiskBand', intF.riskBand);
      if (intF.status && intF.status !== 'ALL') sp.set('intStatus', intF.status);
      if (intF.sortBy && intF.sortBy !== 'priority') sp.set('intSortBy', intF.sortBy);
      if (intF.page && intF.page > 1) sp.set('intPage', String(intF.page));
    }

    setSearchParams(sp, { replace: true });
  }, [setSearchParams]);

  // Handle Tab Switch
  const handleTabSwitch = (targetTab: 'alerts' | 'interventions') => {
    setTab(targetTab);
    syncUrl(targetTab, appliedAlertFilters, appliedIntFilters);
    if (targetTab === 'interventions' && !hasAppliedInt) {
      setHasAppliedInt(true);
      fetchInterventions(appliedIntFilters);
    }
  };

  // Initial trigger if URL params requested query
  useEffect(() => {
    if (hasAppliedAlerts && tab === 'alerts') {
      fetchAlerts(appliedAlertFilters);
    }
  }, []);

  // Alert Filter Actions
  const handleApplyAlertFilters = () => {
    const updated = { ...draftAlertFilters, page: 1 };
    setDraftAlertFilters(updated);
    setAppliedAlertFilters(updated);
    setHasAppliedAlerts(true);
    syncUrl('alerts', updated, appliedIntFilters);
    fetchAlerts(updated);
  };

  const handleResetAlertFilters = () => {
    setDraftAlertFilters(DEFAULT_ALERT_FILTERS);
    setAppliedAlertFilters(DEFAULT_ALERT_FILTERS);
    setHasAppliedAlerts(false);
    setAlerts([]);
    setAlertSummary(null);
    setAlertTotal(0);
    syncUrl('alerts', DEFAULT_ALERT_FILTERS, appliedIntFilters);
  };

  const handleAlertPreset = (preset: Partial<EarlyWarningFilterParams>) => {
    const updated: EarlyWarningFilterParams = {
      ...DEFAULT_ALERT_FILTERS,
      ...preset,
      page: 1
    };
    setDraftAlertFilters(updated);
    setAppliedAlertFilters(updated);
    setHasAppliedAlerts(true);
    syncUrl('alerts', updated, appliedIntFilters);
    fetchAlerts(updated);
  };

  const handleRemoveAlertChip = (key: string) => {
    const updated = { ...appliedAlertFilters, [key]: 'ALL', page: 1 };
    if (key === 'search') updated.search = '';
    setDraftAlertFilters(updated);
    setAppliedAlertFilters(updated);
    syncUrl('alerts', updated, appliedIntFilters);
    fetchAlerts(updated);
  };

  const handleAlertPageChange = (newPage: number) => {
    const updated = { ...appliedAlertFilters, page: newPage };
    setDraftAlertFilters(updated);
    setAppliedAlertFilters(updated);
    syncUrl('alerts', updated, appliedIntFilters);
    fetchAlerts(updated);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Intervention Filter Actions
  const handleApplyIntFilters = () => {
    const updated = { ...draftIntFilters, page: 1 };
    setDraftIntFilters(updated);
    setAppliedIntFilters(updated);
    setHasAppliedInt(true);
    syncUrl('interventions', appliedAlertFilters, updated);
    fetchInterventions(updated);
  };

  const handleResetIntFilters = () => {
    setDraftIntFilters(DEFAULT_INT_FILTERS);
    setAppliedIntFilters(DEFAULT_INT_FILTERS);
    setHasAppliedInt(true);
    syncUrl('interventions', appliedAlertFilters, DEFAULT_INT_FILTERS);
    fetchInterventions(DEFAULT_INT_FILTERS);
  };

  const handleRemoveIntChip = (key: string) => {
    const updated = { ...appliedIntFilters, [key]: 'ALL', page: 1 };
    if (key === 'search') updated.search = '';
    setDraftIntFilters(updated);
    setAppliedIntFilters(updated);
    syncUrl('interventions', appliedAlertFilters, updated);
    fetchInterventions(updated);
  };

  const handleIntPageChange = (newPage: number) => {
    const updated = { ...appliedIntFilters, page: newPage };
    setDraftIntFilters(updated);
    setAppliedIntFilters(updated);
    syncUrl('interventions', appliedAlertFilters, updated);
    fetchInterventions(updated);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Update Intervention Status
  const handleUpdateStatus = async () => {
    if (!modalProject || !newStatus) return;
    setIsUpdatingStatus(true);
    try {
      await api.updateInterventionStatus(modalProject.projectId, newStatus, newNotes);
      setModalProject(null);
      await fetchInterventions(appliedIntFilters);
    } catch (e: any) {
      alert(e.message || 'Failed to update intervention status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Unsaved changes indicators
  const hasUnsavedAlerts = JSON.stringify(draftAlertFilters) !== JSON.stringify(appliedAlertFilters);
  const hasUnsavedInt = JSON.stringify(draftIntFilters) !== JSON.stringify(appliedIntFilters);

  // Convert applied alert filters to chips
  const alertChips: ActiveChip[] = [
    appliedAlertFilters.search ? { key: 'search', label: 'Search', value: appliedAlertFilters.search, onRemove: () => handleRemoveAlertChip('search') } : null,
    appliedAlertFilters.sector && appliedAlertFilters.sector !== 'ALL' ? { key: 'sector', label: 'Sector', value: appliedAlertFilters.sector, onRemove: () => handleRemoveAlertChip('sector') } : null,
    appliedAlertFilters.ministry && appliedAlertFilters.ministry !== 'ALL' ? { key: 'ministry', label: 'Ministry', value: appliedAlertFilters.ministry, onRemove: () => handleRemoveAlertChip('ministry') } : null,
    appliedAlertFilters.state && appliedAlertFilters.state !== 'ALL' ? { key: 'state', label: 'State', value: appliedAlertFilters.state, onRemove: () => handleRemoveAlertChip('state') } : null,
    appliedAlertFilters.severity && appliedAlertFilters.severity !== 'ALL' ? { key: 'severity', label: 'Severity', value: appliedAlertFilters.severity, onRemove: () => handleRemoveAlertChip('severity') } : null,
    appliedAlertFilters.warningType && appliedAlertFilters.warningType !== 'ALL' ? { key: 'warningType', label: 'Warning Type', value: appliedAlertFilters.warningType, onRemove: () => handleRemoveAlertChip('warningType') } : null,
    appliedAlertFilters.persistence && appliedAlertFilters.persistence !== 'ALL' ? { key: 'persistence', label: 'Persistence', value: appliedAlertFilters.persistence.replace(/_/g, ' '), onRemove: () => handleRemoveAlertChip('persistence') } : null,
    appliedAlertFilters.riskBand && appliedAlertFilters.riskBand !== 'ALL' ? { key: 'riskBand', label: 'Risk Band', value: appliedAlertFilters.riskBand, onRemove: () => handleRemoveAlertChip('riskBand') } : null,
    appliedAlertFilters.interventionStatus && appliedAlertFilters.interventionStatus !== 'ALL' ? { key: 'interventionStatus', label: 'Intervention', value: appliedAlertFilters.interventionStatus.replace(/_/g, ' '), onRemove: () => handleRemoveAlertChip('interventionStatus') } : null,
  ].filter(Boolean) as ActiveChip[];

  // Convert applied intervention filters to chips
  const intChips: ActiveChip[] = [
    appliedIntFilters.search ? { key: 'search', label: 'Search', value: appliedIntFilters.search, onRemove: () => handleRemoveIntChip('search') } : null,
    appliedIntFilters.sector && appliedIntFilters.sector !== 'ALL' ? { key: 'sector', label: 'Sector', value: appliedIntFilters.sector, onRemove: () => handleRemoveIntChip('sector') } : null,
    appliedIntFilters.ministry && appliedIntFilters.ministry !== 'ALL' ? { key: 'ministry', label: 'Ministry', value: appliedIntFilters.ministry, onRemove: () => handleRemoveIntChip('ministry') } : null,
    appliedIntFilters.state && appliedIntFilters.state !== 'ALL' ? { key: 'state', label: 'State', value: appliedIntFilters.state, onRemove: () => handleRemoveIntChip('state') } : null,
    appliedIntFilters.riskBand && appliedIntFilters.riskBand !== 'ALL' ? { key: 'riskBand', label: 'Risk Band', value: appliedIntFilters.riskBand, onRemove: () => handleRemoveIntChip('riskBand') } : null,
    appliedIntFilters.status && appliedIntFilters.status !== 'ALL' ? { key: 'status', label: 'Lifecycle Status', value: appliedIntFilters.status.replace(/_/g, ' '), onRemove: () => handleRemoveIntChip('status') } : null,
  ].filter(Boolean) as ActiveChip[];

  // Quick Presets for Active Warnings
  const alertPresets: QuickPreset[] = [
    { id: 'crit', label: 'Critical Warnings', onApply: () => handleAlertPreset({ severity: 'CRITICAL' }) },
    { id: 'persist', label: 'Persistent Warnings (≥3 Mo)', onApply: () => handleAlertPreset({ persistence: 'PERSISTENT_3M' }) },
    { id: 'delay', label: 'Severe Delay Alerts', onApply: () => handleAlertPreset({ warningType: 'Schedule Slippage', severity: 'CRITICAL' }) },
    { id: 'cost', label: 'Cost Overrun Alerts', onApply: () => handleAlertPreset({ warningType: 'Cost Overrun' }) },
    { id: 'crit_noint', label: 'Critical + No Intervention', onApply: () => handleAlertPreset({ severity: 'CRITICAL', interventionStatus: 'CANDIDATE' }) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & Analytical Scope Question */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Infrastructure Early Warning & Intervention System
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic trigger rules, anomaly persistence duration, compound alerts, and structured operational remediation
          </p>
        </div>

        {/* Dual Tab Switcher with Dynamic Counts */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => handleTabSwitch('alerts')}
            className={`px-3.5 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              tab === 'alerts'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Active Warning Signals {hasAppliedAlerts && alertTotal > 0 ? `(${alertTotal.toLocaleString()})` : ''}
          </button>
          <button
            onClick={() => handleTabSwitch('interventions')}
            className={`px-3.5 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              tab === 'interventions'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            Intervention Workflow {hasAppliedInt && intTotal > 0 ? `(${intTotal.toLocaleString()})` : ''}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE WARNING SIGNALS                                              */}
      {/* ========================================================================= */}
      {tab === 'alerts' && (
        <div className="space-y-6">
          
          {/* Analytical Filter Panel */}
          <AnalyticalFilterPanel
            title="Warning Signal Analytical Scope"
            subtitle="Formulate an early warning cohort by sector, ministry, anomaly type, trigger severity, persistence period, or intervention status."
            onApply={handleApplyAlertFilters}
            onReset={handleResetAlertFilters}
            loading={loadingAlerts}
            hasUnsavedChanges={hasUnsavedAlerts}
            applyButtonLabel="Apply Warning Filters"
            presets={alertPresets}
            activeChips={alertChips}
            onClearAllChips={handleResetAlertFilters}
            totalMatching={hasAppliedAlerts ? alertTotal : undefined}
            entityLabel="warnings"
          >
            {/* Search Input */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Project Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by project name or project ID..."
                  value={draftAlertFilters.search || ''}
                  onChange={(e) => setDraftAlertFilters(prev => ({ ...prev, search: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleApplyAlertFilters(); }}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Sector */}
            <FilterSelect
              label="Infrastructure Sector"
              value={draftAlertFilters.sector || 'ALL'}
              onChange={(v) => setDraftAlertFilters(prev => ({ ...prev, sector: v }))}
              options={meta?.sectors || []}
            />

            {/* Ministry */}
            <FilterSelect
              label="Administrative Ministry"
              value={draftAlertFilters.ministry || 'ALL'}
              onChange={(v) => setDraftAlertFilters(prev => ({ ...prev, ministry: v }))}
              options={meta?.ministries || []}
            />

            {/* State / UT */}
            <FilterSelect
              label="State / Union Territory"
              value={draftAlertFilters.state || 'ALL'}
              onChange={(v) => setDraftAlertFilters(prev => ({ ...prev, state: v }))}
              options={meta?.states || []}
            />

            {/* Warning Type */}
            <FilterSelect
              label="Warning Signal Type"
              value={draftAlertFilters.warningType || 'ALL'}
              onChange={(v) => setDraftAlertFilters(prev => ({ ...prev, warningType: v }))}
              options={[
                { value: 'Cost Overrun', label: 'Cost Overrun' },
                { value: 'Schedule Slippage', label: 'Schedule Slippage' },
                { value: 'Progress Stagnation', label: 'Progress Stagnation' },
                { value: 'Expenditure / Progress Divergence', label: 'Expenditure Divergence' },
                { value: 'Financial Inaction', label: 'Financial Inaction' },
              ]}
            />

            {/* Warning Severity */}
            <FilterSelect
              label="Trigger Severity"
              value={draftAlertFilters.severity || 'ALL'}
              onChange={(v) => setDraftAlertFilters(prev => ({ ...prev, severity: v }))}
              options={[
                { value: 'CRITICAL', label: 'Critical' },
                { value: 'HIGH', label: 'High' },
                { value: 'MODERATE', label: 'Moderate' },
                { value: 'LOW', label: 'Low' },
              ]}
            />

            {/* Persistence Duration */}
            <FilterSelect
              label="Persistence Duration"
              value={draftAlertFilters.persistence || 'ALL'}
              onChange={(v) => setDraftAlertFilters(prev => ({ ...prev, persistence: v }))}
              options={[
                { value: 'NEW', label: 'Newly Triggered (≤ 1 mo)' },
                { value: 'PERSISTENT_2M', label: 'Persistent ≥ 2 Months' },
                { value: 'PERSISTENT_3M', label: 'Persistent ≥ 3 Months' },
                { value: 'PERSISTENT_6M', label: 'Persistent ≥ 6 Months' },
              ]}
            />

            {/* Overall Risk Band */}
            <FilterSelect
              label="Project Risk Band"
              value={draftAlertFilters.riskBand || 'ALL'}
              onChange={(v) => setDraftAlertFilters(prev => ({ ...prev, riskBand: v }))}
              options={[
                { value: 'CRITICAL', label: 'Critical Risk' },
                { value: 'HIGH', label: 'High Risk' },
                { value: 'MODERATE', label: 'Moderate Risk' },
                { value: 'LOW', label: 'Low Risk' },
              ]}
            />

            {/* Intervention Relationship */}
            <FilterSelect
              label="Intervention Relationship"
              value={draftAlertFilters.interventionStatus || 'ALL'}
              onChange={(v) => setDraftAlertFilters(prev => ({ ...prev, interventionStatus: v }))}
              options={[
                { value: 'CANDIDATE', label: 'Intervention Required / Candidate' },
                { value: 'NONE', label: 'No Intervention Opened' },
                { value: 'OPEN', label: 'Intervention Active / Open' },
                { value: 'UNDER_REVIEW', label: 'Under Review' },
                { value: 'ACTION_INITIATED', label: 'Action Initiated' },
                { value: 'MONITORING', label: 'Monitoring' },
                { value: 'RESOLVED', label: 'Resolved' },
              ]}
            />
          </AnalyticalFilterPanel>

          {/* INITIAL UNQUERIED LANDING STATE */}
          {!hasAppliedAlerts && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-950/60 border border-blue-800 text-blue-400 flex items-center justify-center mx-auto">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-semibold text-white">Define Scope & Apply Criteria</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Early warning alerts are derived from deterministic project telemetry spanning cost escalation, schedule slippage, physical stagnation, and physical-financial divergence.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Configure criteria in the filter panel above or select a quick preset to isolate projects requiring investigation.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {alertPresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={preset.onApply}
                    className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
                  >
                    {preset.label} →
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* APPLIED RESULTS SECTION */}
          {hasAppliedAlerts && (
            <div className="space-y-4">

              {/* Filtered KPI Snapshot */}
              {alertSummary && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
                    <p className="text-[11px] font-medium text-slate-400">Matching Projects</p>
                    <p className="text-lg font-bold text-white mt-0.5">{alertSummary.matchingProjects.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Unique entities flagged</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
                    <p className="text-[11px] font-medium text-slate-400">Active Warning Signals</p>
                    <p className="text-lg font-bold text-amber-400 mt-0.5">{alertSummary.activeWarnings.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Total rule triggers</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
                    <p className="text-[11px] font-medium text-slate-400">Critical Signals</p>
                    <p className="text-lg font-bold text-rose-400 mt-0.5">{alertSummary.criticalSignals.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Urgent severity</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
                    <p className="text-[11px] font-medium text-slate-400">Compound Risk</p>
                    <p className="text-lg font-bold text-orange-400 mt-0.5">{alertSummary.multiWarningProjects.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">≥ 2 concurrent alerts</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
                    <p className="text-[11px] font-medium text-slate-400">Intervention Candidates</p>
                    <p className="text-lg font-bold text-blue-400 mt-0.5">{alertSummary.interventionCandidates.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Priority score ≥ 50</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
                    <p className="text-[11px] font-medium text-slate-400">Active Interventions</p>
                    <p className="text-lg font-bold text-emerald-400 mt-0.5">{alertSummary.activeInterventions.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Workflow in progress</p>
                  </div>
                </div>
              )}

              {/* Context Summary Sentence */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  Showing <strong className="text-slate-200">{alerts.length}</strong> alerts across <strong className="text-slate-200">{alertSummary?.matchingProjects || 0}</strong> projects ({alertTotal.toLocaleString()} total warning records matching cohort)
                </span>
                <span className="text-[11px] text-slate-500">
                  Ordered by persistence duration & intervention priority
                </span>
              </div>

              {/* Error Message */}
              {alertError && (
                <div className="bg-rose-950/40 border border-rose-800 rounded-lg p-4 text-xs text-rose-300 flex items-center justify-between">
                  <span>{alertError}</span>
                  <button onClick={() => fetchAlerts(appliedAlertFilters)} className="underline hover:text-white font-semibold">
                    Retry
                  </button>
                </div>
              )}

              {/* Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 border-b border-slate-800 uppercase text-[11px] font-semibold text-slate-400">
                      <tr>
                        <th className="px-4 py-2.5">Project ID & Name</th>
                        <th className="px-4 py-2.5">Administrative Scope</th>
                        <th className="px-4 py-2.5">Warning Signal</th>
                        <th className="px-4 py-2.5 text-center">Severity</th>
                        <th className="px-4 py-2.5 text-center">Overall Risk</th>
                        <th className="px-4 py-2.5 text-right">Persistence</th>
                        <th className="px-4 py-2.5">Intervention Relationship</th>
                        <th className="px-4 py-2.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {loadingAlerts ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-slate-500">
                            Applying warning filters and retrieving project telemetry...
                          </td>
                        </tr>
                      ) : alerts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 space-y-2">
                            <p className="text-sm font-medium text-slate-400">No active warnings matched the selected criteria.</p>
                            <p className="text-xs text-slate-500">Try broadening your search or resetting restrictive filters.</p>
                            <button
                              onClick={handleResetAlertFilters}
                              className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
                            >
                              Reset Warning Filters
                            </button>
                          </td>
                        </tr>
                      ) : (
                        alerts.map((a) => (
                          <tr key={a.alertId} className="hover:bg-slate-800/40 transition">
                            <td className="px-4 py-2.5 max-w-xs">
                              <div className="font-mono text-[11px] text-slate-400">{a.projectId}</div>
                              <div className="font-medium text-white truncate" title={a.projectName}>
                                {a.projectName}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-[11px] text-slate-400">
                              <div className="font-medium text-slate-300">{a.sectorName}</div>
                              <div className="truncate max-w-[160px]" title={a.ministryName}>{a.ministryName}</div>
                              <div>{a.stateName}</div>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="font-semibold text-slate-200">{a.warningType}</div>
                              <div className="text-[11px] text-slate-400 max-w-xs truncate" title={a.triggerCondition}>
                                {a.triggerCondition}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <SeverityBadge severity={a.severity} />
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <RiskBadge band={a.riskBand || 'LOW'} />
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono">
                              <span className={a.persistencePeriods >= 3 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                                {a.persistencePeriods} mo{a.persistencePeriods > 1 ? 's' : ''}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="text-xs">
                                <StatusChip status={a.projectInterventionStatus || 'PENDING_REVIEW'} />
                              </div>
                              <div className="text-[11px] text-slate-400 max-w-xs truncate mt-0.5" title={a.recommendedIntervention}>
                                {a.recommendedIntervention || 'Milestone review recommended'}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setModalProject({
                                      projectId: a.projectId,
                                      projectName: a.projectName,
                                      sectorName: a.sectorName,
                                      ministryName: a.ministryName,
                                      agencyName: a.agencyName,
                                      stateName: a.stateName,
                                      reportingMonth: a.reportingMonth,
                                      interventionPriorityScore: a.interventionPriorityScore,
                                      recommendedIntervention: a.recommendedIntervention,
                                      interventionStatus: a.projectInterventionStatus || 'UNDER_REVIEW',
                                      responsibleAuthority: a.ministryName,
                                      plannedDate: '',
                                      actualStartDate: '',
                                      followUpDate: '',
                                      latestActionNotes: ''
                                    });
                                    setNewStatus(a.projectInterventionStatus || 'UNDER_REVIEW');
                                    setNewNotes('');
                                  }}
                                  className="px-2.5 py-1 bg-amber-600/80 hover:bg-amber-600 text-white rounded text-[11px] font-semibold transition"
                                >
                                  Triage
                                </button>
                                <button
                                  onClick={() => navigate(`/projects/${a.projectId}`)}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] border border-slate-700 transition"
                                  title="Open Project Intelligence"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Server-aware pagination */}
                {alerts.length > 0 && (
                  <Pagination
                    page={appliedAlertFilters.page || 1}
                    totalPages={alertTotalPages}
                    total={alertTotal}
                    size={20}
                    onPageChange={handleAlertPageChange}
                  />
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTERVENTION WORKFLOW                                              */}
      {/* ========================================================================= */}
      {tab === 'interventions' && (
        <div className="space-y-6">
          
          {/* Analytical Filter Panel for Interventions */}
          <AnalyticalFilterPanel
            title="Intervention Workflow Scope"
            subtitle="Track warned projects undergoing active administrative remediation, committee review, milestone recovery, and resolution."
            onApply={handleApplyIntFilters}
            onReset={handleResetIntFilters}
            loading={loadingInt}
            hasUnsavedChanges={hasUnsavedInt}
            applyButtonLabel="Apply Intervention Filters"
            activeChips={intChips}
            onClearAllChips={handleResetIntFilters}
            totalMatching={intTotal}
            entityLabel="interventions"
          >
            {/* Search Input */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Project Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search intervention by project name or ID..."
                  value={draftIntFilters.search || ''}
                  onChange={(e) => setDraftIntFilters(prev => ({ ...prev, search: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleApplyIntFilters(); }}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Sector */}
            <FilterSelect
              label="Infrastructure Sector"
              value={draftIntFilters.sector || 'ALL'}
              onChange={(v) => setDraftIntFilters(prev => ({ ...prev, sector: v }))}
              options={meta?.sectors || []}
            />

            {/* Ministry */}
            <FilterSelect
              label="Administrative Ministry"
              value={draftIntFilters.ministry || 'ALL'}
              onChange={(v) => setDraftIntFilters(prev => ({ ...prev, ministry: v }))}
              options={meta?.ministries || []}
            />

            {/* State / UT */}
            <FilterSelect
              label="State / Union Territory"
              value={draftIntFilters.state || 'ALL'}
              onChange={(v) => setDraftIntFilters(prev => ({ ...prev, state: v }))}
              options={meta?.states || []}
            />

            {/* Risk Band */}
            <FilterSelect
              label="Project Risk Band"
              value={draftIntFilters.riskBand || 'ALL'}
              onChange={(v) => setDraftIntFilters(prev => ({ ...prev, riskBand: v }))}
              options={[
                { value: 'CRITICAL', label: 'Critical Risk' },
                { value: 'HIGH', label: 'High Risk' },
                { value: 'MODERATE', label: 'Moderate Risk' },
                { value: 'LOW', label: 'Low Risk' },
              ]}
            />

            {/* Workflow Lifecycle Status */}
            <FilterSelect
              label="Lifecycle Status"
              value={draftIntFilters.status || 'ALL'}
              onChange={(v) => setDraftIntFilters(prev => ({ ...prev, status: v }))}
              options={[
                { value: 'UNDER_REVIEW', label: 'Under Review' },
                { value: 'ACTION_INITIATED', label: 'Action Initiated' },
                { value: 'MONITORING', label: 'Monitoring' },
                { value: 'RESOLVED', label: 'Resolved' },
              ]}
            />

            {/* Sort Metric */}
            <FilterSelect
              label="Sort Interventions By"
              value={draftIntFilters.sortBy || 'priority'}
              onChange={(v) => setDraftIntFilters(prev => ({ ...prev, sortBy: v }))}
              options={[
                { value: 'priority', label: 'Priority Score (Highest)' },
                { value: 'cost', label: 'Revised Outlay (Highest)' },
                { value: 'delay', label: 'Schedule Delay (Longest)' },
                { value: 'name', label: 'Project Name (A-Z)' },
              ]}
            />
          </AnalyticalFilterPanel>

          {/* Horizontal Lifecycle Stage Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'UNDER_REVIEW', title: 'Under Review', count: stageCounts.UNDER_REVIEW, color: 'text-purple-400 border-purple-800' },
              { id: 'ACTION_INITIATED', title: 'Action Initiated', count: stageCounts.ACTION_INITIATED, color: 'text-amber-400 border-amber-800' },
              { id: 'MONITORING', title: 'Monitoring', count: stageCounts.MONITORING, color: 'text-blue-400 border-blue-800' },
              { id: 'RESOLVED', title: 'Resolved', count: stageCounts.RESOLVED, color: 'text-emerald-400 border-emerald-800' },
            ].map(stage => {
              const isActive = appliedIntFilters.status === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => {
                    const nextStatus = isActive ? 'ALL' : stage.id;
                    const updated = { ...appliedIntFilters, status: nextStatus, page: 1 };
                    setDraftIntFilters(updated);
                    setAppliedIntFilters(updated);
                    syncUrl('interventions', appliedAlertFilters, updated);
                    fetchInterventions(updated);
                  }}
                  className={`p-3 rounded-lg border text-left transition flex items-center justify-between ${
                    isActive 
                      ? 'bg-slate-800 border-blue-500 shadow-md ring-1 ring-blue-500' 
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <p className="text-[11px] font-medium text-slate-400">{stage.title}</p>
                    <p className={`text-lg font-bold mt-0.5 ${stage.color.split(' ')[0]}`}>{stage.count.toLocaleString()}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              );
            })}
          </div>

          {/* Error Message */}
          {intError && (
            <div className="bg-rose-950/40 border border-rose-800 rounded-lg p-4 text-xs text-rose-300 flex items-center justify-between">
              <span>{intError}</span>
              <button onClick={() => fetchInterventions(appliedIntFilters)} className="underline hover:text-white font-semibold">
                Retry
              </button>
            </div>
          )}

          {/* Interventions Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 uppercase text-[11px] font-semibold text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5">Project ID & Name</th>
                    <th className="px-4 py-2.5">Administrative Entity</th>
                    <th className="px-4 py-2.5">Recommended Measure</th>
                    <th className="px-4 py-2.5 text-center">Lifecycle Status</th>
                    <th className="px-4 py-2.5 text-right">Priority Score</th>
                    <th className="px-4 py-2.5">Latest Action Notes</th>
                    <th className="px-4 py-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loadingInt ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        Loading interventions and operational log...
                      </td>
                    </tr>
                  ) : interventions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 space-y-2">
                        <p className="text-sm font-medium text-slate-400">No intervention records matched the selected criteria.</p>
                        <p className="text-xs text-slate-500">Modify filters to view other operational remediation records.</p>
                        <button
                          onClick={handleResetIntFilters}
                          className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
                        >
                          Reset Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    interventions.map((iv) => (
                      <tr key={iv.projectId} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-2.5 max-w-xs">
                          <div className="font-mono text-[11px] text-slate-400">{iv.projectId}</div>
                          <div className="font-medium text-white truncate" title={iv.projectName}>
                            {iv.projectName}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-slate-400">
                          <div className="font-medium text-slate-300">{iv.responsibleAuthority || iv.ministryName}</div>
                          <div>{iv.sectorName} · {iv.stateName}</div>
                        </td>
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
                          {iv.latestActionNotes || 'No notes logged yet'}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setModalProject(iv);
                                setNewStatus(iv.interventionStatus);
                                setNewNotes(iv.latestActionNotes || '');
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-[11px] border border-slate-700 font-medium transition"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => navigate(`/projects/${iv.projectId}`)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] border border-slate-700 transition"
                              title="Open Project Intelligence"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Server-aware pagination */}
            {interventions.length > 0 && (
              <Pagination
                page={appliedIntFilters.page || 1}
                totalPages={intTotalPages}
                total={intTotal}
                size={20}
                onPageChange={handleIntPageChange}
              />
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERVENTION UPDATE / TRANSITION MODAL                                    */}
      {/* ========================================================================= */}
      {modalProject && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-blue-400" />
                Update Intervention Workflow Status
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{modalProject.projectName} ({modalProject.projectId})</p>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">State Machine Lifecycle Transition</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ACTION_INITIATED">Action Initiated</option>
                <option value="MONITORING">Monitoring</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Action Notes / Directive Details</label>
              <textarea
                rows={3}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Log official meeting decisions, committee orders, or contractor directives..."
                className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setModalProject(null)}
                disabled={isUpdatingStatus}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Saving...' : 'Save Transition'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
