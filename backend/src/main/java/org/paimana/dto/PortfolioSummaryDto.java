package org.paimana.dto;

import java.util.List;
import java.util.Map;

public class PortfolioSummaryDto {
    private int totalProjects;
    private double totalOriginalCostCr;
    private double totalRevisedCostCr;
    private double totalCumulativeExpenditureCr;
    private double portfolioCostEscalationPct;
    private double portfolioExpenditurePct;
    private double averagePhysicalProgressPct;
    private int delayedProjectsCount;
    private int projectsRequiringAttentionCount;
    private int criticalRiskCount;
    private int highRiskCount;
    private int moderateRiskCount;
    private int lowRiskCount;
    private int activeWarningsCount;
    private String latestReportingPeriod;
    private List<Map<String, Object>> stateDistribution;
    private List<Map<String, Object>> recentChanges;

    // Getters and Setters
    public int getTotalProjects() { return totalProjects; }
    public void setTotalProjects(int totalProjects) { this.totalProjects = totalProjects; }
    public double getTotalOriginalCostCr() { return totalOriginalCostCr; }
    public void setTotalOriginalCostCr(double totalOriginalCostCr) { this.totalOriginalCostCr = totalOriginalCostCr; }
    public double getTotalRevisedCostCr() { return totalRevisedCostCr; }
    public void setTotalRevisedCostCr(double totalRevisedCostCr) { this.totalRevisedCostCr = totalRevisedCostCr; }
    public double getTotalCumulativeExpenditureCr() { return totalCumulativeExpenditureCr; }
    public void setTotalCumulativeExpenditureCr(double totalCumulativeExpenditureCr) { this.totalCumulativeExpenditureCr = totalCumulativeExpenditureCr; }
    public double getPortfolioCostEscalationPct() { return portfolioCostEscalationPct; }
    public void setPortfolioCostEscalationPct(double portfolioCostEscalationPct) { this.portfolioCostEscalationPct = portfolioCostEscalationPct; }
    public double getPortfolioExpenditurePct() { return portfolioExpenditurePct; }
    public void setPortfolioExpenditurePct(double portfolioExpenditurePct) { this.portfolioExpenditurePct = portfolioExpenditurePct; }
    public double getAveragePhysicalProgressPct() { return averagePhysicalProgressPct; }
    public void setAveragePhysicalProgressPct(double averagePhysicalProgressPct) { this.averagePhysicalProgressPct = averagePhysicalProgressPct; }
    public int getDelayedProjectsCount() { return delayedProjectsCount; }
    public void setDelayedProjectsCount(int delayedProjectsCount) { this.delayedProjectsCount = delayedProjectsCount; }
    public int getProjectsRequiringAttentionCount() { return projectsRequiringAttentionCount; }
    public void setProjectsRequiringAttentionCount(int projectsRequiringAttentionCount) { this.projectsRequiringAttentionCount = projectsRequiringAttentionCount; }
    public int getCriticalRiskCount() { return criticalRiskCount; }
    public void setCriticalRiskCount(int criticalRiskCount) { this.criticalRiskCount = criticalRiskCount; }
    public int getHighRiskCount() { return highRiskCount; }
    public void setHighRiskCount(int highRiskCount) { this.highRiskCount = highRiskCount; }
    public int getModerateRiskCount() { return moderateRiskCount; }
    public void setModerateRiskCount(int moderateRiskCount) { this.moderateRiskCount = moderateRiskCount; }
    public int getLowRiskCount() { return lowRiskCount; }
    public void setLowRiskCount(int lowRiskCount) { this.lowRiskCount = lowRiskCount; }
    public int getActiveWarningsCount() { return activeWarningsCount; }
    public void setActiveWarningsCount(int activeWarningsCount) { this.activeWarningsCount = activeWarningsCount; }
    public String getLatestReportingPeriod() { return latestReportingPeriod; }
    public void setLatestReportingPeriod(String latestReportingPeriod) { this.latestReportingPeriod = latestReportingPeriod; }
    public List<Map<String, Object>> getStateDistribution() { return stateDistribution; }
    public void setStateDistribution(List<Map<String, Object>> stateDistribution) { this.stateDistribution = stateDistribution; }
    public List<Map<String, Object>> getRecentChanges() { return recentChanges; }
    public void setRecentChanges(List<Map<String, Object>> recentChanges) { this.recentChanges = recentChanges; }
}
