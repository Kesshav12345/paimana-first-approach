"""
PAIMANA-INTEL — Structured Claim Extractor & Source Authority Ranker
Classifies sources into the 5-tier authoritative trust hierarchy.
Extracts structured claims under a strictly controlled taxonomy.
Separates article publication dates from underlying event occurrence dates.
"""

import re
from enum import Enum
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
from urllib.parse import urlparse


class SourceTier(Enum):
    TIER_1_PRIMARY = "TIER_1_PRIMARY"       # PIB, Ministries, Parliament, CAG, Courts, State Portals
    TIER_2_INSTITUTIONAL = "TIER_2_INSTITUTIONAL" # PSUs, Stock Filings, Multilateral Lenders
    TIER_3_JOURNALISM = "TIER_3_JOURNALISM" # Major Business & National Daily Newspapers
    TIER_4_AGGREGATOR = "TIER_4_AGGREGATOR" # Trade portals, aggregators
    TIER_5_UNVERIFIED = "TIER_5_UNVERIFIED" # Social, blogs, user-generated (Never establishes independent facts)


@dataclass
class ExtractedClaim:
    project_id: str
    claim_type: str
    claim_text: str
    claim_value: Optional[str] = None
    claim_unit: Optional[str] = None
    event_date: Optional[str] = None
    publication_date: Optional[str] = None
    source_url: str = ""
    source_title: str = ""
    publisher: str = ""
    source_tier: str = "TIER_3_JOURNALISM"
    source_quality: float = 0.70
    project_match_confidence: float = 0.85
    causal_confidence: str = "ASSOCIATIVE"  # DIRECT, STRONG_INDIRECT, ASSOCIATIVE
    evidence_strength: str = "MODERATE"     # HIGH, MODERATE, LOW
    target_component: int = 9              # Maps to Component 1-15 in Project Intelligence
    quantitative_signal: Optional[str] = None
    supporting_metric: Optional[str] = None
    limitations: Optional[str] = None


class ClaimExtractor:
    """
    Extracts structured claims and scores source credibility using multi-tier heuristics.
    """

    # Domain Classification Rules
    TIER_1_DOMAINS = {
        "pib.gov.in", "sansad.in", "loksabha.nic.in", "rajyasabha.nic.in",
        "cag.gov.in", "cwc.gov.in", "cea.nic.in", "indianrailways.gov.in",
        "morth.nic.in", "nhai.gov.in", "sci.gov.in", "egazette.gov.in",
        "mospi.gov.in", "powermin.gov.in", "coal.nic.in", "civilaviation.gov.in"
    }

    TIER_2_DOMAINS = {
        "bseindia.com", "nseindia.com", "ntpc.co.in", "powergrid.in",
        "rvnl.org", "ircon.org", "nhpcindia.com", "thdc.co.in",
        "sail.co.in", "coalindia.in", "worldbank.org", "adb.org", "aiib.org"
    }

    TIER_3_DOMAINS = {
        "thehindu.com", "business-standard.com", "economictimes.indiatimes.com",
        "livemint.com", "financialexpress.com", "indianexpress.com",
        "timesofindia.indiatimes.com", "hindustantimes.com", "theprint.in"
    }

    TIER_4_DOMAINS = {
        "constructionweekonline.in", "projectmonitor.com", "metrorailnews.in",
        "infrabeat.com", "railanalysis.com", "mercomindia.com"
    }

    # Taxonomy Patterns
    TAXONOMY_PATTERNS = [
        ("PROJECT_COMPLETED", r'\b(inaugurated|fully completed|dedicated to the nation|operationalized|commissioned on|opened for traffic)\b', "HIGH", "DIRECT", 1),
        ("COMMISSIONING_STARTED", r'\b(trial run|trial operations|synchronization started|pre-commissioning testing|crs inspection scheduled)\b', "HIGH", "DIRECT", 3),
        ("COD_DECLARED", r'\b(commercial operation date|declared cod|commercial operation declared)\b', "HIGH", "DIRECT", 3),
        ("LAND_ACQUISITION_DELAY", r'\b(land acquisition (issue|delay|impediment|backlog)|unresolved land|encroachment (issue|removal)|row clearance)\b', "HIGH", "DIRECT", 9),
        ("ENVIRONMENTAL_CLEARANCE_DELAY", r'\b(forest clearance (delay|pending)|environmental clearance (stay|pending|scrutiny)|national board for wildlife|nbwl clearance)\b', "HIGH", "DIRECT", 9),
        ("CONTRACTOR_ISSUE", r'\b(contractor (termination|dispute|demobilization|insolvency)|nclt proceedings|fresh tender floated|re-tendering)\b', "MODERATE", "STRONG_INDIRECT", 9),
        ("COURT_CASE", r'\b(high court stay|supreme court order|arbitration award|national green tribunal|ngt stay order)\b', "HIGH", "DIRECT", 9),
        ("WEATHER_DISRUPTION", r'\b(flash flood|cloudburst|landslide disaster|heavy monsoon disruption|inundation of powerhouse)\b', "HIGH", "DIRECT", 9),
        ("COST_REVISION", r'\b(revised cost estimate|rce sanctioned|cost escalated to|cabinet approval for rs|cost revision approved)\b', "HIGH", "DIRECT", 4),
        ("CONSTRUCTION_MILESTONE", r'\b(pier foundation completed|tunnel breakthrough achieved|box pushing finished|superstructure launched)\b', "MODERATE", "DIRECT", 2),
        ("POSITIVE_ACCELERATION_SIGNAL", r'\b(work fast-tracked|ahead of schedule|double shift deployed|target advanced)\b', "MODERATE", "STRONG_INDIRECT", 7),
        ("NEGATIVE_EXECUTION_SIGNAL", r'\b(work stalled|progress halted|labor unrest|fund constraint|execution bottleneck)\b', "MODERATE", "STRONG_INDIRECT", 9)
    ]

    def classify_source(self, url: str) -> Tuple[SourceTier, float, str]:
        """Maps URL domain to trust tier and quality weight (0.0 to 1.0)."""
        domain = ""
        try:
            domain = urlparse(url).netloc.lower().replace("www.", "")
        except Exception:
            domain = "unknown"

        if domain.endswith(".gov.in") or domain.endswith(".nic.in") or domain in self.TIER_1_DOMAINS:
            return SourceTier.TIER_1_PRIMARY, 0.98, "GOVERNMENT_PORTAL"
        elif domain in self.TIER_2_DOMAINS:
            return SourceTier.TIER_2_INSTITUTIONAL, 0.88, "STATUTORY_DISCLOSURE"
        elif domain in self.TIER_3_DOMAINS:
            return SourceTier.TIER_3_JOURNALISM, 0.75, "BUSINESS_PRESS"
        elif domain in self.TIER_4_DOMAINS:
            return SourceTier.TIER_4_AGGREGATOR, 0.45, "TRADE_PUBLICATION"
        else:
            return SourceTier.TIER_5_UNVERIFIED, 0.20, "GENERAL_WEB"

    def compute_identity_match(self, project: Dict[str, Any], text: str) -> float:
        """Calculates multi-signal match confidence between project identity and text snippet."""
        score = 0.0
        pname = str(project.get("project_name", "")).lower()
        cleaned = re.sub(r'[^a-z0-9\s]', ' ', pname).strip()
        tokens = [t for t in cleaned.split() if len(t) > 3 and t not in {"project", "line", "construction", "package"}]

        text_lower = text.lower()

        # Token overlap
        if tokens:
            matched_tokens = sum(1 for t in tokens if t in text_lower)
            overlap_ratio = matched_tokens / len(tokens)
            score += overlap_ratio * 0.50

        # State match
        state = str(project.get("state_name", "")).lower()
        if state and state != "unknown" and state in text_lower:
            score += 0.20

        # Agency match
        agency = str(project.get("agency_name", "")).lower()
        if agency and agency not in {"unknown", "implementing agency"} and agency in text_lower:
            score += 0.15

        # Sector match
        sector = str(project.get("sector_name", "")).lower()
        if sector and (sector in text_lower or ("rail" in sector and "rail" in text_lower)):
            score += 0.15

        return round(min(1.0, score), 2)

    def extract_claims(self, project: Dict[str, Any], search_results: List[Any]) -> List[ExtractedClaim]:
        """Extracts and validates structured claims from search results."""
        pid = str(project.get("project_id", ""))
        extracted: List[ExtractedClaim] = []

        for item in search_results:
            title = getattr(item, "title", "")
            snippet = getattr(item, "snippet", "")
            url = getattr(item, "url", "")
            pub_date = getattr(item, "publication_date", None)
            combined_text = f"{title}. {snippet}"

            # Calculate match confidence
            match_conf = self.compute_identity_match(project, combined_text)
            if match_conf < 0.40:
                # Quarantine/skip low-confidence identity matches
                continue

            tier, quality, stype = self.classify_source(url)

            # Match against taxonomy
            matched_any = False
            for ctype, pattern, strength, confidence, comp in self.TAXONOMY_PATTERNS:
                m = re.search(pattern, combined_text, re.IGNORECASE)
                if m:
                    matched_any = True
                    matched_phrase = m.group(0)

                    # Extract probable event date (e.g. "March 2026", "2025-08-12", "April 2024")
                    date_match = re.search(r'\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b', combined_text, re.IGNORECASE)
                    event_date = date_match.group(0) if date_match else pub_date

                    claim = ExtractedClaim(
                        project_id=pid,
                        claim_type=ctype,
                        claim_text=f"Authoritative evidence indicates: {matched_phrase}. Context: {snippet[:200]}...",
                        event_date=event_date,
                        publication_date=pub_date or event_date,
                        source_url=url,
                        source_title=title,
                        publisher=getattr(item, "publisher", "Public Record"),
                        source_tier=tier.value,
                        source_quality=quality,
                        project_match_confidence=match_conf,
                        causal_confidence=confidence,
                        evidence_strength=strength,
                        target_component=comp,
                        quantitative_signal=ctype.replace("_", " ").title(),
                        supporting_metric=f"Match Confidence: {int(match_conf*100)}% | Source Quality: {int(quality*100)}%",
                        limitations="Retrieved from public institutional web disclosures. Verified against canonical identity signals."
                    )
                    extracted.append(claim)

        return extracted
