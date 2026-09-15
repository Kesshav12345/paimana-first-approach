import os
import sys
import json
import logging
import re
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("standardizer")

# Canonical Sectors
SECTOR_MAP = {
    # Civil Aviation
    "AVIATION & AVIATION INFRASTRUCTURE": "Civil Aviation",
    "CIVIL AVIATION": "Civil Aviation",
    "AVIATION": "Civil Aviation",
    
    # Coal
    "COAL": "Coal",
    
    # Power / Energy
    "POWER": "Power",
    "ENERGY": "Power",
    "NEW AND RENEWABLE ENERGY": "Power",
    "ATOMIC ENERGY": "Power",
    "ENERGY STORAGE": "Power",
    
    # Railways
    "RAILWAYS": "Railways",
    "RAILWAY": "Railways",
    
    # Road Transport (canonical: "Road Transport & Highways")
    "ROAD TRANSPORT AND HIGHWAYS": "Road Transport & Highways",
    "ROAD TRANSPORT & HIGHWAYS": "Road Transport & Highways",
    "ROADS & HIGHWAYS": "Road Transport & Highways",
    "ROADS & BRIDGES": "Road Transport & Highways",
    "ROADS AND HIGHWAYS": "Road Transport & Highways",
    "ROAD AND HIGHWAY": "Road Transport & Highways",
    "MORTH": "Road Transport & Highways",
    "NATIONAL HIGHWAYS": "Road Transport & Highways",
    
    # Petroleum
    "PETROLEUM": "Petroleum & Natural Gas",
    "OIL & GAS": "Petroleum & Natural Gas",
    "PETROLEUM & NATURAL GAS": "Petroleum & Natural Gas",
    "PETROLEUM AND NATURAL GAS": "Petroleum & Natural Gas",
    
    # Steel / Metals
    "STEEL": "Steel",
    "METALS & MINING": "Steel",
    
    # Shipping / Ports / Waterways
    "SHIPPING AND PORTS": "Shipping & Ports",
    "SHIPPING & PORTS": "Shipping & Ports",
    "PORTS, SHIPPING & WATERWAYS": "Shipping & Ports",
    "INLAND WATERWAYS": "Shipping & Ports",
    
    # Telecommunications
    "TELECOMMUNICATIONS": "Telecommunications",
    "TELECOMMUNICATION": "Telecommunications",
    
    # Water Resources
    "WATER RESOURCES": "Water Resources",
    "WASTE & WATER": "Water Resources",
    "IRRIGATION": "Water Resources",
    
    # Health
    "HEALTH AND FAMILY WELFARE": "Health & Family Welfare",
    "HEALTH & FAMILY WELFARE": "Health & Family Welfare",
    "HEALTHCARE": "Health & Family Welfare",
    
    # Education
    "DEPARTMENT OF HIGHER EDUCATION": "Education",
    "EDUCATION": "Education",
    "HIGHER EDUCATION": "Education",
    
    # Urban / Construction
    "REAL ESTATE": "Urban Development",
    "URBAN DEVELOPMENT": "Urban Development",
    "CONSTRUCTION": "Urban Development",
    
    # Logistics
    "LOGISTICS INFRASTRUCTURE": "Logistics Infrastructure",
    
    # Mines
    "MINES": "Coal",
    
    # Others
    "FERTILIZERS": "Chemicals & Fertilizers",
    "TOURISM, HOSPITALITY & WELLNESS": "Tourism",
    "TOURISM": "Tourism",
    "FOOD AND CONSUMER AFFAIRS": "Consumer Affairs",
    "DPIIT": "Industrial Development",
    "SOCIAL JUSTICE": "Social Development",
    "FINANCE": "Finance",
    "HOME AFFAIRS": "Home Affairs",
    "MSME": "Industrial Development",
}

# Source Priority: FlashReport > QPISR
def get_source_priority(filename: str) -> int:
    fn = filename.upper()
    if fn.startswith('FLASHREPORT') or fn.startswith('FR'):
        return 1
    elif 'QPISR' in fn:
        return 2
    elif 'REVIEW' in fn:
        return 3
    return 4

def standardize_records(raw_observations_path: str, output_silver_path: str, quarantine_path: str):
    with open(raw_observations_path, 'r', encoding='utf-8') as f:
        records = json.load(f)
        
    logger.info(f"Loaded {len(records)} raw observations for standardization and validation.")
    
    cleaned_records = []
    quarantined = []
    
    # Track grain: (project_id, reporting_month) -> best record
    grain_map = {}
    
    for r in records:
        pid = str(r.get('project_id', '')).strip()
        month = str(r.get('reporting_month', '')).strip()
        sfile = r.get('source_file', '')
        
        # Structural check
        if not pid or pid in ['-', 'UNKNOWN', 'None'] or len(pid) < 4:
            quarantined.append({
                "source_file": sfile,
                "project_id_raw": pid,
                "error_severity": "ERROR",
                "error_type": "INVALID_PROJECT_ID",
                "error_message": f"Empty or invalid project code: '{pid}'",
                "raw_payload": json.dumps(r)
            })
            continue
            
        if not re.match(r'^\d{4}-\d{2}$', month):
            quarantined.append({
                "source_file": sfile,
                "project_id_raw": pid,
                "error_severity": "ERROR",
                "error_type": "INVALID_REPORTING_MONTH",
                "error_message": f"Invalid reporting month format: '{month}'",
                "raw_payload": json.dumps(r)
            })
            continue
            
        # Clean progress
        prog = r.get('physical_progress_pct')
        if prog is not None:
            if prog < 0:
                prog = 0.0
            elif prog > 100.0:
                # Cap at 100 and record warning
                quarantined.append({
                    "source_file": sfile,
                    "project_id_raw": pid,
                    "error_severity": "WARNING",
                    "error_type": "PROGRESS_EXCEEDS_100",
                    "error_message": f"Physical progress {prog}% capped at 100%",
                    "raw_payload": json.dumps(r)
                })
                prog = 100.0
                
        # Clean costs
        orig_cost = r.get('original_cost_cr')
        rev_cost = r.get('revised_cost_cr')
        ant_cost = r.get('anticipated_cost_cr')
        exp = r.get('cumulative_expenditure_cr')
        
        # Negative cost check
        if orig_cost is not None and orig_cost < 0:
            orig_cost = None
        if rev_cost is not None and rev_cost < 0:
            rev_cost = None
        if ant_cost is not None and ant_cost < 0:
            ant_cost = None
        if exp is not None and exp < 0:
            exp = 0.0
            
        if (rev_cost is None or rev_cost == 0.0) and orig_cost is not None and orig_cost > 0:
            rev_cost = orig_cost
        if (ant_cost is None or ant_cost == 0.0) and rev_cost is not None:
            ant_cost = rev_cost
            
        # Standardize Sector
        raw_sector = (r.get('sector_name') or 'Unknown').strip()
        norm_sector = SECTOR_MAP.get(raw_sector.upper(), raw_sector.title())
        
        # Standardize Ministry
        raw_min = (r.get('ministry_name') or 'Unknown').strip()
        norm_min = raw_min
        if norm_min.startswith('Ministry of') or norm_min.startswith('Department of'):
            pass
        elif norm_sector == 'Civil Aviation':
            norm_min = 'Ministry of Civil Aviation'
        elif norm_sector in ['Road Transport & Highways']:
            norm_min = 'Ministry of Road Transport & Highways'
        elif norm_sector == 'Power':
            norm_min = 'Ministry of Power'
        elif norm_sector == 'Railways':
            norm_min = 'Ministry of Railways'
        elif norm_sector in ['Petroleum & Natural Gas']:
            norm_min = 'Ministry of Petroleum & Natural Gas'
        elif norm_sector == 'Coal':
            norm_min = 'Ministry of Coal'
        elif norm_sector in ['Shipping & Ports']:
            norm_min = 'Ministry of Ports, Shipping & Waterways'
        elif norm_sector == 'Water Resources':
            norm_min = 'Department of Water Resources, River Development & GR'
        elif norm_sector == 'Steel':
            norm_min = 'Ministry of Steel'
        elif norm_sector == 'Telecommunications':
            norm_min = 'Department of Telecommunications'
        elif norm_sector in ['Health & Family Welfare']:
            norm_min = 'Ministry of Health & Family Welfare'
        elif norm_sector == 'Education':
            norm_min = 'Department of Higher Education'
            
        # Standardize State
        raw_state = (r.get('state_name') or 'Unknown').strip()
        is_multi = 1 if 'MULTI-STATES' in raw_state.upper() else 0
        
        prio = get_source_priority(sfile)
        
        cleaned = {
            "project_id": pid,
            "reporting_month": month,
            "reporting_date": f"{month}-28",
            "fiscal_year": f"20{month[2:4]}-{int(month[2:4])+1}" if int(month[5:7]) >= 4 else f"20{int(month[2:4])-1}-{month[2:4]}",
            "observation_status": "OBSERVED",
            "source_file": sfile,
            "source_page": r.get('source_page', 1),
            "project_name": r.get('project_name', f"Project {pid}").strip(),
            "agency_name": (r.get('agency_name') or 'Implementing Agency').strip(),
            "sector_name": norm_sector,
            "ministry_name": norm_min,
            "state_name": raw_state,
            "is_multi_state": is_multi,
            "approval_date": r.get('approval_date'),
            "start_date": r.get('start_date'),
            "original_doc": r.get('original_doc'),
            "revised_doc": r.get('revised_doc'),
            "anticipated_doc": r.get('anticipated_doc') or r.get('revised_doc'),
            "original_cost_cr": orig_cost,
            "revised_cost_cr": rev_cost,
            "anticipated_cost_cr": ant_cost,
            "cumulative_expenditure_cr": exp,
            "physical_progress_pct": prog,
            "raw_text": r.get('raw_text', '')
        }
        
        # Deduplication and resolution at (project_id, reporting_month) grain
        key = (pid, month)
        if key not in grain_map:
            grain_map[key] = (prio, cleaned)
        else:
            existing_prio, existing_rec = grain_map[key]
            # Higher priority wins (1 < 2)
            if prio < existing_prio:
                grain_map[key] = (prio, cleaned)
            elif prio == existing_prio:
                # If same priority, pick the one with more complete data (e.g. non-null progress/exp)
                new_score = sum([1 for v in [prog, exp, orig_cost, rev_cost] if v is not None])
                old_score = sum([1 for v in [existing_rec['physical_progress_pct'], existing_rec['cumulative_expenditure_cr'], existing_rec['original_cost_cr'], existing_rec['revised_cost_cr']] if v is not None])
                if new_score > old_score:
                    grain_map[key] = (prio, cleaned)
                    
    deduped_records = [rec for prio, rec in grain_map.values()]
    logger.info(f"Deduplication complete: {len(grain_map)} unique (project_id, reporting_month) observations retained.")
    
    os.makedirs(os.path.dirname(output_silver_path), exist_ok=True)
    with open(output_silver_path, 'w', encoding='utf-8') as f:
        json.dump(deduped_records, f, indent=2)
        
    with open(quarantine_path, 'w', encoding='utf-8') as f:
        json.dump(quarantined, f, indent=2)
        
    logger.info(f"Saved Silver standardized data to {output_silver_path} and {len(quarantined)} quarantine items to {quarantine_path}")
    return deduped_records, quarantined

if __name__ == "__main__":
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    workspace = os.environ.get("WORKSPACE_DIR", repo_root)
    standardize_records(
        os.path.join(workspace, "data", "bronze", "raw_project_observations.json"),
        os.path.join(workspace, "data", "silver", "cleaned_project_observations.json"),
        os.path.join(workspace, "data", "silver", "quarantine_records.json")
    )

