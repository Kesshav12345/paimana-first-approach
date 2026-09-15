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
        return getActiveAlerts(sector, ministry, state, severity, null, null, null, null, search, page, size);
    }

    public List<EarlyWarningAlertDto> getActiveAlerts(
            String sector, String ministry, String state, String severity,
            String warningType, String persistence, String riskBand,
            String interventionStatus, String search, int page, int size
    ) {
        int offset = Math.max(0, (page - 1) * size);
        return earlyWarningRepository.getActiveAlerts(sector, ministry, state, severity, warningType, persistence, riskBand, interventionStatus, search, size, offset);
    }

    public int countActiveAlerts(String sector, String ministry, String state, String severity, String search) {
        return countActiveAlerts(sector, ministry, state, severity, null, null, null, null, search);
    }

    public int countActiveAlerts(
            String sector, String ministry, String state, String severity,
            String warningType, String persistence, String riskBand,
            String interventionStatus, String search
    ) {
        return earlyWarningRepository.countActiveAlerts(sector, ministry, state, severity, warningType, persistence, riskBand, interventionStatus, search);
    }

    public java.util.Map<String, Object> getEarlyWarningSummary(
            String sector, String ministry, String state, String severity,
            String warningType, String persistence, String riskBand,
            String interventionStatus, String search
    ) {
        return earlyWarningRepository.getEarlyWarningSummary(sector, ministry, state, severity, warningType, persistence, riskBand, interventionStatus, search);
    }

    public List<InterventionDto> getInterventions(String status, int page, int size) {
        return getInterventions(null, null, null, null, status, null, "priority", page, size);
    }

    public List<InterventionDto> getInterventions(
            String sector, String ministry, String state, String riskBand,
            String status, String search, String sortBy, int page, int size
    ) {
        int offset = Math.max(0, (page - 1) * size);
        return earlyWarningRepository.getInterventions(sector, ministry, state, riskBand, status, search, sortBy, size, offset);
    }

    public int countInterventions(
            String sector, String ministry, String state, String riskBand,
            String status, String search
    ) {
        return earlyWarningRepository.countInterventions(sector, ministry, state, riskBand, status, search);
    }

    public boolean updateIntervention(String projectId, String status, String notes) {
        return earlyWarningRepository.updateInterventionStatus(projectId, status, notes);
    }
}
