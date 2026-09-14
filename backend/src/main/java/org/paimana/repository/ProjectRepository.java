package org.paimana.repository;

import org.paimana.dto.EarlyWarningAlertDto;
import org.paimana.dto.InterventionDto;
import org.paimana.dto.ProjectDetailDto;
import org.paimana.dto.ProjectSummaryDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class ProjectRepository {

    private final JdbcTemplate jdbcTemplate;

    public ProjectRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> getFilterMetadata() {
        Map<String, Object> meta = new HashMap<>();
        meta.put("sectors", jdbcTemplate.queryForList("SELECT DISTINCT sector_name FROM gold_project_current WHERE sector_name IS NOT NULL AND sector_name != '' ORDER BY sector_name", String.class));
        meta.put("ministries", jdbcTemplate.queryForList("SELECT DISTINCT ministry_name FROM gold_project_current WHERE ministry_name IS NOT NULL AND ministry_name != '' ORDER BY ministry_name", String.class));
        meta.put("states", jdbcTemplate.queryForList("SELECT DISTINCT state_name FROM gold_project_current WHERE state_name IS NOT NULL AND state_name != '' ORDER BY state_name", String.class));
        meta.put("riskBands", List.of("CRITICAL", "HIGH", "MODERATE", "LOW"));
        meta.put("trajectories", List.of("DETERIORATING", "STABLE", "IMPROVING"));
        meta.put("costFilters", List.of(
            Map.of("id", "ALL", "label", "All Budget Profiles"),
            Map.of("id", "ESCALATED", "label", "Cost Escalation (>0%)"),
            Map.of("id", "HIGH_ESCALATION", "label", "High Escalation (>=20%)"),
            Map.of("id", "SEVERE_ESCALATION", "label", "Severe Escalation (>=50%)"),
            Map.of("id", "WITHIN_BUDGET", "label", "Within Sanctioned Budget")
        ));
        meta.put("delayFilters", List.of(
            Map.of("id", "ALL", "label", "All Schedule Profiles"),
            Map.of("id", "DELAYED", "label", "Any Slippage (>0 mo)"),
            Map.of("id", "SEVERE_DELAY", "label", "Major Delay (>=12 mo)"),
            Map.of("id", "CRITICAL_DELAY", "label", "Critical Delay (>=24 mo)"),
            Map.of("id", "ON_TIME", "label", "On Schedule or Ahead")
        ));
        meta.put("warningFilters", List.of(
            Map.of("id", "ALL", "label", "All Alert Levels"),
            Map.of("id", "HAS_WARNINGS", "label", "Active Warnings (>=1)"),
            Map.of("id", "MULTI_WARNING", "label", "Multi-Warning Alerted (>=2)"),
            Map.of("id", "NO_WARNINGS", "label", "Zero Warnings")
        ));
        return meta;
    }

    public List<ProjectSummaryDto> searchProjects(
            String search, String sector, String ministry, String state, String riskBand,
            String trajectory, String costFilter, String delayFilter, String warningFilter,
            String multiState, String sortBy, int limit, int offset
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT 
                project_id, project_name, sector_name, ministry_name, agency_name, state_name,
                is_multi_state, original_cost_cr, latest_revised_cost_cr, cumulative_expenditure_cr,
                physical_progress_pct, cost_escalation_pct, schedule_slippage_months,
                overall_risk_score, risk_band, risk_trajectory, active_warning_count,
                intervention_priority_score, intervention_recommendation, latest_reporting_month
            FROM gold_project_current
            WHERE 1=1
        """);

        List<Object> params = new ArrayList<>();
        appendFilters(sql, params, search, sector, ministry, state, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState);

        if ("cost".equalsIgnoreCase(sortBy)) {
            sql.append(" ORDER BY latest_revised_cost_cr DESC, overall_risk_score DESC LIMIT ? OFFSET ?");
        } else if ("escalation".equalsIgnoreCase(sortBy)) {
            sql.append(" ORDER BY cost_escalation_pct DESC, overall_risk_score DESC LIMIT ? OFFSET ?");
        } else if ("delay".equalsIgnoreCase(sortBy)) {
            sql.append(" ORDER BY schedule_slippage_months DESC, overall_risk_score DESC LIMIT ? OFFSET ?");
        } else if ("progress".equalsIgnoreCase(sortBy)) {
            sql.append(" ORDER BY physical_progress_pct ASC, overall_risk_score DESC LIMIT ? OFFSET ?");
        } else if ("name".equalsIgnoreCase(sortBy)) {
            sql.append(" ORDER BY project_name ASC LIMIT ? OFFSET ?");
        } else {
            sql.append(" ORDER BY overall_risk_score DESC, latest_revised_cost_cr DESC LIMIT ? OFFSET ?");
        }

        params.add(limit);
        params.add(offset);

        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> {
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
        }, params.toArray());
    }

    public int countProjects(
            String search, String sector, String ministry, String state, String riskBand,
            String trajectory, String costFilter, String delayFilter, String warningFilter,
            String multiState
    ) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM gold_project_current WHERE 1=1");
        List<Object> params = new ArrayList<>();
        appendFilters(sql, params, search, sector, ministry, state, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState);
        Integer count = jdbcTemplate.queryForObject(sql.toString(), Integer.class, params.toArray());
        return count != null ? count : 0;
    }

    private void appendFilters(
            StringBuilder sql, List<Object> params,
            String search, String sector, String ministry, String state, String riskBand,
            String trajectory, String costFilter, String delayFilter, String warningFilter,
            String multiState
    ) {
        if (search != null && !search.trim().isEmpty()) {
            sql.append(" AND (LOWER(project_name) LIKE ? OR LOWER(project_id) LIKE ?)");
            String term = "%" + search.trim().toLowerCase() + "%";
            params.add(term);
            params.add(term);
        }
        if (sector != null && !sector.trim().isEmpty() && !"ALL".equalsIgnoreCase(sector)) {
            sql.append(" AND sector_name = ?");
            params.add(sector.trim());
        }
        if (ministry != null && !ministry.trim().isEmpty() && !"ALL".equalsIgnoreCase(ministry)) {
            sql.append(" AND ministry_name = ?");
            params.add(ministry.trim());
        }
        if (state != null && !state.trim().isEmpty() && !"ALL".equalsIgnoreCase(state)) {
            sql.append(" AND state_name = ?");
            params.add(state.trim());
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
        } else if ("WITHIN_BUDGET".equalsIgnoreCase(costFilter)) {
            sql.append(" AND cost_escalation_pct <= 0");
        }

        if ("DELAYED".equalsIgnoreCase(delayFilter)) {
            sql.append(" AND schedule_slippage_months > 0");
        } else if ("SEVERE_DELAY".equalsIgnoreCase(delayFilter)) {
            sql.append(" AND schedule_slippage_months >= 12");
        } else if ("CRITICAL_DELAY".equalsIgnoreCase(delayFilter)) {
            sql.append(" AND schedule_slippage_months >= 24");
        } else if ("ON_TIME".equalsIgnoreCase(delayFilter)) {
            sql.append(" AND schedule_slippage_months <= 0");
        }

        if ("HAS_WARNINGS".equalsIgnoreCase(warningFilter)) {
            sql.append(" AND active_warning_count > 0");
        } else if ("MULTI_WARNING".equalsIgnoreCase(warningFilter)) {
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

    public Optional<ProjectDetailDto> getProjectDetail(String projectId) {
        String currentSql = """
            SELECT 
                c.project_id, c.project_name, c.sector_name, c.ministry_name, c.agency_name, c.state_name,
                c.is_multi_state, c.original_cost_cr, c.latest_revised_cost_cr, c.cumulative_expenditure_cr,
                c.physical_progress_pct, c.financial_progress_pct, c.physical_financial_gap,
                c.cost_escalation_pct, c.original_doc, c.anticipated_doc, c.schedule_slippage_months,
                c.overall_risk_score, c.risk_band, c.risk_trajectory, c.active_warning_count,
                c.intervention_priority_score, c.intervention_recommendation, c.latest_reporting_month,
                p.legacy_ocms_code, p.pmgid, p.project_lifecycle_status, p.original_approval_date, p.actual_start_date,
                COALESCE(r.cost_risk_score, 0.0) as cost_risk_score,
                COALESCE(r.schedule_risk_score, 0.0) as schedule_risk_score,
                COALESCE(r.progress_risk_score, 0.0) as progress_risk_score
            FROM gold_project_current c
            LEFT JOIN dim_project p ON c.project_id = p.project_id
            LEFT JOIN gold_risk_engine_outputs r ON c.project_id = r.project_id AND c.latest_reporting_month = r.reporting_month
            WHERE c.project_id = ?
        """;

        List<ProjectDetailDto> results = jdbcTemplate.query(currentSql, new Object[]{projectId}, (rs, rowNum) -> {
            ProjectDetailDto d = new ProjectDetailDto();
            d.setProjectId(rs.getString("project_id"));
            d.setLegacyOcmsCode(rs.getString("legacy_ocms_code"));
            d.setPmgid(rs.getString("pmgid"));
            d.setProjectName(rs.getString("project_name"));
            d.setSectorName(rs.getString("sector_name"));
            d.setMinistryName(rs.getString("ministry_name"));
            d.setAgencyName(rs.getString("agency_name"));
            d.setStateName(rs.getString("state_name"));
            d.setMultiState(rs.getInt("is_multi_state") == 1);
            d.setProjectLifecycleStatus(rs.getString("project_lifecycle_status"));
            d.setLatestReportingMonth(rs.getString("latest_reporting_month"));

            double origCost = rs.getDouble("original_cost_cr");
            double revCost = rs.getDouble("latest_revised_cost_cr");
            double exp = rs.getDouble("cumulative_expenditure_cr");
            double physProg = rs.getDouble("physical_progress_pct");

            d.setOriginalCostCr(origCost);
            d.setLatestRevisedCostCr(revCost);
            d.setCumulativeExpenditureCr(exp);
            d.setPhysicalProgressPct(physProg);
            d.setFinancialProgressPct(rs.getDouble("financial_progress_pct"));
            d.setPhysicalFinancialGap(rs.getDouble("physical_financial_gap"));
            d.setCostEscalationAmountCr(Math.max(0.0, revCost - origCost));
            d.setCostEscalationPct(rs.getDouble("cost_escalation_pct"));
            d.setCostGrowthFactor(origCost > 0 ? Math.round((revCost / origCost) * 1000.0) / 1000.0 : 1.0);
            d.setRemainingFinancialExposureCr(Math.max(0.0, revCost - exp));
            d.setOriginalApprovalDate(rs.getString("original_approval_date"));
            d.setActualStartDate(rs.getString("actual_start_date"));
            d.setOriginalDoc(rs.getString("original_doc"));
            d.setAnticipatedDoc(rs.getString("anticipated_doc"));
            d.setScheduleSlippageMonths(rs.getInt("schedule_slippage_months"));

            double riskScore = rs.getDouble("overall_risk_score");
            String riskBand = rs.getString("risk_band");
            d.setOverallRiskScore(riskScore);
            d.setRiskBand(riskBand);
            d.setRiskTrajectory(rs.getString("risk_trajectory"));
            d.setActiveWarningCount(rs.getInt("active_warning_count"));
            d.setInterventionPriorityScore(rs.getDouble("intervention_priority_score"));

            // Lifecycle phase assessment
            String lifeStatus = rs.getString("project_lifecycle_status");
            boolean isCompleted = "Completed".equalsIgnoreCase(lifeStatus) || physProg >= 98.0;
            boolean isCommissioning = "Commissioning".equalsIgnoreCase(lifeStatus) || (physProg >= 95.0 && !isCompleted);

            // Risk decomposition mapped directly from canonical engine outputs
            d.setCostRiskScore(rs.getDouble("cost_risk_score"));
            d.setScheduleRiskScore(rs.getDouble("schedule_risk_score"));
            d.setProgressRiskScore(rs.getDouble("progress_risk_score"));

            // Health Status
            if (isCompleted) {
                d.setHealthStatus("COMPLETED");
            } else if (isCommissioning) {
                d.setHealthStatus("COMMISSIONING");
            } else {
                String traj = rs.getString("risk_trajectory");
                d.setHealthStatus("DETERIORATING".equalsIgnoreCase(traj) ? "DETERIORATING" : ("IMPROVING".equalsIgnoreCase(traj) ? "IMPROVING" : "STABLE"));
            }
            
            List<String> pos = new ArrayList<>();
            List<String> neg = new ArrayList<>();
            if (isCompleted) {
                pos.add("Physical execution 100% complete & commissioned into service");
                pos.add("Operational handover complete; plant/facility in active operation");
                pos.add("Defect liability period (DLP) & administrative closure underway");
                neg.add("Zero active construction implementation risk");
            } else if (isCommissioning) {
                pos.add("Advanced pre-commissioning phase (" + String.format("%.1f", physProg) + "% progress)");
                pos.add("Trial run and grid/traffic synchronization active");
                if (d.getPhysicalFinancialGap() < -15.0) neg.add("Final billing reconciliation active");
            } else {
                if (physProg >= 80.0) pos.add("Advanced physical completion (" + physProg + "%)");
                if (d.getCostEscalationPct() <= 0.0) pos.add("Zero sanctioned budget escalation");
                if (d.getScheduleSlippageMonths() == 0) pos.add("On-schedule commissioning target");
                if (d.getCostEscalationPct() > 20.0) neg.add("Severe cost escalation (+" + d.getCostEscalationPct() + "%)");
                if (d.getScheduleSlippageMonths() > 12) neg.add("Over 12 months commissioning delay (" + d.getScheduleSlippageMonths() + " mos)");
                if (d.getPhysicalFinancialGap() < -15.0) neg.add("Financial burn outpacing physical progress by " + Math.abs(d.getPhysicalFinancialGap()) + "%");
                if (pos.isEmpty()) pos.add("Baseline monitoring active");
                if (neg.isEmpty()) neg.add("No adverse thresholds breached");
            }
            d.setPositiveSignals(pos);
            d.setNegativeSignals(neg);

            return d;
        });

        if (results.isEmpty()) {
            return Optional.empty();
        }

        ProjectDetailDto detail = results.get(0);
        double physProg = detail.getPhysicalProgressPct();
        boolean isCompleted = "Completed".equalsIgnoreCase(detail.getProjectLifecycleStatus()) || physProg >= 98.0;
        boolean isCommissioning = "Commissioning".equalsIgnoreCase(detail.getProjectLifecycleStatus()) || (physProg >= 95.0 && !isCompleted);

        // 7. Trajectory History (Monthly time series)
        String histSql = """
            SELECT 
                f.reporting_month, f.physical_progress_pct, f.cumulative_expenditure_cr, 
                f.revised_cost_cr, COALESCE(m.cost_escalation_pct, 0.0) as cost_escalation_pct,
                COALESCE(m.schedule_slippage_months, 0) as schedule_slippage_months,
                COALESCE(r.overall_risk_score, 0.0) as overall_risk_score
            FROM fact_project_month f
            LEFT JOIN gold_project_monthly_metrics m ON f.project_id = m.project_id AND f.reporting_month = m.reporting_month
            LEFT JOIN gold_risk_engine_outputs r ON f.project_id = r.project_id AND f.reporting_month = r.reporting_month
            WHERE f.project_id = ?
            ORDER BY f.reporting_month ASC
        """;
        List<Map<String, Object>> history = jdbcTemplate.queryForList(histSql, projectId);
        detail.setMonthlyHistory(history);

        // 8. Active Warnings (Filtered to Active alerts with true priority score)
        String warnSql = """
            SELECT 
                warning_id as alert_id, project_id, reporting_month, warning_type, severity, 
                trigger_rule as trigger_condition, trigger_value, threshold_value, status as alert_status, 
                persistence_months as persistence_periods, reporting_month as first_trigger_date, reporting_month as last_trigger_date, 
                COALESCE(intervention_priority_score, 50.0) as intervention_priority_score, '' as recommended_intervention
            FROM gold_warning_alerts
            WHERE project_id = ? AND UPPER(status) = 'ACTIVE'
            ORDER BY persistence_months DESC
        """;
        List<EarlyWarningAlertDto> warnings = jdbcTemplate.query(warnSql, new Object[]{projectId}, (rs, rowNum) -> {
            EarlyWarningAlertDto w = new EarlyWarningAlertDto();
            w.setAlertId(rs.getString("alert_id"));
            w.setProjectId(rs.getString("project_id"));
            w.setReportingMonth(rs.getString("reporting_month"));
            w.setWarningType(rs.getString("warning_type"));
            w.setSeverity(rs.getString("severity"));
            w.setTriggerCondition(rs.getString("trigger_condition"));
            w.setTriggerValue(rs.getDouble("trigger_value"));
            w.setThresholdValue(rs.getDouble("threshold_value"));
            w.setAlertStatus(rs.getString("alert_status"));
            w.setPersistencePeriods(rs.getInt("persistence_periods"));
            w.setFirstTriggerDate(rs.getString("first_trigger_date"));
            w.setLastTriggerDate(rs.getString("last_trigger_date"));
            w.setInterventionPriorityScore(rs.getDouble("intervention_priority_score"));
            w.setRecommendedIntervention(rs.getString("recommended_intervention"));
            return w;
        });
        detail.setActiveWarnings(warnings);

        // 9. Why Flagged (Lifecycle-informed reasoning)
        List<Map<String, String>> flagging = new ArrayList<>();
        if (isCompleted) {
            flagging.add(Map.of(
                "signal_type", "Post-Commissioning Asset Handover",
                "detail", "Project construction is 100% complete and operational. Active monitoring is maintained strictly for defect liability period (DLP) oversight and Project Completion Report (PCR) submission."
            ));
        } else if (isCommissioning) {
            flagging.add(Map.of(
                "signal_type", "Pre-Commissioning Stage",
                "detail", "Project has achieved advanced physical execution (" + physProg + "%). Critical path construction is finished; final trial runs and statutory grid/safety clearances active."
            ));
        } else {
            if (detail.getCostEscalationPct() > 0) {
                flagging.add(Map.of("signal_type", "Observed Cost Escalation", "detail", "Project budget increased by " + detail.getCostEscalationPct() + "% over original sanctioned baseline."));
            }
            if (detail.getScheduleSlippageMonths() > 0) {
                flagging.add(Map.of("signal_type", "Schedule Slippage", "detail", "Target commissioning date delayed by " + detail.getScheduleSlippageMonths() + " months."));
            }
            if (detail.getPhysicalFinancialGap() < -10) {
                flagging.add(Map.of("signal_type", "Progress-Expenditure Divergence", "detail", "Expenditure burn exceeds physical progress certification by " + Math.abs(detail.getPhysicalFinancialGap()) + "%."));
            }
            if (flagging.isEmpty()) {
                flagging.add(Map.of("signal_type", "Normal Operations", "detail", "All monitored operational metrics remain within sanctioned project parameters."));
            }
        }
        detail.setFlaggingReasons(flagging);

        // 11. Peer Benchmarks (Deterministic Grouping)
        String benchSql = """
            SELECT 
                COUNT(*) as peer_count,
                ROUND(AVG(physical_progress_pct), 1) as peer_avg_progress,
                ROUND(AVG(cost_escalation_pct), 1) as peer_avg_escalation,
                ROUND(AVG(schedule_slippage_months), 1) as peer_avg_delay
            FROM gold_project_current
            WHERE sector_name = ?
        """;
        List<Map<String, Object>> peerRes = jdbcTemplate.queryForList(benchSql, detail.getSectorName());
        if (!peerRes.isEmpty()) {
            Map<String, Object> bm = new HashMap<>(peerRes.get(0));
            bm.put("peer_group", detail.getSectorName() + " Infrastructure Cohort");
            detail.setPeerBenchmark(bm);
        }

        // 12. Official Attention Priorities (Evaluated by severity & lifecycle)
        List<Map<String, String>> official = new ArrayList<>();
        if (isCompleted) {
            official.add(Map.of(
                "priority", "Routine Priority", 
                "area", "Commercial Settlement & Asset Capitalization", 
                "evidence", "Physical deliverables 100% completed (" + physProg + "% progress)", 
                "recommendation", "Reconcile final contractor variation claims, release retention guarantees, and submit formal PCR to MoSPI."
            ));
        } else if (isCommissioning) {
            official.add(Map.of(
                "priority", "Priority 1", 
                "area", "Commercial Operation Declaration (COD)", 
                "evidence", "Physical progress at " + physProg + "% in trial synchronization", 
                "recommendation", "Expedite statutory clearances (CEA/DGMS/CRS) and declare formal Commercial Operation Date (COD)."
            ));
        } else {
            if (detail.getScheduleSlippageMonths() > 0) {
                official.add(Map.of(
                    "priority", "Priority 1", 
                    "area", "Schedule Recovery", 
                    "evidence", detail.getScheduleSlippageMonths() + " months commissioning delay recorded", 
                    "recommendation", "Convene Joint Project Review to establish revised critical path milestone baseline."
                ));
            }
            if (detail.getCostEscalationPct() > 0) {
                official.add(Map.of(
                    "priority", official.isEmpty() ? "Priority 1" : "Priority 2", 
                    "area", "Cost Oversight", 
                    "evidence", "Sanctioned escalation of +" + String.format("%.1f", detail.getCostEscalationPct()) + "% (+Rs. " + String.format("%.1f", detail.getCostEscalationAmountCr()) + " Cr)", 
                    "recommendation", "Conduct revised cost committee audit and freeze non-essential variation orders."
                ));
            }
            if (detail.getPhysicalFinancialGap() < -10) {
                official.add(Map.of(
                    "priority", "Priority " + (official.size() + 1), 
                    "area", "Financial-Physical Alignment", 
                    "evidence", "Disbursement leads physical progress by " + String.format("%.1f", Math.abs(detail.getPhysicalFinancialGap())) + "% pts", 
                    "recommendation", "Enforce deliverable-linked disbursement controls and perform physical site verification."
                ));
            }
            if (official.isEmpty()) {
                official.add(Map.of(
                    "priority", "Routine Priority", 
                    "area", "Baseline Tracking", 
                    "evidence", "All key metrics within tolerance bounds", 
                    "recommendation", "Maintain standard monthly milestone surveillance."
                ));
            }
        }
        detail.setOfficialAttentionPriorities(official);

        // 13. Recommended Interventions (Evaluated & Data-Driven)
        List<Map<String, String>> recs = new ArrayList<>();
        if (isCompleted) {
            Map<String, String> r0 = new HashMap<>();
            r0.put("measure", "Final Commercial Settlement & Project Completion Report (PCR) Submission");
            r0.put("reason", "Project construction is 100% completed and commissioned. Asset has entered commercial operations.");
            r0.put("responsible_authority", detail.getAgencyName() + " & " + detail.getMinistryName() + " Finance Wing");
            r0.put("priority", "ROUTINE");
            r0.put("action_plan", "1. Finalize contractor final bill reconciliations and audit variation claims. 2. Release defect liability retention deposits per contract terms. 3. Submit formal Project Completion Report (PCR) to MoSPI and Administrative Line Ministry.");
            r0.put("expected_impact", "Formal administrative closure, asset capitalization in audited balance sheet, and release of statutory bank guarantees.");
            r0.put("evaluation_logic", "Triggered because physical progress is complete (>= 98.0% / commissioned); project transitioned from construction to operational lifecycle.");
            recs.add(r0);
        } else if (isCommissioning) {
            Map<String, String> r0 = new HashMap<>();
            r0.put("measure", "Pre-Commissioning Testing, Punch-List Clearance & Commercial Operation Declaration (COD)");
            r0.put("reason", "Project in advanced commissioning / synchronization phase with " + physProg + "% physical deliverables complete.");
            r0.put("responsible_authority", detail.getAgencyName() + " & Sector Technical Directorate");
            r0.put("priority", "MODERATE");
            r0.put("action_plan", "1. Complete multi-unit trial runs, statutory safety clearances (CEA/DGMS/CRS), and grid/traffic synchronization. 2. Clear minor punch-list civil works within 45 days. 3. Formally declare Commercial Operation Date (COD).");
            r0.put("expected_impact", "Full commercial commissioning, commercial generation/traffic tolling commencement, and operational asset handover.");
            r0.put("evaluation_logic", "Triggered because physical progress is >= 95.0%; critical path construction is complete; final pre-commissioning procedures active.");
            recs.add(r0);
        } else {
            int slippage = detail.getScheduleSlippageMonths();
            double costEsc = detail.getCostEscalationPct();
            double costEscCr = detail.getCostEscalationAmountCr();
            double gap = detail.getPhysicalFinancialGap();

            if (slippage >= 24) {
                Map<String, String> r1 = new HashMap<>();
                r1.put("measure", "Critical Path Acceleration & Taskforce Deployment");
                r1.put("reason", "Cumulative commissioning slippage of " + slippage + " months severely compromises economic rate of return and asset utility.");
                r1.put("responsible_authority", "Central Ministry Monitoring Cell / PM-GatiShakti Taskforce");
                r1.put("priority", "CRITICAL");
                r1.put("action_plan", "1. Institute bi-weekly critical path sprint reviews. 2. Clear state right-of-way/forest clearances within 30 days. 3. Issue formal contractual cure notice to EPC consortium.");
                r1.put("expected_impact", "Arrests schedule slippage and targets commercial operations within compressed window.");
                r1.put("evaluation_logic", "Triggered because schedule slippage (" + slippage + " mos) exceeds Critical threshold of 24 months.");
                recs.add(r1);
            } else if (slippage >= 6) {
                Map<String, String> r1 = new HashMap<>();
                r1.put("measure", "Milestone Catch-Up Recovery Plan");
                r1.put("reason", "Commissioning delayed by " + slippage + " months against approved schedule baseline.");
                r1.put("responsible_authority", detail.getAgencyName() + " Project Director");
                r1.put("priority", "HIGH");
                r1.put("action_plan", "1. Mandate contractor to submit augmented resource deployment matrix. 2. Parallel-track civil construction and equipment procurement.");
                r1.put("expected_impact", "Recovers 15-20% of schedule loss over next two reporting quarters.");
                r1.put("evaluation_logic", "Triggered because schedule slippage (" + slippage + " mos) exceeds 6 months threshold.");
                recs.add(r1);
            }

            if (costEsc >= 20.0 || costEscCr >= 500.0) {
                Map<String, String> r2 = new HashMap<>();
                r2.put("measure", "Independent Quantity Survey & Revised Cost Committee (RC) Appraisal");
                r2.put("reason", "Project budget expanded by " + String.format("%.1f", costEsc) + "% (+Rs. " + String.format("%.1f", costEscCr) + " Cr) over sanctioned allocation.");
                r2.put("responsible_authority", "Ministry Financial Advisor & Expenditure Finance Committee (EFC)");
                r2.put("priority", "CRITICAL");
                r2.put("action_plan", "1. Institute third-party quantity survey audit to verify contractor variation claims. 2. Freeze non-essential scope expansion. 3. Submit RCE appraisal to Cabinet.");
                r2.put("expected_impact", "Establishes legally audited revised cost ceiling and prevents unauthorized expenditure.");
                r2.put("evaluation_logic", "Triggered because cost escalation exceeds statutory 20% / Rs. 500 Cr threshold under GFR Rule 130.");
                recs.add(r2);
            } else if (costEsc > 5.0) {
                Map<String, String> r2 = new HashMap<>();
                r2.put("measure", "Cost Engineering & Variation Review");
                r2.put("reason", "Budget expansion of +" + String.format("%.1f", costEsc) + "% (+Rs. " + String.format("%.1f", costEscCr) + " Cr) observed over baseline.");
                r2.put("responsible_authority", detail.getAgencyName() + " Finance Wing");
                r2.put("priority", "HIGH");
                r2.put("action_plan", "1. Re-examine contractor rate escalations and uncommitted contingencies. 2. Tighten expenditure approvals.");
                r2.put("expected_impact", "Prevents budget creep from exceeding tolerance bounds.");
                r2.put("evaluation_logic", "Triggered because cost escalation exceeds 5% baseline tolerance.");
                recs.add(r2);
            }

            if (gap < -15.0) {
                Map<String, String> r3 = new HashMap<>();
                r3.put("measure", "Physical Output Verification & Staged Disbursement Freeze");
                r3.put("reason", "Financial burn (" + String.format("%.1f", detail.getFinancialProgressPct()) + "%) outpaces physical progress (" + String.format("%.1f", detail.getPhysicalProgressPct()) + "%) by " + String.format("%.1f", Math.abs(gap)) + "% points.");
                r3.put("responsible_authority", "Chief Vigilance Officer & Third-Party Inspection Agency (TPIA)");
                r3.put("priority", "HIGH");
                r3.put("action_plan", "1. Perform on-site technical inspection with drone/geotagged verification. 2. Condition further disbursements on certified milestone deliverables.");
                r3.put("expected_impact", "Eliminates premature billing and aligns disbursement run-rate with verified physical outputs.");
                r3.put("evaluation_logic", "Triggered because physical-financial gap (" + String.format("%.1f", gap) + "%) breaches the -15% governance threshold.");
                recs.add(r3);
            }

            if (detail.isMultiState()) {
                Map<String, String> r4 = new HashMap<>();
                r4.put("measure", "Inter-State PMG Coordination Portal Escalation");
                r4.put("reason", "Project traverses multiple state jurisdictions requiring synchronized right-of-way and utility relocation.");
                r4.put("responsible_authority", "Cabinet Secretariat PMG / PRAGATI Cell");
                r4.put("priority", "MEDIUM");
                r4.put("action_plan", "1. Table project in monthly PMG inter-state coordination meeting. 2. Harmonize land acquisition compensation schedules.");
                r4.put("expected_impact", "Resolves multi-state administrative impasses.");
                r4.put("evaluation_logic", "Triggered by multi-state corridor classification.");
                recs.add(r4);
            }

            if (recs.isEmpty()) {
                Map<String, String> r0 = new HashMap<>();
                r0.put("measure", "Routine Milestone Surveillance & Handover Readiness");
                r0.put("reason", "All project operational metrics remain within allowable sanctioned baselines (Overall Risk: " + detail.getOverallRiskScore() + ").");
                r0.put("responsible_authority", detail.getAgencyName() + " Project Implementation Unit");
                r0.put("priority", "ROUTINE");
                r0.put("action_plan", "1. Maintain monthly physical milestone tracking in OCMS. 2. Prepare pre-commissioning operational checklists.");
                r0.put("expected_impact", "Ensures seamless commercial commissioning upon completion.");
                r0.put("evaluation_logic", "Standard governance protocol for projects operating within allowable tolerances.");
                recs.add(r0);
            }
        }
        detail.setRecommendedInterventions(recs);

        // 14 & 15. Intervention Tracking & Effectiveness (Real Operational Audit)
        String actionSql = """
            SELECT 
                project_id, status, action_type, decision_authority,
                planned_date, actual_start_date, follow_up_date, action_notes
            FROM project_intervention_actions
            WHERE project_id = ?
            ORDER BY action_id DESC
        """;
        List<InterventionDto> intList = jdbcTemplate.query(actionSql, new Object[]{projectId}, (rs, rowNum) -> {
            InterventionDto iv = new InterventionDto();
            iv.setProjectId(rs.getString("project_id"));
            iv.setProjectName(detail.getProjectName());
            iv.setSectorName(detail.getSectorName());
            iv.setMinistryName(detail.getMinistryName());
            iv.setAgencyName(detail.getAgencyName());
            iv.setStateName(detail.getStateName());
            iv.setReportingMonth(detail.getLatestReportingMonth());
            iv.setInterventionStatus(rs.getString("status"));
            iv.setRecommendedIntervention(rs.getString("action_type"));
            iv.setResponsibleAuthority(rs.getString("decision_authority"));
            iv.setPlannedDate(rs.getString("planned_date"));
            iv.setActualStartDate(rs.getString("actual_start_date"));
            iv.setFollowUpDate(rs.getString("follow_up_date"));
            iv.setLatestActionNotes(rs.getString("action_notes"));
            return iv;
        });

        detail.setInterventions(intList);
        if (!intList.isEmpty()) {
            detail.setInterventionEffectivenessStatus(intList.get(0).getInterventionStatus());
        } else {
            detail.setInterventionEffectivenessStatus("NOT_SCHEDULED");
        }

        return Optional.of(detail);
    }
}
