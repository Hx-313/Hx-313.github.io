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

  Hypothetical store used in this sample (continuation of MVP sample
  6 months later — same store, more data):
    name      = "Brewline Coffee Co."
    domain    = "your-store-handle.myshopify.com"
    niche     = single-origin coffee beans, DTC subscription
    age       = 6 months (180 days)
    timezone  = America/New_York
    currency  = USD
    stage     = Mature — Clarity + Judge.me all active
                (~120 orders/month, 80+ accumulated reviews)
-->

# 📊 Brewline Coffee Co. — Daily Store Report

**Report date:** 2026-10-14 (Tuesday)
**Generated:** 2026-10-15 09:00 (America/New_York)
**Store:** your-store-handle.myshopify.com
**Store age:** 6 months (180 days)
**Stage:** 🌳 Mature (Clarity + Judge.me all active)

> **Data sources used in this sample:**
> | Section | Source | Setup needed |
> |---|---|---|
> | Orders / Revenue / AOV / Repeat-buyer rate | Shopify Connector | ✅ already required |
> | Sessions / Conversion rate | Shopify orders ÷ Clarity human sessions (trend approximation) | ⚠️ requires Clarity Data Export token |
> | Top referrers / Top pages / Top countries / Devices | Clarity Data Export | ⚠️ requires Clarity Data Export token |
> | Scroll depth / rage clicks / dead clicks / quick back / excessive scroll | Microsoft Clarity (only) | ⚠️ requires Clarity Data Export token |
> | Reviews / star rating | Judge.me (via Shopify metafields) | ⚠️ requires the Judge.me app installed |
>
> **Renderer behavior:** for any field whose source is not configured, the section is skipped. Shopify-derived KPIs always render.

---

## 🎯 Core KPIs

| Metric | Yesterday | 7-day avg | 30-day avg | Trend |
|---|---|---|---|---|
| Orders | **8** | 5.2 | 4.1 | 🟢 +95% vs 30d |
| Revenue | **\$367.92** | \$238.41 | \$189.27 | 🟢 +94% |
| AOV | \$45.99 | \$45.85 | \$46.16 | ⚪ flat |
| Conversion rate ⚠️ Clarity | **2.1%** | 1.7% | 1.4% | 🟢 +50% |
| Sessions ⚠️ Clarity | 381 | 312 | 285 | 🟢 +34% |
| Repeat-buyer rate (30d) | 18% | 16% | 14% | 🟢 climbing |

**Yesterday's top 3 orders:**
- #1247 — Subscription Sampler Box (\$89.99) — Returning customer (3rd order)
- #1248 — Ethiopian Yirgacheffe 12oz (\$24.99) + Cold Brew Concentrate (\$22.99) — New, Pinterest
- #1249 — Custom Holiday Bundle (\$129.99) — New, Instagram DM

---

## 🌐 Traffic profile (Clarity Data Export)

### Device split
| Device | Share of sessions |
|---|---|
| 📱 Mobile | **74%** |
| 💻 Desktop | 22% |
| 📱 Tablet | 4% |

### Top referrers
| Source | Sessions | Share | vs 30d |
|---|---|---|---|
| Google Search (organic) | 137 | 36% | 🟢 +28% |
| Pinterest | 89 | 23% | ⚪ +5% |
| Direct / Bookmark | 71 | 19% | ⚪ +2% |
| Instagram | 52 | 14% | 🟡 -8% |
| Email (Klaviyo) | 22 | 6% | 🟢 +35% (newly enabled) |
| (Other) | 10 | 2% | — |

> 💡 **Google organic now leads (36%)** — 6 months of SEO work compounding. Klaviyo has been live for 1 month and already drives 6% of traffic with the highest conversion rate (4.5%).

### Top 5 countries
| Country | Sessions |
|---|---|
| 🇺🇸 United States | 251 |
| 🇨🇦 Canada | 47 |
| 🇬🇧 United Kingdom | 38 |
| 🇦🇺 Australia | 24 |
| 🇩🇪 Germany | 12 |

---

## 🔥 Top 5 pages (Clarity Data Export)

| Rank | Page | Views | Avg time on page |
|---|---|---|---|
| 1 | / (homepage) | 381 | 31s |
| 2 | /products/subscription-sampler-box | 187 | 2m 11s |
| 3 | /collections/single-origin | 142 | 1m 24s |
| 4 | /products/ethiopian-yirgacheffe-12oz | 128 | 1m 47s |
| 5 | /pages/brewing-guide | 89 | 4m 18s |

> 💡 **Sampler Box hit 187 views (48% of sessions)** — flagship status confirmed; pin a permanent banner on the homepage. The Brewing Guide holds users for 4 minutes — it's the educational anchor of organic traffic.

---

## 🩺 UX health (Clarity Insights)

| Metric | Value | Status | What it means |
|---|---|---|---|
| Rage Click | 8 | 🟢 Low | Users clicking the same area rapidly — usually a broken button |
| Dead Click | 14 | 🟡 Medium | Users clicking something that looks clickable but isn't |
| Quick Back | 32 | 🟢 Low | Users leaving a page within < 5 seconds |
| JS Error | 2 | 🟢 Low | JavaScript exception in the browser console |
| Excessive Scroll | 18 | 🟡 Medium | Users scrolling back and forth looking for key info |

<details>
<summary>Click to expand → what these numbers mean for you</summary>

**🟡 14 Dead Clicks (medium)**
- **Real-world scenario:** on the Sampler Box PDP, users tap a small icon next to a product photo expecting it to enlarge — nothing happens.
- **How to fix:** open the Clarity heatmap for that page, find the Dead Click cluster, and either turn those "look-clickable" elements into real buttons or strip the click affordance.

**🟡 18 Excessive Scrolls (medium)**
- **Real-world scenario:** users on the Brewing Guide scroll up and down looking for "what grind for a French Press".
- **How to fix:** add an anchor index at the top of the guide ("Jump to: Espresso / Pour Over / French Press / Cold Brew").

</details>

---

## ⭐ Reviews (Judge.me)

| Metric | Value |
|---|---|
| Total reviews | **87** |
| Average rating | 4.7 ⭐ |
| New reviews yesterday | **3** |
| Pending replies | 1 |

**Rating distribution:**

- 5⭐ ███████████████████████████████████████████████████████████████ 63
- 4⭐ ██████████████████ 18
- 3⭐ ████ 4
- 2⭐ ██ 2
- 1⭐ ⚫ 0

**Yesterday's new reviews:**

| Customer | Product | Rating | Excerpt |
|---|---|---|---|
| Sarah M. | Ethiopian Yirgacheffe 12oz | ⭐⭐⭐⭐⭐ | "Smooth, bright, no bitterness. Best beans I've tried in years." |
| Jenna T. | Subscription Sampler Box | ⭐⭐⭐⭐⭐ | "Perfect gift for my dad's birthday. The tasting notes card is a great touch." |
| Mike R. | Cold Brew Concentrate | ⭐⭐⭐⭐ | "Great flavor but the bottle is smaller than I expected from the photos." |

> 💡 **Top positive keywords:** "smooth", "gift", "tasting notes" — packaging and gift positioning are core selling points; reinforce in Pinterest content.
> ⚠️ **Top negative keyword:** "smaller than expected" — appeared 4 times across 30 days. **Strongly recommend adding a size-comparison photo on the listing** (e.g. bottle next to a hand or coffee mug).

📌 **Pending reply:** Mike R.'s 4⭐ review → suggested response: *"Thanks Mike! We've added a size reference photo to the listing — sorry for any confusion. Use code MIKE10 on your next order."*

---

## 💡 Auto-generated insights

1. ✅ **Google organic +28% MoM** — SEO is compounding. Keep publishing blog content.
2. ✅ **Klaviyo email converts at 4.5% — highest of any channel.** Add an abandoned-cart automation if you haven't already.
3. ⚠️ **"Smaller than expected" appeared in 4 reviews this month** — add a size-reference photo to the top 5 highest-priced SKUs immediately.
4. 💡 **Sampler Box is the traffic black hole (48% of sessions visit it).** Build one PMax campaign around it.
5. 🟡 **Instagram traffic -8% MoM** — likely an algorithm shift. A/B test short-form video vs static posts.

---

## ⚡ Recommended actions (by priority)

1. 🔴 **Fix the "smaller than expected" issue** — shoot a size-comparison photo for the top 5 SKUs (next to a mug, hand, or coffee bag).
2. 🔴 **Reply to Mike R.'s 4⭐ review** — Judge.me Dashboard → Pending Reviews.
3. 🟡 **Enable Klaviyo Abandoned Cart automation** — your highest-converting channel deserves a free automation lever.
4. 🟡 **Launch a PMax test for the Sampler Box** — \$20/day budget for 7 days.
5. 🟢 **Add an anchor index to the Brewing Guide** — kills the Excessive Scroll friction.

---

## 🔗 Quick links

- [Shopify Admin Dashboard](https://your-store-handle.myshopify.com/admin) — full order list
- [Judge.me Dashboard](https://judge.me/reviews) — reply to pending reviews
- [Clarity — Recordings](https://clarity.microsoft.com/projects/view/{PROJECT_ID}/impressions) — watch session replays
- [Clarity — Heatmaps](https://clarity.microsoft.com/projects/view/{PROJECT_ID}/heatmaps) — click heatmaps

- [Klaviyo Dashboard](https://www.klaviyo.com/dashboard) — email flow performance

---

## 📅 What unlocks next

- **When monthly orders cross 200** → the agent will suggest applying for Shopify Capital and / or expanding your SKU lineup.
- **When repeat-buyer rate crosses 25%** → the agent will suggest a subscription / membership tier (e.g. "Roast of the Month").
- **When monthly revenue crosses \$10k** → the agent will suggest a custom domain and a brand-wide visual refresh.

---

_Report generated by daily_report.py · Skill: dtc-monitoring-and-daily-report_
