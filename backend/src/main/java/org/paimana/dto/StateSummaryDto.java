package org.paimana.dto;

public class StateSummaryDto {
    private String stateName;
    private int projectCount;
    private double totalInvestmentCr;
    private double totalCumulativeExpenditureCr;
    private double weightedCostEscalationPct;
    private double weightedExpenditurePct;
    private double avgPhysicalProgressPct;
    private int highRiskCount;
    private int criticalRiskCount;
    private int activeWarningCount;
    private double avgScheduleDelayMonths;
    private double totalOriginalCostCr;
    private double totalRevisedCostCr;

    // Getters and Setters
    public double getAvgScheduleDelayMonths() { return avgScheduleDelayMonths; }
    public void setAvgScheduleDelayMonths(double avgScheduleDelayMonths) { this.avgScheduleDelayMonths = avgScheduleDelayMonths; }
    public double getTotalOriginalCostCr() { return totalOriginalCostCr; }
    public void setTotalOriginalCostCr(double totalOriginalCostCr) { this.totalOriginalCostCr = totalOriginalCostCr; }
    public double getTotalRevisedCostCr() { return totalRevisedCostCr; }
    public void setTotalRevisedCostCr(double totalRevisedCostCr) { this.totalRevisedCostCr = totalRevisedCostCr; }

    public String getStateName() { return stateName; }
    public void setStateName(String stateName) { this.stateName = stateName; }
    public int getProjectCount() { return projectCount; }
    public void setProjectCount(int projectCount) { this.projectCount = projectCount; }
    public double getTotalInvestmentCr() { return totalInvestmentCr; }
    public void setTotalInvestmentCr(double totalInvestmentCr) { this.totalInvestmentCr = totalInvestmentCr; }
    public double getTotalCumulativeExpenditureCr() { return totalCumulativeExpenditureCr; }
    public void setTotalCumulativeExpenditureCr(double totalCumulativeExpenditureCr) { this.totalCumulativeExpenditureCr = totalCumulativeExpenditureCr; }
    public double getWeightedCostEscalationPct() { return weightedCostEscalationPct; }
    public void setWeightedCostEscalationPct(double weightedCostEscalationPct) { this.weightedCostEscalationPct = weightedCostEscalationPct; }
    public double getWeightedExpenditurePct() { return weightedExpenditurePct; }
    public void setWeightedExpenditurePct(double weightedExpenditurePct) { this.weightedExpenditurePct = weightedExpenditurePct; }
    public double getAvgPhysicalProgressPct() { return avgPhysicalProgressPct; }
    public void setAvgPhysicalProgressPct(double avgPhysicalProgressPct) { this.avgPhysicalProgressPct = avgPhysicalProgressPct; }
    public int getHighRiskCount() { return highRiskCount; }
    public void setHighRiskCount(int highRiskCount) { this.highRiskCount = highRiskCount; }
    public int getCriticalRiskCount() { return criticalRiskCount; }
    public void setCriticalRiskCount(int criticalRiskCount) { this.criticalRiskCount = criticalRiskCount; }
    public int getActiveWarningCount() { return activeWarningCount; }
    public void setActiveWarningCount(int activeWarningCount) { this.activeWarningCount = activeWarningCount; }
}
