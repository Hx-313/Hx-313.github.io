# Shopify Marketing Track: Classic SEO

This skill is the single intent and planning entry point for **classic Shopify SEO**. It replaces the previous split between keyword research, competitor analysis, page audit, and on-page SEO coordination; it does not take ownership away from the Product, Collection, theme, or custom-data writer that owns the affected resource.

SEO here means improving pages for organic search engines such as Google and Bing. It does **not** guarantee rankings, and it does **not** cover:

- Programmatic SEO at scale → stop this track and load `references/pseo.md` only if the user explicitly asked for pSEO.
- GEO / AI citation optimization → stop this track and load `references/geo.md` only if the user explicitly asked for GEO / AI-search visibility.
- Conversion-rate optimization → `optimize-ecommerce-page-conversion`
- Paid ads or social growth → hand off outside this skill

## Progressive workflow

Use the narrowest mode that satisfies the user's request. Do not run every mode by default.

| User asks for | Mode | Writes store? | Output |
|---|---|---:|---|
| "Find keywords", "what should we target", "content calendar" | A. Research | No | Keyword map + content backlog |
| "What are competitors doing", "SERP/content gap" | A. Research | No | Competitor/gap report |
| "Audit this page/store", "SEO score" | B. Audit | No | Score + prioritized fixes |
| "Optimize this page", "fix meta/schema/canonical" | C. Plan + Execute | Yes, after confirmation | Mutations + verification |
| "Has it improved?" | D. Verify | No by default | Before/after evidence |

If the user simply says "帮我做 SEO", start with **B. Audit** on representative pages, then present a plan. Do not write to the store until the user confirms the exact affected objects and changes.

## Mode A: Research

Use for keyword strategy and competitor analysis. This mode is read-only.

### Keyword research

Default to **zero-API mode** unless the user explicitly provides paid-tool credentials. Zero-API mode may use web search, SERP inspection, autocomplete-style suggestions, and page analysis. It produces directional opportunity bands, not authoritative monthly search volume or keyword difficulty.

Classify each keyword:

| Intent | Examples | Target page |
|---|---|---|
| Transactional | buy, price, discount, shop | Product / collection |
| Commercial | best, review, vs, alternative | Collection / buying guide |
| Informational | how, what, care, guide | Blog / guide |
| Navigational | brand, login, support | Homepage / support |

Produce:

- Primary keyword per existing product/collection/page
- Missing page opportunities
- Topic clusters and internal-link recommendations
- Priority: `P0` quick win, `P1` growth, `P2` authority, `P3` optional

Save substantial research to `project/seo/keywords-YYYY-MM-DD.md` and, when useful, `project/seo/keywords-YYYY-MM-DD.json`.

### Competitor analysis

Use competitor URLs the user provides, or ask the user to provide 3-5 organic competitors. Do **not** pretend web search can reliably identify true SEO competitors without confirmation; ads, marketplaces, SERP widgets, and affiliates often pollute results.

For each confirmed competitor, inspect only public pages:

- Homepage
- One representative collection/category page
- One representative product page
- Sitemap/robots if accessible

Extract title, meta description, H1/H2 structure, visible content depth, canonical, JSON-LD types, internal-link patterns, and obvious content/schema gaps.

Do **not** claim backlink profile, exact traffic, exact ranking position, or exact search volume unless a paid/source-backed tool provides it.

Save substantial competitor work to `project/seo/competitor-analysis-YYYY-MM-DD.md`.

## Mode B: Audit

Use for a single URL or a representative site sample. This mode is read-only.

### Evidence gate

An Admin GraphQL object read is inventory evidence, not rendered-page evidence. It cannot establish the live `<title>`, meta description, H1/H2 structure, canonical, indexability, JSON-LD, image-alt coverage, internal links, robots, sitemap, mobile behavior, LCP, CLS, or INP. Never infer those checks from Product, Collection, `shop.name`, or `shop.description` fields.

For every URL, collect the public rendered HTML and record evidence for title/meta, headings, canonical, indexability, structured data, image alt, and internal links. Performance evidence must come from an actual measurement or a clearly labelled HTML-level risk observation; never turn a guessed risk into a measured metric. Fetch `/robots.txt` and `/sitemap.xml` separately for a sitewide audit.

Use the read-only `shopify-page-auditor` for one PDP or collection URL when available, or perform the same public-page inspection inline. Do not route a classic SEO page sample to `shopify-store-auditor`; that sub-agent owns launch-readiness checks, not this evidence contract.

Before showing any numeric score, create the audit JSON described by `scripts/seo_workflow_guard.py` and run the guard. Use `python3 scripts/seo_workflow_guard.py schema` to inspect its exact audit, plan, and finalize input fields; do not discover the contract through failed calls.

```bash
python3 scripts/seo_workflow_guard.py audit --input <audit-evidence.json>
```

- If the receipt says `audit_status: insufficient_evidence`, report the missing evidence and do **not** show a numeric score or a Good/Critical label.
- Only a receipt with `score_allowed: true` permits the scorecard below.
- A paid tool or browser limitation must be reported as `not_measured`; it is not zero and it is not permission to estimate.

For "sitewide SEO audit", sample:

- Homepage
- 1-2 collection pages
- 2-5 product pages
- 1 blog/static page if present

Score each page out of 100:

| Category | Points | Checks |
|---|---:|---|
| Meta and SERP preview | 25 | title length/uniqueness, description, canonical, OG basics, language |
| Content and semantics | 25 | H1, heading order, word count fit, image alt coverage, internal links |
| Crawlability and structured data | 25 | indexability, robots, sitemap, page-type JSON-LD, breadcrumbs |
| Performance and mobile risk | 25 | payload size, excessive JS/CSS, image sizing, mobile overflow signals |

Use these thresholds:

| Score | Status |
|---:|---|
| 90-100 | Excellent |
| 70-89 | Good |
| 50-69 | Needs work |
| <50 | Critical |

Output:

- Score breakdown
- Critical issues with evidence
- Prioritized fix list
- Which fixes require Shopify writes
- Which fixes are manual or need third-party tools

Save substantial audits to `project/seo/audit-YYYY-MM-DD-<handle>.md` or `project/seo/site-audit-YYYY-MM-DD.md`.

## Mode C: Plan + Execute

Use only after the user asks to make SEO changes or accepts an audit plan.

### Confirmation gate

Before any store write, enumerate:

- Object type and identifier: product / collection / page / article / theme file
- Current value fetched from Shopify or page source
- Proposed value
- Owning execution surface: Product, Collection, theme, custom data, or manual/external
- Blast radius: what shoppers/search engines may see

Also record the verified full `*.myshopify.com` `store_handle`, one stable `change_id`, the public URL, and traceable `evidence_sources` for each proposed shopper-visible claim. Product media alt changes require visual inspection of the exact media ID; existing alt text alone is not visual evidence.

Put these entries into the exact manifest schema accepted by `scripts/seo_workflow_guard.py`, then run:

```bash
python3 scripts/seo_workflow_guard.py plan --input <seo-change-manifest.json>
```

Show the user the full change list, count, owners, and returned `manifest_hash`. Wait for explicit confirmation of that exact preview before executing. A generic response such as “按顺序优化”, “都做”, or “继续” authorizes writes only when the immediately preceding preview already contained every exact current/proposed value, ID, URL, owner, blast radius, and manifest hash. Examples, placeholders, unresolved IDs, or a high-level phase list are not a write preview.

Any edit to a value, target ID, owner, count, or scope creates a new manifest hash and requires a new preview and confirmation. Batch updates are allowed only when the user confirms the full count and scope.

The guard validates structure and ownership; it does not grant confirmation and it does not execute Shopify writes.

### Shopify capability matrix

Use this matrix to decide whether a requested SEO fix is directly executable, conditionally executable, or only reportable.

| SEO fix | Shopify support | Execution path | Notes |
|---|---|---|---|
| Homepage SEO title/description | Manual unless the exact storefront surface is validated | Merchant Online Store preferences, or a validated theme-owned route | `shop.name` and `shop.description` are not proof of the rendered homepage SEO title/meta. Never rename the shop or silently substitute a Product SEO edit. |
| Product SEO title/description | Direct | Shared `shopify-product-editor` → `shopify-product-management` → `scripts/update_product.mjs` | Marketing owns research, audit, and approved copy; Product owns the write and verification. |
| Collection SEO title/description | Direct | Shared `shopify-product-editor` → `shopify-collection-management` → `scripts/update_collection.mjs` | Marketing owns research, audit, and approved copy; Collection owns the write and verification. |
| Product body/content copy | Direct | Shared `shopify-product-editor` → `shopify-product-management` → `scripts/update_product.mjs` | Treat as a shopper-visible Product content write. |
| Collection body/content copy | Direct | Shared `shopify-product-editor` → `shopify-collection-management` → `scripts/update_collection.mjs` | Treat as a shopper-visible Collection content write. |
| Page content/title/handle | Direct for content fields, not confirmed for `SEOInput` | `pageUpdate(id, page)` | Use for title/body/handle/template. Do not claim Page has object-level `seo` unless validation confirms it. |
| Blog article content/title/summary/handle/image alt | Direct for content fields, not confirmed for `SEOInput` | `articleUpdate(id, article)` | Use `summary` and theme meta behavior for SEO descriptions unless schema validation confirms a dedicated SEO field. |
| Product media alt text | Direct | Shared `shopify-product-editor` → `shopify-product-management` advanced-media route | Requires product media IDs; the Product Skill selects and validates the operation. |
| Standalone file/video alt text | Direct where file type supports alt | `fileUpdate(files: [{ id, alt }])` | Validate by file type. |
| JSON-LD / structured data | Theme-level | `shopify-theme-decorator` for broader theme work; narrow pre-read `themeFilesUpsert` fallback for known snippet/template patches | Read current theme files first; inject or update snippets/templates safely. |
| Canonical markup | Theme-level | `shopify-theme-decorator` for broader theme work; narrow pre-read `themeFilesUpsert` fallback only if missing/broken | Most themes already render `{{ canonical_url }}`. Prefer audit/report unless missing or broken. |
| `robots.txt.liquid` standard SEO rules | Theme-level | narrow pre-read `themeFilesUpsert` fallback or local theme pull/push | Read existing file first and preserve Shopify defaults where possible. |
| Sitemap submission | Not executable through Shopify Admin | Manual/Search Console/Bing Webmaster | Shopify generates sitemap; this skill can verify URL and provide instructions. |
| Core Web Vitals | Partially executable | Theme/image/script fixes where obvious | CrUX/GSC validation requires time and external measurement. |
| Google indexing / Search Console | Not executable without external credentials | Manual or external API if configured | Do not claim submission without credentials and tool response. |

Execution ownership and requirements:

- For Product or Collection core copy/SEO, produce the approved before/after business outcome and route a canonical Product or Collection envelope to the shared `shopify-product-editor`. Do not execute or prescribe GraphQL inline; the owning domain Skill performs dry-run, apply, and verification.
- Treat the owning Skill's nonzero exit, `ok: false`, stale ID, missing target, or verification mismatch as terminal for that manifest item. Do not guess a replacement GID, retry against a different object, run an empty mutation as a probe, or silently change the task. Re-read and re-plan under a new manifest hash if the target must change.
- Shopper-visible copy must not add unverified shipping, delivery, discount, scarcity, inventory, material, performance, certification, warranty, or safety claims. Every such claim needs a traceable `shopify:`, `merchant:`, `public:`, or `rendered:` evidence source in the manifest.
- Use `shopify-admin` to validate Admin GraphQL only for surfaces whose owning route explicitly requires the Admin fallback. If validation shows a field is unavailable in the current API version, do not execute; downgrade to a theme-level or manual recommendation.
- Use `shopify-liquid` for Liquid/snippet/template code before theme writes.
- Use `shopify-custom-data` before defining or writing SEO metafields.
- For simple SEO snippets/templates, `shopify-use-shopify-cli` through `shopify store execute` may be used as a narrow fallback after reading the exact target files. For broader Liquid/theme/layout/template work, send the business outcome and evidence to `shopify-theme-decorator`; it selects its skill-backed discovery, write, and preview-validation path.
- For text and JSON fallback writes, use `themeFilesUpsert` with `body.type = TEXT`.
- For image/binary assets, use the appropriate Shopify file/media flow; do not invent CDN URLs.
- For theme-level fallback changes, first resolve the live/dev theme via `query { themes(first: 10) { nodes { id name role } } }`, read the exact target file with `theme(id) { files(filenames: [...]) ... }`, then write the modified file. Never overwrite a theme file from memory.

### What not to execute here

- Do not run pSEO bulk page generation. Return to the marketing router and load `references/pseo.md` only on explicit pSEO intent.
- Do not write Product or Collection core SEO/copy directly from this track. Route the confirmed outcome to its owning domain Skill through the shared editor.
- Do not run AI bot allowlist / `/llms.txt` as an SEO default. Return to the marketing router and load `references/geo.md` only when the user explicitly asks for AI-search visibility.
- Do not claim Core Web Vitals are fixed without measurement. You can reduce obvious theme bloat, but CrUX/GSC validation needs time.
- Do not submit Google Search Console or Merchant Center unless credentials/access are present.
- Do not fabricate reviews, ratings, certifications, stock status, or factual claims for schema.
- Do not add `AggregateRating` unless real review data is present and visible to shoppers.
- Do not create or alter canonical URLs in a way that hides products/collections from indexing without explicit confirmation.

## Mode D: Verify

After execution, verify with evidence:

- Re-read the Shopify object and confirm changed fields match.
- Fetch the affected URL and confirm title/meta/canonical/schema appears in HTML.
- For JSON-LD, parse the script block and confirm page-type fields are present.
- For robots changes, fetch `/robots.txt`.
- Record any third-party validation the user must run manually, such as Google Rich Results Test or Search Console URL Inspection.

For the exact confirmed manifest, record one result per `change_id` and run:

```bash
python3 scripts/seo_workflow_guard.py finalize --input <seo-finalize.json>
```

The finalize receipt, not the mutation response or the model's narrative, owns completion status:

- `success` requires the owning-surface receipt, Shopify object read-back, and rendered public HTML verification for every requested change.
- A missing result, failed write, changed target, missing read-back, or missing rendered verification makes the overall status `partial` or `failed`.
- Mark the task complete only when `task_completion_allowed: true`. Otherwise preserve the failed/unverified items in the final report and next-step plan.
- A successful field write proves only that the verified field changed. Do not claim CTR, ranking, traffic, image-search, or conversion improvement until later measurement provides evidence.

Report as:

- `overall_status`: exact value from the finalize receipt
- `requested / succeeded / failed / unverified`: exact counts from the receipt
- `changed`: exact object/path
- `before`: old value
- `after`: new value
- `verification`: fetched field or HTML excerpt
- `remaining_manual_steps`: Search Console, Rich Results Test, Merchant Center, paid-tool checks

## Practical defaults

For a new Shopify store, the default SEO plan is:

1. Audit homepage, one collection, and top products.
2. Fix indexability, canonical, title/description, Product/Breadcrumb/Organization schema.
3. Map 5-10 transactional/commercial keywords to existing pages.
4. Add collection intro copy and product FAQ only where it serves search intent. (Note: FAQ content should be written for users and AI extraction — visible, self-contained Q&A text. Do NOT promise FAQ rich results: Google retired FAQ rich results for all sites on May 7, 2026, and commerce sites have been excluded since Aug 2023.)
5. Verify rendered HTML and Shopify object state.
6. Defer pSEO, GEO, CRO, and monitoring until the base pages are healthy.
