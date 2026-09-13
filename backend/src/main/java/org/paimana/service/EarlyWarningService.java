package org.paimana.service;

import org.paimana.dto.EarlyWarningAlertDto;
import org.paimana.dto.InterventionDto;
import org.paimana.repository.EarlyWarningRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EarlyWarningService {

    private final EarlyWarningRepository earlyWarningRepository;

    public EarlyWarningService(EarlyWarningRepository earlyWarningRepository) {
        this.earlyWarningRepository = earlyWarningRepository;
    }

    public List<EarlyWarningAlertDto> getActiveAlerts(String sector, String ministry, String state, String severity, String search, int page, int size) {
        int offset = Math.max(0, (page - 1) * size);
        return earlyWarningRepository.getActiveAlerts(sector, ministry, state, severity, search, size, offset);
    }

    public int countActiveAlerts(String sector, String ministry, String state, String severity, String search) {
        return earlyWarningRepository.countActiveAlerts(sector, ministry, state, severity, search);
    }

    public List<InterventionDto> getInterventions(String status, int page, int size) {
        int offset = Math.max(0, (page - 1) * size);
        return earlyWarningRepository.getInterventions(status, size, offset);
    }

    public boolean updateIntervention(String projectId, String status, String notes) {
        return earlyWarningRepository.updateInterventionStatus(projectId, status, notes);
    }
}
