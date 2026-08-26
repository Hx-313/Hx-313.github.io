# Step 5B — Publish to X (Twitter)

Used by the `shopify-marketing` social-media track Step 5B.

---

## Prerequisite (tell the user)

> **Connect Twitter (X) in Accio Work via Sidebar → Capabilities → Plugins → Shopify → Connectors → X (Twitter) before running Step 5B.**

If not connected, the agent should halt and surface that single sentence — never mention internal tooling names.

To verify programmatically:
```
Tool: list_all_authorizations
```
Look for a `twitter` entry and capture its stable account ID. It must exactly equal the candidate payload's `connected_account_id`; otherwise replace the payload, rerun policy preflight, and request confirmation again. If absent, ask the user to connect, then retry.

---

## Mandatory user confirmation gate

Do **not** call `post_tweet` until the social-media track has captured explicit user confirmation after showing the final X preview:

- X account/channel target when available
- full tweet text
- image URL and/or visible image preview
- Shopify product URL
- statement that the tweet will become publicly visible on X

If the final preview or confirmation is missing, return to the main track with `status: awaiting_publish_confirmation`. Connector authorization, image generation, and draft creation are not publish consent.

---

## Default path — `post_tweet` with native media

Twitter is a Phoenix built-in connector. Media upload works directly:

```
Tool: post_tweet
Arguments:
  text:       "<tweet copy>"
  media_urls: ["<direct HTTPS image URL>"]   # public URL, no signed query string
```

Before this call, run `action begin` with the displayed full hash and freshly resolved account ID, and retain its execution ID/lease for heartbeat and finish. Pass only `execution_payload.text` and `execution_payload.media_urls` to the adapter, without reconstructing the tweet or altering either field. A connector response with no error is P0 success. When a tweet ID/permalink is returned, present it as best-effort manual-campaign verification; do not require it or store it in the patrol ledger.

### Image URL requirements
- Direct HTTPS, publicly accessible, < 5 MB
- Shopify CDN URLs **with** `?v=...` query strings sometimes work. If upload fails, mark this attempt failed; stripping the query string changes the payload and requires `replace-payload`, a new hash, preflight, preview, and confirmation.
- Generated images saved under `social-media-campaigns/<date>-<product>/marketing_images/` need to be **uploaded to a public host first** (the local file path is not reachable by Twitter)

---

## Tweet shape

```
<HOOK — pain-point question or bold statement>

<SOLUTION — product benefit in 1–2 lines>

<OFFER — price + Shopify product URL>

<optional attribution line — only if user opted in>
```

See [content-templates.md](content-templates.md) for character budget.

---

## Fallback (only when `post_tweet` media upload fails)

If `post_tweet` returns a media-related error (e.g., upload rejected, permission scope, China network blocking the upload endpoint), see [troubleshooting.md](troubleshooting.md#twitter-media-upload-fallback) for the Imgur / sm.ms / GitHub-raw chain.

The fallback is **not** the default. Try native media first. If the fallback changes the tweet text, attached URL, or image URL, replace the stored payload, rerun preflight, show the full new hash and revised preview, and capture fresh explicit confirmation before retrying.
