package org.paimana.dto;

public class MethodologyMetadataDto {
    private String activeMethodologyVersion;
    private String productionModelVersion;
    private String featureVersion;
    private String latestDatasetPeriod;
    private int totalMonitoredProjects;
    private int totalCanonicalFacts;
    private int totalEvidenceClaims;
    private int totalExternalSources;
    private int researchedProjectsCount;
    private int quarantineRecordsCount;
    private String lastIntelligenceRefresh;
    private String searchProvider;
    private String modelFamily;
    private String systemStatus;

    public String getActiveMethodologyVersion() { return activeMethodologyVersion; }
    public void setActiveMethodologyVersion(String v) { this.activeMethodologyVersion = v; }

    public String getProductionModelVersion() { return productionModelVersion; }
    public void setProductionModelVersion(String v) { this.productionModelVersion = v; }

    public String getFeatureVersion() { return featureVersion; }
    public void setFeatureVersion(String v) { this.featureVersion = v; }

    public String getLatestDatasetPeriod() { return latestDatasetPeriod; }
    public void setLatestDatasetPeriod(String p) { this.latestDatasetPeriod = p; }

    public int getTotalMonitoredProjects() { return totalMonitoredProjects; }
    public void setTotalMonitoredProjects(int c) { this.totalMonitoredProjects = c; }

    public int getTotalCanonicalFacts() { return totalCanonicalFacts; }
    public void setTotalCanonicalFacts(int c) { this.totalCanonicalFacts = c; }

    public int getTotalEvidenceClaims() { return totalEvidenceClaims; }
    public void setTotalEvidenceClaims(int c) { this.totalEvidenceClaims = c; }

    public int getTotalExternalSources() { return totalExternalSources; }
    public void setTotalExternalSources(int c) { this.totalExternalSources = c; }

    public int getResearchedProjectsCount() { return researchedProjectsCount; }
    public void setResearchedProjectsCount(int c) { this.researchedProjectsCount = c; }

    public int getQuarantineRecordsCount() { return quarantineRecordsCount; }
    public void setQuarantineRecordsCount(int c) { this.quarantineRecordsCount = c; }

    public String getLastIntelligenceRefresh() { return lastIntelligenceRefresh; }
    public void setLastIntelligenceRefresh(String t) { this.lastIntelligenceRefresh = t; }

    public String getSearchProvider() { return searchProvider; }
    public void setSearchProvider(String s) { this.searchProvider = s; }

    public String getModelFamily() { return modelFamily; }
    public void setModelFamily(String m) { this.modelFamily = m; }

    public String getSystemStatus() { return systemStatus; }
    public void setSystemStatus(String s) { this.systemStatus = s; }
}
