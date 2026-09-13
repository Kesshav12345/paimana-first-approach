package org.paimana.service;

import org.paimana.dto.ProjectDetailDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class PythonBridgeClient {

    private static final Logger logger = LoggerFactory.getLogger(PythonBridgeClient.class);

    private final RestTemplate restTemplate;
    private final String pythonServiceUrl;

    public PythonBridgeClient(RestTemplate restTemplate, @Value("${python.service.url:http://localhost:8000}") String pythonServiceUrl) {
        this.restTemplate = restTemplate;
        this.pythonServiceUrl = pythonServiceUrl;
    }

    public Map<String, Object> predictProject(ProjectDetailDto detail) {
        String url = pythonServiceUrl + "/api/predict";
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("project_id", detail.getProjectId());
            payload.put("original_cost_cr", detail.getOriginalCostCr());
            payload.put("revised_cost_cr", detail.getLatestRevisedCostCr());
            payload.put("original_doc", detail.getOriginalDoc());
            payload.put("time_elapsed_pct", detail.getTimeElapsedPct());
            payload.put("cost_escalation_pct", detail.getCostEscalationPct());
            payload.put("expenditure_pct", detail.getFinancialProgressPct());
            payload.put("physical_progress_pct", detail.getPhysicalProgressPct());
            payload.put("physical_financial_gap", detail.getPhysicalFinancialGap());
            payload.put("progress_deviation", -detail.getScheduleSlippageMonths());
            payload.put("progress_velocity", 1.5);
            payload.put("schedule_slippage_months", (double) detail.getScheduleSlippageMonths());
            payload.put("overall_risk_score", detail.getOverallRiskScore());
            payload.put("active_warnings_count", detail.getActiveWarningCount());
            payload.put("sector_name", detail.getSectorName());
            payload.put("ministry_name", detail.getMinistryName());
            payload.put("agency_name", detail.getAgencyName());
            payload.put("state_name", detail.getStateName());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (Map<String, Object>) response.getBody();
            }
        } catch (Exception e) {
            logger.warn("Python prediction service unavailable at {}: {}", url, e.getMessage());
        }

        // Deterministic fallback if Python service is offline
        Map<String, Object> fallback = new HashMap<>();
        double probCost = Math.min(0.99, Math.max(0.01, detail.getCostEscalationPct() > 0 ? 0.85 : 0.15));
        double predCost = detail.getLatestRevisedCostCr() > 0 ? detail.getLatestRevisedCostCr() : detail.getOriginalCostCr();
        double probSched = Math.min(0.99, Math.max(0.01, detail.getScheduleSlippageMonths() > 0 ? 0.95 : 0.20));
        double predDelay = (double) detail.getScheduleSlippageMonths();

        fallback.put("cost_overrun_probability", probCost);
        fallback.put("predicted_final_cost_cr", predCost);
        fallback.put("predicted_cost_overrun_amount_cr", Math.max(0.0, predCost - detail.getOriginalCostCr()));
        fallback.put("predicted_cost_overrun_pct", detail.getCostEscalationPct());
        fallback.put("schedule_overrun_probability", probSched);
        fallback.put("predicted_delay_months", predDelay);
        fallback.put("model_version", "v1.0-deterministic-fallback");
        fallback.put("data_quality_confidence", "MODERATE");

        List<Map<String, Object>> drivers = new ArrayList<>();
        drivers.add(Map.of("feature", "cost_escalation_pct", "contribution", 35.0, "direction", detail.getCostEscalationPct() > 0 ? "INCREASES_RISK" : "REDUCES_RISK"));
        drivers.add(Map.of("feature", "schedule_slippage_months", "contribution", 35.0, "direction", detail.getScheduleSlippageMonths() > 0 ? "INCREASES_RISK" : "REDUCES_RISK"));
        drivers.add(Map.of("feature", "physical_progress_pct", "contribution", 30.0, "direction", detail.getPhysicalProgressPct() > 50 ? "REDUCES_RISK" : "INCREASES_RISK"));
        fallback.put("top_risk_drivers", drivers);

        return fallback;
    }

    public Map<String, Object> forwardPdfUpload(MultipartFile file, String month) throws IOException {
        String url = pythonServiceUrl + "/api/operations/ingest-pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };
        body.add("file", resource);
        if (month != null) {
            body.add("reporting_month", month);
        }

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> res = restTemplate.postForEntity(url, requestEntity, Map.class);
        return res.getBody();
    }

    public Map<String, Object> triggerRetrain() {
        String url = pythonServiceUrl + "/api/operations/retrain";
        return restTemplate.postForObject(url, null, Map.class);
    }

    public Map<String, Object> promoteModel() {
        String url = pythonServiceUrl + "/api/operations/promote-model";
        return restTemplate.postForObject(url, null, Map.class);
    }

    public Map<String, Object> refreshPredictions() {
        String url = pythonServiceUrl + "/api/operations/refresh-predictions";
        return restTemplate.postForObject(url, null, Map.class);
    }
}
