# Shopify Marketing Track: GEO Optimizer

## Operating Principle

This skill is intentionally conservative. GEO work is valuable only if the agent can execute and verify it without making false promises. The default path is:

1. Read-only audit.
2. Explicit change plan.
3. Small, reversible Shopify changes.
4. Live verification.

Do not run a full "audit + content generation + theme rewrite + tracking + external monitoring" chain in one pass.

This is an **explicit-only** skill. Trigger only when the user explicitly names GEO / generative engine optimization / AEO / answer engine optimization / AI citation / LLM visibility / AI Overviews visibility, or asks to be cited by ChatGPT, Perplexity, Claude, Gemini, Bing Copilot, or similar AI answer engines.

Do not infer GEO intent from generic SEO, "make my content better", "improve visibility", "add FAQ", "add schema", "allow AI bots", or "use AI" requests.

---

## What GEO Means Here

GEO is not a replacement for classic SEO. The classic SEO track owns Google organic fundamentals: title/meta, canonical, standard structured data, robots crawl rules, Core Web Vitals, keyword research, competitor gaps, and page audits.

This skill only handles AI-answer citability:

- Whether product/page copy contains self-contained, extractable claims.
- Whether claims have real sources, dates, or visible evidence.
- Whether verified stats/quotes can be rendered on product pages.
- Whether AI crawlers are explicitly allowed when the merchant wants AI citation.
- Whether a simulated AI-answer preview can find and reuse the page's facts.

There is no guaranteed ChatGPT / Perplexity / AI Overview ranking API. Any preview is a simulation.

Back-office writes are not public GEO completion. If the product/page is `DRAFT`, unpublished, password-gated, or lacks a public `onlineStoreUrl`, report only "fields updated in Shopify admin" and mark public SEO/GEO visibility as blocked until the page is published and fetched successfully without tokens/cookies.

---

## Trigger Gate

Use this skill only for explicit GEO intent:

- "Do GEO for my Shopify store."
- "I want ChatGPT / Perplexity / Claude to cite my store."
- "Optimize my product pages for AI Overviews / AI answers."
- "Improve LLM visibility / AI citation visibility."
- "Do AEO / answer engine optimization."

Do not use this skill for:

- Classic SEO, meta tags, canonical, sitemap, normal robots.txt, keyword work, or Google organic ranking.
- pSEO / bulk landing pages.
- CRO / conversion optimization.
- Generic FAQ/schema requests unless the user explicitly says the goal is GEO or AI citation.
- External analytics setup unless the user explicitly asks for it and provides credentials or accepts a manual step.

---

## Executable Scope

Default GEO work must stay inside these Shopify-supported actions:

| Capability | Default status | Execution |
|---|---|---|
| Citability audit | Safe, read-only | Read product/page data and live HTML; score against `references/geo/02-citability-rubric.md`. |
| Product stats | Safe if sourced | Create/update product metafields such as `geo.stats` after definition validation. |
| Verified quotes | Safe if sourced | Create/update metaobjects + product metafields such as `geo.quotes` after definition validation. |
| Render stats/quotes | Safe if reversible | For broader theme work, route through `shopify-theme-decorator`; for a narrow snippet fallback, use `themeFilesUpsert` only after reading existing theme files. |
| FAQ block + FAQPage JSON-LD | Safe if visible and sourced | Add only visible FAQ content; never add schema for hidden or fabricated FAQ. Set expectations honestly: FAQPage markup yields NO Google rich results for commerce sites (feature retired for all sites May 7, 2026; commerce excluded since Aug 2023) and its AI-citation effect is unproven — the value is in the visible self-contained Q&A text itself. |
| AI bot allowlist | Safe if explicit GEO | Patch only a marked GEO block in `templates/robots.txt.liquid`; preserve Shopify defaults and SEO rules. |
| AI-answer preview | Safe, read-only | Simulate how an AI answer may summarize the page; present as directional only. |

These are **not** default executable scope:

| Capability | Status |
|---|---|
| GA4 AI-referral channel grouping | Manual/external. Shopify Admin cannot complete this by itself. |
| Real ChatGPT / Perplexity / Claude citation measurement | External or manual. Built-in preview is only a simulation. |
| Google Indexing API / IndexNow | External credentials required. Do not include in default GEO execution. |
| `/llms.txt` | Optional hygiene experiment only. Must verify the route returns 200 and acceptable content type; never claim ranking/citation impact. |

---

## SEO Preservation Boundary

GEO changes are additive. They must not overwrite classic SEO artifacts unless the user explicitly asks for that change.

- Do not change SEO titles, meta descriptions, canonical rules, standard robots.txt crawl rules, Product/Breadcrumb/Organization JSON-LD, or theme performance optimizations owned by the classic SEO track.
- Do not mutate `descriptionHtml` directly for stats/quotes. Use metafields + Liquid rendering.
- Theme writes must read the current file first, preserve non-GEO content, and use obvious marker comments around GEO-managed blocks.
- After any theme upsert, verify that existing SEO schema/canonical/robots behavior still exists on the live page.

---

## Standard Workflow

### Stage 1 - Audit Only

Default first step. No store writes.

1. Pull product/page data via `shopify-use-shopify-cli`.
2. Fetch live HTML for the requested product/page URLs when available.
3. Run `scripts/geo/citability_score.py` using [references/geo/02-citability-rubric.md](geo/02-citability-rubric.md).
4. Output:
   - Citability score.
   - Missing evidence/stats/quotes.
   - Pages eligible for safe Shopify changes.
   - Items that are external/manual only.

Stop here unless the user confirms store writes.

### Stage 2 - Safe Shopify Changes

Run only after the user confirms the change plan.

0. **Baseline read first.** Before writing ANY metafield / metaobject / snippet / `templates/robots.txt.liquid` block / FAQ HTML / JSON-LD, read the current value of every target field (productMetafield by namespace+key, themeFile by filename, product.descriptionHtml, robots.txt body) and record it as `baseline.<field>`. A field that already has a non-empty value pre-existing this session was NOT deployed by you — possibly a previous run, the merchant, an app, or a theme default. Do not later report it as a Stage-2 deliverable based on baseline state alone.
1. Create/validate custom data definitions with `shopify-custom-data`.
2. Write sourced stats to product metafields such as `geo.stats`.
3. Write verified quotes through metaobjects + product metafields such as `geo.quotes`.
4. Add or update `snippets/geo-stats.liquid` and `snippets/geo-quotes.liquid`.
5. Read the target product template/section file, then add a minimal render hook if missing.
6. Optionally add a visible FAQ block and matching FAQPage JSON-LD only when the FAQ content is present on the page.
7. Optionally patch only the GEO-managed AI bot allowlist block in `templates/robots.txt.liquid`.

Maintain `project/geo/mutation-ledger-{YYYY-MM-DD}.md` while writing. Each row maps one final-response claim to the actual mutation and post-read proof:

| Claim | Baseline | Mutation evidence | Post-read proof | Final wording |
|---|---|---|---|---|
| `geo.stats` deployed | empty/non-empty | `metafieldsSet userErrors=[]` | product metafield value read | deployed / pre-existing / failed |
| FAQPage JSON-LD embedded | snippet absent/present | `themeFilesUpsert userErrors=[]` | theme snippet + render hook read, live grep if public | deployed / staged / failed |

If the claim has no mutation evidence from this run, the only allowed final wording is `pre-existing (verified, not deployed this session)` or `not changed`.

Final reports must split GEO outcomes into exactly these buckets:

1. **Deployed in this run** — only rows whose mutation-ledger `Final wording` is `deployed` or `staged`.
2. **Pre-existing / verified only** — rows whose value was already present in `baseline.*`.
3. **Not completed / failed gate** — rows without mutation evidence, without post-read proof, blocked by DRAFT/public visibility, or blocked by `schema_completeness=0`.

Never mix bucket 2 or 3 items into the "completed" list, even if they improve the current page score.

Do not use raw `curl`, REST endpoints, `shopify api query`, raw GraphQL blocks shown to the user, or `shpat_*` tokens. Use the standard `shopify-admin` validation and `shopify-use-shopify-cli` execution chain.

### Stage 3 - Verify

Every write must be verified.

0. **Delta proof per deliverable.** For every item you plan to report as "deployed / added / wrote / embedded" (metafield, snippet, JSON-LD, robots.txt block, FAQ HTML), you MUST be able to cite both (a) the tool_call that ran the actual mutation (`metafieldsSet` / `metaobjectCreate` / `themeFilesUpsert` / `productUpdate` with the changed field in its input args), AND (b) `baseline.<field> != post-read.<field>` from the Stage 2 baseline. Items without BOTH must be reported as `pre-existing (not deployed this session)` or omitted from the deliverables list. Reading a field, running `citability_score.py`, or restating an existing FAQ in chat does NOT count as deployment. Specifically: 0 `themeFilesUpsert` calls in this session ⇒ you cannot claim "JSON-LD embedded" or "snippet added"; 0 `metafieldsSet` calls ⇒ you cannot claim "metafield deployed".
1. Fetch one changed PDP and confirm the `geo-stats` / `geo-quotes` markup renders.
2. Confirm the page still has the existing canonical and core SEO structured data.
3. If robots.txt was changed, fetch live `/robots.txt` and confirm only the marked GEO block changed.
4. Run a before/after AI-answer preview using [references/geo/02-citability-rubric.md](geo/02-citability-rubric.md).
5. Re-run `scripts/geo/citability_score.py` after the writes. If `schema_completeness=0`, JSON-LD/schema deployment is failed or not visible; do not say "FAQPage JSON-LD embedded" or "schema complete".
6. Report exactly what changed, what was skipped, and what remains manual/external.

Hard failure states that must be named in the user-facing result:

- `metafieldsSet` count is 0 for this run → no `geo.*` metafield may be called deployed.
- `themeFilesUpsert` count is 0 for this run → no snippet, render hook, or JSON-LD may be called embedded.
- Product/page has no public `onlineStoreUrl` or is DRAFT → public GEO visibility and live PDP render verification are pending publish.
- Post-write `schema_completeness=0` → schema/JSON-LD is not complete, regardless of visible FAQ text.

---

## Optional External / Experimental Items

Only discuss these after the safe Shopify path is complete or when the user explicitly asks.

- **GA4 AI-referral tracking:** provide manual setup steps from [references/geo/04-ai-bot-allowlist.md](geo/04-ai-bot-allowlist.md). Do not claim completion unless Google credentials are available and the user explicitly requested external setup.
- **Real AI citation monitoring:** requires external paid tools, manual checks, or provider APIs. Do not present simulated preview as real engine measurement.
- **Indexing API / IndexNow:** requires external credentials and explicit opt-in.
- **`/llms.txt`:** hygiene-only experiment. Use [references/geo/01-llms-txt-spec.md](geo/01-llms-txt-spec.md), then verify the live route. If verification fails, report it as skipped/not supported instead of forcing completion.

---

## Data Integrity Rules

- Never invent statistics, reviews, awards, certifications, expert quotes, buyer quotes, or press mentions.
- If a claim has no source, either omit it or label it as merchant-provided draft copy requiring approval.
- Do not add `AggregateRating` or review-like schema unless real visible review data exists.
- Do not add FAQ schema unless the FAQ text is visible to users on the same page.
- Do not make medical, financial, legal, safety, or regulated-product claims unless the merchant provides compliant source material.

---

## Completion Criteria

A default GEO run is complete when:

- The audit output exists and clearly separates Shopify-executable work from external/manual work.
- The user approved any store writes.
- Approved metafields/metaobjects/snippets/render hooks were executed through the Shopify execution chain.
- `project/geo/mutation-ledger-{YYYY-MM-DD}.md` exists and every "deployed" claim has current-run mutation evidence plus post-read proof.
- At least one changed page was fetched and verified live.
- The report lists skipped external items instead of pretending they were completed.

Do not require GA4 setup, real AI citation tracking, Indexing API, or `/llms.txt` for default completion.

---

## Common Failure Modes

- Triggering GEO from plain SEO intent.
- Writing generic AI content instead of sourced, verifiable facts.
- Mutating `descriptionHtml` directly.
- Replacing theme files without first reading the live file.
- Adding schema for invisible content.
- Promising AI Overview ranking or ChatGPT citation.
- Treating GA4, Indexing API, or real citation monitoring as Shopify-native automation.
- Reporting pre-existing metafields, snippets, descriptionHtml FAQ, or JSON-LD as "deployed this session" without a matching mutation tool_call and a baseline-vs-post-read delta.
