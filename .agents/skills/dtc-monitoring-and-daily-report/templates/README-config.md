# Templates — Configuration & Deployment

This folder holds the **starter files** the agent copies into the user's project during install.

| File | Where it goes | Used for |
|---|---|---|
| `store-config.example.json` | `project/store-config.json` (the user edits this one) | Per-store config: domain, optional 3rd-party tokens, language, reports dir |
| `scripts/*.py` | `project/scripts/*.py` (copied as-is) | Daily report orchestrator + per-source fetchers + renderer |
| `analytics_snippet_template.liquid` | Theme as `snippets/analytics-snippet.liquid` (uploaded via `shopify-use-shopify-cli`) | Page-level tracking codes (Clarity / Pixels) |
| `sample-report-mvp.md` / `sample-report-mature.md` | **Internal schema reference for the agent and plugin developers** — never inlined into user chat (always English; users see real reports in their own language via `render_report.py`'s i18n) | Template preview for developers |

---

## 1. `store-config.json` — the only file the user edits

**Authentication is NOT in this file.** Both **Shopify** and **Microsoft Clarity** auth live in Accio Work Connectors (`Sidebar → Capabilities → Plugins → Shopify (plugin detail page) → scroll down to App Authorization (应用授权) → Shopify Store Auth (Shopify店铺授权)` and `… → Microsoft Clarity`), not here. There is no `client_id`, no `shpat_*` token, no `client_secret` to paste; the Clarity Data Export JWT is also Connector-managed by default. The optional `clarity.api_token` field below is **only** used when the Clarity Connector is unavailable or the user has chosen to self-host their token.

Fields:

| Field | Where to get it | Required? |
|---|---|---|
| `shop_domain` | The `*.myshopify.com` permanent domain | ✅ |
| `shop_timezone` | `"auto"` (recommended) — pulled from `shop.ianaTimezone` at runtime; or any IANA tz like `America/Los_Angeles` to override | ✅ |
| `shop_currency` | `"auto"` — pulled from `shop.currencyCode`; or any ISO-4217 code to override | ✅ |
| `language` | `"auto"` (seed only — replaced at cron creation by the resolved `<effective>` language), OR a concrete code **inside the effective whitelist** (currently `"en"`, `"zh"`, `"es"`, `"pt"`, `"fr"`, `"de"`, `"ja"`, `"ko"`, or `"it"`; whitelist = `resources/i18n.json` locales ∩ `render_report.py` STRINGS keys). **The agent MUST overwrite `"auto"` with the `<effective>` code (= user input language if whitelisted, else `defaultLocale` from i18n.json — currently `en`) before creating the daily cron.** Out-of-whitelist values get force-downgraded to `en` by `render_report.py`'s final-line safety net, which causes a split between the report Markdown and the agent chat summary if not pre-resolved. NOT the shop locale, NOT the storefront language. | ✅ |
| `clarity.project_id` | Clarity → Settings → Overview → Project ID | ⚠️ Optional — required for the storefront `<head>` snippet AND for any Clarity API call (Connector cannot supply this; it is the public site identifier baked into the theme) |
| `clarity.use_connector` | `true` (default) → fetch via Accio Work Clarity Connector; `false` → force the manual token path | ⚠️ Optional · default `true` |
| `clarity.api_token` | Clarity → Settings → Data Export → Generate (shown once) | ⚠️ Optional · **only used when Connector is not connected or `use_connector: false`** |
| `accio_account_id` | Numeric account directory under `~/.accio/accounts/`. Auto-detected when only one exists; required when multiple. | ⚠️ Optional (top-level) |
| `judgeme` | Nothing to configure — review summary is auto-read from Shopify shop metafields when the Judge.me app is installed | ⚠️ Optional · no token |
| `notifications.slack_webhook` / `notifications.email_to` | Push targets (email is delegated to `gmail-assistant`) | ⚠️ Optional |
| `reports_dir` | Where reports are written (default `project/daily-reports`) | ✅ |

**Optional sections gracefully degrade** — any source whose tokens are `null` is skipped, and that section in the report shows "not yet configured" rather than crashing the run.

---

## 2. Run the report

After install, the agent does:

```bash
mkdir -p project/scripts project/daily-reports
cp templates/scripts/*.py project/scripts/
cp templates/store-config.example.json project/store-config.json
# ... agent or user fills in tokens in project/store-config.json ...

# Dry-run with mock data (no API calls — useful before tokens are filled)
python3 project/scripts/daily_report.py --mock

# Real run
python3 project/scripts/daily_report.py
# Output: project/daily-reports/YYYY-MM-DD.md  (yesterday's date, in the store's timezone)
```

---

## 3. Schedule daily (agent-triggered + language-snapshotted)

Use the agent's `cron` tool — **NEVER hardcode an absolute path**, and **NEVER use `payload.kind: "command"`** for the store-patrol job. The trigger MUST be `kind: "agent"` so each run re-enters the agent loop (Connector-aware auth, error diagnosis, follow-up actions). Different users will install in different workspaces.

**Before** calling `cron add`, the agent MUST:
1. **Detect** the user's input language from the current session (`<detected>`, e.g. `zh` if Chinese chars dominate, `en` otherwise; extend as more locales become supported).
2. **Resolve** against the effective whitelist: `whitelist = i18n.json locales ∩ render_report.py STRINGS keys` (currently `{"en", "zh", "es", "pt", "fr", "de", "ja", "ko", "it"}`). `<effective> = <detected> if <detected> in whitelist else "en"` (i18n.json `defaultLocale`). When falling back, tell the user once in their language that the report will render in English until that locale is added.
3. **Edit** `project/store-config.json` → set `language` to `<effective>` (overwriting any `"auto"`).
4. **Embed** `<effective>` into the cron payload's `message`, and write the message itself in that language. Both the rendered report (driven by `cfg["language"]`) and the agent's chat-side run summary (driven by the payload message) will then come back in the user's effective language — no split.

```javascript
// Example shown with effective = "zh". When effective = "en" (either because the user
// wrote in English OR because their language was out of the whitelist and got
// force-downgraded), rewrite the whole message in English.
cron({
  action: "add",
  name: "Daily Store Patrol Report",
  schedule: { kind: "cron", expr: "0 9 * * *", tz: "{shop.ianaTimezone}" },  // ← read from store-config, not hardcoded
  payload: {
    kind: "agent",
    message: "执行今日店铺巡检（输出语种 zh，已通过 i18n 白名单校验并与 store-config.json language 字段一致）：运行 project/scripts/daily_report.py 生成最新日报，校验 project/daily-reports/YYYY-MM-DD.md 已生成且 > 1KB，用 zh 摘要 KPI 一行汇报；若失败请按 README-config 故障表诊断并用 zh 简短报告。Do NOT silently fail. Do NOT switch language mid-report."
  }
})
```

> ⚠️ Do NOT replace this with `payload: { kind: "command", command: "cd ${WORKSPACE} && python3 project/scripts/daily_report.py" }`. A raw shell cron has no Connector access and no recovery path when Shopify / Clarity tokens rotate.

> ⚠️ Do NOT leave `store-config.json` → `language` as `"auto"` after the cron is created. `"auto"` falls back to `en`, which silently overrides the founder's real language preference.

> ℹ️ If the user later starts talking in a different language, the agent should offer to update both `store-config.json` → `language` and the cron payload (`cron update`) so the next day's report follows the new language.

Recommended time: **09:00 in the store's local timezone** — the merchant gets a fresh report when their work day starts.

---

## 4. `analytics_snippet_template.liquid`

The agent installs this to the theme as `snippets/analytics-snippet.liquid`. Prefer local theme pull/check/push when available; if this automation needs a narrow Admin GraphQL fallback, use **`themeFilesUpsert`** through `shopify-use-shopify-cli` after reading the current files. **Never** use `curl -X PUT .../themes/{id}/assets.json` — the plugin's AGENTS.md forbids it.

Configure by setting variables at the top of the snippet:

```liquid
{%- assign clarity_id      = 'xxxxxxxxxx'    -%}  ← from Clarity Settings → Overview
{%- assign fb_pixel_id     = ''              -%}  ← leave empty if not used
{%- assign tiktok_pixel_id = ''              -%}
```

Empty string = that script does not load. To add a new tracker (Hotjar / Klaviyo / etc.) edit only this file.

This snippet handles **page-level tracking** only.

---

## 5. Validation

After install, run:

```bash
python3 scripts/check_health.py --config project/store-config.json
```

Expected output (with all 3 trackers wired):

```
✅ Shopify shop probe        name='...', tz='...', currency='...', plan='...'
✅ Clarity API               N metrics returned
✅ Judge.me metafields       N reviews total (read from shop.metafields.judgeme)
✅ Snippet file in theme     snippets/analytics-snippet.liquid exists [Clarity ✓]
✅ Clarity script in HTML    found clarity.ms/tag
```

Skipped tokens show as ⚠️ (warning, not failure). Cookie-consent gated stores will downgrade the storefront-HTML check to ⚠️ but the theme-file check stays ✅ — both are normal.

---

## Common gotchas

| Symptom | Cause | Fix |
|---|---|---|
| `daily_report.py` exits with "Cannot reach Shopify" | Connector disconnected / token expired | Reconnect: Sidebar → Capabilities → Plugins → Shopify (plugin detail page) → scroll down to App Authorization (应用授权) → Shopify Store Auth (Shopify店铺授权) |
| Report missing Clarity section, Connector shows ✅ in `check_health.py` | `clarity.project_id` is `null` — Connector supplies the JWT but cannot supply the project identifier | Fill in `clarity.project_id` from Clarity → Settings → Overview |
| Report missing Clarity section, Connector shows ⚠️ disconnected | Connector not yet authorized AND no `clarity.api_token` set | Connect via Sidebar → Capabilities → Plugins → Shopify → Connectors → Microsoft Clarity, OR paste a Data Export token into `clarity.api_token` |
| Clarity API 401 | Token expired or wrong scope | If using Connector — reconnect; if using `api_token` — regenerate at Clarity → Settings → Data Export (shown once) |
| Clarity API 429 | Rate-limited (10 calls/day/project cap — applies to BOTH Connector and self-hosted token paths) | Reduce report frequency or wait until tomorrow; the Connector does NOT bypass this upstream limit |
| Judge.me reviews show "0" but you have reviews | Free plan only exposes count, not full list | Upgrade to a paid plan for `/reviews` endpoint |
| Cron fired but no report file | Used absolute path that doesn't exist on this machine | Use `${WORKSPACE}` + relative path in cron command |
| Two reports per day | Cron added twice | `cron list` → remove the duplicate |
