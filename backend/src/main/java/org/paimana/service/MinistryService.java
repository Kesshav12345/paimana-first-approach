package org.paimana.service;

import org.paimana.dto.MinistrySummaryDto;
import org.paimana.dto.ProjectSummaryDto;
import org.paimana.repository.MinistryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class MinistryService {

    private final MinistryRepository ministryRepository;

    public MinistryService(MinistryRepository ministryRepository) {
        this.ministryRepository = ministryRepository;
    }

    public List<MinistrySummaryDto> getAllMinistries() {
        return ministryRepository.getAllMinistries();
    }

    public List<MinistrySummaryDto> getAllMinistries(
            String state, String sector, String riskBand,
            String trajectory, String costFilter, String delayFilter,
            String warningFilter, String multiState, String sortBy
    ) {
        return ministryRepository.getAllMinistries(state, sector, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState, sortBy);
    }

    public List<Map<String, Object>> getMinistryAgencies(String ministryName) {
        return ministryRepository.getMinistryAgencyBreakdown(ministryName);
    }

    public List<Map<String, Object>> getMinistryAgencies(
            String ministryName, String state, String sector, String riskBand,
            String trajectory, String costFilter, String delayFilter,
            String warningFilter, String multiState
    ) {
        return ministryRepository.getMinistryAgencyBreakdown(ministryName, state, sector, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState);
    }

    public List<ProjectSummaryDto> getMinistryProjects(String ministryName, String agencyName, int page, int size) {
        int offset = Math.max(0, (page - 1) * size);
        return ministryRepository.getMinistryProjects(ministryName, agencyName, size, offset);
    }

    public List<ProjectSummaryDto> getMinistryProjects(
            String ministryName, String agencyName, String state, String sector, String riskBand,
            String trajectory, String costFilter, String delayFilter,
            String warningFilter, String multiState, int page, int size
    ) {
        int offset = Math.max(0, (page - 1) * size);
        return ministryRepository.getMinistryProjects(ministryName, agencyName, state, sector, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState, size, offset);
    }
}
