---
name: dtc-monitoring-and-daily-report
description: Set up Shopify store monitoring from zero — Microsoft Clarity, optional Judge.me, and an optional memory-gated social Campaign patrol — then schedule a daily Markdown digest with KPIs, UX health, new-product Campaign recommendations, and confirmed social action states. Use when the user wants store monitoring, a daily report, or scheduled new-product social recommendations. Not for one-off page CRO, paid ads, or SEO edits.
---

# Shopify Monitoring & Daily Report

## 🚨 Hard Rules (read first, violations cause incidents)

1. **Rule 1 — Minimize user burden**: Always label every step with 🤖 **Agent does**, 👤 **User must do**, or 👤 **User must provide**. Never push work back to the user that the agent can do via API.
   | Symbol | Who does it | Examples |
   |---|---|---|
   | 🤖 **Agent does** | Agent runs `shopify store execute` / writes files | API calls, theme edits, schedule setup |
   | 👤 **User must do** | Hard merchant-only barrier | App install OAuth, App Embed toggle |
   | 👤 **User must provide** | One-time credential / ID hand-off | Project ID, Tokens |
2. **Rule 2 — Verify SaaS URLs**: Deep paths to 3rd-party settings MUST be `web_search`-verified before being shown. Annotate verification dates in reference files.
3. **Rule 3 — Internal model vs External presentation**: Never leak raw scores or internal maturity metrics.
   | Layer | Used for | NEVER show user |
   |---|---|---|
   | **Internal model** | Decisions, scoring, branching | Raw scores, "MVP-tier", "store maturity = 3/10" |
   | **External presentation** | What the user reads | Plain business language, no jargon |
4. **Rule 4 — Use the 3-beat handoff**: Every request for user input MUST include: (1) what I already did, (2) what I need from you, and (3) what happens next. (Reference: `references/00-stage0-opening-script.md`)

Build a complete monitoring stack for a Shopify store from zero, then automate a daily Markdown report. **Designed to minimize the user's operational burden** — the agent handles all Shopify Admin work via the plugin's existing skill chain; the user only does what is technically merchant-only (App install OAuth, Custom Pixel paste, App Embed toggle).

## When to use

- Install reviews / heatmap / analytics tools on a Shopify store
- Build a daily dashboard or report
- Monitor store metrics automatically
- Understand UX / conversion problems with data
- Get scheduled email / Slack alerts about store health

**Do NOT use for**: one-off page conversion fixes (use `optimize-ecommerce-page-conversion`), ad campaign optimization (use `ecommerce-marketing`), SEO audits (use `ecommerce-seo-optimizer`), or generic Shopify store building (use `dtc-builder`).

---

## How this skill collaborates with the plugin (read first)

This skill is the **orchestration layer**. It does NOT re-implement Shopify auth, GraphQL, or Liquid editing — those are owned by other plugin skills. **Always delegate**:

| What you need to do | Delegate to | Never do this instead |
|---|---|---|
| Authenticate to Shopify | **Accio Work Connector** (Sidebar → Capabilities → Plugins → Shopify (plugin detail page) → scroll down to App Authorization (应用授权) → Shopify Store Auth (Shopify店铺授权)) | ❌ Custom App + `client_credentials` token exchange <br>❌ Manual `shpat_*` token handling |
| Authenticate to Microsoft Clarity (Data Export API) | **Accio Work Connector** (Sidebar → Capabilities → Plugins → Shopify → Connectors → Microsoft Clarity) — single login spawns the local `@microsoft/clarity-mcp-server`. Falls back to manual `CLARITY_API_TOKEN` only when Connector is unavailable. | ❌ Asking user to paste a JWT token when Connector is connected <br>❌ Re-implementing Clarity REST against `data-export.clarity.microsoft.com` with hand-managed tokens |
| Read Shopify data (orders, products, shop info) | `shopify-admin` (validate GraphQL) → `shopify-use-shopify-cli` (`shopify store execute --query '...'`) | ❌ `curl https://{store}/admin/api/...` <br>❌ Direct REST against `/admin/api/{version}/orders.json` |
| Write Shopify data (metafields, small known theme snippet fallback, etc.) | `shopify-admin` → `shopify-use-shopify-cli` with `--allow-mutations` only for narrow, pre-read files (e.g. analytics snippet fallback `themeFilesUpsert`) | ❌ `curl -X PUT .../themes/{id}/assets.json` |
| Author Liquid snippets / sections | `shopify-liquid` for syntax + patterns; commit via `shopify-use-shopify-cli` | ❌ Hand-roll Liquid without consulting `shopify-liquid` |
| Send the report by email | `gmail-assistant` skill (already in plugin) | ❌ Hand-roll a Python `smtplib` / Gmail API integration |
| Schedule the report | Built-in `cron` tool with relative paths | ❌ Hardcoded absolute `/Users/...` paths |
| Detect newly eligible products | `shopify-new-product-monitor` + `evaluate_growth_triggers.py` | ❌ Let a model infer whether a product is new |
| Recommend a seven-day Campaign | `shopify-social-campaign`, only for `campaign_recommendation.matched == true` | ❌ Treat the recommendation as a social action or publish consent |
| Create and publish social content | `shopify-marketing` social track, only after draft activation and exact-content confirmation | ❌ Auto-publish from the patrol |

**Hard rule — the only supported Shopify API path** in this skill is the `shopify-admin` + `shopify-use-shopify-cli` chain. Any time a step needs Shopify data or a narrow analytics snippet fallback write, the answer is a `shopify store execute` invocation, never curl/REST/raw token. Full theme decoration / banner / section / template work is outside this skill: send the business outcome and evidence to `shopify-theme-decorator`, which independently selects its skill-backed discovery, write, and verification path. The Python report scripts shell out to `shopify` CLI for the same reason — they do not hold or refresh tokens themselves.

**Hard rule — long-lived 3rd-party tokens go through Accio Work Connectors.** Currently managed: **Shopify** + **Microsoft Clarity**. When a Connector is registered (check `~/.accio/accounts/<id>/connectors/data/<service>/state.json`), the agent MUST use the Connector flow first and only fall back to a hand-pasted token when the Connector is unavailable or the user has explicitly opted out. Never ask the user to paste a Clarity JWT or a Shopify access token if the Connector can supply it. The fetch script (`templates/scripts/fetch_clarity.py`) implements the dual-path internally — Connector first, token fallback — so callers only set `clarity.use_connector: true` (default) in `store-config.json`.

---

## 5-Stage Roadmap

```
Stage 0  Discovery & Goals      → Self-introduce + default path (no interrogation)
Stage 1  Foundation              → Confirm Shopify auth via Connector
Stage 2  Eyes (Tools)            → Microsoft Clarity
Stage 2.5 Reviews (opt-in)       → Judge.me, only when ≥ 50 orders/month
Stage 3  Brain (Report Script)   → Configure & test daily report
Stage 3.5 Social Patrol (opt-in) → New-product Campaign recommendations
Stage 4  Heartbeat (Automation)  → Cron schedule + (optional) email push
Stage 5  Iterate                 → Add metrics as the store grows
```

Always announce the stage entered, and check off completed stages with the user before moving on.

---

## Stage 0 — Self-introduce & set default path

🚨 **Do NOT open with "let me ask you 3 questions"** — the user came because they don't know what to ask. Lead with what you'll build.

The opening message has 4 beats: (1) what I'll build, (2) what the daily report will contain, (3) cost & time (numbers from `references/00-verified-urls.md` so they stay current), (4) the default route + 4 specific opt-out signals.

**Full opening script template, opt-out variants in both languages, language-matching rules, and the rule against inlining sample report files** — see [`references/00-stage0-opening-script.md`](references/00-stage0-opening-script.md).

After the user gives any "go" signal, **do not ask more questions**. Profile silently from context (Connector status, `shop.json`, installed apps, MEMORY) and ask only when technically required.

---

## Stage 1 — Foundation: Confirm Shopify auth

This skill assumes Shopify is connected via the Accio Work Connector. **No Custom App, no token exchange, no `shpat_*` handling.**

### Step 1.0 — 🤖 Agent does: Confirm Connector is connected

Decision tree:
- MEMORY already shows the Shopify Connector is linked for this store → ✅ skip to Stage 2
- User hasn't connected yet → guide through the 3-step Connector flow (`Sidebar → Capabilities → Plugins → Shopify (plugin detail page) → scroll down to App Authorization (应用授权) → Shopify Store Auth (Shopify店铺授权) Store Auth (Shopify店铺授权) → Connect`); language-match the user's first message
- User can't find the Connector entry → ask for a screenshot, then escalate to [`references/99-fallback-self-hosted.md`](references/99-fallback-self-hosted.md) (Custom App fallback, NON-Accio-Work users only)

Load `aw-shopify-oauth` and inspect the current Connector grant before reading store data. Order KPIs require the optional `read_orders` scope; it is not part of the default grant. If it is missing, follow that Skill's scope-expansion flow before running the report. Read-only monitoring does not require `write_orders` or `read_all_orders`.

### Step 1.1 — 🤖 Agent does: Verify access via `shopify store execute`

Validate via `shopify-admin` first, then run via `shopify-use-shopify-cli`. Minimal sanity probe (a `shop` query) — this confirms the Connector is wired correctly before any further work:

```bash
shopify store execute --store {DOMAIN} -j --no-color \
  --query 'query { shop { name primaryDomain { url } ianaTimezone currencyCode } }'
```

Persist `shop.ianaTimezone` and `shop.currencyCode` to `project/store-config.json` — the report scripts read these at runtime instead of hardcoding.

### Step 1.2 — 🤖 Agent does: Inject the unified analytics snippet

Inject `templates/analytics_snippet_template.liquid` as `snippets/analytics-snippet.liquid`, then add a single `{%- render 'analytics-snippet' -%}` line to `theme.liquid`. Prefer the normal local theme pull/check/push workflow when available. If this automation must use Admin GraphQL, `themeFilesUpsert` is allowed only as a narrow, pre-read snippet fallback, not as a general theme-decoration pattern. This becomes the unified container for Clarity / FB Pixel / TikTok Pixel injection later.

Implementation pattern: see [`references/02-analytics-snippet-pattern.md`](references/02-analytics-snippet-pattern.md). Both file uploads MUST go through `shopify-use-shopify-cli` — no curl.

> **Detect partial-install state before re-running this step.** If `snippets/analytics-snippet.liquid` already exists in the theme, read it first and check for an existing Clarity Project ID. Common partial state: Pixel injected but the Clarity Data Export token is missing — in that case skip Pixel injection and resume from the token-fetch step in [`references/04-install-clarity.md`](references/04-install-clarity.md).

---

## Stage 2 — Eyes: Data Foundation (Clarity, ~5 min)

> **Why Judge.me is NOT in Stage 2**: Reviews data only becomes meaningful once a store has actual customers (rule of thumb: ≥ 50 orders/month). Defer to Stage 2.5.

### 2A — Microsoft Clarity (UX heatmap & session recordings)

Reference: [`references/04-install-clarity.md`](references/04-install-clarity.md)

| Step | Who | What |
|---|---|---|
| 1 | 👤 | Sign up at clarity.microsoft.com, create Project for the store |
| 2 | 👤 must provide | Project ID — left sidebar **Settings → Overview** tab → **Project ID** at top of page (Copy icon). Note: the create-project dialog has no "E-commerce" option — pick **Retail** for Website industry. |
| 3 | 👤 must provide | Data Export API Token — Settings → Data Export → Generate (shown only once) |
| 4 | 🤖 | Edit `analytics-snippet.liquid` → set `clarity_id` variable; upload via `shopify-use-shopify-cli` |
| 5 | 🤖 | Verify by curl-ing storefront and grepping for `clarity.ms/tag` |

**API rate limit**: Clarity Data Export API allows only **10 calls/day** — daily report calls max 1-2 times.

---

## Stage 2.5 — Reviews System (opt-in, conditional)

**Default behavior**: SKIP on first install. Trigger only when ≥ 1 fires:
- User explicitly says "install Judge.me / set up reviews"
- Store crosses **≥ 50 orders/month** (agent detects via a Shopify order-count query in Stage 4 weekly check)
- Store has ≥ 10 reviews collected via another channel (Trustpilot / Etsy / etc.)

### Pre-flight check (before any install)

Run the order-count query, and if `< 50` proactively recommend deferral:

> "Your store has X orders in the last 30 days. Reviews tools work best with ≥ 50 monthly orders — installing now would put a '0 reviews' badge on every product page, which can lower trust. **My recommendation: skip Judge.me for now, I'll automatically remind you when orders cross 50.** Want to proceed anyway, or wait?"

If `≥ 50`, confirm once: *"You're at X orders/month — good time to add reviews. Install Judge.me now?"*

### Install (only if pre-flight passes)

Reference: [`references/03-install-judgeme.md`](references/03-install-judgeme.md). Workflow: user installs from App Store (OAuth) → user enables App Embed in Theme Editor → agent verifies widget on PDP and confirms review metafields are synced → reviews section auto-appears in the report. **No API token step** — Judge.me syncs its review summary into Shopify shop metafields (namespace `judgeme`), which the report reads via the same Connector.

**Free vs Paid**: Free tier already syncs review count/average into Shopify metafields, which is all the daily report needs. Paid plans add branding and advanced settings — verify current pricing via web_search before quoting numbers.

---

## Stage 3 — Brain: Configure & Test the Daily Report

### 3.1 — 🤖 Agent does: Initialise scripts and config

```bash
mkdir -p project/scripts project/daily-reports
cp templates/scripts/*.py project/scripts/
cp templates/store-config.example.json project/store-config.json
```

Edit `project/store-config.json` (NOT the scripts) and fill in:
- `shop_domain` (e.g. `your-shop.myshopify.com`)
- `clarity` → `project_id`, `api_token` (or `null` to skip)
- `judgeme` → nothing to configure; reviews are read from Shopify metafields if the Judge.me app is installed (auto-skipped otherwise)
- `language` (auto-detected from user's locale; defaults to `en`)

Timezone and currency are pulled at runtime from Shopify (`shop.ianaTimezone`, `shop.currencyCode`) — no hardcoded `+8` / `USD`. API version comes from `templates/scripts/api_version.py` (one-line constant, reviewed per release).

### 3.2 — 🤖 Agent does: Dry-run mock first

Before the user has fully wired Clarity / Judge.me, run a **mock report** so they see the template against their real store identity (only `shop.json` is queried — all other sections show "N/A — not yet configured"):

```bash
python3 project/scripts/daily_report.py --mock
```

This converts the install decision from "install blind, then see what you get" to "see the template, then decide what to wire up".

### 3.3 — 🤖 Agent does: Real test run

Once tokens are filled in:

```bash
python3 project/scripts/daily_report.py
```

Each data source is wrapped in its own `try/except` block. If Clarity rate-limits, that section shows "rate-limited — retry in N hours" and the rest of the report still renders. Single-source failures never crash the script.

### 3.4 — Report sections (template defaults)

- **Header**: date (in store timezone), generation timestamp, data sources
- **Core KPIs**: Revenue / Orders / AOV / Active Products (always — Shopify Connector); Sessions / CVR (when Clarity is configured, CVR is computed as Shopify paid orders ÷ Clarity human sessions — a trend approximation, not a channel-accurate figure) — each with 🟢🟡🔴 health badge
- **Traffic profile** (Clarity Data Export): Country / Device / Browser / Top 5 pages / Referrers
- **UX health** (Clarity Data Export): Rage Clicks / Dead Clicks / Quick Backs / JS Errors / Excessive Scroll — **with plain-language explanations inline**
- **Reviews**: rendered only when Judge.me is configured (Stage 2.5)
- **Today's insights**: rule-engine-generated observations
- **Social Campaign patrol**: deterministic new-product and optional Campaign decisions, report-safe recommendation cards, and social action states; never generated captions or Connector payloads
- **Single recommended action for today** (not a list of 10)
- **Direct links**: store, Shopify Admin, Clarity, Judge.me — all built from `store-config.json`

Internal schema references (English-only, **agent/developer-facing — do NOT inline into chat**): `templates/sample-report-mvp.md` (free tier) and `templates/sample-report-mature.md` (with Judge.me). Use them to understand the expected output shape; describe the report to users in their own language instead.

### 3.5 — 🤖 Agent does: Run the optional social patrol

Copy `patrol_store.py`, `evaluate_growth_triggers.py`, and `shopify-marketing/scripts/social_publish_preflight.py` into `project/scripts/` with the report scripts when social actions are enabled. The evaluator owns only `new_product` and `campaign_recommendation`; it never generates content. Pass every matched recommendation request to `shopify-social-campaign`, then include only validated report-safe recommendation fields in `--growth-result`.

- `matched=false`: create no recommendation.
- `matched=null`: report unknown and create nothing.
- `start_draft`: authorize drafts only; require a successful `campaign create` receipt before reporting durable `planned` slots, then load the `shopify-marketing` social track for content.
- Commit the product cursor only after the recommendation or materialized social candidate is durable.
- No scheduled run may publish. Every social action needs deterministic preflight plus the current exact `payload_hash` confirmation. Never report `scheduled` or promise a reminder from a proposed timestamp alone.
- Treat patrol status reads as observation only. Publishing uses the execution ID and lease returned by `action begin`; only explicit recovery may fail an expired lease, and the same execution ID must heartbeat/finish the action.

---

## Stage 4 — Heartbeat: Automation (5 min)

### 4.1 — 🤖 Agent does: Schedule daily cron (agent-triggered)

**Hard rule A — store-patrol cron MUST use `payload.kind: "agent"`, NEVER `kind: "command"`.**

The scheduled store-patrol / 巡店 daily report is **agent-triggered**, not tool-/command-triggered. Every fire re-enters the agent loop so the run inherits Connector auth (Shopify + Microsoft Clarity), skill routing, error diagnosis, and a follow-up window for next-step actions. A raw shell cron has none of these — when a Connector token rotates or the report shows a structural issue, a `kind: "command"` job fails silently with no traceable agent log.

**Hard rule B — report copy language MUST follow the user's input language, constrained to the plugin's i18n whitelist (snapshot at cron creation; out-of-range falls back to `en`).**

The daily report's user-facing copy (KPI labels, plain-language glosses, section headers, UX-issue descriptions, and the agent's chat-side run summary) MUST be rendered in the user's input language **if and only if** that language is in the **effective whitelist**:

> **Effective whitelist = `resources/i18n.json` locales ∩ `render_report.py` STRINGS keys.**
>
> Both layers must support the locale, because i18n.json only governs the plugin's metadata/labels surface, while `render_report.py` governs the actual report Markdown. As of the latest version both layers support `en` and `zh`; any other user input language (e.g. `ja`, `de`, `es`) is **out of range** and MUST fall back to `en` until the whitelist is extended.
>
> Default locale (and out-of-range fallback) = `resources/i18n.json` → `defaultLocale` (currently `en`).

Operational steps the agent runs when creating the cron:

1. **Detect** the user's input language at the moment the cron is created (read the user's latest message — Chinese chars dominate → `zh`, otherwise classify by script/keywords). Call the detected code `<detected>`.
2. **Resolve against the whitelist** to get `<effective>`:
   - Read `resources/i18n.json` and gather the union of locale codes across `entries` (currently `{en, zh, es, pt, fr, de, ja, ko, it}`).
   - Read `render_report.py` STRINGS top-level keys (currently `{en, zh, es, pt, fr, de, ja, ko, it}`).
   - `whitelist = i18n_locales ∩ STRINGS_keys`. `default = i18n.json.defaultLocale` (`en`).
   - `<effective> = <detected> if <detected> in whitelist else <default>`.
   - When falling back, tell the user once in their input language: "The daily report is not yet localized in `<detected>`, so it will render in English. (To add a locale, extend `render_report.py` STRINGS and `i18n.json` entries.)" — do NOT silently downgrade.
3. **Snapshot** `<effective>` into `project/store-config.json` → `language` field (overwrite any prior value, including `"auto"`). `daily_report.py` and `render_report.py` honor `cfg["language"]`; if the value is somehow out of range at run time the script itself has a final-line fallback to `en`.
4. **Echo `<effective>` in the cron payload's `message`** — both the instructions *to* the agent and the agent's subsequent KPI summary back to the user MUST use that **effective** (rendered) language, NOT the raw `<detected>` language. This guarantees the chat summary matches the actual report Markdown; otherwise the user sees a zh chat ribbon over an en report (or vice-versa).
5. **Re-resolve on language switch.** If a future turn shows the user has switched language, run steps 1–4 again and `cron update` + rewrite `store-config.json` `language`. Same fallback-to-`en` rule applies.

> ⚠️ Do not fall back to `shop.primaryLocale` for the report. The shop locale tracks **shoppers'** language, not the founder's. A US-domain store run by a 中文 founder still needs a 中文 report (when zh is in the whitelist).

Always use the **relative project path**, not absolute — different users will install in different locations:

```javascript
// (a) Detect + whitelist-resolve user input language, snapshot <effective> into store-config.json.
//     Pseudo-step the agent runs in the same turn:
//       detected   = detect_user_input_language(latest_user_message)            // e.g. "zh" / "en" / "ja"
//       whitelist  = i18n_json_locales ∩ render_report_STRINGS_keys             // currently {"en","zh","es","pt","fr","de","ja","ko","it"}
//       effective  = detected if detected in whitelist else "en"                // out-of-range → en
//       edit  project/store-config.json  →  "language": "<effective>"
//
// (b) Create the cron with the SAME <effective> language embedded.
cron({
  action: "add",
  name: "Daily Store Patrol Report",
  schedule: { kind: "cron", expr: "0 9 * * *", tz: "{shop.ianaTimezone from store-config.json}" },
  payload: {
    kind: "agent",
    // Example shown with effective = "zh". For effective = "en" rewrite the whole message in English.
    // Critical: the language tag inside the message MUST equal store-config.json language,
    // and the agent's chat summary on each run MUST use the same language.
    message: "执行今日店铺巡检（输出语种 = zh，已与 store-config.json language 字段一致；若 zh 不在白名单则改用 en）：(1) 运行 `project/scripts/daily_report.py` 生成最新日报；(2) 校验输出文件 `project/daily-reports/YYYY-MM-DD.md` 存在且 > 1KB；(3) 用 zh 摘要今日 KPI（订单数 / 会话数 / CVR / Clarity UX 异常项）一行汇报；(4) 若脚本失败，按 `references/04-install-clarity.md` 与 `templates/README-config.md` 的故障排查表诊断原因（Connector 失效 / Clarity 配额耗尽 / store-config 缺字段等）并用 zh 简短报告。Do NOT silently fail. Do NOT switch language mid-report."
  }
})
```

> 🌐 **EN-effective variant** — when `<effective>` is `en` (either because the user wrote in English OR because the user's language was out of whitelist), the entire payload `message` (and the agent's later chat summary) must be in English. Replace the zh string above with its English equivalent.

> ⚠️ **Forbidden alternative (A)** — do NOT use `payload: { kind: "command", command: "cd ${WORKSPACE} && python3 project/scripts/daily_report.py" }`. A pure shell cron cannot see the Accio Work Connector store, cannot recover from token rotation, and cannot continue the chain (e.g. trigger an email push via `gmail-assistant` when KPI thresholds break). The script itself stays the same — only the **trigger** changes from tool to agent.

> ⚠️ **Forbidden alternative (B)** — do NOT leave `store-config.json` → `language` as `"auto"` after the cron is created. `"auto"` is only the seed default; once the user has actually spoken, snapshot the concrete `<effective>` code (`en` / `zh` / a future whitelisted locale). Leaving `"auto"` causes `daily_report.py` to default to `en` regardless of who the founder is, which is correct as a tail-end safety net but is NOT a substitute for the snapshot — the cron's chat summary still needs to know the rendered language.

> ⚠️ **Forbidden alternative (C)** — do NOT snapshot `<detected>` directly (skipping the whitelist check). If you write `language: "ja"` while STRINGS only has `en` + `zh`, `render_report.py` silently falls back to `en` for the Markdown, but if the agent chat summary uses `ja` you ship a split-language run. ALWAYS write `<effective>`, not `<detected>`.

> Note: Hard rule A applies ONLY to the **store-patrol** daily-report cron. Downstream secondary crons explicitly designed as agent-mode (e.g. the email-push job in [`references/08-push-notifications.md`](references/08-push-notifications.md)) already follow this pattern. Pure non-store webhooks (e.g. a Slack-only `curl` webhook) may remain `kind: "command"` since they do not touch store data. Hard rule B (language whitelist + fallback) applies to **all** user-facing report copy and agent summaries, no matter which cron triggers them.

Recommended time: **09:00 in the store's local timezone** — fresh report when the merchant starts their day. If the user wants a specific timezone, override `tz`; otherwise use the value persisted from Shopify in Stage 1.

### 4.2 — Verify next run

Wait 30 seconds after `cron add` (the scheduler populates `state.nextRunAtMs` asynchronously), then `cron list` → confirm `state.nextRunAtMs` is populated and < `now + 24h`.

### 4.3 — Optional: Push to email / Slack

**Email** (recommended for solo founders): **delegate to the `gmail-assistant` skill** — do NOT write a custom `email_report.py`. After cron runs, hand the rendered Markdown file to `gmail-assistant` for delivery. Pattern detailed in [`references/08-push-notifications.md`](references/08-push-notifications.md).

**Slack** (for teams): Slack incoming webhook. See same reference.

---

## Stage 5 — Iterate (Ongoing)

| Trigger | Add to report |
|---|---|
| Sessions ≥ 50/day | Begin tracking attribution (which channel converts) |
| Orders ≥ 10/day | Add cart abandonment rate, return rate |
| Inventory issues | Add low-stock alerts |
| Multi-channel (Pinterest/IG live) | Add per-channel CVR breakdown |
| Email list grows | Add Klaviyo/Omnisend metrics |

Each data source is its own script (`fetch_shopify.py`, `fetch_clarity.py`, `fetch_judgeme.py`, etc.) — add or remove without touching the rest. See [`templates/scripts/README.md`](templates/scripts/README.md) for the architecture.

---

## Common pitfalls

1. **Custom Pixel ≠ Web Pixel API.** `webPixelCreate` GraphQL requires App Extension which Custom Apps don't support. Tell the user to paste the Pixel via Settings → Customer events.
2. **App Embed Block toggles are merchant-only.** Even after API installs an App, the user must enable Embed Blocks in the Theme Editor manually. Provide the deep link: `https://admin.shopify.com/store/{store}/themes/{themeId}/editor?context=apps`.
3. **Clarity URL filter parameters are unreliable.** Don't construct `?Filter=...` URLs — give the base `/impressions` URL and tell the user to add filters in the UI.
4. **Free vs paid feature gates** — always tell the user upfront. Verify current pricing via `web_search` (see Hard Rule 2).
5. **Promise truthfulness** — only say "I'll do X" after confirming X is achievable via the plugin's skill chain.
6. **0 orders / 0 sessions ≠ broken pipeline.** When the report shows zeros, identify the structural cause (no custom domain / Shopify Payments not activated / no traffic source live / store < 2 weeks old) and hand off to the relevant sister skill (`shopify-store-optimizer` for domain + payments, `shopify-marketing-launch` for first traffic). Do NOT blame the data tooling, do NOT fake numbers, do NOT show empty `0/0/0` KPI tables daily — use the 0-order edge case template at the bottom of `templates/sample-report-mvp.md`.

---

## File structure & decision tree

The full file tree, a "where to find what" lookup table, and a decision tree for entering the flow at the right stage given partial install state — see [`references/01-skill-layout-and-decision-tree.md`](references/01-skill-layout-and-decision-tree.md).

When in doubt about which stage to start from, read that reference first.

---

## Success criteria — Hard verification gates

The skill has succeeded ONLY when ALL pass. Run `scripts/check_health.py` and confirm:

| # | Gate | How to verify |
|---|---|---|
| 1 | Shopify Connector works | `shopify store execute --store {DOMAIN} --query '{ shop { name } }'` returns 200 with shop name |
| 2 | Clarity Data Export API works | **Preferred path** — Clarity Connector is connected (`connectors/data/clarity/state.json` shows `accounts: [{ status: "connected", ... }]` — empty array OR `status != "connected"` both count as not authorized) AND `fetch_clarity.fetch_insights(use_connector=True)` returns ≥ 1 metric row. **Fallback path acceptable** — `clarity.api_token` set in `store-config.json` AND direct call returns 200. **Skip acceptable** — user opted out of Clarity entirely. |
| 3 | Judge.me metafields readable | `check_health.py` section 3 reads `shop.metafields.judgeme.*` and returns a review count (skipped is normal if the app is not installed) |
| 4 | Theme renders the tracker | `snippets/analytics-snippet.liquid` exists in theme files (validated via `shopify-use-shopify-cli`) AND a real-browser fetch of the homepage shows `clarity.ms/tag` (curl alone is unreliable for stores with cookie consent gates) |
| 5 | At least 1 report exists | `ls project/daily-reports/*.md` returns ≥ 1 file, size > 1KB |
| 6 | Cron is scheduled | After waiting 30s post-add, `cron list` shows job with `nextRunAtMs` < `now + 24h` |

### User-experience gates (qualitative but mandatory)

- ✅ Report opens in any Markdown viewer without errors
- ✅ Every industry term has plain-language definition inline
- ✅ Report ends with a "single recommended action for today" — not a list of 10
- ✅ Total user-required time was ≤ 30 minutes (from "go" signal to first real report)

### Failure protocol

If any technical gate fails:
1. Do NOT mark the skill complete
2. Report which gate failed + exact error
3. Offer remediation (re-auth via Connector / regenerate token / skip the failing tool and continue)
