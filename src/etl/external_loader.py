import os
import sys
import openpyxl
import sqlite3
import re
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("external_loader")

MONTH_MAP = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
    'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
}

def load_external_wpi(workspace_dir: str):
    db_path = os.path.join(workspace_dir, "paimana_canonical.db")
    wpi_file = os.environ.get(
        "WPI_FILE_PATH",
        os.path.join(workspace_dir, "data", "secondary", "wpi_monthly_index_202608.xlsx")
    )
    if not os.path.exists(wpi_file):
        # Secondary fallback if present in parent directory
        parent_candidate = os.path.abspath(os.path.join(workspace_dir, "..", "PAIMANA INTEL", "Secondary dataset", "WPI and PPIs", "wpi_monthly_index_202608.xlsx"))
        if os.path.exists(parent_candidate):
            wpi_file = parent_candidate
    
    if not os.path.exists(wpi_file):
        logger.warning(f"WPI file not found at {wpi_file}. Skipping external WPI load.")
        return
        
    wb = openpyxl.load_workbook(wpi_file, read_only=True)
    ws = wb['Sheet3']
    
    rows = list(ws.iter_rows(max_row=5, values_only=True))
    header = rows[0]
    all_comm_row = rows[1]
    
    wb.close()
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    inserted = 0
    for col_idx in range(4, len(header)):
        col_name = str(header[col_idx]).strip()
        val = all_comm_row[col_idx]
        
        # Parse Month-Year e.g. Apr-23 -> 2023-04
        m = re.match(r'([A-Za-z]{3})[-_](\d{2})', col_name)
        if m and val is not None:
            mon = MONTH_MAP.get(m.group(1))
            yr = f"20{m.group(2)}"
            index_month = f"{yr}-{mon}"
            try:
                fval = float(val)
                cur.execute("""
                    INSERT INTO fact_external_macro_index
                    (index_month, index_type, commodity_or_sector, index_value)
                    VALUES (?, 'WPI', 'ALL COMMODITIES', ?)
                """, (index_month, fval))
                inserted += 1
            except ValueError:
                pass
                
    conn.commit()
    conn.close()
    logger.info(f"Loaded {inserted} external WPI monthly index observations into fact_external_macro_index.")

if __name__ == "__main__":
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    workspace = os.environ.get("WORKSPACE_DIR", repo_root)
    load_external_wpi(workspace)

