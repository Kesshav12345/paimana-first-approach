package org.paimana.dto;

public class ProjectSummaryDto {
    private String projectId;
    private String projectName;
    private String sectorName;
    private String ministryName;
    private String agencyName;
    private String stateName;
    private boolean isMultiState;
    private double originalCostCr;
    private double latestRevisedCostCr;
    private double cumulativeExpenditureCr;
    private double physicalProgressPct;
    private double costEscalationPct;
    private int scheduleSlippageMonths;
    private double overallRiskScore;
    private String riskBand;
    private String riskTrajectory;
    private int activeWarningCount;
    private double interventionPriorityScore;
    private String interventionRecommendation;
    private String latestReportingMonth;

    // Getters and Setters
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
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
    public double getOriginalCostCr() { return originalCostCr; }
    public void setOriginalCostCr(double originalCostCr) { this.originalCostCr = originalCostCr; }
    public double getLatestRevisedCostCr() { return latestRevisedCostCr; }
    public void setLatestRevisedCostCr(double latestRevisedCostCr) { this.latestRevisedCostCr = latestRevisedCostCr; }
    public double getCumulativeExpenditureCr() { return cumulativeExpenditureCr; }
    public void setCumulativeExpenditureCr(double cumulativeExpenditureCr) { this.cumulativeExpenditureCr = cumulativeExpenditureCr; }
    public double getPhysicalProgressPct() { return physicalProgressPct; }
    public void setPhysicalProgressPct(double physicalProgressPct) { this.physicalProgressPct = physicalProgressPct; }
    public double getCostEscalationPct() { return costEscalationPct; }
    public void setCostEscalationPct(double costEscalationPct) { this.costEscalationPct = costEscalationPct; }
    public int getScheduleSlippageMonths() { return scheduleSlippageMonths; }
    public void setScheduleSlippageMonths(int scheduleSlippageMonths) { this.scheduleSlippageMonths = scheduleSlippageMonths; }
    public double getOverallRiskScore() { return overallRiskScore; }
    public void setOverallRiskScore(double overallRiskScore) { this.overallRiskScore = overallRiskScore; }
    public String getRiskBand() { return riskBand; }
    public void setRiskBand(String riskBand) { this.riskBand = riskBand; }
    public String getRiskTrajectory() { return riskTrajectory; }
    public void setRiskTrajectory(String riskTrajectory) { this.riskTrajectory = riskTrajectory; }
    public int getActiveWarningCount() { return activeWarningCount; }
    public void setActiveWarningCount(int activeWarningCount) { this.activeWarningCount = activeWarningCount; }
    public double getInterventionPriorityScore() { return interventionPriorityScore; }
    public void setInterventionPriorityScore(double interventionPriorityScore) { this.interventionPriorityScore = interventionPriorityScore; }
    public String getInterventionRecommendation() { return interventionRecommendation; }
    public void setInterventionRecommendation(String interventionRecommendation) { this.interventionRecommendation = interventionRecommendation; }
    public String getLatestReportingMonth() { return latestReportingMonth; }
    public void setLatestReportingMonth(String latestReportingMonth) { this.latestReportingMonth = latestReportingMonth; }
}
