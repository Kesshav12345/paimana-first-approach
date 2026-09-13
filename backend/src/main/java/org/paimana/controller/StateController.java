package org.paimana.controller;

import org.paimana.dto.ApiResponse;
import org.paimana.dto.ProjectSummaryDto;
import org.paimana.dto.StateSummaryDto;
import org.paimana.service.StateService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/states")
public class StateController {

    private final StateService stateService;

    public StateController(StateService stateService) {
        this.stateService = stateService;
    }

    // Interface 1: State Overview
    @GetMapping
    public ApiResponse<List<StateSummaryDto>> getAllStates() {
        return ApiResponse.ok(stateService.getAllStates());
    }

    // Interface 2: State -> Sector Performance
    @GetMapping("/{stateName}/sectors")
    public ApiResponse<List<Map<String, Object>>> getStateSectors(@PathVariable String stateName) {
        return ApiResponse.ok(stateService.getStateSectors(stateName));
    }

    // Interface 3: State + Sector -> Projects
    @GetMapping("/{stateName}/projects")
    public ApiResponse<List<ProjectSummaryDto>> getStateProjects(
            @PathVariable String stateName,
            @RequestParam(required = false) String sector,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(stateService.getStateProjects(stateName, sector, page, size));
    }
}
