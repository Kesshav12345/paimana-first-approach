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
            @RequestParam(required = false) String warningType,
            @RequestParam(required = false) String persistence,
            @RequestParam(required = false) String riskBand,
            @RequestParam(required = false) String interventionStatus,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<EarlyWarningAlertDto> alerts = earlyWarningService.getActiveAlerts(
                sector, ministry, state, severity, warningType, persistence, riskBand, interventionStatus, search, page, size
        );
        int total = earlyWarningService.countActiveAlerts(
                sector, ministry, state, severity, warningType, persistence, riskBand, interventionStatus, search
        );

        Map<String, Object> data = new HashMap<>();
        data.put("alerts", alerts);
        data.put("page", page);
        data.put("size", size);
        data.put("total", total);
        data.put("totalPages", (int) Math.ceil((double) total / size));

        return ApiResponse.ok(data);
    }

    // Active Alerts Summary KPIs
    @GetMapping("/summary")
    public ApiResponse<Map<String, Object>> getEarlyWarningSummary(
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String ministry,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String warningType,
            @RequestParam(required = false) String persistence,
            @RequestParam(required = false) String riskBand,
            @RequestParam(required = false) String interventionStatus,
            @RequestParam(required = false) String search
    ) {
        return ApiResponse.ok(earlyWarningService.getEarlyWarningSummary(
                sector, ministry, state, severity, warningType, persistence, riskBand, interventionStatus, search
        ));
    }

    // Tab 2: Intervention Workflow Tracking
    @GetMapping("/interventions")
    public ApiResponse<Map<String, Object>> getInterventions(
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String ministry,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String riskBand,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "priority") String sortBy,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<InterventionDto> list = earlyWarningService.getInterventions(
                sector, ministry, state, riskBand, status, search, sortBy, page, size
        );
        int total = earlyWarningService.countInterventions(
                sector, ministry, state, riskBand, status, search
        );

        Map<String, Object> data = new HashMap<>();
        data.put("interventions", list);
        data.put("page", page);
        data.put("size", size);
        data.put("total", total);
        data.put("totalPages", (int) Math.ceil((double) total / size));

        return ApiResponse.ok(data);
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
