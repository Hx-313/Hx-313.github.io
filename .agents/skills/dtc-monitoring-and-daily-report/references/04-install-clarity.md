# Reference 04: Install Microsoft Clarity

<!-- verified Apr 2026 — re-verify all SaaS admin URLs every 6 months via web_search -->


Microsoft Clarity is **free, no rate limits on the dashboard, no team size limits**. Best UX/heatmap/recording tool for early-stage stores.

## Why Clarity for early stores

- 🟢 100% free
- 🟢 No data caps
- 🟢 Records every session (vs Hotjar which samples)
- 🟢 GDPR/CCPA compliant out of the box
- 🟢 Auto-detects "frustration signals" (Rage Click, Dead Click, etc.)
- 🟢 Has Data Export API (free, 10 calls/day/project)

## Two paths for the Data Export API token

Clarity has two pieces the agent depends on:

1. **Project ID** — 10-char ID injected into the storefront `<head>`. **Always manual** — the user copies it from Settings → Overview. The Connector cannot replace this.
2. **Data Export API token** — JWT used by the daily report to pull metrics. **Two paths**:
   - 🟢 **Path A — Accio Work Connector** (recommended). Token managed inside Accio Work; agent never reads, writes, or holds the JWT. One-time OAuth, auto-renews if Microsoft rotates.
   - 🟡 **Path B — Manual token in `store-config.json`** (fallback for self-hosted users or when the Connector is temporarily unavailable). User generates a JWT and pastes it into config.

Default path = A. Skip Step 5 / 6b unless Path A is unavailable.

## Install steps

### Step 0 — 🤖 Agent checks Clarity Connector status

Before showing **anything else**, the agent reads:

```
~/.accio/accounts/{accountId}/connectors/data/clarity/state.json
```

- If `accounts[].status == "connected"` → **Path A is active**. Skip Step 5 (token generation) and Step 6b (token-based curl test). Go directly to Step 1 → 4 → 6a.
- If `accounts` is empty / file missing → use the 3-beat handoff:
  > 1. ✅ I've prepared the Clarity install plan and the snippet template.
  > 2. 🙏 You need to do **two things**: (a) one-time OAuth — open Sidebar → Capabilities → Plugins → Shopify (plugin detail page) → scroll down to App Authorization (应用授权) → **Microsoft Clarity** → Connect (~30s); (b) copy the Project ID from Clarity Settings → Overview (~30s, see Step 2).
  > 3. 🚀 Once both are done, I'll inject the snippet, ping the Data Export API to confirm, and the daily report will start including UX data tomorrow morning.

**accountId resolution** (used throughout): scan `~/.accio/accounts/*` — if exactly one directory, use it; otherwise read `accio_account_id` from `project/store-config.json` and fail loudly if multiple accounts exist without that field set.

### Step 1 — 👤 User creates Clarity account + project

URL: https://clarity.microsoft.com

Login with Microsoft / Google / Facebook. Then:
1. Click **+ New project**
2. **Name**: same as store name
3. **Website URL**: your storefront URL (e.g. `your-store.myshopify.com`)
4. **Website industry**: select **Retail**
   - ⚠ The dropdown does **not** have an "Online Shopping / E-commerce" option. The closest match for a Shopify store is **Retail** — use it.
   - Other options in the list (verified Apr 2026): Adult & Gambling, Autos, B2B Services, B2C Services, CPG, Careers & Education, Community/Social/Charitable Groups, Entertainment, Financial Services & Insurance, Government, Health & Wellness, Real Estate, Restaurants & Food, **Retail** ✅, Science/Social Science & Others, Technology & Telecommunications, Travel & Transportation, Other.
5. Click **Add new project**

### Step 2 — 👤 User provides Project ID

> ⚠ Required for both Path A and Path B — the Connector does NOT replace this step (the storefront snippet needs the Project ID to load `clarity.ms/tag/{id}`).

**Official path** (verified against Clarity dashboard UI Apr 2026):

> Clarity dashboard → left sidebar → **Settings** → **Overview** tab (the default tab that opens) → **Project ID** is shown at the top of the page with a **Copy icon** next to it (one click)

Project ID is 10 alphanumeric chars (e.g. `wf1nvkqko4` — example only, use your own).

❌ **Don't tell the user "look at the URL"** — that's lazy and error-prone. The Settings → Overview Copy button is the canonical UX. Always direct users there.

❌ **Don't tell the user "Settings → Setup"** — Setup is a separate left-sidebar item used for the install code snippet, not the Project ID. The Project ID lives on the **Overview** page.

⚠ Alternative fallback (only if user can't find Settings → Overview):
The URL `https://clarity.microsoft.com/projects/view/{PROJECT_ID}/dashboard` contains the same Project ID, but never lead with this — it's a fallback, not the recommended path.

### Step 3 — 🤖 Agent injects Clarity script

In `snippets/analytics-snippet.liquid`, set:
```liquid
{%- assign clarity_id = 'xxxxxxxxxx' -%}  {# Replace with your 10-char Clarity Project ID #}
```

The snippet template already has the Clarity script ready (wrapped in `{%- if clarity_id != '' -%}`).

Update the snippet via PUT assets.json (see reference 02).

### Step 4 — 🤖 Agent verifies install

```bash
curl -s "https://{store-domain}" | grep -c "clarity.ms/tag"
```

Expected: ≥ 1 occurrence.

Then tell user to wait 1-2 hours for Clarity dashboard to populate first sessions.

### Step 5 — 👤 (Path B fallback only) User generates Data Export API Token manually

> 🟢 **Skip this entire step if Clarity Connector is connected** (Step 0 confirmed).

Use this only when:
- The user's Accio Work installation does not have the Clarity Connector available, OR
- The user is on a self-hosted setup (see [99-fallback-self-hosted.md](99-fallback-self-hosted.md)), OR
- The Connector authorisation is broken and the user wants to keep the daily report running while they fix it.

**Official path** (verified against Microsoft Learn docs Nov 2024):

> Clarity dashboard → **Settings → Data Export** → click **Generate new API token** → name it "Daily Report" → **Copy** the token immediately ⚠

The token is a **JWT that never expires** (but check `exp` claim — can be > 50 years out).

⚠ **Token is shown only once after generation** — if user misses the copy, they need to generate a new one (old one stays valid but they don't have it).

Then write the token into `project/store-config.json`:
```json
"clarity": {
  "project_id": "wf1nvkqko4",
  "api_token": "eyJhbGciOi...",
  "use_connector": false
}
```
Setting `use_connector: false` short-circuits the Connector probe and goes straight to the token path on every run.

### Step 6 — 🤖 Agent tests the Data Export pipeline

#### Step 6a — Path A (Connector)

The agent tests via the same code path the daily report uses, so a green here guarantees a green tomorrow morning:

```bash
python3 scripts/check_health.py
```

Expected output (Connector path):
```
=== 2. Microsoft Clarity ===
✅ Clarity Connector  connected as <user-email>
✅ Clarity API        N metrics returned via MCP: Traffic, RageClickCount, …
```

Under the hood `check_health.py` (and the daily `fetch_clarity.py`) spawn:
```bash
npx -y @microsoft/clarity-mcp-server --clarity_api_token=<connector-managed-token>
```
…and call the MCP tool `project-live-insights`. Cold start ~5–10s; cached afterwards.

#### Step 6b — Path B (manual token, fallback)

Equivalent direct API call — only run when Path A is disabled:
```bash
curl -s -H "Authorization: Bearer {JWT_TOKEN}" \
  "https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=1"
```

Returns JSON with metrics: `human_sessions`, `rage_clicks`, `dead_clicks`, `quick_backs`, `js_errors`, `excessive_scroll`, top pages, devices, countries, browsers, etc.

⚠ **Rate limit: 10 calls/day per project — shared across both paths.** Daily report uses 1; `check_health.py` uses 1. Stay under 8 manual calls/day to leave headroom.

## Daily report integration

Clarity provides the bulk of UX/traffic data:

| Section | Clarity field |
|---|---|
| Human sessions | `human_sessions` |
| Country breakdown | `country_pages` |
| Device breakdown | `device_pages` |
| Browser breakdown | `browser_pages` |
| Top pages | `popular_pages` |
| Referrers | `referrer_pages` |
| Engagement time | `engagement_time` (seconds, avg) |
| Scroll depth | `scroll_depth` (% avg) |
| **5 frustration signals** | `rage_clicks`, `dead_clicks`, `quick_backs`, `js_errors`, `excessive_scroll` |

## ⚠ Critical UX rule for the report

Every Clarity term needs **plain-language translation** in the report. Founders are not analysts. See `07-report-design-principles.md`.

## Recording filter URLs (DO NOT pre-construct)

Clarity URL filter parameters are **unreliable** — they often look like they work but don't apply.

❌ **Don't** generate URLs like:
```
/impressions?Filter=%5B%7B%22key%22%3A%22RageClick%22...%5D
```

✅ **Do** give the base URL + tell the user the filter field name to add manually:
```
👉 https://clarity.microsoft.com/projects/view/{id}/impressions

Then in the Filter area, add: "Rage clicks" → set ≥ 1
```

## Common pitfalls

- **No data after 24h**: Confirm script tag is in `<head>`, not `<body>` — sometimes themes inject in wrong place. Re-check snippet placement.
- **Cookie consent blocks Clarity**: If the store has GDPR cookie banner that defaults to "deny analytics", Clarity won't record until accept. Match consent strategy with the data you want.
- **API rate limit hit**: Schedule report to run 1x/day max. If user wants real-time, use Clarity dashboard directly. Connector and manual-token paths share the same 10/day quota.
- **Connector connected but report says "no Clarity data"**: Check `clarity.project_id` is filled in `store-config.json`. The Connector only manages the Data Export token; the storefront snippet still needs the Project ID separately.
- **Connector OAuth expired**: Don't ask the user for a new token — send them back to Sidebar → Capabilities → Plugins → Shopify → Connectors → Microsoft Clarity → Reconnect. Manual token generation (Step 5) is for Path B only.
