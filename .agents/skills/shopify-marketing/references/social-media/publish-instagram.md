# Step 5A — Publish to Instagram

Used by the `shopify-marketing` social-media track Step 5A.

---

## Prerequisite (tell the user)

> **Connect Instagram in Accio Work via Sidebar → Capabilities → Plugins → Shopify → Connectors → Instagram before running Step 5A. Your Instagram account must be a Business or Creator account linked to a Facebook Page.**

If not connected, the agent should halt and surface that single sentence. **Never mention internal tooling names** (Composio, session_id, MCP, etc.) to the user.

---

## Pre-flight checks

```
Tool: list_all_authorizations
```

Look for an `instagram` entry and capture its stable account ID. It must exactly equal the candidate payload's `connected_account_id`; otherwise replace the payload, rerun policy preflight, and request confirmation again. If absent → halt and ask the user to connect.

An authorization label such as `instagram` is not the stable account ID. Resolve the actual Instagram user ID with the internal adapter before creating the payload. Never put `me`, `connected`, or a display label in `connected_account_id`.

If the IG account is a personal (not Business / Creator) account, the publish step will fail with an account-type error. Surface to user as: *"Your Instagram account needs to be Business or Creator. Convert it in Instagram → Settings → Account → Switch to Professional, then link to a Facebook Page in Meta Business Suite."*

## Mandatory user confirmation gate

Do **not** run the publish protocol until the social-media track has captured explicit user confirmation after showing the final Instagram preview:

- Instagram account/channel target when available
- full caption, including hashtags
- direct image URL and/or visible image preview
- Shopify product URL
- statement that the post will become publicly visible on Instagram

If the final preview or confirmation is missing, return to the main track with `status: awaiting_publish_confirmation`. Connector authorization, image generation, and draft creation are not publish consent.

---

## Publish protocol (high level)

1. Verify final publish confirmation exists for this exact account + caption + image and that the stored preflight is `pass` or an explicitly displayed `warning`.
2. Re-resolve the account, then call `patrol_store.py action begin` with the full displayed hash and fresh account ID. It must return `execution_payload`, `execution_id`, a lease expiry, and `transformations_allowed=false`; retain the execution ID for heartbeat/finish.
3. Create a media container from `execution_payload.media_urls[0]` and `execution_payload.text`. Do not reconstruct the caption from chat, URL-encode it, or pass it through a template.
4. Publish the container once.
5. Treat a connector call that returns no error as P0 success. If the connector also returns a permalink, present it as best-effort verification; absence of a permalink does not turn a successful P0 call into failure.
6. Immediately mark the action `succeeded` or `failed` with the same execution ID. A failure is terminal until the user explicitly requests retry and reconfirms the exact payload.

The exact tool calls and error mappings are documented in [`_internal/publish-instagram-impl.md`](_internal/publish-instagram-impl.md). Sub-agents executing this step should read that file; the main agent and the user do not need to.

---

## Hard rules for the caption

- Caption ≤ 2,200 chars
- Write `#` directly — never `%23` (the IG tool docs say to encode; that is wrong and will break hashtags)
- Use `\n` for newlines in JSON payloads
- `image_url` must be a direct HTTPS URL — never a page URL, never a Shopify CDN URL with `?v=...` query string. Strip the query string or re-host first.
- Feed caption URLs are non-clickable. Default CTA is `link_in_bio`, a product tag, or a Story link; `caption_url` must produce a visible warning before confirmation.

## Correction boundary

A complaint such as “the characters look wrong” is diagnostic input, not permission to edit, delete, or repost. If correction is needed: replace the stored payload, rerun preflight, show the full new hash and preview, and wait for a new confirmation. When the current Connector lacks caption editing, explain that adapter limitation; do not call it an Instagram-wide inability to edit captions and do not automatically create a duplicate post.

---

## Output

For a manual campaign only, optionally append to `published.md`:
- Platform: Instagram
- Permalink: `<permalink when returned; otherwise unavailable>`
- Posted at: `<UTC timestamp>`
- Caption used: (paste full text)
- Image URL used: `<direct HTTPS URL>`

Do not save container/media IDs or a permalink in the patrol action ledger. The ledger stores only status and payload hash; the daily report stores the outcome.
