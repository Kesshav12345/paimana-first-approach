package org.paimana.dto;

import java.util.Map;

public class PipelineJobStatusDto {
    private String jobId;
    private String triggerType;
    private String reportFile;
    private String reportingMonth;
    private String stage;
    private String status;
    private int totalProjects;
    private int affectedProjectsCount;
    private int researchedCount;
    private int claimsCount;
    private int conflictsCount;
    private String startedAt;
    private String completedAt;
    private double elapsedSeconds;
    private String errorSummary;
    private Map<String, Object> details;

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getTriggerType() { return triggerType; }
    public void setTriggerType(String triggerType) { this.triggerType = triggerType; }

    public String getReportFile() { return reportFile; }
    public void setReportFile(String reportFile) { this.reportFile = reportFile; }

    public String getReportingMonth() { return reportingMonth; }
    public void setReportingMonth(String reportingMonth) { this.reportingMonth = reportingMonth; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getTotalProjects() { return totalProjects; }
    public void setTotalProjects(int totalProjects) { this.totalProjects = totalProjects; }

    public int getAffectedProjectsCount() { return affectedProjectsCount; }
    public void setAffectedProjectsCount(int affectedProjectsCount) { this.affectedProjectsCount = affectedProjectsCount; }

    public int getResearchedCount() { return researchedCount; }
    public void setResearchedCount(int researchedCount) { this.researchedCount = researchedCount; }

    public int getClaimsCount() { return claimsCount; }
    public void setClaimsCount(int claimsCount) { this.claimsCount = claimsCount; }

    public int getConflictsCount() { return conflictsCount; }
    public void setConflictsCount(int conflictsCount) { this.conflictsCount = conflictsCount; }

    public String getStartedAt() { return startedAt; }
    public void setStartedAt(String startedAt) { this.startedAt = startedAt; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

    public double getElapsedSeconds() { return elapsedSeconds; }
    public void setElapsedSeconds(double elapsedSeconds) { this.elapsedSeconds = elapsedSeconds; }

    public String getErrorSummary() { return errorSummary; }
    public void setErrorSummary(String errorSummary) { this.errorSummary = errorSummary; }

    public Map<String, Object> getDetails() { return details; }
    public void setDetails(Map<String, Object> details) { this.details = details; }
}
