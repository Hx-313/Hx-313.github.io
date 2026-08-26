# Phase 1: Research (Multi-Source Data + SEO + Competitor Analysis)

Three objectives, one document: Multi-source data collection / Three-tier SEO keyword pyramid / Top DTC competitor breakdown.

---

## 🎯 Agent Behavior Rules

1. **Don't ask "which data you want to see"**—the agent should independently run 4-6 data sources and output a cross-validation table.
2. SEO research is conducted during the product selection phase (not as an afterthought after listing); each SKU must match at least 2 keywords.
3. Analyze at least 3-5 competitors (across different price segments), extracting 8 data points per store, and **output differentiated white-space opportunities**.
4. **Proactively point out** data conflicts (e.g., Google Trends are rising but Reddit complaints are high → visuals/packaging might be the underlying issue).

---

## A. Multi-Source Data Collection (8 Essential + 4 Enhanced)

**Single source = significant bias**. Each source addresses different questions.

### 8 Essential Sources

| # | Source | Purpose | Standard / Usage |
|---|----|---------|------------|
| 1 | **Google Trends** | Demand trends + seasonality | 12 months + 5 years + region. Stable/Rising 🟢; Consistent decline ❌; Spike then sharp drop 🟡 |
| 2 | **Shopify Trends** | Real platform best-sellers | If a report mentions it, competition is already fierce; look for adjacent categories. |
| 3 | **TikTok Hashtag + Creative Center** | Visual virality + TikTok Shop hits | #tiktokmademebuyit + #[niche]; effect visible within 3 seconds = TikTok-friendly. |
| 4 | **Pinterest Predicts** | Aesthetic trends | Leads TikTok by 6-12 months; early signals. |
| 5 | **Reddit Niche Subreddits** | Real pain points + complaints | r/[niche] Top of Year; "I wish there was a..." = Opportunity. |
| 6 | **Etsy Best Sellers** | Handmade/High-margin/Early niche signals | Hits on Etsy → Spread to Shopify in 6-12 months. |
| 7 | **Amazon (Supporting)** | Demand verification + Review analysis | **Only look at reviews > 100, ignore sales charts**; "unmet needs" in negative reviews = differentiation. |
| 8 | **Alibaba (+ 1688 if China-domestic)** | Sourcing cost + Suppliers + Visuals | Use `product_supplier_search` for Alibaba (US/EU sellers default). For China-domestic sellers, 1688 is often 30-70% cheaper but Chinese-only and requires forwarder. |

### 4 Enhanced Sources

| # | Source | Use Case |
|---|----|------|
| 9 | Shop App | "For You" recommendations for new stores and trending items. |
| 10 | Facebook Ads Library | Search competitor store names; long-running creatives = validated ROI. |
| 11 | Similarweb | Competitor traffic sources (Search/Social/Direct/Email). |
| 12 | AlsoAsked / AnswerThePublic | Reverse product selection via SEO long-tail keywords. |

### Output: Multi-Source Cross-Validation Table (Mandatory for every niche/candidate SKU)

| Data Source | Key Findings | Link | Judgment |
|--------|---------|------|------|
| Google Trends | "[Term]" stable for 12 months, peak in Nov-Dec | Screenshot | 🟢 |
| Shopify Trends | Not mentioned → moderate competition | Report | 🟢 |
| TikTok | #hashtag 1.2M views in 7 days | Link | 🟢 |
| Pinterest | 2026 trend keywords appearing | Report | 🟢 |
| Reddit | r/[niche] 18k members, active | Link | 🟢 |
| Amazon | 500+ reviews for similar products, negative reviews cite "fragility" | Link | 🟡 (Visuals + Packaging must solve this) |
| 1688 | Plentiful suppliers, \$0.50-\$2.00 | Link | 🟢 |

---

## B. Three-Tier SEO Keyword Pyramid

### Top: Category Keywords (Head)
Example: crystals, healing crystals. MSV 10k+, KD 60+. **Do not spend heavily here**; use for awareness only. Tools: Ubersuggest Free, Ahrefs Free Keyword Generator.

### Middle: Intent Keywords (Body, **Main Battlefield for New Stores**)
Example: crystals for anxiety, best crystals for beginners. MSV 1k-10k, KD medium. Write 1500-3000 word deep-dive blogs to rank on page one within 3-6 months. Tools: AlsoAsked.com, AnswerThePublic.

### Bottom: Long-tail Keywords (**Gold Mine for Year One**)
Example: crystals for libra woman, how to cleanse rose quartz with moonlight. MSV < 500 but high intent, extremely low competition. Tools: Google Autocomplete, real Reddit/Quora questions.

### 3-Step SEO Validation During Product Selection

**Step 1**: Find 3-5 intent keywords for each SKU using AlsoAsked + AnswerThePublic + Google "People Also Ask."

**Step 2**: Evaluate KD (Keyword Difficulty)

| KD | Meaning | Viability for New Stores |
|----|------|-----------|
| 0-20 | Very Easy | ✅ Priority |
| 20-40 | Medium | ✅ Feasible (3-6 months) |
| 40-60 | Hard | 🟡 Caution, requires high-quality long-form content |
| 60+ | Very Hard | ❌ Dominated by giants |

**Step 3**: Intent Classification (At least 1 Commercial + 1 Transactional per SKU)

| Intent | Example | Content Format |
|------|------|---------|
| Informational | "what crystals help anxiety" | Blog (SEO long-tail + product conversion) |
| Commercial | "best crystals for beginners" | Comparison articles / Gift guide recommendations |
| Transactional | "buy amethyst tower online" | Product page / Collection page |
| Navigational | "energy muse vs tiny rituals" | Comparison pages (Advanced) |

### Integrate SEO into Selection Matrix (`_product-marketing-ops.csv`)

Add for each SKU: Primary Keyword (KD, MSV) / Long-tail 1-2 / Content Plan.

Example: Amethyst Tower → amethyst tower (KD 35, 5.4k/mo) + amethyst tower meaning (KD 18, 800/mo) + amethyst tower for bedroom (KD 12, 320/mo); Content: 1 "Ultimate Guide to Amethyst Towers" + Product Page SEO.

### Collaboration with Other Skills
- Detailed SEO keyword research → `shopify-marketing` SEO track
- Programmatic SEO (generating bulk long-tail pages) → `shopify-marketing` pSEO track, only on explicit pSEO intent
- Product page SEO tags → `shopify-marketing` SEO track

---

## C. Top DTC Competitor Breakdown (3-5 Stores)

Before selecting products, analyze 3-5 DTC brands in the same niche with \$1M+ annual sales—their pricing, bundles, and marketing are proven, saving you 6 months of trial and error.

### Step 1: Find the Leaders (4 Methods)
- Google "best [niche] shopify stores" / "top [niche] brands 2026."
- Search niche on Shop App → "For You."
- IG/TikTok hashtags; stores with > 50k followers.
- Similarweb monthly traffic > 100k.

→ Output 3-5 stores covering different price segments (Mass / Premium / Luxury).

### Step 2: Extract 8 Dimensions Per Store

| Dimension | Method |
|------|--------|
| 1. Overall Pricing | Best Sellers collection page → AOV estimation |
| 2. SKU Count + Categories | Navigation menu + Collections |
| 3. Hero SKU | Homepage banner + top sorting |
| 4. Bundle Strategy | "Bundles" / "Sets" / "Kits" collections |
| 5. Content Strategy | Blog / Resources section → count + topics + frequency |
| 6. Social Following | IG/TikTok/Pinterest followers + engagement rate |
| 7. Traffic Sources | Similarweb channel breakdown |
| 8. Ad Creatives | Facebook Ads Library search by store name |

### Step 3: Comparison Table

| Store | URL | SKUs | Price Range | AOV | Hero SKU | Bundles | Main Traffic |
|------|-----|-----|------|-----|------|--------|-------|
| Store A | xxx | 25 | \$30-150 | \~\$75 | XX Set \$59 | 8 | SEO 60% |
| Store B | xxx | 80 | \$15-200 | \~\$50 | XX Solo \$45 | 15 | Social 70% |
| Store C | xxx | 40 | \$50-300 | \~\$120 | XX Gift Box \$99 | 5 | Direct 50% (Strong Brand) |

### Step 4: Differentiated Opportunity Identification (Identify what the leaders are NOT doing; ≥3 required)

Price gap? Sub-category gap? Content gap? Service gap (e.g., subscription boxes)? Design gap (e.g., hippie style vs. minimalist Japanese)?

### Step 5: Reference Pricing Baseline

A new store **should not be more than 30% cheaper than leaders** (suspected knock-off) **nor more than 50% more expensive** (unless strong brand equity exists):
- Entry = Leader Entry × 0.85-1.0
- Hero = Leader Hero × 0.9-1.1
- Premium = Slightly below Leader Premium, positioned as an "affordable luxury alternative."

### Output (Write to `project/.workspace/_competitor-analysis.md`)

```markdown
# [niche] Top DTC Competitor Analysis
## Overview of 5 Leaders (Comparison Table)
## Deep Breakdown of Each Store x5 (Positioning/Price/Matrix/Content/Ads/Lessons/Pitfalls)
## Differentiated Opportunities ≥3
## Our Positioning (Based on the above)
```

---

## D. Apify Call Mechanics (Google Trends + TikTok)

The two Apify-backed sources require a specific calling pattern. Use these actors and inputs:

| Source | Actor (primary → fallback) | Input field | Example input |
|--------|---------------------------|-------------|---------------|
| Google Trends | `apify/google-trends-scraper` → `leadsbrary/google-trends-scraper` | `searchTerms` (array) | `{"searchTerms": ["<term>"], "geo": "US", "viewedFrom": "us", "timeRange": "today 3-m", "maxRequestRetries": 1, "pageLoadTimeoutSecs": 30}` |
| TikTok (MANDATORY) | `clockworks/tiktok-scraper` → `apidojo/tiktok-scraper-api` | `searchQueries` / `hashtags` for clockworks; `keywords` for apidojo fallback | Primary: use the live `clockworks/tiktok-scraper` schema (`apify_fetch-actor-details` if rejected), bounded to ~20 items. Fallback: `{"keywords": ["<term>"], "maxItems": 20, "location": "US", "sortType": "MOST_LIKED", "dateRange": "LAST_SIX_MONTHS"}` |

Both Google Trends actors share the **same input fields and the same output schema** (`searchTerms`, `geo`, `viewedFrom`, `timeRange`, plus `interestOverTime_timelineData` / `interestBySubregion` / `widgetErrors` in the dataset), so the fallback is a drop-in: reuse the identical input and the identical parsing. `apify/google-trends-scraper` is the primary because it is the official Apify actor with a large install base (9k+ users, will not be delisted or gated behind a paid rental) — its defaults are slow (180s page-load timeout, 7 retries), so you MUST pass the bounded `maxRequestRetries: 1` + `pageLoadTimeoutSecs: 30` shown above to keep it inside the 60s gateway window. `leadsbrary` is the fallback because it is fast (~35s) but has a very small install base; do not rely on it as the sole source.

**TikTok is a mandatory trend signal.** For every shortlisted term, the TikTok call MUST be attempted; the only acceptable non-`ok` outcome is `unavailable: rate_limited` after the D.2 retry budget is exhausted.

`timeRange` accepts only these enum values: `now 1-H`, `now 4-H`, `now 1-d`, `now 7-d`, `today 1-m`, `today 3-m`, `today 5-y`, `all`. For a longer window use `customTimeRange` (`"YYYY-MM-DD YYYY-MM-DD"`), which overrides `timeRange`. There is no `isPublic` field; to search multiple comma-joined terms as one set use `isMultiple: true`.

If an input field is rejected, run `apify_fetch-actor-details` once to read the live schema and adapt — do not guess field names.

### D.1 Call patterns per actor

`accio-mcp-cli` has a 60s hard timeout per call. The two actors need different patterns:

**TikTok (`clockworks/tiktok-scraper` primary → `apidojo/tiktok-scraper-api` fallback) — async.** Launch the primary with `waitSecs: 0` and bounded items (~20). If the input schema rejects `searchQueries` / `hashtags`, call `apify_fetch-actor-details` once, patch the field names, and retry once. Use `apidojo/tiktok-scraper-api` only after the primary actor fails or returns no usable metrics.

1. `apify_call-actor` with `waitSecs: 0` → returns `runId`.
2. Poll `apify_get-actor-run` until status is `SUCCEEDED`.
3. Fetch the dataset with `apify_get-dataset-items`.
4. Normalize per-video engagement fields (`views`, `likes`, `comments`, `shares`, `bookmarks`) when present; if the dataset has only hashtag aggregates / demo rows / no per-video metrics, record `unavailable: no_usable_metrics` and try the fallback actor once.

**Google Trends — bounded sync, with a fallback ladder.** Both actors return a finished run synchronously inside the 60s window (~35s for one term) when bounded with `maxRequestRetries: 1` + `pageLoadTimeoutSecs: 30`. The ladder is `apify/google-trends-scraper` (primary) → `leadsbrary/google-trends-scraper` (actor fallback) → `web_search` (secondary). Google Trends actors are upstream-throttled (HTTP 401/429) independently of which actor you pick, so the ladder exists to survive a single actor being blocked at the moment of the call — not because one actor is "better".

1. **Primary** — launch `apify/google-trends-scraper` with the bounded input above and `waitSecs: 45`. The run returns `status: SUCCEEDED` plus `datasetId` directly — no separate poll.
2. **Fetch + judge** — fetch with `apify_get-dataset-items`. Each item carries `interestOverTime_timelineData` (time-series points, each `value` 0–100 with a `hasData` flag), `interestBySubregion`, related queries/topics, and a `widgetErrors` array. Apply the **usable-vs-failed rule** below.
3. **Usable** → extract the timeline (+ subregion) and record as `primary`. Stop the ladder.
4. **Failed** (60s timeout, run error, or every `interestOverTime` point is `hasData:false` / empty timeline) → launch the `leadsbrary/google-trends-scraper` fallback once, with the **identical bounded input**, then repeat steps 2–3.
5. Still failed → `web_search "google trends <term> 2026"` recorded as `secondary`; if that also yields nothing, mark `unavailable: upstream_blocked`. Do NOT relaunch either actor beyond this ladder.

**Usable-vs-failed rule (both actors, identical schema).** A SUCCEEDED run is **usable `primary` data** when `interestOverTime_timelineData` has at least one point with `"hasData":[true]`. Extract it even if `widgetErrors` lists a failed widget. A `widgetErrors` entry — most commonly `RELATED_QUERIES` / `RELATED_TOPICS` returning `HTTP 429` — means only that one widget is missing: omit it from the report, do **not** discard the whole source. Only treat the run as failed (advance the ladder) when the run timed out/errored, or every timeline point is `hasData:false` / the timeline array is empty.

Strip the ```` ```json ```` fences Apify wraps around output before parsing.

### D.2 Serial throttle gate (mandatory for multi-user stability)

`Rate limited by upstream API` is a gateway throttle on `apify_call-actor`, triggered by two actor launches in the same short window. Every launch passes this gate:

1. **Serial only.** Launch one actor at a time. Never fire two launches in the same window (e.g. launching TikTok right after Google Trends).
2. **Space launches by ≥30s.** `sleep 30` between consecutive launches. The poll/fetch phase of a running actor does not block the next launch — the 30s spacing is between *launches*.
3. **Cache-first short-circuit.** Check the cache (D.3) before any launch; a hit skips the call entirely.
4. **Back-off on 429.** On `Rate limited`, retry with 30s → 60s → 120s back-off, max 3 launch attempts, then mark `unavailable: rate_limited`.
5. **One term per launch.** Batch terms into a single actor input where the actor supports it rather than launching once per term.

### D.3 Result cache (24h, shared across users)

To survive multi-user load, cache successful fetches:

- Path: `project/.workspace/_cache/{source}_{kw}_{geo}_{window}.json` (e.g. `gtrends_travertine-tray_US_3m.json`).
- TTL 24h. Read before any launch; on a fresh hit, use it and skip the call.
- Write only successful results. Never cache a failed/empty/`unavailable` result.
- **Stale-but-usable fallback**: if a fresh fetch fails (401 / rate_limited) and a cache file exists but is >24h old, you may use it tagged `secondary` with `(stale cache, fetched <cached_at>)`. Note the staleness explicitly; never present stale data as fresh.

### D.4 Failure handling

| Symptom | Root cause | Fix |
|---------|-----------|-----|
| Run FAILED in <10s, `exitCode 1`, or `Input is not valid` | Wrong input parameter | `apify_fetch-actor-details` → read schema → fix one param → retry once. Mark `unavailable: wrong_input_param` only if the corrected call also fails. |
| `Rate limited by upstream API` (even with `waitSecs: 0`) | Gateway throttle — two launches in one window | Apply the D.2 gate: serial launches, `sleep 30` spacing, 30→60→120s back-off (max 3), cache-first. |
| Trends SUCCEEDED but every `interestOverTime` point is `hasData:false` / timeline empty, or whole-run `HTTP 401` | Upstream Google anti-bot block hitting that actor right now | Advance the ladder (D.1): launch the `leadsbrary/google-trends-scraper` fallback once with the identical bounded input; if it also fails, `web_search` as `secondary`, then `unavailable: upstream_blocked`. |
| Trends SUCCEEDED, timeline has `hasData:true` points, but `widgetErrors` lists `RELATED_QUERIES` / `RELATED_TOPICS` = `HTTP 429` | Only the related-queries widget was throttled; the core time-series is intact | **NOT a failure.** Keep the run as `primary`, extract the timeline + subregion, omit the missing widget. Do NOT advance the ladder. |
| Trends call hits the 60s CLI timeout | Bounded run still exceeded the window; `runId` is unrecoverable (no run-listing tool) | Do not relaunch the same actor. Advance the ladder to `leadsbrary/google-trends-scraper` once; if it also times out, `web_search` as `secondary` then `unavailable: trends_timeout`. |
| TikTok returned nothing for 60s | CLI hard timeout; the async run may still be alive | If you have the `runId`, poll it — do not relaunch. If there is no recoverable runId, try the fallback actor once. |
| TikTok primary returns only hashtag aggregates / demo rows / no per-video engagement fields | Actor succeeded but did not produce usable DTC trend evidence | Try `apidojo/tiktok-scraper-api` once. If fallback also lacks `views`/`likes`/`comments`/`shares`/`bookmarks`, record `unavailable: no_usable_metrics`; do not turn snippets or aggregates into virality metrics. |
| Empty result | No matches | Record `data: 0 hits`. Do not back-fill from training memory. |

---


## Anti-Patterns (Agent Self-Check)

- ❌ Using only Jungle Scout (Amazon ≠ Shopify).
- ❌ Looking only at one week of data (requires 12-month trends).
- ❌ Ignoring SEO (organic traffic has the highest ROI).
- ❌ Targeting only category head terms (no chance for new stores).
- ❌ Analyzing only 1-2 competitors (sample size too small).
- ❌ Treating Amazon sellers as DTC competitors (different species).
- ❌ "Observing without analyzing" (must output differentiated opportunities).
