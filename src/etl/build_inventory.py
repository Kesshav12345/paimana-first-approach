import os
import sys
import json
import csv
import re
import hashlib
from pathlib import Path
import fitz

def generate_inventory(workspace_dir: str, output_dir: str):
    primary_dir = os.path.join(workspace_dir, "primary dataset")
    sec_dir = r"c:\Users\kessh\OneDrive\Documents\PAIMANA INTEL\Secondary dataset\WPI and PPIs"
    
    files = sorted(os.listdir(primary_dir))
    inventory = []
    
    month_regex = re.compile(r'(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[\s_-]*(202\d|2\d)', re.IGNORECASE)
    
    for idx, fname in enumerate(files, 1):
        fpath = os.path.join(primary_dir, fname)
        fsize = os.path.getsize(fpath)
        
        # Hash
        hasher = hashlib.sha256()
        with open(fpath, 'rb') as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        content_hash = hasher.hexdigest()
        
        doc = fitz.open(fpath)
        page_count = len(doc)
        
        # Extract text sample
        sample_text = ""
        for p in range(min(5, page_count)):
            sample_text += doc[p].get_text() + "\n"
            
        m = month_regex.search(fname)
        if not m:
            m = month_regex.search(sample_text)
        period_str = m.group(0).upper().replace("_", " ").strip() if m else "UNKNOWN"
        
        # Check table types
        has_proj_table = False
        start_page = -1
        for p in range(min(65, page_count)):
            t = doc[p].get_text().upper()
            if ('TABLE 4' in t or 'TABLE:-6' in t or 'TABLE 6' in t or 'ALL ONGOING PROJECTS' in t) and ('SL.NO' in t or 'SL NO' in t or 'MINISTRY OF' in t):
                has_proj_table = True
                start_page = p + 1
                break
                
        doc.close()
        
        source_id = f"SRC_PRI_{idx:03d}"
        if has_proj_table:
            source_category = "PROJECT_MONITORING"
            data_domain = "Infrastructure Project Monitoring"
            current_vs_hist = "CURRENT_SNAPSHOT_SERIES" if "2026" in period_str or "2025" in period_str else "HISTORICAL_ARCHIVAL"
            notes = f"Contains detailed project-level monitoring records starting at page {start_page}."
            cand_proj_id = "Project Code / (Project Code) / PMGID / Legacy OCMS Code"
            cand_date = "Date of Approval, Original DoC, Revised DoC, Anticipated DoC"
            cand_cost = "Original Cost, Revised Cost, Cumulative Expenditure"
            cand_prog = "Physical Progress (%)"
            cand_status = "Inferred from DoC and Progress"
            cand_sector = "Sector / Sub-Sector header"
            cand_ministry = "Ministry / Department header"
            cand_state = "State / Multi-States"
            cand_agency = "Agency / Implementing Agency"
            cand_issue = "Document narrative & delay annotations"
            cand_milestone = "Target / Revised DoC milestones"
        else:
            source_category = "SECTOR_PERFORMANCE"
            data_domain = "Macro Sectoral Production Benchmarks"
            current_vs_hist = "HISTORICAL_BENCHMARK"
            notes = "Contains sector-level target vs actual infrastructure achievements (Power, Coal, Steel, etc.)."
            cand_proj_id = "N/A (Sectoral Aggregate)"
            cand_date = "Month/Year of review, Cumulative FY"
            cand_cost = "Sectoral capital expenditure / targets"
            cand_prog = "Target achievement percentage"
            cand_status = "Target achieved / below target"
            cand_sector = "Sector Name"
            cand_ministry = "Line Ministry"
            cand_state = "Regional / National"
            cand_agency = "Sectoral PSUs (e.g. CIL, NTPC)"
            cand_issue = "Bottlenecks cited in sector notes"
            cand_milestone = "Annual & monthly targets"

        rec = {
            "source_id": source_id,
            "source_name": fname,
            "repository_path": f"primary dataset/{fname}",
            "file_type": "pdf",
            "source_category": source_category,
            "data_domain": data_domain,
            "reporting_period": period_str,
            "date_range": period_str,
            "row_count": page_count, # proxy for PDF pages
            "column_count": 8 if has_proj_table else 6,
            "file_size": fsize,
            "encoding": "binary/pdf",
            "sheet_names": "N/A",
            "candidate_project_id_fields": cand_proj_id,
            "candidate_date_fields": cand_date,
            "candidate_cost_fields": cand_cost,
            "candidate_progress_fields": cand_prog,
            "candidate_status_fields": cand_status,
            "candidate_sector_fields": cand_sector,
            "candidate_ministry_fields": cand_ministry,
            "candidate_state_fields": cand_state,
            "candidate_agency_fields": cand_agency,
            "candidate_issue_fields": cand_issue,
            "candidate_milestone_fields": cand_milestone,
            "external_dataset_indicator": "FALSE",
            "current_vs_historical_indicator": current_vs_hist,
            "content_hash": content_hash,
            "notes": notes
        }
        inventory.append(rec)

    # Add External WPI/PPI if available
    if os.path.exists(sec_dir):
        for sidx, sf in enumerate(sorted(os.listdir(sec_dir)), 1):
            sfpath = os.path.join(sec_dir, sf)
            if not sf.endswith(('.xlsx', '.xls')): continue
            sfsize = os.path.getsize(sfpath)
            rec = {
                "source_id": f"SRC_EXT_{sidx:03d}",
                "source_name": sf,
                "repository_path": f"Secondary dataset/WPI and PPIs/{sf}",
                "file_type": "xlsx",
                "source_category": "EXTERNAL_INDICATOR",
                "data_domain": "Price Index (Inflation / Deflator)",
                "reporting_period": "2023-04 to 2026-08",
                "date_range": "2023-04 to 2026-08",
                "row_count": 50,
                "column_count": 40,
                "file_size": sfsize,
                "encoding": "utf-8",
                "sheet_names": "Monthly / Quarterly Index",
                "candidate_project_id_fields": "N/A (Commodity Code)",
                "candidate_date_fields": "Month-Year columns",
                "candidate_cost_fields": "Index values",
                "candidate_progress_fields": "N/A",
                "candidate_status_fields": "N/A",
                "candidate_sector_fields": "Commodity Group / Sector",
                "candidate_ministry_fields": "Office of Economic Adviser, DPIIT",
                "candidate_state_fields": "All India",
                "candidate_agency_fields": "DPIIT",
                "candidate_issue_fields": "N/A",
                "candidate_milestone_fields": "N/A",
                "external_dataset_indicator": "TRUE",
                "current_vs_historical_indicator": "EXTERNAL_MONTHLY_INDEX",
                "content_hash": "EXTERNAL",
                "notes": "Used for inflation adjustment and material price pressure indicators."
            }
            inventory.append(rec)

    # Save to CSV and JSON
    os.makedirs(output_dir, exist_ok=True)
    csv_path = os.path.join(output_dir, "data_inventory.csv")
    json_path = os.path.join(output_dir, "data_inventory.json")
    
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=list(inventory[0].keys()))
        writer.writeheader()
        writer.writerows(inventory)
        
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(inventory, f, indent=2)
        
    print(f"Generated data inventory: {len(inventory)} sources recorded at {csv_path} and {json_path}")

if __name__ == "__main__":
    generate_inventory(r"c:\Users\kessh\OneDrive\Documents\paimana first approach", "artifacts")
