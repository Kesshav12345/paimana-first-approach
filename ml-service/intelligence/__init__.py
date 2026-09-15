"""
PAIMANA-INTEL — External Intelligence Subsystem
Provides provider-agnostic search, multi-source retrieval,
controlled claim extraction, source authority ranking, and evidence conflict resolution.
"""

from .search_provider import SearchProvider, SearchResult, get_search_provider
from .source_fetcher import SourceFetcher
from .research_planner import ProjectResearchPlanner, ResearchPlan
from .claim_extractor import ClaimExtractor, ExtractedClaim, SourceTier
from .evidence_resolver import EvidenceResolver, ResolvedEvidenceState
from .research_snapshot_builder import ResearchSnapshotBuilder

__all__ = [
    "SearchProvider",
    "SearchResult",
    "get_search_provider",
    "SourceFetcher",
    "ProjectResearchPlanner",
    "ResearchPlan",
    "ClaimExtractor",
    "ExtractedClaim",
    "SourceTier",
    "EvidenceResolver",
    "ResolvedEvidenceState",
    "ResearchSnapshotBuilder",
]
