import type {
  ApiResponse,
  PortfolioSummary,
  ProjectSummary,
  ProjectDetail,
  SectorSummary,
  MinistrySummary,
  StateSummary,
  EarlyWarningAlert,
  Intervention,
  OperationsStatus,
  FilterMetadata,
  AnalyticalFilterParams,
  EarlyWarningFilterParams,
  EarlyWarningSummary,
  InterventionFilterParams,
} from '../types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') : '') + '/api/v1';

function appendAnalyticalFilters(sp: URLSearchParams, params?: AnalyticalFilterParams) {
  if (!params) return;
  if (params.state && params.state !== 'ALL') sp.append('state', params.state);
  if (params.ministry && params.ministry !== 'ALL') sp.append('ministry', params.ministry);
  if (params.sector && params.sector !== 'ALL') sp.append('sector', params.sector);
  if (params.riskBand && params.riskBand !== 'ALL') sp.append('riskBand', params.riskBand);
  if (params.trajectory && params.trajectory !== 'ALL') sp.append('trajectory', params.trajectory);
  if (params.costFilter && params.costFilter !== 'ALL') sp.append('costFilter', params.costFilter);
  if (params.delayFilter && params.delayFilter !== 'ALL') sp.append('delayFilter', params.delayFilter);
  if (params.warningFilter && params.warningFilter !== 'ALL') sp.append('warningFilter', params.warningFilter);
  if (params.multiState && params.multiState !== 'ALL') sp.append('multiState', params.multiState);
  if (params.sortBy) sp.append('sortBy', params.sortBy);
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const body = await res.json();
      if (body.message) errorMsg = body.message;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  const json: ApiResponse<T> = await res.json();
  if (!json.success && json.message) {
    throw new Error(json.message);
  }
  return json.data;
}

export const api = {
  // Home Portfolio Overview
  getHomeSummary: () => fetchJson<PortfolioSummary>(`${BASE_URL}/home`),

  // Filter Metadata
  getFilterMetadata: async () => {
    try {
      return await fetchJson<FilterMetadata>(`${BASE_URL}/metadata/filters`);
    } catch {
      return await fetchJson<FilterMetadata>(`${BASE_URL}/projects/filters`);
    }
  },
  getProjectFilters: async () => {
    try {
      return await fetchJson<FilterMetadata>(`${BASE_URL}/metadata/filters`);
    } catch {
      return await fetchJson<FilterMetadata>(`${BASE_URL}/projects/filters`);
    }
  },

  // Projects & Multi-Dimensional Search
  searchProjects: (params: {
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
    page?: number;
    size?: number;
  }) => api.getProjects(params),
  getProjects: (params: {
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
    page?: number;
    size?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params.search) sp.append('search', params.search);
    if (params.sector && params.sector !== 'ALL') sp.append('sector', params.sector);
    if (params.ministry && params.ministry !== 'ALL') sp.append('ministry', params.ministry);
    if (params.state && params.state !== 'ALL') sp.append('state', params.state);
    if (params.riskBand && params.riskBand !== 'ALL') sp.append('riskBand', params.riskBand);
    if (params.trajectory && params.trajectory !== 'ALL') sp.append('trajectory', params.trajectory);
    if (params.costFilter && params.costFilter !== 'ALL') sp.append('costFilter', params.costFilter);
    if (params.delayFilter && params.delayFilter !== 'ALL') sp.append('delayFilter', params.delayFilter);
    if (params.warningFilter && params.warningFilter !== 'ALL') sp.append('warningFilter', params.warningFilter);
    if (params.multiState && params.multiState !== 'ALL') sp.append('multiState', params.multiState);
    if (params.sortBy) sp.append('sortBy', params.sortBy);
    sp.append('page', String(params.page || 1));
    sp.append('size', String(params.size || 20));
    return fetchJson<{ projects: ProjectSummary[]; page: number; size: number; total: number; totalPages: number }>(`${BASE_URL}/projects?${sp.toString()}`);
  },

  // Project Intelligence (15-area deep dive)
  getProjectIntelligence: (projectId: string) => fetchJson<ProjectDetail>(`${BASE_URL}/projects/${projectId}`),

  // Sector Analytics
  getSectors: (params?: AnalyticalFilterParams) => {
    const sp = new URLSearchParams();
    appendAnalyticalFilters(sp, params);
    const qs = sp.toString();
    return fetchJson<SectorSummary[]>(`${BASE_URL}/sectors${qs ? `?${qs}` : ''}`);
  },
  getSectorStates: (sectorName: string, filters?: AnalyticalFilterParams) => {
    const sp = new URLSearchParams();
    appendAnalyticalFilters(sp, filters);
    const qs = sp.toString();
    return fetchJson<Array<{ state_name: string; project_count: number; total_revised_cost_cr: number; avg_progress_pct: number; high_risk_count: number }>>(`${BASE_URL}/sectors/${encodeURIComponent(sectorName)}/states${qs ? `?${qs}` : ''}`);
  },
  getSectorProjects: (sectorName: string, stateName?: string, page = 1, size = 20, filters?: AnalyticalFilterParams) => {
    const sp = new URLSearchParams();
    appendAnalyticalFilters(sp, filters);
    if (stateName && stateName !== 'ALL') {
      sp.set('state', stateName);
    } else if (stateName === 'ALL') {
      sp.delete('state');
    }
    sp.set('page', String(page));
    sp.set('size', String(size));
    return fetchJson<ProjectSummary[]>(`${BASE_URL}/sectors/${encodeURIComponent(sectorName)}/projects?${sp.toString()}`);
  },

  // Ministry Analytics
  getMinistries: (params?: AnalyticalFilterParams) => {
    const sp = new URLSearchParams();
    appendAnalyticalFilters(sp, params);
    const qs = sp.toString();
    return fetchJson<MinistrySummary[]>(`${BASE_URL}/ministries${qs ? `?${qs}` : ''}`);
  },
  getMinistryAgencies: (ministryName: string, filters?: AnalyticalFilterParams) => {
    const sp = new URLSearchParams();
    appendAnalyticalFilters(sp, filters);
    const qs = sp.toString();
    return fetchJson<Array<{ agency_name: string; project_count: number; total_revised_cost_cr: number; avg_progress_pct: number; high_risk_count: number }>>(`${BASE_URL}/ministries/${encodeURIComponent(ministryName)}/agencies${qs ? `?${qs}` : ''}`);
  },
  getMinistryProjects: (ministryName: string, agencyName?: string, page = 1, size = 20, filters?: AnalyticalFilterParams) => {
    const sp = new URLSearchParams();
    appendAnalyticalFilters(sp, filters);
    if (agencyName && agencyName !== 'ALL') {
      sp.set('agency', agencyName);
    } else if (agencyName === 'ALL') {
      sp.delete('agency');
    }
    sp.set('page', String(page));
    sp.set('size', String(size));
    return fetchJson<ProjectSummary[]>(`${BASE_URL}/ministries/${encodeURIComponent(ministryName)}/projects?${sp.toString()}`);
  },

  // State Analytics
  getStates: (params?: AnalyticalFilterParams) => {
    const sp = new URLSearchParams();
    appendAnalyticalFilters(sp, params);
    const qs = sp.toString();
    return fetchJson<StateSummary[]>(`${BASE_URL}/states${qs ? `?${qs}` : ''}`);
  },
  getStateSectors: (stateName: string, filters?: AnalyticalFilterParams) => {
    const sp = new URLSearchParams();
    appendAnalyticalFilters(sp, filters);
    const qs = sp.toString();
    return fetchJson<Array<{ sector_name: string; project_count: number; total_revised_cost_cr: number; avg_progress_pct: number; high_risk_count: number }>>(`${BASE_URL}/states/${encodeURIComponent(stateName)}/sectors${qs ? `?${qs}` : ''}`);
  },
  getStateProjects: (stateName: string, sectorName?: string, page = 1, size = 20, filters?: AnalyticalFilterParams) => {
    const sp = new URLSearchParams();
    appendAnalyticalFilters(sp, filters);
    if (sectorName && sectorName !== 'ALL') {
      sp.set('sector', sectorName);
    } else if (sectorName === 'ALL') {
      sp.delete('sector');
    }
    sp.set('page', String(page));
    sp.set('size', String(size));
    return fetchJson<ProjectSummary[]>(`${BASE_URL}/states/${encodeURIComponent(stateName)}/projects?${sp.toString()}`);
  },

  // Early Warning System
  getActiveAlerts: (params: EarlyWarningFilterParams) => {
    const sp = new URLSearchParams();
    if (params.sector && params.sector !== 'ALL') sp.append('sector', params.sector);
    if (params.ministry && params.ministry !== 'ALL') sp.append('ministry', params.ministry);
    if (params.state && params.state !== 'ALL') sp.append('state', params.state);
    if (params.severity && params.severity !== 'ALL') sp.append('severity', params.severity);
    if (params.warningType && params.warningType !== 'ALL') sp.append('warningType', params.warningType);
    if (params.persistence && params.persistence !== 'ALL') sp.append('persistence', params.persistence);
    if (params.riskBand && params.riskBand !== 'ALL') sp.append('riskBand', params.riskBand);
    if (params.interventionStatus && params.interventionStatus !== 'ALL') sp.append('interventionStatus', params.interventionStatus);
    if (params.search) sp.append('search', params.search);
    sp.append('page', String(params.page || 1));
    sp.append('size', String(params.size || 20));
    return fetchJson<{ alerts: EarlyWarningAlert[]; page: number; size: number; total: number; totalPages: number }>(`${BASE_URL}/early-warning/alerts?${sp.toString()}`);
  },
  getEarlyWarningSummary: (params?: EarlyWarningFilterParams) => {
    const sp = new URLSearchParams();
    if (params?.sector && params.sector !== 'ALL') sp.append('sector', params.sector);
    if (params?.ministry && params.ministry !== 'ALL') sp.append('ministry', params.ministry);
    if (params?.state && params.state !== 'ALL') sp.append('state', params.state);
    if (params?.severity && params.severity !== 'ALL') sp.append('severity', params.severity);
    if (params?.warningType && params.warningType !== 'ALL') sp.append('warningType', params.warningType);
    if (params?.persistence && params.persistence !== 'ALL') sp.append('persistence', params.persistence);
    if (params?.riskBand && params.riskBand !== 'ALL') sp.append('riskBand', params.riskBand);
    if (params?.interventionStatus && params.interventionStatus !== 'ALL') sp.append('interventionStatus', params.interventionStatus);
    if (params?.search) sp.append('search', params.search);
    const qs = sp.toString();
    return fetchJson<EarlyWarningSummary>(`${BASE_URL}/early-warning/summary${qs ? `?${qs}` : ''}`);
  },
  getInterventions: (params?: InterventionFilterParams | string, page = 1, size = 20) => {
    const sp = new URLSearchParams();
    if (typeof params === 'string') {
      if (params && params !== 'ALL') sp.append('status', params);
      sp.append('page', String(page));
      sp.append('size', String(size));
    } else if (params) {
      if (params.sector && params.sector !== 'ALL') sp.append('sector', params.sector);
      if (params.ministry && params.ministry !== 'ALL') sp.append('ministry', params.ministry);
      if (params.state && params.state !== 'ALL') sp.append('state', params.state);
      if (params.riskBand && params.riskBand !== 'ALL') sp.append('riskBand', params.riskBand);
      if (params.status && params.status !== 'ALL') sp.append('status', params.status);
      if (params.search) sp.append('search', params.search);
      if (params.sortBy) sp.append('sortBy', params.sortBy);
      sp.append('page', String(params.page || page));
      sp.append('size', String(params.size || size));
    } else {
      sp.append('page', String(page));
      sp.append('size', String(size));
    }
    return fetchJson<{ interventions: Intervention[]; page: number; size: number; total: number; totalPages: number }>(`${BASE_URL}/early-warning/interventions?${sp.toString()}`);
  },
  updateInterventionStatus: (projectId: string, status: string, notes: string) => {
    return fetchJson<boolean>(`${BASE_URL}/early-warning/interventions/${projectId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
  },

  // Operations Dashboard & Live Ingestion Pipeline
  getOperationsStatus: () => fetchJson<OperationsStatus>(`${BASE_URL}/operations/status`),

  triggerIntelligenceRefresh: async (file: File, reportingMonth?: string, forceReprocess?: boolean) => {
    const formData = new FormData();
    formData.append('file', file);
    if (reportingMonth) formData.append('reporting_month', reportingMonth);
    if (forceReprocess) formData.append('force_reprocess', 'true');

    const res = await fetch(`${BASE_URL}/operations/intelligence-refresh`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error(`Intelligence refresh initiation failed with status ${res.status}`);
    const json = await res.json();
    return json.data;
  },

  getJobProgress: (jobId: string) => fetchJson<any>(`${BASE_URL}/operations/jobs/${jobId}`),

  getRecentPipelineRuns: (limit = 10) => fetchJson<any[]>(`${BASE_URL}/operations/recent-runs?limit=${limit}`),

  refreshExternalIntelligence: (scope = 'AFFECTED', limit = 15) => fetchJson<any>(`${BASE_URL}/operations/refresh-external-intelligence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scope, limit })
  }),

  recalculateDerivedValues: () => fetchJson<any>(`${BASE_URL}/operations/recalculate-derived`, { method: 'POST' }),

  uploadPdf: async (file: File, reportingMonth?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (reportingMonth) formData.append('reporting_month', reportingMonth);

    const res = await fetch(`${BASE_URL}/operations/upload-pdf`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);
    const json = await res.json();
    return json.data;
  },

  triggerRetrain: () => fetchJson<any>(`${BASE_URL}/operations/retrain`, { method: 'POST' }),
  promoteModel: () => fetchJson<any>(`${BASE_URL}/operations/promote`, { method: 'POST' }),
  refreshPredictions: () => fetchJson<any>(`${BASE_URL}/operations/refresh`, { method: 'POST' }),

  // Methodology & Architecture Telemetry
  getMethodologySummary: () => fetchJson<any>(`${BASE_URL}/methodology/summary`),
};

