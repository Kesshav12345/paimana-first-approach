package org.paimana.service;

import org.paimana.dto.ProjectDetailDto;
import org.paimana.dto.ProjectSummaryDto;
import org.paimana.exception.ResourceNotFoundException;
import org.paimana.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final PythonBridgeClient pythonBridgeClient;

    public ProjectService(ProjectRepository projectRepository, PythonBridgeClient pythonBridgeClient) {
        this.projectRepository = projectRepository;
        this.pythonBridgeClient = pythonBridgeClient;
    }

    public Map<String, Object> getFilterMetadata() {
        return projectRepository.getFilterMetadata();
    }

    public List<ProjectSummaryDto> searchProjects(
            String search, String sector, String ministry, String state, String riskBand,
            String trajectory, String costFilter, String delayFilter, String warningFilter,
            String multiState, String sortBy, int page, int size
    ) {
        int offset = Math.max(0, (page - 1) * size);
        return projectRepository.searchProjects(
                search, sector, ministry, state, riskBand,
                trajectory, costFilter, delayFilter, warningFilter,
                multiState, sortBy, size, offset
        );
    }

    public int countProjects(
            String search, String sector, String ministry, String state, String riskBand,
            String trajectory, String costFilter, String delayFilter, String warningFilter,
            String multiState
    ) {
        return projectRepository.countProjects(
                search, sector, ministry, state, riskBand,
                trajectory, costFilter, delayFilter, warningFilter,
                multiState
        );
    }

    public ProjectDetailDto getProjectIntelligence(String projectId) {
        ProjectDetailDto detail = projectRepository.getProjectDetail(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project with ID " + projectId + " not found"));

        // Enrich with real-time CatBoost Supervised ML Predictions & SHAP Drivers via Python Service
        Map<String, Object> pred = pythonBridgeClient.predictProject(detail);
        if (pred != null) {
            if (pred.get("cost_overrun_probability") != null) {
                detail.setCostOverrunProbability(((Number) pred.get("cost_overrun_probability")).doubleValue());
            }
            if (pred.get("predicted_final_cost_cr") != null) {
                detail.setPredictedFinalCostCr(((Number) pred.get("predicted_final_cost_cr")).doubleValue());
            }
            if (pred.get("predicted_cost_overrun_amount_cr") != null) {
                detail.setPredictedCostOverrunAmountCr(((Number) pred.get("predicted_cost_overrun_amount_cr")).doubleValue());
            }
            if (pred.get("predicted_cost_overrun_pct") != null) {
                detail.setPredictedCostOverrunPct(((Number) pred.get("predicted_cost_overrun_pct")).doubleValue());
            }
            if (pred.get("schedule_overrun_probability") != null) {
                detail.setScheduleOverrunProbability(((Number) pred.get("schedule_overrun_probability")).doubleValue());
            }
            if (pred.get("predicted_delay_months") != null) {
                detail.setPredictedDelayMonths(((Number) pred.get("predicted_delay_months")).doubleValue());
            }
            if (pred.get("predicted_completion_date") != null) {
                detail.setPredictedCompletionDate((String) pred.get("predicted_completion_date"));
            }
            if (pred.get("model_version") != null) {
                detail.setModelVersion((String) pred.get("model_version"));
            }
            if (pred.get("data_quality_confidence") != null) {
                detail.setCostForecastConfidence((String) pred.get("data_quality_confidence"));
                detail.setScheduleForecastConfidence((String) pred.get("data_quality_confidence"));
            }
            if (pred.get("top_risk_drivers") != null) {
                detail.setRiskDrivers((List<Map<String, Object>>) pred.get("top_risk_drivers"));
            }
        }

        return detail;
    }
}
