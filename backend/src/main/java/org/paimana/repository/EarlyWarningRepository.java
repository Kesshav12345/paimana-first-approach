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
                COALESCE(w.intervention_priority_score, c.intervention_priority_score) as intervention_priority_score, c.intervention_recommendation as recommended_intervention
            FROM gold_warning_alerts w
            JOIN gold_project_current c ON w.project_id = c.project_id
            WHERE UPPER(w.status) = 'ACTIVE'
        """);

        List<Object> params = new ArrayList<>();
        if (severity != null && !severity.trim().isEmpty() && !"ALL".equalsIgnoreCase(severity)) {
            sql.append(" AND UPPER(w.severity) = ?");
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
            WHERE UPPER(w.status) = 'ACTIVE'
        """);

        List<Object> params = new ArrayList<>();
        if (severity != null && !severity.trim().isEmpty() && !"ALL".equalsIgnoreCase(severity)) {
            sql.append(" AND UPPER(w.severity) = ?");
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
                COALESCE(a.action_type, i.recommended_action) as recommended_intervention, 
                COALESCE(a.status, 'PENDING_REVIEW') as intervention_status, 
                COALESCE(a.decision_authority, i.responsible_authority) as responsible_authority, 
                a.planned_date, a.actual_start_date, 
                a.follow_up_date, COALESCE(a.action_notes, i.action_evidence) as latest_action_notes
            FROM gold_intervention_priority i
            JOIN gold_project_current c ON i.project_id = c.project_id
            LEFT JOIN (
                SELECT p1.project_id, p1.status, p1.action_type, p1.decision_authority, p1.planned_date, p1.actual_start_date, p1.follow_up_date, p1.action_notes
                FROM project_intervention_actions p1
                INNER JOIN (
                    SELECT project_id, MAX(action_id) as max_id
                    FROM project_intervention_actions
                    GROUP BY project_id
                ) p2 ON p1.project_id = p2.project_id AND p1.action_id = p2.max_id
            ) a ON i.project_id = a.project_id
            WHERE i.reporting_month = c.latest_reporting_month
        """);

        List<Object> params = new ArrayList<>();
        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            sql.append(" AND UPPER(COALESCE(a.status, 'PENDING_REVIEW')) = ?");
            params.add(status.trim().toUpperCase());
        }

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
        try {
            String auth = "Project Review Committee";
            try {
                auth = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(ministry_name, 'Project Review Committee') FROM gold_project_current WHERE project_id = ?",
                    String.class, projectId
                );
            } catch (Exception ignored) {}

            String actionType = "Milestone Recovery Plan";
            try {
                actionType = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(action_category, 'Executive Milestone Review') FROM gold_intervention_priority WHERE project_id = ? ORDER BY reporting_month DESC LIMIT 1",
                    String.class, projectId
                );
            } catch (Exception ignored) {}

            String insertSql = """
                INSERT INTO project_intervention_actions 
                    (project_id, status, action_type, decision_authority, planned_date, actual_start_date, follow_up_date, action_notes)
                VALUES (?, ?, ?, ?, date('now'), date('now'), date('now', '+30 days'), ?)
            """;
            jdbcTemplate.update(insertSql, projectId, status, actionType, auth, notes);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
