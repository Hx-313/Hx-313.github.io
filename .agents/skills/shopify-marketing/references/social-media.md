# Shopify Marketing Track: Social Media

Create Instagram/X candidates from verified Shopify products, run a versioned policy preflight, and publish only after exact-content confirmation. This track supports explicit posts and Campaign content slots that the user chose to draft.

## Choose the mode

- **Campaign-slot mode:** enter only after `shopify-social-campaign` records `start_draft` or `customize` for a current `campaign-recommendation` and materializes its plan into content slots. A raw `campaign_recommendation.matched == true` is not enough.
- **Manual mode:** enter when the user explicitly asks for a social post. Use one caller-provided `request_token` for `manual:social_publish:{request_token}`.

The model never decides whether a product is new, whether an account is connected, whether a Campaign recommendation is current, or whether an action already exists. The evaluator, `shopify-social-campaign`, and patrol snapshot own those decisions.

## Hard rules

1. Obtain the store and target social account from the current authorized connectors. Never discover a store from conversational MEMORY or filesystem contents.
2. Extract products only through the `shopify-admin` → `shopify-use-shopify-cli` chain. Verify `onlineStoreUrl`, publication evidence, media, and anonymous public access.
3. Bind every payload to the exact connector-returned `connected_account_id`. A changed target account needs a new payload and confirmation.
4. Preserve the real product. If it appears in creative media, start from an actual Shopify product image and reject edits that change identity, color, material, markings, packaging, silhouette, or proportions.
5. Do not invent quotes, reviews, certifications, discounts, statistics, scarcity, product effects, or sources. Do not append agent attribution.
6. Never publish automatically. Show the platform, target account, exact text, ordered media, verified product URL, policy result, and `payload_hash`; wait for explicit confirmation of this exact version.
7. A `block` policy result disables confirmation. A `warning` must be displayed and can proceed only with explicit confirmation.
8. Connector timeout or interruption becomes `failed`. Never auto-retry. This P0 does not require or retain a remote permalink.
9. Never invent `policy_result`, reason codes, `action_key`, or `payload_hash` in prose. They must come from `social_publish_preflight.py` and `patrol_store.py` receipts.
10. Never call a social Connector from a caption reconstructed in chat or a shell string. `action begin` returns the stored `execution_payload`; pass its text and media to the platform adapter without URL-encoding, rewriting, or adding attribution.

## Candidate workflow

1. Re-query the selected products using [shopify-product-extract.md](social-media/shopify-product-extract.md).
2. Optional audience research must use real public evidence via [audience-research.md](social-media/audience-research.md). Campaign-slot mode should skip broad research when it is not needed for a truthful product announcement.
3. Draft platform-specific content with [content-templates.md](social-media/content-templates.md). Keep X within its current character limit and treat Instagram caption URLs as non-clickable.
4. Reuse original media or create product-preserving assets via [image-generation.md](social-media/image-generation.md).
5. Resolve the current platform user through the platform adapter and capture the stable account ID. Values such as `me`, `connected`, `instagram`, or an account label are placeholders and may not enter a payload.
6. Build the exact payload below. For Instagram P0, use exactly one direct HTTPS image and write literal `#`; `%23` is rejected.

```json
{
  "platform": "instagram",
  "connected_account_id": "connector-account-id",
  "text": "final text",
  "media_urls": ["https://..."],
  "product_url": "https://store.example/products/example",
  "product_ids": ["gid://shopify/Product/123"],
  "cta_mode": "link_in_bio"
}
```

Campaign actions also include `campaign_id`, `slot_id`, and `scheduled_for`; all three fields must be present together. `scheduled_for` is proposed timing, not proof that an automation exists.

7. Build the factual claim ledger and media/platform checks required by [social-publish-preflight.md](social-media/social-publish-preflight.md). A standalone `social_publish_preflight.py` run may preview the result, but a model-authored `PASS` is invalid.
8. Create the exact action with `patrol_store.py action create`. In Campaign-slot mode, immediately bind it with `campaign attach-action`. Then call `action preflight --input <evidence-input>` so the ledger itself runs the deterministic check and binds its receipt. Do not attach a caller-authored result JSON. No publish action exists before final content and media exist.
9. Use `action payload-show` to display the exact target account, text, ordered media, URL, CTA mode, policy result, full 64-hex `payload_hash`, and any warnings. Never display an abbreviated hash.

## Confirmation and execution

- Edit: call `action replace-payload`, rerun deterministic preflight, attach it, and show the new full hash. The old approval is invalid.
- Reject: call `action reject`.
- Confirm: immediately re-resolve the stable account ID, then call `action begin --expected-payload-hash <displayed-hash> --connected-account-id <resolved-id>`. Preserve the returned `execution_id` with the immutable execution payload.
- Publish: use [publish-instagram.md](social-media/publish-instagram.md) or [publish-twitter.md](social-media/publish-twitter.md) once, using only the returned `execution_payload` and allowing no transformations.
- Finish: immediately call `action finish --execution-id <begin-execution-id> --result succeeded|failed` and include the outcome in the patrol report. For an operation approaching the 15-minute lease, renew it with `action heartbeat --execution-id <begin-execution-id>` before expiry. Only after the report is saved may a succeeded action be finalized.
- Failure/retry: leave the action `failed`. Only after the user explicitly requests a retry may `action retry` return it to `pending`; show the exact payload and obtain a new confirmation before `action begin`. Never interpret a bug report as retry consent.

Campaign slot states are `planned`, `action_created`, `publishing`, `published`, or `failed`. Do not say `scheduled`, “saved to a queue”, or “I will remind you” unless a separate scheduler actually returns a durable receipt. The local Campaign ledger deliberately has no `scheduled` state.

`snapshot`, `state show`, `action show`, and `payload-show` are observation-only and never fail a processing action. Crash recovery is an explicit `recover` command and may fail only an expired execution lease (or a legacy processing record with no lease), never every action merely because it is currently processing.

## Manual campaign extras

For an explicit user campaign, an image-strategy question and richer research are appropriate. The default is one product across currently connected requested platforms. Save optional campaign artifacts under `social-media-campaigns/<YYYY-MM-DD>-<product-handle>/`; materialized Campaign slots and approvals live in the protected social patrol store.
