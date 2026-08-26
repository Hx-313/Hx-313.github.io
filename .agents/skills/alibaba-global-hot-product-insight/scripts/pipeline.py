"""
Pipeline file I/O wiring for the hot-product-insight skill.

Provides helper functions for:
- Creating the output directory structure (data/, reports/, charts/)
- Saving Step 3 output (hot_products.json)
- Saving Step 4 output (product_insights.json)
- Saving final report (final_report.md)
- Generating CSV content (optional, for future use)

These functions are called by the Agent at runtime via SKILL.md instructions.
The actual pipeline orchestration (Step 1 → Step 7) is driven by the Agent.
"""

from __future__ import annotations

import csv
import io
from pathlib import Path
from typing import Any

from models import (
    HotProductList,
    ProductInsightList,
)

_DEFAULT_OUTPUT_DIR = '.'


def ensure_output_dirs(base_dir: str = _DEFAULT_OUTPUT_DIR) -> dict[str, Path]:
    """Create the output directory structure: data/, reports/, charts/."""
    base = Path(base_dir)
    dirs = {
        'data': base / 'data',
        'reports': base / 'reports',
        'charts': base / 'charts',
    }
    for path in dirs.values():
        path.mkdir(parents=True, exist_ok=True)
    return dirs


def save_hot_products(
    products: HotProductList,
    base_dir: str = _DEFAULT_OUTPUT_DIR,
) -> Path:
    """Serialize HotProductList to JSON and save to reports directory."""
    output_path = Path(base_dir) / 'reports' / 'hot_products.json'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(products.to_json(), encoding='utf-8')
    return output_path


def load_hot_products(base_dir: str = _DEFAULT_OUTPUT_DIR) -> HotProductList:
    """Load HotProductList from the reports directory JSON file."""
    input_path = Path(base_dir) / 'reports' / 'hot_products.json'
    return HotProductList.from_json(input_path.read_text(encoding='utf-8'))


def save_product_insights(
    insights: ProductInsightList,
    base_dir: str = _DEFAULT_OUTPUT_DIR,
) -> Path:
    """Serialize ProductInsightList to JSON and save to reports directory."""
    output_path = Path(base_dir) / 'reports' / 'product_insights.json'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(insights.to_json(), encoding='utf-8')
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


# ---------------------------------------------------------------------------
# Optional CSV generation (for future use)
# ---------------------------------------------------------------------------

_HOT_PRODUCTS_CSV_COLUMNS: list[str] = [
    'product_name', 'platform', 'core_selling_point', 'pain_points',
    'competition_level', 'fob_price', 'retail_price', 'estimated_margin',
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
    row['core_selling_point'] = _clean(raw.get('core_selling_point'))
    row['pain_points'] = _clean(raw.get('pain_points'))
    row['competition_level'] = _clean(raw.get('competition_level'))
    row['fob_price'] = _clean(raw.get('fob_price') or raw.get('fob_price_range'))
    row['retail_price'] = _clean(raw.get('retail_price') or raw.get('retail_price_range'))
    row['estimated_margin'] = _clean(raw.get('estimated_margin'))
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


def save_hot_products_csv(
    csv_content: str | list[dict[str, Any]],
    base_dir: str = _DEFAULT_OUTPUT_DIR,
) -> Path:
    """Save the hot products CSV to the reports directory (optional)."""
    if isinstance(csv_content, list):
        csv_content = generate_hot_products_csv(csv_content)
    output_path = Path(base_dir) / 'reports' / 'hot_products.csv'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(csv_content, encoding='utf-8-sig')
    return output_path


def generate_hot_products_csv(
    product_results: list[dict[str, Any]] | None,
) -> str:
    """Generate a CSV string of hot product recommendations."""
    if not product_results:
        return ''

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=_HOT_PRODUCTS_CSV_COLUMNS, extrasaction='ignore')
    writer.writeheader()

    for product in product_results:
        row = _normalize_product_row(product)
        writer.writerow(row)

    csv_content = output.getvalue()
    output.close()
    return csv_content
