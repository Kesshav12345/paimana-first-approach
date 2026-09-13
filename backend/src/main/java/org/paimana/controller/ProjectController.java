package org.paimana.controller;

import org.paimana.dto.ApiResponse;
import org.paimana.dto.ProjectDetailDto;
import org.paimana.dto.ProjectSummaryDto;
import org.paimana.service.ProjectService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping("/filters")
    public ApiResponse<Map<String, Object>> getFilterMetadata() {
        return ApiResponse.ok(projectService.getFilterMetadata());
    }

    @GetMapping
    public ApiResponse<Map<String, Object>> searchProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String ministry,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String riskBand,
            @RequestParam(required = false) String trajectory,
            @RequestParam(required = false) String costFilter,
            @RequestParam(required = false) String delayFilter,
            @RequestParam(required = false) String warningFilter,
            @RequestParam(required = false) String multiState,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<ProjectSummaryDto> projects = projectService.searchProjects(
                search, sector, ministry, state, riskBand,
                trajectory, costFilter, delayFilter, warningFilter,
                multiState, sortBy, page, size
        );
        int total = projectService.countProjects(
                search, sector, ministry, state, riskBand,
                trajectory, costFilter, delayFilter, warningFilter,
                multiState
        );

        Map<String, Object> data = new HashMap<>();
        data.put("projects", projects);
        data.put("page", page);
        data.put("size", size);
        data.put("total", total);
        data.put("totalPages", (int) Math.ceil((double) total / size));

        return ApiResponse.ok(data);
    }

    @GetMapping("/{projectId}")
    public ApiResponse<ProjectDetailDto> getProjectIntelligence(@PathVariable String projectId) {
        ProjectDetailDto detail = projectService.getProjectIntelligence(projectId);
        return ApiResponse.ok(detail);
    }
}
