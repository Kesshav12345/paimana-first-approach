package org.paimana.controller;

import org.paimana.dto.ApiResponse;
import org.paimana.service.ProjectService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/metadata")
public class MetadataController {

    private final ProjectService projectService;

    public MetadataController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping("/filters")
    public ApiResponse<Map<String, Object>> getFilterMetadata() {
        return ApiResponse.ok(projectService.getFilterMetadata());
    }
}
