---
name: aw-shopify-oauth
description: "Accio Work Shopify Connector OAuth and authorization. Use when the user needs to connect, reconnect, confirm, or switch the active Shopify store in Accio Work, or when you need to verify the bound store and granted Shopify scopes before acting on that store. This skill covers only Accio Work authorization and permission checks; it does not create products, edit themes, write GraphQL, or execute business mutations."
metadata:
  author: Accio
  version: "4.2.0"
---

You help the user authorize a Shopify store through the Accio Work Shopify Connector and verify that the connected store has the permissions needed for the requested task.

## Core Rules

- Use the Accio Work Connector as the normal authorization path: **Accio Work → Plugins → Shopify (plugin detail page) → scroll down to App Authorization (应用授权) → Shopify Store Auth (Shopify店铺授权)**.
- Do not ask the user for `shpat_*` admin tokens, API keys, or app secrets.
- Do not run or suggest extra auth just to "refresh" or "be safe".
- Do not silently switch stores. If the connected store differs from the user's intended store, stop and ask the user to confirm.
- Treat "connected" as an auth state only. It does not prove that a later Shopify operation succeeded.

## Source of truth — Connector only (read this BEFORE Connection Flow)

The connected store identity comes from **the Accio Work Connector only**. Every other signal is noise from other users / other sessions / failed past attempts, and using it produces wrong-store actions and silently leaks information.

**Forbidden discovery patterns** (do NOT do any of these to "find out if the user has a store"):

- Read `~/.config/shopify/`, `~/.shopify/`, or any other Shopify CLI cache to discover store handles.
- `grep` / `glob` the local filesystem for `*.myshopify.com` strings.
- Run `shopify store list` / `shopify store execute --store <guessed-handle>` with any handle the user did not explicitly give you in **this conversation**.
- Look up prior conversations, diary entries, memory, or skill examples for previously-seen store handles and try them.
- Call `accio-mcp-cli keyword shopify` / browse MCP toolkits looking for an alternate authorization tool — Connector is the only path.
- Read environment variables (`SHOPIFY_FLAG_STORE`, `SHOPIFY_CLI_*`) and treat any value found there as a connected store.

**Required behaviour when you have no store handle yet**:

1. If the user named a store in their message → use that handle to verify (see §Verify Authorization).
2. If the user did not name a store and the Connector has no connected store → `ask_user` to connect at **Plugins → Shopify (plugin detail page) → scroll down to App Authorization (应用授权) → Shopify Store Auth (Shopify店铺授权)**. Do NOT run any discovery first.
3. If the Connector returns a connected store but the user did not name one → confirm the connected `*.myshopify.com` with the user before acting.

**Never** report a store handle to the user that you found through any forbidden pattern above — it almost certainly belongs to a different user/session, and surfacing it is a privacy leak.

## Store Handle Lookup

When the user needs to enter a Shopify store handle, explain this clearly:

- The handle is the part **before** `.myshopify.com` in the store's original Shopify permanent domain.
- Shopify authorization expects the original `*.myshopify.com` domain / handle. A later custom brand domain such as `mybrand.com` cannot be used for authorization.
- To find it: open **Shopify Admin → Settings → Domains**. Look for the domain ending in `.myshopify.com`; the subdomain before `.myshopify.com` is the handle.
- Example: if Domains shows `m5mrmw-zk.myshopify.com`, the handle is `m5mrmw-zk`.

## Connection Flow

1. Check whether the Accio Work Connector reports a connected Shopify store. The only acceptable check is asking the user (or, if a store handle is already explicitly available from this conversation, running the §Verify Authorization command with that handle). Do NOT scan local filesystem, CLI cache, env vars, or prior conversations — see §Source of truth.
2. If already connected, confirm the connected `*.myshopify.com` domain with the user before continuing.
3. If not connected, or if the user wants to reconnect / switch stores, ask them to open **Accio Work → Plugins → Shopify (plugin detail page) → scroll down to App Authorization (应用授权) → Shopify Store Auth (Shopify店铺授权)** and click **Connect**.
4. The browser opens Shopify's OAuth page. The user should confirm the store and click **Install app**.
5. After the user reports that authorization finished, check the connected `*.myshopify.com` domain again.
6. If no store is connected, ask whether the OAuth page reported an error, then have the user retry through the Connector.

## Connector Scope Policy

The Connector permission picker is the only source of truth for its required and default scope policy. Do not duplicate a static baseline list in this Skill: it will drift from the Connector and a later `shopify store auth --scopes ...` call can replace the user's current grant with that stale list.

Use `currentAppInstallation.accessScopes[].handle` from §Verify Authorization as the exact runtime grant. Apply these capability rules when deciding whether expansion is necessary:

- Product or Collection publication discovery and publish/unpublish require both `read_publications` and `write_publications`.
- Daily sales/order reporting requires `read_orders` only when that capability is used. Do not add `write_orders` or `read_all_orders` for read-only reporting.
- Merchant-owned Metaobjects require their matching Metaobject scopes. App-owned `$app:` Metaobjects on Admin API 2026-04 or later do not.
- Markets permissions remain optional; request `read_markets` or `write_markets` only for an operation that actually uses them.

Do not add orders, customers, fulfillment, payments, gift cards, location writes, or another optional scope merely because it appeared in an older template. The user can revoke access later from Shopify Admin → Settings → Apps and sales channels.

## Verify Authorization

Before acting on a store, verify the bound store and granted scopes with a read-only check.

**Prerequisite — handle source**: the `<store-domain>` you put on the command MUST come from one of:

- The user's message in **this conversation**.
- A `*.myshopify.com` returned by the Connector earlier in **this conversation**.

If you do not have a handle from one of those sources, do NOT guess and do NOT run this command — return to §Connection Flow Step 3 and `ask_user` to connect.

```bash
shopify store execute --store <store-domain> --query '{ shop { myshopifyDomain } app { handle title apiKey } currentAppInstallation { accessScopes { handle description } } }'
```

Always include `--store <store-domain>` on Shopify store commands. User-facing examples should use clean commands like the one above. If you execute the command yourself in an environment that requires Shopify CLI attribution, use the env-prefixed form internally but do not add those env vars to the user-facing example.

Use the result as follows:

- Confirm `shop.myshopifyDomain` matches the intended `*.myshopify.com` store.
- Inspect `currentAppInstallation.accessScopes[].handle` for the scopes required by the requested task.
- Treat `description` as display text only. Scope decisions should use `handle`.
- Do not expose `app.apiKey` in user-facing reports.
- If the command returns `401`, `unauthenticated`, or `invalid_token`, reconnect through the Accio Work Connector.

## Stored Store Auth Repair

When another skill (usually `shopify-use-shopify-cli`) reports `stored_auth_repair_required` after `shopify store execute` fails with stale/missing stored auth symptoms, handle it here — not in the execution skill.

Repair flow:

1. Re-run the §Verify Authorization command for the intended store handle. Continue only if it returns both the matching store and the complete current scope handles.
2. If verification cannot return both values, or the Connector is disconnected, invalid/revoked, or bound to the wrong store, ask the user to manually disconnect and reconnect in the plugin UI: **Accio Work → Plugins → Shopify (plugin detail page) → scroll down to App Authorization (应用授权) → Shopify Store Auth (Shopify店铺授权) → Disconnect → Connect**. The Connector picker then reapplies the current required/default policy. Without a verified current grant there is no safe base for a direct `--scopes` replacement. Do not scan local CLI cache, env vars, keychains, or token files.
3. If verification succeeds and the only problem is a known missing operation scope, this skill may run the union-based command in §Scope Expansion. Do not let execution skills synthesize the list.
4. If scoped auth refresh still fails, report the exact CLI/connector error to the Main Agent as an auth-repair failure. Do not ask `shopify-use-shopify-cli` to retry random commands or repair credentials itself.

## Scope Expansion

Do not call `shopify store auth` merely to refresh, normalize, or re-assert scopes.

Only initiate auth again when:

- The current connected installation is missing a scope required for the user's requested operation.
- A Shopify operation returns a clear missing-scope / permission error and the missing scope is known.

An invalid token or an unreadable current grant must go through Connector disconnect/reconnect instead; never reconstruct its scopes from memory or an old template.

Shopify CLI auth scopes **replace** the saved scope set; they do not merge with previous scopes. Build the new value as a de-duplicated union of:

1. Every handle returned by `currentAppInstallation.accessScopes` immediately before reauthorization.
2. Only the missing scopes required by the validated operation.

Never pass only the new or missing scopes, because that silently drops existing permissions. Never rebuild the list from a static baseline, because that can add old high-risk scopes or remove newer Connector permissions. Preserve optional scopes the user already granted, but do not introduce orders, customers, or another optional scope unless the current operation requires it.

Template for unavoidable scope expansion:

```bash
shopify store auth --store <store-domain> --scopes <current-granted-scopes-plus-required-scopes>
```

After scope expansion, rerun the authorization check and verify that every previously granted scope and every newly required scope is present.

## Common Failures

| Symptom | Cause | Action |
|---|---|---|
| The OAuth callback store does not match the requested store | The user logged into a different Shopify account or entered the wrong handle/custom domain | Ask the user to check Shopify Admin → Settings → Domains, find the `.myshopify.com` domain, use only the prefix before `.myshopify.com`, then retry the Connector. |
| The user only has a custom domain like `mybrand.com` | Custom domains are not the Shopify authorization handle | Ask them to find the original `.myshopify.com` domain under Shopify Admin → Settings → Domains. |
| A required scope is missing | The requested task needs a permission outside the current installation | Identify the missing scope, then reauthorize with the union of the current grant and the required scope. |
| Token expired or app access was revoked | The app was removed, access expired, or Shopify rejected the token | Reconnect through the Accio Work Connector. |
| The connected store appears wrong mid-conversation | The user owns multiple stores or switched accounts | Stop and confirm the intended `*.myshopify.com` store before continuing. |
| You don't know the store handle and the Connector has no connected store | Nothing to verify against | `ask_user` to connect at **Plugins → Shopify (plugin detail page) → scroll down to App Authorization (应用授权) → Shopify Store Auth (Shopify店铺授权)**. Do NOT scan local CLI cache, env vars, prior conversations, or `*.myshopify.com` strings on disk to guess a handle — see §Source of truth. Those signals belong to other users / sessions. |
| `shopify store execute --store <some-handle>` succeeds for a handle the user never named | You used a handle from CLI cache / prior session — that store belongs to someone else | Stop immediately. Do NOT report the handle. `ask_user` to connect their own store through the Connector. |
