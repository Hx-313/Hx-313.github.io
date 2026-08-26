# Reference 00: Verified Top-Level SaaS URLs & Pricing Sources

> **Review this file every 6 months.** Top-level domains rarely change but deep paths do.

## Top-level entry points (stable — verified Apr 2026)

| Service | URL | Purpose |
|---|---|---|
| Microsoft Clarity | https://clarity.microsoft.com | Sign-up + project creation |
| Microsoft Clarity Connector (Accio Work) | Accio Work app → Sidebar → Capabilities → Plugins → Shopify → Connectors → Microsoft Clarity | One-click setup of the local `@microsoft/clarity-mcp-server` (Data Export JWT lifecycle managed by platform) |
| `@microsoft/clarity-mcp-server` (npm) | https://www.npmjs.com/package/@microsoft/clarity-mcp-server | Local MCP server v2.0.1 spawned by the Connector via `npx -y` (no manual install needed) |
| Judge.me | https://judge.me | Marketing site (App Store install link from there) |
| Shopify App Store — Judge.me | https://apps.shopify.com/judgeme | Direct install |
| Shopify Theme Editor | https://admin.shopify.com/store/{store}/themes | Theme + App Embed toggles |
| Shopify Customer Events | https://admin.shopify.com/store/{store}/settings/customer_events | Custom Pixel paste |

## Deep admin paths (volatile — re-verify before EVERY mention)

These iterate every 6-12 months. **Never** show these to a user without first running `web_search` for the current path. Re-verification protocol:

1. Search: `"<service> + <feature>" 2026 path` (e.g. `"Microsoft Clarity Data Export API token" 2026`)
2. Cross-check the result against the official docs page if reachable
3. Annotate the verification date next to the URL in the relevant install reference (`04-install-clarity.md`, etc.)
4. If the user reports "page not found / can't open" — **immediately re-verify**, do not explain why the URL "should be" right

## Pricing sources (always re-verify before quoting numbers)

Pricing pages change without notice. Always `web_search` for the current price before mentioning a dollar amount in any user-facing message. Sources to check:

| Service | Pricing page |
|---|---|
| Judge.me | https://judge.me/pricing |
| Microsoft Clarity | (free, no paid tier — only rate limits) |
| Shopify | https://www.shopify.com/pricing |

## Forbidden hardcoded values

The following must NEVER be hardcoded in user-facing messages or scripts:

- Subscription prices ($X/mo) — always verify with web_search
- "30 minutes setup" — varies by Connector status; describe as "5 min if Connector linked, 15 min if not"
- API version (e.g. `2026-01`) — pulled from `templates/scripts/api_version.py`
- Store timezone (e.g. `America/Los_Angeles`, `Europe/London`, `Asia/Tokyo` — any IANA timezone) — pulled from `shop.ianaTimezone` at runtime
- Store currency (e.g. `USD`) — pulled from `shop.currencyCode` at runtime
- Language (`zh` / `en`) — read from `store-config.json`, defaulted from user locale

## Last-verified dates

| What | Date | Verified by |
|---|---|---|
| Top-level URLs above | 2026-04-22 | Initial skill creation |
| Clarity Connector + clarity-mcp-server npm | 2026-04-28 | Connector migration audit |
| Deep paths | (see individual reference files) | — |
| Pricing | (always re-verify) | — |
