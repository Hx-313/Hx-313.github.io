"""Pinned Shopify Admin API version for the monitoring stack.

How to refresh:
1. Use the `shopify-admin` skill: run `scripts/search_docs.mjs "api versions"` to find the
   latest stable date-tag (Shopify ships a new version every quarter).
2. Update the constant below.
3. Re-run `templates/scripts/render_report.py --check` (a smoke run) to verify nothing broke.

DO NOT hardcode this string anywhere else in the stack. Import it from here.
"""

SHOPIFY_API_VERSION = "2026-01"
