# Optional Seven-Day Product Campaign

Use this workflow when a newly published Shopify product is eligible for promotion or the user asks for a short product-launch plan. The recommendation is optional and never authorizes publishing.

## Product promise

Present one compact recommendation:

> Start a seven-day new-product campaign: three Instagram drafts that test use case, product detail, and FAQ angles. Estimated review time: 10 minutes.

Seven days is the learning horizon, not a requirement to publish every day. The P0 default is three posts on days 1, 3, and 6. Respect a merchant's lower frequency preference.

## Deterministic recommendation

Re-query the product and normalize this input for `scripts/recommend_campaign.py`:

```json
{
  "shop_domain": "example.myshopify.com",
  "generated_at": "2026-08-05T01:00:00Z",
  "product": {
    "id": "gid://shopify/Product/1",
    "title": "Everyday Carry Bag",
    "status": "ACTIVE",
    "online_store_url": "https://example.com/products/everyday-carry-bag",
    "publicly_accessible": true,
    "media_count": 4,
    "inventory_status": "in_stock",
    "policy_risk": "low",
    "unresolved_claim_count": 0
  },
  "instagram": {
    "status": "available",
    "account_id": "ig_1"
  },
  "preferences": {
    "mute_seven_day_campaigns": false,
    "max_posts_per_seven_days": 3
  }
}
```

Run:

```bash
python3 skills/shopify-social-campaign/scripts/recommend_campaign.py \
  --input normalized-campaign-input.json
```

Validate the output as `campaign-recommendation`. Do not let a model override `decision`, `publish_readiness`, reason codes, blockers, post count, or authorization boundary.

## Decisions

- `recommended`: show the plan and `start_draft / customize / skip / mute_similar` choices.
- `not_recommended`: create no plan; show the stable reason code.
- `unknown`: create no plan; show the missing fact and allow a bounded retry.

An unavailable Instagram connector or unresolved claim blocks publishing, not draft creation. An inactive, private, media-less, out-of-stock, high-risk, muted, or materially unknown product does not receive an executable recommendation.

## User choices

### `start_draft`

Create only the campaign draft and its proposed content slots. Persist that choice through `patrol_store.py campaign create`; the returned `campaign_id` and `planned` slot records are required evidence. This choice does not approve text, media, proposed timing, or publishing. Re-query product facts and run the social track's deterministic factual-claim preflight when materializing each content candidate.

Use this exact Campaign draft shape; timestamps must be timezone-aware and are proposed review/publish timing only:

```json
{
  "recommendation_id": "camprec_...",
  "product_id": "gid://shopify/Product/1",
  "channel": "instagram",
  "horizon_days": 7,
  "created_at": "2026-08-10T01:00:00Z",
  "slots": [
    {
      "slot_id": "slot_day_1",
      "day": 1,
      "content_pillar": "use_case",
      "scheduled_for": "2026-08-10T09:00:00Z"
    }
  ]
}
```

The store derives `campaign_id`, Campaign/slot statuses, and action bindings. Do not include or invent those fields in the create input.

### `customize`

Let the user change the frequency, content pillars, channel, or primary objective. Re-run deterministic eligibility for any changed product or channel. P0 supports Instagram execution; other channels remain advisory unless their adapter is available.

### `skip`

Dismiss this recommendation instance without creating a campaign or publish action.

### `mute_similar`

Update the preference only after the user explicitly selects this option. Do not infer a persistent mute from a one-time skip.

## Batch review boundary

A user may approve several fully materialized content candidates in one review, but each item must expose its exact target, text, ordered media, schedule, factual-claim result, UTM, `action_key`, and `payload_hash`. Editing one item invalidates only that item's approval.

The Campaign ledger uses slot states `planned`, `action_created`, `publishing`, `published`, and `failed`; a Campaign whose slots all have actions is `materialized`, not approved. The ledger intentionally does not use `scheduled`: a proposed `scheduled_for` timestamp is content metadata, not proof of an installed timer. Say “scheduled” only when a separate automation service returns a durable receipt, and retain that receipt outside this ledger.

Before any deferred execution, re-read the product, target account, inventory, price, variant, public URL, accepted claims, payload hash, and capability. Cancel or expire a stale item; never silently rewrite approved content.

Every fully materialized slot must create a `social_publish` action containing the Campaign `campaign_id`, `slot_id`, and proposed `scheduled_for`, then bind it with `campaign attach-action`. A chat draft or Markdown table alone is not a durable slot.

## Report-safe card

Reports may retain only:

- recommendation ID and decision;
- product ID and title;
- reason codes, blocker codes, and warnings;
- seven-day horizon, channel, post count, content-slot codes, and review estimate;
- user option codes and expiry.

Do not put generated captions, raw connector responses, tokens, customer data, or media binaries in patrol reports.
