"""
PAIMANA-INTEL — Research Snapshot Builder & Persistence Layer
Atomically persists resolved research runs, external sources, evidence claims,
and causal attribution factors into canonical SQLite database.
"""

import sqlite3
import logging
from datetime import datetime
from typing import Dict, Any, Optional

from .claim_extractor import ExtractedClaim
from .evidence_resolver import ResolvedEvidenceState

logger = logging.getLogger("snapshot_builder")


class ResearchSnapshotBuilder:
    """
    Persists resolved external intelligence snapshots into canonical database.
    Ensures relational integrity and atomic commits across the 4 evidence tables.
    """

    def __init__(self, db_path: str):
        self.db_path = db_path

    def persist_snapshot(
        self,
        project_id: str,
        state: ResolvedEvidenceState,
        search_count: int = 4
    ) -> bool:
        """Persists the resolved external evidence state atomically for a project."""
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        try:
            conn = sqlite3.connect(self.db_path)
            cur = conn.cursor()

            # 1. Insert External Sources
            source_id_map = {}
            for c in state.claims:
                if not c.source_url:
                    continue
                cur.execute("""
                    SELECT source_id FROM project_external_sources
                    WHERE canonical_url = ?
                """, (c.source_url,))
                row = cur.fetchone()
                if row:
                    source_id_map[c.source_url] = row[0]
                else:
                    cur.execute("""
                        INSERT INTO project_external_sources
                        (canonical_url, title, publisher, publication_date, source_type, source_quality, retrieved_date)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        c.source_url,
                        c.source_title or c.publisher,
                        c.publisher,
                        c.publication_date or now_str[:10],
                        c.source_tier,
                        c.source_quality,
                        now_str[:10]
                    ))
                    source_id_map[c.source_url] = cur.lastrowid

            # 2. Insert Evidence Claims
            for c in state.claims:
                src_id = source_id_map.get(c.source_url)
                cur.execute("""
                    INSERT INTO project_evidence_claims
                    (project_id, source_id, claim_text, event_date, publication_date,
                     evidence_strength, causal_confidence, target_component, quantitative_signal,
                     supporting_metric, limitations)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    project_id,
                    src_id,
                    c.claim_text,
                    c.event_date or now_str[:10],
                    c.publication_date or now_str[:10],
                    c.evidence_strength,
                    c.causal_confidence,
                    c.target_component,
                    c.quantitative_signal,
                    c.supporting_metric,
                    c.limitations
                ))

            # 3. Create Causal Factors if blockers or major milestones detected
            for c in state.claims:
                if c.claim_type in {"LAND_ACQUISITION_DELAY", "ENVIRONMENTAL_CLEARANCE_DELAY", "CONTRACTOR_ISSUE", "COURT_CASE", "WEATHER_DISRUPTION"}:
                    cat = "LAND" if "LAND" in c.claim_type else ("REGULATORY" if "ENVIRONMENTAL" in c.claim_type or "COURT" in c.claim_type else "CONTRACTUAL")
                    cur.execute("""
                        INSERT INTO project_causal_factors
                        (project_id, category, factor_title, factor_description, status,
                         causal_confidence, quantitative_consequence, unresolved_detail, evidence_count)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        project_id,
                        cat,
                        c.quantitative_signal,
                        c.claim_text[:250],
                        "UNRESOLVED" if state.has_unresolved_blockers else "MONITORED",
                        c.causal_confidence,
                        "Schedule impediment observed in field reporting.",
                        c.claim_text[:120],
                        1
                    ))

            # 4. Insert Research Run Record
            summary_notes = (
                f"External Research Completed: {len(state.claims)} claims extracted across "
                f"{state.unique_sources_count} sources ({state.tier_1_sources_count} Tier-1). "
                f"Confidence: {state.evidence_confidence_band}."
            )
            if state.conflicts:
                summary_notes += f" {len(state.conflicts)} conflict(s) flagged for operator review."

            cur.execute("""
                INSERT INTO project_research_runs
                (project_id, started_at, completed_at, status, model_used,
                 search_count, source_count, evidence_count, causal_factor_count,
                 completeness_score, research_confidence, causal_confidence, data_confidence, notes)
                VALUES (?, ?, ?, 'COMPLETED', 'PAIMANA-Evidence-Engine-v2.0', ?, ?, ?, ?, ?, ?, 'DIRECT', 'HIGH', ?)
            """, (
                project_id,
                now_str,
                now_str,
                search_count,
                state.unique_sources_count,
                len(state.claims),
                len(state.unresolved_blockers),
                round(state.confidence_score * 100.0, 1),
                state.evidence_confidence_band,
                summary_notes
            ))

            # 5. Update Project Research Queue
            cur.execute("""
                UPDATE project_research_queue
                SET status = 'COMPLETED', completed_at = ?, updated_at = ?
                WHERE project_id = ?
            """, (now_str, now_str, project_id))

            conn.commit()
            conn.close()
            logger.info(f"Successfully persisted evidence snapshot for project {project_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to persist research snapshot for project {project_id}: {e}")
            return False
