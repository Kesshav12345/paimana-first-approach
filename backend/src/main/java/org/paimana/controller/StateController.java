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

    // Interface 1: State Overview (supports multi-dimensional filtering)
    @GetMapping
    public ApiResponse<List<StateSummaryDto>> getAllStates(
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String ministry,
            @RequestParam(required = false) String riskBand,
            @RequestParam(required = false) String trajectory,
            @RequestParam(required = false) String costFilter,
            @RequestParam(required = false) String delayFilter,
            @RequestParam(required = false) String warningFilter,
            @RequestParam(required = false) String multiState,
            @RequestParam(required = false) String sortBy
    ) {
        return ApiResponse.ok(stateService.getAllStates(sector, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState, sortBy));
    }

    // Interface 2: State -> Sector Performance
    @GetMapping("/{stateName}/sectors")
    public ApiResponse<List<Map<String, Object>>> getStateSectors(
            @PathVariable String stateName,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String ministry,
            @RequestParam(required = false) String riskBand,
            @RequestParam(required = false) String trajectory,
            @RequestParam(required = false) String costFilter,
            @RequestParam(required = false) String delayFilter,
            @RequestParam(required = false) String warningFilter,
            @RequestParam(required = false) String multiState
    ) {
        return ApiResponse.ok(stateService.getStateSectors(stateName, sector, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState));
    }

    // Interface 3: State + Sector -> Projects
    @GetMapping("/{stateName}/projects")
    public ApiResponse<List<ProjectSummaryDto>> getStateProjects(
            @PathVariable String stateName,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String ministry,
            @RequestParam(required = false) String riskBand,
            @RequestParam(required = false) String trajectory,
            @RequestParam(required = false) String costFilter,
            @RequestParam(required = false) String delayFilter,
            @RequestParam(required = false) String warningFilter,
            @RequestParam(required = false) String multiState,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(stateService.getStateProjects(stateName, sector, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState, page, size));
    }
}
