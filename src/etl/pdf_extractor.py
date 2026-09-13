import os
import sys
import re
import json
import logging
from pathlib import Path
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

def parse_paimana_flash(fpath: str):
    """
    Parser for PAIMANA Flash Reports (July 2025 through July 2026).
    """
    doc = fitz.open(fpath)
    fname = os.path.basename(fpath)
    rep_month = extract_reporting_month(fname, doc)
    logger.info(f"Extracting PAIMANA format: {fname} (Month: {rep_month}, Pages: {len(doc)})")
    
    re_ministry = re.compile(r'^(Ministry of|Department of)\s+(.+)', re.IGNORECASE)
    re_code = re.compile(r'\((\d{6}|\w\d{8}|\d{7,9})\)')
    re_date = re.compile(r'\b\d{1,2}/\d{4}\b')
    
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
                proj_lines = []
                j = i + 1
                while j < len(lines):
                    lj = lines[j]
                    if (lj.isdigit() and int(lj) == sl + 1) or re_ministry.match(lj) or lj.startswith('Page ') or lj.startswith('Project Assessment') or lj.startswith('All Ongoing Projects'):
                        break
                    proj_lines.append(lj)
                    j += 1
                    
                block_text = " ".join(proj_lines)
                code_match = re_code.search(block_text)
                if code_match:
                    proj_code = code_match.group(1)
                    
                    agency = "Unknown"
                    agency_matches = re.findall(r'\(([^)]+)\)', block_text)
                    for am in agency_matches:
                        am_s = am.strip()
                        if am_s != proj_code and not am_s.isdigit() and not re_date.match(am_s) and am_s not in ['-', 'N.A.', 'NA']:
                            agency = am_s
                            break
                            
                    first_paren = block_text.find('(')
                    proj_name = block_text[:first_paren].strip() if first_paren > 0 else block_text[:80].strip()
                    
                    state = "Unknown"
                    m_state = re.search(r'\b(Multi-States[^\d]*|Andhra Pradesh|Arunachal Pradesh|Assam|Bihar|Chhattisgarh|Goa|Gujarat|Haryana|Himachal Pradesh|Jharkhand|Karnataka|Kerala|Madhya Pradesh|Maharashtra|Manipur|Meghalaya|Mizoram|Nagaland|Odisha|Punjab|Rajasthan|Sikkim|Tamil Nadu|Telangana|Tripura|Uttar Pradesh|Uttarakhand|West Bengal|Delhi|Jammu and Kashmir|Ladakh|Puducherry|Offshore)\b', block_text, re.IGNORECASE)
                    if m_state:
                        state = m_state.group(1).strip()
                        if state.startswith('Multi-States') and '(' in state and not state.endswith(')'):
                            state += ')'
                            
                    dates_found = re.findall(r'\b(\d{1,2}/\d{4})\b', block_text)
                    app_date = normalize_date(dates_found[0]) if len(dates_found) > 0 else None
                    start_date = normalize_date(dates_found[1]) if len(dates_found) > 2 else None
                    orig_doc = normalize_date(dates_found[1]) if len(dates_found) == 2 else (normalize_date(dates_found[2]) if len(dates_found) > 2 else None)
                    rev_doc = normalize_date(dates_found[-1]) if len(dates_found) >= 3 and dates_found[-1] != dates_found[0] else None
                    
                    num_tokens = []
                    for tok in reversed(proj_lines):
                        val = clean_num(tok)
                        if val is not None and not re_date.match(tok.replace('(', '').replace(')', '')):
                            num_tokens.append(val)
                        if len(num_tokens) >= 4:
                            break
                            
                    progress_pct = num_tokens[0] if len(num_tokens) >= 1 else None
                    cum_exp = num_tokens[1] if len(num_tokens) >= 2 else None
                    rev_cost = num_tokens[2] if len(num_tokens) >= 3 else None
                    orig_cost = num_tokens[3] if len(num_tokens) >= 4 else (rev_cost if rev_cost else None)
                    
                    if rev_cost is None and orig_cost is not None:
                        rev_cost = orig_cost
                        
                    records.append({
                        "source_file": fname,
                        "reporting_month": rep_month,
                        "source_page": pno + 1,
                        "sl_no": sl,
                        "project_id": proj_code,
                        "project_name": proj_name,
                        "agency_name": agency,
                        "sector_name": current_sector,
                        "ministry_name": current_ministry,
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
                        "raw_text": block_text[:300]
                    })
                    i = j
                    continue
            i += 1
            
    doc.close()
    logger.info(f"Extracted {len(records)} records from {fname}")
    return records

def parse_mospi_table6(fpath: str):
    """
    Parser for earlier MoSPI Flash Reports & QPISR (April, May, June 2025, QPISR Q1 2025-26).
    """
    doc = fitz.open(fpath)
    fname = os.path.basename(fpath)
    rep_month = extract_reporting_month(fname, doc)
    logger.info(f"Extracting MoSPI Table 6 format: {fname} (Month: {rep_month}, Pages: {len(doc)})")
    
    re_code = re.compile(r'^\(\s*([A-Za-z]?\d{6,9})\s*\)$')
    re_date = re.compile(r'\b\d{1,2}[/-]\d{4}\b')
    
    records = []
    current_sector = "Civil Aviation"
    current_state = "Unknown"
    
    states_list = [
        'ANDHRA PRADESH', 'ARUNACHAL PRADESH', 'ASSAM', 'BIHAR', 'CHHATTISGARH',
        'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL PRADESH', 'JHARKHAND', 'KARNATAKA',
        'KERALA', 'MADHYA PRADESH', 'MAHARASHTRA', 'MANIPUR', 'MEGHALAYA', 'MIZORAM',
        'NAGALAND', 'ODISHA', 'PUNJAB', 'RAJASTHAN', 'SIKKIM', 'TAMIL NADU',
        'TELANGANA', 'TRIPURA', 'UTTAR PRADESH', 'UTTARAKHAND', 'WEST BENGAL',
        'DELHI', 'JAMMU AND KASHMIR', 'LADAKH', 'MULTI-STATES', 'OFFSHORE'
    ]
    
    for pno in range(len(doc)):
        text = doc[pno].get_text()
        # Check if page has project table headers
        t_upper = text.upper()
        if not (('SL NO' in t_upper or 'SL.NO' in t_upper or 'SL. NO' in t_upper) and ('PROJECT NAME' in t_upper or 'PROJECT CODE' in t_upper)):
            continue
            
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        # Scan lines to find project code indices
        code_indices = [idx for idx, l in enumerate(lines) if re_code.match(l)]
        if not code_indices:
            continue
            
        # Update sector or state if present near top
        for top_line in lines[:15]:
            tl_up = top_line.upper()
            if tl_up in states_list:
                current_state = top_line.title()
            elif tl_up in ['CIVIL AVIATION', 'COAL', 'POWER', 'RAILWAYS', 'ROAD TRANSPORT AND HIGHWAYS', 'PETROLEUM', 'STEEL', 'SHIPPING AND PORTS', 'TELECOMMUNICATIONS', 'WATER RESOURCES', 'HEALTH AND FAMILY WELFARE', 'MINES']:
                current_sector = top_line.title()
                
        for k, c_idx in enumerate(code_indices):
            proj_code = re_code.match(lines[c_idx]).group(1)
            
            # Agency is typically line immediately before code
            agency = "Unknown"
            if c_idx > 0:
                prev_line = lines[c_idx - 1]
                m_ag = re.search(r'\(\s*([^)]+?)\s*\)', prev_line)
                if m_ag:
                    agency = m_ag.group(1).strip()
                elif prev_line.startswith('('):
                    agency = prev_line.strip('() ')
                    
            # Find start of project (preceding serial number)
            # Search backwards from c_idx - 1
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
            if not proj_name:
                proj_name = f"Project {proj_code}"
                
            # Tokens after code up to next project or page end
            next_bound = code_indices[k+1] if k + 1 < len(code_indices) else len(lines)
            after_tokens = lines[c_idx + 1: min(c_idx + 12, next_bound)]
            
            # Extract dates from after_tokens
            dates_found = []
            num_tokens = []
            for tok in after_tokens:
                m_d = re_date.search(tok.replace('{', '').replace('}', '').replace('(', '').replace(')', ''))
                if m_d:
                    nd = normalize_date(m_d.group(0))
                    if nd: dates_found.append(nd)
                else:
                    v = clean_num(tok)
                    if v is not None:
                        num_tokens.append(v)
                        
            app_date = dates_found[0] if len(dates_found) > 0 else None
            orig_doc = dates_found[1] if len(dates_found) > 1 else None
            rev_doc = dates_found[-1] if len(dates_found) > 2 else orig_doc
            
            # num_tokens corresponds to [orig_cost, rev_cost, ant_cost, exp, progress]
            orig_cost = None
            rev_cost = None
            ant_cost = None
            cum_exp = None
            progress_pct = None
            
            if len(num_tokens) >= 5:
                orig_cost = num_tokens[0]
                rev_cost = num_tokens[1]
                ant_cost = num_tokens[2]
                cum_exp = num_tokens[3]
                progress_pct = num_tokens[4]
            elif len(num_tokens) == 4:
                orig_cost = num_tokens[0]
                rev_cost = num_tokens[1]
                cum_exp = num_tokens[2]
                progress_pct = num_tokens[3]
            elif len(num_tokens) == 3:
                orig_cost = num_tokens[0]
                cum_exp = num_tokens[1]
                progress_pct = num_tokens[2]
            elif len(num_tokens) >= 1:
                orig_cost = num_tokens[0]
                
            records.append({
                "source_file": fname,
                "reporting_month": rep_month,
                "source_page": pno + 1,
                "sl_no": sl_no,
                "project_id": proj_code,
                "project_name": proj_name,
                "agency_name": agency,
                "sector_name": current_sector,
                "ministry_name": "MoSPI Monitored Line Ministry",
                "state_name": current_state,
                "approval_date": app_date,
                "start_date": app_date,
                "original_doc": orig_doc,
                "revised_doc": rev_doc,
                "anticipated_doc": ant_cost if isinstance(ant_cost, str) else rev_doc,
                "original_cost_cr": orig_cost,
                "revised_cost_cr": rev_cost if rev_cost is not None else orig_cost,
                "anticipated_cost_cr": ant_cost if ant_cost is not None else (rev_cost if rev_cost is not None else orig_cost),
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
    
    files = sorted(os.listdir(primary_dir))
    all_extracted_records = []
    summary = {}
    
    for fname in files:
        fpath = os.path.join(primary_dir, fname)
        if not fname.endswith('.pdf'): continue
        
        doc = fitz.open(fpath)
        is_paimana = False
        is_mospi_t6 = False
        for p in range(min(45, len(doc))):
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
