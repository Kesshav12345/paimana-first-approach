package org.paimana.repository;

import org.paimana.dto.EarlyWarningAlertDto;
import org.paimana.dto.InterventionDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class EarlyWarningRepository {

    private final JdbcTemplate jdbcTemplate;

    public EarlyWarningRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<EarlyWarningAlertDto> getActiveAlerts(String sector, String ministry, String state, String severity, String search, int limit, int offset) {
        StringBuilder sql = new StringBuilder("""
            SELECT 
                w.warning_id as alert_id, w.project_id, c.project_name, c.sector_name, c.ministry_name, 
                c.agency_name, c.state_name, w.reporting_month, w.warning_type, w.severity, 
                c.risk_band, w.trigger_rule as trigger_condition, w.trigger_value, w.threshold_value, 
                w.status as alert_status, w.persistence_months as persistence_periods, 
                w.reporting_month as first_trigger_date, w.reporting_month as last_trigger_date, 
                c.intervention_priority_score, c.intervention_recommendation as recommended_intervention
            FROM gold_warning_alerts w
            JOIN gold_project_current c ON w.project_id = c.project_id
            WHERE 1=1
        """);

        List<Object> params = new ArrayList<>();
        if (severity != null && !severity.trim().isEmpty() && !"ALL".equalsIgnoreCase(severity)) {
            sql.append(" AND w.severity = ?");
            params.add(severity.trim().toUpperCase());
        }
        if (sector != null && !sector.trim().isEmpty() && !"ALL".equalsIgnoreCase(sector)) {
            sql.append(" AND c.sector_name = ?");
            params.add(sector.trim());
        }
        if (ministry != null && !ministry.trim().isEmpty() && !"ALL".equalsIgnoreCase(ministry)) {
            sql.append(" AND c.ministry_name = ?");
            params.add(ministry.trim());
        }
        if (state != null && !state.trim().isEmpty() && !"ALL".equalsIgnoreCase(state)) {
            sql.append(" AND c.state_name = ?");
            params.add(state.trim());
        }
        if (search != null && !search.trim().isEmpty()) {
            sql.append(" AND (LOWER(c.project_name) LIKE ? OR LOWER(w.project_id) LIKE ?)");
            String term = "%" + search.trim().toLowerCase() + "%";
            params.add(term);
            params.add(term);
        }

        sql.append(" ORDER BY w.persistence_months DESC, c.intervention_priority_score DESC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> {
            EarlyWarningAlertDto d = new EarlyWarningAlertDto();
            d.setAlertId(rs.getString("alert_id"));
            d.setProjectId(rs.getString("project_id"));
            d.setProjectName(rs.getString("project_name"));
            d.setSectorName(rs.getString("sector_name"));
            d.setMinistryName(rs.getString("ministry_name"));
            d.setAgencyName(rs.getString("agency_name"));
            d.setStateName(rs.getString("state_name"));
            d.setReportingMonth(rs.getString("reporting_month"));
            d.setWarningType(rs.getString("warning_type"));
            d.setSeverity(rs.getString("severity"));
            d.setRiskBand(rs.getString("risk_band"));
            d.setTriggerCondition(rs.getString("trigger_condition"));
            d.setTriggerValue(rs.getDouble("trigger_value"));
            d.setThresholdValue(rs.getDouble("threshold_value"));
            d.setAlertStatus(rs.getString("alert_status"));
            d.setPersistencePeriods(rs.getInt("persistence_periods"));
            d.setFirstTriggerDate(rs.getString("first_trigger_date"));
            d.setLastTriggerDate(rs.getString("last_trigger_date"));
            d.setInterventionPriorityScore(rs.getDouble("intervention_priority_score"));
            d.setRecommendedIntervention(rs.getString("recommended_intervention"));
            return d;
        }, params.toArray());
    }

    public int countActiveAlerts(String sector, String ministry, String state, String severity, String search) {
        StringBuilder sql = new StringBuilder("""
            SELECT COUNT(*) 
            FROM gold_warning_alerts w
            JOIN gold_project_current c ON w.project_id = c.project_id
            WHERE 1=1
        """);

        List<Object> params = new ArrayList<>();
        if (severity != null && !severity.trim().isEmpty() && !"ALL".equalsIgnoreCase(severity)) {
            sql.append(" AND w.severity = ?");
            params.add(severity.trim().toUpperCase());
        }
        if (sector != null && !sector.trim().isEmpty() && !"ALL".equalsIgnoreCase(sector)) {
            sql.append(" AND c.sector_name = ?");
            params.add(sector.trim());
        }
        if (ministry != null && !ministry.trim().isEmpty() && !"ALL".equalsIgnoreCase(ministry)) {
            sql.append(" AND c.ministry_name = ?");
            params.add(ministry.trim());
        }
        if (state != null && !state.trim().isEmpty() && !"ALL".equalsIgnoreCase(state)) {
            sql.append(" AND c.state_name = ?");
            params.add(state.trim());
        }
        if (search != null && !search.trim().isEmpty()) {
            sql.append(" AND (LOWER(c.project_name) LIKE ? OR LOWER(w.project_id) LIKE ?)");
            String term = "%" + search.trim().toLowerCase() + "%";
            params.add(term);
            params.add(term);
        }

        Integer count = jdbcTemplate.queryForObject(sql.toString(), Integer.class, params.toArray());
        return count != null ? count : 0;
    }

    public List<InterventionDto> getInterventions(String status, int limit, int offset) {
        StringBuilder sql = new StringBuilder("""
            SELECT 
                i.project_id, c.project_name, c.sector_name, c.ministry_name, c.agency_name, 
                c.state_name, i.reporting_month, i.intervention_priority_score, 
                i.recommended_action as recommended_intervention, 'UNDER_REVIEW' as intervention_status, 
                i.responsible_authority, NULL as planned_date, NULL as actual_start_date, 
                NULL as follow_up_date, i.action_evidence as latest_action_notes
            FROM gold_intervention_priority i
            JOIN gold_project_current c ON i.project_id = c.project_id
            WHERE 1=1
        """);

        List<Object> params = new ArrayList<>();
        sql.append(" ORDER BY i.intervention_priority_score DESC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> {
            InterventionDto d = new InterventionDto();
            d.setProjectId(rs.getString("project_id"));
            d.setProjectName(rs.getString("project_name"));
            d.setSectorName(rs.getString("sector_name"));
            d.setMinistryName(rs.getString("ministry_name"));
            d.setAgencyName(rs.getString("agency_name"));
            d.setStateName(rs.getString("state_name"));
            d.setReportingMonth(rs.getString("reporting_month"));
            d.setInterventionPriorityScore(rs.getDouble("intervention_priority_score"));
            d.setRecommendedIntervention(rs.getString("recommended_intervention"));
            d.setInterventionStatus(rs.getString("intervention_status"));
            d.setResponsibleAuthority(rs.getString("responsible_authority"));
            d.setPlannedDate(rs.getString("planned_date"));
            d.setActualStartDate(rs.getString("actual_start_date"));
            d.setFollowUpDate(rs.getString("follow_up_date"));
            d.setLatestActionNotes(rs.getString("latest_action_notes"));
            return d;
        }, params.toArray());
    }

    public boolean updateInterventionStatus(String projectId, String status, String notes) {
        // Can be stored or logged in action audit
        return true;
    }
}
