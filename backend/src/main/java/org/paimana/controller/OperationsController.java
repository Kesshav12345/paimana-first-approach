package org.paimana.controller;

import org.paimana.dto.ApiResponse;
import org.paimana.dto.OperationsStatusDto;
import org.paimana.service.OperationsService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/operations")
public class OperationsController {

    private final OperationsService operationsService;

    public OperationsController(OperationsService operationsService) {
        this.operationsService = operationsService;
    }

    @GetMapping("/status")
    public ApiResponse<OperationsStatusDto> getOperationsStatus() {
        return ApiResponse.ok(operationsService.getStatus());
    }

    @PostMapping(value = "/intelligence-refresh", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, Object>> triggerIntelligenceRefresh(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "reporting_month", required = false) String reportingMonth,
            @RequestParam(value = "force_reprocess", required = false, defaultValue = "false") Boolean forceReprocess
    ) throws IOException {
        if (file.isEmpty()) {
            return ApiResponse.error("Uploaded report file is empty");
        }
        Map<String, Object> result = operationsService.triggerIntelligenceRefresh(file, reportingMonth, forceReprocess);
        return ApiResponse.ok("Monthly report accepted and 12-stage Intelligence Refresh pipeline initiated", result);
    }

    @GetMapping("/jobs/{jobId}")
    public ApiResponse<Map<String, Object>> getJobProgress(@PathVariable("jobId") String jobId) {
        return ApiResponse.ok(operationsService.getJobProgress(jobId));
    }

    @GetMapping("/recent-runs")
    public ApiResponse<java.util.List<Map<String, Object>>> getRecentPipelineRuns(
            @RequestParam(value = "limit", required = false, defaultValue = "10") int limit
    ) {
        return ApiResponse.ok(operationsService.getRecentPipelineRuns(limit));
    }

    @PostMapping("/refresh-external-intelligence")
    public ApiResponse<Map<String, Object>> refreshExternalIntelligence(
            @RequestBody(required = false) Map<String, Object> body
    ) {
        String scope = body != null && body.containsKey("scope") ? String.valueOf(body.get("scope")) : "AFFECTED";
        Integer limit = body != null && body.containsKey("limit") ? Integer.parseInt(String.valueOf(body.get("limit"))) : 15;
        Map<String, Object> result = operationsService.refreshExternalIntelligence(scope, limit);
        return ApiResponse.ok("External intelligence research initiated for scope: " + scope, result);
    }

    @PostMapping("/recalculate-derived")
    public ApiResponse<Map<String, Object>> recalculateDerivedValues() {
        Map<String, Object> result = operationsService.recalculateDerivedValues();
        return ApiResponse.ok("Deterministic metrics, risk indices, and early warnings recalculation initiated", result);
    }

    @PostMapping(value = "/upload-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, Object>> uploadProjectPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "reporting_month", required = false) String reportingMonth
    ) throws IOException {
        if (file.isEmpty()) {
            return ApiResponse.error("Uploaded file is empty");
        }
        Map<String, Object> result = operationsService.uploadAndIngestPdf(file, reportingMonth);
        return ApiResponse.ok("File uploaded and automated ETL ingestion pipeline initiated", result);
    }

    @PostMapping("/retrain")
    public ApiResponse<Map<String, Object>> triggerRetrain() {
        Map<String, Object> result = operationsService.triggerRetrain();
        return ApiResponse.ok("Candidate model retraining job initiated", result);
    }

    @PostMapping("/promote")
    public ApiResponse<Map<String, Object>> promoteModel() {
        Map<String, Object> result = operationsService.promoteCandidateModel();
        return ApiResponse.ok("Candidate model promoted to active production", result);
    }

    @PostMapping("/refresh")
    public ApiResponse<Map<String, Object>> refreshPredictions() {
        Map<String, Object> result = operationsService.refreshPredictions();
        return ApiResponse.ok("All portfolio predictions and risk scores refreshed", result);
    }
}

