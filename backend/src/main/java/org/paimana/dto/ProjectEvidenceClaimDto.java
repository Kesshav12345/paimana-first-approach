package org.paimana.dto;

public class ProjectEvidenceClaimDto {
    private Long evidenceId;
    private String projectId;
    private Long sourceId;
    private ProjectExternalSourceDto source;
    private String claimText;
    private String eventDate;
    private String publicationDate;
    private String evidenceStrength; // DIRECT, STRONG_INDIRECT, ASSOCIATIVE, SPECULATIVE
    private String causalConfidence; // HIGH, MEDIUM, LOW
    private int targetComponent; // 1 to 15
    private String quantitativeSignal;
    private String supportingMetric;
    private String limitations;

    public Long getEvidenceId() { return evidenceId; }
    public void setEvidenceId(Long evidenceId) { this.evidenceId = evidenceId; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public Long getSourceId() { return sourceId; }
    public void setSourceId(Long sourceId) { this.sourceId = sourceId; }

    public ProjectExternalSourceDto getSource() { return source; }
    public void setSource(ProjectExternalSourceDto source) { this.source = source; }

    public String getClaimText() { return claimText; }
    public void setClaimText(String claimText) { this.claimText = claimText; }

    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }

    public String getPublicationDate() { return publicationDate; }
    public void setPublicationDate(String publicationDate) { this.publicationDate = publicationDate; }

    public String getEvidenceStrength() { return evidenceStrength; }
    public void setEvidenceStrength(String evidenceStrength) { this.evidenceStrength = evidenceStrength; }

    public String getCausalConfidence() { return causalConfidence; }
    public void setCausalConfidence(String causalConfidence) { this.causalConfidence = causalConfidence; }

    public int getTargetComponent() { return targetComponent; }
    public void setTargetComponent(int targetComponent) { this.targetComponent = targetComponent; }

    public String getQuantitativeSignal() { return quantitativeSignal; }
    public void setQuantitativeSignal(String quantitativeSignal) { this.quantitativeSignal = quantitativeSignal; }

    public String getSupportingMetric() { return supportingMetric; }
    public void setSupportingMetric(String supportingMetric) { this.supportingMetric = supportingMetric; }

    public String getLimitations() { return limitations; }
    public void setLimitations(String limitations) { this.limitations = limitations; }
}
