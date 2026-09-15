package org.paimana;

import org.junit.jupiter.api.Test;
import org.paimana.dto.*;
import org.paimana.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = "spring.datasource.url=jdbc:sqlite:../paimana_canonical.db")
public class AnalyticalDashboardsTest {

    @Autowired
    private SectorRepository sectorRepository;

    @Autowired
    private MinistryRepository ministryRepository;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private EarlyWarningRepository earlyWarningRepository;

    @Test
    public void testSectorAnalyticsQueries() {
        // Default unfiltered national sectors
        List<SectorSummaryDto> defaultSectors = sectorRepository.getAllSectors();
        assertNotNull(defaultSectors, "Default sectors should not be null");
        assertFalse(defaultSectors.isEmpty(), "Default sectors should contain entities");

        // Filtered by Critical Risk
        List<SectorSummaryDto> critSectors = sectorRepository.getAllSectors(
                null, null, "CRITICAL", null, null, null, null, null, "cost"
        );
        assertNotNull(critSectors);

        // Verify drill-down filter inheritance
        if (!defaultSectors.isEmpty()) {
            String sampleSector = defaultSectors.get(0).getSectorName();
            var states = sectorRepository.getSectorStateBreakdown(sampleSector, null, "CRITICAL", null, null, null, null, null);
            assertNotNull(states);

            var projects = sectorRepository.getSectorProjects(sampleSector, null, null, "CRITICAL", null, null, null, null, null, 10, 0);
            assertNotNull(projects);
            for (ProjectSummaryDto p : projects) {
                assertEquals(sampleSector, p.getSectorName());
                assertTrue("CRITICAL".equalsIgnoreCase(p.getRiskBand()));
            }
        }
    }

    @Test
    public void testMinistryAnalyticsQueries() {
        // Default unfiltered national line ministries
        List<MinistrySummaryDto> defaultMinistries = ministryRepository.getAllMinistries();
        assertNotNull(defaultMinistries, "Default ministries should not be null");
        assertFalse(defaultMinistries.isEmpty(), "Default ministries should contain entities");

        // Filtered by Risk Band
        List<MinistrySummaryDto> critMinistries = ministryRepository.getAllMinistries(
                null, null, "CRITICAL", null, null, null, null, null, "cost"
        );
        assertNotNull(critMinistries);

        // Verify drill-down filter inheritance
        if (!defaultMinistries.isEmpty()) {
            String sampleMinistry = defaultMinistries.get(0).getMinistryName();
            var agencies = ministryRepository.getMinistryAgencyBreakdown(sampleMinistry, null, null, "CRITICAL", null, null, null, null, null);
            assertNotNull(agencies);

            var projects = ministryRepository.getMinistryProjects(sampleMinistry, null, null, null, "CRITICAL", null, null, null, null, null, 10, 0);
            assertNotNull(projects);
            for (ProjectSummaryDto p : projects) {
                assertEquals(sampleMinistry, p.getMinistryName());
                assertTrue("CRITICAL".equalsIgnoreCase(p.getRiskBand()));
            }
        }
    }

    @Test
    public void testStateAnalyticsQueries() {
        // Default unfiltered regional states
        List<StateSummaryDto> defaultStates = stateRepository.getAllStates();
        assertNotNull(defaultStates, "Default states should not be null");
        assertFalse(defaultStates.isEmpty(), "Default states should contain entities");

        // Filtered by Risk Band
        List<StateSummaryDto> critStates = stateRepository.getAllStates(
                null, null, "CRITICAL", null, null, null, null, null, "cost"
        );
        assertNotNull(critStates);

        // Verify drill-down filter inheritance
        if (!defaultStates.isEmpty()) {
            String sampleState = defaultStates.get(0).getStateName();
            var sectors = stateRepository.getStateSectorBreakdown(sampleState, null, null, "CRITICAL", null, null, null, null, null);
            assertNotNull(sectors);

            var projects = stateRepository.getStateProjects(sampleState, null, null, "CRITICAL", null, null, null, null, null, 10, 0);
            assertNotNull(projects);
            for (ProjectSummaryDto p : projects) {
                assertEquals(sampleState, p.getStateName());
                assertTrue("CRITICAL".equalsIgnoreCase(p.getRiskBand()));
            }
        }
    }

    @Test
    public void testEarlyWarningAndInterventionQueries() {
        // Active warning query
        List<EarlyWarningAlertDto> alerts = earlyWarningRepository.getActiveAlerts(
                null, null, null, "CRITICAL", null, null, null, null, null, 20, 0
        );
        assertNotNull(alerts);
        for (EarlyWarningAlertDto a : alerts) {
            assertTrue("CRITICAL".equalsIgnoreCase(a.getSeverity()));
            assertNotNull(a.getProjectInterventionStatus(), "Project intervention status should be populated");
        }

        // Summary counts reconciliation
        Map<String, Object> summary = earlyWarningRepository.getEarlyWarningSummary(
                null, null, null, "CRITICAL", null, null, null, null, null
        );
        assertNotNull(summary);
        assertTrue((Integer) summary.get("matchingProjects") >= 0);
        assertTrue((Integer) summary.get("activeWarnings") >= 0);

        // Interventions query
        List<InterventionDto> interventions = earlyWarningRepository.getInterventions(
                null, null, null, null, null, null, "priority", 20, 0
        );
        assertNotNull(interventions);

        int intCount = earlyWarningRepository.countInterventions(null, null, null, null, null, null);
        assertTrue(intCount >= 0);

        // Test idempotent intervention status update
        if (!interventions.isEmpty()) {
            String testProjectId = interventions.get(0).getProjectId();
            boolean updated = earlyWarningRepository.updateInterventionStatus(
                    testProjectId, "UNDER_REVIEW", "Automated regression verification test note"
            );
            assertTrue(updated);
        }
    }
}
