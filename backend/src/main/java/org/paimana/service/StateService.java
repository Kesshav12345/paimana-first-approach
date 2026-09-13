package org.paimana.service;

import org.paimana.dto.ProjectSummaryDto;
import org.paimana.dto.StateSummaryDto;
import org.paimana.repository.StateRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class StateService {

    private final StateRepository stateRepository;

    public StateService(StateRepository stateRepository) {
        this.stateRepository = stateRepository;
    }

    public List<StateSummaryDto> getAllStates() {
        return stateRepository.getAllStates();
    }

    public List<Map<String, Object>> getStateSectors(String stateName) {
        return stateRepository.getStateSectorBreakdown(stateName);
    }

    public List<ProjectSummaryDto> getStateProjects(String stateName, String sectorName, int page, int size) {
        int offset = Math.max(0, (page - 1) * size);
        return stateRepository.getStateProjects(stateName, sectorName, size, offset);
    }
}
