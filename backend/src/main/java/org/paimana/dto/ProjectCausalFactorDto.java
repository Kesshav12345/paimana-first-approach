package org.paimana.dto;

public class ProjectCausalFactorDto {
    private Long factorId;
    private String projectId;
    private String category; // Land Acquisition, Environmental Clearances, Contractor Performance, Utility Relocation, Flooding/Geology, Legal/Court, Scope Expansion, Administrative
    private String factorTitle;
    private String factorDescription;
    private String startDate;
    private String endDate;
    private String status; // UNRESOLVED, RESOLVED, PARTIALLY_RESOLVED
    private String causalConfidence; // DIRECT, STRONG_INDIRECT, ASSOCIATIVE, SPECULATIVE
    private String affectedPackages;
    private String quantitativeConsequence;
    private String unresolvedDetail;
    private int evidenceCount;

    public Long getFactorId() { return factorId; }
    public void setFactorId(Long factorId) { this.factorId = factorId; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getFactorTitle() { return factorTitle; }
    public void setFactorTitle(String factorTitle) { this.factorTitle = factorTitle; }

    public String getFactorDescription() { return factorDescription; }
    public void setFactorDescription(String factorDescription) { this.factorDescription = factorDescription; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCausalConfidence() { return causalConfidence; }
    public void setCausalConfidence(String causalConfidence) { this.causalConfidence = causalConfidence; }

    public String getAffectedPackages() { return affectedPackages; }
    public void setAffectedPackages(String affectedPackages) { this.affectedPackages = affectedPackages; }

    public String getQuantitativeConsequence() { return quantitativeConsequence; }
    public void setQuantitativeConsequence(String quantitativeConsequence) { this.quantitativeConsequence = quantitativeConsequence; }

    public String getUnresolvedDetail() { return unresolvedDetail; }
    public void setUnresolvedDetail(String unresolvedDetail) { this.unresolvedDetail = unresolvedDetail; }

    public int getEvidenceCount() { return evidenceCount; }
    public void setEvidenceCount(int evidenceCount) { this.evidenceCount = evidenceCount; }
}
