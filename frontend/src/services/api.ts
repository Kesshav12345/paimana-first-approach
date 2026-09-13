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
} from '../types';

const BASE_URL = '/api/v1';

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
  getProjectFilters: () => fetchJson<FilterMetadata>(`${BASE_URL}/projects/filters`),

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
  }) => {
    const sp = new URLSearchParams();
    if (params.search) sp.append('search', params.search);
    if (params.sector) sp.append('sector', params.sector);
    if (params.ministry) sp.append('ministry', params.ministry);
    if (params.state) sp.append('state', params.state);
    if (params.riskBand) sp.append('riskBand', params.riskBand);
    if (params.trajectory) sp.append('trajectory', params.trajectory);
    if (params.costFilter) sp.append('costFilter', params.costFilter);
    if (params.delayFilter) sp.append('delayFilter', params.delayFilter);
    if (params.warningFilter) sp.append('warningFilter', params.warningFilter);
    if (params.multiState) sp.append('multiState', params.multiState);
    if (params.sortBy) sp.append('sortBy', params.sortBy);
    sp.append('page', String(params.page || 1));
    sp.append('size', String(params.size || 20));
    return fetchJson<{ projects: ProjectSummary[]; page: number; size: number; total: number; totalPages: number }>(`${BASE_URL}/projects?${sp.toString()}`);
  },

  // Project Intelligence (15-area deep dive)
  getProjectIntelligence: (projectId: string) => fetchJson<ProjectDetail>(`${BASE_URL}/projects/${projectId}`),

  // Sector Analytics
  getSectors: (params?: {
    state?: string;
    ministry?: string;
    riskBand?: string;
    trajectory?: string;
    costFilter?: string;
    delayFilter?: string;
    warningFilter?: string;
    multiState?: string;
    sortBy?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params?.state && params.state !== 'ALL') sp.append('state', params.state);
    if (params?.ministry && params.ministry !== 'ALL') sp.append('ministry', params.ministry);
    if (params?.riskBand && params.riskBand !== 'ALL') sp.append('riskBand', params.riskBand);
    if (params?.trajectory && params.trajectory !== 'ALL') sp.append('trajectory', params.trajectory);
    if (params?.costFilter && params.costFilter !== 'ALL') sp.append('costFilter', params.costFilter);
    if (params?.delayFilter && params.delayFilter !== 'ALL') sp.append('delayFilter', params.delayFilter);
    if (params?.warningFilter && params.warningFilter !== 'ALL') sp.append('warningFilter', params.warningFilter);
    if (params?.multiState && params.multiState !== 'ALL') sp.append('multiState', params.multiState);
    if (params?.sortBy) sp.append('sortBy', params.sortBy);
    const qs = sp.toString();
    return fetchJson<SectorSummary[]>(`${BASE_URL}/sectors${qs ? `?${qs}` : ''}`);
  },
  getSectorStates: (sectorName: string) => fetchJson<Array<{ state_name: string; project_count: number; total_revised_cost_cr: number; avg_progress_pct: number; high_risk_count: number }>>(`${BASE_URL}/sectors/${encodeURIComponent(sectorName)}/states`),
  getSectorProjects: (sectorName: string, stateName?: string, page = 1, size = 20) => {
    const sp = new URLSearchParams();
    if (stateName) sp.append('state', stateName);
    sp.append('page', String(page));
    sp.append('size', String(size));
    return fetchJson<ProjectSummary[]>(`${BASE_URL}/sectors/${encodeURIComponent(sectorName)}/projects?${sp.toString()}`);
  },

  // Ministry Analytics
  getMinistries: () => fetchJson<MinistrySummary[]>(`${BASE_URL}/ministries`),
  getMinistryAgencies: (ministryName: string) => fetchJson<Array<{ agency_name: string; project_count: number; total_revised_cost_cr: number; avg_progress_pct: number; high_risk_count: number }>>(`${BASE_URL}/ministries/${encodeURIComponent(ministryName)}/agencies`),
  getMinistryProjects: (ministryName: string, agencyName?: string, page = 1, size = 20) => {
    const sp = new URLSearchParams();
    if (agencyName) sp.append('agency', agencyName);
    sp.append('page', String(page));
    sp.append('size', String(size));
    return fetchJson<ProjectSummary[]>(`${BASE_URL}/ministries/${encodeURIComponent(ministryName)}/projects?${sp.toString()}`);
  },

  // State Analytics
  getStates: () => fetchJson<StateSummary[]>(`${BASE_URL}/states`),
  getStateSectors: (stateName: string) => fetchJson<Array<{ sector_name: string; project_count: number; total_revised_cost_cr: number; avg_progress_pct: number; high_risk_count: number }>>(`${BASE_URL}/states/${encodeURIComponent(stateName)}/sectors`),
  getStateProjects: (stateName: string, sectorName?: string, page = 1, size = 20) => {
    const sp = new URLSearchParams();
    if (sectorName) sp.append('sector', sectorName);
    sp.append('page', String(page));
    sp.append('size', String(size));
    return fetchJson<ProjectSummary[]>(`${BASE_URL}/states/${encodeURIComponent(stateName)}/projects?${sp.toString()}`);
  },

  // Early Warning System
  getActiveAlerts: (params: { sector?: string; ministry?: string; state?: string; severity?: string; search?: string; page?: number; size?: number }) => {
    const sp = new URLSearchParams();
    if (params.sector) sp.append('sector', params.sector);
    if (params.ministry) sp.append('ministry', params.ministry);
    if (params.state) sp.append('state', params.state);
    if (params.severity) sp.append('severity', params.severity);
    if (params.search) sp.append('search', params.search);
    sp.append('page', String(params.page || 1));
    sp.append('size', String(params.size || 20));
    return fetchJson<{ alerts: EarlyWarningAlert[]; page: number; size: number; total: number; totalPages: number }>(`${BASE_URL}/early-warning/alerts?${sp.toString()}`);
  },
  getInterventions: (status?: string, page = 1, size = 20) => {
    const sp = new URLSearchParams();
    if (status) sp.append('status', status);
    sp.append('page', String(page));
    sp.append('size', String(size));
    return fetchJson<Intervention[]>(`${BASE_URL}/early-warning/interventions?${sp.toString()}`);
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
};
