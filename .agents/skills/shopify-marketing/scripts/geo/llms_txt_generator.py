#!/usr/bin/env python3
"""Generate /llms.txt content from a Shopify catalog snapshot.

This script does NOT call Shopify. The agent (or the operator) is expected
to fetch the catalog via shopify-admin-execution and pipe the result in.

USAGE
  python3 llms_txt_generator.py --input catalog.json --out llms.txt
  cat catalog.json | python3 llms_txt_generator.py --stdin

INPUT (catalog.json)
  {
    "shop": {
      "name": "<Your Store Name>",
      "description": "<One-sentence store description.>",
      "primary_domain": "yourstore.example",
      "contact_email": "hello@yourstore.example"
    },
    "collections": [
      {"title": "<Collection Title>", "handle": "<collection-handle>",
       "products_count": 4, "description_short": "<Short description.>"},
      ...
    ],
    "products": [
      {"title": "<Product Title>", "handle": "<product-handle>",
       "value_prop": "<One-sentence unique value proposition.>"},
      ...
    ],
    "reference_pages": [
      {"title": "<Page Title>", "handle": "<page-handle>"},
      {"title": "FAQ", "handle": "faq"},
      ...
    ]
  }

OUTPUT
  Markdown text suitable for `templates/llms.txt.liquid` deployment.

Hard caps:
  - max 8 collections (highest products_count first)
  - max 15 products (operator-curated; we trust input order)
  - max 6 reference pages
  Total file ≤ 200 lines (enforced; over-cap content is dropped with a notice).

See references/geo/01-llms-txt-spec.md for format & ranking-signal disclaimer.
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any


MAX_COLLECTIONS = 8
MAX_PRODUCTS = 15
MAX_REFERENCE_PAGES = 6
MAX_LINES = 200


def render(catalog: dict[str, Any]) -> str:
    shop = catalog.get("shop", {})
    name = shop.get("name", "Store")
    desc = (shop.get("description") or "").strip()
    domain = shop.get("primary_domain") or "example.com"
    contact = shop.get("contact_email") or ""

    lines: list[str] = []
    add = lines.append

    add(f"# {name}")
    add("")
    if desc:
        add(f"> {desc}")
        add("")

    # ---- Brand & contact ---------------------------------------------------
    add("## Brand & contact")
    add("")
    add(f"- Site: https://{domain}")
    if contact:
        add(f"- Contact: {contact}")
    add(f"- About: https://{domain}/pages/about")
    add("")

    # ---- Catalog index -----------------------------------------------------
    add("## Catalog")
    add("")
    add(f"- All products (sitemap): https://{domain}/sitemap_products_1.xml")
    add(f"- All collections (sitemap): https://{domain}/sitemap_collections_1.xml")
    add("")

    # ---- Top collections ---------------------------------------------------
    collections = catalog.get("collections") or []
    collections_sorted = sorted(
        collections, key=lambda c: c.get("products_count", 0), reverse=True
    )[:MAX_COLLECTIONS]
    if collections_sorted:
        add("## Top collections")
        add("")
        for c in collections_sorted:
            handle = c.get("handle", "")
            title = c.get("title", "Untitled")
            short = (c.get("description_short") or "").strip()
            url = f"https://{domain}/collections/{handle}"
            line = f"- [{title}]({url})"
            if short:
                line += f" — {short}"
            add(line)
        add("")

    # ---- Key product pages -------------------------------------------------
    products = (catalog.get("products") or [])[:MAX_PRODUCTS]
    if products:
        add("## Key product pages")
        add("")
        for p in products:
            handle = p.get("handle", "")
            title = p.get("title", "Untitled")
            value = (p.get("value_prop") or "").strip()
            url = f"https://{domain}/products/{handle}"
            line = f"- [{title}]({url})"
            if value:
                line += f" — {value}"
            add(line)
        add("")

    # ---- Reference content -------------------------------------------------
    refs = (catalog.get("reference_pages") or [])[:MAX_REFERENCE_PAGES]
    if refs:
        add("## Reference content")
        add("")
        for r in refs:
            handle = r.get("handle", "")
            title = r.get("title", "Untitled")
            url = f"https://{domain}/pages/{handle}"
            add(f"- [{title}]({url})")
        add("")

    # ---- License -----------------------------------------------------------
    add("## License")
    add("")
    add(f"Content © {name}. Commercial reuse requires permission. "
        f"Brief quotation with attribution is welcome.")
    add("")

    # ---- Cap enforcement ---------------------------------------------------
    if len(lines) > MAX_LINES:
        lines = lines[:MAX_LINES - 2]
        lines.append("")
        lines.append(
            f"<!-- Truncated to {MAX_LINES} lines; see sitemap for the full catalog. -->"
        )

    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--input", help="Path to catalog JSON")
    src.add_argument("--stdin", action="store_true")
    ap.add_argument("--out", help="Write rendered markdown here (default: stdout)")
    args = ap.parse_args()

    raw = sys.stdin.read() if args.stdin else open(args.input, encoding="utf-8").read()
    catalog = json.loads(raw)
    output = render(catalog)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(output)
    else:
        sys.stdout.write(output)
    return 0


if __name__ == "__main__":
    sys.exit(main())
