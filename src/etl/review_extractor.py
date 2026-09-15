import os
import sys
import re
import json
import logging
import fitz

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("review_extractor")

MONTH_NAME_TO_NUM = {
    'JANUARY': '01', 'FEBRUARY': '02', 'MARCH': '03', 'APRIL': '04',
    'MAY': '05', 'JUNE': '06', 'JULY': '07', 'AUGUST': '08',
    'SEPTEMBER': '09', 'OCTOBER': '10', 'NOVEMBER': '11', 'DECEMBER': '12',
    'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05',
    'JUN': '06', 'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10',
    'NOV': '11', 'DEC': '12'
}

SECTOR_INDICATOR_PATTERNS = [
    ("Power Generation", r"Power generation[^\(]*\(([\d\.]+)\s*(?:per cent|%)\)"),
    ("Coal Production", r"Production of Coal[^\(]*\(([\d\.]+)\s*(?:per cent|%)\)"),
    ("Crude Oil Production", r"(?:Crude Oil|Production of Crude Oil)[^\(]*\(([\d\.]+)\s*(?:per cent|%)\)"),
    ("Refinery Products", r"(?:Refinery products|Crude Oil Processed)[^\(]*\(([\d\.]+)\s*(?:per cent|%)\)"),
    ("Fertilizers Production", r"Production of Fertilizers?[^\(]*\(([\d\.]+)\s*(?:per cent|%)\)"),
    ("Cement Production", r"Production of Cement[^\(]*\(([\d\.]+)\s*(?:per cent|%)\)"),
    ("Finished Steel", r"(?:Production of Finished Steel|Finished Steel)[^\(]*\(([\d\.]+)\s*(?:per cent|%)\)"),
    ("Railways Freight", r"(?:Freight Traffic|Railways)[^\(]*\(([\d\.]+)\s*(?:per cent|%)\)"),
    ("Cargo Major Ports", r"(?:Cargo handled at Major Ports|Cargo Handled at major Ports)[^\(]*\(([\d\.]+)\s*(?:per cent|%)\)"),
    ("Civil Aviation Passengers", r"(?:Civil Aviation|Passenger Traffic)[^\(]*\(([\d\.]+)\s*(?:per cent|%)\)"),
    ("Highways Upgradation", r"(?:Highways|Roads|State PWD and BRO)[^\(]*\(([\d\.]+)\s*(?:per cent|%)\)")
]

def extract_review_reports(workspace_dir: str, output_bronze_dir: str):
    primary_dir = os.path.join(workspace_dir, "primary dataset")
    os.makedirs(output_bronze_dir, exist_ok=True)
    
    files = sorted(os.listdir(primary_dir))
    records = []
    
    for fname in files:
        if not fname.endswith('.pdf'): continue
        if not ('Review' in fname or 'CompleteReview' in fname): continue
        
        fpath = os.path.join(primary_dir, fname)
        doc = fitz.open(fpath)
        
        # Determine reporting month
        m = re.search(r'(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[\s_-]*(202\d|2\d)', fname.upper())
        if m:
            mname = m.group(1).upper()
            yr = m.group(2)
            if len(yr) == 2: yr = "20" + yr
            rep_month = f"{yr}-{MONTH_NAME_TO_NUM[mname]}"
        else:
            rep_month = "UNKNOWN"
            
        full_text = ""
        for p in range(min(10, len(doc))):
            full_text += doc[p].get_text() + "\n"
            
        # Match sector indicators
        matched_count = 0
        for sector_name, pattern in SECTOR_INDICATOR_PATTERNS:
            match = re.search(pattern, full_text, re.IGNORECASE)
            if match:
                achieve_pct = float(match.group(1))
                records.append({
                    "source_file": fname,
                    "reporting_period": fname.replace('.pdf', ''),
                    "reporting_month": rep_month,
                    "sector_name": sector_name,
                    "indicator_name": f"{sector_name} Target Achievement",
                    "unit": "Percentage (%)",
                    "monthly_target": 100.0,
                    "monthly_actual": achieve_pct,
                    "monthly_achievement_pct": achieve_pct,
                    "source_page": 5
                })
                matched_count += 1
                
        doc.close()
        logger.info(f"Processed Review Report {fname}: {matched_count} sector indicators extracted")
        
    out_json = os.path.join(output_bronze_dir, "raw_sector_performance.json")
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2)
        
    logger.info(f"Saved {len(records)} sector performance indicators to {out_json}")
    return records

if __name__ == "__main__":
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    workspace = os.environ.get("WORKSPACE_DIR", repo_root)
    extract_review_reports(
        workspace,
        os.path.join(workspace, "data", "bronze")
    )

