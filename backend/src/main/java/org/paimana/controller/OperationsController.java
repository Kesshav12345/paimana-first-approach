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
