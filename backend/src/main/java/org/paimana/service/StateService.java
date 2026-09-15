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

    public List<StateSummaryDto> getAllStates(
            String sector, String ministry, String riskBand,
            String trajectory, String costFilter, String delayFilter,
            String warningFilter, String multiState, String sortBy
    ) {
        return stateRepository.getAllStates(sector, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState, sortBy);
    }

    public List<Map<String, Object>> getStateSectors(String stateName) {
        return stateRepository.getStateSectorBreakdown(stateName);
    }

    public List<Map<String, Object>> getStateSectors(
            String stateName, String sector, String ministry, String riskBand,
            String trajectory, String costFilter, String delayFilter,
            String warningFilter, String multiState
    ) {
        return stateRepository.getStateSectorBreakdown(stateName, sector, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState);
    }

    public List<ProjectSummaryDto> getStateProjects(String stateName, String sectorName, int page, int size) {
        int offset = Math.max(0, (page - 1) * size);
        return stateRepository.getStateProjects(stateName, sectorName, size, offset);
    }

    public List<ProjectSummaryDto> getStateProjects(
            String stateName, String sectorName, String ministry, String riskBand,
            String trajectory, String costFilter, String delayFilter,
            String warningFilter, String multiState, int page, int size
    ) {
        int offset = Math.max(0, (page - 1) * size);
        return stateRepository.getStateProjects(stateName, sectorName, ministry, riskBand, trajectory, costFilter, delayFilter, warningFilter, multiState, size, offset);
    }
}
