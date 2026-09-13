import os
import sys
import json
import csv
import re
import logging
from collections import Counter

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("entity_resolver")

INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Offshore"
]

def normalize_name(name: str) -> str:
    s = name.lower()
    s = re.sub(r'\(.*?\)', '', s)
    s = re.sub(r'[^a-z0-9\s]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def resolve_entities(silver_observations_path: str, output_dir: str):
    with open(silver_observations_path, 'r', encoding='utf-8') as f:
        observations = json.load(f)
        
    logger.info(f"Resolving entities from {len(observations)} standardized observations...")
    
    # Group observations by project_id
    by_project = {}
    for obs in observations:
        pid = obs['project_id']
        if pid not in by_project:
            by_project[pid] = []
        by_project[pid].append(obs)
        
    logger.info(f"Identified {len(by_project)} candidate canonical projects.")
    
    dim_projects = []
    bridge_states = []
    identity_map = []
    
    all_sectors = set()
    all_ministries = set()
    all_agencies = set()
    all_states = set(INDIAN_STATES)
    
    for pid, obs_list in by_project.items():
        # Sort chronologically by reporting_month
        obs_sorted = sorted(obs_list, key=lambda x: x['reporting_month'])
        first_obs = obs_sorted[0]
        latest_obs = obs_sorted[-1]
        
        # Determine canonical name (longest cleanest observed title)
        names = [o['project_name'] for o in obs_sorted if len(o['project_name']) > 5]
        canonical_name = max(names, key=len) if names else first_obs['project_name']
        norm_name = normalize_name(canonical_name)
        
        # Majority voting for organizational dimensions
        sector = Counter([o['sector_name'] for o in obs_sorted if o['sector_name'] != 'Unknown']).most_common(1)
        canonical_sector = sector[0][0] if sector else first_obs['sector_name']
        all_sectors.add(canonical_sector)
        
        ministry = Counter([o['ministry_name'] for o in obs_sorted if o['ministry_name'] != 'Unknown']).most_common(1)
        canonical_ministry = ministry[0][0] if ministry else first_obs['ministry_name']
        all_ministries.add(canonical_ministry)
        
        agency = Counter([o['agency_name'] for o in obs_sorted if o['agency_name'] != 'Unknown']).most_common(1)
        canonical_agency = agency[0][0] if agency else first_obs['agency_name']
        all_agencies.add(canonical_agency)
        
        state_counter = Counter([o['state_name'] for o in obs_sorted if o['state_name'] != 'Unknown']).most_common(1)
        canonical_state_str = state_counter[0][0] if state_counter else first_obs['state_name']
        
        is_multi = 1 if 'MULTI-STATES' in canonical_state_str.upper() else 0
        
        # Original dates & baselines from earliest valid observation
        app_date = None
        start_date = None
        orig_doc = None
        orig_cost = None
        
        for o in obs_sorted:
            if not app_date and o.get('approval_date'): app_date = o['approval_date']
            if not start_date and o.get('start_date'): start_date = o['start_date']
            if not orig_doc and o.get('original_doc'): orig_doc = o['original_doc']
            if orig_cost is None and o.get('original_cost_cr') is not None: orig_cost = o['original_cost_cr']
            
        # Lifecycle status
        latest_prog = latest_obs.get('physical_progress_pct')
        latest_orig_doc = latest_obs.get('original_doc')
        latest_ant_doc = latest_obs.get('anticipated_doc') or latest_obs.get('revised_doc')
        
        if latest_prog is not None and latest_prog >= 100.0:
            lifecycle_status = "Completed"
        elif latest_ant_doc and latest_orig_doc and latest_ant_doc > latest_orig_doc:
            lifecycle_status = "Delayed"
        else:
            lifecycle_status = "Ongoing"
            
        proj_rec = {
            "project_id": pid,
            "legacy_ocms_code": pid if pid.startswith('N') or len(pid) > 6 else None,
            "pmgid": None,
            "canonical_project_name": canonical_name,
            "normalized_name": norm_name,
            "sector_name": canonical_sector,
            "ministry_name": canonical_ministry,
            "agency_name": canonical_agency,
            "state_name": canonical_state_str,
            "is_multi_state": is_multi,
            "original_approval_date": app_date,
            "actual_start_date": start_date or app_date,
            "original_doc": orig_doc,
            "original_cost_cr": orig_cost,
            "first_monitored_month": obs_sorted[0]['reporting_month'],
            "latest_monitored_month": obs_sorted[-1]['reporting_month'],
            "observation_count": len(obs_sorted),
            "project_lifecycle_status": lifecycle_status
        }
        dim_projects.append(proj_rec)
        
        # Handle state decomposition for Multi-State projects
        if is_multi:
            # Parse constituent states inside parentheses
            m_states = re.findall(r'[A-Za-z\s]+', canonical_state_str.replace('Multi-States', ''))
            extracted_states = []
            for st in m_states:
                st_clean = st.strip()
                for known_s in INDIAN_STATES:
                    if known_s.lower() == st_clean.lower() or known_s.lower() in st_clean.lower():
                        if known_s not in extracted_states:
                            extracted_states.append(known_s)
                            
            if not extracted_states:
                extracted_states = ["Multi-States"]
                
            for st in extracted_states:
                bridge_states.append({
                    "project_id": pid,
                    "state_name": st,
                    "association_type": "PARTICIPATING",
                    "allocated_pct": round(100.0 / len(extracted_states), 2) if len(extracted_states) > 0 else 100.0,
                    "allocated_cost_cr": round(orig_cost / len(extracted_states), 2) if orig_cost and len(extracted_states) > 0 else None
                })
        else:
            clean_s = canonical_state_str.strip()
            # Match with known states
            matched_s = clean_s
            for ks in INDIAN_STATES:
                if ks.lower() == clean_s.lower():
                    matched_s = ks
                    break
            all_states.add(matched_s)
            bridge_states.append({
                "project_id": pid,
                "state_name": matched_s,
                "association_type": "PRIMARY",
                "allocated_pct": 100.0,
                "allocated_cost_cr": orig_cost
            })
            
        # Project identity mapping entry
        identity_map.append({
            "canonical_project_id": pid,
            "source_system": "PAIMANA_PORTAL" if len(pid) == 6 and pid.isdigit() else "MOSPI_OCMS",
            "source_project_id": pid,
            "source_project_name": first_obs['project_name'],
            "normalized_project_name": norm_name,
            "match_method": "EXACT_CANONICAL_CODE",
            "match_confidence": 1.0,
            "manual_review_required": "NO",
            "effective_from": obs_sorted[0]['reporting_month'],
            "effective_to": obs_sorted[-1]['reporting_month']
        })
        
    os.makedirs(output_dir, exist_ok=True)
    
    # Save outputs
    with open(os.path.join(output_dir, "dim_project.json"), 'w', encoding='utf-8') as f:
        json.dump(dim_projects, f, indent=2)
        
    with open(os.path.join(output_dir, "bridge_project_state.json"), 'w', encoding='utf-8') as f:
        json.dump(bridge_states, f, indent=2)
        
    # Save identity map CSV
    id_map_csv = r"c:\Users\kessh\OneDrive\Documents\paimana first approach\artifacts\project_identity_map.csv"
    with open(id_map_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=list(identity_map[0].keys()))
        writer.writeheader()
        writer.writerows(identity_map)
        
    logger.info(f"Resolved {len(dim_projects)} unique canonical projects.")
    logger.info(f"Generated {len(bridge_states)} project-state bridge entries.")
    logger.info(f"Saved project identity map to {id_map_csv}")
    
    return dim_projects, bridge_states

if __name__ == "__main__":
    resolve_entities(
        r"c:\Users\kessh\OneDrive\Documents\paimana first approach\data\silver\cleaned_project_observations.json",
        r"c:\Users\kessh\OneDrive\Documents\paimana first approach\data\silver"
    )
