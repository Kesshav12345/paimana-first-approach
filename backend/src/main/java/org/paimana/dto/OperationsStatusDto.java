package org.paimana.dto;

import java.util.List;
import java.util.Map;

public class OperationsStatusDto {
    private String status;
    private String currentDatasetVersion;
    private String latestReportingPeriod;
    private int totalProjects;
    private int totalFacts;
    private int quarantineRecordsCount;
    private String activeModelVersion;
    private String candidateModelVersion;
    private String lastPipelineRun;
    private String pipelineState;
    private List<Map<String, Object>> sourceDocuments;
    private List<Map<String, Object>> quarantineSummary;
    private List<Map<String, Object>> auditLogs;

    // Getters and Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCurrentDatasetVersion() { return currentDatasetVersion; }
    public void setCurrentDatasetVersion(String currentDatasetVersion) { this.currentDatasetVersion = currentDatasetVersion; }
    public String getLatestReportingPeriod() { return latestReportingPeriod; }
    public void setLatestReportingPeriod(String latestReportingPeriod) { this.latestReportingPeriod = latestReportingPeriod; }
    public int getTotalProjects() { return totalProjects; }
    public void setTotalProjects(int totalProjects) { this.totalProjects = totalProjects; }
    public int getTotalFacts() { return totalFacts; }
    public void setTotalFacts(int totalFacts) { this.totalFacts = totalFacts; }
    public int getQuarantineRecordsCount() { return quarantineRecordsCount; }
    public void setQuarantineRecordsCount(int quarantineRecordsCount) { this.quarantineRecordsCount = quarantineRecordsCount; }
    public String getActiveModelVersion() { return activeModelVersion; }
    public void setActiveModelVersion(String activeModelVersion) { this.activeModelVersion = activeModelVersion; }
    public String getCandidateModelVersion() { return candidateModelVersion; }
    public void setCandidateModelVersion(String candidateModelVersion) { this.candidateModelVersion = candidateModelVersion; }
    public String getLastPipelineRun() { return lastPipelineRun; }
    public void setLastPipelineRun(String lastPipelineRun) { this.lastPipelineRun = lastPipelineRun; }
    public String getPipelineState() { return pipelineState; }
    public void setPipelineState(String pipelineState) { this.pipelineState = pipelineState; }
    public List<Map<String, Object>> getSourceDocuments() { return sourceDocuments; }
    public void setSourceDocuments(List<Map<String, Object>> sourceDocuments) { this.sourceDocuments = sourceDocuments; }
    public List<Map<String, Object>> getQuarantineSummary() { return quarantineSummary; }
    public void setQuarantineSummary(List<Map<String, Object>> quarantineSummary) { this.quarantineSummary = quarantineSummary; }
    public List<Map<String, Object>> getAuditLogs() { return auditLogs; }
    public void setAuditLogs(List<Map<String, Object>> auditLogs) { this.auditLogs = auditLogs; }
}
