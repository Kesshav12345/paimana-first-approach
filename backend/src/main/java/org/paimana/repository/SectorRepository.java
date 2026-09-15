package org.paimana.repository;

import org.paimana.dto.ProjectSummaryDto;
import org.paimana.dto.SectorSummaryDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class SectorRepository {

    private final JdbcTemplate jdbcTemplate;

    public SectorRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<SectorSummaryDto> getAllSectors() {
        return getAllSectors(null, null, null, null, null, null, null, null, null);
    }

    public List<SectorSummaryDto> getAllSectors(
            String state, String ministry, String riskBand,
            String trajectory, String costFilter, String delayFilter,
            String warningFilter, String multiState, String sortBy
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT 
                sector_name,
                COUNT(*) as project_count,
                ROUND(SUM(original_cost_cr), 2) as total_original_cost_cr,
                ROUND(SUM(latest_revised_cost_cr), 2) as total_revised_cost_cr,
                ROUND(SUM(cumulative_expenditure_cr), 2) as total_expenditure_cr,
                ROUND(CASE WHEN SUM(original_cost_cr) > 0 THEN ((SUM(latest_revised_cost_cr) - SUM(original_cost_cr)) / SUM(original_cost_cr)) * 100.0 ELSE 0.0 END, 2) as weighted_cost_escalation_pct,
                ROUND(CASE WHEN SUM(latest_revised_cost_cr) > 0 THEN (SUM(cumulative_expenditure_cr) / SUM(latest_revised_cost_cr)) * 100.0 ELSE 0.0 END, 2) as weighted_expenditure_pct,
                ROUND(AVG(physical_progress_pct), 1) as avg_physical_progress_pct,
                ROUND(AVG(schedule_slippage_months), 1) as avg_schedule_delay_months,
                SUM(CASE WHEN UPPER(risk_band) = 'HIGH' THEN 1 ELSE 0 END) as high_risk_count,
                SUM(CASE WHEN UPPER(risk_band) = 'CRITICAL' THEN 1 ELSE 0 END) as critical_risk_count,
                SUM(active_warning_count) as active_warning_count
            FROM gold_project_current
            WHERE sector_name IS NOT NULL AND sector_name != ''
        """);

        List<Object> params = new ArrayList<>();
        appendFilters(sql, params, state, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState);

        sql.append(" GROUP BY sector_name");

        if ("cost".equalsIgnoreCase(sortBy)) {
            sql.append(" ORDER BY total_revised_cost_cr DESC");
        } else if ("escalation".equalsIgnoreCase(sortBy)) {
            sql.append(" ORDER BY weighted_cost_escalation_pct DESC");
        } else if ("delay".equalsIgnoreCase(sortBy)) {
            sql.append(" ORDER BY avg_schedule_delay_months DESC");
        } else if ("progress".equalsIgnoreCase(sortBy)) {
            sql.append(" ORDER BY avg_physical_progress_pct ASC");
        } else if ("risk".equalsIgnoreCase(sortBy)) {
            sql.append(" ORDER BY (critical_risk_count * 2 + high_risk_count) DESC, total_revised_cost_cr DESC");
        } else if ("name".equalsIgnoreCase(sortBy)) {
            sql.append(" ORDER BY sector_name ASC");
        } else {
            sql.append(" ORDER BY total_revised_cost_cr DESC");
        }

        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> {
            SectorSummaryDto d = new SectorSummaryDto();
            d.setSectorName(rs.getString("sector_name"));
            d.setProjectCount(rs.getInt("project_count"));
            d.setTotalOriginalCostCr(rs.getDouble("total_original_cost_cr"));
            d.setTotalRevisedCostCr(rs.getDouble("total_revised_cost_cr"));
            d.setTotalCumulativeExpenditureCr(rs.getDouble("total_expenditure_cr"));
            d.setWeightedCostEscalationPct(rs.getDouble("weighted_cost_escalation_pct"));
            d.setWeightedExpenditurePct(rs.getDouble("weighted_expenditure_pct"));
            d.setAvgPhysicalProgressPct(rs.getDouble("avg_physical_progress_pct"));
            d.setAvgScheduleDelayMonths(rs.getDouble("avg_schedule_delay_months"));
            d.setHighRiskCount(rs.getInt("high_risk_count"));
            d.setCriticalRiskCount(rs.getInt("critical_risk_count"));
            d.setActiveWarningCount(rs.getInt("active_warning_count"));
            return d;
        }, params.toArray());
    }

    private void appendFilters(
            StringBuilder sql, List<Object> params,
            String state, String ministry, String riskBand,
            String trajectory, String costFilter, String delayFilter,
            String warningFilter, String multiState
    ) {
        if (state != null && !state.trim().isEmpty() && !"ALL".equalsIgnoreCase(state)) {
            sql.append(" AND state_name = ?");
            params.add(state.trim());
        }
        if (ministry != null && !ministry.trim().isEmpty() && !"ALL".equalsIgnoreCase(ministry)) {
            sql.append(" AND ministry_name = ?");
            params.add(ministry.trim());
        }
        if (riskBand != null && !riskBand.trim().isEmpty() && !"ALL".equalsIgnoreCase(riskBand)) {
            sql.append(" AND UPPER(risk_band) = ?");
            params.add(riskBand.trim().toUpperCase());
        }
        if (trajectory != null && !trajectory.trim().isEmpty() && !"ALL".equalsIgnoreCase(trajectory)) {
            sql.append(" AND UPPER(risk_trajectory) = ?");
            params.add(trajectory.trim().toUpperCase());
        }
        if ("ESCALATED".equalsIgnoreCase(costFilter)) {
            sql.append(" AND cost_escalation_pct > 0");
        } else if ("HIGH_ESCALATION".equalsIgnoreCase(costFilter)) {
            sql.append(" AND cost_escalation_pct >= 20");
        } else if ("SEVERE_ESCALATION".equalsIgnoreCase(costFilter)) {
            sql.append(" AND cost_escalation_pct >= 50");
        } else if ("MODERATE_ESCALATION".equalsIgnoreCase(costFilter)) {
            sql.append(" AND cost_escalation_pct > 0 AND cost_escalation_pct < 20");
        } else if ("WITHIN_BUDGET".equalsIgnoreCase(costFilter)) {
            sql.append(" AND cost_escalation_pct <= 0");
        }

        if ("DELAYED".equalsIgnoreCase(delayFilter)) {
            sql.append(" AND schedule_slippage_months > 0");
        } else if ("MODERATE_DELAY".equalsIgnoreCase(delayFilter)) {
            sql.append(" AND schedule_slippage_months > 0 AND schedule_slippage_months < 12");
        } else if ("SEVERE_DELAY".equalsIgnoreCase(delayFilter)) {
            sql.append(" AND schedule_slippage_months >= 12");
        } else if ("CRITICAL_DELAY".equalsIgnoreCase(delayFilter)) {
            sql.append(" AND schedule_slippage_months >= 24");
        } else if ("ON_TIME".equalsIgnoreCase(delayFilter) || "ON_SCHEDULE".equalsIgnoreCase(delayFilter)) {
            sql.append(" AND schedule_slippage_months <= 0");
        }

        if ("HAS_WARNINGS".equalsIgnoreCase(warningFilter) || "ACTIVE_WARNINGS".equalsIgnoreCase(warningFilter)) {
            sql.append(" AND active_warning_count > 0");
        } else if ("MULTI_WARNING".equalsIgnoreCase(warningFilter) || "MULTIPLE_WARNINGS".equalsIgnoreCase(warningFilter)) {
            sql.append(" AND active_warning_count >= 2");
        } else if ("NO_WARNINGS".equalsIgnoreCase(warningFilter)) {
            sql.append(" AND active_warning_count = 0");
        }

        if ("YES".equalsIgnoreCase(multiState)) {
            sql.append(" AND is_multi_state = 1");
        } else if ("NO".equalsIgnoreCase(multiState)) {
            sql.append(" AND is_multi_state = 0");
        }
    }


    public List<Map<String, Object>> getSectorStateBreakdown(String sectorName) {
        return getSectorStateBreakdown(sectorName, null, null, null, null, null, null, null);
    }

    public List<Map<String, Object>> getSectorStateBreakdown(
            String sectorName, String ministry, String riskBand,
            String trajectory, String costFilter, String delayFilter,
            String warningFilter, String multiState
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT 
                state_name, COUNT(*) as project_count,
                ROUND(SUM(latest_revised_cost_cr), 2) as total_revised_cost_cr,
                ROUND(AVG(physical_progress_pct), 1) as avg_progress_pct,
                SUM(CASE WHEN UPPER(risk_band) IN ('HIGH', 'CRITICAL') THEN 1 ELSE 0 END) as high_risk_count
            FROM gold_project_current
            WHERE sector_name = ?
        """);
        List<Object> params = new ArrayList<>();
        params.add(sectorName);
        appendFilters(sql, params, null, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState);
        sql.append(" GROUP BY state_name ORDER BY project_count DESC");
        return jdbcTemplate.queryForList(sql.toString(), params.toArray());
    }

    public List<ProjectSummaryDto> getSectorProjects(String sectorName, String stateName, int limit, int offset) {
        return getSectorProjects(sectorName, stateName, null, null, null, null, null, null, null, limit, offset);
    }

    public List<ProjectSummaryDto> getSectorProjects(
            String sectorName, String stateName, String ministry, String riskBand,
            String trajectory, String costFilter, String delayFilter,
            String warningFilter, String multiState, int limit, int offset
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT 
                project_id, project_name, sector_name, ministry_name, agency_name, state_name,
                is_multi_state, original_cost_cr, latest_revised_cost_cr, cumulative_expenditure_cr,
                physical_progress_pct, cost_escalation_pct, schedule_slippage_months,
                overall_risk_score, risk_band, risk_trajectory, active_warning_count,
                intervention_priority_score, intervention_recommendation, latest_reporting_month
            FROM gold_project_current
            WHERE sector_name = ?
        """);
        List<Object> params = new ArrayList<>();
        params.add(sectorName);
        appendFilters(sql, params, stateName, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState);
        sql.append(" ORDER BY overall_risk_score DESC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);
        return queryProjects(sql.toString(), params.toArray());
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
