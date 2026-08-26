---
name: shopify-marketing
description: |
  Unified Shopify marketing router for SEO, explicit pSEO, explicit GEO / AI-search
  visibility, and confirmed social-media drafts/posts. Use when the user asks for
  Shopify marketing, Google/organic SEO, explicit pSEO / programmatic SEO, explicit
  GEO / AI Overviews / ChatGPT / Perplexity citation visibility, or IG/X social
  promotion for a Shopify product, or a user starts/customizes a recommended Campaign
  draft. This skill routes to exactly one reference file
  for the requested track; it must not run a broad "full marketing" bundle.
---

# Shopify Marketing Router

This skill is a **router with safety gates**, not a combined execution playbook. Load exactly one track reference for the user's current intent, unless the user explicitly asks for a sequenced multi-track plan.

## Hard Routing Rules

1. **Classic SEO intent** → read only [`references/seo.md`](references/seo.md).
   - Triggers: SEO audit, Google ranking, organic search, keywords, competitor SEO, meta title, meta description, image alt, canonical, robots, sitemap, structured data, rich results, indexing.
   - Do not load pSEO, GEO, or social-media references for ordinary SEO.

2. **Explicit pSEO intent** → read only [`references/pseo.md`](references/pseo.md).
   - Triggers only when the user explicitly says pSEO, programmatic SEO, programmatic pages, bulk SEO landing pages, or generating many SEO pages at scale.
   - If the user asks for a single long-tail page, size guide, comparison page, city page, or ordinary keyword work, use classic SEO instead.

3. **Explicit GEO / AI-search intent** → read only [`references/geo.md`](references/geo.md).
   - Triggers only when the user explicitly says GEO, generative engine optimization, AEO, answer-engine optimization, AI search visibility, AI Overviews, LLM citation, ChatGPT / Perplexity / Claude / Gemini citation, or similar.
   - Do not infer GEO from generic SEO, "make content better", "add FAQ", "add schema", "allow AI bots", or "use AI".

4. **Social post / IG / X intent or materialized Campaign draft** → read only [`references/social-media.md`](references/social-media.md).
   - Triggers: promote this Shopify product, post to Instagram, post to X/Twitter, make an IG caption/tweet, or a `campaign-recommendation` whose user choice is `start_draft`/`customize` has been materialized into content slots by `shopify-social-campaign`.
   - A raw `campaign_recommendation.matched == true` stays with `shopify-social-campaign`; it is a recommendation, not permission to generate or publish social content.
   - Starting a Campaign creates drafts only. Every external post needs exact-content confirmation after final content exists.

5. **Ambiguous marketing intent** → ask one clarifying question or offer the four tracks as choices. Do not choose pSEO, GEO, or social publishing by implication.

## Cross-Track Safety

- Default to one track per run. A multi-track plan must be staged, for example: classic SEO baseline → explicit GEO audit → explicit social post.
- pSEO and GEO are explicit-only. Never run them because the user said "SEO", "marketing", or "visibility".
- GEO changes are additive and must not overwrite classic SEO titles, meta descriptions, canonical rules, standard robots rules, Product/Breadcrumb/Organization JSON-LD, or theme performance work.
- Social publishing must never be bundled into SEO/GEO/pSEO execution. It requires connected platform authorization, policy preflight, final content review, and an exact-payload confirmation. A remote permalink is best-effort and is not part of the P0 success contract.
- Store writes follow plugin Hard Rule #0: show blast radius and get confirmation before mutating Shopify data, theme files, pages, metafields, or external social accounts.
- If a reference file links to supporting files, resolve them relative to this skill directory.

## Reference Map

| Track | File | Supporting files |
|---|---|---|
| Classic SEO | `references/seo.md` | none |
| pSEO | `references/pseo.md` | none |
| GEO / AI-search visibility | `references/geo.md` | `references/geo/*`, `scripts/geo/*` |
| Social media marketing | `references/social-media.md` | `references/social-media/*`, `templates/social-media/*` |

## Completion Contract

End with the track actually used, what was read, what changed or was only drafted, and the verification evidence. If you skipped a track because it was not explicitly requested, say that briefly.
