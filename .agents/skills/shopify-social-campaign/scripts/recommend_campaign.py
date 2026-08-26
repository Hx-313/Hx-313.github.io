#!/usr/bin/env python3
"""Create a deterministic, optional seven-day Shopify campaign recommendation."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any


SHOP_RE = re.compile(r"^[a-z0-9][a-z0-9-]*\.myshopify\.com$")
PRODUCT_RE = re.compile(r"^gid://shopify/Product/[A-Za-z0-9_-]+$")
INSTAGRAM_STATUSES = {
    "available",
    "read_only",
    "missing_scope",
    "not_connected",
    "not_implemented",
    "error",
}


class RecommendationError(RuntimeError):
    pass


def _parse_datetime(value: Any, field: str) -> datetime:
    if not isinstance(value, str):
        raise RecommendationError(f"{field} must be an ISO-8601 string")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise RecommendationError(f"{field} is not valid ISO-8601") from exc
    if parsed.tzinfo is None:
        raise RecommendationError(f"{field} must include a timezone")
    return parsed


def _require_bool(value: Any, field: str) -> bool:
    if type(value) is not bool:
        raise RecommendationError(f"{field} must be a boolean")
    return value


def _require_int(value: Any, field: str, *, minimum: int = 0, maximum: int | None = None) -> int:
    if type(value) is not int or value < minimum or (maximum is not None and value > maximum):
        suffix = f" and at most {maximum}" if maximum is not None else ""
        raise RecommendationError(f"{field} must be an integer of at least {minimum}{suffix}")
    return value


def _validate_input(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise RecommendationError("input must be an object")
    required = {"shop_domain", "generated_at", "product", "instagram"}
    missing = sorted(required - value.keys())
    if missing:
        raise RecommendationError(f"input missing fields: {missing}")

    shop_domain = value["shop_domain"]
    if not isinstance(shop_domain, str) or not SHOP_RE.fullmatch(shop_domain):
        raise RecommendationError("shop_domain must be a lowercase *.myshopify.com domain")
    _parse_datetime(value["generated_at"], "generated_at")

    product = value["product"]
    if not isinstance(product, dict):
        raise RecommendationError("product must be an object")
    product_required = {
        "id",
        "title",
        "status",
        "online_store_url",
        "publicly_accessible",
        "media_count",
        "inventory_status",
        "policy_risk",
        "unresolved_claim_count",
    }
    product_missing = sorted(product_required - product.keys())
    if product_missing:
        raise RecommendationError(f"product missing fields: {product_missing}")
    if not isinstance(product["id"], str) or not PRODUCT_RE.fullmatch(product["id"]):
        raise RecommendationError("product.id must be a Shopify Product GID")
    if not isinstance(product["title"], str) or not product["title"].strip():
        raise RecommendationError("product.title must be non-empty")
    if product["status"] not in {"ACTIVE", "DRAFT", "ARCHIVED", "UNLISTED"}:
        raise RecommendationError("product.status has an unknown value")
    public_url = product["online_store_url"]
    if public_url is not None and (not isinstance(public_url, str) or not public_url.startswith("https://")):
        raise RecommendationError("product.online_store_url must be null or public HTTPS")
    _require_bool(product["publicly_accessible"], "product.publicly_accessible")
    _require_int(product["media_count"], "product.media_count")
    if product["inventory_status"] not in {"in_stock", "out_of_stock", "unknown"}:
        raise RecommendationError("product.inventory_status has an unknown value")
    if product["policy_risk"] not in {"low", "medium", "high", "unknown"}:
        raise RecommendationError("product.policy_risk has an unknown value")
    _require_int(product["unresolved_claim_count"], "product.unresolved_claim_count")

    instagram = value["instagram"]
    if not isinstance(instagram, dict) or instagram.get("status") not in INSTAGRAM_STATUSES:
        raise RecommendationError("instagram.status has an unknown value")

    preferences = value.get("preferences") or {}
    if not isinstance(preferences, dict):
        raise RecommendationError("preferences must be an object")
    muted = preferences.get("mute_seven_day_campaigns", False)
    _require_bool(muted, "preferences.mute_seven_day_campaigns")
    max_posts = preferences.get("max_posts_per_seven_days", 3)
    _require_int(max_posts, "preferences.max_posts_per_seven_days", minimum=1, maximum=4)
    return value


def _recommendation_id(shop_domain: str, product_id: str) -> str:
    identity = f"seven_day_product_campaign:{shop_domain}:{product_id}"
    return "camprec_" + hashlib.sha256(identity.encode("utf-8")).hexdigest()[:16]


def _authorization_boundary() -> dict[str, bool]:
    return {
        "selection_creates_draft_only": True,
        "publishing_requires_exact_content_approval": True,
        "edits_invalidate_item_approval": True,
        "automatic_publish_allowed": False,
    }


def _base(value: dict[str, Any]) -> dict[str, Any]:
    created = _parse_datetime(value["generated_at"], "generated_at")
    product = value["product"]
    expires = created + timedelta(days=7)
    return {
        "schema_version": 1,
        "recommendation_id": _recommendation_id(value["shop_domain"], product["id"]),
        "shop_domain": value["shop_domain"],
        "product": {
            "product_id": product["id"],
            "title": product["title"].strip(),
            "public_url": product["online_store_url"],
        },
        "authorization_boundary": _authorization_boundary(),
        "created_at": value["generated_at"],
        "expires_at": expires.isoformat().replace("+00:00", "Z"),
    }


def _negative(value: dict[str, Any], decision: str, reason: str, options: list[str]) -> dict[str, Any]:
    result = _base(value)
    result.update(
        {
            "decision": decision,
            "publish_readiness": "not_applicable",
            "reason_codes": [reason],
            "blockers": [],
            "warnings": [],
            "recommended_plan": None,
            "user_options": options,
        }
    )
    return result


def recommend(value: Any) -> dict[str, Any]:
    value = _validate_input(value)
    product = value["product"]
    preferences = value.get("preferences") or {}

    if preferences.get("mute_seven_day_campaigns", False):
        return _negative(value, "not_recommended", "CAMPAIGN_RECOMMENDATIONS_MUTED", ["skip"])
    if product["status"] != "ACTIVE":
        return _negative(value, "not_recommended", "PRODUCT_NOT_ACTIVE", ["skip"])
    if product["online_store_url"] is None or product["publicly_accessible"] is not True:
        return _negative(value, "not_recommended", "PRODUCT_NOT_PUBLIC", ["retry", "skip"])
    if product["media_count"] < 1:
        return _negative(value, "not_recommended", "PRODUCT_MEDIA_MISSING", ["customize", "skip"])
    if product["inventory_status"] == "out_of_stock":
        return _negative(value, "not_recommended", "PRODUCT_OUT_OF_STOCK", ["retry", "skip"])
    if product["inventory_status"] == "unknown":
        return _negative(value, "unknown", "PRODUCT_INVENTORY_UNKNOWN", ["retry", "skip"])
    if product["policy_risk"] == "high":
        return _negative(value, "not_recommended", "HIGH_RISK_PRODUCT_REQUIRES_MANUAL_PLAN", ["skip"])
    if product["policy_risk"] == "unknown":
        return _negative(value, "unknown", "PRODUCT_POLICY_RISK_UNKNOWN", ["retry", "skip"])

    max_posts = (value.get("preferences") or {}).get("max_posts_per_seven_days", 3)
    slots = [
        {"day": 1, "content_pillar": "use_case", "hypothesis": "USE_CASE_RESONATES"},
        {"day": 3, "content_pillar": "product_detail", "hypothesis": "PRODUCT_DETAIL_BUILDS_INTEREST"},
        {"day": 6, "content_pillar": "faq", "hypothesis": "FAQ_REDUCES_OBJECTION"},
        {"day": 7, "content_pillar": "brand_trust", "hypothesis": "BRAND_TRUST_SUPPORTS_CLICK"},
    ][:max_posts]

    blockers: list[dict[str, str]] = []
    warnings: list[str] = []
    instagram_status = value["instagram"]["status"]
    if instagram_status != "available":
        blockers.append(
            {
                "code": f"INSTAGRAM_{instagram_status.upper()}",
                "resolution": "Connect an eligible Instagram account and verify publish capability before scheduling.",
            }
        )
    if product["unresolved_claim_count"] > 0:
        blockers.append(
            {
                "code": "CLAIMS_REQUIRE_REVIEW",
                "resolution": "Resolve or remove unsupported claims before approving shopper-visible content.",
            }
        )
        warnings.append("DRAFT_MUST_USE_ACCEPTED_CLAIMS_ONLY")
    if product["policy_risk"] == "medium":
        warnings.append("MEDIUM_POLICY_RISK_REQUIRES_PREFLIGHT")

    result = _base(value)
    result.update(
        {
            "decision": "recommended",
            "publish_readiness": "blocked" if blockers else "ready",
            "reason_codes": ["NEW_PRODUCT_SEVEN_DAY_CAMPAIGN_FIT"],
            "blockers": blockers,
            "warnings": warnings,
            "recommended_plan": {
                "name": "seven_day_product_campaign",
                "objective": "new_product_cold_start",
                "horizon_days": 7,
                "recommended_channel": "instagram",
                "recommended_post_count": len(slots),
                "estimated_review_minutes": 10,
                "content_slots": slots,
            },
            "user_options": ["start_draft", "customize", "skip", "mute_similar"],
        }
    )
    return result


def _load_input(path: str) -> Any:
    try:
        if path == "-":
            return json.load(sys.stdin)
        source = Path(path)
        if source.is_symlink() or not source.is_file():
            raise RecommendationError("input must be a regular JSON file")
        return json.loads(source.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise RecommendationError("input is not valid JSON") from exc


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default="-", help="Normalized input JSON path or - for stdin")
    args = parser.parse_args(argv)
    try:
        result = recommend(_load_input(args.input))
    except RecommendationError as exc:
        print(
            json.dumps(
                {"status": "error", "error_code": "invalid_campaign_recommendation_input", "message": str(exc)},
                ensure_ascii=False,
                sort_keys=True,
            ),
            file=sys.stderr,
        )
        return 2
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
