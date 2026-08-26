# Reference 99: Self-Hosted Fallback (Custom App + Token)

> 🚨 **DO NOT USE THIS PATH FOR ACCIO WORK USERS.**
>
> The Accio Work platform has a built-in Shopify Connector that handles OAuth + token lifecycle in one click via `Sidebar → Capabilities → Plugins → Shopify (plugin detail page) → scroll down to App Authorization (应用授权) → Shopify Store Auth (Shopify店铺授权)`. That is the **only** supported path inside this plugin.
>
> Use this document **only when** the user is on a self-hosted setup outside Accio Work and has explicitly stated they cannot use the Connector. In that case, the entire monitoring stack must be ported to use a `shpat_*` token instead of the `shopify` CLI — that work is out of scope for this skill in plugin context.
>
> ⚠️ **All scripts in `templates/scripts/` shell out to `shopify store execute` and assume the Connector is connected.** They will not work with a raw `shpat_*` token without modification.

---

## Why we deprecated this path

| Connector path (default) | Custom App fallback (this doc) |
|---|---|
| ~1 minute (one click in Settings) | 8-12 minutes of manual Dev Dashboard clicks |
| Token refresh handled by platform | User-managed `client_credentials` re-exchange every 24h |
| Scopes pre-granted (16 total) | Manual scope selection, easy to miss one |
| Works with `shopify store execute` (validated path) | Forces curl/REST against Admin API directly |
| Survives token rotation | Breaks every time secret rotates |

If the user is genuinely off-platform, the right action is to direct them to use the published `shopify` CLI auth flow on their own machine, not to set up Custom App + client_credentials. The CLI handles OAuth in the browser the same way the Connector does.

---

## If you absolutely must (off-platform user, no CLI access)

### 👤 User-facing setup steps

1. Open Shopify Dev Dashboard (verify current URL via `web_search` first)
2. Top-right → **Create app** → **Create app manually**
3. App name: e.g. `Store Monitoring App`
4. After creation → **Configuration** tab → **Admin API integration** → **Configure**
5. Grant minimum scopes:
   - `read_orders`, `read_products`, `read_inventory`
   - `read_themes`, `write_themes` (for snippet upload)
6. Save
7. **Distribution** tab → **Custom distribution** → **Install app** → select store → confirm
8. **API credentials** tab → copy **Client ID** + **Client secret**

### 🤖 Agent verification

```bash
curl -s -X POST "https://{STORE_DOMAIN}/admin/oauth/access_token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}"
```

Expected: `{"access_token": "shpat_...", "scope": "..."}`. If 401, re-check Client ID/Secret or scopes not granted.

### Required script modifications

If the user genuinely needs to run with a `shpat_*` token, modify `templates/scripts/shopify_cli.py` to bypass the CLI and use direct REST calls. **This is a manual port — out of scope for the default skill flow.** Document the change in their `project/store-config.json`:

```json
{
  "shop_domain": "...",
  "auth_mode": "self_hosted",
  "client_id": "...",
  "client_secret": "..."
}
```

## Forbidden in plugin default flow

- Storing `shpat_*` tokens in MEMORY.md or `store-config.json` for Accio Work users
- Telling users to manually create Custom Apps when Connector is available
- Quoting "8-12 minutes setup" in user-facing messages — that is the off-platform fallback estimate, not the default

---

## Clarity without the Accio Work Connector

> 🚨 **Same posture as Shopify above.** Use the **Accio Work Microsoft Clarity Connector** by default. The manual `clarity.api_token` field documented here remains 100% functional as a fallback — it is not deprecated — but the agent should default to the Connector path.

### When to use this fallback

| Situation | Use this manual path? |
|---|---|
| User is on Accio Work AND Clarity Connector is connected | ❌ No — agent uses Connector via `fetch_clarity._fetch_via_mcp` |
| User is on Accio Work but the Clarity Connector is **not yet authorized** (state.json shows `accounts: []`) | ⚠️ Acceptable temporary fallback — also offer to set up the Connector in 1 click |
| User explicitly opts out of the Connector ("I want to manage my own token") | ✅ Use this — set `clarity.use_connector: false` in `store-config.json` |
| User runs the scripts off-platform (no `~/.accio/` directory at all) | ✅ Use this — the Connector code path detects the missing state.json and skips itself |

### Manual setup (👤 user) — generate the Data Export JWT

1. Sign in to [https://clarity.microsoft.com](https://clarity.microsoft.com).
2. Open the project (each project = one website).
3. **Settings → Data Export → Generate new API token**.
4. Copy the JWT immediately — Clarity shows it **only once**. Store it in a password manager.
5. Paste into `project/store-config.json` under `clarity.api_token`.
6. Set `clarity.use_connector: false` so the dual-path script does not even attempt the Connector probe (saves a few hundred ms per run).

### Verify

```bash
python3 scripts/check_health.py --config project/store-config.json
```

Expected for the fallback path:

```
ℹ️  Clarity Connector       not connected (using manual api_token)
✅ Clarity Data Export API  via token · N metrics returned
```

### Limits (apply to BOTH Connector and manual paths)

- **10 calls/day per project** — upstream Clarity limit; Connector does NOT bypass it
- **Token lifetime** — JWTs do not auto-rotate; if a 401 appears, regenerate
- **One token = one project** — each Clarity project (each website) needs its own JWT (or its own Connector if multi-account is added in a later release)

### Why the dual path matters

The `templates/scripts/fetch_clarity.py` module always exposes the same public function — `fetch_insights(...)` — but internally chooses Connector vs token based on availability:

```
fetch_insights(use_connector=True)
  ├─ try _fetch_via_mcp()    (Connector path: spawn @microsoft/clarity-mcp-server)
  │     └─ on success → return data
  │     └─ on Connector-not-connected / MCP error → fall through
  └─ _fetch_via_token()      (Fallback path: direct HTTPS to data-export.clarity.microsoft.com)
        └─ on missing token → return None (Clarity section gracefully skipped in report)
```

This means the daily report script never branches on auth mode itself — `daily_report.py` Stage 2 just calls `fetch_insights()` and trusts it. Adding a third auth mode in the future (e.g. service-account JWT) only touches `fetch_clarity.py`.
