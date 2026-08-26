"""Judge.me reviews fetcher.

Reads review summary data straight from the **Shopify shop metafields** that the
Judge.me app writes when it is installed (namespace ``judgeme``, owner ``Shop``).
No separate Judge.me API token is required — if the merchant has installed the
Judge.me Shopify app, the data is already synced into Shopify and reachable via
the same Connector / Admin GraphQL path used by the other Shopify fetchers.

Metafields used (all on the Shop owner, namespace ``judgeme``):
    all_reviews_count    — store-wide published review count
    all_reviews_rating   — store-wide average rating
    shop_reviews_count   — shop-review count (store/seller reviews)
    shop_reviews_rating  — shop-review average rating

Returns a status-tagged dict; the orchestrator handles the various states.
"""

from __future__ import annotations

from typing import Any

from shopify_cli import execute, ShopifyCLIError


# All four summary metafields live on the Shop owner under the `judgeme` namespace.
_QUERY_JUDGEME_METAFIELDS = """
query judgemeShopMetafields {
  shop {
    all_reviews_count: metafield(namespace: "judgeme", key: "all_reviews_count") { value }
    all_reviews_rating: metafield(namespace: "judgeme", key: "all_reviews_rating") { value }
    shop_reviews_count: metafield(namespace: "judgeme", key: "shop_reviews_count") { value }
    shop_reviews_rating: metafield(namespace: "judgeme", key: "shop_reviews_rating") { value }
  }
}
"""


def _to_int(raw: Any) -> int:
    try:
        return int(float(raw))
    except (TypeError, ValueError):
        return 0


def _to_float(raw: Any) -> float:
    try:
        return round(float(raw), 2)
    except (TypeError, ValueError):
        return 0.0


def _mf_value(shop: dict[str, Any], key: str) -> Any:
    node = shop.get(key)
    if not isinstance(node, dict):
        return None
    return node.get("value")


def fetch_summary(store: str | None) -> dict[str, Any]:
    """Fetch review count and average rating from Shopify shop metafields.

    Parameters
    ----------
    store : str | None
        The myshopify.com domain. Required.

    Returns
    -------
    dict
        {"status": "skipped"} when the store is missing OR none of the Judge.me
            metafields exist (i.e. the app is not installed / has not synced yet).
        {"status": "ok", "data": {...}} on success. A freshly-launched store with
            zero reviews returns status "ok" with counts of 0 — that is normal,
            not an error.
        {"status": "error", "reason": "..."} on a Shopify API failure.
    """
    if not store:
        return {"status": "skipped", "reason": "no store domain configured", "data": None}

    try:
        resp = execute(
            store=store,
            query=_QUERY_JUDGEME_METAFIELDS,
            scopes=["read_products"],  # documentary only; shop metafields need no extra scope
        )
    except ShopifyCLIError as e:
        return {"status": "error", "reason": str(e), "data": None}

    shop = (resp.get("data") or {}).get("shop") or {}

    raw_all_count = _mf_value(shop, "all_reviews_count")
    raw_all_rating = _mf_value(shop, "all_reviews_rating")
    raw_shop_count = _mf_value(shop, "shop_reviews_count")
    raw_shop_rating = _mf_value(shop, "shop_reviews_rating")

    # If NONE of the metafields exist, Judge.me is not installed (or not synced).
    if all(v is None for v in (raw_all_count, raw_all_rating, raw_shop_count, raw_shop_rating)):
        return {
            "status": "skipped",
            "reason": "Judge.me metafields not found on shop (app not installed or not synced yet)",
            "data": None,
        }

    out: dict[str, Any] = {
        "total_count": _to_int(raw_all_count),
        "average_rating": _to_float(raw_all_rating),
        "shop_reviews_count": _to_int(raw_shop_count),
        "shop_reviews_rating": _to_float(raw_shop_rating),
        # Distribution is not exposed via metafields; downstream renders gracefully without it.
        "rating_distribution": {},
    }
    return {"status": "ok", "data": out}
