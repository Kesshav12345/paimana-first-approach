package org.paimana.dto;

public class ProjectCostRevisionDto {
    private Long revisionId;
    private String projectId;
    private int revisionSequence;
    private String revisionYear;
    private String approvalDate;
    private String revisionTitle;
    private double sanctionedCostCr;
    private String approvingAuthority;
    private String targetDoc;
    private String scopeAndReasons;

    public ProjectCostRevisionDto() {}

    public Long getRevisionId() { return revisionId; }
    public void setRevisionId(Long revisionId) { this.revisionId = revisionId; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public int getRevisionSequence() { return revisionSequence; }
    public void setRevisionSequence(int revisionSequence) { this.revisionSequence = revisionSequence; }

    public String getRevisionYear() { return revisionYear; }
    public void setRevisionYear(String revisionYear) { this.revisionYear = revisionYear; }

    public String getApprovalDate() { return approvalDate; }
    public void setApprovalDate(String approvalDate) { this.approvalDate = approvalDate; }

    public String getRevisionTitle() { return revisionTitle; }
    public void setRevisionTitle(String revisionTitle) { this.revisionTitle = revisionTitle; }

    public double getSanctionedCostCr() { return sanctionedCostCr; }
    public void setSanctionedCostCr(double sanctionedCostCr) { this.sanctionedCostCr = sanctionedCostCr; }

    public String getApprovingAuthority() { return approvingAuthority; }
    public void setApprovingAuthority(String approvingAuthority) { this.approvingAuthority = approvingAuthority; }

    public String getTargetDoc() { return targetDoc; }
    public void setTargetDoc(String targetDoc) { this.targetDoc = targetDoc; }

    public String getScopeAndReasons() { return scopeAndReasons; }
    public void setScopeAndReasons(String scopeAndReasons) { this.scopeAndReasons = scopeAndReasons; }
}
