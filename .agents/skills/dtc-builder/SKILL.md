---
name: dtc-builder
license: MIT
description: Shopify zero-to-launch build orchestrator with no GraphQL execution. Owns the ordered connection, optional sourcing, product-listing, Collection organization, theme-decoration, audit, resume, and advisory launch-checklist flow, plus registration, plan/theme choice, navigation, and Markets guidance. Payment, shipping, tax, legal policy, and domain setup remain merchant-owned. Delegates confirmed Product and Collection outcomes—not mutations, API payloads, or field placement—to the shared `shopify-product-editor` Product/Collection executor, and theme outcomes to `shopify-theme-decorator`; auditors verify results. Uses `aw-shopify-oauth` for Connector OAuth. Trigger for whole-store builds such as "build my store from scratch", "zero to launch", "一键开店", "帮我开店", "从 0 到 1 开店", two or more sequential build stages in one request, or setup asks such as register a store, pick a plan, design navigation, enable Markets, or run a pre-launch checklist.
---

# Shopify Agent (Setup Orchestrator)

Setup-and-launch orchestrator for new Shopify stores. Owns the **non-API merchant-setup work** (registration, plan, payment, shipping, tax, policies, navigation, Markets) and **routes all covered writes through the plugin's sub-agent matrix**. Unsupported Metafield or discount writes remain explicitly gated main-Agent routes.

---

## 0. Zero-to-Launch Orchestration (the 3-stage chain + optional pre-launch checklist)

This skill **owns** the end-to-end store-build flow. When the user wants to go from "no store" / "empty store" to "launch-ready store", run the 3-stage chain below (Stage 0→3) **in order**. Do NOT fall back to one-stage-at-a-time conversation. Stage 4 is an **optional advisory checklist**, not a required build stage — the build is functionally complete after Stage 3.

**Trigger**
- Phrases such as `build my whole store`, `build a store from scratch`, `from scratch`, `end-to-end`, `zero to launch`, `start a Shopify store`, `launch a new store`, `一键开店`, `帮我开店`, `从 0 到 1 开店`, or equivalents in the user's language.
- The user names two or more sequential build stages in one turn, e.g. "list products AND decorate the theme".

**Do not trigger (these are single-stage maintenance on an existing store → handle via the plugin's Skill Routing, not this chain)**: "list these new products", "change the banner", "audit this page", "post to IG", "find suppliers", "set up monitoring".

**The 3-stage chain (+ optional Stage 4 advisory) — who runs each stage**

The main Agent **orchestrates** the chain. Heavy / write-intensive stages are **delegated to a sub-agent via `sessions_spawn`** (spawn mechanics + the brief shape live in plugin `prompt.md` → "Sub-Agent Spawn Governance"; per-write routing is the `## 🚦 Execution routing` and `## 6 Delegation` tables below). Everything else stays inline in the main Agent.

| # | Stage | Who runs it | How | Stage gate? | Post-stage validation |
|---|---|---|---|---|---|
| 0 | **Connection** | Main Agent (inline) | Read `../aw-shopify-oauth/SKILL.md` and drive the Connector OAuth flow (see §2 Authentication). | Mandatory (user must finish Connector OAuth in browser) | Live permission probe defined in `aw-shopify-oauth` |
| 1 | **Product sourcing & selection** *(optional — skip if user already has a SKU list)* | Main Agent (inline) | Read `dtc-product-selection` and run its honest-evidence workflow. If confidence is `not-recommended` (signal too weak / fails red lines), surface that and do NOT auto-advance — picking a different niche or aborting is valid. On user-confirmed candidate, hand off to the platform-bundled `product-supplier-sourcing` skill (Accio Work catalog; load via `skill-finder` if not currently in the host Agent's available skills) for supplier matching. Result MUST return to user for confirmation — never auto-advance into Stage 2. | **YES — in chat, present a visual summary: top candidates with inline reference images (`![](<imageURL>)`, URLs from real tool calls — never `image_generate`), key evidence, the confidence verdict; then link the full report/CSV. Await confirm before Stage 2.** | **Intentionally none** — no store write yet; the stage-gate confirmation is the only check |
| 2 | **Listing — push Products and organize Collections** | **Shared sub-agent: `shopify-product-editor`** | Main Agent confirms the Product batch and any Collection outcome, then sends one domain-separated Product/Collection brief. The shared executor loads `shopify-product-management` and `shopify-collection-management`, derives the declared cross-domain dependencies, and runs Product first only when Collection membership consumes Product results from this request. Such membership receives only verified successful Product GIDs; independent cross-domain work has no fixed Product-first order. | **YES (before spawn)** — show every Product value and approved image plus each Collection target, manual/smart rules or membership, publication outcome, and blast radius. One reply can confirm both only when this combined preview explicitly contains both domains. | **Sub-agent: `shopify-store-auditor`** (`scope: post-stage-2`) — verify requested Product visibility and confirmed Collection membership/surfaces. A dependent Collection failure after Product success is PARTIAL and never rolls back the Product. |
| 3 | **Theme decoration — shopper-visible style, content, and surfaces** | **Main Agent confirms the business/design outcome** → **Sub-agent: `shopify-theme-decorator`** (owns theme discovery, implementation, and dev-theme writes) → **Main Agent verifies the dev preview, then coordinates go-live after user approval** | Main Agent passes only the merchant category, brand/aesthetic direction, target surfaces, approved copy/assets, external inspiration URLs, constraints, user-confirmed scope, and visual success criteria. It does **not** preselect a base/recipe/implementation mode, name files/settings, map values into theme fields, or prescribe an API/deployment path. The decorator reads its theme skills, performs source intake when needed, chooses the implementation, writes only to a dev/unpublished theme, and returns implementation evidence plus preview/visual results. Main Agent judges the shopper-visible result, scope coverage, and remaining demo/content indicators, then runs the Stage-3 dev-preview and user-approval gates before go-live. | **YES, three business gates**: (1) before spawn — aesthetic direction, target surfaces, content/assets, and scope; (2) after the executor returns — show the dev preview and await explicit “looks good / publish”; (3) confirm the go-live business action. Main Agent never chooses the underlying mutation or field/file placement. | **Sub-agent: `shopify-store-auditor`** (`scope: post-stage-3`) — after go-live, verify the approved dev theme became live and the requested shopper-visible changes are present. |
| 4 | **Launch readiness check** *(optional — advisory, not a required stage)* | Main Agent (inline) — optionally spawn `shopify-store-auditor` (`scope: pre-launch`) if the user wants an independent check | Surface the §4.3 pre-launch checklist as recommendations. If the user wants a deeper look, optionally spawn the auditor and pass its report along. This is NOT a mandatory gate — the merchant decides what to configure and when to go public. | No (advisory only) | None required — the checklist is advisory |

**Operating rules**

- **Stage gates** (rows marked YES): summarize what is about to happen + what changes for the shopper, then wait for an explicit affirmative reply (per plugin Hard Rule #7). Silence / emoji / "you decide" is NOT consent. Run the gate **before** the corresponding `sessions_spawn`; the sub-agent inherits the confirmation and does NOT re-prompt.
- **Product/Collection pre-spawn assertion**: before preparing the first Product/Collection write preview or asking for confirmation, the Main Agent loads [`shopify-product-collection-write-brief`](../shopify-product-collection-write-brief/SKILL.md) completely. After the affirmative reply and before the first `shopify-product-editor` spawn, build its canonical nested brief. Require top-level `store_handle` and `resource_scope`; in every selected domain envelope require `operation`, non-empty `items[]`, `user_confirmed_at`, and `user_confirmation_summary`. Keep each domain envelope homogeneous; partition different primary operations in the same domain into separate sequential briefs for the same editor without splitting secondary capabilities or a dependent Product-to-Collection workflow. Declare that workflow's Product-to-Collection dependency with stable item intent IDs; omit dependencies for independent cross-domain work. Record `user_confirmed_at` after the affirmative reply and before spawning, and copy the exact utterance—for example `上架吧`—into `user_confirmation_summary`. Never rely on a failed sub-agent call to discover or repair missing evidence, and never emit the historical flat Product form. For an immediate shopper-visible Product launch, the preview and Product item separately enumerate `status: ACTIVE` and every exact Publication target; one reply can confirm both displayed outcomes, but the executor routes them separately. Existing Collections require an exact GID or confirmed title; creation requires a confirmed manual/smart kind and publication outcome; deletion requires a verified local Collection backup. For a declared dependency, the executor derives membership targets only from the named Product items it verifies successful.
- **Post-stage validation**: after Stages 2 and 3, **spawn `shopify-store-auditor`** with the matching scope rather than validating inline. On `BLOCKING` findings, return to the same stage to fix; do not advance.
- **Stage 1 is optional** — skip cleanly when the user already provides products / SKUs / supplier list, and state the skip. If Stage 1 runs but selection returns `not-recommended`, surface it honestly — do not pad the report or force Stage 2.
- **Stage gates must be visual, not just file links** — surface in-chat content (key bullets, candidate / product cards, inline reference images from real tool calls — never `image_generate`), then link deliverable files for depth. A bare "see `deliverables/xxx.md`" is not an acceptable gate.
- **Out-of-chain stages** (SEO, GEO, social marketing, monitoring) are NOT part of one-click launch. After Stage 3 completes (and the optional pre-launch checklist is surfaced), offer them as next steps via the plugin's Skill Routing.
- **Resumability** — if the user returns mid-chain, detect the last completed stage from store state (connection live? products exist? theme modified? password page status?) and resume from there. Do NOT restart from Stage 0 unnecessarily. When unsure, spawn `shopify-store-auditor` with `scope: "full-audit"` to discover the truth before advancing.
- **Stage-3 dev-preview gate is main-Agent-owned and cannot be delegated** — after `shopify-theme-decorator` returns the dev-theme reference, run the `shopify-storefront-validate` admin-preview workflow, hand the preview to the user, and coordinate go-live only after explicit approval. This user-facing gate describes the business action and does not preselect an API/CLI mechanism. **Never** verify theme work against the public store root when it may return password-page HTML.

---

## 🚦 Execution routing — this plugin uses sub-agents for all covered writes

This skill plans and briefs; it never executes writes itself.

| Want to | Route |
|---|---|
| Write Product data (create / update / delete / publish-toggle, single or batch) | Main Agent spawns `shopify-product-editor` with a Product envelope. |
| Write Collection data, rules, publication, or Product membership | Main Agent spawns the same `shopify-product-editor` with the canonical nested Collection envelope; a coupled Product + Collection request uses one combined, domain-separated brief. |
| Deliver a theme layout/content/style/asset outcome on a **dev** theme | Main Agent spawns `shopify-theme-decorator` with the business/design intent → runs the Stage-3 dev-preview gate → coordinates go-live after explicit user approval. |
| Read-only audit of one URL | Main Agent spawns `shopify-page-auditor` sub-agent. |
| Read-only audit of the whole store | Main Agent spawns `shopify-store-auditor` sub-agent. |

**Route C (no sub-agent yet — known architecture gap)**: standalone Metafield / Metaobject and discount writes are NOT owned by any sub-agent. Main Agent loads the applicable skills and selects/validates the technical mechanism itself while enforcing plugin Hard Rule #7 and any destructive backup gate. This skill hands Main Agent only business intent, affected entities/data, confirmation evidence, backup path when applicable, and success criteria—never an API payload.

Inside the shared `shopify-product-editor`, `shopify-product-management` selects Product mechanisms and `shopify-collection-management` independently selects Collection mechanisms. Combined work follows declared business dependencies: only a Collection item that consumes Product results is ordered after its named Product items; independent cross-domain work has no fixed Product-first order. Theme and other executors select their own Skill-backed chain. Those technical choices are executor concerns, not this Skill's.

---

## 🚨 Hard Rules (read first, violations cause skill failure)

**Inherited from plugin `prompt.md` — apply as-is, do not duplicate**: #0 (product = user core asset, backup-before-delete), #6 (store connection and authorization via `aw-shopify-oauth`, then official Shopify execution chain), #7 (enumerate-and-confirm before high-stakes writes), #9 (image discipline), Stage-3 dev-preview gate (`shopify-storefront-validate`).

**Skill-specific rules** (additive on top of plugin Hard Rules):

1. **No writes or API design from this skill** — all writes go through the routes in the Execution routing callout above. This skill plans, briefs, and orchestrates; it never executes a covered write, chooses/names the mutation or endpoint for a sub-agent, maps business values into API field paths, supplies an API payload, or prescribes a primary/fallback execution sequence. It sends business intent + data + constraints + confirmation evidence + success criteria, and the owning executor chooses the skill-backed mechanism.
2. **Cache confirmed identities, not API design**: retain user-confirmed location/channel names and any executor-returned GIDs in session memory for the same task. Do not query technical IDs in this orchestrator or prescribe where an executor places them.
3. **Quiet output**: no raw GraphQL/JSON dumps. Summarize results in 1-2 sentences. Use minimal-field queries when previewing.
4. **Confirm before critical merchant-owned operations**: present options for store name, theme, and pricing. Ask before browser hand-off (payment / KYC).
5. **Internal quality scores stay internal**: never reveal scores, dimension names, or the checklist itself. A low score must NOT block flow. See §3.2 for tip limits.
6. **Live pricing — never from memory**: Shopify plan prices, trial terms, transaction-fee rates MUST be fetched live per [`references/pricing-data-rule.md`](references/pricing-data-rule.md).
7. **Shop name / domain are admin-UI-only** — store handle, `*.myshopify.com` subdomain, and primary domain CANNOT be changed programmatically. If the user asks to rename the store or change domain, hand them the Shopify Admin path and stop; do NOT spawn a sub-agent or invent a workaround.
8. **Separate conversation and storefront languages** — the user's language controls interaction/reporting only. Before confirming shopper-visible text, use verified store locale/market configuration when available and clarify only unresolved source content, target language, market, or publication intent. Do not add this question to non-text changes.

---

## 1. When to use — and when NOT to

### ✅ Use this skill for:
- **Registration & onboarding**: pick store name, choose plan (Basic / Shopify / Advanced), choose theme (Horizon / paid), configure primary industry/category
- **Migrating from another platform** (WooCommerce / BigCommerce / Wix / Squarespace / Magento): follow Shopify's official migration guide at [help.shopify.com/manual/migrating-to-shopify](https://help.shopify.com/manual/migrating-to-shopify); after the import job finishes, return here for the optional pre-launch checklist + launch coordination
- **Pre-launch checklist (advisory reminders only)**: name what the merchant may want to check before going public — payment provider, shipping rates/zones, tax obligations, legal policy pages, domain binding. This skill only points at these items; it never configures, generates legal text, or advises on specific tax/registration matters. All of them are merchant-owned settings done in Shopify Admin (see §4.3). Treat as optional, not a blocking gate.
- **Information architecture**: main navigation, footer organization, customer account flow
- **Multi-currency / Markets setup**: enabling Shopify Markets, per-region pricing, currency rounding, market-specific languages
- **Launch coordination**: end-to-end checklist, pre-launch QA, deciding the order of tasks across other skills

### 🚫 Do NOT use this skill for (route instead):

| Task | Route |
|---|---|
| Product creation / variant updates / media upload / publish-toggle (single or batch) | Shared `shopify-product-editor` sub-agent using `shopify-product-management`. |
| Collection search/read or any Collection write, including membership after Product creation | Load `shopify-collection-management`; writes go to the same Product/Collection executor, `shopify-product-editor`. |
| Theme layout/content/style/assets, including hero, announcement bar, and navigation presentation | `shopify-theme-decorator` sub-agent → Stage-3 dev-preview gate → main Agent coordinates the approved go-live action |
| Whole-store launch-readiness audit | `shopify-store-auditor` sub-agent |
| Single-page SEO / GEO / CRO audit | `shopify-page-auditor` sub-agent |
| Metafields / Metaobjects standalone CREATE / UPDATE / DELETE | **Route C (main Agent direct)** via `shopify-custom-data` (design) → `shopify-admin` → `shopify-use-shopify-cli`. Same Hard Rule #7 + #0. |
| Discount codes / pricing rules / cart logic via Shopify Functions | **Route C (main Agent direct)** via `shopify-functions` (design) → `shopify-admin` → `shopify-use-shopify-cli`. Same Hard Rule #7. Deleting an active discount still triggers Hard Rule #0 backup. |
| Customer / order data writes | Out of scope. Refuse and ask the user to confirm intent first. |
| SEO meta / JSON-LD copy drafting | `shopify-marketing` SEO track drafts, then routes by affected surface: Product core meta/copy → `shopify-product-editor`; Collection core meta/copy → `shopify-product-editor` with a Collection envelope; theme/snippet → `shopify-theme-decorator`; every Metafield/Metaobject definition or value → `shopify-custom-data` first, then Main Agent Route C. |
| Cross-API doc lookup / API reference | `shopify-dev` |

**Hard rule**: when a write is covered by a sub-agent (product / Collection / theme), doing it inline bypasses the owner's per-item verification and structured-report contract. Always delegate. For remaining Route C rows, the main Agent carries Hard Rule #7 and any applicable backup gate manually.

---

## 2. Authentication & Connector Chain

Authentication is managed through the **Accio Work Shopify Connector** (managed OAuth).

- **Existing store connection**: delegate connection onboarding to [`aw-shopify-oauth/SKILL.md`](../aw-shopify-oauth/SKILL.md).
- **Mandatory check**: do NOT attempt any API operation until the store status shows as "Connected".
- **Full Auth rules**: see [`aw-shopify-oauth/SKILL.md`](../aw-shopify-oauth/SKILL.md).

If you find yourself reaching for `get_shopify_access_token` or raw `curl` — STOP and delegate. Direct API access from this skill is prohibited.

---

## 3. Quality & Policy Details

Implementation notes for Hard Rules 5-7:

### 3.1 Policy References
| Policy | Source-of-truth file |
|---|---|
| **Image discipline** | [`references/image-discipline.md`](references/image-discipline.md) |
| **Pricing & compliance** | [`references/pricing-data-rule.md`](references/pricing-data-rule.md) |
| **Safety & Confirmation** | [`references/safety-rules.md`](references/safety-rules.md) |
| **Field mapping** | [`references/csv-field-mapping.md`](references/csv-field-mapping.md) |

### 3.2 Quality scores (Internal transparency)
The agent runs an internal store health checklist ([`references/quality-checklist.md`](references/quality-checklist.md)) but stays fully transparent to the user:
- ❌ **Never reveal scores / dimension names / the checklist itself.**
- ❌ **A low score must not block any user flow** ("score too low to publish" is wrong).
- ✅ Each reply may contain **at most one** drive-by improvement tip ("By the way — this product only has 1 image; adding a few more angles would improve conversion").
- ✅ At session end, give at most 1 sentence of overall impression — no breakdown.

---

## 4. Setup workflow

### 4.1 Register a new store
1. Offer 3 store-name candidates with their meanings + .com domain availability → user picks. Note: the chosen name becomes both the store handle (`*.myshopify.com` subdomain) AND the registered store name; **once Shopify creates the store, neither can be changed programmatically** — only via Shopify Admin UI (and the subdomain swap effectively requires creating a new store). Confirm with the user before they commit at shopify.com.
2. Direct the user to [shopify.com](https://www.shopify.com) to register.
3. Plan: **Basic** is enough to start; suggest **Shopify** plan only when targeting GMV ≥ \$5000/mo. ⚠️ **Do not quote any plan price from this line** — actual fees, trials, transaction rates MUST be fetched live per [`references/pricing-data-rule.md`](references/pricing-data-rule.md).
4. Industry: pick the user's actual category — don't guess.

### 4.2 Theme strategy
- **Main-Agent responsibility**: confirm the merchant-facing direction — category, aesthetic, priority surfaces, content hierarchy, approved copy/assets, inspiration URLs, and what “looks right” means. Do not choose the technical base, style pack, section recipe, implementation mode, files/settings, or deployment mechanism.
- **Executor responsibility**: `shopify-theme-decorator` reads the theme-craft references, inspects the actual store/theme, performs source intake, and selects a safe implementation that satisfies the confirmed direction.
- **External GitHub/open-source themes**: pass the user-provided URL and intended use as business context only. Do not pre-classify it or instruct the executor how to install/adapt it.
- Paid themes (Impulse / Prestige / Motion) → quote the one-time \$280-\$400 fee and wait for approval.
- Avoid actively recommending niche third-party marketplace themes (too many pitfalls).

### 4.3 Pre-launch checklist (recommendations only — NOT executed by this skill)

These are **reminders the merchant configures themselves in Shopify Admin** — this skill never executes, configures, generates, or files any of them. It only points at what to look at. Treat the whole list as optional advisory: surface it as a "things you may want to check before going public" note, never as a mandatory gate that blocks launch. Payment, shipping, tax, legal, and domain are merchant-owned, legally sensitive, often irreversible store-level settings; the AI's role is limited to naming the item and pointing to where the merchant handles it.

| Item | What this skill may mention | Where the merchant does it |
|---|---|---|
| Payment | That a payment provider needs to be enabled before checkout works; may name common providers as examples | Merchant selects provider, completes payout/KYC, confirms fees in Shopify Admin |
| Shipping | That shipping zones/rates need to exist for the markets being sold to | Merchant creates rates/zones in Shopify Admin |
| Tax | That tax obligations may apply in target markets and a tax professional should be consulted — **do not advise on specific tax registration, withholding, or filing** | Merchant confirms registrations and configures tax settings; consults a professional |
| Policies | That policy pages (Refund / Privacy / Terms / Shipping) are typically expected — **do not draft or generate legal text; recommend the merchant use Shopify's policy generator or a lawyer** | Merchant writes/reviews/publishes their own legal text, obtains legal advice |
| Domain | That the store can launch on `.myshopify.com` or a custom domain | Merchant binds the domain in Shopify Admin / their registrar |

### 4.4 SEO at listing time
Include only business/content requirements in the product/listing brief: desired handle, title direction, meta-description direction, and image alt-text intent. Exact field formats, API mapping, and mutation choice belong to the downstream executor and its loaded skills.

### 4.5 Multi-currency / Markets
Default: storefront uses the seller's home currency.

If selling cross-border, plan **Shopify Markets** — Shopify can auto-detect visitor country and display local currency when configured:
- Settings → Markets → Add market (per country/region)
- Pricing → enable "Adjust prices automatically" or set per-market overrides
- Reference: [shopify.com/markets](https://www.shopify.com/markets)

**Common combos**:
- US merchant selling US + CA → primary USD, CA market with auto CAD + 0-3% rounding
- CA merchant selling CA + US → primary CAD, US market with auto USD
- EU merchant selling EU + UK → primary EUR, UK market with GBP

**Caveat**: changing the *default* currency after orders/payouts have started is irreversible. Treat currency, payment, tax, market, and domain changes as merchant-owned store-level settings unless an explicitly authorized execution flow exists.

---

## 5. Information architecture (owned by this skill)

### 5.1 Homepage block plan (the *plan*; push delegated)

| Shopper-visible block | Content intent | Desired shopper experience |
|---|---|---|
| Hero | Hero product + CTA “Shop Now” | Clear first-screen value proposition and primary shopping action |
| Featured products 1 | Hero SKUs | Easy scanning of priority products |
| Trust/USP row | Free shipping / 30-day returns / Secure checkout | Compact trust cues before deeper browsing |
| Featured products 2 | Recommended / new arrivals | Secondary discovery path |
| Footer | Contact info + Newsletter + legal-page links | Clear support, trust, and subscription access |

### 5.2 Navigation IA
- **Main nav** (≤ 5 items): Home / Shop / Best Sellers / About / Contact
- **Footer** (3 columns): Customer Care / Quick Links / Connect

### 5.3 Brand aesthetic → palette options
Read brand/aesthetic notes from the product brief, user input, or upstream selection output → offer 2-3 palettes. **Never default to plain black & white.**
**Fallback** — if no brand direction exists: ask inline "Pick one: minimalist neutral / creamy forestcore / bold modernist / vintage film / Japandi / industrial / coastal", then proceed. Do NOT guess. The chosen palette is handed to downstream authoring/execution skills.

### 5.4 Theme business direction (owned before theme spawn)

Before Stage 3, the Main Agent resolves and confirms only the merchant-facing design brief. Minimum business inputs:

```json
{
  "category": "home organization",
  "aesthetic": "warm, trustworthy, product-led retail",
  "priority_surfaces": ["homepage", "product page", "collection page"],
  "content_priorities": ["best sellers", "dimensions/use cases", "shipping and returns"],
  "approved_assets": ["brand logo URL", "approved product images"],
  "inspiration_urls": ["user-provided URL, optional"],
  "visual_success_criteria": ["clear first-screen CTA", "consistent mobile cards", "no demo content"]
}
```

Do not add `base_theme`, `style_pack`, `section_recipe_id`, `implementation_mode`, file paths, setting ids, Liquid structure, or API/deployment instructions. Those are executor-owned decisions. User-facing confirmation should describe the practical style and surfaces, for example “warm, high-conversion retail experience for home organization.”

---

## 6. Delegation & collaboration

This skill is the **orchestrator** — it turns a product/store brief into a launch plan and hands fully-resolved **business-intent briefs** to sub-agents (or, for remaining Route C work, to main Agent). “Fully resolved” means the desired outcome, data/assets, constraints, confirmation evidence, and success criteria are complete; it never means an API payload or implementation prescription. All collaboration is single-table here; no other section duplicates this.

| Direction | Counterpart | Data flow |
|---|---|---|
| Upstream | Product / brand brief from user, `dtc-product-selection`, or another host skill | SKU list, supplier URLs, target customer, brand/aesthetic notes, pricing/unit economics if available |
| Downstream (writes — product) | `shopify-product-editor` sub-agent (main Agent spawns) | The canonical Product envelope from `shopify-product-collection-write-brief`, plus the merchant-facing data required by the operation, optional report language/additional verification, constraints, and publication targets when publishing. For shopper-visible text, include separately confirmed source content language and any requested target language/market/publish outcome; these are business facts, not API fields. Inventory location is optional: the executor may use the only active location and returns choices without writing when several exist. Keep one product's data together, but do not name a mutation, specify GraphQL nesting/field positions, tell the executor which reference/script to use, or dictate API-call count/order. Supplier/source metadata remains optional and non-gating. Delete intents include the backup path. The sub-agent builds the route, executes, verifies, and reports. |
| Downstream (writes — Collection) | Shared `shopify-product-editor` sub-agent (main Agent spawns once for a combined Product/Collection request) | The canonical separate Collection envelope with exact target or confirmed creation identity, manual/smart business rules, publication outcome, confirmation evidence, backup path for delete, and observable success criteria. In a combined request the executor supplies only its own verified successful Product GIDs to membership. Never prescribe a tool, mutation, payload, or call sequence. |
| Downstream (writes — theme) | `shopify-theme-decorator` sub-agent (main Agent spawns) | Business brief: target dev theme or permission to create a safe unpublished working copy, target shopper-visible surfaces/outcomes, brand/aesthetic direction, approved content/assets, user-provided inspiration/source URLs, constraints, confirmation evidence, visual success criteria, report language, and—when copy changes—separately confirmed source content and target language/market intent. Do not include section recipes, implementation modes, file/setting locations, API choices, or deployment commands. The decorator performs source intake and implementation selection itself, then returns preview and evidence for the Main Agent's visual/user-approval gates. |
| Downstream (writes — Route C: Metafield / discount) | Main Agent direct with the applicable skills loaded | Business intent, affected entity ids when they exist, merchant-facing data/desired values, confirmation evidence, backup path for destructive deletes, and observable success criteria. This orchestrator does not supply a mutation, API field mapping, or payload; Main Agent derives those from the execution skills because no owning sub-agent exists. |
| Downstream (audits) | `shopify-store-auditor` / `shopify-page-auditor` sub-agents | Read-only business verification scope plus affected entities and expected observable outcomes. For post-Stage-2 readiness, ask whether each user-requested product is actually shopper-visible on the Online Store; do not prescribe the field/query used as evidence. |
| Downstream implementation skills | Selected by the owning executor | The orchestrator does not tell a sub-agent which supporting API/design skill, mutation, endpoint, or field mapping to use. The executor discovers and applies the relevant skills itself. |
| Post-launch | `dtc-monitoring-and-daily-report` | Store URL + launch summary → traffic / conversion / Clarity tracking |

**Collaboration rules**:
- When an upstream detail is missing, **find or ask first — never silently fabricate**.
- When a step requires a covered write, hand main Agent a business-intent brief and let it spawn the right sub-agent. Never inline-execute the write or smuggle API advice into the brief. Remaining Route C work stays direct only because no owning sub-agent exists yet.
- After a sub-agent / Route C execution returns, resume orchestration and update the launch progress bar:
  ```
  Progress: ✅ Register → ✅ Configure → 🔄 Listing (1/4) → ⏳ Decorate → ⏳ Open
  Progress: ✅ Register → ✅ Configure → ✅ Listing → ✅ Decorate → 🎉 Ready to open
  ```

### Action log (orchestrator-level)
Append one line per high-level milestone (registration confirmed, payment configured, X products live, theme decorated, store opened) to `project/.workspace/_shopify-actions-log.csv` with columns: `timestamp, milestone, status, notes`. Per-API-call logging is owned by the sub-agents (or by main Agent for Route C).

---

## 7. Deliverables

After a build session, give the user a short summary: store URL, theme, number of SKUs live, configured items, next steps, storefront preview link. Don't mechanically generate a `.md` report unless the user explicitly asks.

**Optional artifact templates** (use only when the user wants a written record):
- [`templates/launch-deliverable-template.md`](templates/launch-deliverable-template.md) — full launch summary
- [`templates/decisions-template.md`](templates/decisions-template.md) — decision log

> **Implementation boundary**: this skill never authors API snippets/payloads or theme implementation files for a delegated write. Product and Collection writes share `shopify-product-editor` while keeping separate domain Skills and envelopes; theme writes go to `shopify-theme-decorator` and then through the Stage-3 dev-preview/go-live gates. Metafield and discount writes remain Route C until they gain owners. `aw-shopify-oauth` stays limited to the Accio Work → Shopify Connector OAuth flow.
