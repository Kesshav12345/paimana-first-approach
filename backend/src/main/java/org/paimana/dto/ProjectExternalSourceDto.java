package org.paimana.dto;

public class ProjectExternalSourceDto {
    private Long sourceId;
    private String canonicalUrl;
    private String title;
    private String publisher;
    private String publicationDate;
    private String sourceType; // Primary Official, Institutional, High-Quality Journalism, Academic, Secondary
    private double sourceQuality; // 0.0 - 1.0
    private String retrievedDate;

    public Long getSourceId() { return sourceId; }
    public void setSourceId(Long sourceId) { this.sourceId = sourceId; }

    public String getCanonicalUrl() { return canonicalUrl; }
    public void setCanonicalUrl(String canonicalUrl) { this.canonicalUrl = canonicalUrl; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }

    public String getPublicationDate() { return publicationDate; }
    public void setPublicationDate(String publicationDate) { this.publicationDate = publicationDate; }

    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }

    public double getSourceQuality() { return sourceQuality; }
    public void setSourceQuality(double sourceQuality) { this.sourceQuality = sourceQuality; }

    public String getRetrievedDate() { return retrievedDate; }
    public void setRetrievedDate(String retrievedDate) { this.retrievedDate = retrievedDate; }
}
