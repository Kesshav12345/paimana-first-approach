"""
PAIMANA-INTEL — Sector-Specific Project Research Planner
Generates targeted, balanced queries seeking both obstruction signals and milestone acceleration.
Constructs sector-tailored query strategies across Railways, Power, Roads, Ports, Petroleum, etc.
"""

import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field


@dataclass
class ResearchQuery:
    query_text: str
    target_category: str   # OBSTRUCTION, MILESTONE, CLEARANCE, COST_SCHEDULE, INSTITUTIONAL
    query_type: str        # NEGATIVE, POSITIVE, BALANCED


@dataclass
class ResearchPlan:
    project_id: str
    project_name: str
    sector: str
    ministry: str
    agency: str
    state: str
    queries: List[ResearchQuery] = field(default_factory=list)
    max_sources_to_inspect: int = 5
    priority_level: str = "MODERATE"


class ProjectResearchPlanner:
    """
    Builds domain-aware, balanced research plans for infrastructure projects.
    Never executes blind or unconstrained web searches.
    """

    @staticmethod
    def clean_project_name(name: str) -> str:
        """Strips redundant abbreviations and returns the primary project title."""
        s = re.sub(r'\s*\([^)]*\)', '', name)
        s = re.sub(r'\b(PKG|PACKAGE|PHASE|PH|STAGE|STG|SEC|SECTION)[- ]*(\d+|[IVXLCDM]+)\b', '', s, flags=re.IGNORECASE)
        s = re.sub(r'\s{2,}', ' ', s).strip()
        return s if len(s) >= 4 else name

    def create_plan(self, project: Dict[str, Any], max_queries: int = 4) -> ResearchPlan:
        """Constructs a focused, sector-specific research plan with balanced queries."""
        pid = str(project.get("project_id", ""))
        name = str(project.get("project_name", "")).strip()
        cleaned_name = self.clean_project_name(name)
        sector = str(project.get("sector_name", "General Infrastructure")).strip()
        ministry = str(project.get("ministry_name", "")).strip()
        agency = str(project.get("agency_name", "")).strip()
        state = str(project.get("state_name", "")).strip()

        plan = ResearchPlan(
            project_id=pid,
            project_name=name,
            sector=sector,
            ministry=ministry,
            agency=agency,
            state=state
        )

        queries: List[ResearchQuery] = []

        # 1. Authoritative Institutional Status Query (Balanced)
        agency_term = f" {agency}" if agency and agency.lower() not in {"unknown", "implementing agency"} else ""
        queries.append(ResearchQuery(
            query_text=f'"{cleaned_name}"{agency_term} status completion site:gov.in OR site:pib.gov.in',
            target_category="INSTITUTIONAL",
            query_type="BALANCED"
        ))

        # 2. Sector-Specific Targeted Query
        sec_lower = sector.lower()
        if "rail" in sec_lower:
            queries.append(ResearchQuery(
                query_text=f'"{cleaned_name}" CRS inspection commissioning doubling section opening',
                target_category="MILESTONE",
                query_type="POSITIVE"
            ))
            queries.append(ResearchQuery(
                query_text=f'"{cleaned_name}" land acquisition delay revised target',
                target_category="OBSTRUCTION",
                query_type="NEGATIVE"
            ))
        elif "power" in sec_lower:
            queries.append(ResearchQuery(
                query_text=f'"{cleaned_name}" Commercial Operation Date COD synchronization unit',
                target_category="MILESTONE",
                query_type="POSITIVE"
            ))
            queries.append(ResearchQuery(
                query_text=f'"{cleaned_name}" environmental forest clearance coal transmission delay',
                target_category="CLEARANCE",
                query_type="NEGATIVE"
            ))
        elif "road" in sec_lower or "highway" in sec_lower:
            queries.append(ResearchQuery(
                query_text=f'"{cleaned_name}" NHAI package completion opened traffic',
                target_category="MILESTONE",
                query_type="POSITIVE"
            ))
            queries.append(ResearchQuery(
                query_text=f'"{cleaned_name}" contractor arbitration land acquisition delay',
                target_category="OBSTRUCTION",
                query_type="NEGATIVE"
            ))
        elif "port" in sec_lower or "shipping" in sec_lower:
            queries.append(ResearchQuery(
                query_text=f'"{cleaned_name}" berth commissioning dredging cargo trial',
                target_category="MILESTONE",
                query_type="POSITIVE"
            ))
            queries.append(ResearchQuery(
                query_text=f'"{cleaned_name}" CRZ environmental clearance concessionaire delay',
                target_category="CLEARANCE",
                query_type="NEGATIVE"
            ))
        elif "petroleum" in sec_lower or "gas" in sec_lower:
            queries.append(ResearchQuery(
                query_text=f'"{cleaned_name}" pipeline commissioning gas flow trial run',
                target_category="MILESTONE",
                query_type="POSITIVE"
            ))
            queries.append(ResearchQuery(
                query_text=f'"{cleaned_name}" right of way ROW environmental delay cost revision',
                target_category="OBSTRUCTION",
                query_type="NEGATIVE"
            ))
        else:
            # Generic urban / social / industrial infrastructure
            queries.append(ResearchQuery(
                query_text=f'"{cleaned_name}" inauguration operational completed milestone',
                target_category="MILESTONE",
                query_type="POSITIVE"
            ))
            queries.append(ResearchQuery(
                query_text=f'"{cleaned_name}" delay cost overrun contractor dispute',
                target_category="OBSTRUCTION",
                query_type="NEGATIVE"
            ))

        # 3. Financial & Legal Audit Query (Balanced)
        queries.append(ResearchQuery(
            query_text=f'"{cleaned_name}" revised cost sanction cabinet approval High Court',
            target_category="COST_SCHEDULE",
            query_type="BALANCED"
        ))

        # Bounded query selection
        plan.queries = queries[:max_queries]
        return plan
