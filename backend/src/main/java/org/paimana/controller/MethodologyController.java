package org.paimana.controller;

import org.paimana.dto.ApiResponse;
import org.paimana.service.OperationsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/methodology")
public class MethodologyController {

    private final OperationsService operationsService;

    public MethodologyController(OperationsService operationsService) {
        this.operationsService = operationsService;
    }

    @GetMapping("/summary")
    public ApiResponse<Map<String, Object>> getMethodologySummary() {
        return ApiResponse.ok(operationsService.getMethodologyMetadata());
    }
}
