package org.paimana.dto;

import java.util.List;
import java.util.Map;

public class ProjectDetailDto {
    // 1. Header & Identity
    private String projectId;
    private String legacyOcmsCode;
    private String pmgid;
    private String projectName;
    private String sectorName;
    private String ministryName;
    private String agencyName;
    private String stateName;
    private boolean isMultiState;
    private String projectLifecycleStatus;
    private String latestReportingMonth;

    // 2. Current Project Status
    private double originalCostCr;
    private double latestRevisedCostCr;
    private double cumulativeExpenditureCr;
    private double physicalProgressPct;
    private double financialProgressPct;
    private double physicalFinancialGap;
    private double costEscalationAmountCr;
    private double costEscalationPct;
    private double costGrowthFactor;
    private double remainingFinancialExposureCr;
    private String originalApprovalDate;
    private String actualStartDate;
    private String originalDoc;
    private String anticipatedDoc;
    private int scheduleSlippageMonths;
    private double timeElapsedPct;
    private double timeRemainingPct;

    // 3. Project Health Summary
    private double overallRiskScore;
    private String riskBand;
    private String riskTrajectory;
    private String healthStatus; // IMPROVING, STABLE, DETERIORATING
    private List<String> positiveSignals;
    private List<String> negativeSignals;
    private int activeWarningCount;
    private double interventionPriorityScore;

    // 4. Cost Forecast (Supervised ML)
    private double costOverrunProbability;
    private double predictedFinalCostCr;
    private double predictedCostOverrunAmountCr;
    private double predictedCostOverrunPct;
    private String costForecastConfidence;

    // 5. Schedule Forecast (Supervised ML)
    private double scheduleOverrunProbability;
    private double predictedDelayMonths;
    private String predictedCompletionDate;
    private String scheduleForecastConfidence;
    private String modelVersion;

    // 6. Overall Implementation Risk Decomposition
    private double costRiskScore;
    private double scheduleRiskScore;
    private double progressRiskScore;

    // 7. Risk & Performance Trajectory (Time-Series)
    private List<Map<String, Object>> monthlyHistory;

    // 8. Active Warnings & Early-Warning Triggers
    private List<EarlyWarningAlertDto> activeWarnings;

    // 9. Why Is the Project Being Flagged?
    private List<Map<String, String>> flaggingReasons;

    // 10. Key Risk Drivers (SHAP + Statistical)
    private List<Map<String, Object>> riskDrivers;

    // 11. Benchmark Against Similar Projects
    private Map<String, Object> peerBenchmark;

    // 12. Areas Requiring Official Attention
    private List<Map<String, String>> officialAttentionPriorities;

    // 13. Recommended Interventions
    private List<Map<String, String>> recommendedInterventions;

    // 14. Intervention Tracking & Progress
    private List<InterventionDto> interventions;

    // 15. Intervention Outcome & Effectiveness
    private String interventionEffectivenessStatus;

    // Getters and Setters
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public String getLegacyOcmsCode() { return legacyOcmsCode; }
    public void setLegacyOcmsCode(String legacyOcmsCode) { this.legacyOcmsCode = legacyOcmsCode; }
    public String getPmgid() { return pmgid; }
    public void setPmgid(String pmgid) { this.pmgid = pmgid; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public String getSectorName() { return sectorName; }
    public void setSectorName(String sectorName) { this.sectorName = sectorName; }
    public String getMinistryName() { return ministryName; }
    public void setMinistryName(String ministryName) { this.ministryName = ministryName; }
    public String getAgencyName() { return agencyName; }
    public void setAgencyName(String agencyName) { this.agencyName = agencyName; }
    public String getStateName() { return stateName; }
    public void setStateName(String stateName) { this.stateName = stateName; }
    public boolean isMultiState() { return isMultiState; }
    public void setMultiState(boolean multiState) { isMultiState = multiState; }
    public String getProjectLifecycleStatus() { return projectLifecycleStatus; }
    public void setProjectLifecycleStatus(String projectLifecycleStatus) { this.projectLifecycleStatus = projectLifecycleStatus; }
    public String getLatestReportingMonth() { return latestReportingMonth; }
    public void setLatestReportingMonth(String latestReportingMonth) { this.latestReportingMonth = latestReportingMonth; }
    public double getOriginalCostCr() { return originalCostCr; }
    public void setOriginalCostCr(double originalCostCr) { this.originalCostCr = originalCostCr; }
    public double getLatestRevisedCostCr() { return latestRevisedCostCr; }
    public void setLatestRevisedCostCr(double latestRevisedCostCr) { this.latestRevisedCostCr = latestRevisedCostCr; }
    public double getCumulativeExpenditureCr() { return cumulativeExpenditureCr; }
    public void setCumulativeExpenditureCr(double cumulativeExpenditureCr) { this.cumulativeExpenditureCr = cumulativeExpenditureCr; }
    public double getPhysicalProgressPct() { return physicalProgressPct; }
    public void setPhysicalProgressPct(double physicalProgressPct) { this.physicalProgressPct = physicalProgressPct; }
    public double getFinancialProgressPct() { return financialProgressPct; }
    public void setFinancialProgressPct(double financialProgressPct) { this.financialProgressPct = financialProgressPct; }
    public double getPhysicalFinancialGap() { return physicalFinancialGap; }
    public void setPhysicalFinancialGap(double physicalFinancialGap) { this.physicalFinancialGap = physicalFinancialGap; }
    public double getCostEscalationAmountCr() { return costEscalationAmountCr; }
    public void setCostEscalationAmountCr(double costEscalationAmountCr) { this.costEscalationAmountCr = costEscalationAmountCr; }
    public double getCostEscalationPct() { return costEscalationPct; }
    public void setCostEscalationPct(double costEscalationPct) { this.costEscalationPct = costEscalationPct; }
    public double getCostGrowthFactor() { return costGrowthFactor; }
    public void setCostGrowthFactor(double costGrowthFactor) { this.costGrowthFactor = costGrowthFactor; }
    public double getRemainingFinancialExposureCr() { return remainingFinancialExposureCr; }
    public void setRemainingFinancialExposureCr(double remainingFinancialExposureCr) { this.remainingFinancialExposureCr = remainingFinancialExposureCr; }
    public String getOriginalApprovalDate() { return originalApprovalDate; }
    public void setOriginalApprovalDate(String originalApprovalDate) { this.originalApprovalDate = originalApprovalDate; }
    public String getActualStartDate() { return actualStartDate; }
    public void setActualStartDate(String actualStartDate) { this.actualStartDate = actualStartDate; }
    public String getOriginalDoc() { return originalDoc; }
    public void setOriginalDoc(String originalDoc) { this.originalDoc = originalDoc; }
    public String getAnticipatedDoc() { return anticipatedDoc; }
    public void setAnticipatedDoc(String anticipatedDoc) { this.anticipatedDoc = anticipatedDoc; }
    public int getScheduleSlippageMonths() { return scheduleSlippageMonths; }
    public void setScheduleSlippageMonths(int scheduleSlippageMonths) { this.scheduleSlippageMonths = scheduleSlippageMonths; }
    public double getTimeElapsedPct() { return timeElapsedPct; }
    public void setTimeElapsedPct(double timeElapsedPct) { this.timeElapsedPct = timeElapsedPct; }
    public double getTimeRemainingPct() { return timeRemainingPct; }
    public void setTimeRemainingPct(double timeRemainingPct) { this.timeRemainingPct = timeRemainingPct; }
    public double getOverallRiskScore() { return overallRiskScore; }
    public void setOverallRiskScore(double overallRiskScore) { this.overallRiskScore = overallRiskScore; }
    public String getRiskBand() { return riskBand; }
    public void setRiskBand(String riskBand) { this.riskBand = riskBand; }
    public String getRiskTrajectory() { return riskTrajectory; }
    public void setRiskTrajectory(String riskTrajectory) { this.riskTrajectory = riskTrajectory; }
    public String getHealthStatus() { return healthStatus; }
    public void setHealthStatus(String healthStatus) { this.healthStatus = healthStatus; }
    public List<String> getPositiveSignals() { return positiveSignals; }
    public void setPositiveSignals(List<String> positiveSignals) { this.positiveSignals = positiveSignals; }
    public List<String> getNegativeSignals() { return negativeSignals; }
    public void setNegativeSignals(List<String> negativeSignals) { this.negativeSignals = negativeSignals; }
    public int getActiveWarningCount() { return activeWarningCount; }
    public void setActiveWarningCount(int activeWarningCount) { this.activeWarningCount = activeWarningCount; }
    public double getInterventionPriorityScore() { return interventionPriorityScore; }
    public void setInterventionPriorityScore(double interventionPriorityScore) { this.interventionPriorityScore = interventionPriorityScore; }
    public double getCostOverrunProbability() { return costOverrunProbability; }
    public void setCostOverrunProbability(double costOverrunProbability) { this.costOverrunProbability = costOverrunProbability; }
    public double getPredictedFinalCostCr() { return predictedFinalCostCr; }
    public void setPredictedFinalCostCr(double predictedFinalCostCr) { this.predictedFinalCostCr = predictedFinalCostCr; }
    public double getPredictedCostOverrunAmountCr() { return predictedCostOverrunAmountCr; }
    public void setPredictedCostOverrunAmountCr(double predictedCostOverrunAmountCr) { this.predictedCostOverrunAmountCr = predictedCostOverrunAmountCr; }
    public double getPredictedCostOverrunPct() { return predictedCostOverrunPct; }
    public void setPredictedCostOverrunPct(double predictedCostOverrunPct) { this.predictedCostOverrunPct = predictedCostOverrunPct; }
    public String getCostForecastConfidence() { return costForecastConfidence; }
    public void setCostForecastConfidence(String costForecastConfidence) { this.costForecastConfidence = costForecastConfidence; }
    public double getScheduleOverrunProbability() { return scheduleOverrunProbability; }
    public void setScheduleOverrunProbability(double scheduleOverrunProbability) { this.scheduleOverrunProbability = scheduleOverrunProbability; }
    public double getPredictedDelayMonths() { return predictedDelayMonths; }
    public void setPredictedDelayMonths(double predictedDelayMonths) { this.predictedDelayMonths = predictedDelayMonths; }
    public String getPredictedCompletionDate() { return predictedCompletionDate; }
    public void setPredictedCompletionDate(String predictedCompletionDate) { this.predictedCompletionDate = predictedCompletionDate; }
    public String getScheduleForecastConfidence() { return scheduleForecastConfidence; }
    public void setScheduleForecastConfidence(String scheduleForecastConfidence) { this.scheduleForecastConfidence = scheduleForecastConfidence; }
    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
    public double getCostRiskScore() { return costRiskScore; }
    public void setCostRiskScore(double costRiskScore) { this.costRiskScore = costRiskScore; }
    public double getScheduleRiskScore() { return scheduleRiskScore; }
    public void setScheduleRiskScore(double scheduleRiskScore) { this.scheduleRiskScore = scheduleRiskScore; }
    public double getProgressRiskScore() { return progressRiskScore; }
    public void setProgressRiskScore(double progressRiskScore) { this.progressRiskScore = progressRiskScore; }
    public List<Map<String, Object>> getMonthlyHistory() { return monthlyHistory; }
    public void setMonthlyHistory(List<Map<String, Object>> monthlyHistory) { this.monthlyHistory = monthlyHistory; }
    public List<EarlyWarningAlertDto> getActiveWarnings() { return activeWarnings; }
    public void setActiveWarnings(List<EarlyWarningAlertDto> activeWarnings) { this.activeWarnings = activeWarnings; }
    public List<Map<String, String>> getFlaggingReasons() { return flaggingReasons; }
    public void setFlaggingReasons(List<Map<String, String>> flaggingReasons) { this.flaggingReasons = flaggingReasons; }
    public List<Map<String, Object>> getRiskDrivers() { return riskDrivers; }
    public void setRiskDrivers(List<Map<String, Object>> riskDrivers) { this.riskDrivers = riskDrivers; }
    public Map<String, Object> getPeerBenchmark() { return peerBenchmark; }
    public void setPeerBenchmark(Map<String, Object> peerBenchmark) { this.peerBenchmark = peerBenchmark; }
    public List<Map<String, String>> getOfficialAttentionPriorities() { return officialAttentionPriorities; }
    public void setOfficialAttentionPriorities(List<Map<String, String>> officialAttentionPriorities) { this.officialAttentionPriorities = officialAttentionPriorities; }
    public List<Map<String, String>> getRecommendedInterventions() { return recommendedInterventions; }
    public void setRecommendedInterventions(List<Map<String, String>> recommendedInterventions) { this.recommendedInterventions = recommendedInterventions; }
    public List<InterventionDto> getInterventions() { return interventions; }
    public void setInterventions(List<InterventionDto> interventions) { this.interventions = interventions; }
    public String getInterventionEffectivenessStatus() { return interventionEffectivenessStatus; }
    public void setInterventionEffectivenessStatus(String interventionEffectivenessStatus) { this.interventionEffectivenessStatus = interventionEffectivenessStatus; }
}
