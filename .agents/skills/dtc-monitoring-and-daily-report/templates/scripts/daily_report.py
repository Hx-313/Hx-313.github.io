#!/usr/bin/env python3
"""Daily report orchestrator.

Reads ``project/store-config.json``, fans out to per-source fetchers, wraps
each call in try/except so a single failure degrades a section instead of
crashing the whole run, then renders Markdown via ``render_report.py``.

Usage::

    python3 templates/scripts/daily_report.py
    python3 templates/scripts/daily_report.py --mock        # dry-run, no APIs
    python3 templates/scripts/daily_report.py --config path/to/store-config.json

Designed to be cron-friendly:

    cd ${WORKSPACE} && python3 project/scripts/daily_report.py

When the user copies these scripts into their project (typically under
``project/scripts/``), the relative imports below still work because we add the
script's own directory to ``sys.path``.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

# Make sibling modules importable when invoked as a file.
HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import fetch_clarity        # noqa: E402
import fetch_judgeme        # noqa: E402
import fetch_shopify        # noqa: E402
import render_report        # noqa: E402


def _load_config(path: Path) -> dict:
    if not path.exists():
        sys.exit(
            f"❌ Config not found at {path}.\n"
            f"   Copy templates/store-config.example.json to {path} and fill in values."
        )
    with path.open() as f:
        return json.load(f)


def _resolve_auto(value, fallback):
    """Treat 'auto', None, '' as 'use the fallback'."""
    if value in (None, "", "auto"):
        return fallback
    return value


def _safe(callable_, *args, **kwargs):
    """Run a fetcher, swallow unexpected exceptions, return error-tagged dict."""
    try:
        return callable_(*args, **kwargs)
    except Exception as e:
        return {"status": "error", "reason": f"{type(e).__name__}: {e}", "data": None}


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate the daily Shopify monitoring report.")
    parser.add_argument(
        "--config",
        default="project/store-config.json",
        help="Path to store-config.json (default: project/store-config.json)",
    )
    parser.add_argument(
        "--mock",
        action="store_true",
        help="Dry-run: skip Clarity/Judge.me/orders, only probe Shopify shop identity.",
    )
    parser.add_argument(
        "--growth-result",
        help=(
            "Optional evaluator/action-summary JSON for development or agent orchestration. "
            "Raw product/email/connector input is never accepted or rendered."
        ),
    )
    args = parser.parse_args()

    config_path = Path(args.config).resolve()
    cfg = _load_config(config_path)

    store = cfg.get("shop_domain")
    if not store or "REPLACE" in store:
        sys.exit(f"❌ store-config.json `shop_domain` not set ({store!r}).")

    # ----- Stage 0: identity probe (also resolves auto timezone/currency) -----
    shop_resp = _safe(fetch_shopify.fetch_shop_info, store)
    if shop_resp.get("status") != "ok":
        sys.exit(f"❌ Cannot reach Shopify ({shop_resp.get('reason')}). "
                 f"Check Connector status: Sidebar → Capabilities → Plugins → Shopify → Connectors → Shopify.")
    shop = shop_resp["data"]

    timezone = _resolve_auto(cfg.get("shop_timezone"), shop.get("ianaTimezone") or "UTC")
    currency = _resolve_auto(cfg.get("shop_currency"), shop.get("currencyCode") or "USD")
    language = _resolve_auto(cfg.get("language"), "en")
    reports_dir = Path(cfg.get("reports_dir") or "project/daily-reports").resolve()

    try:
        tz = ZoneInfo(timezone)
    except Exception:
        # Unknown/invalid timezone or missing system tzdata — fall back to UTC
        # so the report still generates instead of crashing.
        timezone = "UTC"
        tz = ZoneInfo("UTC")
    yesterday_local = (datetime.now(tz) - timedelta(days=1)).date()
    date_label = yesterday_local.strftime("%Y-%m-%d")
    generated_at = datetime.now(tz).strftime("%Y-%m-%d %H:%M:%S %Z")

    # ----- Stage 1: Shopify data (skipped in --mock) -----
    sources: list[str] = ["Shopify"]
    if args.mock:
        shopify_data = {"count": 0, "paid_count": 0, "revenue": 0.0, "aov": 0.0,
                        "active_products": 0, "all_time_orders": 0}
    else:
        orders_resp = _safe(fetch_shopify.fetch_orders_yesterday, store, timezone)
        products_resp = _safe(fetch_shopify.fetch_active_products_count, store)
        all_orders_resp = _safe(fetch_shopify.fetch_total_orders, store)

        orders_norm = fetch_shopify.normalize_orders(orders_resp.get("data") or [])
        shopify_data = {
            **orders_norm,
            "active_products": products_resp.get("data") or 0,
            "all_time_orders": all_orders_resp.get("data") or 0,
        }

    # ----- Stage 2: Clarity (dual-path: Connector preferred, manual token fallback) -----
    # The decision (Connector vs token vs skip) lives inside fetch_clarity.fetch_insights;
    # we only short-circuit for --mock here.
    clarity_cfg = cfg.get("clarity") or {}
    clarity_token = clarity_cfg.get("api_token")
    use_connector = clarity_cfg.get("use_connector", True)
    accio_account_id = cfg.get("accio_account_id")
    if args.mock:
        clarity_resp = {"status": "skipped", "reason": "mock mode", "source": "none", "data": None}
    else:
        clarity_resp = _safe(
            fetch_clarity.fetch_insights,
            clarity_token,
            1,
            use_connector=use_connector,
            accio_account_id=accio_account_id,
        )
    clarity_parsed = fetch_clarity.parse(clarity_resp.get("data") if clarity_resp.get("status") == "ok" else None)
    if clarity_resp.get("status") == "ok":
        # Tag the source so the report header can show "Microsoft Clarity (via Connector)" when relevant.
        src_tag = " (via Connector)" if clarity_resp.get("source") == "connector" else ""
        sources.append(f"Microsoft Clarity{src_tag}")

    # ----- Stage 3: Judge.me (auto via Shopify metafields; no token needed) -----
    # If the Judge.me app is installed, its review summary is synced into Shopify
    # shop metafields (namespace "judgeme"), so we read it through the same
    # Connector path as the other Shopify data. status='skipped' is normal when
    # the app is not installed; counts of 0 (status='ok') are normal pre-launch.
    if args.mock:
        judgeme_resp = {"status": "skipped", "reason": "mock mode", "data": None}
    else:
        judgeme_resp = _safe(fetch_judgeme.fetch_summary, store)
    if judgeme_resp.get("status") == "ok":
        sources.append("Judge.me")

    # ----- Stage 4: Optional growth result -----
    growth = None
    if args.growth_result:
        try:
            growth = _load_growth_result(Path(args.growth_result).resolve())
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            sys.exit(f"❌ Invalid growth result: {exc}")

    # ----- Stage 5: Render -----
    data = {
        "store_name": shop.get("name") or store,
        "store_domain": store,
        "currency": currency,
        "date_label": date_label,
        "generated_at": generated_at,
        "sources": sources,
        "shopify": shopify_data,
        "clarity": clarity_parsed,
        "clarity_status": clarity_resp.get("status"),
        "clarity_reason": clarity_resp.get("reason"),
        "judgeme": judgeme_resp.get("data"),
        "judgeme_status": judgeme_resp.get("status"),
        "judgeme_reason": judgeme_resp.get("reason"),
        "growth": growth,
    }
    render_cfg = {**cfg, "language": language}
    try:
        md = render_report.render(data, render_cfg)
    except Exception as e:
        # Safety net: never let a rendering edge-case crash the whole run.
        # Emit a minimal report noting the issue so the cron job still produces a file.
        md = (
            f"# {data.get('store_name', store)} Daily Report — {date_label}\n\n"
            f"> Generated at: {generated_at}\n\n"
            f"_Report rendering hit an unexpected issue and produced a reduced output: "
            f"{type(e).__name__}: {e}_\n\n"
            f"Raw KPIs — Revenue: {shopify_data.get('revenue', 0)}, "
            f"Orders: {shopify_data.get('count', 0)}, "
            f"Active products: {shopify_data.get('active_products', 0)}\n"
        )

    # ----- Stage 6: Write file -----
    reports_dir.mkdir(parents=True, exist_ok=True)
    out_file = reports_dir / f"{date_label}.md"
    out_file.write_text(md, encoding="utf-8")

    print(f"✅ Report written: {out_file} ({len(md)} bytes)")
    if args.mock:
        print("   (mock mode — only shop identity was queried)")
    return 0


def _load_growth_result(path: Path) -> dict:
    """Load only report-safe fields from a trigger/action summary.

    Production orchestration can pass the same shape directly in memory.  This
    file option exists for tests and agent-managed runs; inbound email bodies,
    generated payloads, customer data, and raw Connector responses are ignored.
    """
    if path.is_symlink() or not path.is_file():
        raise ValueError("growth result must be a regular JSON file")
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict) or not isinstance(raw.get("triggers"), dict):
        raise ValueError("growth result must contain a triggers object")
    clean_triggers: dict[str, dict] = {}
    allowed_names = {"new_product", "campaign_recommendation", "social_candidate"}
    for name, item in raw["triggers"].items():
        if name not in allowed_names or not isinstance(item, dict):
            continue
        # Accept legacy patrol output during rollout, but expose only the new
        # recommendation name to the renderer.  A recommendation is not a
        # social publish candidate and carries no publishing authorization.
        target_name = "campaign_recommendation" if name == "social_candidate" else name
        if target_name in clean_triggers and name == "social_candidate":
            continue
        source_ids = item.get("source_ids")
        clean_triggers[target_name] = {
            "evaluation_status": item.get("evaluation_status"),
            "matched": item.get("matched"),
            "reason_code": item.get("reason_code"),
            "source_ids": source_ids if isinstance(source_ids, list) else [],
        }
    clean_actions: list[dict[str, str]] = []
    for action in raw.get("actions") or []:
        if not isinstance(action, dict):
            continue
        if action.get("action_type") == "social_publish" and all(
            isinstance(action.get(key), str) for key in ("action_key", "action_type", "status")
        ):
            clean_actions.append({key: action[key] for key in ("action_key", "action_type", "status")})
    clean_campaigns: list[dict] = []
    for item in raw.get("campaign_recommendations") or []:
        if not isinstance(item, dict):
            continue
        product = item.get("product") if isinstance(item.get("product"), dict) else {}
        plan = item.get("recommended_plan") if isinstance(item.get("recommended_plan"), dict) else None
        blockers = item.get("blockers") if isinstance(item.get("blockers"), list) else []
        reason_codes = item.get("reason_codes") if isinstance(item.get("reason_codes"), list) else []
        warnings = item.get("warnings") if isinstance(item.get("warnings"), list) else []
        user_options = item.get("user_options") if isinstance(item.get("user_options"), list) else []
        clean_campaigns.append(
            {
                "recommendation_id": item.get("recommendation_id") if isinstance(item.get("recommendation_id"), str) else None,
                "decision": item.get("decision") if item.get("decision") in {"recommended", "not_recommended", "unknown"} else "unknown",
                "publish_readiness": item.get("publish_readiness") if item.get("publish_readiness") in {"ready", "blocked", "not_applicable"} else "not_applicable",
                "product": {
                    "product_id": product.get("product_id") if isinstance(product.get("product_id"), str) else None,
                    "title": product.get("title") if isinstance(product.get("title"), str) else None,
                },
                "reason_codes": [code for code in reason_codes if isinstance(code, str)],
                "blocker_codes": [
                    blocker["code"]
                    for blocker in blockers
                    if isinstance(blocker, dict) and isinstance(blocker.get("code"), str)
                ],
                "warnings": [code for code in warnings if isinstance(code, str)],
                "recommended_plan": (
                    {
                        "horizon_days": plan.get("horizon_days") if type(plan.get("horizon_days")) is int else None,
                        "recommended_channel": plan.get("recommended_channel") if isinstance(plan.get("recommended_channel"), str) else None,
                        "recommended_post_count": plan.get("recommended_post_count") if type(plan.get("recommended_post_count")) is int else None,
                        "estimated_review_minutes": plan.get("estimated_review_minutes") if type(plan.get("estimated_review_minutes")) is int else None,
                    }
                    if plan is not None
                    else None
                ),
                "user_options": [option for option in user_options if isinstance(option, str)],
                "expires_at": item.get("expires_at") if isinstance(item.get("expires_at"), str) else None,
            }
        )
    return {
        "status": raw.get("status") if raw.get("status") in {"ok", "partial"} else "partial",
        "triggers": clean_triggers,
        "actions": clean_actions,
        "campaign_recommendations": clean_campaigns,
    }


if __name__ == "__main__":
    raise SystemExit(main())
