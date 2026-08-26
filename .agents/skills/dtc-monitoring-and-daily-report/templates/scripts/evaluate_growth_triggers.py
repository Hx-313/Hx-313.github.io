#!/usr/bin/env python3
"""Evaluate deterministic Shopify new-product and social Campaign triggers.

Input is normalized, read-only Shopify/Connector data. The evaluator never
generates copy, calls an external service, or mutates patrol state. It returns
fixed reason codes and proposed cursor changes for the caller to commit only
after derived recommendations are durable.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import patrol_store  # noqa: E402


class EvaluationError(RuntimeError):
    pass


class PublicCheckIncomplete(EvaluationError):
    pass


def _parse_time(value: Any, field: str) -> datetime:
    if not isinstance(value, str):
        raise EvaluationError(f"{field} must be an ISO-8601 string")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise EvaluationError(f"{field} is not valid ISO-8601") from exc
    if parsed.tzinfo is None:
        raise EvaluationError(f"{field} must include a timezone")
    return parsed


def _ok(matched: bool, reason_code: str, **extra: Any) -> dict[str, Any]:
    return {"evaluation_status": "ok", "matched": matched, "reason_code": reason_code, **extra}


def _error(reason_code: str, **extra: Any) -> dict[str, Any]:
    return {"evaluation_status": "error", "matched": None, "reason_code": reason_code, **extra}


def _source(source: Any, name: str) -> tuple[str, list[dict[str, Any]]]:
    if not isinstance(source, dict):
        raise EvaluationError(f"{name} source must be an object")
    status = source.get("evaluation_status")
    if status not in {"ok", "error", "not_connected"}:
        raise EvaluationError(f"{name}.evaluation_status has an unknown value")
    items = source.get("items") or []
    if not isinstance(items, list) or not all(isinstance(item, dict) for item in items):
        raise EvaluationError(f"{name} items must be an array of objects")
    return status, items


def _eligible_product(product: dict[str, Any], scan_started_at: datetime) -> bool:
    required = {"id", "status", "published_at", "online_store_url", "media_count", "publicly_accessible"}
    if not required.issubset(product):
        raise EvaluationError(f"product missing fields: {sorted(required - product.keys())}")
    if not isinstance(product["id"], str) or not product["id"]:
        raise EvaluationError("product.id must be a non-empty string")
    if product["status"] not in {"ACTIVE", "DRAFT", "ARCHIVED", "UNLISTED"}:
        raise EvaluationError("product.status has an unknown value")
    if product["online_store_url"] is not None and product["publicly_accessible"] is not True:
        raise PublicCheckIncomplete("anonymous public check is incomplete")
    if product["status"] != "ACTIVE":
        return False
    if product["published_at"] is None or product["online_store_url"] is None:
        return False
    if _parse_time(product["published_at"], "product.published_at") > scan_started_at:
        return False
    if type(product["media_count"]) is not int:
        raise EvaluationError("product.media_count must be an integer")
    return product["media_count"] >= 1 and product["publicly_accessible"] is True


def _new_products(
    payload: dict[str, Any], snapshot: dict[str, Any], scan_started_at: datetime
) -> tuple[dict[str, Any], list[str], dict[str, Any]]:
    try:
        status, products = _source(payload.get("products"), "products")
    except EvaluationError:
        return _error("PRODUCT_INPUT_INVALID"), [], {}
    if status == "error":
        return _error("PRODUCT_QUERY_FAILED"), [], {}
    if status == "not_connected":
        return _error("SHOPIFY_NOT_CONNECTED"), [], {}

    try:
        eligible_ids = sorted({product["id"] for product in products if _eligible_product(product, scan_started_at)})
    except PublicCheckIncomplete:
        return _error("PUBLIC_CHECK_INCOMPLETE"), [], {}
    except (EvaluationError, KeyError, TypeError):
        return _error("PRODUCT_INPUT_INVALID"), [], {}

    proposed = {
        "last_product_scan_at": payload["scan_started_at"],
        "add_known_product_ids": eligible_ids,
    }
    state = snapshot["state"]
    if state.get("last_product_scan_at") is None:
        return _ok(False, "PRODUCT_BASELINE_INITIALIZED", source_ids=[]), [], proposed

    known = set(state.get("known_eligible_product_ids") or [])
    new_ids = [product_id for product_id in eligible_ids if product_id not in known]
    if not new_ids:
        return _ok(False, "NO_NEW_ELIGIBLE_PRODUCTS", source_ids=[]), [], proposed
    return _ok(True, "NEW_ELIGIBLE_PRODUCTS", source_ids=new_ids), new_ids, proposed


def _campaign_recommendations(payload: dict[str, Any], new_ids: list[str]) -> dict[str, Any]:
    if not new_ids:
        return _ok(False, "NO_NEW_PRODUCTS", source_ids=[], candidates=[])
    accounts = payload.get("social_accounts")
    instagram = accounts.get("instagram") if isinstance(accounts, dict) else None
    if not isinstance(instagram, dict):
        return _error("SOCIAL_ACCOUNT_INPUT_INVALID", source_ids=[], candidates=[])

    connection_status = instagram.get("connection_status")
    account_id = instagram.get("connected_account_id")
    if connection_status == "connected":
        if not isinstance(account_id, str) or not account_id:
            return _error("SOCIAL_ACCOUNT_INPUT_INVALID", source_ids=[], candidates=[])
        capability_status = "available"
        reason_code = "SEVEN_DAY_CAMPAIGN_RECOMMENDATION_READY"
    elif connection_status == "not_connected":
        if account_id is not None:
            return _error("SOCIAL_ACCOUNT_INPUT_INVALID", source_ids=[], candidates=[])
        capability_status = "not_connected"
        reason_code = "SEVEN_DAY_CAMPAIGN_RECOMMENDATION_DRAFT_ONLY"
    elif connection_status == "error":
        capability_status = "error"
        account_id = None
        reason_code = "SEVEN_DAY_CAMPAIGN_RECOMMENDATION_DRAFT_ONLY"
    else:
        return _error("SOCIAL_ACCOUNT_INPUT_INVALID", source_ids=[], candidates=[])

    candidates = []
    for product_id in new_ids:
        identity = f"seven_day_product_campaign:{payload['shop']['domain']}:{product_id}"
        candidates.append(
            {
                "recommendation_request_id": "campreq_" + hashlib.sha256(identity.encode("utf-8")).hexdigest()[:16],
                "candidate_kind": "seven_day_campaign_recommendation",
                "activation_mode": "optional_draft",
                "product_id": product_id,
                "recommended_channel": "instagram",
                "instagram": {"status": capability_status, "connected_account_id": account_id},
            }
        )
    return _ok(True, reason_code, source_ids=new_ids, candidates=candidates)


def evaluate(payload: dict[str, Any], snapshot: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise EvaluationError("input must be an object")
    required = {"scan_started_at", "shop", "products", "social_accounts"}
    missing = sorted(required - payload.keys())
    if missing:
        raise EvaluationError(f"input missing fields: {missing}")
    if not isinstance(snapshot, dict) or not isinstance(snapshot.get("state"), dict) or not isinstance(snapshot.get("actions"), dict):
        raise EvaluationError("snapshot has an invalid shape")
    scan_started_at = _parse_time(payload["scan_started_at"], "scan_started_at")
    shop = payload["shop"]
    if not isinstance(shop, dict) or shop.get("domain") != snapshot["state"].get("shop_domain"):
        raise EvaluationError("shop domain does not match patrol state")

    new_product_result, new_ids, state_changes = _new_products(payload, snapshot, scan_started_at)
    campaign_result = _campaign_recommendations(payload, new_ids)
    triggers = {
        "new_product": new_product_result,
        "campaign_recommendation": campaign_result,
    }
    status = "partial" if any(item["evaluation_status"] == "error" for item in triggers.values()) else "ok"
    return {
        "status": status,
        "evaluated_at": payload["scan_started_at"],
        "triggers": triggers,
        "proposed_state_changes": state_changes,
    }


def _load_input(path: str) -> dict[str, Any]:
    try:
        if path == "-":
            value = json.load(sys.stdin)
        else:
            source = Path(path)
            if source.is_symlink() or not source.is_file():
                raise EvaluationError("input must be a regular JSON file")
            value = json.loads(source.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise EvaluationError("input is not valid JSON") from exc
    if not isinstance(value, dict):
        raise EvaluationError("input must be an object")
    return value


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default="-", help="Normalized input JSON path or - for stdin")
    parser.add_argument("--store-root", default="project/.shopify-social-patrol")
    args = parser.parse_args(argv)
    try:
        payload = _load_input(args.input)
        snapshot = patrol_store.load_snapshot(Path(args.store_root).resolve())
        print(json.dumps(evaluate(payload, snapshot), ensure_ascii=False, sort_keys=True))
        return 0
    except (EvaluationError, patrol_store.StoreError) as exc:
        print(
            json.dumps(
                {"status": "error", "error_code": "invalid_evaluation_input", "message": str(exc)},
                ensure_ascii=False,
                sort_keys=True,
            ),
            file=sys.stderr,
        )
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
