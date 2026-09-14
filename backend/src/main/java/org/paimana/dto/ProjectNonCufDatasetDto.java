package org.paimana.dto;

public class ProjectNonCufDatasetDto {
    private String datasetName; // e.g. RFCTLARR Land Acquisition Gazette, Forest Clearance Portal Form-A, IMD Monsoon Inundation Record, High Court Stay Order, Steel Price Index
    private String category; // Regulatory/Statutory, Environmental, Meteorological, Legal/Judicial, Macro-economic
    private boolean isRelevant;
    private String whyRelevant;
    private String observationPeriod;
    private String sourceCitation;
    private String componentAffected; // e.g. Component 2, 5, 9, 13

    public String getDatasetName() { return datasetName; }
    public void setDatasetName(String datasetName) { this.datasetName = datasetName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isRelevant() { return isRelevant; }
    public void setRelevant(boolean relevant) { isRelevant = relevant; }

    public String getWhyRelevant() { return whyRelevant; }
    public void setWhyRelevant(String whyRelevant) { this.whyRelevant = whyRelevant; }

    public String getObservationPeriod() { return observationPeriod; }
    public void setObservationPeriod(String observationPeriod) { this.observationPeriod = observationPeriod; }

    public String getSourceCitation() { return sourceCitation; }
    public void setSourceCitation(String sourceCitation) { this.sourceCitation = sourceCitation; }

    public String getComponentAffected() { return componentAffected; }
    public void setComponentAffected(String componentAffected) { this.componentAffected = componentAffected; }
}
