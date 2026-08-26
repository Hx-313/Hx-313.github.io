<!--
  ⚠️ INTERNAL SCHEMA REFERENCE — NOT USER-FACING ⚠️

  This file is for the agent and plugin developers only.

  - DO NOT cat / inline / quote this file into chat with end users.
  - End users see real reports rendered by `scripts/render_report.py`,
    which honors `language` from `store-config.json` (currently zh / en;
    add more locales by extending `STRINGS` in render_report.py).
  - To describe the report to a user, use the bullets in
    `references/00-stage0-opening-script.md` → "Describe the report"
    and write them in the user's language.

  Hypothetical store used in this sample:
    name      = "Brewline Coffee Co."
    domain    = "your-store-handle.myshopify.com"
    niche     = single-origin coffee beans, DTC subscription
    age       = 14 days since launch
    timezone  = America/New_York
    currency  = USD
    stage     = MVP — Clarity only, no Judge.me
                (reviews deferred until ≥ 50 orders/month per Stage 2.5)
-->

# 📊 Brewline Coffee Co. — Daily Store Report

**Report date:** 2026-04-21 (Tuesday)
**Generated:** 2026-04-22 09:00 (America/New_York)
**Store:** your-store-handle.myshopify.com
**Store age:** 14 days
**Stage:** 🌱 MVP (Clarity active, reviews tracking deferred)

> **Data sources used in this sample:**
> | Section | Source | Setup needed |
> |---|---|---|
> | Orders / Revenue / AOV | Shopify Connector | ✅ already required |
> | Sessions / Conversion rate | Shopify orders ÷ Clarity human sessions (trend approximation) | ⚠️ requires Clarity Data Export token |
> | Top referrers / Top pages / Top countries / Devices | Clarity Data Export | ⚠️ requires Clarity Data Export token |
> | Scroll depth / rage clicks / dead clicks / quick back / excessive scroll | Microsoft Clarity (only) | ⚠️ requires Clarity Data Export token |
> | (Reviews — deferred until ≥ 50 orders / month) | Judge.me | not yet |
>
> **Renderer behavior:** for any field whose source is not configured, the section is skipped. Shopify-derived KPIs (Orders / Revenue / AOV) always render.

---

## 🎯 Core KPIs

| Metric | Yesterday | 7-day avg | Trend |
|---|---|---|---|
| Orders | **2** | 0.7 | 🟢 +186% vs 7d avg |
| Revenue | **\$87.98** | \$32.12 | 🟢 +174% |
| AOV | \$43.99 | \$45.88 | ⚪ flat |
| Conversion rate ⚠️ Clarity | **1.8%** | 0.6% | 🟢 +200% |
| Sessions ⚠️ Clarity | 113 | 121 | ⚪ -7% |

**Yesterday's orders:**
- #1003 — Ethiopian Yirgacheffe 12oz (\$24.99) + Cold Brew Concentrate (\$22.99) — Houston, TX
- #1004 — Colombian Single Origin Sampler (\$39.99) — Toronto, ON

---

## 🌐 Traffic profile (Clarity Data Export)

### Device split
| Device | Share of sessions |
|---|---|
| 📱 Mobile | **78%** |
| 💻 Desktop | 19% |
| 📱 Tablet | 3% |

### Top referrers
| Source | Sessions | Share |
|---|---|---|
| Direct / Bookmark | 41 | 36% |
| Pinterest | 28 | 25% |
| Google Search | 22 | 19% |
| Instagram | 14 | 12% |
| (Other) | 8 | 7% |

> 💡 Pinterest drives 1/4 of traffic — normal for a visual category. Keep posting Pins.

### Top 5 countries
| Country | Sessions |
|---|---|
| 🇺🇸 United States | 67 |
| 🇨🇦 Canada | 18 |
| 🇬🇧 United Kingdom | 11 |
| 🇦🇺 Australia | 9 |
| 🇩🇪 Germany | 4 |

---

## 🔥 Top 5 pages (Clarity Data Export)

| Rank | Page | Views | Avg time on page |
|---|---|---|---|
| 1 | / (homepage) | 113 | 28s |
| 2 | /products/ethiopian-yirgacheffe-12oz | 67 | 1m 42s |
| 3 | /collections/all | 54 | 51s |
| 4 | /products/colombian-single-origin-sampler | 41 | 1m 18s |
| 5 | /pages/about | 22 | 2m 04s |

> 💡 About page holds users for 2 minutes — the brand story is working. Consider adding an About teaser block on the homepage.

---

## 🩺 UX health (Clarity Insights)

| Metric | Value | Status | What it means |
|---|---|---|---|
| Rage Click | 3 | 🟢 Low | Users clicking the same area rapidly — usually a broken button or unresponsive link |
| Dead Click | 7 | 🟢 Low | Users clicking something that looks clickable but isn't (e.g. decorative icon) |
| Quick Back | 12 | 🟡 Medium | Users leaving a page within < 5 seconds — page didn't match expectations |
| JS Error | 1 | 🟢 Low | JavaScript exception in the browser console; may break interactions |
| Excessive Scroll | 4 | 🟢 Low | Users scrolling back and forth looking for key info (shipping, returns) |

<details>
<summary>Click to expand → what these numbers mean for you</summary>

**🟡 12 Quick Backs (medium)**
- **Real-world scenario:** a visitor lands on the Ethiopian Yirgacheffe PDP from Pinterest and bounces in 3 seconds.
- **Likely causes:** ① price higher than expected ② hero image differs from the Pin ③ slow load.
- **How to investigate:** open Clarity → Recordings, filter to Quick-Back sessions, watch 5 of them and note the second they leave.

</details>

---

## 💡 Auto-generated insights

1. ✅ **Yesterday's conversion rate (1.8%) is 3× the 7-day average (0.6%)** — Pinterest traffic quality is improving. Increase Pin frequency.
2. ⚠️ **Mobile is 78% of sessions but only 1.2% conversion vs Desktop 4.5%** — inspect the mobile checkout flow; something is likely getting in the way.
3. 💡 **About page holds users for 2m 04s** — visitors are reading the brand story. Add a "Why we roast this way" snippet at the bottom of PDPs linking back to About.

---

## ⚡ Recommended actions (by priority)

1. 🔴 **Watch 5 mobile Recordings** — Clarity → Recordings → Filter: Device = Mobile, Has Order = No.
2. 🟡 **Publish one more Pinterest board** — yesterday's Pinterest brought 28 sessions / 2 orders, strong ROI.
3. 🟢 **Add an About entry on the homepage** — one line "Read our story" link below the hero.

---

## 🔗 Quick links

- [Shopify Admin Dashboard](https://your-store-handle.myshopify.com/admin) — full order list
- [Clarity — Recordings](https://clarity.microsoft.com/projects/view/{PROJECT_ID}/impressions) — watch session replays (filter Device = Mobile)
- [Clarity — Heatmaps](https://clarity.microsoft.com/projects/view/{PROJECT_ID}/heatmaps) — click heatmaps


---

## 📅 What unlocks next

- **When monthly orders cross 50** → the agent will suggest enabling Judge.me review tracking.
- **When weekly orders ≥ 5 for 7 days straight** → the agent will suggest a small Meta Ads test.

---

_Report generated by daily_report.py · Skill: dtc-monitoring-and-daily-report_

---

<!--
=================================================================
EDGE CASE TEMPLATE: store has 0 orders / 0 sessions (week 1–4 of a new store)
This is the MOST COMMON state for the first month after launch.
Do NOT fake numbers. Do NOT show empty 0/0/0 KPI tables and call it a day.
Use this template instead.
=================================================================
-->

## 📊 Sample Store — Daily Store Report (0-order edge case sample)

**Report date:** 2026-04-23
**Store:** sample-store.myshopify.com
**Store age:** 9 days
**Stage:** 🌱 MVP (Clarity active, but **store has 0 orders ever**)

> ⚠️ **No transaction data yet.** The Core KPI table is intentionally omitted — showing `Orders=0, Revenue=$0, AOV=$0` repeated daily is noise, not signal. Below is what the daily report shows during the 0-order period.

### 🎯 Headline finding

> Store has been live for 9 days. **0 orders, 0 paid sessions.** The structural reason is that the store is not discoverable yet, not that traffic is converting badly.

### 🔍 What's blocking orders (in priority order)

| # | Blocker | Status | Fix effort |
|---|---|---|---|
| 1 | No custom domain (still `.myshopify.com`) | 🔴 unresolved | ~15 min ($14/yr) |
| 2 | No paid traffic source live | 🔴 unresolved | depends on channel |
| 3 | Shopify Payments not activated | 🔴 unresolved | ~10 min |
| 4 | 0 product reviews | 🟡 expected at this stage | unlocks at 50 orders/mo |
| 5 | No backlinks / no SEO authority | 🟡 expected | months of compounding |

### ✅ What IS healthy (don't break these)

- 6 active products with full SEO metadata (verified yesterday)
- JSON-LD structured data renders correctly on all PDPs
- Mobile theme renders cleanly (Clarity recorded 4 organic sessions, no rage clicks)
- Page speed: LCP 1.8s on PDP (good)

### 🎯 Single recommended action for today

**Bind a custom domain.** Reason: Google won't crawl/rank a `.myshopify.com` URL with any priority, and AI engines (ChatGPT, Perplexity) explicitly de-prioritize subdomain stores. This is the single highest-ROI 15-minute task. Until this is done, traffic optimization work is wasted.

### 📅 What this report will look like once orders start

Once `ordersCount ≥ 1`, the report switches to the full template you see at the top of this file (Core KPIs, Top products, Traffic profile, etc.). Until then, this 0-order template repeats with updated blocker status.

> Cross-skill suggestion: this state belongs to `shopify-marketing-launch` (driving first traffic) and `shopify-store-optimizer` (custom domain + payment activation), not to the monitoring skill. The monitoring skill correctly identifies the bottleneck and hands off — it does not pretend to fix it.
