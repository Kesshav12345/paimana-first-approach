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

    // Interface 1: Ministry Overview
    @GetMapping
    public ApiResponse<List<MinistrySummaryDto>> getAllMinistries() {
        return ApiResponse.ok(ministryService.getAllMinistries());
    }

    // Interface 2: Ministry -> Agency Performance
    @GetMapping("/{ministryName}/agencies")
    public ApiResponse<List<Map<String, Object>>> getMinistryAgencies(@PathVariable String ministryName) {
        return ApiResponse.ok(ministryService.getMinistryAgencies(ministryName));
    }

    // Interface 3: Ministry + Agency -> Projects
    @GetMapping("/{ministryName}/projects")
    public ApiResponse<List<ProjectSummaryDto>> getMinistryProjects(
            @PathVariable String ministryName,
            @RequestParam(required = false) String agency,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(ministryService.getMinistryProjects(ministryName, agency, page, size));
    }
}
