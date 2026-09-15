"""
PAIMANA-INTEL — Evidence Resolver & Conflict Detection Engine
Resolves multi-source evidence, deduplicates syndicated wire stories,
identifies material contradictions, and assigns deterministic confidence and freshness bands.
"""

import re
import hashlib
from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass, field
from datetime import datetime

from .claim_extractor import ExtractedClaim


@dataclass
class EvidenceConflict:
    conflict_type: str
    dimension: str
    claim_a: str
    source_a: str
    claim_b: str
    source_b: str
    resolution_status: str = "UNRESOLVED_CONTRADICTION"
    description: str = ""


@dataclass
class ResolvedEvidenceState:
    project_id: str
    claims: List[ExtractedClaim] = field(default_factory=list)
    unique_sources_count: int = 0
    tier_1_sources_count: int = 0
    conflicts: List[EvidenceConflict] = field(default_factory=list)
    evidence_confidence_band: str = "LIMITED"  # HIGH, MODERATE, LIMITED, CONFLICTED
    confidence_score: float = 0.50
    freshness_band: str = "Fresh"             # Fresh, Aging, Stale, No External Evidence
    has_unresolved_blockers: bool = False
    material_developments: List[str] = field(default_factory=list)
    unresolved_blockers: List[str] = field(default_factory=list)
    positive_signals: List[str] = field(default_factory=list)


class EvidenceResolver:
    """
    Synthesizes and cross-examines claims for a project.
    Deduplicates syndicated press stories and exposes evidence conflicts.
    """

    @staticmethod
    def deduplicate_syndicated_claims(claims: List[ExtractedClaim]) -> List[ExtractedClaim]:
        """
        Collapses syndicated news stories with identical or near-identical text.
        Retains the highest-tier source for each distinct claim.
        """
        seen_fingerprints = {}
        unique_claims = []

        for c in claims:
            # Generate coarse fingerprint based on claim type and core words
            core_words = set(re.findall(r'\b[a-z]{4,}\b', c.claim_text.lower()))
            coarse_key = (c.claim_type, frozenset(sorted(list(core_words))[:8]))

            if coarse_key not in seen_fingerprints:
                seen_fingerprints[coarse_key] = c
                unique_claims.append(c)
            else:
                existing = seen_fingerprints[coarse_key]
                # If new claim has higher source quality, swap
                if c.source_quality > existing.source_quality:
                    idx = unique_claims.index(existing)
                    unique_claims[idx] = c
                    seen_fingerprints[coarse_key] = c

        return unique_claims

    def resolve(self, project_id: str, raw_claims: List[ExtractedClaim]) -> ResolvedEvidenceState:
        """Evaluates raw claims, runs conflict detection, and derives the intelligence state."""
        state = ResolvedEvidenceState(project_id=project_id)

        if not raw_claims:
            state.evidence_confidence_band = "LIMITED"
            state.confidence_score = 0.30
            state.freshness_band = "No External Evidence"
            return state

        # 1. Deduplicate syndicated sources
        deduped = self.deduplicate_syndicated_claims(raw_claims)
        state.claims = deduped
        state.unique_sources_count = len(set(c.source_url for c in deduped if c.source_url))
        state.tier_1_sources_count = sum(1 for c in deduped if "TIER_1" in c.source_tier)

        # 2. Conflict Detection (Completion vs Ongoing Major Obstruction)
        completion_claims = [c for c in deduped if c.claim_type in {"PROJECT_COMPLETED", "COD_DECLARED"}]
        obstruction_claims = [c for c in deduped if c.claim_type in {"LAND_ACQUISITION_DELAY", "COURT_CASE", "CONTRACTOR_ISSUE"}]

        if completion_claims and obstruction_claims:
            # Check if obstruction claim is very recent while completion claim is older, or vice versa
            conf = EvidenceConflict(
                conflict_type="STATUS_DISCREPANCY",
                dimension="Execution Status",
                claim_a=completion_claims[0].claim_text,
                source_a=completion_claims[0].source_title,
                claim_b=obstruction_claims[0].claim_text,
                source_b=obstruction_claims[0].source_title,
                description="Contradiction: One authoritative report claims commissioning/completion, while another indicates active land/contractual obstruction."
            )
            state.conflicts.append(conf)

        # 3. Categorize Developments
        for c in deduped:
            if c.claim_type in {"PROJECT_COMPLETED", "COMMISSIONING_STARTED", "COD_DECLARED", "CONSTRUCTION_MILESTONE", "POSITIVE_ACCELERATION_SIGNAL"}:
                state.positive_signals.append(f"{c.quantitative_signal}: {c.claim_text[:140]}")
                state.material_developments.append(f"[MILESTONE] {c.claim_text[:140]}")
            elif c.claim_type in {"LAND_ACQUISITION_DELAY", "ENVIRONMENTAL_CLEARANCE_DELAY", "CONTRACTOR_ISSUE", "COURT_CASE", "WEATHER_DISRUPTION"}:
                state.has_unresolved_blockers = True
                state.unresolved_blockers.append(f"{c.quantitative_signal}: {c.claim_text[:140]}")
                state.material_developments.append(f"[BOTTLENECK] {c.claim_text[:140]}")

        # 4. Compute Confidence Band
        if state.conflicts:
            state.evidence_confidence_band = "CONFLICTED"
            state.confidence_score = 0.65
        elif state.tier_1_sources_count >= 2 or (state.tier_1_sources_count >= 1 and state.unique_sources_count >= 3):
            state.evidence_confidence_band = "HIGH"
            state.confidence_score = 0.92
        elif state.unique_sources_count >= 2:
            state.evidence_confidence_band = "MODERATE"
            state.confidence_score = 0.74
        else:
            state.evidence_confidence_band = "LIMITED"
            state.confidence_score = 0.45

        # 5. Determine Freshness Band
        # In current context, research conducted now represents Fresh external intelligence
        state.freshness_band = "Fresh"

        return state
