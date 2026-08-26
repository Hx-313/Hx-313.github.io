# Reference 07: Report Design Principles

<!-- verified Apr 2026 — design principles, no admin URLs to re-verify -->


The daily report's job is **not "show data"** — it's "tell the user what to do today, in plain language they understand". These principles are the difference between a useful report and an ignored one.

## Principle 0: Match the user's input language, within the i18n whitelist (hard rule, overrides every other principle below)

Every word the user reads — section headers, KPI labels, plain-language glosses, UX-issue descriptions, the "today's recommended action" line, AND the agent's chat-side run summary that accompanies the rendered Markdown — MUST be in the user's input language **if and only if** that language is in the effective whitelist. Out-of-whitelist input falls back to English. Never the shop locale, never the Admin language, never a silent default.

**Effective whitelist** = `resources/i18n.json` locales ∩ `render_report.py` `STRINGS` keys. Both layers must support the locale, because `i18n.json` governs the plugin's metadata surface while `STRINGS` governs the actual report Markdown. Currently both layers list `en`, `zh`, `es`, `pt`, `fr`, `de`, `ja`, `ko`, `it` (BCP 47 codes per the platform's plugin-i18n-guide §10.7); everything else falls back to `en` (= `i18n.json.defaultLocale`).

Operational rules:
- The agent runs **detect → whitelist-resolve → snapshot** at cron creation time:
  - `<detected>` = the user's input language (script/keyword classification).
  - `<effective>` = `<detected>` if `<detected> ∈ whitelist`, else `i18n.json.defaultLocale` (`en`).
  - Write `<effective>` (not `<detected>`) into `project/store-config.json` → `language`.
- When falling back to `en`, **tell the user once in their input language** that the report is not yet localized — never silent.
- `language: "auto"` is the seed default ONLY; replace with the concrete `<effective>` code before the cron's first run.
- If the user switches language in a later session, re-run detect → resolve → snapshot, and `cron update` the payload accordingly.
- To add a new locale beyond the current 9 (e.g. `ru`, `ar`, `th`): (1) add the locale's strings to `render_report.py` `STRINGS`, (2) add the locale to `i18n.json` `entries` (at least for the user-visible plugin labels), then the whitelist auto-expands.
- The agent's chat run summary MUST use `<effective>`, NOT `<detected>`. Otherwise a user writing in `ja` would get an en Markdown report (from the script's safety fallback) under a ja chat ribbon — split-language reads as broken.
- Brand and UI proper nouns (Shopify, Clarity, Judge.me, Accio Work Connector, GraphQL field names, code paths, URLs) stay in their canonical form regardless of language. **Don't** translate `shop.ianaTimezone` or `Rage Clicks` as a term — translate the *gloss* that explains them.

This principle exists because the report is a **morning-coffee artifact for the founder**. A founder who reads only 中文 will not act on an English KPI table no matter how good the data is; matching their language (within what the plugin can actually deliver) is the precondition for every other principle (jargon translation, single recommended action, etc.) to actually work.

## Principle 1: Translate every jargon term

Founders are not analysts. Every industry term in the report **must** have:
- A plain-language explanation column, with the column header rendered in the user's language (e.g. EN: `Plain English`, DE: `Erklärung`, etc.)
- ...where the user's language label is whatever the user actually writes; pick the matching localized term at render time
- OR an expandable `<details>` block explaining: real scenario + cost + how to fix

### Bad (will be ignored)
```
| Rage Clicks | 5 | 🔴 |
| Dead Clicks | 8 | 🟡 |
```

### Good (will be acted on) — render the explanation in the user's language

EN user:
```
| Rage Clicks | Users clicked the same spot 3+ times (button broken/unresponsive) | 5 | 🔴 |
| Dead Clicks | Users clicked something they thought was clickable, but wasn't    | 8 | 🟡 |
```

For non-English users: keep the technical term in English, then append a localized plain-language gloss in the user's own language and translate the row description accordingly. Always render the table header label in the user's language.

This applies to **every term** that's not native to the user's domain. Always pair the technical term with a one-line plain-language gloss in the user's language. Examples (gloss shown in EN for illustration — translate to user's language):
- ✅ AOV → "Average Order Value (avg revenue per order)"
- ✅ CVR → "Conversion Rate (% of visitors who buy)"
- ✅ Bounce Rate → "% of visitors who leave after one page"
- ✅ JS Error → "JavaScript error (your page code crashed — invisible to user but may break features)"

## Principle 2: Health badges (🟢🟡🔴) on every metric

Every numeric metric should have a status indicator based on threshold rules. The user should be able to **scan the report in 5 seconds** and know if they need to dig in.

Example thresholds (adjust per metric):

| Metric | 🟢 Good | 🟡 Watch | 🔴 Action needed |
|---|---|---|---|
| CVR | ≥ 2% | 0.5-2% | < 0.5% |
| Sessions DoD | ≥ -10% | -10% to -25% | < -25% |
| Rage Clicks | 0 | 1-5 | > 5 |
| Avg star rating | ≥ 4.5 | 4.0-4.5 | < 4.0 |

## Principle 3: Insights, not just data

After raw metrics, generate 2-4 **interpretive sentences** that connect the dots:

### Bad
```
Sessions: 12
CVR: 0.2%
Rage Clicks: 3
```

### Good
```
💡 Insight: 12 sessions yielded 0 orders (CVR 0% vs 2% target). 
3 of 12 sessions had rage clicks — likely the same UX issue blocking conversion.
**Suggested action**: Watch the 3 rage-click recordings in Clarity, fix what they're stuck on.
```

## Principle 4: 1-3 prioritized actions, not a wishlist

End each report with **at most 3 actions**, sorted by impact. Never give 10 — the user will do zero.

### Bad
```
Recommendations:
1. Fix product images
2. Update SEO titles
3. Add reviews
4. Improve checkout
5. Run Pinterest ads
6. ... (10 more)
```

### Good
```
🎯 Today's top 3 actions:
1. **[High]** Watch 3 rage-click recordings in Clarity → identify and fix UX blocker (15 min)
2. **[Medium]** Reply to the 1 negative review (3-star) on Product X (5 min)
3. **[Low]** Check inventory: 2 SKUs are below 10 units (2 min)
```

## Principle 5: Quick links to dashboards

End every report with a **One-click navigation** section:

```
## 🔗 Quick links

- 🛒 Shopify Admin: https://admin.shopify.com/store/{store}
- 📊 Clarity Dashboard: https://clarity.microsoft.com/projects/view/{id}
- ⭐ Judge.me Reviews: https://judge.me/reviews
```

User shouldn't have to type or search to get to the data.

## Principle 6: "What's normal" calibration

Many metrics are useless without a baseline. Provide **comparison values** so the user knows if their number is good:

### Bad
```
CVR: 0.8%
```

### Good
```
CVR: 0.8% 🟡
(Industry benchmark: e-commerce avg 2-3%, your niche/jewelry 1.5-2%)
```

For early-stage stores, "your 7-day rolling average" is the most useful baseline.

## Principle 7: Don't fake comprehensiveness

If a data source failed or returned empty, **show that explicitly** rather than hiding the section:

### Bad (silently omits Judge.me section if API fails)
```
## Reviews
[section missing]
```

### Good
```
## ⭐ Reviews
⚠ Judge.me review metafields not found on shop. Confirm the Judge.me app is installed and has synced.
Last successful pull: 2026-04-19
```

This way the user knows something needs fixing instead of assuming "no reviews".

## Principle 8: Bottom-up, not top-down

Order sections by **what the user will look at first**:

1. **Headline KPIs** (revenue, orders) — what they care about
2. **Health badges** — at-a-glance status
3. **Traffic profile** — context for the KPIs
4. **UX health** — diagnostic if KPIs are bad
5. **Reviews** — social proof status
6. **Insights & actions** — what to do
7. **Quick links** — navigation

Not: data sources first, processed data last (engineer order).

## Principle 9: Stable file naming

Always use `YYYY-MM-DD.md` for the filename, **based on the data date** (yesterday), not the generation date.

```
project/daily-reports/
├── 2026-04-19.md  ← data for Apr 19, generated Apr 20
├── 2026-04-20.md  ← data for Apr 20, generated Apr 21
└── 2026-04-21.md  ← data for Apr 21, generated Apr 22
```

This makes it easy to compare "vs last Tuesday" or grep for trends.
