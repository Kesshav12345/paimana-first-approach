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
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Offshore",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Multi-State"
]

def normalize_state_string(raw_state: str) -> str:
    if not raw_state or str(raw_state).strip() in ['Unknown', '', 'None']:
        return 'Unknown'
    s = str(raw_state).strip()
    su = s.upper()
    if su in ['MULTI-STATES', 'MULTI STATE', 'MULTI-STATE', 'PAN INDIA', 'ALL INDIA', 'NATIONAL']:
        return 'Multi-State'
    if 'MULTI' in su:
        return 'Multi-State'
    if su in ['OFFSHORE', 'MUMBAI HIGH']:
        return 'Offshore'
    if su.startswith('JAMMU') or su in ['JAMMU AND', 'JAMMU & KASHMIR', 'J&K']:
        return 'Jammu and Kashmir'
    if su.startswith('ANDAMAN') or 'NICOBAR' in su:
        return 'Andaman and Nicobar Islands'
    if su.startswith('DADRA') or 'DAMAN' in su or 'DIU' in su or 'NAGAR HAVELI' in su:
        return 'Dadra and Nagar Haveli and Daman and Diu'
    for st in INDIAN_STATES:
        if st.lower() == s.lower():
            return st
    return s.title()


# Comprehensive geography keywords -> canonical state
STATE_KEYWORDS = {
    "West Bengal": [
        "WEST BENGAL", "BENGAL", "KOLKATA", "HOWRAH", "DURGAPUR", "ASANSOL",
        "SILIGURI", "DANKUNI", "HALDIA", "BARANAGAR", "BARRACKPORE", "DAKSHINESHWAR",
        "RANIGANJ", "SARPI", "SHYAMSUNDARPUR", "IISCO", "DSP", "BURNPUR",
    ],
    "Gujarat": [
        "GUJARAT", "AHMEDABAD", "SURAT", "VADODARA", "BARODA", "RAJKOT",
        "BHAVNAGAR", "JAMNAGAR", "GANDHINAGAR", "LIMBDI", "MESANKA", "RADHANPUR",
        "BHIMASAR", "ANJAR", "BHUJ", "HAZIRA", "MUNDRA", "KANDLA", "DAHEJ",
        "PALANPUR", "MEHSANA", "ANAND", "SURENDRANAGAR", "KESHOD", "DHOLERA",
        "SAMAKHIALI", "VIRAMGAM", "ZANKA", "NUNHERA",
    ],
    "Rajasthan": [
        "RAJASTHAN", "JAIPUR", "JODHPUR", "KOTA", "BIKANER", "AJMER",
        "UDAIPUR", "TONK", "SAWAI MADHOPUR", "SAWAIMADHOPUR", "DAUSA",
        "KARAULI", "BHENSARA", "SAMBHU KI BHURJ", "SHAMBHU KI BHURJ",
        "JAISALMER", "BARMER", "NAGAUR", "HANUMANGARH", "SANCHORE", "SANTALPUR",
        "PALI", "SIKAR", "ALWAR", "BHARATPUR", "CHURU", "JHUNJHUNU",
    ],
    "Maharashtra": [
        "MAHARASHTRA", "MUMBAI", "PUNE", "NAGPUR", "NASHIK", "AURANGABAD",
        "SAMBHAJI NAGAR", "THANE", "BHOKARDAN", "KUMBHARI FATA", "TIRORA",
        "GONDIA", "PIMPLNER", "SATANA", "AJANTHA", "BULDHANA", "GOSIKHURD",
        "YEKONA", "UKNI", "WARDHA", "CHANDRAPUR", "BILOLI", "JALNA",
        "NIMBAL", "KOLHAPUR", "SOLAPUR", "AMRAVATI", "AKOLA", "NANDED",
        "SH-335", "NH-752G", "NH- 752G", "WCL", "VIDARBHA", "MARATHWADA",
        "BALAGHAT", "BHANDARA", "WASHIM", "RAIGAD", "RATNAGIRI", "SINDHUDURG",
        "SATARA", "SANGLI", "LATUR",
    ],
    "Bihar": [
        "BIHAR", "PATNA", "GAYA", "BHAGALPUR", "MUZAFFARPUR", "BUXAR",
        "NABINAGAR", "BARH", "BODH GAYA", "KARMALICHAK", "NAWADA",
        "DARBHANGA", "PURNEA", "SAMASTIPUR", "BEGUSARAI", "SIWAN",
        "HAJIPUR", "CHHAPRA", "BETTIAH", "MADHUBANI",
    ],
    "Jharkhand": [
        "JHARKHAND", "RANCHI", "DHANBAD", "BOKARO", "KODERMA", "DEOGHAR",
        "HAZARIBAGH", "ISM DHANBAD", "BCCL", "CCL", "ECL", "GIRIDIH",
        "GODDA", "PAKUR", "DUMKA", "PALAMU", "GUMLA", "CHAIBASA",
    ],
    "Tamil Nadu": [
        "TAMIL NADU", "TAMILNADU", "CHENNAI", "COIMBATORE", "MADURAI",
        "TRICHY", "TIRUCHIRAPPALLI", "SALEM", "HOSUR", "PERALAM", "KAYATHAR",
        "TUTICORIN", "VELLORE", "ERODE", "TIRUNELVELI", "CUDDALORE",
        "ENNORE", "KATTUPALLI", "KAMARAJAR", "CHENGALPATTU",
    ],
    "Puducherry": [
        "PUDUCHERRY", "PONDICHERRY", "KARAIKAL",
    ],
    "Andhra Pradesh": [
        "ANDHRA PRADESH", "VIJAYAWADA", "VISAKHAPATNAM", "VIZAG", "KADAPA",
        "RAJAHMUNDRY", "KURNOOL", "TIRUPATI", "NELLORE", "GUNTUR",
        "VANKARAKUNTA", "ODULAPALLE", "NALLACHERUVUPALLI", "ONGOLE",
        "BHEEMUNIPATNAM", "KRISHNAPATNAM", "GANGAVARAM", "KAKINADA",
        "ELURU", "ANANTAPUR", "CHITTOOR",
    ],
    "Telangana": [
        "TELANGANA", "HYDERABAD", "WARANGAL", "RAMAGUNDAM", "ZAHEERABAD",
        "SCCL", "MANCHERIAL", "KARIMNAGAR", "NIZAMABAD", "KHAMMAM",
        "NALGONDA", "MAHBUBNAGAR", "ADILABAD",
    ],
    "Karnataka": [
        "KARNATAKA", "BENGALURU", "BANGALORE", "MYSORE", "MYSURU",
        "HUBBALLI", "DHARWAD", "MANGALURU", "MANGALORE", "DAVANAGERE",
        "YESHVANTHPUR", "BAIYYAPPANAHALLI", "CHANNASANDRA", "IISC",
        "BELLARY", "TUMKUR", "BELAGAVI", "BIDAR", "VIJAYAPURA",
        "KALABURAGI", "CHITRADURGA", "BAGALKOT", "GADAG", "HAVERI",
        "HASSAN", "SHIVAMOGGA", "KOPPAL", "RAICHUR", "YADGIR",
        "UDUPI", "CHIKKAMAGALURU", "BANAVARA", "BETTADAHALLI", "AURAD",
    ],
    "Kerala": [
        "KERALA", "KOCHI", "COCHIN", "TRIVANDRUM", "THIRUVANANTHAPURAM",
        "KOZHIKODE", "CALICUT", "THRISSUR", "KOLLAM", "PALAKKAD",
        "ALAPPUZHA", "MALAPPURAM", "KANNUR", "KASARAGOD",
    ],
    "Madhya Pradesh": [
        "MADHYA PRADESH", "BHOPAL", "INDORE", "GWALIOR", "JABALPUR",
        "UJJAIN", "SINGRAULI", "REWA", "SECL", "SATNA", "SAGAR",
        "DAMOH", "KATNI", "CHHINDWARA", "SEONI", "MANDLA", "BALAGHAT",
    ],
    "Chhattisgarh": [
        "CHHATTISGARH", "RAIPUR", "BHILAI", "BILASPUR", "KORBA",
        "GEVRA", "KIRANDUL", "BSP", "DURG", "RAJNANDGAON", "RAIGARH",
        "SURGUJA", "AMBIKAPUR", "KOREA", "JASHPUR",
    ],
    "Odisha": [
        "ODISHA", "ORISSA", "BHUBANESWAR", "ROURKELA", "PURI", "CUTTACK",
        "BERHAMPUR", "BALANGIR", "PANGAM", "POTTERU", "KONGURUKONDA",
        "RSP", "MCL", "TALCHER", "ANGUL", "SAMBALPUR", "JHARSUGUDA",
        "BOLANGIR", "KALAHANDI", "KORAPUT", "RAYAGADA", "GANJAM",
        "KENDRAPARA", "KENDUJHAR", "KEONJHAR", "PARADIP", "DHAMARA",
    ],
    "Punjab": [
        "PUNJAB", "LUDHIANA", "AMRITSAR", "JALANDHAR", "PATIALA",
        "KILA RAIPUR", "LDH-JHL", "MOHALI", "BATHINDA", "GURDASPUR",
        "FEROZEPUR", "MOGA", "BARNALA", "SANGRUR",
    ],
    "Haryana": [
        "HARYANA", "GURUGRAM", "GURGAON", "FARIDABAD", "PANIPAT",
        "AMBALA", "ROHTAK", "KARNAL", "REWARI", "HISAR", "BHIWANI",
        "MAHENDRAGARH", "PALWAL", "BAHADURGARH", "SONIPAT",
    ],
    "Uttar Pradesh": [
        "UTTAR PRADESH", "LUCKNOW", "KANPUR", "AGRA", "VARANASI",
        "MEERUT", "PRAYAGRAJ", "ALLAHABAD", "NOIDA", "GORAKHPUR",
        "JAUNPUR", "ZAFFARABAD", "CHANDAULI", "MEJA", "MATHURA",
        "FIROZABAD", "MORADABAD", "BAREILLY", "ALIGARH", "SAHARANPUR",
        "MUZAFFARNAGAR", "GHAZIABAD", "BULANDSHAHR", "ETAWAH",
        "MAINPURI", "FATEHPUR", "CHITRAKOOT", "MIRZAPUR", "SONBHADRA",
        "VARANASI", "AZAMGARH", "MAU", "DEORIA", "BASTI",
    ],
    "Uttarakhand": [
        "UTTARAKHAND", "DEHRADUN", "HARIDWAR", "RISHIKESH", "ROORKEE",
        "TEHRI", "VISHNUGAD PIPALKOTI", "SUNNI DAM", "NAINITAL",
        "ALMORA", "PITHORAGARH", "CHAMOLI", "RUDRAPRAYAG", "PAURI",
        "KOTDWAR", "KASHIPUR", "HALDWANI", "UDHAM SINGH NAGAR",
    ],
    "Himachal Pradesh": [
        "HIMACHAL PRADESH", "SHIMLA", "DHARAMSHALA", "KULLU", "MANALI",
        "MANDI", "SOLAN", "KANGRA", "CHAMBA", "BILASPUR", "HAMIRPUR",
        "NAHAN", "UNA", "SIRMAUR",
    ],
    "Jammu and Kashmir": [
        "JAMMU", "KASHMIR", "SRINAGAR", "UDHAMPUR", "BARAMULLA",
        "SAMBA", "VIJAYPUR", "KATRA", "BANIHAL", "SOPORE",
        "ANANTNAG", "PULWAMA", "KUPWARA", "BANDIPORA", "GANDERBAL",
        "REASI", "RAMBAN", "KISHTWAR", "DODA", "POONCH", "RAJOURI",
    ],
    "Ladakh": [
        "LADAKH", "LEH", "KARGIL",
    ],
    "Assam": [
        "ASSAM", "GUWAHATI", "SILCHAR", "DIBRUGARH", "NUMALIGARH",
        "AGTHORI", "KAMAKHYA", "SARAIGHAT", "JORHAT", "TEZPUR",
        "GOLAGHAT", "NAGAON", "BONGAIGAON", "DHUBRI", "KOKRAJHAR",
        "TINSUKIA", "SIBSAGAR",
    ],
    "Arunachal Pradesh": [
        "ARUNACHAL", "ITANAGAR", "DIBANG", "SUBANSIRI",
        "TAWANG", "NAHARLAGUN", "ZIRO", "PASIGHAT",
    ],
    "Manipur": [
        "MANIPUR", "IMPHAL", "UKHRUL", "JIRIBAM", "TOLOI", "TADUBI",
        "JESSAMI", "BISHNUPUR", "THOUBAL", "SENAPATI", "TAMENGLONG",
        "CHANDEL", "CHURACHANDPUR",
    ],
    "Meghalaya": [
        "MEGHALAYA", "SHILLONG", "TURA", "NONGPOH", "JOWAI",
        "NONGSTOIN", "BAGHMARA",
    ],
    "Mizoram": [
        "MIZORAM", "AIZAWL", "LUNGLEI", "SERCHHIP", "CHAMPHAI",
    ],
    "Nagaland": [
        "NAGALAND", "KOHIMA", "DIMAPUR", "MOKOKCHUNG", "UNGER",
        "YESEMYONG", "TUENSANG", "WOKHA", "ZUNHEBOTO", "PHEK",
    ],
    "Sikkim": [
        "SIKKIM", "GANGTOK", "PAKYONG", "YANGANG", "RANGIT",
        "NAMCHI", "JORETHANG",
    ],
    "Tripura": [
        "TRIPURA", "AGARTALA", "UDAIPUR", "DHARMANAGAR", "KAILASHAHAR",
    ],
    "Andaman and Nicobar Islands": [
        "ANDAMAN", "NICOBAR", "PORT BLAIR", "AUSTIN CREEK",
        "NIMBUTALA", "MIDDLE STRAIT CREEK", "PORTBLAIR",
    ],
    "Delhi": [
        "DELHI", "NEW DELHI", "DWARKA", "LODHI ROAD", "LUTYENS",
        "SAKET", "LAJPAT NAGAR", "CONNAUGHT PLACE",
    ],
    "Goa": [
        "GOA", "PANAJI", "VASCO", "MARGAO", "MADGAON",
    ],
    "Multi-State": [
        "MULTI-STATES", "MULTI STATE", "BHARATNET",
        "DELHI VADODARA", "DELHI MUMBAI", "FOUR STATES",
        "ASPIRATIONAL DISTRICT SCHEME", "AMENDED BHARATNET",
        "MULTIPLE STATES", "ALL INDIA", "NATIONAL",
    ],
    "Offshore": [
        "OFFSHORE", "MUMBAI HIGH", "ONSHORE OFFSHORE",
        "BOMBAY OFFSHORE", "DEEP WATER", "OIL FIELDS OFFSHORE",
    ],
}

def resolve_state_from_name(name: str, agency: str = "") -> str:
    """Resolve state from project name and agency using keyword matching."""
    combined = (name + " " + agency).upper()
    
    # Check Multi-State first (broad scope projects)
    for kw in STATE_KEYWORDS["Multi-State"]:
        if kw in combined:
            return "Multi-State"
            
    # Single state keywords
    for state, kws in STATE_KEYWORDS.items():
        if state == "Multi-State":
            continue
        for kw in kws:
            if kw in combined:
                return state
    
    return "Unknown"

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
    
    unknown_state_count = 0
    resolved_by_name = 0
    
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
        sector = Counter([o['sector_name'] for o in obs_sorted if o['sector_name'] not in ['Unknown', '']]).most_common(1)
        canonical_sector = sector[0][0] if sector else first_obs['sector_name']
        all_sectors.add(canonical_sector)
        
        ministry = Counter([o['ministry_name'] for o in obs_sorted if o['ministry_name'] not in ['Unknown', '']]).most_common(1)
        canonical_ministry = ministry[0][0] if ministry else first_obs['ministry_name']
        all_ministries.add(canonical_ministry)
        
        agency = Counter([o['agency_name'] for o in obs_sorted if o['agency_name'] not in ['Unknown', 'Implementing Agency']]).most_common(1)
        canonical_agency = agency[0][0] if agency else first_obs['agency_name']
        all_agencies.add(canonical_agency)
        
        norm_states = [normalize_state_string(o['state_name']) for o in obs_sorted if o.get('state_name')]
        valid_states = [st for st in norm_states if st not in ['Unknown', '']]
        state_counter = Counter(valid_states).most_common(1)
        canonical_state_str = state_counter[0][0] if state_counter else 'Unknown'
        
        # Fallback: resolve from project name / agency
        if canonical_state_str in ['Unknown', '']:
            unknown_state_count += 1
            resolved = resolve_state_from_name(canonical_name, canonical_agency)
            if resolved != 'Unknown':
                canonical_state_str = normalize_state_string(resolved)
                resolved_by_name += 1
                
        # Final fallback: mark as Multi-State for national programs
        if canonical_state_str in ['Unknown', '']:
            canonical_state_str = 'Multi-State'
            
        canonical_state_str = normalize_state_string(canonical_state_str)
        is_multi = 1 if canonical_state_str in ['Multi-State', 'Offshore'] else 0
        
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
        
        # Bridge state decomposition
        bridge_states.append({
            "project_id": pid,
            "state_name": canonical_state_str,
            "association_type": "PRIMARY",
            "allocated_pct": 100.0,
            "allocated_cost_cr": orig_cost
        })
        all_states.add(canonical_state_str)
            
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
    os.makedirs(os.path.dirname(id_map_csv), exist_ok=True)
    with open(id_map_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=list(identity_map[0].keys()))
        writer.writeheader()
        writer.writerows(identity_map)
        
    logger.info(f"Resolved {len(dim_projects)} unique canonical projects.")
    logger.info(f"Generated {len(bridge_states)} project-state bridge entries.")
    logger.info(f"Of {unknown_state_count} Unknown states: resolved {resolved_by_name} by name/agency lookup, rest marked Multi-State.")
    logger.info(f"Saved project identity map to {id_map_csv}")
    
    return dim_projects, bridge_states

if __name__ == "__main__":
    resolve_entities(
        r"c:\Users\kessh\OneDrive\Documents\paimana first approach\data\silver\cleaned_project_observations.json",
        r"c:\Users\kessh\OneDrive\Documents\paimana first approach\data\silver"
    )
