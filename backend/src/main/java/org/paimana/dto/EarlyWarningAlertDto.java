package org.paimana.dto;

public class EarlyWarningAlertDto {
    private String alertId;
    private String projectId;
    private String projectName;
    private String sectorName;
    private String ministryName;
    private String agencyName;
    private String stateName;
    private String reportingMonth;
    private String warningType;
    private String severity; // CRITICAL, HIGH, MODERATE, LOW
    private String riskBand;
    private String triggerCondition;
    private double triggerValue;
    private double thresholdValue;
    private String alertStatus; // ACTIVE, UNDER_REVIEW, ACTION_INITIATED, RESOLVED
    private int persistencePeriods;
    private String firstTriggerDate;
    private String lastTriggerDate;
    private double interventionPriorityScore;
    private String recommendedIntervention;
    private String projectInterventionStatus;

    // Getters and Setters
    public String getProjectInterventionStatus() { return projectInterventionStatus; }
    public void setProjectInterventionStatus(String projectInterventionStatus) { this.projectInterventionStatus = projectInterventionStatus; }

    public String getAlertId() { return alertId; }
    public void setAlertId(String alertId) { this.alertId = alertId; }
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
    public String getReportingMonth() { return reportingMonth; }
    public void setReportingMonth(String reportingMonth) { this.reportingMonth = reportingMonth; }
    public String getWarningType() { return warningType; }
    public void setWarningType(String warningType) { this.warningType = warningType; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getRiskBand() { return riskBand; }
    public void setRiskBand(String riskBand) { this.riskBand = riskBand; }
    public String getTriggerCondition() { return triggerCondition; }
    public void setTriggerCondition(String triggerCondition) { this.triggerCondition = triggerCondition; }
    public double getTriggerValue() { return triggerValue; }
    public void setTriggerValue(double triggerValue) { this.triggerValue = triggerValue; }
    public double getThresholdValue() { return thresholdValue; }
    public void setThresholdValue(double thresholdValue) { this.thresholdValue = thresholdValue; }
    public String getAlertStatus() { return alertStatus; }
    public void setAlertStatus(String alertStatus) { this.alertStatus = alertStatus; }
    public int getPersistencePeriods() { return persistencePeriods; }
    public void setPersistencePeriods(int persistencePeriods) { this.persistencePeriods = persistencePeriods; }
    public String getFirstTriggerDate() { return firstTriggerDate; }
    public void setFirstTriggerDate(String firstTriggerDate) { this.firstTriggerDate = firstTriggerDate; }
    public String getLastTriggerDate() { return lastTriggerDate; }
    public void setLastTriggerDate(String lastTriggerDate) { this.lastTriggerDate = lastTriggerDate; }
    public double getInterventionPriorityScore() { return interventionPriorityScore; }
    public void setInterventionPriorityScore(double interventionPriorityScore) { this.interventionPriorityScore = interventionPriorityScore; }
    public String getRecommendedIntervention() { return recommendedIntervention; }
    public void setRecommendedIntervention(String recommendedIntervention) { this.recommendedIntervention = recommendedIntervention; }
}
