package org.paimana.dto;

public class ProjectResearchSummaryDto {
    private Long runId;
    private String projectId;
    private String startedAt;
    private String completedAt;
    private String status; // COMPLETED, COMPLETED_WITH_LIMITATIONS, REQUIRES_REVIEW, PENDING
    private String modelUsed;
    private int searchCount;
    private int sourceCount;
    private int evidenceCount;
    private int causalFactorCount;
    private double completenessScore; // 0 - 100%
    private String researchConfidence; // HIGH, MEDIUM, LOW
    private String causalConfidence; // HIGH, MEDIUM, LOW
    private String dataConfidence; // HIGH, MEDIUM, LOW
    private String notes;
    private String errorMessage;

    public Long getRunId() { return runId; }
    public void setRunId(Long runId) { this.runId = runId; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getStartedAt() { return startedAt; }
    public void setStartedAt(String startedAt) { this.startedAt = startedAt; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getModelUsed() { return modelUsed; }
    public void setModelUsed(String modelUsed) { this.modelUsed = modelUsed; }

    public int getSearchCount() { return searchCount; }
    public void setSearchCount(int searchCount) { this.searchCount = searchCount; }

    public int getSourceCount() { return sourceCount; }
    public void setSourceCount(int sourceCount) { this.sourceCount = sourceCount; }

    public int getEvidenceCount() { return evidenceCount; }
    public void setEvidenceCount(int evidenceCount) { this.evidenceCount = evidenceCount; }

    public int getCausalFactorCount() { return causalFactorCount; }
    public void setCausalFactorCount(int causalFactorCount) { this.causalFactorCount = causalFactorCount; }

    public double getCompletenessScore() { return completenessScore; }
    public void setCompletenessScore(double completenessScore) { this.completenessScore = completenessScore; }

    public String getResearchConfidence() { return researchConfidence; }
    public void setResearchConfidence(String researchConfidence) { this.researchConfidence = researchConfidence; }

    public String getCausalConfidence() { return causalConfidence; }
    public void setCausalConfidence(String causalConfidence) { this.causalConfidence = causalConfidence; }

    public String getDataConfidence() { return dataConfidence; }
    public void setDataConfidence(String dataConfidence) { this.dataConfidence = dataConfidence; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
