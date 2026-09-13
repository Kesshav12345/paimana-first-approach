package org.paimana.service;

import org.paimana.dto.PortfolioSummaryDto;
import org.paimana.repository.PortfolioRepository;
import org.springframework.stereotype.Service;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;

    public PortfolioService(PortfolioRepository portfolioRepository) {
        this.portfolioRepository = portfolioRepository;
    }

    public PortfolioSummaryDto getHomeSummary() {
        return portfolioRepository.getPortfolioSummary();
    }
}
