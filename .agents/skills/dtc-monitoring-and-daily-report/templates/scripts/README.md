# Daily Report Script — Architecture

```
templates/scripts/
├── api_version.py        # Pinned Shopify Admin API version (single source of truth)
├── shopify_cli.py        # Wraps `shopify store execute` — only Shopify call path
├── fetch_shopify.py      # Validated GraphQL queries: shop, orders, products, totals
├── fetch_clarity.py      # Microsoft Clarity Data Export API + response parser
├── fetch_judgeme.py      # Judge.me public-token API
├── patrol_store.py      # Atomic per-shop social patrol, Campaign, preflight + action ledger
├── evaluate_growth_triggers.py # Deterministic new-product/Campaign evaluator
├── render_report.py      # Pure renderer (no I/O), bilingual zh/en
├── daily_report.py       # Orchestrator — main entry point
└── README.md             # This file
```

## Design rules

1. **Auth lives in the Connector, never in code.** All Shopify calls go through
   `shopify_cli.execute()` which shells out to `shopify store execute`. No tokens,
   no `shpat_*`, no curl against `/admin/api/...`. If you need to add a Shopify
   query, validate it first via the `shopify-admin` skill (`scripts/search_docs.mjs`
   + `scripts/validate.mjs`).

   **Ad-hoc one-off queries (agent writing a throwaway query):** also use
   `shopify_cli.execute()`, do NOT shell out to `shopify store execute` directly
   and try to parse stdout yourself. The CLI interleaves an ANSI progress bar
   into stdout even with `-j --no-color`; `shopify_cli.execute()` already strips
   it. Hand-rolled `subprocess.run + json.loads` will silently break.

2. **Each `fetch_*.py` returns a status-tagged dict.** Shape:
   `{"status": "ok"|"skipped"|"rate_limited"|"error", "data": ..., "reason": "..."}`
   The orchestrator never crashes from one source failing — the corresponding
   report section degrades to "section unavailable: {reason}".

3. **`render_report.py` has zero I/O.** No network, no filesystem, no subprocess.
   That makes `--mock` mode and unit tests trivial.

4. **No hardcoded locale.** Language, currency, timezone all come from
   `store-config.json` or are auto-resolved from `shop.ianaTimezone` /
   `shop.currencyCode` at runtime. Set the config value to `"auto"` to defer.

5. **Where the user copies these.** The plugin agent should copy the entire
   `templates/scripts/` folder into the user's `project/scripts/`, plus
   `templates/store-config.example.json` to `project/store-config.json` (for
   the user to fill in). Cron then runs:
   `cd ${WORKSPACE} && python3 project/scripts/daily_report.py`

6. **The optional patrol is social-only on this branch.** Its trigger surface is
   limited to `new_product` and `campaign_recommendation`; its only executable
   action type is `social_publish`. The evaluator proposes state changes, while
   `patrol_store.py` is the sole writer. Copy
   `skills/shopify-marketing/scripts/social_publish_preflight.py` into the same
   `project/scripts/` directory when social actions are enabled. A cron run may
   recommend or prepare `planned` drafts, but exact-content confirmation is
   still required before publishing. A proposed date is not a scheduler receipt.
   `action begin` creates a 15-minute execution lease and returns its execution
   ID. Status reads are non-mutating; only explicit `recover` can fail an
   expired lease. Long-running adapters renew ownership with `action heartbeat`,
   and `action finish` must present the same execution ID.

## Clarity dual path: Connector vs token fallback

`fetch_clarity.py` is the only fetcher that intentionally implements **two
auth paths behind one public function** — `fetch_insights(...)`. The
orchestrator never picks the path; the module does.

```
fetch_insights(api_token=None, *, use_connector=True, accio_account_id=None, ...)
  │
  ├─ use_connector and Clarity Connector connected?
  │     ├─ Yes → _fetch_via_mcp()
  │     │         spawns: npx -y @microsoft/clarity-mcp-server
  │     │                 --clarity_api_token=<JWT-from-state.json>
  │     │         JSON-RPC over stdio · 45s cold-start budget
  │     │         on success → return {"status": "ok", "data": [...]}
  │     │         on MCP error → fall through to token path
  │     └─ No / opted out → fall through
  │
  └─ _fetch_via_token(api_token)
        Direct HTTPS to data-export.clarity.microsoft.com/api/v1/project-live-insights
        on missing token → return {"status": "skipped", "reason": "no clarity auth"}
        on 401 → {"status": "error", "reason": "token expired"}
        on 429 → {"status": "rate_limited", "reason": "10 calls/day cap"}
```

**Why this matters for callers:** `daily_report.py` Stage 2 calls
`fetch_clarity.fetch_insights(api_token=cfg.get("clarity_api_token"),
use_connector=cfg.get("clarity_use_connector", True),
accio_account_id=cfg.get("accio_account_id"))` — that's it. No branching on
auth mode. Adding a third auth path (e.g. service-account JWT) only touches
this file.

**Why we did NOT split into two modules:** the public surface is identical
(same query, same response shape, same rate limit) — only the transport
differs. Splitting would force the orchestrator to know about auth modes,
which violates design rule 1.

**Hard constraint inherited from upstream:** the **10 calls/day/project**
limit applies to BOTH paths — the Connector does NOT bypass it. If you see
unexplained `rate_limited` returns, check if any other tool (e.g. an ad-hoc
agent query) consumed the daily quota.

---

## Adding a new data source

1. Create `fetch_<source>.py` exposing a function that returns the status-tagged dict.
2. In `daily_report.py`, add a `_safe(fetch_<source>.xxx, ...)` call after Stage 3.
3. In `render_report.py`, add a section guarded by `data.get("<source>_status") == "ok"`.
4. Add string keys to both `STRINGS["en"]` and `STRINGS["zh"]`.
5. Extend `templates/store-config.example.json` with any required tokens.

## Running

```bash
# Real run (requires Connector + filled-in store-config.json)
python3 project/scripts/daily_report.py

# Dry-run preview (no Clarity / Judge.me / orders calls)
python3 project/scripts/daily_report.py --mock

# Custom config path
python3 project/scripts/daily_report.py --config /path/to/store-config.json
```

## Refreshing the API version

Use the `shopify-admin` skill: `scripts/search_docs.mjs "api versions"` →
read result → bump the constant in `api_version.py` → re-validate any queries
in `fetch_shopify.py` whose schema may have changed.
