import sys
import os
import unittest
from pathlib import Path

# Add project root and ml-service to Python path
repo_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(repo_root))
sys.path.insert(0, str(repo_root / "ml-service"))

from intelligence.search_provider import get_search_provider, SearchResult, OfflineFallbackProvider
from intelligence.source_fetcher import SourceFetcher, SecurityException
from intelligence.research_planner import ProjectResearchPlanner
from intelligence.claim_extractor import ClaimExtractor, ExtractedClaim, SourceTier
from intelligence.evidence_resolver import EvidenceResolver


class TestIntelligenceSubsystem(unittest.TestCase):

    def test_search_provider_fallback_without_keys(self):
        """Verify that absent API keys fall back gracefully to direct domain/offline search without failure."""
        provider = get_search_provider()
        self.assertIsNotNone(provider)
        # Search without online API keys
        results = provider.search("Mumbai Ahmedabad Bullet Train", max_results=3)
        self.assertIsInstance(results, list)
        for r in results:
            self.assertIsInstance(r, SearchResult)
            self.assertTrue(r.url.startswith("http"))
            self.assertGreater(len(r.title), 0)

    def test_source_fetcher_ssrf_isolation(self):
        """Verify that loopback, localhost, and RFC 1918 addresses are blocked."""
        fetcher = SourceFetcher()
        
        # Test validate_url raises SecurityException on loopback / private IP
        with self.assertRaises(SecurityException):
            fetcher.validate_url("http://127.0.0.1:8080/admin")

        with self.assertRaises(SecurityException):
            fetcher.validate_url("http://localhost:8000/api")

        with self.assertRaises(SecurityException):
            fetcher.validate_url("file:///etc/passwd")

        # Test fetch returns None on blocked URLs
        self.assertIsNone(fetcher.fetch("http://127.0.0.1:8080/admin"))
        self.assertIsNone(fetcher.fetch("file:///etc/passwd"))

    def test_research_planner_domain_adaptation(self):
        """Verify that research queries are adapted based on sector and project identity."""
        planner = ProjectResearchPlanner()
        
        rail_project = {
            "project_id": "TEST_RAIL",
            "project_name": "Rishikesh-Karanprayag New Broad Gauge Rail Link",
            "sector_name": "Railways",
            "ministry_name": "Ministry of Railways",
            "state_name": "Uttarakhand",
            "agency_name": "RVNL"
        }
        plan = planner.create_plan(rail_project)
        self.assertGreaterEqual(len(plan.queries), 2)
        # Should contain railway-specific terms
        rail_query_str = " ".join(q.query_text for q in plan.queries).lower()
        self.assertTrue("commissioning" in rail_query_str or "rvnl" in rail_query_str or "rishikesh" in rail_query_str)

        power_project = {
            "project_id": "TEST_PWR",
            "project_name": "Tehri Pumped Storage Plant",
            "sector_name": "Power",
            "ministry_name": "Ministry of Power",
            "state_name": "Uttarakhand",
            "agency_name": "THDC"
        }
        plan_pwr = planner.create_plan(power_project)
        pwr_query_str = " ".join(q.query_text for q in plan_pwr.queries).lower()
        self.assertTrue("cod" in pwr_query_str or "synchronization" in pwr_query_str or "thdc" in pwr_query_str or "tehri" in pwr_query_str)

    def test_source_tier_classification(self):
        """Verify that sources are strictly categorized into 5 tiers with proper quality scores."""
        extractor = ClaimExtractor()
        
        # Tier 1: Primary Gov
        tier_pib, score_pib, _ = extractor.classify_source("https://pib.gov.in/PressReleasePage.aspx?PRID=1982731")
        self.assertEqual(tier_pib, SourceTier.TIER_1_PRIMARY)
        self.assertGreaterEqual(score_pib, 0.95)

        tier_rvnl, score_rvnl, _ = extractor.classify_source("https://rvnl.org/procurement/tenders")
        self.assertEqual(tier_rvnl, SourceTier.TIER_2_INSTITUTIONAL)
        self.assertGreaterEqual(score_rvnl, 0.85)

        # Tier 3: High quality news
        tier_bs, score_bs, _ = extractor.classify_source("https://www.business-standard.com/economy/news/railways-progress-1234.html")
        self.assertEqual(tier_bs, SourceTier.TIER_3_JOURNALISM)
        self.assertAlmostEqual(score_bs, 0.75, delta=0.05)

        # Tier 5: Social / General Web
        tier_x, score_x, _ = extractor.classify_source("https://randomblog.xyz/posts/infra")
        self.assertEqual(tier_x, SourceTier.TIER_5_UNVERIFIED)
        self.assertLessEqual(score_x, 0.25)

    def test_claim_extraction_taxonomy(self):
        """Verify claim extraction adheres to controlled taxonomy and isolates event date from publication date."""
        extractor = ClaimExtractor()
        
        project = {
            "project_id": "PROJ_001",
            "project_name": "Rishikesh Karanprayag Rail Link",
            "state_name": "Uttarakhand",
            "agency_name": "RVNL",
            "sector_name": "Railways"
        }
        
        search_results = [
            SearchResult(
                title="RVNL Reports Rishikesh Karanprayag Tunnel Progress",
                url="https://pib.gov.in/release/123",
                snippet="In August 2026, land acquisition delay resolved in Package 3. Tunnel breakthrough achieved.",
                publisher="PIB",
                publication_date="2026-09-01"
            )
        ]
        
        claims = extractor.extract_claims(project, search_results)
        self.assertGreaterEqual(len(claims), 1)
        for c in claims:
            self.assertIn(c.claim_type, [
                "LAND_ACQUISITION_DELAY", "COMMISSIONING_STARTED", "EXPECTED_COMPLETION_DATE", 
                "PHYSICAL_PROGRESS_SIGNAL", "CONSTRUCTION_MILESTONE", "COURT_CASE"
            ])
            self.assertEqual(c.project_id, "PROJ_001")
            self.assertEqual(c.publication_date, "2026-09-01")

    def test_evidence_resolution_and_deduplication(self):
        """Verify that syndicated/duplicate claims are collapsed and confidence is computed."""
        resolver = EvidenceResolver()
        
        duplicate_claims = [
            ExtractedClaim(
                project_id="PROJ_001",
                claim_type="LAND_ACQUISITION_DELAY",
                claim_text="Land acquisition delay reached ninety percent in district after negotiations.",
                source_tier="TIER_3_JOURNALISM",
                source_quality=0.75,
                source_url="https://economictimes.indiatimes.com/article1",
                source_title="Land delay slows project"
            ),
            ExtractedClaim(
                project_id="PROJ_001",
                claim_type="LAND_ACQUISITION_DELAY",
                claim_text="Land acquisition delay reached ninety percent in district after negotiations wire.",
                source_tier="TIER_4_AGGREGATOR",
                source_quality=0.45,
                source_url="https://syndicatednews.com/wire/article1",
                source_title="Land delay slows project"
            )
        ]
        
        resolved_state = resolver.resolve("PROJ_001", duplicate_claims)
        self.assertEqual(len(resolved_state.claims), 1, "Syndicated duplicate claims must be collapsed")
        self.assertEqual(resolved_state.claims[0].source_tier, "TIER_3_JOURNALISM", "Highest quality source tier must be preserved")


if __name__ == "__main__":
    unittest.main()
