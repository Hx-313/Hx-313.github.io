"""Shopify data fetchers for the daily report.

Every function returns a status-tagged dict:
    {"status": "ok"|"skipped"|"error", "data": ..., "reason": "..."}

The orchestrator (`daily_report.py`) wraps these in try/except so that a single
data source failing degrades the report section, not the entire run.

All GraphQL queries below have been validated via the `shopify-admin` skill.
If a query stops working after a Shopify API version bump, RE-VALIDATE first
(do not patch blindly).
"""

from __future__ import annotations

from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo
from typing import Any

from shopify_cli import execute, ShopifyCLIError


# ---------------------------------------------------------------------------
# Validated GraphQL operations
# ---------------------------------------------------------------------------

_QUERY_SHOP = """
query getShop {
  shop {
    name
    myshopifyDomain
    primaryDomain { url host }
    ianaTimezone
    currencyCode
    plan { displayName }
  }
}
"""

_QUERY_PRODUCTS_COUNT = """
query activeProductCount {
  productsCount(query: "status:active") { count }
}
"""

# Orders within a created_at window — uses the search-query DSL.
# Includes lineItems so downstream can compute Top N products by quantity.
# Schema may shift; re-validate via `shopify-admin` if this returns errors.
_QUERY_ORDERS_BY_DATE = """
query ordersInRange($cursor: String, $searchQuery: String!) {
  orders(first: 250, after: $cursor, query: $searchQuery) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id
      name
      createdAt
      displayFinancialStatus
      currentTotalPriceSet { shopMoney { amount currencyCode } }
      currentSubtotalPriceSet { shopMoney { amount currencyCode } }
      customer { id }
      lineItems(first: 50) {
        nodes {
          quantity
          name
          product { id title }
        }
      }
    }
  }
}
"""

_QUERY_ORDERS_TOTAL_COUNT = """
query allOrdersCount { ordersCount { count } }
"""


# ---------------------------------------------------------------------------
# Public fetchers — identity / counts
# ---------------------------------------------------------------------------

def fetch_shop_info(store: str) -> dict[str, Any]:
    """Identity probe — also persisted to store-config.json for timezone/currency."""
    try:
        resp = execute(store=store, query=_QUERY_SHOP, scopes=["read_products"])
        shop = (resp.get("data") or {}).get("shop") or {}
        if not shop:
            return {"status": "error", "reason": "empty shop response", "data": None}
        return {"status": "ok", "data": shop}
    except ShopifyCLIError as e:
        return {"status": "error", "reason": str(e), "data": None}


def fetch_active_products_count(store: str) -> dict[str, Any]:
    try:
        resp = execute(store=store, query=_QUERY_PRODUCTS_COUNT, scopes=["read_products"])
        count = ((resp.get("data") or {}).get("productsCount") or {}).get("count")
        return {"status": "ok", "data": int(count or 0)}
    except ShopifyCLIError as e:
        return {"status": "error", "reason": str(e), "data": 0}


def fetch_total_orders(store: str) -> dict[str, Any]:
    """Cheap probe — total orders ever in the store. Use BEFORE pulling order detail
    to short-circuit empty stores (week 1-4 of new stores typically returns 0)."""
    try:
        resp = execute(store=store, query=_QUERY_ORDERS_TOTAL_COUNT, scopes=["read_orders"])
        count = ((resp.get("data") or {}).get("ordersCount") or {}).get("count")
        return {"status": "ok", "data": int(count or 0)}
    except ShopifyCLIError as e:
        return {"status": "error", "reason": str(e), "data": 0}


# ---------------------------------------------------------------------------
# Public fetchers — orders by date window
# ---------------------------------------------------------------------------

def fetch_orders_in_range(
    store: str,
    shop_timezone: str,
    start: date,
    end: date,
    *,
    max_pages: int = 25,
) -> dict[str, Any]:
    """Return all orders created between `start` and `end` (inclusive),
    interpreted in the shop's local timezone.

    Parameters
    ----------
    store : str
        myshopify.com domain
    shop_timezone : str
        IANA timezone string from shop.ianaTimezone (e.g. "America/Los_Angeles")
    start, end : date
        Date window (inclusive) interpreted as full local-day boundaries.
    max_pages : int
        Pagination cap. Each page is 250 orders. Default 25 = 6,250 orders max.

    Returns status-tagged dict with `data` = list of order nodes (each includes
    lineItems for downstream Top-N aggregation).
    """
    try:
        tz = ZoneInfo(shop_timezone)
    except Exception as e:
        return {"status": "error", "reason": f"invalid timezone {shop_timezone!r}: {e}", "data": []}

    if start > end:
        return {"status": "error", "reason": f"start {start} after end {end}", "data": []}

    start_dt = datetime.combine(start, datetime.min.time(), tzinfo=tz)
    end_dt = datetime.combine(end, datetime.max.time(), tzinfo=tz)
    search_query = f"created_at:>={start_dt.isoformat()} created_at:<={end_dt.isoformat()}"

    all_orders: list[dict[str, Any]] = []
    cursor: str | None = None
    pages = 0
    try:
        while True:
            resp = execute(
                store=store,
                query=_QUERY_ORDERS_BY_DATE,
                variables={"cursor": cursor, "searchQuery": search_query},
                scopes=["read_orders", "read_products"],
            )
            orders_block = (resp.get("data") or {}).get("orders") or {}
            nodes = orders_block.get("nodes") or []
            all_orders.extend(nodes)

            page_info = orders_block.get("pageInfo") or {}
            if not page_info.get("hasNextPage"):
                break
            cursor = page_info.get("endCursor")
            pages += 1
            if pages >= max_pages:
                return {
                    "status": "ok",
                    "data": all_orders,
                    "reason": f"truncated at {max_pages} pages — store has very high order volume",
                }
        return {"status": "ok", "data": all_orders}
    except ShopifyCLIError as e:
        return {"status": "error", "reason": str(e), "data": []}


def fetch_orders_yesterday(store: str, shop_timezone: str) -> dict[str, Any]:
    """Convenience wrapper around fetch_orders_in_range for the standard
    daily-report case (yesterday in shop's local timezone)."""
    try:
        tz = ZoneInfo(shop_timezone)
    except Exception as e:
        return {"status": "error", "reason": f"invalid timezone {shop_timezone!r}: {e}", "data": []}
    yesterday = (datetime.now(tz) - timedelta(days=1)).date()
    return fetch_orders_in_range(store, shop_timezone, yesterday, yesterday)


# ---------------------------------------------------------------------------
# Pure aggregation helpers — no I/O
# ---------------------------------------------------------------------------

def normalize_orders(orders: list[dict[str, Any]]) -> dict[str, Any]:
    """Aggregate raw GraphQL nodes into the shape render_report.py expects."""
    revenue = 0.0
    paid = 0
    for o in orders:
        money = (o.get("currentTotalPriceSet") or {}).get("shopMoney") or {}
        try:
            revenue += float(money.get("amount") or 0)
        except (TypeError, ValueError):
            pass
        if (o.get("displayFinancialStatus") or "").upper() == "PAID":
            paid += 1
    return {
        "count": len(orders),
        "paid_count": paid,
        "revenue": round(revenue, 2),
        "aov": round(revenue / len(orders), 2) if orders else 0.0,
    }


def aggregate_top_products(
    orders: list[dict[str, Any]],
    n: int = 5,
) -> list[dict[str, Any]]:
    """Aggregate line items across orders into Top-N products by total quantity sold.

    Handles deleted products (lineItem.product == None) by falling back to the
    line-item name. Two line items are considered the same product if they share
    a non-null product.id; otherwise the line-item name is the bucket key.

    Returns a list of dicts (length ≤ n), highest quantity first:
        [{"product_id": "gid://...", "title": "...", "quantity": 42, "order_count": 7}, ...]
    """
    if n <= 0 or not orders:
        return []

    # bucket_key -> {"product_id", "title", "quantity", "order_count", "_orders_seen"}
    buckets: dict[str, dict[str, Any]] = {}
    for order in orders:
        order_id = order.get("id")
        for li in (order.get("lineItems") or {}).get("nodes") or []:
            qty = int(li.get("quantity") or 0)
            if qty <= 0:
                continue
            product = li.get("product") or {}
            product_id = product.get("id")
            title = product.get("title") or li.get("name") or "(unknown product)"
            key = product_id or f"_lineitem:{title}"

            bucket = buckets.get(key)
            if bucket is None:
                buckets[key] = {
                    "product_id": product_id,
                    "title": title,
                    "quantity": qty,
                    "order_count": 0,
                    "_orders_seen": set(),
                }
                bucket = buckets[key]
            else:
                bucket["quantity"] += qty

            if order_id and order_id not in bucket["_orders_seen"]:
                bucket["_orders_seen"].add(order_id)
                bucket["order_count"] += 1

    # Strip internal helper field, sort, slice
    ranked = sorted(buckets.values(), key=lambda b: b["quantity"], reverse=True)
    for b in ranked:
        b.pop("_orders_seen", None)
    return ranked[:n]
