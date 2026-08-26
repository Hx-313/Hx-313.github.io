"""
Pipeline file I/O wiring for the blue-ocean-finder skill.

Provides helper functions for:
- Creating the output directory structure (data/, reports/, charts/)
- Saving Step 3 output (opportunities.json)
- Saving Step 4 output (opportunity_answers.json)
- Saving Step 6 output (final_report.md)
- Generating CSV content for recommended products and Alibaba supply search

These functions are called by the Agent at runtime via SKILL.md instructions.
The actual pipeline orchestration (Step 1 → Step 7) is driven by
the Agent, not by this module.
"""

from __future__ import annotations

import csv
import io
from pathlib import Path
from typing import Any

from models import (
    OpportunityAnswerList,
    OpportunityList,
)

# Default output base directory (relative to sandbox working directory).
# Agent MUST pass the correct round directory at runtime.
_DEFAULT_OUTPUT_DIR = '.'


def ensure_output_dirs(base_dir: str = _DEFAULT_OUTPUT_DIR) -> dict[str, Path]:
    """Create the output directory structure for the pipeline.

    Creates:
        - ``<base_dir>/data/``
        - ``<base_dir>/reports/``
        - ``<base_dir>/charts/``

    Args:
        base_dir: Root output directory. Agent should pass the current round path.

    Returns:
        Dict mapping directory names to their Path objects.
    """
    base = Path(base_dir)
    dirs = {
        'data': base / 'data',
        'reports': base / 'reports',
        'charts': base / 'charts',
    }
    for name, path in dirs.items():
        path.mkdir(parents=True, exist_ok=True)
    return dirs


def save_opportunities(
    opportunities: OpportunityList,
    base_dir: str = _DEFAULT_OUTPUT_DIR,
) -> Path:
    """Serialize OpportunityList to JSON and save to reports directory."""
    output_path = Path(base_dir) / 'reports' / 'opportunities.json'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(opportunities.to_json(), encoding='utf-8')
    return output_path


def load_opportunities(base_dir: str = _DEFAULT_OUTPUT_DIR) -> OpportunityList:
    """Load OpportunityList from the reports directory JSON file."""
    input_path = Path(base_dir) / 'reports' / 'opportunities.json'
    return OpportunityList.from_json(input_path.read_text(encoding='utf-8'))


def save_opportunity_answers(
    answers: OpportunityAnswerList,
    base_dir: str = _DEFAULT_OUTPUT_DIR,
) -> Path:
    """Serialize OpportunityAnswerList to JSON and save to reports directory."""
    output_path = Path(base_dir) / 'reports' / 'opportunity_answers.json'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(answers.to_json(), encoding='utf-8')
    return output_path


def save_report(
    report_content: str,
    base_dir: str = _DEFAULT_OUTPUT_DIR,
) -> Path:
    """Save the final report markdown to the reports directory.

    .. deprecated::
        Use the ``write_file`` tool directly to write ``final_report.md``.
        Kept for backward compatibility.
    """
    output_path = Path(base_dir) / 'reports' / 'final_report.md'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(report_content, encoding='utf-8')
    return output_path


def save_recommendations_csv(
    csv_content: str | list[dict[str, Any]],
    base_dir: str = _DEFAULT_OUTPUT_DIR,
) -> Path:
    """Save the recommended products CSV to the reports directory.

    Accepts either a pre-formatted CSV string or a list of product dicts.
    """
    if isinstance(csv_content, list):
        csv_content = generate_recommendations_csv(csv_content)
    output_path = Path(base_dir) / 'reports' / 'blue_ocean_products.csv'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(csv_content, encoding='utf-8-sig')
    return output_path


def save_alibaba_supply_csv(
    csv_content: str | list[dict[str, Any]],
    base_dir: str = _DEFAULT_OUTPUT_DIR,
) -> Path:
    """Save the Alibaba supply search CSV to the reports directory.

    Accepts either a pre-formatted CSV string or a list of supplier dicts.
    """
    if isinstance(csv_content, list):
        csv_content = generate_alibaba_supply_csv(csv_content)
    output_path = Path(base_dir) / 'reports' / 'alibaba_supply.csv'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(csv_content, encoding='utf-8-sig')
    return output_path


# ---------------------------------------------------------------------------
# CSV generation
# ---------------------------------------------------------------------------

_RECOMMENDATIONS_CSV_COLUMNS: list[str] = [
    'product_name', 'platform', 'price', 'monthly_sales',
    'blue_ocean_score', 'demand_score', 'competition_score', 'growth_score',
    'opportunity_segment', 'differentiation_angle',
    'prodUrl', 'imageUrl', 'reference_id',
]


def _normalize_product_row(raw: dict[str, Any]) -> dict[str, Any]:
    """Normalize varying column names into canonical keys."""

    def _clean(val: Any) -> str:
        s = str(val).strip() if val is not None else ''
        return '' if s.lower() in ('nan', 'none', '') else s

    row: dict[str, Any] = {}
    row['product_name'] = (
        raw.get('product_name') or raw.get('title') or raw.get('Title')
        or raw.get('Product Title') or raw.get('name') or ''
    )
    row['platform'] = _clean(raw.get('platform') or raw.get('Platform') or raw.get('source'))
    row['price'] = _clean(raw.get('price') or raw.get('Price'))
    row['monthly_sales'] = _clean(
        raw.get('monthly_sales') or raw.get('sales_cnt_30d')
        or raw.get('Monthly Sales') or ''
    )
    row['blue_ocean_score'] = _clean(raw.get('blue_ocean_score'))
    row['demand_score'] = _clean(raw.get('demand_score'))
    row['competition_score'] = _clean(raw.get('competition_score'))
    row['growth_score'] = _clean(raw.get('growth_score'))
    row['opportunity_segment'] = _clean(raw.get('opportunity_segment'))
    row['differentiation_angle'] = _clean(raw.get('differentiation_angle'))
    row['prodUrl'] = (
        raw.get('prodUrl') or raw.get('Product Url')
        or raw.get('Product URL') or raw.get('product_url') or ''
    )
    row['imageUrl'] = (
        raw.get('imageUrl') or raw.get('Image Url')
        or raw.get('Image URL') or raw.get('image_url') or ''
    )
    row['reference_id'] = (
        raw.get('reference_id') or raw.get('Reference id')
        or raw.get('Reference ID') or ''
    )
    return row


def generate_recommendations_csv(
    product_results: list[dict[str, Any]] | None,
) -> str:
    """Generate a CSV string of blue ocean product recommendations."""
    if not product_results:
        return ''

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=_RECOMMENDATIONS_CSV_COLUMNS, extrasaction='ignore')
    writer.writeheader()

    for product in product_results:
        row = _normalize_product_row(product)
        writer.writerow(row)

    csv_content = output.getvalue()
    output.close()
    return csv_content


_ALIBABA_CSV_COLUMNS: list[str] = [
    'title', 'supplier_name', 'price_min', 'price_max',
    'moq', 'supplier_rating', 'url', 'reference_id',
]


def _split_alibaba_price(price_str: str) -> tuple[str, str]:
    """Split Alibaba price string like '$6.20-7.80' into (min, max)."""
    import re as _re

    if not price_str:
        return ('', '')
    nums = _re.findall(r'[\d.]+', str(price_str))
    if len(nums) >= 2:
        return (nums[0], nums[1])
    if len(nums) == 1:
        return (nums[0], nums[0])
    return ('', '')


def generate_alibaba_supply_csv(
    alibaba_supply_results: list[dict[str, Any]] | None,
) -> str:
    """Generate a CSV string of Alibaba supply search results."""
    if not alibaba_supply_results:
        return ''

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=_ALIBABA_CSV_COLUMNS, extrasaction='ignore')
    writer.writeheader()

    for item in alibaba_supply_results:
        row = dict(item)
        if 'title' not in row:
            row['title'] = (
                row.get('name') or row.get('Product title')
                or row.get('product_title') or ''
            )
        if 'supplier_name' not in row:
            row['supplier_name'] = (
                row.get('supplier') or row.get('Supplier name')
                or row.get('comp_name') or ''
            )
        if 'price_min' not in row and 'price_max' not in row:
            combined_price = row.get('price') or row.get('Price') or ''
            if combined_price:
                row['price_min'], row['price_max'] = _split_alibaba_price(combined_price)
            else:
                row['price_min'] = row.get('min_price') or ''
                row['price_max'] = row.get('max_price') or ''
        elif 'price_min' not in row:
            row['price_min'] = row.get('min_price') or ''
        elif 'price_max' not in row:
            row['price_max'] = row.get('max_price') or ''
        if 'moq' not in row:
            row['moq'] = row.get('min_order') or row.get('MOQ') or ''
        if 'supplier_rating' not in row:
            row['supplier_rating'] = row.get('rating') or ''
        if 'url' not in row:
            row['url'] = (
                row.get('productUrl') or row.get('prodUrl')
                or row.get('Product URL') or row.get('Product url') or ''
            )
        if 'reference_id' not in row:
            row['reference_id'] = (
                row.get('Reference id') or row.get('Reference ID')
                or row.get('ref_id') or ''
            )
        writer.writerow(row)

    csv_content = output.getvalue()
    output.close()
    return csv_content
