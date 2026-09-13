#!/usr/bin/env python3
"""
PAIMANA-INTEL — Source Provenance Map Generator
Generates comprehensive lineage mapping from raw source PDFs/external files
to Bronze JSON, Silver canonical tables, and Gold analytical datasets.
"""

import os
import pandas as pd

PROVENANCE_ROWS = [
    # Source Document Registry
    {
        "target_table": "dim_source_document",
        "target_column": "source_id",
        "source_category": "Metadata",
        "source_dataset": "Primary Dataset (PDFs)",
        "source_file_pattern": "*.pdf",
        "source_table_or_page": "Filename / Header",
        "source_field_name": "filename",
        "transformation_type": "Deterministic Hash",
        "transformation_rule": "SHA-256 derived source identifier",
        "notes": "Ensures idempotent ingestion across all 30 source reports"
    },
    {
        "target_table": "dim_source_document",
        "target_column": "reporting_month",
        "source_category": "Metadata",
        "source_dataset": "Primary Dataset (PDFs)",
        "source_file_pattern": "FR*.pdf / Review*.pdf",
        "source_table_or_page": "Cover Page / Title",
        "source_field_name": "Report Month",
        "transformation_type": "Regex Extraction",
        "transformation_rule": "Extracted from month-year strings to ISO YYYY-MM",
        "notes": "Normalizes varied report titling into canonical month spine"
    },

    # Core Canonical Projects
    {
        "target_table": "dim_project",
        "target_column": "project_id",
        "source_category": "Project Monitoring",
        "source_dataset": "Primary Dataset (PDFs)",
        "source_file_pattern": "FRApril2025.pdf ... FR_July_2026.pdf",
        "source_table_or_page": "Table 4 / Table 6",
        "source_field_name": "Project Code / Legacy Code / PMGID",
        "transformation_type": "Entity Resolution & Standardization",
        "transformation_rule": "Prioritizes 6-digit PAIMANA code -> Legacy OCMS alphanumeric -> Synthetic ID",
        "notes": "Forms canonical project identity across 16 months"
    },
    {
        "target_table": "dim_project",
        "target_column": "canonical_project_name",
        "source_category": "Project Monitoring",
        "source_dataset": "Primary Dataset (PDFs)",
        "source_file_pattern": "Flash Reports (Table 4/6)",
        "source_table_or_page": "Project Name Column",
        "source_field_name": "Project Name",
        "transformation_type": "String Normalization",
        "transformation_rule": "Strip trailing parenthetical agency/id annotations, uppercase normalization",
        "notes": "Preserves clean human-readable project title"
    },
    {
        "target_table": "dim_project",
        "target_column": "sector_id",
        "source_category": "Project Monitoring",
        "source_dataset": "Primary Dataset (PDFs)",
        "source_file_pattern": "Flash Reports",
        "source_table_or_page": "Sector / Header Line",
        "source_field_name": "Sector",
        "transformation_type": "Controlled Vocabulary Mapping",
        "transformation_rule": "Normalized to 12 canonical infrastructure sectors via SECTOR_MAP",
        "notes": "Standardizes varied abbreviations (e.g. RTH -> Roads & Highways)"
    },
    {
        "target_table": "dim_project",
        "target_column": "primary_state_id",
        "source_category": "Project Monitoring",
        "source_dataset": "Primary Dataset (PDFs)",
        "source_file_pattern": "Flash Reports",
        "source_table_or_page": "Location / Project Description",
        "source_field_name": "State Name",
        "transformation_type": "Geographic Normalization",
        "transformation_rule": "Mapped to ISO State/UT dimension with multi-state bridge creation",
        "notes": "Prevents artificial state cost distortion on multi-state corridors"
    },

    # Canonical Fact Project Month
    {
        "target_table": "fact_project_month",
        "target_column": "original_cost_cr",
        "source_category": "Project Monitoring",
        "source_dataset": "Primary Dataset (PDFs)",
        "source_file_pattern": "Flash Reports (Table 4/6)",
        "source_table_or_page": "Original Cost Column",
        "source_field_name": "Cost (Original)",
        "transformation_type": "Unit Normalization",
        "transformation_rule": "Parsed to ₹ Crore numeric float",
        "notes": "Certified original sanctioned project budget"
    },
    {
        "target_table": "fact_project_month",
        "target_column": "revised_cost_cr",
        "source_category": "Project Monitoring",
        "source_dataset": "Primary Dataset (PDFs)",
        "source_file_pattern": "Flash Reports (Table 4/6)",
        "source_table_or_page": "Revised Cost Column",
        "source_field_name": "Cost (Revised)",
        "transformation_type": "Domain Default Handling",
        "transformation_rule": "Parsed float; if unrevised (NULL or 0.0), defaults to original_cost_cr",
        "notes": "Represents currently sanctioned ceiling at reporting month"
    },
    {
        "target_table": "fact_project_month",
        "target_column": "cumulative_expenditure_cr",
        "source_category": "Project Monitoring",
        "source_dataset": "Primary Dataset (PDFs)",
        "source_file_pattern": "Flash Reports (Table 4/6)",
        "source_table_or_page": "Cumulative Expenditure Column",
        "source_field_name": "Cum. Exp.",
        "transformation_type": "Numeric Cleaning",
        "transformation_rule": "Cleaned float; negative values clamped to 0.0 with audit log",
        "notes": "Actual historical cash outflow reported by implementing agency"
    },
    {
        "target_table": "fact_project_month",
        "target_column": "physical_progress_pct",
        "source_category": "Project Monitoring",
        "source_dataset": "Primary Dataset (PDFs)",
        "source_file_pattern": "Flash Reports (Table 4/6)",
        "source_table_or_page": "Physical Progress Column",
        "source_field_name": "Physical Progress (%)",
        "transformation_type": "Range Validation & Capping",
        "transformation_rule": "Parsed float; clamped to [0.0, 100.0] with audit log for values > 100",
        "notes": "Site engineer certified completion percentage"
    },
    {
        "target_table": "fact_project_month",
        "target_column": "approval_date",
        "source_category": "Project Monitoring",
        "source_dataset": "Primary Dataset (PDFs)",
        "source_file_pattern": "Flash Reports (Table 4/6)",
        "source_table_or_page": "Date of Approval / Sanction",
        "source_field_name": "DOA / Approval Date",
        "transformation_type": "Date Normalization",
        "transformation_rule": "Parsed multi-format strings (DD/MM/YYYY, MM/YYYY) into ISO YYYY-MM-DD",
        "notes": "Official CCEA / Ministry sanction date"
    },
    {
        "target_table": "fact_project_month",
        "target_column": "original_doc",
        "source_category": "Project Monitoring",
        "source_dataset": "Primary Dataset (PDFs)",
        "source_file_pattern": "Flash Reports (Table 4/6)",
        "source_table_or_page": "Date of Commissioning (Original)",
        "source_field_name": "Original DOC",
        "transformation_type": "Date Normalization",
        "transformation_rule": "Parsed into ISO YYYY-MM-DD",
        "notes": "Original contractual/sanctioned commissioning target date"
    },
    {
        "target_table": "fact_project_month",
        "target_column": "anticipated_doc",
        "source_category": "Project Monitoring",
        "source_dataset": "Primary Dataset (PDFs)",
        "source_file_pattern": "Flash Reports (Table 4/6)",
        "source_table_or_page": "Date of Commissioning (Anticipated)",
        "source_field_name": "Anticipated DOC",
        "transformation_type": "Date Normalization",
        "transformation_rule": "Parsed into ISO YYYY-MM-DD",
        "notes": "Latest monitored expected commissioning date at reporting period"
    },

    # Sector Review Benchmarks
    {
        "target_table": "fact_sector_review_benchmark",
        "target_column": "reported_value",
        "source_category": "Sector Infrastructure Reviews",
        "source_dataset": "Primary Dataset (PDFs)",
        "source_file_pattern": "Review*.pdf",
        "source_table_or_page": "Sector Summary Tables",
        "source_field_name": "Target / Achievement",
        "transformation_type": "Numeric Extraction",
        "transformation_rule": "Extracted target and achievement metrics across power, coal, ports, etc.",
        "notes": "Macro sector capacity addition benchmarks (Dec 2020 to Jan 2026)"
    },

    # External Macro Series
    {
        "target_table": "fact_external_macro_index",
        "target_column": "wpi_index",
        "source_category": "Secondary External",
        "source_dataset": "Secondary dataset/WPI and PPIs",
        "source_file_pattern": "2024-25_0.xls",
        "source_table_or_page": "Monthly WPI Sheet",
        "source_field_name": "All Commodities WPI Index",
        "transformation_type": "Temporal Alignment",
        "transformation_rule": "Joined strictly on (year, month) with zero forward lookahead",
        "notes": "Deflates nominal capital escalation against macroeconomic inflation"
    },

    # Gold Metrics & ML Targets
    {
        "target_table": "gold_project_monthly_metrics",
        "target_column": "cost_escalation_pct",
        "source_category": "Derived Analytical Metric",
        "source_dataset": "fact_project_month",
        "source_file_pattern": "N/A (Derived in pipeline)",
        "source_field_name": "revised_cost_cr, original_cost_cr",
        "transformation_type": "Deterministic Algebraic",
        "transformation_rule": "((revised_cost_cr - original_cost_cr) / original_cost_cr) * 100",
        "notes": "Whole Computational Stack Part B"
    },
    {
        "target_table": "ml_dataset_master",
        "target_column": "target_cost_overrun_binary",
        "source_category": "Supervised ML Target",
        "source_dataset": "fact_project_month",
        "source_file_pattern": "N/A (Derived in pipeline)",
        "source_field_name": "terminal_revised_cost, original_cost",
        "transformation_type": "Future Horizon Label Construction",
        "transformation_rule": "1 if terminal_cost > original_cost else 0 (with right-censoring isolation)",
        "notes": "Target for CatBoost Cost Overrun Classifier"
    }
]

def generate_provenance_map():
    df = pd.DataFrame(PROVENANCE_ROWS)
    csv_path = "artifacts/provenance_map.csv"
    os.makedirs("artifacts", exist_ok=True)
    df.to_csv(csv_path, index=False)
    print(f"Saved source provenance map CSV to {csv_path}")

if __name__ == "__main__":
    generate_provenance_map()
