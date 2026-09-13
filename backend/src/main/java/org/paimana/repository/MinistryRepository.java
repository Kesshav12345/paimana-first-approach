package org.paimana.repository;

import org.paimana.dto.MinistrySummaryDto;
import org.paimana.dto.ProjectSummaryDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class MinistryRepository {

    private final JdbcTemplate jdbcTemplate;

    public MinistryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<MinistrySummaryDto> getAllMinistries() {
        String sql = """
            SELECT 
                ministry_name, project_count, total_original_cost_cr, total_revised_cost_cr,
                total_expenditure_cr, weighted_cost_escalation_pct, weighted_expenditure_pct,
                avg_physical_progress_pct, projects_requiring_attention as high_risk_count,
                0 as critical_risk_count, total_warnings as active_warning_count
            FROM gold_ministry_summary
            ORDER BY project_count DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            MinistrySummaryDto d = new MinistrySummaryDto();
            d.setMinistryName(rs.getString("ministry_name"));
            d.setProjectCount(rs.getInt("project_count"));
            d.setTotalOriginalCostCr(rs.getDouble("total_original_cost_cr"));
            d.setTotalRevisedCostCr(rs.getDouble("total_revised_cost_cr"));
            d.setTotalCumulativeExpenditureCr(rs.getDouble("total_expenditure_cr"));
            d.setWeightedCostEscalationPct(rs.getDouble("weighted_cost_escalation_pct"));
            d.setWeightedExpenditurePct(rs.getDouble("weighted_expenditure_pct"));
            d.setAvgPhysicalProgressPct(rs.getDouble("avg_physical_progress_pct"));
            d.setHighRiskCount(rs.getInt("high_risk_count"));
            d.setCriticalRiskCount(rs.getInt("critical_risk_count"));
            d.setActiveWarningCount(rs.getInt("active_warning_count"));
            return d;
        });
    }

    public List<Map<String, Object>> getMinistryAgencyBreakdown(String ministryName) {
        String sql = """
            SELECT 
                agency_name, COUNT(*) as project_count,
                ROUND(SUM(latest_revised_cost_cr), 2) as total_revised_cost_cr,
                ROUND(AVG(physical_progress_pct), 1) as avg_progress_pct,
                SUM(CASE WHEN UPPER(risk_band) IN ('HIGH', 'CRITICAL') THEN 1 ELSE 0 END) as high_risk_count
            FROM gold_project_current
            WHERE ministry_name = ?
            GROUP BY agency_name
            ORDER BY project_count DESC
        """;
        return jdbcTemplate.queryForList(sql, ministryName);
    }

    public List<ProjectSummaryDto> getMinistryProjects(String ministryName, String agencyName, int limit, int offset) {
        StringBuilder sql = new StringBuilder("""
            SELECT 
                project_id, project_name, sector_name, ministry_name, agency_name, state_name,
                is_multi_state, original_cost_cr, latest_revised_cost_cr, cumulative_expenditure_cr,
                physical_progress_pct, cost_escalation_pct, schedule_slippage_months,
                overall_risk_score, risk_band, risk_trajectory, active_warning_count,
                intervention_priority_score, intervention_recommendation, latest_reporting_month
            FROM gold_project_current
            WHERE ministry_name = ?
        """);

        if (agencyName != null && !agencyName.trim().isEmpty() && !"ALL".equalsIgnoreCase(agencyName)) {
            sql.append(" AND agency_name = ?");
            sql.append(" ORDER BY overall_risk_score DESC LIMIT ? OFFSET ?");
            return queryProjects(sql.toString(), ministryName, agencyName.trim(), limit, offset);
        } else {
            sql.append(" ORDER BY overall_risk_score DESC LIMIT ? OFFSET ?");
            return queryProjects(sql.toString(), ministryName, limit, offset);
        }
    }

    private List<ProjectSummaryDto> queryProjects(String sql, Object... params) {
        return jdbcTemplate.query(sql, params, (rs, rowNum) -> {
            ProjectSummaryDto dto = new ProjectSummaryDto();
            dto.setProjectId(rs.getString("project_id"));
            dto.setProjectName(rs.getString("project_name"));
            dto.setSectorName(rs.getString("sector_name"));
            dto.setMinistryName(rs.getString("ministry_name"));
            dto.setAgencyName(rs.getString("agency_name"));
            dto.setStateName(rs.getString("state_name"));
            dto.setMultiState(rs.getInt("is_multi_state") == 1);
            dto.setOriginalCostCr(rs.getDouble("original_cost_cr"));
            dto.setLatestRevisedCostCr(rs.getDouble("latest_revised_cost_cr"));
            dto.setCumulativeExpenditureCr(rs.getDouble("cumulative_expenditure_cr"));
            dto.setPhysicalProgressPct(rs.getDouble("physical_progress_pct"));
            dto.setCostEscalationPct(rs.getDouble("cost_escalation_pct"));
            dto.setScheduleSlippageMonths(rs.getInt("schedule_slippage_months"));
            dto.setOverallRiskScore(rs.getDouble("overall_risk_score"));
            dto.setRiskBand(rs.getString("risk_band"));
            dto.setRiskTrajectory(rs.getString("risk_trajectory"));
            dto.setActiveWarningCount(rs.getInt("active_warning_count"));
            dto.setInterventionPriorityScore(rs.getDouble("intervention_priority_score"));
            dto.setInterventionRecommendation(rs.getString("intervention_recommendation"));
            dto.setLatestReportingMonth(rs.getString("latest_reporting_month"));
            return dto;
        });
    }
}
