package org.paimana.controller;

import org.paimana.dto.ApiResponse;
import org.paimana.dto.ProjectSummaryDto;
import org.paimana.dto.SectorSummaryDto;
import org.paimana.service.SectorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sectors")
public class SectorController {

    private final SectorService sectorService;

    public SectorController(SectorService sectorService) {
        this.sectorService = sectorService;
    }

    // Interface 1: Sector Overview (supports multi-dimensional filtering)
    @GetMapping
    public ApiResponse<List<SectorSummaryDto>> getAllSectors(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String ministry,
            @RequestParam(required = false) String riskBand,
            @RequestParam(required = false) String trajectory,
            @RequestParam(required = false) String costFilter,
            @RequestParam(required = false) String delayFilter,
            @RequestParam(required = false) String warningFilter,
            @RequestParam(required = false) String multiState,
            @RequestParam(required = false) String sortBy
    ) {
        return ApiResponse.ok(sectorService.getAllSectors(state, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState, sortBy));
    }

    // Interface 2: Sector -> State Performance
    @GetMapping("/{sectorName}/states")
    public ApiResponse<List<Map<String, Object>>> getSectorStates(
            @PathVariable String sectorName,
            @RequestParam(required = false) String ministry,
            @RequestParam(required = false) String riskBand,
            @RequestParam(required = false) String trajectory,
            @RequestParam(required = false) String costFilter,
            @RequestParam(required = false) String delayFilter,
            @RequestParam(required = false) String warningFilter,
            @RequestParam(required = false) String multiState
    ) {
        return ApiResponse.ok(sectorService.getSectorStates(sectorName, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState));
    }

    // Interface 3: Sector + State -> Projects
    @GetMapping("/{sectorName}/projects")
    public ApiResponse<List<ProjectSummaryDto>> getSectorProjects(
            @PathVariable String sectorName,
            @RequestParam(required = false) String state,
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
        return ApiResponse.ok(sectorService.getSectorProjects(sectorName, state, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState, page, size));
    }
}
