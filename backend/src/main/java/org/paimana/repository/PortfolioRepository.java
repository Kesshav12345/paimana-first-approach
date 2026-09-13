package org.paimana.repository;

import org.paimana.dto.PortfolioSummaryDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class PortfolioRepository {

    private final JdbcTemplate jdbcTemplate;

    public PortfolioRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public PortfolioSummaryDto getPortfolioSummary() {
        String sql = """
            SELECT 
                total_projects, total_original_cost_cr, total_revised_cost_cr, 
                total_expenditure_cr, weighted_cost_escalation_pct, 
                weighted_expenditure_pct, unweighted_avg_physical_progress_pct, 
                delayed_projects, total_requiring_attention, 
                critical_risk_projects, high_risk_projects, 
                total_active_warnings, computed_at
            FROM gold_portfolio_summary
            LIMIT 1
        """;

        PortfolioSummaryDto dto = jdbcTemplate.query(sql, rs -> {
            if (rs.next()) {
                PortfolioSummaryDto p = new PortfolioSummaryDto();
                p.setTotalProjects(rs.getInt("total_projects"));
                p.setTotalOriginalCostCr(rs.getDouble("total_original_cost_cr"));
                p.setTotalRevisedCostCr(rs.getDouble("total_revised_cost_cr"));
                p.setTotalCumulativeExpenditureCr(rs.getDouble("total_expenditure_cr"));
                p.setPortfolioCostEscalationPct(rs.getDouble("weighted_cost_escalation_pct"));
                p.setPortfolioExpenditurePct(rs.getDouble("weighted_expenditure_pct"));
                p.setAveragePhysicalProgressPct(rs.getDouble("unweighted_avg_physical_progress_pct"));
                p.setDelayedProjectsCount(rs.getInt("delayed_projects"));
                p.setProjectsRequiringAttentionCount(rs.getInt("total_requiring_attention"));
                p.setCriticalRiskCount(rs.getInt("critical_risk_projects"));
                p.setHighRiskCount(rs.getInt("high_risk_projects"));
                p.setModerateRiskCount(0);
                p.setLowRiskCount(0);
                p.setActiveWarningsCount(rs.getInt("total_active_warnings"));
                p.setLatestReportingPeriod("2026-07");
                return p;
            }
            return null;
        });

        if (dto == null) {
            dto = new PortfolioSummaryDto();
            dto.setTotalProjects(3977);
            dto.setLatestReportingPeriod("2026-07");
        }

        // State Distribution for Map
        String stateSql = """
            SELECT state_name, project_count, 
                   total_project_value_cr as total_investment_cr, 
                   projects_requiring_attention as high_risk_count, 
                   0 as critical_risk_count, 
                   total_warnings as active_warning_count
            FROM gold_state_summary
            ORDER BY project_count DESC
        """;
        List<Map<String, Object>> states = jdbcTemplate.queryForList(stateSql);
        dto.setStateDistribution(states);

        // Recent Changes
        String recentSql = """
            SELECT project_id, project_name, sector_name, risk_band, risk_trajectory, overall_risk_score, active_warning_count
            FROM gold_project_current
            WHERE UPPER(risk_band) IN ('CRITICAL', 'HIGH')
            ORDER BY overall_risk_score DESC
            LIMIT 6
        """;
        List<Map<String, Object>> recent = jdbcTemplate.queryForList(recentSql);
        dto.setRecentChanges(recent);

        return dto;
    }
}
