package org.paimana.dto;

import java.util.List;

public class ProjectEvidenceOutlookDto {
    private String forecastConcern; // SUPPORTS_EXISTING_FORECAST, MAY_INCREASE_DOWNSIDE_RISK, LITTLE_EVIDENCE_OF_MATERIAL_IMPACT, INSUFFICIENT_EVIDENCE
    private String evidenceInterpretation;
    private List<String> unresolvedRisks;
    private String evidenceConfidence; // HIGH, MEDIUM, LOW

    public String getForecastConcern() { return forecastConcern; }
    public void setForecastConcern(String forecastConcern) { this.forecastConcern = forecastConcern; }

    public String getEvidenceInterpretation() { return evidenceInterpretation; }
    public void setEvidenceInterpretation(String evidenceInterpretation) { this.evidenceInterpretation = evidenceInterpretation; }

    public List<String> getUnresolvedRisks() { return unresolvedRisks; }
    public void setUnresolvedRisks(List<String> unresolvedRisks) { this.unresolvedRisks = unresolvedRisks; }

    public String getEvidenceConfidence() { return evidenceConfidence; }
    public void setEvidenceConfidence(String evidenceConfidence) { this.evidenceConfidence = evidenceConfidence; }
}
