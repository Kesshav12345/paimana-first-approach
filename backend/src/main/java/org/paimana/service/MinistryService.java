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

    public List<Map<String, Object>> getMinistryAgencies(String ministryName) {
        return ministryRepository.getMinistryAgencyBreakdown(ministryName);
    }

    public List<ProjectSummaryDto> getMinistryProjects(String ministryName, String agencyName, int page, int size) {
        int offset = Math.max(0, (page - 1) * size);
        return ministryRepository.getMinistryProjects(ministryName, agencyName, size, offset);
    }
}
