package org.paimana.service;

import org.paimana.dto.ProjectSummaryDto;
import org.paimana.dto.SectorSummaryDto;
import org.paimana.repository.SectorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class SectorService {

    private final SectorRepository sectorRepository;

    public SectorService(SectorRepository sectorRepository) {
        this.sectorRepository = sectorRepository;
    }

    public List<SectorSummaryDto> getAllSectors() {
        return sectorRepository.getAllSectors();
    }

    public List<SectorSummaryDto> getAllSectors(
            String state, String ministry, String riskBand,
            String trajectory, String costFilter, String delayFilter,
            String warningFilter, String multiState, String sortBy
    ) {
        return sectorRepository.getAllSectors(state, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState, sortBy);
    }

    public List<Map<String, Object>> getSectorStates(String sectorName) {
        return sectorRepository.getSectorStateBreakdown(sectorName);
    }

    public List<Map<String, Object>> getSectorStates(
            String sectorName, String ministry, String riskBand,
            String trajectory, String costFilter, String delayFilter,
            String warningFilter, String multiState
    ) {
        return sectorRepository.getSectorStateBreakdown(sectorName, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState);
    }

    public List<ProjectSummaryDto> getSectorProjects(String sectorName, String stateName, int page, int size) {
        int offset = Math.max(0, (page - 1) * size);
        return sectorRepository.getSectorProjects(sectorName, stateName, size, offset);
    }

    public List<ProjectSummaryDto> getSectorProjects(
            String sectorName, String stateName, String ministry, String riskBand,
            String trajectory, String costFilter, String delayFilter,
            String warningFilter, String multiState, int page, int size
    ) {
        int offset = Math.max(0, (page - 1) * size);
        return sectorRepository.getSectorProjects(sectorName, stateName, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState, size, offset);
    }
}
