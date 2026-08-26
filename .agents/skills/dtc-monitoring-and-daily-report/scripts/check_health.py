#!/usr/bin/env python3
"""check_health.py — Verify the monitoring stack is wired correctly.

Run this AFTER:
  - Accio Work Shopify Connector is connected (Sidebar → Capabilities → Plugins → Shopify → Connectors → Shopify)
  - Microsoft Clarity (theme snippet + Data Export token)
  - Judge.me (App installed) — optional; read from Shopify metafields, no token

Usage::

    python3 scripts/check_health.py
    python3 scripts/check_health.py --config /path/to/store-config.json

Exit code 0 = all green; 1 = one or more checks failed.

Reads ``project/store-config.json`` for all configuration. The Clarity token
lives in that file (or is read from the Connector). Shopify auth lives in the
Connector — there are no Shopify tokens in this script or in store-config.json.
Judge.me needs no token: its review summary is read from Shopify shop metafields.
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

# Make the templates/scripts modules importable so we can reuse the Shopify CLI wrapper
HERE = Path(__file__).resolve().parent
TEMPLATES_SCRIPTS = HERE.parent / "templates" / "scripts"
if TEMPLATES_SCRIPTS.exists():
    sys.path.insert(0, str(TEMPLATES_SCRIPTS))

try:
    from shopify_cli import execute as shopify_execute, ShopifyCLIError  # type: ignore
except ImportError:
    shopify_execute = None  # type: ignore
    ShopifyCLIError = Exception  # type: ignore

try:
    import fetch_clarity  # type: ignore
except ImportError:
    fetch_clarity = None  # type: ignore

try:
    import fetch_judgeme  # type: ignore
except ImportError:
    fetch_judgeme = None  # type: ignore


GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"

results: list[tuple[str, str, str]] = []


def ok(label: str, msg: str = "") -> None:
    results.append((label, "✅", msg))
    print(f"{GREEN}✅ {label}{RESET}  {msg}")


def warn(label: str, msg: str = "") -> None:
    results.append((label, "⚠️", msg))
    print(f"{YELLOW}⚠️  {label}{RESET}  {msg}")


def fail(label: str, msg: str = "") -> None:
    results.append((label, "❌", msg))
    print(f"{RED}❌ {label}{RESET}  {msg}")


def http_get(url: str, headers: dict | None = None, timeout: int = 15) -> tuple[str, int]:
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8"), resp.status


def main() -> int:
    parser = argparse.ArgumentParser(description="Health-check the monitoring stack.")
    parser.add_argument("--config", default="project/store-config.json")
    args = parser.parse_args()

    cfg_path = Path(args.config).resolve()
    if not cfg_path.exists():
        fail("Config", f"Not found at {cfg_path}. Copy templates/store-config.example.json first.")
        return 1
    cfg = json.loads(cfg_path.read_text())

    store = cfg.get("shop_domain")
    if not store or "REPLACE" in store:
        fail("Config", f"shop_domain not set ({store!r})")
        return 1

    clarity_cfg = cfg.get("clarity") or {}

    clarity_token = clarity_cfg.get("api_token")
    clarity_pid = clarity_cfg.get("project_id")
    clarity_use_connector = clarity_cfg.get("use_connector", True)
    accio_account_id = cfg.get("accio_account_id")

    # =========================================================================
    # 1. Shopify — via Connector + `shopify store execute`
    # =========================================================================
    print("\n=== 1. Shopify Connector ===")
    if shopify_execute is None:
        fail("Shopify CLI module", "Cannot import templates/scripts/shopify_cli.py. "
             "Ensure the templates/scripts/ folder is present alongside scripts/.")
    else:
        try:
            resp = shopify_execute(
                store=store,
                query="query { shop { name myshopifyDomain ianaTimezone currencyCode plan { displayName } } }",
                scopes=["read_products"],
            )
            shop = (resp.get("data") or {}).get("shop") or {}
            if shop:
                ok("Shopify shop probe",
                   f"name='{shop.get('name')}', tz='{shop.get('ianaTimezone')}', "
                   f"currency='{shop.get('currencyCode')}', plan='{(shop.get('plan') or {}).get('displayName')}'")
            else:
                fail("Shopify shop probe", "Empty data — check Connector grant + scopes")
        except ShopifyCLIError as e:
            fail("Shopify shop probe",
                 f"{e}\n   → Reconnect via Sidebar → Capabilities → Plugins → Shopify → Connectors → Shopify\n"
                 f"   → If you are not on Accio Work, see references/99-fallback-self-hosted.md")
        except Exception as e:
            fail("Shopify shop probe", f"{type(e).__name__}: {e}")

    # =========================================================================
    # 2. Microsoft Clarity — dual-path: Connector preferred, token fallback
    # =========================================================================
    print("\n=== 2. Microsoft Clarity ===")

    # ---- 2a. Connector probe (state.json under ~/.accio) ----
    connector_connected = False
    if fetch_clarity is None:
        warn("Clarity Connector", "fetch_clarity module not importable (templates/scripts/ missing?)")
    else:
        try:
            resolved_account = fetch_clarity._resolve_account_id(accio_account_id)  # type: ignore[attr-defined]
            if resolved_account is None:
                warn("Clarity Connector", "No ~/.accio/accounts/<id> directory detected — skipping Connector probe")
            else:
                state = fetch_clarity._read_connector_state(resolved_account)  # type: ignore[attr-defined]
                if state is None:
                    warn("Clarity Connector", f"state.json not found for account {resolved_account} (Connector not registered)")
                elif fetch_clarity._connector_is_connected(resolved_account):  # type: ignore[attr-defined]
                    ok("Clarity Connector", f"connected (account {resolved_account})")
                    connector_connected = True
                else:
                    warn("Clarity Connector", f"registered but not authorized (account {resolved_account}, accounts: [])")
        except Exception as e:
            warn("Clarity Connector", f"probe failed: {type(e).__name__}: {e}")

    # ---- 2b. Data Export API probe (dual-path via fetch_clarity.fetch_insights) ----
    if not connector_connected and not clarity_token:
        warn("Clarity Data Export API", "Skipped (no Connector AND no api_token in store-config.json)")
    elif fetch_clarity is None:
        warn("Clarity Data Export API", "Cannot probe — fetch_clarity module missing")
    else:
        try:
            result = fetch_clarity.fetch_insights(
                api_token=clarity_token,
                num_days=1,
                timeout=45,  # cold-start budget for npx -y @microsoft/clarity-mcp-server
                use_connector=clarity_use_connector,
                accio_account_id=accio_account_id,
            )
            status = (result or {}).get("status")
            data = (result or {}).get("data") or []
            reason = (result or {}).get("reason", "")
            path_used = (result or {}).get("path", "?")  # "connector" | "token" if fetch_clarity sets it
            if status == "ok":
                names = [m.get("metricName") for m in data] if isinstance(data, list) else []
                ok("Clarity Data Export API", f"via {path_used} · {len(names)} metrics: {', '.join(filter(None, names[:5]))}")
            elif status == "rate_limited":
                warn("Clarity Data Export API", f"Rate-limited (10 calls/day cap, applies to BOTH paths) · {reason}")
            elif status == "skipped":
                warn("Clarity Data Export API", f"Skipped · {reason}")
            else:
                fail("Clarity Data Export API", f"{status or 'error'} · {reason}")
        except Exception as e:
            fail("Clarity Data Export API", f"{type(e).__name__}: {e}")

    # =========================================================================
    # 3. Judge.me — via Shopify shop metafields (optional, no token)
    # =========================================================================
    print("\n=== 3. Judge.me ===")
    if fetch_judgeme is None:
        warn("Judge.me metafields", "Cannot probe — fetch_judgeme module missing (templates/scripts/ not on path)")
    else:
        try:
            result = fetch_judgeme.fetch_summary(store)
            status = (result or {}).get("status")
            data = (result or {}).get("data") or {}
            reason = (result or {}).get("reason", "")
            if status == "ok":
                ok("Judge.me metafields",
                   f"{data.get('total_count', 0)} reviews total, avg {data.get('average_rating', 0)}⭐ "
                   f"(read from shop.metafields.judgeme)")
            elif status == "skipped":
                warn("Judge.me metafields", f"Skipped · {reason}")
            else:
                fail("Judge.me metafields", f"{status or 'error'} · {reason}")
        except Exception as e:
            fail("Judge.me metafields", f"{type(e).__name__}: {e}")

    # =========================================================================
    # 4. Theme snippet — primary check via Admin GraphQL, secondary via storefront
    # =========================================================================
    print("\n=== 4. Analytics snippet on theme ===")
    snippet_present_via_admin = False
    if shopify_execute is not None:
        try:
            # Get the active theme id, then list its files.
            r1 = shopify_execute(
                store=store,
                query="query { themes(first: 5, roles: [MAIN]) { nodes { id name } } }",
                scopes=["read_themes"],
            )
            themes = ((r1.get("data") or {}).get("themes") or {}).get("nodes") or []
            if not themes:
                fail("Active theme lookup", "No MAIN theme returned (check read_themes scope)")
            else:
                theme_id = themes[0]["id"]
                # NOTE: themeFiles(filenames: [...]) always echoes the requested
                # filename in `nodes[].filename` even when the file does not exist.
                # The reliable existence test is whether `body { content }` returns
                # a non-empty string. We also surface which trackers are active.
                r2 = shopify_execute(
                    store=store,
                    query="""query themeFile($themeId: ID!) {
                      theme(id: $themeId) {
                        files(first: 1, filenames: ["snippets/analytics-snippet.liquid"]) {
                          nodes {
                            filename
                            body {
                              ... on OnlineStoreThemeFileBodyText { content }
                            }
                          }
                        }
                      }
                    }""",
                    variables={"themeId": theme_id},
                    scopes=["read_themes"],
                )
                files = (((r2.get("data") or {}).get("theme") or {}).get("files") or {}).get("nodes") or []
                content = ""
                if files:
                    body = files[0].get("body") or {}
                    content = body.get("content") or ""
                if content:
                    # Detect which trackers are actually wired in
                    has_clarity = "clarity.ms/tag" in content or "clarity_id" in content
                    badges = []
                    if has_clarity:
                        badges.append("Clarity ✓")
                    badge_text = (" [" + ", ".join(badges) + "]") if badges else " [empty trackers]"
                    ok("Snippet file in theme",
                       f"snippets/analytics-snippet.liquid exists ({len(content)} bytes){badge_text}")
                    snippet_present_via_admin = True
                else:
                    fail("Snippet file in theme",
                         "snippets/analytics-snippet.liquid NOT found — re-run snippet upsert (see references/02)")
        except ShopifyCLIError as e:
            warn("Theme file probe", f"{e}")
        except Exception as e:
            warn("Theme file probe", f"{type(e).__name__}: {e}")

    # Secondary: live storefront check (downgrades to warn — many stores have
    # cookie-consent gates that block the script tag from inline HTML).
    print("\n=== 5. Storefront live check (best-effort) ===")
    try:
        html, _ = http_get(
            f"https://{store}",
            headers={"User-Agent": "Mozilla/5.0 (compatible; HealthCheck/1.0)"},
            timeout=20,
        )
        if clarity_pid:
            if "clarity.ms/tag" in html or f'"{clarity_pid}"' in html:
                ok("Clarity script in HTML", "found clarity.ms/tag")
            elif snippet_present_via_admin:
                warn("Clarity script in HTML",
                     "not visible in raw HTML — likely behind a cookie-consent gate. "
                     "Snippet IS in theme (verified above), so this is OK.")
            else:
                fail("Clarity script in HTML", "not found AND snippet missing in theme")
    except Exception as e:
        warn("Storefront fetch", f"{e} (password-protected stores may need manual check)")

    # =========================================================================
    # Summary
    # =========================================================================
    print("\n" + "=" * 60)
    fails = sum(1 for _, s, _ in results if s == "❌")
    warns = sum(1 for _, s, _ in results if s == "⚠️")
    oks = sum(1 for _, s, _ in results if s == "✅")
    print(f"Summary: {GREEN}{oks} OK{RESET} · {YELLOW}{warns} WARN{RESET} · {RED}{fails} FAIL{RESET}")
    print("=" * 60)

    if fails > 0:
        print(f"\n{RED}❌ Fix the failures above before relying on the daily report.{RESET}")
        return 1
    print(f"\n{GREEN}✅ Stack is healthy. Daily report should run cleanly.{RESET}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
