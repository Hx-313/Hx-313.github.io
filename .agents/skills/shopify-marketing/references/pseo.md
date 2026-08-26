# Shopify Marketing Track: Programmatic SEO Strategist

Programmatic SEO (pSEO) generates landing pages at scale by combining a template + structured data. Done well, it captures long-tail traffic that hand-written pages can't economically cover. Done badly, it creates thin-content spam that triggers Google penalties.

## Explicit trigger gate

This skill is **explicit-only**. Use it only when the user clearly asks for:

- `pSEO`
- `programmatic SEO`
- `programmatic pages`
- `bulk SEO landing pages`
- `generate hundreds/thousands of SEO pages`
- `SEO at scale` with a bulk page-generation intent

Do **not** use this skill for:

- Normal keyword research, competitor analysis, or SEO audits → return to the marketing router and load `references/seo.md`.
- Optimizing an existing product/collection/page → return to the marketing router and load `references/seo.md`.
- A single "size guide", "city page", "comparison page", "alternative page", or "long-tail page" → use the classic SEO track or page-specific execution.
- GEO / AI citation work → return to the marketing router and load `references/geo.md` only on explicit GEO intent.

If the user has not explicitly asked for pSEO, respond with a classic SEO plan or ask whether they want to explore pSEO as a separate high-risk option.

## Prerequisite — existing pages must pass SEO health check first

pSEO **amplifies** whatever quality baseline a store has — including a bad one. Generating 500 new pages on top of a low-quality base typically triggers Google's Helpful Content Update penalty, which can drag down rankings for the existing pages too.

Before scaling pSEO:
- Run classic SEO audit mode from `references/seo.md` on **3–5 representative existing pages** (1 home + 1 collection + 2-3 top products)
- Average score must be **≥ 70/100** to proceed
- If average < 70 → fix existing pages first via the classic SEO track, then return here

This single gate prevents the worst pSEO failure mode: ranking drops on already-published pages.

## When to use this skill
- Store has **50+ SKUs** OR rich data dimensions (size, color, material, use-case, brand, occasion) that combine into search-intent patterns.
- A keyword pattern with **proven volume + low competition** is identified — e.g. "{material} crystal for {chakra}", "{size} dog harness for {breed}".
- The store has **proprietary data** the rest of the web doesn't have (your reviews, your sizing data, your custom fit/use-case combinations).

## When NOT to use
- Store has < 30 SKUs and no data depth → pSEO needs combinatorial breadth; small stores get more value from the classic SEO track on each existing page.
- No proprietary data — only repackaging public info → Google's Helpful Content Update (2022 → ongoing) penalizes this. Don't ship.
- AI-engine citation goal → use the GEO track. pSEO targets Google long-tail; GEO targets ChatGPT/Perplexity citations.
- Single high-value landing page → use `optimize-ecommerce-page-conversion` for that specific page.

## Quality gate — 6 principles to avoid penalty
pSEO fails when pages are thin or duplicate. Every generated page MUST satisfy:

1. **Unique value per page** — at least one piece of data (price, review snippet, use case, regional inventory) that no other generated page has.
2. **Proprietary data hierarchy** — your data > unique mashup of public data > pure public data. The further down, the more risk.
3. **Subfolder, not subdomain** — host at `yourstore.com/guides/{topic}/` not `guides.yourstore.com`. Subfolder inherits domain authority.
4. **Search intent match** — a "vs" page needs a comparison table; a "best X for Y" page needs a ranked list; a "size guide" needs a size chart. Generic blog template ≠ search intent fit.
5. **Quality over quantity** — a small set of useful, indexable pages beats a large set of thin pages. Always.
6. **Internal linking** — every generated page must be linked from a crawlable hub (collection page, sitemap, category index). Orphan pages don't get indexed.

## The 12 strategy playbooks (pick by intent)

| Playbook | Pattern | Best for |
|---|---|---|
| **Comparison** | `{Brand A} vs {Brand B}` | Shoppers in consideration phase comparing 2 known options |
| **Alternatives** | `Best {Brand} alternatives` | Shoppers dissatisfied with a known option |
| **Use case** | `Best {product} for {use case}` | "Best crystal for anxiety", "Best harness for hiking" |
| **Persona** | `{Product} for {audience}` | "Crystals for beginners", "Bags for nurses" |
| **Location** | `{Service / shop} in {City}` | Local marketplaces, multi-warehouse stores |
| **Specification** | `{Product} {spec}` | "5-piece crystal set", "10-pack suncatcher" |
| **Glossary** | `What is {term}?` | Top-of-funnel education, builds topical authority |
| **Curated list** | `Top 10 {category} {year}` | E-commerce listicles |
| **Compatibility** | `Does {A} work with {B}?` | Accessory and integration discovery |
| **Conversion / converter** | `Convert {A} to {B}` | Tool stores, B2B with calculators |
| **Profile** | `{Brand / supplier} review` | Marketplaces, supplier directories |
| **Translation** | `{Phrase} in {Language}` | International long-tail capture |

## Implementation framework (5 stages)

1. **Keyword pattern research** → confirm a pattern has volume (use the classic SEO research mode). Target: each generated URL has ≥ 30 searches/month combined.
2. **Data sourcing** → assemble the dataset. Required fields per row: title slug, primary keyword, ≥ 3 unique data attributes, ≥ 1 proprietary signal (review snippet, custom photo, in-house metric).
3. **Template design** → build a master template using Shopify Liquid. Variables for H1, meta tags, hero image, body sections, and structured-data block.
4. **Internal linking architecture** → before publishing the children, build the parent hub. Children link to siblings + parent; parent links to all children.
5. **Indexing rollout** → publish in tiers. Start with 10-50 pages, watch Search Console indexing rate for 14-30 days. If ≥ 80% indexed and no quality issues appear → propose the next batch. If < 50% indexed → stop and fix quality issues before adding more.

## Shopify capability support

pSEO on Shopify can be implemented, but only through explicit staged rollout. Never generate or publish pages in bulk without the gates below.

| Implementation | Shopify support | Practical limit / caveat |
|---|---|---|
| Page resources | Supported via `pageCreate` / `pageUpdate`; `PageCreateInput.templateSuffix` is supported | Best for small batches. Each page is a real Shopify Page and can be published. |
| Custom page templates | Supported through `shopify-theme-decorator` for broader template/section work; narrow pre-read `themeFilesUpsert` fallback for known page-template snippets | Fallback `themeFilesUpsert` overwrites target filenames and processes max 50 files per request; always read existing files first. |
| Metaobject-driven pages | Supported via `metaobjectDefinitionCreate` and `metaobjectCreate` | Requires theme templates that read metaobjects; more complex but better for structured datasets after a pilot. |
| Headless/Hydrogen | Supported by separate storefront architecture | Out of scope for this plugin's standard merchant flow. |
| Search Console indexing submission | Not a Shopify Admin capability | Manual or external credentials/API required. |

## Shopify execution chain

### Implementation A — Page resources (pilot 10-50 pages)
- Generate one Shopify Page per data row via `pageCreate` mutation. Each page gets its own template via `templateSuffix`.
- Custom template `templates/page.pseo.json` referencing Liquid sections from `shopify-liquid` skill.
- Validate GraphQL via `shopify-admin`, execute via `shopify-use-shopify-cli`.

Use this for the first pilot unless there is a strong reason not to.

### Implementation B — Metaobject-driven (structured, only after a successful pilot)
- Define a Metaobject type (e.g. `pseo_landing`) via `shopify-custom-data` skill.
- Build a Shopify Page template that reads the Metaobject by handle.
- Generate Metaobject entries via `metaobjectCreate` mutations in batch.

Use this only after the Page-resource pilot proves indexation and content quality.

### Implementation C — Headless / Hydrogen (large or complex routing)
- Out of scope for the standard plugin flow. If the user is on Hydrogen, route to `shopify-hydrogen` skill for the storefront layer.

## Execution gates

This skill must be conservative by default.

1. **Eligibility gate** — Run classic SEO audit mode first. Existing representative pages must average ≥ 70/100.
2. **Dataset gate** — Require a concrete dataset with one row per generated page, at least 3 unique attributes per row, and at least 1 proprietary signal per row. If data is mostly public/templated, stop.
3. **Pattern gate** — Require a validated keyword pattern and intent. In zero-API mode, call it directional; do not claim exact MSV/KD.
4. **Pilot gate** — First rollout is capped at 10-50 pages, not 100+. The user must explicitly confirm the exact count and URL pattern.
5. **Quality gate** — Every generated page must pass the pre-launch checklist below before publish.
6. **Observation gate** — Wait for indexing/traffic data before scaling. If Search Console is unavailable, report that scaling confidence is low.
7. **Scale gate** — Only after the pilot indexes cleanly should the user approve the next batch. Never jump from 0 to hundreds of published pages.

Before any write, enumerate every object to create/update, the template files to touch, the URL pattern, and rollback plan. This is a high-stakes batch content operation.

## Pre-launch checklist (every generated page must pass)
- [ ] Self-referencing canonical tag
- [ ] ≥ 300 words of unique, non-templated content (not counting boilerplate)
- [ ] Page loads < 2.5s on mobile (Lighthouse LCP)
- [ ] Mobile layout: tables and comparison blocks readable without horizontal scroll
- [ ] Internal site search returns the page for its primary keyword
- [ ] JSON-LD structured data appropriate to page type (Product / FAQPage / ItemList)

## Success metrics (track for 60 days post-launch)
| Metric | Target | Source |
|---|---|---|
| Indexing rate | ≥ 80% within 30 days | Google Search Console |
| Organic impressions | +50% on long-tail cluster within 60 days | GSC |
| Average position | Top 20 for ≥ 30% of generated pages | GSC |
| Conversion rate | ≥ 50% of site-average CR | GA4 / Shopify Analytics |

If indexing rate < 50% after 30 days → STOP scaling. The pages have a quality problem (thin content, near-duplicate, low internal links). Fix root cause before generating more.

## Output contract
When invoked, deliver:
1. **Pattern shortlist** — 3–5 candidate keyword patterns with volume + competition data
2. **Dataset spec** — required fields, sources, estimated row count
3. **Template wireframe** — section structure, variable map
4. **Internal linking plan** — hub page design, child-to-parent ratio
5. **Rollout schedule** — pilot (10-50 pages) → observe 14-30 days → next batch only after go/no-go gates
6. **Execution handoff** — which marketing track or Shopify execution skill runs each implementation step
