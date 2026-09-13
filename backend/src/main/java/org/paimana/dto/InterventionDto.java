package org.paimana.dto;

public class InterventionDto {
    private String projectId;
    private String projectName;
    private String sectorName;
    private String ministryName;
    private String agencyName;
    private String stateName;
    private String reportingMonth;
    private double interventionPriorityScore;
    private String recommendedIntervention;
    private String interventionStatus; // NOT_PLANNED, ACKNOWLEDGED, UNDER_REVIEW, PLANNED, ACTION_INITIATED, MONITORING, RESOLVED
    private String responsibleAuthority;
    private String plannedDate;
    private String actualStartDate;
    private String followUpDate;
    private String latestActionNotes;

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
    public String getReportingMonth() { return reportingMonth; }
    public void setReportingMonth(String reportingMonth) { this.reportingMonth = reportingMonth; }
    public double getInterventionPriorityScore() { return interventionPriorityScore; }
    public void setInterventionPriorityScore(double interventionPriorityScore) { this.interventionPriorityScore = interventionPriorityScore; }
    public String getRecommendedIntervention() { return recommendedIntervention; }
    public void setRecommendedIntervention(String recommendedIntervention) { this.recommendedIntervention = recommendedIntervention; }
    public String getInterventionStatus() { return interventionStatus; }
    public void setInterventionStatus(String interventionStatus) { this.interventionStatus = interventionStatus; }
    public String getResponsibleAuthority() { return responsibleAuthority; }
    public void setResponsibleAuthority(String responsibleAuthority) { this.responsibleAuthority = responsibleAuthority; }
    public String getPlannedDate() { return plannedDate; }
    public void setPlannedDate(String plannedDate) { this.plannedDate = plannedDate; }
    public String getActualStartDate() { return actualStartDate; }
    public void setActualStartDate(String actualStartDate) { this.actualStartDate = actualStartDate; }
    public String getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(String followUpDate) { this.followUpDate = followUpDate; }
    public String getLatestActionNotes() { return latestActionNotes; }
    public void setLatestActionNotes(String latestActionNotes) { this.latestActionNotes = latestActionNotes; }
}
