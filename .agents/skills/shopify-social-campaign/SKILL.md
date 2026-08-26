---
name: shopify-social-campaign
description: Recommend and coordinate safe Shopify social campaigns for newly public products, including an optional seven-day Instagram launch plan, deterministic eligibility, draft-only activation, and handoff to the Shopify marketing social track for IG/X content and publishing. Use when the user asks for a Shopify social campaign, a seven-day product launch, new-product social promotion, or when the daily patrol emits `campaign_recommendation.matched == true`. Do not use for SEO, Blog, email, paid ads, or general cross-channel growth strategy.
---

# Shopify Social Campaign

Coordinate the social campaign lifecycle without treating a recommendation, schedule, Connector, or earlier approval as publishing consent.

## Hard boundaries

1. Verify one active Shopify store through `aw-shopify-oauth` before reading live product data.
2. Use `shopify-new-product-monitor` for new-product eligibility. Never let a model decide whether a product is new.
3. Read [`references/seven-day-campaign.md`](references/seven-day-campaign.md) and run `scripts/recommend_campaign.py` for every seven-day recommendation.
4. Validate the output shape against [`references/campaign-recommendation.schema.json`](references/campaign-recommendation.schema.json). Do not override deterministic decisions or reason codes with model judgment.
5. `start_draft` and `customize` authorize draft materialization only. They do not approve text, media, schedule, target account, or publishing.
6. Route materialized content slots to the `shopify-marketing` social track. That track owns platform copy, product-preserving media, policy preflight, exact payload confirmation, and Connector execution.
7. Never create a `social_publish` action before exact content exists. Every edited item gets a new `payload_hash` and loses its old approval.
8. A cron run may recommend or prepare drafts; it may not publish.
9. Recommendation, Campaign, slot, action, preflight, and hash states come only from deterministic script receipts. Never manufacture them in prose or treat chat history as durable storage.

## Workflow

### 1. Resolve facts

Read the current product and normalize status, public HTTPS URL, anonymous accessibility, media count, inventory status, policy risk, and unresolved-claim count. Resolve Instagram capability as `available`, `read_only`, `missing_scope`, `not_connected`, `not_implemented`, or `error`.

### 2. Recommend

Run:

```bash
python3 skills/shopify-social-campaign/scripts/recommend_campaign.py \
  --input normalized-campaign-input.json
```

Expose `recommended`, `not_recommended`, or `unknown`, stable reason codes, blockers, warnings, and the available choices. The default recommended plan is three Instagram drafts on days 1, 3, and 6 of a seven-day learning window.

### 3. Handle the user's choice

- `start_draft`: materialize the current plan into draft content slots.
- `customize`: change frequency, pillar, objective, or channel, then re-run eligibility.
- `skip`: dismiss this recommendation only.
- `mute_similar`: persist the preference only after explicit selection.

Missing Instagram capability may leave draft creation available with `publish_readiness=blocked`. Inactive, private, media-less, out-of-stock, high-risk, muted, or materially unknown products receive no executable plan.

For `start_draft`/`customize`, write the normalized Campaign plan outside the patrol root and call `patrol_store.py campaign create --input ...`. The receipt's `campaign_id` and `planned` slots are the only proof that draft slots are durable. If the command fails, report `draft_materialization_failed`; do not say drafts were saved.

### 4. Draft and review

Load `shopify-marketing` and follow only `references/social-media.md` in Campaign-slot mode. Re-read product facts and build a complete claim ledger for every slot. After content, media, stable account ID, and deterministic preflight exist, create one action and attach it to its Campaign slot. Show exact platform, account, text, ordered media, product URL, proposed timing, policy result, `action_key`, and the full `payload_hash` before asking for approval.

`planned` and `action_created` are not `scheduled`. Do not promise a future reminder or automatic execution unless a separate scheduler returns a durable receipt. This P0 Campaign ledger deliberately records no `scheduled` state.

### 5. Execute and report

Immediately before execution, re-check the active store, product, inventory, stable target account ID, capability, policy result, and payload hash. Call `action begin` with the full hash and current account ID, preserve its `execution_id`, then execute once from its returned immutable `execution_payload`. Finish with that same execution ID; use its heartbeat only if execution approaches the lease expiry. Record terminal success or failure; never auto-retry a timeout, interruption, formatting error, or user complaint. A changed payload or explicit retry always requires a new preview and confirmation.

Reports may contain recommendation IDs, reason/blocker codes, plan summary, user options, and action states. They must not contain raw Connector responses, tokens, customer data, generated captions, or private action payloads.

## Completion contract

Return the verified store, product, recommendation decision, readiness, blockers, selected user choice, draft/action state, and exact confirmation requirement. Distinguish clearly among recommended, drafted, approved, scheduled, and published.
