# Shopify Authorization — Pointer

> **Stub file kept only to preserve incoming link compatibility.** All Shopify auth content has moved.

---

## Where to look

| You want to... | Read this |
|---|---|
| Understand the Accio Work Connector model, why it replaces Custom Apps + `shpat_*` direct paste, and how to capture the active store handle | [`../../aw-shopify-oauth/SKILL.md`](../../aw-shopify-oauth/SKILL.md) — **single source of truth for Connector OAuth + active-store context only** |
| Run the connect-existing-store flow yourself | [`connect-existing-store-script.md`](connect-existing-store-script.md) |
| Execute Shopify CLI commands, probe a store, or run validated GraphQL | Official `shopify-use-shopify-cli` skill |

---

## What is **forbidden** (do not regress)

- ❌ Telling the user to create a Shopify Custom App and copy Client ID / Client Secret / `shpss_*`
- ❌ Calling `accio-mcp-cli call get_shopify_access_token` or `accio-mcp-cli call start_shopify_auth` — these MCP tools bypass the Connector's managed OAuth and are deprecated for this agent
- ❌ Forwarding raw URLs (`admin.shopify.com/store/.../app/grant?...`, `phoenix-gw.alibaba.com/connector/shopify/auth?...`, or any `auth_url` returned from the deprecated MCP tools) — they all dead-end at "Application under review"
- ❌ Persisting any `shpat_*` value to `MEMORY.md`, `store-config.json`, `.env`, or any tracked file

The only correct merchant entry point is **Accio Work app -> sidebar -> Capabilities -> Plugins -> Shopify -> Connectors -> Shopify card -> Connect**, described in `aw-shopify-oauth/SKILL.md`.
