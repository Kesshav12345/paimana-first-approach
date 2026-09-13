package org.paimana.controller;

import org.paimana.dto.ApiResponse;
import org.paimana.dto.EarlyWarningAlertDto;
import org.paimana.dto.InterventionDto;
import org.paimana.service.EarlyWarningService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/early-warning")
public class EarlyWarningController {

    private final EarlyWarningService earlyWarningService;

    public EarlyWarningController(EarlyWarningService earlyWarningService) {
        this.earlyWarningService = earlyWarningService;
    }

    // Tab 1: Active Alerts Queue
    @GetMapping("/alerts")
    public ApiResponse<Map<String, Object>> getActiveAlerts(
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String ministry,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<EarlyWarningAlertDto> alerts = earlyWarningService.getActiveAlerts(sector, ministry, state, severity, search, page, size);
        int total = earlyWarningService.countActiveAlerts(sector, ministry, state, severity, search);

        Map<String, Object> data = new HashMap<>();
        data.put("alerts", alerts);
        data.put("page", page);
        data.put("size", size);
        data.put("total", total);
        data.put("totalPages", (int) Math.ceil((double) total / size));

        return ApiResponse.ok(data);
    }

    // Tab 2: Intervention Workflow Tracking
    @GetMapping("/interventions")
    public ApiResponse<List<InterventionDto>> getInterventions(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(earlyWarningService.getInterventions(status, page, size));
    }

    // Update Intervention Workflow State
    @PostMapping("/interventions/{projectId}/status")
    public ApiResponse<Boolean> updateInterventionStatus(
            @PathVariable String projectId,
            @RequestBody Map<String, String> body
    ) {
        String status = body.getOrDefault("status", "UNDER_REVIEW");
        String notes = body.getOrDefault("notes", "");
        boolean updated = earlyWarningService.updateIntervention(projectId, status, notes);
        return ApiResponse.ok(updated);
    }
}
