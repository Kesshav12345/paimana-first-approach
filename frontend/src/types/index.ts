export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PortfolioSummary {
  totalProjects: number;
  totalOriginalCostCr: number;
  totalRevisedCostCr: number;
  totalCumulativeExpenditureCr: number;
  portfolioCostEscalationPct: number;
  portfolioExpenditurePct: number;
  averagePhysicalProgressPct: number;
  delayedProjectsCount: number;
  projectsRequiringAttentionCount: number;
  criticalRiskCount: number;
  highRiskCount: number;
  moderateRiskCount: number;
  lowRiskCount: number;
  activeWarningsCount: number;
  latestReportingPeriod: string;
  stateDistribution: Array<{
    state_name: string;
    project_count: number;
    total_investment_cr: number;
    high_risk_count: number;
    critical_risk_count: number;
    active_warning_count: number;
  }>;
  recentChanges: Array<{
    project_id: string;
    project_name: string;
    sector_name: string;
    risk_band: string;
    risk_trajectory: string;
    overall_risk_score: number;
    active_warning_count: number;
  }>;
}

export interface ProjectSummary {
  projectId: string;
  projectName: string;
  sectorName: string;
  ministryName: string;
  agencyName: string;
  stateName: string;
  multiState: boolean;
  originalCostCr: number;
  latestRevisedCostCr: number;
  cumulativeExpenditureCr: number;
  physicalProgressPct: number;
  costEscalationPct: number;
  scheduleSlippageMonths: number;
  overallRiskScore: number;
  riskBand: string;
  riskTrajectory: string;
  activeWarningCount: number;
  interventionPriorityScore: number;
  interventionRecommendation: string;
  latestReportingMonth: string;
}

export interface EarlyWarningAlert {
  alertId: string;
  projectId: string;
  projectName: string;
  sectorName: string;
  ministryName: string;
  agencyName: string;
  stateName: string;
  reportingMonth: string;
  warningType: string;
  severity: string;
  riskBand: string;
  triggerCondition: string;
  triggerValue: number;
  thresholdValue: number;
  alertStatus: string;
  persistencePeriods: number;
  firstTriggerDate: string;
  lastTriggerDate: string;
  interventionPriorityScore: number;
  recommendedIntervention: string;
  projectInterventionStatus?: string;
}

export interface Intervention {
  projectId: string;
  projectName: string;
  sectorName: string;
  ministryName: string;
  agencyName: string;
  stateName: string;
  reportingMonth: string;
  interventionPriorityScore: number;
  recommendedIntervention: string;
  interventionStatus: string;
  responsibleAuthority: string;
  plannedDate: string;
  actualStartDate: string;
  followUpDate: string;
  latestActionNotes: string;
}

export interface ProjectCostRevision {
  revisionId?: number;
  projectId: string;
  revisionSequence: number;
  revisionYear: string;
  approvalDate?: string;
  revisionTitle: string;
  sanctionedCostCr: number;
  approvingAuthority: string;
  targetDoc?: string;
  scopeAndReasons: string;
}

export interface ProjectDetail {
  projectId: string;
  legacyOcmsCode?: string;
  pmgid?: string;
  projectName: string;
  sectorName: string;
  ministryName: string;
  agencyName: string;
  stateName: string;
  multiState: boolean;
  projectLifecycleStatus: string;
  latestReportingMonth: string;

  originalCostCr: number;
  latestRevisedCostCr: number;
  cumulativeExpenditureCr: number;
  physicalProgressPct: number;
  financialProgressPct: number;
  physicalFinancialGap: number;
  costEscalationAmountCr: number;
  costEscalationPct: number;
  costGrowthFactor: number;
  remainingFinancialExposureCr: number;
  originalApprovalDate?: string;
  actualStartDate?: string;
  originalDoc?: string;
  anticipatedDoc?: string;
  scheduleSlippageMonths: number;
  timeElapsedPct: number;
  timeRemainingPct: number;

  // Multi-tier Inception & Revision Audit Trail
  initialInceptionYear?: string;
  initialInceptionCostCr?: number;
  latestCabinetRaaCostCr?: number;
  costRevisions?: ProjectCostRevision[];

  overallRiskScore: number;
  riskBand: string;
  riskTrajectory: string;
  healthStatus: string;
  positiveSignals: string[];
  negativeSignals: string[];
  activeWarningCount: number;
  interventionPriorityScore?: number;

  costOverrunProbability: number;
  predictedFinalCostCr: number;
  predictedCostOverrunAmountCr: number;
  predictedCostOverrunPct: number;
  costForecastConfidence: string;

  scheduleOverrunProbability: number;
  predictedDelayMonths: number;
  predictedCompletionDate?: string;
  scheduleForecastConfidence: string;
  modelVersion: string;

  costRiskScore: number;
  scheduleRiskScore: number;
  progressRiskScore: number;

  monthlyHistory: Array<{
    reporting_month: string;
    physical_progress_pct: number;
    cumulative_expenditure_cr: number;
    revised_cost_cr: number;
    cost_escalation_pct: number;
    schedule_slippage_months: number;
    overall_risk_score: number;
  }>;

  activeWarnings: EarlyWarningAlert[];
  flaggingReasons: Array<{ signal_type: string; detail: string }>;
  riskDrivers: Array<{ feature: string; contribution: number; direction: string }>;
  peerBenchmark?: {
    peer_group: string;
    peer_count: number;
    peer_avg_progress: number;
    peer_avg_escalation: number;
    peer_avg_delay: number;
  };
  officialAttentionPriorities: Array<{ priority: string; area: string; evidence: string; recommendation: string }>;
  recommendedInterventions: Array<{ 
    measure: string; 
    reason: string; 
    responsible_authority: string; 
    priority: string;
    action_plan?: string;
    expected_impact?: string;
    evaluation_logic?: string;
  }>;
  interventions: Intervention[];
  interventionEffectivenessStatus: string;

  // Project-Level Internet Evidence & Causal Attribution Layer
  researchSummary?: ProjectResearchSummary;
  causalFactors?: ProjectCausalFactor[];
  evidenceClaims?: ProjectEvidenceClaim[];
  evidenceOutlook?: ProjectEvidenceOutlook;
  nonCufDatasets?: ProjectNonCufDataset[];
}

export interface ProjectResearchSummary {
  runId?: number;
  projectId: string;
  startedAt?: string;
  completedAt?: string;
  status: 'PENDING' | 'COMPLETED' | 'COMPLETED_WITH_LIMITATIONS' | 'REQUIRES_REVIEW' | 'FAILED_RESEARCH';
  modelUsed?: string;
  searchCount: number;
  sourceCount: number;
  evidenceCount: number;
  causalFactorCount: number;
  completenessScore: number;
  researchConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  causalConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  dataConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
  errorMessage?: string;
}

export interface ProjectCausalFactor {
  factorId?: number;
  projectId: string;
  category: string;
  factorTitle: string;
  factorDescription: string;
  startDate?: string;
  endDate?: string;
  status: 'UNRESOLVED' | 'RESOLVED' | 'PARTIALLY_RESOLVED';
  causalConfidence: 'DIRECT' | 'STRONG_INDIRECT' | 'ASSOCIATIVE' | 'SPECULATIVE';
  affectedPackages?: string;
  quantitativeConsequence?: string;
  unresolvedDetail?: string;
  evidenceCount: number;
}

export interface ProjectExternalSource {
  sourceId?: number;
  canonicalUrl: string;
  title: string;
  publisher?: string;
  publicationDate?: string;
  sourceType: string;
  sourceQuality: number;
  retrievedDate?: string;
}

export interface ProjectEvidenceClaim {
  evidenceId?: number;
  projectId: string;
  sourceId?: number;
  source?: ProjectExternalSource;
  claimText: string;
  eventDate?: string;
  publicationDate?: string;
  evidenceStrength: 'DIRECT' | 'STRONG_INDIRECT' | 'ASSOCIATIVE' | 'SPECULATIVE';
  causalConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  targetComponent: number;
  quantitativeSignal?: string;
  supportingMetric?: string;
  limitations?: string;
}

export interface ProjectEvidenceOutlook {
  forecastConcern: 'SUPPORTS_EXISTING_FORECAST' | 'MAY_INCREASE_DOWNSIDE_RISK' | 'LITTLE_EVIDENCE_OF_MATERIAL_IMPACT' | 'INSUFFICIENT_EVIDENCE';
  evidenceInterpretation: string;
  unresolvedRisks: string[];
  evidenceConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ProjectNonCufDataset {
  datasetName: string;
  category: string;
  isRelevant: boolean;
  whyRelevant: string;
  observationPeriod: string;
  sourceCitation: string;
  componentAffected: string;
}

export interface SectorSummary {
  sectorName: string;
  projectCount: number;
  totalOriginalCostCr: number;
  totalRevisedCostCr: number;
  totalCumulativeExpenditureCr: number;
  weightedCostEscalationPct: number;
  weightedExpenditurePct: number;
  avgPhysicalProgressPct: number;
  avgScheduleDelayMonths: number;
  highRiskCount: number;
  criticalRiskCount: number;
  activeWarningCount: number;
}


export interface MinistrySummary {
  ministryName: string;
  projectCount: number;
  totalOriginalCostCr: number;
  totalRevisedCostCr: number;
  totalCumulativeExpenditureCr: number;
  weightedCostEscalationPct: number;
  weightedExpenditurePct: number;
  avgPhysicalProgressPct: number;
  avgScheduleDelayMonths: number;
  highRiskCount: number;
  criticalRiskCount: number;
  activeWarningCount: number;
}

export interface StateSummary {
  stateName: string;
  projectCount: number;
  totalInvestmentCr: number;
  totalOriginalCostCr?: number;
  totalRevisedCostCr?: number;
  totalCumulativeExpenditureCr: number;
  weightedCostEscalationPct: number;
  weightedExpenditurePct: number;
  avgPhysicalProgressPct: number;
  avgScheduleDelayMonths: number;
  highRiskCount: number;
  criticalRiskCount: number;
  activeWarningCount: number;
}

export interface OperationsStatus {
  status: string;
  currentDatasetVersion: string;
  latestReportingPeriod: string;
  totalProjects: number;
  totalFacts: number;
  quarantineRecordsCount: number;
  activeModelVersion: string;
  candidateModelVersion?: string;
  lastPipelineRun: string;
  pipelineState: string;
  sourceDocuments: Array<{
    source_id: number;
    file_name: string;
    file_type: string;
    source_category: string;
    reporting_period: string;
    row_count: number;
    file_size_bytes: number;
    parsing_status: string;
    created_at: string;
  }>;
  quarantineSummary: Array<{
    error_type: string;
    error_severity: string;
    incident_count: number;
  }>;
  auditLogs: Array<{
    run_id: number;
    dataset_version: string;
    status: string;
    records_extracted: number;
    records_standardized: number;
    quarantine_count: number;
    execution_time_seconds: number;
    error_log?: string;
    created_at: string;
  }>;
}

export interface FilterMetadata {
  sectors: string[];
  ministries: string[];
  states: string[];
  riskBands: string[];
  trajectories: string[];
  costFilters: Array<{ id: string; label: string }>;
  delayFilters: Array<{ id: string; label: string }>;
  warningFilters: Array<{ id: string; label: string }>;
}

export interface PipelineJobProgress {
  job_id: string;
  trigger_type: string;
  report_file?: string;
  reporting_month?: string;
  stage: string;
  status: string;
  total_projects: number;
  affected_projects_count: number;
  researched_count: number;
  claims_count: number;
  conflicts_count: number;
  started_at?: string;
  completed_at?: string;
  elapsed_seconds: number;
  error_summary?: string;
  details?: Record<string, any>;
}

export interface PipelineRunHistoryItem {
  job_id: string;
  trigger_type: string;
  report_file?: string;
  reporting_month?: string;
  stage: string;
  status: string;
  affected_projects: number;
  researched_count: number;
  claims_count: number;
  conflicts_count: number;
  started_at?: string;
  completed_at?: string;
  elapsed_seconds: number;
}

export interface MethodologyMetadata {
  active_methodology_version: string;
  production_model_version: string;
  feature_version: string;
  latest_dataset_period: string;
  total_monitored_projects: number;
  total_canonical_facts: number;
  total_evidence_claims: number;
  total_external_sources: number;
  researched_projects_count: number;
  quarantine_records_count: number;
  last_intelligence_refresh: string;
  search_provider: string;
  model_family: string;
  system_status: string;
}

export interface AnalyticalFilterParams {
  state?: string;
  ministry?: string;
  sector?: string;
  riskBand?: string;
  trajectory?: string;
  costFilter?: string;
  delayFilter?: string;
  warningFilter?: string;
  multiState?: string;
  sortBy?: string;
}

export interface EarlyWarningFilterParams {
  sector?: string;
  ministry?: string;
  state?: string;
  agency?: string;
  warningType?: string;
  severity?: string;
  persistence?: string;
  riskBand?: string;
  interventionStatus?: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface EarlyWarningSummary {
  matchingProjects: number;
  activeWarnings: number;
  criticalSignals: number;
  multiWarningProjects: number;
  interventionCandidates: number;
  activeInterventions: number;
}

export interface InterventionFilterParams {
  sector?: string;
  ministry?: string;
  state?: string;
  agency?: string;
  riskBand?: string;
  warningType?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  page?: number;
  size?: number;
}


