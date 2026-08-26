---
name: dtc-product-selection
license: MIT
description: |-
  Shopify DTC product-selection methodology. Trigger when the user is exploring "what should I sell on a Shopify / DTC store", asks for niche discovery, product opportunity scan, or wants to validate a category before sourcing. Keywords: "what should I sell", "product opportunity", "niche discovery", "DTC product selection". Outputs `.workspace/_discovery-brief.md` plus `deliverables/product-selection-report.md` (Honest report with explicit confidence + unavailable-data sections). Do NOT trigger for Amazon/eBay marketplace selection, for already-selected SKUs (→ product-supplier-sourcing), or for "which of my existing SKUs sells best" (→ store-auditor).
---

# Shopify DTC Product Selection

A methodology for helping a user converge on **what to sell** on a DTC / Shopify store. Combines best-effort signal collection (Google Trends, TikTok, Amazon proxies, DTC competitor scan) with Unit Economics reality checks, and produces an **honest report** that names what was found, what was not, and how confident the recommendation is.

---

## 1. When to use this skill

### Use when
- User wants to start a DTC store and **has not yet picked a category** ("I want to start a Shopify store, no idea what to sell")
- User has a **vague direction** that needs to be narrowed to a concrete niche ("I want to do something in women's accessories / home / pets")
- User has an existing store and wants to **validate adding a new niche**
- User explicitly asks: "what should I sell", "niche discovery", "product opportunity"

### Stop and re-route mid-flow
Once inside this skill, if any of the following becomes true, stop and tell the user — **do not silently push through**:
- Every data-source attempt failed (5 sources, 0 primary data) → say so and ask whether to proceed on weaker secondary data, switch niche, or abort
- User actually only wants a one-line recommendation → confirm scope before running the full 4 phases
- User reveals they have already chosen a SKU → suggest jumping to the platform-bundled `product-supplier-sourcing` skill

### 1.1 Two operating modes (pick one at entry)

Classify the request into one of two modes before Phase 1 — they differ only in **how the niche hypothesis is seeded**, then both converge on the same Phase 2-4 signal-collection + Unit-Economics pipeline.

| Mode | Trigger phrasing | How to seed candidate terms |
|---|---|---|
| **A — Trend discovery** (open-ended; user does NOT have a category) | open-ended asks with no concrete product, e.g. "what should I sell", "recommend a product", "any winning products / hot sellers", "I want to start a store but don't know what" (in any language) | Generate the candidate terms yourself from broad signals: surface rising / trending items first, then narrow. Sources to mine for candidates: Google Trends rising-related-queries, TikTok trending product terms (e.g. "TikTok made me buy it" adjacent terms), and the user's stated interests / MEMORY.md. Produce a handful of candidate terms, then run them through Phase 2. |
| **B — Targeted validation** (user names a category / product) | the user names a concrete category or product, e.g. "analyze bluetooth earbuds", "is X worth selling", "can X work on DTC" (in any language) | The user-named term IS the candidate. Skip candidate generation; go straight to Phase 2 deep validation on that term (and at most 1-2 close variants the user implies). |

**Mode-independent rules (apply to both):**
- The Phase 2 data sources, the mandatory-TikTok rule, the Google Trends fallback ladder, and the honest-evidence tagging are **identical** in both modes. Mode only changes Phase 1 (how terms are seeded), not Phase 2-4.
- If the mode is ambiguous (user is vague but seems to have a direction), default to **A** and state the candidate terms you generated so the user can correct course before Phase 2 spends tool calls.
- If a Mode-A run keeps surfacing nothing, offer to switch to a user-supplied term (Mode B). If a Mode-B term fails every source, offer to broaden to Mode A within the same niche.

---

## 2. Operating principles

Four principles. **Read these as defaults, not as MUST-conditions.** When a principle conflicts with reality (data unavailable, user reverses, scope changed), follow the principle that says "be honest about it", not the one that says "force the methodology through".

### Principle 1 — Honest evidence
Every claim in the final report carries one of four **evidence tags**:

- `primary` — produced by a tool call in this session (Jungle Scout query, apify actor output, web_fetch of a competitor page)
- `secondary` — produced by web_search summarizing a third-party blog / report / news article
- `hypothesis` — agent inference on top of `primary` / `secondary` data (must be marked, not laundered into a fact)
- `unavailable` — the tool failed, returned empty, or was not run; the corresponding claim is **omitted**, not back-filled from training memory

**Never fabricate a number, trend slope, or competitor count from training memory.** If you do not have it, say so. **Never use AI-generated images** (`image_generate`) **as competitor / product / trend visuals** — images that appear in the report must come from actual tool calls (alibaba `imageURL`, TikTok actor output, `web_fetch` of a real page).

Invalid trend payloads are not trend evidence. Google Trends outputs with empty `interestOverTime_timelineData` / no `hasData:true`, HTTP-429-only widget errors, or TikTok outputs that contain only `demo` / no real `views`, `likes`, `comments`, `shares`, and `bookmarks` MUST be recorded as `unavailable`, not `primary`. Do not use them to claim "rising trend", "viral", "growth breakout", or "low CAC".

Web-search snippets are secondary, not virality metrics. Search snippets about TikTok / Instagram / Pinterest trends may only be used as `secondary` directional evidence; do not turn them into exact view counts, "viral" claims, "low CAC", or "growth breakout" unless the linked page was fetched and the metric is visible in the fetched content.

Confidence cap when trend sources fail: if Google Trends is `unavailable` and TikTok is `unavailable` / invalid / secondary-only, the final confidence for a DTC recommendation cannot be `high` based only on Amazon/Jungle Scout + Alibaba supplier data. Cap it at `medium` when unit economics is complete, otherwise `low`, and explicitly state `trend evidence unavailable`.

Two categories of numbers appear in the report — the rule differs:

| Category | Examples | Rule |
|---|---|---|
| **Raw source data** | search volume, BSR, TikTok view count, price band, sales estimate | MUST come from a tool call in this session. If the tool failed or returned empty, mark `unavailable` — never substitute with a training-memory estimate. |
| **Derived / computed data** | engagement rate, month-level average, margin %, freight cost, YoY growth | May be calculated from raw source data using arithmetic. Label as computed and show the input values. |

### Principle 2 — DTC focus, not marketplace arbitrage
Amazon BSR, Etsy bestseller rank, and Jungle Scout revenue are **proxies for adjacent demand**, not for DTC demand. A product that sells on Amazon does not automatically sell on a cold-traffic Shopify store, because on Shopify you pay for the traffic. When citing Amazon-side data, frame it as "demand proxy", not "this will sell on DTC".

### Principle 3 — Unit Economics reality check
Three numbers materially change the recommendation and **should not be skipped**:

- First-leg freight (computed from weight + volume + lane, **not** as a flat multiplier of unit cost)
- Per-order ad cost (when paid ads are in scope; benchmark CPM / ROAS / CAC live in `references/phase-4-unit-economics.md`)
- Single-unit DTC retail floor (`< $20` is a structural margin problem unless bundled / cross-sold)

If any of these three cannot be estimated, **mark it `unknown`** in the unit-economics table and reflect that in the report's confidence level. Do not assume away.

### Principle 4 — Stop early if signal is weak
If after Phase 2 you have `<2` data sources with `primary` data, do not push into Phase 3. Tell the user the signal is too thin and offer three options: (a) try a different niche, (b) proceed on `secondary`-only data with low confidence, (c) abort. The user picks.

---

## 3. Data sources & how to actually call them

Five intended data sources (Pinterest not included). Each maps to a **specific tool with a specific calling pattern**. Coverage depends on tool availability — none of these is guaranteed.

| # | Source | Tool | Call pattern | If it fails |
|---|---|---|---|---|
| 1 | Amazon (demand proxy) | `js_product_database_query`, `js_historical_search_volume` (+ `js_sales_estimates` / `js_share_of_voice` / `js_keywords_by_asin` / `js_keywords_by_keyword` as needed) | `accio-mcp-cli call <tool> --json '{...}'` direct. **`js_historical_search_volume` REQUIRES `start_date` + `end_date` (YYYY-MM-DD), not just `keyword` + `marketplace`** -- e.g. `{"keyword": "<term>", "marketplace": "us", "start_date": "<today-3m>", "end_date": "<today>"}`; omitting the dates returns `Missing required argument`. Returns weekly `historical_keyword_search_volume` buckets (absolute volume, not a 0-100 index). | Mark `unavailable: quota / auth` |
| 2 | Google Trends | `apify/google-trends-scraper` (primary) → `leadsbrary/google-trends-scraper` (actor fallback) | Cache-first, then a bounded sync call. Input field `searchTerms` (array): `{"searchTerms": ["<term>"], "geo": "US", "viewedFrom": "us", "timeRange": "today 3-m", "maxRequestRetries": 1, "pageLoadTimeoutSecs": 30}` with `waitSecs: 45` (run returns SUCCEEDED + datasetId synchronously in ~35s). `timeRange` enum: `now 1-H` / `now 4-H` / `now 1-d` / `now 7-d` / `today 1-m` / `today 3-m` / `today 5-y` / `all`. **A run that SUCCEEDED counts as `primary` data as long as `interestOverTime_timelineData` has at least one point with `hasData:true` — a partial `widgetErrors` block (e.g. relatedQueries HTTP 429) does NOT make the whole source fail; just omit the missing widget.** Fallback ladder + `widgetErrors` parsing → `references/phase-1-research.md` §D. | If the run truly fails (CLI 60s timeout, or SUCCEEDED but every `interestOverTime` point is `hasData:false`): try the `leadsbrary/google-trends-scraper` fallback once (§D), then `web_search` "google trends <keyword> 2026" as `secondary`, then `unavailable: upstream_blocked`. |
| 3 | TikTok (REQUIRED trend signal) | `clockworks/tiktok-scraper` (primary) → `apidojo/tiktok-scraper-api` (fallback) | Cache-first, then Apify async pattern. For `clockworks/tiktok-scraper`, use keyword/hashtag search fields from the live actor schema (commonly `searchQueries` and/or `hashtags`) and keep `maxItems` bounded. If the schema rejects the input, call `apify_fetch-actor-details` once, patch the field names, and retry once. Fallback to `apidojo/tiktok-scraper-api` with `{"keywords": ["<term>"], "maxItems": 20, "location": "US", "sortType": "MOST_LIKED", "dateRange": "LAST_SIX_MONTHS"}` only after the primary actor fails or returns no usable metrics. Full call mechanics → `references/phase-1-research.md` §D. **TikTok is a mandatory demand/trend signal — you MUST attempt it for every candidate term that reaches the shortlist (Phase 2 onward).** To keep cost/latency bounded, do not fire TikTok during broad Phase 1 category exploration — run it on each shortlisted term. | Attempt is MANDATORY; mark `unavailable: rate_limited` / `unavailable: no_usable_metrics` only after the §D primary→fallback retry budget is exhausted. |
| 4 | DTC competitor scan | `web_search` + `web_fetch` | Direct. Search `"<niche> dtc shopify brands"`, fetch top 3-5 brand sites | Skip silently if no brands surface; note in report |
| 5 | Supplier-side maturity (cost floor + category health) | `product_supplier_search` — use both `intent_type=supplier` (reorder rate / GMV / export region) and `intent_type=product` (price band / MOQ / reference image URLs) | Direct tool call, no apify chain | Mark `unavailable: alibaba_down` |

### 3.1 Apify three-step chain

The `accio-mcp-cli` has a **60-second hard timeout** per call. The two actors use different patterns (see `references/phase-1-research.md` §D.1): **TikTok** runs async (`waitSecs: 0` → poll); **Google Trends** runs as a bounded sync call (`waitSecs: 45` with `maxRequestRetries: 1` + `pageLoadTimeoutSecs: 30` so it finishes inside 60s). Serial throttle, 24h shared cache, back-off, and the upstream-block handling live in `references/phase-1-research.md` §D — follow it for every Apify launch.

```
TikTok (async, primary then fallback):
  Step 1: apify_call-actor
    --json '{"actor": "clockworks/tiktok-scraper", "input": {...}, "waitSecs": 0}'
    → returns {runId, datasetId, status}
      status = "SUCCEEDED"           → straight to Step 3
      status = "READY" / "RUNNING"   → Step 2
      input/schema error             → apify_fetch-actor-details once, patch input names, retry once;
                                       if still failing, try fallback actor `apidojo/tiktok-scraper-api`
      CLI 60s timeout (no JSON back) → grep runId out of stderr if present;
                                       if absent, try fallback actor once, do NOT retry blindly

  Step 2: apify_get-actor-run  (poll loop, max 9 iterations × 10s = 90s total)
    --json '{"runId": "<id>"}'
    → check .status field:
      "SUCCEEDED" → Step 3
      "FAILED" / "ABORTED" → mark unavailable
      "RUNNING" / "READY"  → sleep 10s, retry

Google Trends (bounded sync, with fallback ladder):
  Step 1 (primary): apify_call-actor
    --json '{"actor": "apify/google-trends-scraper",
             "input": {"searchTerms": ["<term>"], "geo": "US", "viewedFrom": "us",
                       "timeRange": "today 3-m",
                       "maxRequestRetries": 1, "pageLoadTimeoutSecs": 30},
             "waitSecs": 45}'
    → returns {runId, datasetId, status: "SUCCEEDED"} directly → Step 3
      CLI 60s timeout → go to Step 2 (leadsbrary/ fallback)

  Step 2 (actor fallback, only if Step 1 failed or returned no usable data):
    apify_call-actor
    --json '{"actor": "leadsbrary/google-trends-scraper",
             "input": {"searchTerms": ["<term>"], "geo": "US", "viewedFrom": "us",
                       "timeRange": "today 3-m",
                       "maxRequestRetries": 1, "pageLoadTimeoutSecs": 30},
             "waitSecs": 45}'
    → same output shape as Step 1 → Step 3
      Still failed / no usable data → web_search "google trends <term> 2026"
        as `secondary`; then `unavailable: upstream_blocked`. Do NOT relaunch either actor.

  Step 3 (both actors share the same dataset shape): apify_get-dataset-items
    --json '{"datasetId": "<id>", "limit": <N>}'
    → Decide usable vs failed (see widgetErrors rule below), then record
      the result alongside the runId so the user can audit.
```

**Google Trends usable-vs-failed rule (applies to BOTH actors — they return the same schema).** A SUCCEEDED run is **usable `primary` data** when `interestOverTime_timelineData` contains at least one point with `"hasData":[true]`. In that case, extract the timeline (and `interestBySubregion` if present) even if `widgetErrors` lists a failed widget. A `widgetErrors` entry (commonly `RELATED_QUERIES` / `RELATED_TOPICS` returning `HTTP 429`) means only that one widget is missing — omit it, do not discard the whole source. Treat the run as **failed** (advance the fallback ladder) only when the run timed out, errored, or every `interestOverTime` point is `"hasData":[false]` / the timeline is empty.

**Parsing note — strip the markdown code fence first.** `apify_get-dataset-items` (and several MCP CLI tools) wrap their JSON output in a ` ```json … ``` ` code block. Calling `json.loads` / `json.load` on the raw output will throw `JSONDecodeError`. Before parsing, strip the leading ` ```json ` and trailing ` ``` ` (e.g. `raw = re.sub(r'^```json\s*','',raw); raw = re.sub(r'```\s*$','',raw)`). The actual payload is `{"items": [...]}` — index `data['items']` when `data` is a dict.

**Google Trends specifically** (`leadsbrary/google-trends-scraper`): after Step 3, parse `data['items']` — each item has `searchTerm`, `interestOverTime_timelineData[]` (time-series points, each with `formattedTime` and `value[0]` on a 0–100 scale), and related queries / geo breakdown. Compute month-level averages from the timeline points. Do **not** treat the index value as absolute search volume — it is a relative scale (100 = peak point for that keyword in the period).

**TikTok specifically** (`clockworks/tiktok-scraper` primary; `apidojo/tiktok-scraper-api` fallback): after Step 3, parse `data['items']` and normalize per-video metrics to `views`, `likes`, `comments`, `shares`, `bookmarks` when those fields are present. `apidojo` uses dot-notation channel fields (`channel.username`, `channel.followers`, `channel.verified`, `video.duration`); `clockworks` may use different names, so inspect the fetched item keys before computing. Compute engagement rate only when `views` is present and >0. If the actor returns only hashtag aggregates / demo rows / items without real per-video engagement metrics, record `unavailable: no_usable_metrics` rather than fabricating virality.

### 3.2 Failure handling rules

- **Empty result**: record `data: 0 hits` — do not back-fill from training memory.
- **Auth / quota error**: mark `unavailable: <reason>` and continue to the next source.
- **Apify-specific failures** (near-instant FAILED, `Rate limited by upstream API`, `HTTP 401`, CLI 60s timeout, serial throttle, back-off budget): `references/phase-1-research.md` §D.4 has the symptom → fix table. Match the symptom there before marking a source `unavailable`.

### 3.3 Recording sources

Every datum that ends up in the report carries `source_id` (tool name + runId or query string) so the user can audit. The raw outputs live in `.workspace/_signals-raw.md`.

### 3.4 How to read supplier-side data (source #5)

`product_supplier_search` returns category-health signals that complement demand signals — use them alongside, not instead of, the demand sources:

- **Reorder rate ≥ 30% across multiple suppliers** → mature, repeat-purchase category (positive signal)
- **Average GMV < $10k across top suppliers** → category lacks scale (red flag, lower confidence)
- **Export region heavy on North America (≥ 30%)** → DTC-friendly supply chain (positive signal)
- **Price band from `intent_type=product`** → directly bounds the cost floor used in Principle 3's retail-floor check
- **`imageURL` from `intent_type=product`** → real reference images for the report (see Phase 4)

---

## 4. Workflow (4 phases)

Phase boundaries are checkpoints, not rituals. If a phase produces too little signal, **announce the gap and ask the user how to proceed** rather than synthesize past it.

### Phase 1 — Discovery brief
- **First, classify the mode (§1.1)**: Mode A (trend discovery — you generate candidate terms) or Mode B (targeted validation — user already named the term). Record the chosen mode in the brief.
- **Input**: user's original request + anything already in MEMORY.md / `project/`
- **First action after entering this skill**: write `.workspace/_discovery-brief.md` (start from `templates/discovery-brief.md`)
- **Brief must contain**: operating mode (A/B), niche hypothesis, candidate terms (for Mode A: the terms you generated and why; for Mode B: the user's term + any close variants), target audience guess, explicit exclusions, source of each field (user-stated vs agent-inferred)
- **Done when**: brief is on disk, the mode is recorded, and the candidate term(s) are concrete enough to feed Phase 2 queries

### Phase 2 — Signal collection (best-effort)
- For each of the 5 sources in §3, attempt **one primary call + at most one retry**
- **TikTok is mandatory (source #3): once a term reaches the shortlist, you MUST attempt the TikTok call for it. The only acceptable `status` other than `ok` is `unavailable: <reason>` after the §D retry budget — never silently skip it.** Google Trends follows the `apify → leadsbrary → web_search` ladder in §D and counts as `ok` whenever `interestOverTime` has a `hasData:true` point (a partial `widgetErrors` block is not a failure).
- Append every result (success, empty, or failure) to `.workspace/_signals-raw.md`, grouped by source, with `status: ok | empty | unavailable: <reason>` and the raw payload or error
- **Done when**: every source has a status line — even `unavailable` is a valid terminal state
- **Stop early check**: if `<2` sources are `ok`, switch to "stop and ask" before Phase 3

### Phase 3 — Unit economics & shortlist
- Build the candidate shortlist using **only data that exists** (do not invent rows to hit a target count)
- For each candidate, compute the three reality-check numbers (freight, ad cost, retail floor); mark `unknown` where a number cannot be derived
- Walk the 12 red lines (§5) — each line resolves to `yes` / `no` / `unknown`; `unknown` is not a pass
- **Outputs**: `.workspace/_shortlist.md`, `.workspace/_unit-economics.csv`
- **Done when**: shortlist is non-empty (or explicitly "no qualified candidate"), each row carries an evidence tag, each red line has a verdict

### Phase 4 — Honest report
- Outputs (two files):
  - `deliverables/product-selection-report.md` — narrative report for the user to read
  - `deliverables/product-candidates.csv` — structured candidate table for the user (and for hand-off to the platform-bundled `product-supplier-sourcing` skill) to act on
- **Report's four mandatory sections** (in this order):
  1. **What we found** — recommendations with evidence tags. **For each recommended SKU, embed one reference image inline** using `![](<imageURL>)`, where `<imageURL>` MUST come from a tool call (alibaba product image, Pinterest pin, TikTok video cover, or `web_fetch` of a real page). Never use `image_generate` here.
  2. **What we couldn't find and why** — list every source whose status is `unavailable` and the reason (timeout / rate-limited / empty / quota)
  3. **Confidence level** — `high` (≥4 primary sources + UE complete), `medium` (≥2 primary + UE complete), `low` (1 primary or UE incomplete), `not-recommended` (signal too weak / fails red lines)
  4. **Recommended next step** — including "do not enter this niche" as a legitimate answer. When the next step is "proceed with this niche", explicitly hand off to the platform-bundled `product-supplier-sourcing` skill (Accio Work catalog; load via `skill-finder` if not currently available) for sample requests / MOQ / quote negotiation, and point at `deliverables/product-candidates.csv` as the input.
- **Candidates CSV columns** (in this order): `candidate_name, niche, evidence_tags, confidence, reference_image_url, suggested_alibaba_query, recommended_next_action`. One row per candidate; use `unknown` per cell when data is missing.
- **Plan vs execution boundary**: in a product-selection task, Stage 2 listing, Stage 3 theme decoration, launch, SEO/GEO visibility, sourcing, samples, and supplier negotiation are next-step plans unless the agent actually performed and verified those actions in this run. Do not label planned work as "completed"; say "recommended plan" or "not executed in this run".
- Tone follows the user's language and the `buyer_level` field in the discovery brief (novice ↔ pro); see `references/copywriting-style.md` only if you need the tone reference

---

## 5. 12 decision red lines

Twelve lines, grouped across pre-selection / pre-launch / post-launch windows. Source of truth: `references/red-lines.md`. Walk only the lines relevant to the current phase — don't dump all 12 upfront. Each line resolves to:

- `yes` — line is satisfied, pass
- `no` — line is violated, drop the SKU
- `unknown` — could not verify with current data; treat as **not a pass**, surface in the report

---

## 6. Deliverables checklist

| File | Definition of Done | If data is missing |
|---|---|---|
| `.workspace/_discovery-brief.md` | Niche + audience + exclusions present; each field tagged as `user-stated` or `agent-inferred` | Must exist; no degraded form |
| `.workspace/_signals-raw.md` | One section per data source, each with `status` line and raw payload or error | `unavailable` everywhere is allowed — write it explicitly |
| `.workspace/_shortlist.md` | ≥1 candidate row with evidence tag, or explicit "no qualified candidate" | Zero rows is a valid outcome |
| `.workspace/_unit-economics.csv` | Freight / ad cost / margin columns present per candidate | Use `unknown` per cell as needed |
| `.workspace/_red-line-check.md` | Each candidate × 12 red lines as `yes` / `no` / `unknown` | `unknown` is allowed; it lowers confidence |
| `deliverables/product-selection-report.md` | All 4 mandatory sections present (What we found / What we couldn't / Confidence / Next step); each recommended SKU has an inline reference image from a real tool call | Yes — every section is required even if its content is "nothing" |
| `deliverables/product-candidates.csv` | One row per candidate, all 7 columns filled (use `unknown` per cell as needed) | At minimum: header row + one comment line "no qualified candidate" |

---

## 7. Optional reading — load on demand

The references and templates below are **not on the standard path**. Read one only when its trigger condition fires.

| Trigger condition | Read this |
|---|---|
| User wants to discuss "should I take the focused fast path or the broad newbie path" | `references/focused-path.md`, `references/newbie-path.md` |
| User gives an explicit target audience / asks for an ICP write-up | `references/icp.md` |
| User asks for landing copy / brand story / marketing tone guidance | `references/copywriting-style.md` |
| You want to walk through demand-signal sources in more methodological depth | `references/market-trend-analysis.md` |
| You want a deeper recap of any single phase | `references/phase-1-research.md`, `references/phase-2-matrix.md`, `references/phase-3-supply.md`, `references/phase-4-unit-economics.md`, `references/phase-4-return-rate-benchmarks.md` |
| User wants multi-source / multi-supplier comparison framing | `references/multi-source-supply.md` |
| User specifically asks for a **professional-grade** buyer report | `templates/buyer-report-pro.md` |
| User specifically asks for a **newbie-friendly** version | `templates/buyer-report-novice.md` |
| User asks for a **finance-deep** breakdown (cash flow / scenarios) | `templates/buyer-finance-pro.md` |
| You want a per-SKU decision scorecard | `templates/decision-scorecard.md` |
| You need a clean Unit Economics CSV scaffold | `templates/unit-economics-template.csv` |
| You need a marketing-ops CSV scaffold | `templates/product-marketing-ops-template.csv` |
| You want the full output-format spec (naming, layout, deliverables vs workspace split) | `references/output-format.md` |
| You want industry health-band thresholds (margin / sales / repeat) | `references/thresholds.md` |
| You want the full 12-red-line specification | `references/red-lines.md` |
| User asks for actual wholesale quotes / supplier comparison / MOQ negotiation | hand off to the platform-bundled `product-supplier-sourcing` skill (Accio Work catalog) — don't try to do it here |

**Always-used templates** (one is required in the standard path, the other in Phase 3; reading these is part of the workflow, not optional):

- `templates/discovery-brief.md` → Phase 1
- `templates/unit-economics-template.csv` → Phase 3

---

## 8. What this skill won't do

- It won't make the final pick **for** the user — it surfaces evidence and a recommendation, the user owns the call
- It won't fabricate numbers when a tool returns nothing — `unavailable` is a valid outcome
- It won't run supplier sourcing / sample requests / MOQ negotiation — that's the platform-bundled `product-supplier-sourcing` skill
- It won't write listing copy, set up the store, or design upsells — those are downstream skills
