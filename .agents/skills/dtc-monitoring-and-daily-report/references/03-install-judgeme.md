# Reference 03: Install Judge.me

<!-- verified Apr 2026 — re-verify all SaaS admin URLs every 6 months via web_search -->


> ⚠️ **OPT-IN — DO NOT install by default**
>
> This stage is **conditional**. Skip on first install. Trigger only when ANY of:
> - User explicitly says "install Judge.me / set up reviews"
> - Store crosses **≥ 50 orders/month**
> - User mentions reviews exist on another channel (Trustpilot / Etsy / Amazon)
>
> **Why opt-in?** A new store with 0 reviews showing a "0 ★ — no reviews yet" badge on every product page **lowers trust more than not having a widget at all**. Wait until there's enough order volume to seed real reviews (typically ≥ 50 orders/month → ~5-10 reviews/month at 10-20% response rate).
>
> See `SKILL.md` Stage 2.5 for the full pre-flight check the agent must run before installing.

---

Judge.me is the most popular Shopify reviews app. Free tier handles widget display + review collection; **Awesome ($15/mo)** unlocks API write access and advanced settings.

## What you get on Free vs Awesome

| Capability | Free | Awesome ($15/mo) |
|---|---|---|
| Star rating widget | ✅ | ✅ |
| Reviews widget on PDP | ✅ | ✅ |
| Review request emails | ✅ (Judge.me branded) | ✅ (your branding) |
| Review summary synced to Shopify metafields | ✅ | ✅ |
| Custom branding/colors | ❌ | ✅ |

**For monitoring purposes Free is enough** — the daily report only needs the review count / average star, which Judge.me writes to Shopify shop metafields automatically (no API token required).

## Install steps

### Step 1 — 👤 User installs from App Store

Direct link: https://apps.shopify.com/judgeme

Click **Install**, approve OAuth in Shopify Admin. The agent **cannot** install apps via API for the user.

### Step 2 — 👤 User toggles App Embeds in Theme Editor

After install, the widget code is in the theme but **not active** until App Embeds are toggled on.

Deep link (replace `{store}` and `{themeId}`):
```
https://admin.shopify.com/store/{store}/themes/{themeId}/editor?context=apps
```

User toggles ON:
- ✅ Judge.me Star Rating
- ✅ Judge.me Reviews Widget

This must be done by the merchant — there is no API.

> **No token step.** Once the app is installed, Judge.me syncs its review summary
> into Shopify **shop metafields** (namespace `judgeme`). The daily report reads
> them through the same Shopify Connector as all other store data — the user does
> **not** need to copy any Public Token.

### Step 3 — 🤖 Agent verifies widget injection

```bash
curl -s "https://{store-domain}/products/{any-product-handle}" | grep -c "jdgm"
```

Expected: ≥ 5 occurrences (jdgm-rev, jdgm-prev-badge, jdgm-widget, etc.)

If 0: App Embeds not toggled — re-direct user to Step 2.

### Step 4 — 🤖 Agent verifies metafields are synced

Run `python3 scripts/check_health.py` — section 3 (Judge.me) reads
`shop.metafields.judgeme.*` via the Connector and reports the review count.

Expected: `ok` with a review count (0 is normal for a new store), or `skipped`
if the metafields are not present yet (app just installed — sync can take a few
minutes, or the app is not actually installed).

## Daily report integration

The report reads these shop metafields on each run (namespace `judgeme`, owner Shop):

| Metric | Metafield |
|---|---|
| Total reviews | `shop.metafields.judgeme.all_reviews_count` |
| Avg star rating | `shop.metafields.judgeme.all_reviews_rating` |
| Shop-review count | `shop.metafields.judgeme.shop_reviews_count` |
| Shop-review avg | `shop.metafields.judgeme.shop_reviews_rating` |

> Per-product ratings (if needed later) live under the Shopify-standard
> `product.metafields.reviews.rating` / `rating_count` namespace.

## Edge cases

- **No reviews yet**: report shows "No reviews — focus on getting first 5 to unlock social proof"
- **Suddenly negative review**: insight section flags any review with rating ≤ 2
- **Awesome upgrade trigger**: when total reviews ≥ 50, suggest upgrade for advanced features (auto-reply, branding, AI moderation)
