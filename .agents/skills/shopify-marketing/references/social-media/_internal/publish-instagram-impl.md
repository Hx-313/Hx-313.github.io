# Internal — Instagram Publish Implementation

> **Do NOT surface anything in this file to the user.** Composio is an internal implementation detail. The user perceives Instagram as a one-click connector identical to Twitter. See [`../publish-instagram.md`](../publish-instagram.md) for the user-facing protocol; this file documents the actual tool calls.

Instagram is routed through the Composio toolkit. Sub-agents executing Step 5A should call the tools below in order.

Precondition: the user-facing protocol in `../publish-instagram.md` must already have captured explicit final publish confirmation for the exact account, caption, and image. `patrol_store.py action begin` must have returned `execution_payload` plus the execution ID/lease for the confirmed full hash and current stable account ID. The same execution ID must finish the action. Do not use this internal implementation as a shortcut around that gate.

---

## A. Get a Composio session for the `instagram` toolkit

```
Tool: composio_create_session
Arguments:
  toolkits: ["instagram"]
```

Returns `session_id`. **Reuse this single session for all 3 publish calls below**; do not create a new session per call.

---

## B. Resolve the IG user ID for this run

The returned ID must equal `execution_payload.connected_account_id`. Do not rely on a cached account binding for an external action. If it differs, do not begin or publish the action; replace the payload and obtain a new confirmation.

```
Tool: COMPOSIO_MULTI_EXECUTE_TOOL
Arguments:
  session_id: "<from step A>"
  tools:
    - tool_slug: INSTAGRAM_GET_USER_INFO
      arguments:
        ig_user_id: "me"
```

---

## C. Three-step publish

### C-1. Create media container
```
Tool: COMPOSIO_MULTI_EXECUTE_TOOL
Arguments:
  session_id: "<from step A>"
  tools:
    - tool_slug: INSTAGRAM_POST_IG_USER_MEDIA
      arguments:
        ig_user_id: "<execution_payload.connected_account_id>"
        image_url:  "<execution_payload.media_urls[0]>"
        caption:    "<execution_payload.text>"
```
Returns container `id`.

Copy these three values without transformations. In particular, do not replace `#` with `%23`, interpolate a new CTA, add a link, or rebuild the caption in a shell command. If the adapter cannot accept the exact strings, mark the action failed rather than silently changing them.

### C-2. Publish the container
```
Tool: COMPOSIO_MULTI_EXECUTE_TOOL
Arguments:
  session_id: "<from step A>"
  tools:
    - tool_slug: INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH
      arguments:
        ig_user_id:  "<from step B>"
        creation_id: "<container id from C-1>"
```
Returns media `id`.

### C-3. Optionally get a permalink
```
Tool: COMPOSIO_MULTI_EXECUTE_TOOL
Arguments:
  session_id: "<from step A>"
  tools:
    - tool_slug: INSTAGRAM_GET_IG_MEDIA
      arguments:
        ig_media_id: "<media id from C-2>"
        fields:      "id,permalink"
```

For a manual campaign, present a returned permalink as best-effort verification. Do not store it in the patrol ledger and do not fail an otherwise successful P0 publish when this optional lookup fails.

---

## Internal-error → user-facing translation

| Internal signal | What to tell the user |
|---|---|
| `composio_create_session` fails / `instagram` toolkit not authorized | "Instagram is not connected. Please connect it in Accio Work → Capabilities → Plugins → Shopify → Connectors → Instagram." |
| API returns "user is not a business account" | "Your Instagram needs to be Business or Creator. Convert in IG app → Settings → Account → Switch to Professional." |
| API returns "no Facebook Page linked" | "Please link your Instagram to a Facebook Page in Meta Business Suite." |
| `image_url` rejected | Mark the action failed and tell the user the confirmed image URL was rejected; any changed image requires a new payload hash and confirmation. |
| Session expired mid-run | Mark the action failed. Reconnect/retry only after the user explicitly chooses to retry the failed action. |
