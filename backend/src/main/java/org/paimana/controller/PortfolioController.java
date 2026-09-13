package org.paimana.controller;

import org.paimana.dto.ApiResponse;
import org.paimana.dto.PortfolioSummaryDto;
import org.paimana.service.PortfolioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/home")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public ApiResponse<PortfolioSummaryDto> getHomePortfolioSummary() {
        return ApiResponse.ok(portfolioService.getHomeSummary());
    }
}
