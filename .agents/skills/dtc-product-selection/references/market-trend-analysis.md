# Market Trend Analysis (DTC selection — built-in methodology)

> Companion to [`SKILL.md`](../SKILL.md) §1.6. Use this when running Phase 1 (discovery) and Phase 2 (validation) of DTC product selection.
>
> **Why this file exists**: DTC selection is **demand-validated**, not Amazon-rank-driven. Amazon BSR + Jungle Scout revenue measure marketplace performance under Prime + paid-ads conditions; on a DTC store you have neither. The signals that matter for DTC are: organic search trend, social community density, seasonality, and DTC-side competitive density. This file walks through the 5 signal sources, free tools to query them, and how to read the output.

---

## 0. The wrong question vs the right question

| ❌ Wrong (Amazon-brain) question | ✅ Right (DTC-brain) question |
|---|---|
| "What sells on Amazon right now?" | "What's the search-demand trajectory and social density of this niche over 12 months?" |
| "Which products have high BSR?" | "Which niches have rising Google Trends + active subreddits/hashtags + 3-7 (not 30+) DTC competitors?" |
| "What's the Amazon revenue?" | "What's the DTC retail price band, and is it stable or commoditizing?" |
| "Which categories are crowded?" (asking for crowded ones) | "Which niches have community pull but no dominant DTC brand yet?" |

If you find yourself reaching for Jungle Scout first, stop and re-anchor: **Google Trends → Social → Pinterest → Amazon reviews → DTC competitor scan**, in that order.

---

## 1. Source #1 — Google Trends (primary demand signal)

### Why
- Free, real, normalized over 12 months
- Captures search intent — the closest proxy for "people who want to buy this exist"
- Shows seasonality + geographic hotspots without any account or API

### How to query (no login needed)

URL pattern:
```
https://trends.google.com/trends/explore?q=<keyword>&date=today%2012-m&geo=US
```

Parameters worth changing:
- `date=today%2012-m` → last 12 months (default for trajectory)
- `date=today%205-y` → 5-year view (use to detect long-term decline vs cycle)
- `geo=US` → swap for your target market (`GB`, `DE`, `AU`, etc.); leave blank for worldwide

### How to read the output

| What you see | What it means |
|---|---|
| Slope rising over 12mo | Demand growing — green flag |
| Slope flat over 12mo | Mature niche — neutral, requires differentiation |
| Slope declining | Demand contracting — yellow flag, requires "why now" thesis |
| Spike + crash within 6 weeks | Fad — red flag for DTC (no time to amortize CAC) |
| Repeating annual peak | Seasonal — plan inventory + cash flow accordingly |

### Comparison query (use to rank candidates)

Add up to 5 comma-separated keywords to compare relative demand:
```
https://trends.google.com/trends/explore?q=cedar+candle,soy+candle,beeswax+candle&date=today%2012-m&geo=US
```

The taller, more stable line wins.

---

## 2. Source #2 — Social signals (community density)

### Reddit (subscriber count + activity)

For each candidate niche, find the relevant subreddit(s). Three quick checks:

| Metric | Where to find | DTC threshold |
|---|---|---|
| Subscriber count | Sidebar of `/r/<sub>` | ≥ 50k for niche health; ≥ 200k for broad |
| Posts/week | Click "New" tab, count posts in last 7 days | ≥ 20/week = active community |
| Top post engagement | Click "Top → past month", check upvotes | ≥ 500 upvotes on top post = real audience |

URL pattern:
```
https://www.reddit.com/r/<niche>/
```

Search across multiple subs: `https://www.reddit.com/search/?q=<keyword>` — counts of related posts is itself a signal.

### Instagram hashtags (post count = audience size proxy)

Search hashtag in IG app or web:
```
https://www.instagram.com/explore/tags/<hashtag>/
```

| Posts on hashtag | Reading |
|---|---|
| < 10k | Too niche, no audience to acquire |
| 10k – 500k | **Sweet spot** — real audience, not commoditized |
| > 5M | Over-saturated; differentiation required |

Cross-check 2-3 related hashtags to gauge total addressable audience.

### TikTok hashtag views

Use this manual hashtag check only as `secondary` directional context. Primary TikTok evidence must follow `SKILL.md` §3 source #3 (`clockworks/tiktok-scraper` → `apidojo/tiktok-scraper-api` fallback) and must contain real per-video engagement metrics; do not turn search snippets or aggregate-only pages into exact virality claims.

URL pattern:
```
https://www.tiktok.com/tag/<hashtag>
```

| Hashtag views | Reading |
|---|---|
| < 1M | Niche may not exist yet |
| 1M – 100M | **DTC-friendly** — content opportunity, not yet over-fished |
| > 1B | Mainstream; very hard to break in without big budget |

---

## 3. Source #3 — Pinterest (seasonality + visual trends)

### When Pinterest matters most

Lean on Pinterest when the niche is:
- **Home decor / furniture** (>60% of Pinterest users plan home purchases here)
- **Fashion / accessories** (esp. seasonal: spring, summer, autumn drops)
- **Wedding / party / event**
- **Gift / holiday** (Q4 is dominated by Pinterest planning)
- **DIY / craft / hobby**

### How to query

1. Go to `https://www.pinterest.com/` (no login needed for search)
2. Search the keyword → check the **"More ideas" sidebar** for related terms (= what users associate with the niche)
3. Use **Pinterest Trends** (`https://trends.pinterest.com/`) for the past 12 months search-volume slope (US only, free)

### What to extract

- **Peak months** — when search volume is 2x baseline (drives launch timing + inventory)
- **Trough months** — schedule promotions / new products here, not launches
- **Co-searched keywords** — the "More ideas" panel maps the niche's adjacent vocabulary; useful for SEO + ad copy

---

## 4. Source #4 — Amazon review velocity (Jungle Scout — internal signal, NOT user-facing pitch)

### Role in DTC selection

Amazon data is a **competitive density check**, not a demand source for DTC. Use it to answer:
- Are there ≥3 active analog SKUs on Amazon? (= the category is real)
- What's the price band? (= benchmark for your DTC retail)
- What's the average review count growth rate? (= proxy for purchase volume trajectory)

### What NOT to do with Amazon data

- ❌ Use Amazon BSR as the headline justification for picking a SKU
- ❌ Tell the user "this is based on Amazon sales data"
- ❌ Pick the Amazon top-seller and assume it'll work on DTC (Prime + paid ads are doing 70% of the lift)

### What to do with Amazon data (internal worksheet only)

Pull 3-5 analog SKUs into `.workspace/_unit-economics.csv`, columns:
- `amazon_price` — for retail price benchmarking
- `amazon_review_count` — for category maturity check
- `amazon_review_velocity_30d` — for category momentum check

These numbers feed Unit Economics; they do **not** appear in `deliverables/product-selection-report.md` as the headline reasoning.

---

## 5. Source #5 — DTC competitor scanning

### Why it's different from Amazon competitor count

Amazon shows you everyone selling on Amazon. DTC scanning shows you who's actually winning **with their own brand and traffic**. A niche with 2,000 Amazon sellers but 0 DTC brands = either a green-field opportunity or a "DTC doesn't work here" warning. You need to investigate which.

### Free tools

| Tool | URL | What it does |
|---|---|---|
| **PageFly Showcase** | `https://pagefly.io/blogs/shopify/best-shopify-stores` | Curated list of best-in-class Shopify stores by category |
| **similarweb** | `https://www.similarweb.com/` (free tier) | Traffic estimate + traffic source mix for any DTC URL |
| **BuiltWith** | `https://builtwith.com/<domain>` | Confirms whether a competitor is on Shopify, what apps they run |
| **Google search operator** | `site:myshopify.com <niche>` then click into individual stores | Find Shopify stores in a niche |
| **TikTok / IG creator search** | Search hashtag, check creator bios for `.com` URLs | Direct path to active DTC brands in the niche |

### What to extract per competitor

- Hero SKU + retail price
- Number of products (if <30 = focused brand; >300 = catalog play)
- Estimated monthly traffic (similarweb)
- Traffic source mix: paid vs organic vs social (similarweb)
- Brand age (founding year — usually in About page or footer copyright)

### Density reading

| DTC competitor count in the niche | Reading |
|---|---|
| 0-2 | Either green-field OR DTC doesn't work here. Investigate **why** none exist before celebrating. |
| 3-7 | **Healthy** — proven DTC viability, room for differentiation |
| 8-15 | Crowded — requires sharp positioning angle |
| > 15 | Saturated — only enter with a defensible wedge (proprietary IP, exclusive supply, brand celebrity) |

---

## 6. Seasonality cycle template

For each niche, fill out:

```
Niche: <name>

Annual cycle:
- Peak months: <Mon, Mon>     (Google Trends + Pinterest Trends agreement)
- Trough months: <Mon, Mon>   (when to NOT launch, but DO promote inventory)
- Peak/trough ratio: <e.g. 3.2x>

Decision implications:
- Inventory: order <X> weeks before peak month begins
- Cash flow: <Y>% of annual revenue expected in peak quarter
- Launch timing: <Z> weeks before peak (allows SEO + ads to warm up)
- Off-season strategy: <e.g. bundle promotions, gift-card pushes, inventory clearance>
```

---

## 7. Worked anti-patterns (Amazon brain → DTC failure)

### Anti-pattern A: "It's a top Amazon seller, must work on DTC"

**Example**: Phone PopSocket alternatives. Massive Amazon BSR. Looks like demand.

What goes wrong on DTC:
- Average Amazon retail: $8-12; DTC retail needs $20-30 to cover CAC + margin
- Customers searching for "pop socket" on Google → Amazon owns the SERP organic + ad slots
- No defensible brand differentiation possible at $8 commodity price

**The DTC-brain check that would have caught this**:
- Google Trends: flat for 4 years (mature commodity)
- Reddit: no community (it's an accessory, not a culture)
- DTC competitor scan: 0 successful Shopify-only brands in the category

### Anti-pattern B: "Jungle Scout shows $80k/mo on this SKU"

**Example**: Generic LED strip lights. Strong Amazon revenue.

What goes wrong on DTC:
- The $80k revenue is split across 50+ Amazon listings; no individual brand owns the niche
- Search demand exists, but every searcher goes to Amazon (faster shipping)
- Customer acquisition cost on Meta ads = $35-50; AOV = $25 → unit economics underwater

**The DTC-brain check that would have caught this**:
- Unit Economics worksheet: target gross margin ≥ 60% impossible at $25 retail
- DTC competitor scan: every brand selling LED strips DTC has pivoted to "smart home ecosystem" because standalone strips don't work

### Anti-pattern C: "TikTok viral product — DTC gold!"

**Example**: A specific aesthetic gadget that hit 50M views in 2 weeks.

What goes wrong on DTC:
- Spike + crash on Google Trends within 8 weeks (classic fad)
- By the time you source + list + run ads, the wave is over
- Returns spike when buyers realize the product doesn't match the video

**The DTC-brain check that would have caught this**:
- Google Trends 5-year view: no prior signal = pure spike, not durable demand
- DTC competitor scan: only TikTok dropshippers, no established brand
- Seasonality: undefined — the "season" is the viral window, not a repeatable cycle

---

## 8. Phase 1 / Phase 2 integration checklist

When running through Phase 1 (discovery) and Phase 2 (validation):

- [ ] Google Trends 12-month chart pulled and trajectory recorded
- [ ] At least 1 Reddit sub identified + subscriber count noted
- [ ] At least 1 IG hashtag + 1 TikTok hashtag checked + post/view count noted
- [ ] If seasonal niche: Pinterest Trends checked + peak/trough months noted
- [ ] At least 3 DTC competitors identified (similarweb / BuiltWith / direct visit)
- [ ] Amazon analog SKUs (3-5) pulled for price-band benchmark + competitive density (NOT for headline reasoning)
- [ ] `.workspace/_trend-snapshot.md` filled out for each candidate SKU
- [ ] Verdict (strong demand / cautious / pass) recorded

If any item is missing, **do not advance to Phase 3**.
