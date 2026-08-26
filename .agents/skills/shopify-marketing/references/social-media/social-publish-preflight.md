# Social publish preflight

Run after draft generation and after every content-affecting edit. The release result must come from `scripts/social_publish_preflight.py`, not model judgment. It returns `policy_version=social-publish-v1`, exactly one `policy_result` (`pass`, `warning`, or `block`), the real hash of the exact payload, stable reason codes, and explanations.

## Deterministic input

Write a transient input outside the protected patrol root:

```json
{
  "payload": {
    "platform": "instagram",
    "connected_account_id": "17841400000000000",
    "text": "Verified copy with literal #hashtags. Link in bio.",
    "media_urls": ["https://cdn.example.com/product.png"],
    "product_url": "https://store.example/products/example",
    "product_ids": ["gid://shopify/Product/123"],
    "cta_mode": "link_in_bio"
  },
  "resolved_connected_account_id": "17841400000000000",
  "claims_complete": true,
  "claim_checks": [
    {
      "text_fragment": "140kg weight stack",
      "status": "verified",
      "source": "shopify:product.specifications.Weight Stack"
    }
  ],
  "media_check": {
    "result": "warning",
    "reason_codes": ["SYNTHETIC_MEDIA", "PRODUCT_IDENTITY_VERIFIED"]
  },
  "platform_check": {"result": "pass", "reason_codes": []}
}
```

`claims_complete=true` means every factual statement was reviewed, not merely the obvious numbers. Every numeric/unit, price, discount, certification, warranty, delivery-time, scarcity, or similar risky text fragment needs a verified source. Verified source identifiers must start with `shopify:`, `merchant:`, or `public:`; use `unverified` or `contradicted` when evidence is absent or conflicts. The script blocks release otherwise.

Run:

```bash
# Optional preview only:
python3 project/scripts/social_publish_preflight.py --input PREFLIGHT_INPUT.json

# Authoritative ledger-bound evaluation:
python3 project/scripts/patrol_store.py --root project/.shopify-social-patrol \
  action preflight --action-key ACTION_KEY --input PREFLIGHT_INPUT.json
```

For a Campaign slot, run `campaign attach-action` after action creation and before `action preflight`; the ledger rejects evaluation for an unbound Campaign action. The ledger invokes the checker itself and refuses a caller-authored result file.

The preflight `payload_hash` must exactly equal the action hash. A shortened hash such as `sha256:abcd...1234`, a prose-only `PASS`, or a reason code not returned by the script is invalid.

## Block

- Target account is missing or differs from `connected_account_id` in the payload.
- Product URL is absent, guessed, redirects unexpectedly, is password-protected, or is not publicly accessible.
- Product/image identity differs from current Shopify media.
- Text or media promotes an illegal/counterfeit product, exposes private personal data, infringes known rights, or includes prohibited hateful, violent, exploitative, or deceptive content.
- Text fabricates a price, discount, review, certification, statistic, urgency, health/safety result, or product capability.
- Caption contains a risky factual token that is absent from the verified claim ledger, or `claims_complete` is false.
- Instagram text contains `%23`, uses a placeholder account ID, or the resolved account differs from `connected_account_id`.
- Synthetic/composited product media has no explicit product-identity verification.
- Platform-specific checks in `instagram-policy-and-risk.md` or `x-policy-and-risk.md` return block.

## Warning

- A factual marketing claim lacks a direct Shopify field or cited public source.
- AI/composited media could reasonably mislead viewers about the product or result.
- Hashtags are excessive, irrelevant, or appear designed to manipulate discovery.
- Instagram text relies on a caption URL as the primary CTA.
- Instagram copy says “click the link below” even though Feed caption URLs are not clickable.
- Synthetic media passed product-identity comparison but still needs merchant review.
- Regulated or sensitive product category needs merchant/legal review even when no explicit platform block is known.

## Pass

All payload fields are present, account and product are verified, content is truthful, media preserves product identity, and no platform rule produces warning/block.

This is a conservative release gate, not legal advice. Platform rules change; maintain the platform files from official sources and record the review date.
