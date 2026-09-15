package org.paimana.repository;

import org.paimana.dto.EarlyWarningAlertDto;
import org.paimana.dto.InterventionDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class EarlyWarningRepository {

    private final JdbcTemplate jdbcTemplate;

    public EarlyWarningRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<EarlyWarningAlertDto> getActiveAlerts(String sector, String ministry, String state, String severity, String search, int limit, int offset) {
        return getActiveAlerts(sector, ministry, state, severity, null, null, null, null, search, limit, offset);
    }

    public List<EarlyWarningAlertDto> getActiveAlerts(
            String sector, String ministry, String state, String severity,
            String warningType, String persistence, String riskBand,
            String interventionStatus, String search, int limit, int offset
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT 
                w.warning_id as alert_id, w.project_id, c.project_name, c.sector_name, c.ministry_name, 
                c.agency_name, c.state_name, w.reporting_month, w.warning_type, w.severity, 
                c.risk_band, w.trigger_rule as trigger_condition, w.trigger_value, w.threshold_value, 
                w.status as alert_status, w.persistence_months as persistence_periods, 
                w.reporting_month as first_trigger_date, w.reporting_month as last_trigger_date, 
                COALESCE(w.intervention_priority_score, c.intervention_priority_score) as intervention_priority_score, 
                c.intervention_recommendation as recommended_intervention,
                COALESCE(act.status, CASE WHEN c.intervention_priority_score >= 50 THEN 'INTERVENTION_RECOMMENDED' ELSE 'NO_INTERVENTION_REQUIRED' END) as project_intervention_status
            FROM gold_warning_alerts w
            JOIN gold_project_current c ON w.project_id = c.project_id
            LEFT JOIN (
                SELECT p1.project_id, p1.status
                FROM project_intervention_actions p1
                INNER JOIN (
                    SELECT project_id, MAX(action_id) as max_id
                    FROM project_intervention_actions
                    GROUP BY project_id
                ) p2 ON p1.project_id = p2.project_id AND p1.action_id = p2.max_id
            ) act ON c.project_id = act.project_id
            WHERE UPPER(w.status) = 'ACTIVE'
        """);

        List<Object> params = new ArrayList<>();
        appendAlertFilters(sql, params, sector, ministry, state, severity, warningType, persistence, riskBand, interventionStatus, search);

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
            d.setProjectInterventionStatus(rs.getString("project_intervention_status"));
            return d;
        }, params.toArray());
    }

    public int countActiveAlerts(String sector, String ministry, String state, String severity, String search) {
        return countActiveAlerts(sector, ministry, state, severity, null, null, null, null, search);
    }

    public int countActiveAlerts(
            String sector, String ministry, String state, String severity,
            String warningType, String persistence, String riskBand,
            String interventionStatus, String search
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT COUNT(*) 
            FROM gold_warning_alerts w
            JOIN gold_project_current c ON w.project_id = c.project_id
            LEFT JOIN (
                SELECT p1.project_id, p1.status
                FROM project_intervention_actions p1
                INNER JOIN (
                    SELECT project_id, MAX(action_id) as max_id
                    FROM project_intervention_actions
                    GROUP BY project_id
                ) p2 ON p1.project_id = p2.project_id AND p1.action_id = p2.max_id
            ) act ON c.project_id = act.project_id
            WHERE UPPER(w.status) = 'ACTIVE'
        """);

        List<Object> params = new ArrayList<>();
        appendAlertFilters(sql, params, sector, ministry, state, severity, warningType, persistence, riskBand, interventionStatus, search);

        Integer count = jdbcTemplate.queryForObject(sql.toString(), Integer.class, params.toArray());
        return count != null ? count : 0;
    }

    public Map<String, Object> getEarlyWarningSummary(
            String sector, String ministry, String state, String severity,
            String warningType, String persistence, String riskBand,
            String interventionStatus, String search
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT 
                COUNT(DISTINCT c.project_id) as matching_projects,
                COUNT(*) as active_warnings,
                SUM(CASE WHEN UPPER(w.severity) = 'CRITICAL' THEN 1 ELSE 0 END) as critical_signals,
                COUNT(DISTINCT CASE WHEN c.active_warning_count >= 2 THEN c.project_id ELSE NULL END) as multi_warning_projects,
                COUNT(DISTINCT CASE WHEN c.intervention_priority_score >= 50 THEN c.project_id ELSE NULL END) as intervention_candidates,
                COUNT(DISTINCT CASE WHEN act.status IS NOT NULL AND UPPER(act.status) != 'RESOLVED' THEN c.project_id ELSE NULL END) as active_interventions
            FROM gold_warning_alerts w
            JOIN gold_project_current c ON w.project_id = c.project_id
            LEFT JOIN (
                SELECT p1.project_id, p1.status
                FROM project_intervention_actions p1
                INNER JOIN (
                    SELECT project_id, MAX(action_id) as max_id
                    FROM project_intervention_actions
                    GROUP BY project_id
                ) p2 ON p1.project_id = p2.project_id AND p1.action_id = p2.max_id
            ) act ON c.project_id = act.project_id
            WHERE UPPER(w.status) = 'ACTIVE'
        """);

        List<Object> params = new ArrayList<>();
        appendAlertFilters(sql, params, sector, ministry, state, severity, warningType, persistence, riskBand, interventionStatus, search);

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        Map<String, Object> res = new HashMap<>();
        if (!rows.isEmpty()) {
            Map<String, Object> r = rows.get(0);
            res.put("matchingProjects", r.get("matching_projects") != null ? ((Number) r.get("matching_projects")).intValue() : 0);
            res.put("activeWarnings", r.get("active_warnings") != null ? ((Number) r.get("active_warnings")).intValue() : 0);
            res.put("criticalSignals", r.get("critical_signals") != null ? ((Number) r.get("critical_signals")).intValue() : 0);
            res.put("multiWarningProjects", r.get("multi_warning_projects") != null ? ((Number) r.get("multi_warning_projects")).intValue() : 0);
            res.put("interventionCandidates", r.get("intervention_candidates") != null ? ((Number) r.get("intervention_candidates")).intValue() : 0);
            res.put("activeInterventions", r.get("active_interventions") != null ? ((Number) r.get("active_interventions")).intValue() : 0);
        } else {
            res.put("matchingProjects", 0);
            res.put("activeWarnings", 0);
            res.put("criticalSignals", 0);
            res.put("multiWarningProjects", 0);
            res.put("interventionCandidates", 0);
            res.put("activeInterventions", 0);
        }
        return res;
    }

    private void appendAlertFilters(
            StringBuilder sql, List<Object> params,
            String sector, String ministry, String state, String severity,
            String warningType, String persistence, String riskBand,
            String interventionStatus, String search
    ) {
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
        if (warningType != null && !warningType.trim().isEmpty() && !"ALL".equalsIgnoreCase(warningType)) {
            sql.append(" AND UPPER(w.warning_type) LIKE ?");
            params.add("%" + warningType.trim().toUpperCase() + "%");
        }
        if (persistence != null && !persistence.trim().isEmpty() && !"ALL".equalsIgnoreCase(persistence)) {
            if ("PERSISTENT_2M".equalsIgnoreCase(persistence)) {
                sql.append(" AND w.persistence_months >= 2");
            } else if ("PERSISTENT_3M".equalsIgnoreCase(persistence)) {
                sql.append(" AND w.persistence_months >= 3");
            } else if ("PERSISTENT_6M".equalsIgnoreCase(persistence)) {
                sql.append(" AND w.persistence_months >= 6");
            } else if ("NEW".equalsIgnoreCase(persistence)) {
                sql.append(" AND w.persistence_months <= 1");
            }
        }
        if (riskBand != null && !riskBand.trim().isEmpty() && !"ALL".equalsIgnoreCase(riskBand)) {
            sql.append(" AND UPPER(c.risk_band) = ?");
            params.add(riskBand.trim().toUpperCase());
        }
        if (interventionStatus != null && !interventionStatus.trim().isEmpty() && !"ALL".equalsIgnoreCase(interventionStatus)) {
            if ("REQUIRED".equalsIgnoreCase(interventionStatus) || "CANDIDATE".equalsIgnoreCase(interventionStatus)) {
                sql.append(" AND c.intervention_priority_score >= 50 AND (act.status IS NULL OR UPPER(act.status) = 'PENDING_REVIEW')");
            } else if ("OPEN".equalsIgnoreCase(interventionStatus) || "ACTIVE".equalsIgnoreCase(interventionStatus)) {
                sql.append(" AND act.status IS NOT NULL AND UPPER(act.status) != 'RESOLVED'");
            } else if ("NONE".equalsIgnoreCase(interventionStatus) || "NO_INTERVENTION".equalsIgnoreCase(interventionStatus)) {
                sql.append(" AND act.status IS NULL AND c.intervention_priority_score < 50");
            } else {
                sql.append(" AND UPPER(COALESCE(act.status, 'PENDING_REVIEW')) = ?");
                params.add(interventionStatus.trim().toUpperCase());
            }
        }
        if (search != null && !search.trim().isEmpty()) {
            sql.append(" AND (LOWER(c.project_name) LIKE ? OR LOWER(w.project_id) LIKE ?)");
            String term = "%" + search.trim().toLowerCase() + "%";
            params.add(term);
            params.add(term);
        }
    }

    public List<InterventionDto> getInterventions(String status, int limit, int offset) {
        return getInterventions(null, null, null, null, status, null, "priority", limit, offset);
    }

    public List<InterventionDto> getInterventions(
            String sector, String ministry, String state, String riskBand,
            String status, String search, String sortBy, int limit, int offset
    ) {
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
        appendInterventionFilters(sql, params, sector, ministry, state, riskBand, status, search);

        if ("cost".equalsIgnoreCase(sortBy)) {
            sql.append(" ORDER BY c.latest_revised_cost_cr DESC");
        } else if ("delay".equalsIgnoreCase(sortBy)) {
            sql.append(" ORDER BY c.schedule_slippage_months DESC");
        } else if ("name".equalsIgnoreCase(sortBy)) {
            sql.append(" ORDER BY c.project_name ASC");
        } else {
            sql.append(" ORDER BY i.intervention_priority_score DESC, c.overall_risk_score DESC");
        }

        sql.append(" LIMIT ? OFFSET ?");
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

    public int countInterventions(
            String sector, String ministry, String state, String riskBand,
            String status, String search
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT COUNT(*)
            FROM gold_intervention_priority i
            JOIN gold_project_current c ON i.project_id = c.project_id
            LEFT JOIN (
                SELECT p1.project_id, p1.status
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
        appendInterventionFilters(sql, params, sector, ministry, state, riskBand, status, search);

        Integer count = jdbcTemplate.queryForObject(sql.toString(), Integer.class, params.toArray());
        return count != null ? count : 0;
    }

    private void appendInterventionFilters(
            StringBuilder sql, List<Object> params,
            String sector, String ministry, String state, String riskBand,
            String status, String search
    ) {
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
        if (riskBand != null && !riskBand.trim().isEmpty() && !"ALL".equalsIgnoreCase(riskBand)) {
            sql.append(" AND UPPER(c.risk_band) = ?");
            params.add(riskBand.trim().toUpperCase());
        }
        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            sql.append(" AND UPPER(COALESCE(a.status, 'PENDING_REVIEW')) = ?");
            params.add(status.trim().toUpperCase());
        }
        if (search != null && !search.trim().isEmpty()) {
            sql.append(" AND (LOWER(c.project_name) LIKE ? OR LOWER(i.project_id) LIKE ?)");
            String term = "%" + search.trim().toLowerCase() + "%";
            params.add(term);
            params.add(term);
        }
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
