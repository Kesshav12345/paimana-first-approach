import os
import sys
import re
import json
import logging
from pathlib import Path
from collections import Counter
import fitz

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("pdf_extractor")

MONTH_NAME_TO_NUM = {
    'JANUARY': '01', 'FEBRUARY': '02', 'MARCH': '03', 'APRIL': '04',
    'MAY': '05', 'JUNE': '06', 'JULY': '07', 'AUGUST': '08',
    'SEPTEMBER': '09', 'OCTOBER': '10', 'NOVEMBER': '11', 'DECEMBER': '12',
    'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05',
    'JUN': '06', 'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10',
    'NOV': '11', 'DEC': '12'
}

# MoSPI Official Project Code Prefix Mapping
CODE_TO_SECTOR_MINISTRY = {
    'N04': ('Civil Aviation', 'Ministry of Civil Aviation'),
    'N06': ('Coal', 'Ministry of Coal'),
    'N07': ('Finance', 'Ministry of Finance'),
    'N10': ('Power', 'Ministry of New and Renewable Energy'),
    'N11': ('DPIIT', 'Ministry of Commerce and Industry'),
    'N12': ('Department of Higher Education', 'Ministry of Education'),
    'N13': ('Health and Family Welfare', 'Ministry of Health & Family Welfare'),
    'N14': ('Mines', 'Ministry of Mines'),
    'N16': ('Petroleum and Natural Gas', 'Ministry of Petroleum & Natural Gas'),
    'N18': ('Power', 'Ministry of Power'),
    'N21': ('Health and Family Welfare', 'Ministry of Health & Family Welfare'),
    'N22': ('Railways', 'Ministry of Railways'),
    'N24': ('Road Transport and Highways', 'Ministry of Road Transport & Highways'),
    'N25': ('Shipping and Ports', 'Ministry of Ports, Shipping and Waterways'),
    'N26': ('Telecommunications', 'Department of Telecommunications'),
    'N27': ('Shipping and Ports', 'Ministry of Ports, Shipping and Waterways'),
    'N28': ('Steel', 'Ministry of Steel'),
    'N29': ('Telecommunications', 'Department of Telecommunications'),
    'N30': ('Urban Development', 'Ministry of Housing & Urban Affairs'),
    'N31': ('Water Resources', 'Department of Water Resources, River Development & GR'),
    'N38': ('Social Justice', 'Ministry of Social Justice and Empowerment'),
    'N40': ('DPIIT', 'Ministry of Commerce and Industry'),
    'N42': ('Department of Higher Education', 'Ministry of Education'),
    'N44': ('Department of Higher Education', 'Ministry of Education'),
    'N45': ('Home Affairs', 'Ministry of Home Affairs'),
}

AGENCY_TO_SECTOR_MINISTRY = {
    'NHAI': ('Road Transport and Highways', 'Ministry of Road Transport & Highways'),
    'NHIDCL': ('Road Transport and Highways', 'Ministry of Road Transport & Highways'),
    'MoRTH': ('Road Transport and Highways', 'Ministry of Road Transport & Highways'),
    'MORTH': ('Road Transport and Highways', 'Ministry of Road Transport & Highways'),
    'NR': ('Railways', 'Ministry of Railways'),
    'SR': ('Railways', 'Ministry of Railways'),
    'CR': ('Railways', 'Ministry of Railways'),
    'WR': ('Railways', 'Ministry of Railways'),
    'ECR': ('Railways', 'Ministry of Railways'),
    'SECR': ('Railways', 'Ministry of Railways'),
    'NFR': ('Railways', 'Ministry of Railways'),
    'ER': ('Railways', 'Ministry of Railways'),
    'NCR': ('Railways', 'Ministry of Railways'),
    'SWR': ('Railways', 'Ministry of Railways'),
    'SCR': ('Railways', 'Ministry of Railways'),
    'WCR': ('Railways', 'Ministry of Railways'),
    'NER': ('Railways', 'Ministry of Railways'),
    'RVNL': ('Railways', 'Ministry of Railways'),
    'IRCON': ('Railways', 'Ministry of Railways'),
    'MRVC': ('Railways', 'Ministry of Railways'),
    'DFCCIL': ('Railways', 'Ministry of Railways'),
    'NTPC': ('Power', 'Ministry of Power'),
    'NHPC': ('Power', 'Ministry of Power'),
    'POWERGRID': ('Power', 'Ministry of Power'),
    'NEEPCO': ('Power', 'Ministry of Power'),
    'SJVN': ('Power', 'Ministry of Power'),
    'THDC': ('Power', 'Ministry of Power'),
    'DVC': ('Power', 'Ministry of Power'),
    'CIL': ('Coal', 'Ministry of Coal'),
    'SECL': ('Coal', 'Ministry of Coal'),
    'WCL': ('Coal', 'Ministry of Coal'),
    'MCL': ('Coal', 'Ministry of Coal'),
    'BCCL': ('Coal', 'Ministry of Coal'),
    'ECL': ('Coal', 'Ministry of Coal'),
    'CCL': ('Coal', 'Ministry of Coal'),
    'NLC': ('Coal', 'Ministry of Coal'),
    'IOCL': ('Petroleum and Natural Gas', 'Ministry of Petroleum & Natural Gas'),
    'BPCL': ('Petroleum and Natural Gas', 'Ministry of Petroleum & Natural Gas'),
    'HPCL': ('Petroleum and Natural Gas', 'Ministry of Petroleum & Natural Gas'),
    'ONGC': ('Petroleum and Natural Gas', 'Ministry of Petroleum & Natural Gas'),
    'GAIL': ('Petroleum and Natural Gas', 'Ministry of Petroleum & Natural Gas'),
    'NRL': ('Petroleum and Natural Gas', 'Ministry of Petroleum & Natural Gas'),
    'CPCL': ('Petroleum and Natural Gas', 'Ministry of Petroleum & Natural Gas'),
    'MRPL': ('Petroleum and Natural Gas', 'Ministry of Petroleum & Natural Gas'),
    'OIL': ('Petroleum and Natural Gas', 'Ministry of Petroleum & Natural Gas'),
    'AAI': ('Civil Aviation', 'Ministry of Civil Aviation'),
    'SAIL': ('Steel', 'Ministry of Steel'),
    'RINL': ('Steel', 'Ministry of Steel'),
    'NMDC': ('Mines', 'Ministry of Mines'),
    'KIOCL': ('Steel', 'Ministry of Steel'),
    'MOIL': ('Steel', 'Ministry of Steel'),
    'BSNL': ('Telecommunications', 'Department of Telecommunications'),
    'MTNL': ('Telecommunications', 'Department of Telecommunications'),
    'BBNL': ('Telecommunications', 'Department of Telecommunications'),
    'DMRC': ('Urban Development', 'Ministry of Housing & Urban Affairs'),
    'MMRDA': ('Urban Development', 'Ministry of Housing & Urban Affairs'),
    'BMRCL': ('Urban Development', 'Ministry of Housing & Urban Affairs'),
    'CMRL': ('Urban Development', 'Ministry of Housing & Urban Affairs'),
    'GMRC': ('Urban Development', 'Ministry of Housing & Urban Affairs'),
    'KMRL': ('Urban Development', 'Ministry of Housing & Urban Affairs'),
    'UPMRC': ('Urban Development', 'Ministry of Housing & Urban Affairs'),
    'MPMRCL': ('Urban Development', 'Ministry of Housing & Urban Affairs'),
    'NCRTC': ('Urban Development', 'Ministry of Housing & Urban Affairs'),
    'NWDA': ('Water Resources', 'Department of Water Resources, River Development & GR'),
    'CWMA': ('Water Resources', 'Department of Water Resources, River Development & GR'),
    'WAPCOS': ('Water Resources', 'Department of Water Resources, River Development & GR'),
    'AIIMS': ('Health and Family Welfare', 'Ministry of Health & Family Welfare'),
    'ESIC': ('Health and Family Welfare', 'Ministry of Labour and Employment'),
    'HSCC': ('Health and Family Welfare', 'Ministry of Health & Family Welfare'),
    'IIT': ('Department of Higher Education', 'Ministry of Education'),
    'NIT': ('Department of Higher Education', 'Ministry of Education'),
    'IISER': ('Department of Higher Education', 'Ministry of Education'),
    'IIM': ('Department of Higher Education', 'Ministry of Education'),
    'IISC': ('Department of Higher Education', 'Ministry of Education')
}

INDIAN_STATES = [
    'ANDAMAN AND NICOBAR ISLANDS', 'ANDHRA PRADESH', 'ARUNACHAL PRADESH', 'ASSAM', 'BIHAR', 'CHHATTISGARH',
    'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL PRADESH', 'JHARKHAND', 'KARNATAKA',
    'KERALA', 'MADHYA PRADESH', 'MAHARASHTRA', 'MANIPUR', 'MEGHALAYA', 'MIZORAM',
    'NAGALAND', 'ODISHA', 'PUNJAB', 'RAJASTHAN', 'SIKKIM', 'TAMIL NADU',
    'TELANGANA', 'TRIPURA', 'UTTAR PRADESH', 'UTTARAKHAND', 'WEST BENGAL',
    'DELHI', 'JAMMU AND KASHMIR', 'LADAKH', 'PUDUCHERRY', 'MULTI-STATES', 'MULTI STATE', 'OFFSHORE'
]

OFFICIAL_SECTORS = [
    'CIVIL AVIATION', 'COAL', 'POWER', 'RAILWAYS', 'ROAD TRANSPORT AND HIGHWAYS', 'ROAD TRANSPORT & HIGHWAYS',
    'ROADS & HIGHWAYS', 'ROADS & BRIDGES', 'PETROLEUM', 'PETROLEUM & NATURAL GAS', 'STEEL',
    'SHIPPING AND PORTS', 'PORTS, SHIPPING AND WATERWAYS', 'TELECOMMUNICATIONS', 'TELECOMMUNICATION',
    'WATER RESOURCES', 'WASTE & WATER', 'HEALTH AND FAMILY WELFARE', 'HEALTHCARE', 'MINES', 'METALS & MINING',
    'URBAN DEVELOPMENT', 'REAL ESTATE', 'DEPARTMENT OF HIGHER EDUCATION', 'EDUCATION', 'DPIIT', 'FINANCE',
    'HOME AFFAIRS', 'SOCIAL JUSTICE', 'ATOMIC ENERGY', 'CHEMICALS AND FERTILIZERS'
]

def clean_num(val):
    if not val: return None
    s = str(val).strip().replace(',', '').replace('(', '').replace(')', '').replace('{', '').replace('}', '')
    if s in ['-', 'N.A.', 'NA', 'N.A', '', 'Nil', 'NIL']:
        return None
    m = re.search(r'[-+]?\d*\.?\d+', s)
    if m:
        try:
            return float(m.group(0))
        except ValueError:
            return None
    return None

def normalize_date(val):
    if not val: return None
    s = str(val).strip().replace('(', '').replace(')', '').replace('{', '').replace('}', '').strip()
    if s in ['-', 'N.A.', 'NA', 'N.A', '', 'Nil']: return None
    
    # Format MM/YYYY or M-YYYY or MM-YYYY
    m = re.search(r'\b(\d{1,2})[/-](\d{4})\b', s)
    if m:
        mm = int(m.group(1))
        yyyy = int(m.group(2))
        if 1 <= mm <= 12 and 1980 <= yyyy <= 2050:
            return f"{yyyy:04d}-{mm:02d}-01"
            
    # Format DD-MM-YYYY or DD/MM/YYYY
    m = re.search(r'\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b', s)
    if m:
        dd = int(m.group(1))
        mm = int(m.group(2))
        yyyy = int(m.group(3))
        if 1 <= mm <= 12 and 1980 <= yyyy <= 2050:
            return f"{yyyy:04d}-{mm:02d}-01"
            
    return None

def extract_reporting_month(filename: str, doc) -> str:
    m = re.search(r'(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[\s_-]*(202\d|2\d)', filename.upper())
    if m:
        mname = m.group(1).upper()
        yr = m.group(2)
        if len(yr) == 2: yr = "20" + yr
        return f"{yr}-{MONTH_NAME_TO_NUM[mname]}"
        
    for p in range(min(5, len(doc))):
        text = doc[p].get_text().upper()
        m = re.search(r'(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+(202\d)', text)
        if m:
            return f"{m.group(2)}-{MONTH_NAME_TO_NUM[m.group(1)]}"
            
    return "UNKNOWN"

def parse_token_value(s: str):
    s = s.strip()
    is_paren = s.startswith('(') and s.endswith(')')
    is_brace = s.startswith('{') and s.endswith('}')
    core = s.replace('(', '').replace(')', '').replace('{', '').replace('}', '').strip()
    if core in ['N.A.', 'NA', '-', '', 'Nil', 'NIL']:
        return None, is_paren, is_brace, False
    m_d = re.match(r'^\b(\d{1,2})[/-](\d{4})\b$', core)
    if m_d:
        return f"{int(m_d.group(2)):04d}-{int(m_d.group(1)):02d}-01", is_paren, is_brace, True
    try:
        f = float(core.replace(',', ''))
        return f, is_paren, is_brace, False
    except ValueError:
        return None, is_paren, is_brace, False

def parse_paimana_flash(fpath: str):
    """
    Parser for PAIMANA Flash Reports (July 2025 through July 2026).
    """
    doc = fitz.open(fpath)
    fname = os.path.basename(fpath)
    rep_month = extract_reporting_month(fname, doc)
    logger.info(f"Extracting PAIMANA format: {fname} (Month: {rep_month}, Pages: {len(doc)})")
    
    re_ministry = re.compile(r'^(Ministry of|Department of|Department for)\s+(.+)', re.IGNORECASE)
    re_code = re.compile(r'^\(\s*([A-Za-z0-9_-]{5,12})\s*\)$')
    re_date = re.compile(r'\b\d{1,2}[/-]\d{4}\b')
    
    current_ministry = "Unknown"
    current_sector = "Unknown"
    records = []
    
    for pno in range(len(doc)):
        text = doc[pno].get_text()
        if 'ALL ONGOING PROJECTS' not in text.upper():
            continue
            
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        i = 0
        while i < len(lines):
            line = lines[i]
            
            if re_ministry.match(line):
                current_ministry = line
                i += 1
                if i < len(lines) and not lines[i].isdigit() and not lines[i].startswith('Sl.'):
                    current_sector = lines[i]
                    i += 1
                continue
                
            if line.isdigit() and int(line) < 5000:
                sl = int(line)
                proj_tokens = []
                j = i + 1
                while j < len(lines):
                    lj = lines[j]
                    if re_ministry.match(lj) or (lj.isdigit() and int(lj) == sl + 1) or lj.startswith('All Ongoing Projects') or lj.startswith('Project Assessment') or lj.startswith('Page '):
                        break
                    proj_tokens.append(lj)
                    j += 1
                    
                # Find project code token
                code_idx = -1
                for k, tok in enumerate(proj_tokens):
                    if re_code.match(tok) and not re_date.search(tok) and tok != '(-)':
                        code_idx = k
                        break
                        
                if code_idx != -1:
                    proj_code = re_code.match(proj_tokens[code_idx]).group(1)
                    
                    # Agency is typically preceding token
                    agency = "Unknown"
                    if code_idx > 0:
                        prev_tok = proj_tokens[code_idx - 1]
                        m_ag = re.search(r'\(([^)]+)\)', prev_tok)
                        agency = m_ag.group(1).strip() if m_ag else prev_tok.strip('() ')
                        
                    name_tokens = proj_tokens[:code_idx - 1] if code_idx > 1 else [proj_tokens[0]]
                    proj_name = " ".join(name_tokens).strip()
                    if not proj_name or proj_name == agency:
                        proj_name = f"Project {proj_code}"
                        
                    rem = proj_tokens[code_idx + 1:]
                    # Skip legacy code lines like (-) (-)
                    if rem and ('(-)' in rem[0] or re.search(r'\([^)]*\)\s*\([^)]*\)', rem[0])):
                        rem = rem[1:]
                        
                    state = "Unknown"
                    if rem and not re_date.search(rem[0]) and not any(c.isdigit() for c in rem[0]) and len(rem[0]) > 2:
                        state = rem[0]
                        rem = rem[1:]
                    else:
                        full_block = " ".join(proj_tokens)
                        m_state = re.search(r'\b(Multi-States[^\d]*|Multi-State|Andhra Pradesh|Arunachal Pradesh|Assam|Bihar|Chhattisgarh|Goa|Gujarat|Haryana|Himachal Pradesh|Jharkhand|Karnataka|Kerala|Madhya Pradesh|Maharashtra|Manipur|Meghalaya|Mizoram|Nagaland|Odisha|Punjab|Rajasthan|Sikkim|Tamil Nadu|Telangana|Tripura|Uttar Pradesh|Uttarakhand|West Bengal|Delhi|Jammu and Kashmir|Ladakh|Puducherry|Offshore)\b', full_block, re.IGNORECASE)
                        if m_state:
                            state = m_state.group(1).strip()
                            
                    # Parse dates and numeric metrics
                    dates = []
                    nums = []
                    for t in rem:
                        v, is_p, is_b, is_dt = parse_token_value(t)
                        if v is not None:
                            if is_dt: dates.append((v, is_p))
                            else: nums.append((v, is_p))
                            
                    app_date = dates[0][0] if len(dates) > 0 else None
                    start_date = dates[1][0] if len(dates) > 2 else app_date
                    orig_doc = dates[1][0] if len(dates) == 2 else (dates[2][0] if len(dates) > 2 else None)
                    rev_doc = dates[-1][0] if len(dates) >= 3 else orig_doc
                    
                    orig_cost = nums[0][0] if len(nums) > 0 else None
                    rev_cost = nums[1][0] if len(nums) > 1 else orig_cost
                    cum_exp = nums[2][0] if len(nums) > 2 else 0.0
                    progress_pct = nums[3][0] if len(nums) > 3 else 0.0
                    
                    # Sector / Ministry determination
                    pfx = proj_code[:3]
                    eff_sector = current_sector
                    eff_ministry = current_ministry
                    if pfx in CODE_TO_SECTOR_MINISTRY:
                        eff_sector, eff_ministry = CODE_TO_SECTOR_MINISTRY[pfx]
                    elif agency in AGENCY_TO_SECTOR_MINISTRY:
                        eff_sector, eff_ministry = AGENCY_TO_SECTOR_MINISTRY[agency]
                        
                    records.append({
                        "source_file": fname,
                        "reporting_month": rep_month,
                        "source_page": pno + 1,
                        "sl_no": sl,
                        "project_id": proj_code,
                        "project_name": proj_name,
                        "agency_name": agency,
                        "sector_name": eff_sector,
                        "ministry_name": eff_ministry,
                        "state_name": state,
                        "approval_date": app_date,
                        "start_date": start_date,
                        "original_doc": orig_doc,
                        "revised_doc": rev_doc,
                        "anticipated_doc": rev_doc,
                        "original_cost_cr": orig_cost,
                        "revised_cost_cr": rev_cost,
                        "anticipated_cost_cr": rev_cost,
                        "cumulative_expenditure_cr": cum_exp,
                        "physical_progress_pct": progress_pct,
                        "raw_text": f"{proj_name} ({agency}) ({proj_code})"
                    })
                    i = j
                    continue
            i += 1
            
    doc.close()
    logger.info(f"Extracted {len(records)} records from {fname}")
    return records

def parse_mospi_table6(fpath: str):
    """
    Parser for earlier MoSPI Flash Reports (April, May, June 2025).
    Uses full-page continuous scanning for states and sectors, plus spatial project parsing.
    """
    doc = fitz.open(fpath)
    fname = os.path.basename(fpath)
    rep_month = extract_reporting_month(fname, doc)
    logger.info(f"Extracting MoSPI Table 6 format: {fname} (Month: {rep_month}, Pages: {len(doc)})")
    
    re_code = re.compile(r'^\(\s*([A-Za-z]?\d{6,9})\s*\)$')
    
    records = []
    current_sector = "Unknown"
    current_state = "Unknown"
    current_ministry = "Unknown"
    
    for pno in range(len(doc)):
        text = doc[pno].get_text()
        t_upper = text.upper()
        if not (('SL NO' in t_upper or 'SL.NO' in t_upper or 'SL. NO' in t_upper) and ('PROJECT NAME' in t_upper or 'PROJECT CODE' in t_upper)):
            continue
            
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        code_indices = [idx for idx, l in enumerate(lines) if re_code.match(l)]
        if not code_indices:
            continue
            
        for idx, l in enumerate(lines):
            l_up = l.upper()
            # Multi-word state check
            for st in INDIAN_STATES:
                st_words = st.split()
                if len(st_words) > 1 and idx + len(st_words) <= len(lines):
                    cand = ' '.join([lines[idx + w].upper() for w in range(len(st_words))])
                    if cand == st:
                        current_state = st.title()
                elif l_up == st:
                    current_state = st.title()
                    
            # Multi-word sector check
            for sec in OFFICIAL_SECTORS:
                sec_words = sec.split()
                if len(sec_words) > 1 and idx + len(sec_words) <= len(lines):
                    cand = ' '.join([lines[idx + w].upper() for w in range(len(sec_words))])
                    if cand == sec:
                        current_sector = sec.title()
                elif l_up == sec:
                    current_sector = sec.title()
                    
            if l.startswith('Ministry of') or l.startswith('Department of'):
                current_ministry = l
                
        for k, c_idx in enumerate(code_indices):
            proj_code = re_code.match(lines[c_idx]).group(1)
            
            agency = "Unknown"
            if c_idx > 0:
                prev_line = lines[c_idx - 1]
                m_ag = re.search(r'\(\s*([^)]+?)\s*\)', prev_line)
                if m_ag:
                    agency = m_ag.group(1).strip()
                elif prev_line.startswith('('):
                    agency = prev_line.strip('() ')
                    
            prev_bound = code_indices[k-1] if k > 0 else 0
            sl_idx = -1
            for b in range(c_idx - 1, max(-1, prev_bound), -1):
                if lines[b].isdigit() and int(lines[b]) < 5000:
                    sl_idx = b
                    break
                    
            sl_no = int(lines[sl_idx]) if sl_idx != -1 else k + 1
            name_start = sl_idx + 1 if sl_idx != -1 else max(0, c_idx - 3)
            name_end = c_idx - 1 if agency != "Unknown" else c_idx
            proj_name = " ".join(lines[name_start:name_end]).strip()
            if not proj_name or proj_name == agency:
                proj_name = f"Project {proj_code}"
                
            next_bound = code_indices[k+1] if k + 1 < len(code_indices) else len(lines)
            after_tokens = lines[c_idx + 1: min(c_idx + 15, next_bound)]
            
            dates_plain, dates_paren, dates_brace = [], [], []
            nums_plain, nums_paren, nums_brace = [], [], []
            for tok in after_tokens:
                val, is_p, is_b, is_dt = parse_token_value(tok)
                if val is not None:
                    if is_dt:
                        if is_b: dates_brace.append(val)
                        elif is_p: dates_paren.append(val)
                        else: dates_plain.append(val)
                    else:
                        if is_b: nums_brace.append(val)
                        elif is_p: nums_paren.append(val)
                        else: nums_plain.append(val)
                        
            app_date = dates_plain[0] if len(dates_plain) > 0 else None
            orig_doc = dates_plain[1] if len(dates_plain) > 1 else None
            rev_doc = dates_paren[0] if len(dates_paren) > 0 else orig_doc
            ant_doc = dates_brace[0] if len(dates_brace) > 0 else (rev_doc or orig_doc)
            
            orig_cost = nums_plain[0] if len(nums_plain) > 0 else None
            rev_cost = nums_paren[0] if len(nums_paren) > 0 else orig_cost
            ant_cost = nums_brace[0] if len(nums_brace) > 0 else rev_cost
            cum_exp = nums_plain[1] if len(nums_plain) > 1 else 0.0
            progress_pct = nums_plain[2] if len(nums_plain) > 2 else 0.0
            
            # Deterministic mapping
            pfx = proj_code[:3]
            eff_sector = current_sector
            eff_ministry = current_ministry
            if pfx in CODE_TO_SECTOR_MINISTRY:
                eff_sector, eff_ministry = CODE_TO_SECTOR_MINISTRY[pfx]
            elif agency in AGENCY_TO_SECTOR_MINISTRY:
                eff_sector, eff_ministry = AGENCY_TO_SECTOR_MINISTRY[agency]
                
            records.append({
                "source_file": fname,
                "reporting_month": rep_month,
                "source_page": pno + 1,
                "sl_no": sl_no,
                "project_id": proj_code,
                "project_name": proj_name,
                "agency_name": agency,
                "sector_name": eff_sector,
                "ministry_name": eff_ministry,
                "state_name": current_state,
                "approval_date": app_date,
                "start_date": app_date,
                "original_doc": orig_doc,
                "revised_doc": rev_doc,
                "anticipated_doc": ant_doc,
                "original_cost_cr": orig_cost,
                "revised_cost_cr": rev_cost if rev_cost is not None else orig_cost,
                "anticipated_cost_cr": ant_cost if ant_cost is not None else rev_cost,
                "cumulative_expenditure_cr": cum_exp,
                "physical_progress_pct": progress_pct,
                "raw_text": f"{proj_name} ({agency}) ({proj_code})"
            })
            
    doc.close()
    logger.info(f"Extracted {len(records)} records from {fname}")
    return records

def extract_all_project_reports(workspace_dir: str, output_bronze_dir: str):
    primary_dir = os.path.join(workspace_dir, "primary dataset")
    os.makedirs(output_bronze_dir, exist_ok=True)
    
    # Authoritative Flash Reports from April 2025 onwards only!
    files = sorted(os.listdir(primary_dir))
    flash_files = [f for f in files if ('FLASH' in f.upper() or 'FR' in f.upper()) and f.endswith('.pdf')]
    logger.info(f"Targeting {len(flash_files)} Authoritative Flash Reports from April 2025 onwards.")
    
    all_extracted_records = []
    summary = {}
    
    for fname in flash_files:
        fpath = os.path.join(primary_dir, fname)
        doc = fitz.open(fpath)
        is_paimana = False
        is_mospi_t6 = False
        for p in range(min(55, len(doc))):
            t = doc[p].get_text().upper()
            if 'ALL ONGOING PROJECTS' in t:
                is_paimana = True
                break
            if ('SL NO' in t or 'SL.NO' in t or 'SL. NO' in t) and ('PROJECT NAME' in t or 'PROJECT CODE' in t):
                is_mospi_t6 = True
                break
        doc.close()
        
        if is_paimana:
            recs = parse_paimana_flash(fpath)
            all_extracted_records.extend(recs)
            summary[fname] = len(recs)
        elif is_mospi_t6:
            recs = parse_mospi_table6(fpath)
            all_extracted_records.extend(recs)
            summary[fname] = len(recs)
            
    out_json = os.path.join(output_bronze_dir, "raw_project_observations.json")
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(all_extracted_records, f, indent=2)
        
    logger.info(f"EXTRACTION COMPLETE: Total {len(all_extracted_records)} project observations saved to {out_json}")
    for k, v in summary.items():
        logger.info(f"  {k:35s}: {v:5d} observations")
        
    return all_extracted_records

if __name__ == "__main__":
    extract_all_project_reports(
        r"c:\Users\kessh\OneDrive\Documents\paimana first approach",
        r"c:\Users\kessh\OneDrive\Documents\paimana first approach\data\bronze"
    )
