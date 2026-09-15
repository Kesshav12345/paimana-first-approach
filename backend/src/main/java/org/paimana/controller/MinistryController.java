package org.paimana.controller;

import org.paimana.dto.ApiResponse;
import org.paimana.dto.MinistrySummaryDto;
import org.paimana.dto.ProjectSummaryDto;
import org.paimana.service.MinistryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ministries")
public class MinistryController {

    private final MinistryService ministryService;

    public MinistryController(MinistryService ministryService) {
        this.ministryService = ministryService;
    }

    // Interface 1: Ministry Overview (supports multi-dimensional filtering)
    @GetMapping
    public ApiResponse<List<MinistrySummaryDto>> getAllMinistries(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String riskBand,
            @RequestParam(required = false) String trajectory,
            @RequestParam(required = false) String costFilter,
            @RequestParam(required = false) String delayFilter,
            @RequestParam(required = false) String warningFilter,
            @RequestParam(required = false) String multiState,
            @RequestParam(required = false) String sortBy
    ) {
        return ApiResponse.ok(ministryService.getAllMinistries(state, sector, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState, sortBy));
    }

    // Interface 2: Ministry -> Agency Performance
    @GetMapping("/{ministryName}/agencies")
    public ApiResponse<List<Map<String, Object>>> getMinistryAgencies(
            @PathVariable String ministryName,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String riskBand,
            @RequestParam(required = false) String trajectory,
            @RequestParam(required = false) String costFilter,
            @RequestParam(required = false) String delayFilter,
            @RequestParam(required = false) String warningFilter,
            @RequestParam(required = false) String multiState
    ) {
        return ApiResponse.ok(ministryService.getMinistryAgencies(ministryName, state, sector, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState));
    }

    // Interface 3: Ministry + Agency -> Projects
    @GetMapping("/{ministryName}/projects")
    public ApiResponse<List<ProjectSummaryDto>> getMinistryProjects(
            @PathVariable String ministryName,
            @RequestParam(required = false) String agency,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String riskBand,
            @RequestParam(required = false) String trajectory,
            @RequestParam(required = false) String costFilter,
            @RequestParam(required = false) String delayFilter,
            @RequestParam(required = false) String warningFilter,
            @RequestParam(required = false) String multiState,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(ministryService.getMinistryProjects(ministryName, agency, state, sector, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState, page, size));
    }
}
