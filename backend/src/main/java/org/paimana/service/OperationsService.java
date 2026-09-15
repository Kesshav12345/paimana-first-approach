package org.paimana.service;

import org.paimana.dto.OperationsStatusDto;
import org.paimana.repository.OperationsRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class OperationsService {

    private final OperationsRepository operationsRepository;
    private final PythonBridgeClient pythonBridgeClient;

    public OperationsService(OperationsRepository operationsRepository, PythonBridgeClient pythonBridgeClient) {
        this.operationsRepository = operationsRepository;
        this.pythonBridgeClient = pythonBridgeClient;
    }

    public OperationsStatusDto getStatus() {
        OperationsStatusDto dto = new OperationsStatusDto();
        dto.setStatus("HEALTHY");
        dto.setCurrentDatasetVersion("v2026.07-canonical");
        
        String latestMonth = operationsRepository.getLatestReportingPeriod();
        dto.setLatestReportingPeriod(latestMonth != null ? latestMonth : "2026-07");
        dto.setTotalProjects(operationsRepository.getTotalProjects());
        dto.setTotalFacts(operationsRepository.getTotalFacts());
        dto.setQuarantineRecordsCount(operationsRepository.getQuarantineCount());
        dto.setActiveModelVersion("1.0.0");
        dto.setCandidateModelVersion(null);
        dto.setLastPipelineRun("2026-09-13 13:16:12");
        dto.setPipelineState("IDLE");

        dto.setSourceDocuments(operationsRepository.getSourceDocuments());
        dto.setQuarantineSummary(operationsRepository.getQuarantineSummary());
        dto.setAuditLogs(operationsRepository.getAuditRuns());
        return dto;
    }

    public Map<String, Object> uploadAndIngestPdf(MultipartFile file, String month) throws IOException {
        return pythonBridgeClient.triggerIntelligenceRefresh(file, month, false);
    }

    public Map<String, Object> triggerIntelligenceRefresh(MultipartFile file, String month, Boolean forceReprocess) throws IOException {
        return pythonBridgeClient.triggerIntelligenceRefresh(file, month, forceReprocess);
    }

    public Map<String, Object> getJobProgress(String jobId) {
        return pythonBridgeClient.getJobProgress(jobId);
    }

    public java.util.List<Map<String, Object>> getRecentPipelineRuns(int limit) {
        return pythonBridgeClient.getRecentPipelineRuns(limit);
    }

    public Map<String, Object> refreshExternalIntelligence(String scope, Integer limit) {
        return pythonBridgeClient.refreshExternalIntelligence(scope, limit);
    }

    public Map<String, Object> recalculateDerivedValues() {
        return pythonBridgeClient.recalculateDerivedValues();
    }

    public Map<String, Object> getMethodologyMetadata() {
        return pythonBridgeClient.getMethodologyMetadata();
    }

    public Map<String, Object> triggerRetrain() {
        return pythonBridgeClient.triggerRetrain();
    }

    public Map<String, Object> promoteCandidateModel() {
        return pythonBridgeClient.promoteModel();
    }

    public Map<String, Object> refreshPredictions() {
        return pythonBridgeClient.refreshPredictions();
    }
}

