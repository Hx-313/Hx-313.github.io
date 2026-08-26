# Troubleshooting

Used by the `shopify-marketing` social-media track. Common failure modes and fixes.

> **Translate every internal error to user-facing language.** Never mention Composio, session_id, MCP, or other internal tooling to the user. Both Instagram and Twitter should appear as equivalent one-click connectors.

---

## Shopify

### Product query returns `null`
- Verify `status: ACTIVE` and the product is published to the Online Store. If `onlineStoreUrl` is `null`, run `publishablePublish` (use the `shopify-use-shopify-cli` skill — never edit GraphQL ad-hoc; go through `shopify-admin` to validate the mutation first).
- Confirm the Connector grant includes `read_products` (it does by default; only an issue if you re-scoped manually).
- Confirm you are pointed at the right store domain (`<shop>.myshopify.com` from MEMORY).

### `shopify store execute` not found
- Shopify CLI must be ≥ 3.93.0. Tell the user `npm install -g @shopify/cli@latest`, then re-run.

### Storefront returns 401 (password-protected)
- Public links can't render OG cards (Twitter image cards will break, IG users hitting the link will hit a password wall).
- Ask the user to remove the storefront password (Online Store → Preferences → Password page) or accept the limitation.

---

## Instagram

### Not connected
- **Tell the user:** "Please connect Instagram in Accio Work via Sidebar → Capabilities → Plugins → Shopify → Connectors → Instagram, then retry."
- Verify with `list_all_authorizations` — look for an `instagram` entry.

### Account rejected (Personal account)
- IG publishing only works with **Business** or **Creator** accounts linked to a Facebook Page.
- **Tell the user:** "Your Instagram needs to be Business or Creator. Convert in IG app → Settings → Account → Switch to Professional, then link to a Facebook Page in Meta Business Suite."

### Container creation fails (`image_url` rejected)
- `image_url` must be a direct HTTPS URL — not a page URL, not a Shopify CDN URL with `?v=...` query string.
- Strip the query string or re-host before retrying. Auto-retry once; do not bother the user with the technical detail.

---

## Twitter / X

### Not connected
- **Tell the user:** "Please connect Twitter (X) in Accio Work via Sidebar → Capabilities → Plugins → Shopify → Connectors → X (Twitter), then retry."
- Verify with `list_all_authorizations` — look for a `twitter` entry.

### `post_tweet` succeeds but image card not rendering
- May take 30–60 s to populate. If still missing, the image URL likely lacks OG tags or is unreachable. Re-host using the fallback below.

### Twitter media upload fallback
> Use only when `post_tweet` with `media_urls` actually fails (e.g., upload rejected, China network blocking the upload endpoint).

Upload the image elsewhere, then put a **page URL** (which carries OG tags) into the tweet text. Twitter will render it as a rich image card.

#### Option A — Imgur (default fallback)

Setup once: get a free Imgur Client-ID at [api.imgur.com/oauth2/addclient](https://api.imgur.com/oauth2/addclient), choose **"Anonymous usage without user authorization"**. Store as env var `IMGUR_CLIENT_ID`.

> Do **not** hardcode shared / public Client-IDs — they get rate-limited or revoked.

```bash
# 1) download the generated image locally
curl -L -o /tmp/marketing.png "<image_url_from_image_generate>"

# 2) upload (script lives in references/social-media/imgur-upload.js)
export IMGUR_CLIENT_ID="<your_client_id>"
node skills/shopify-marketing/references/social-media/imgur-upload.js /tmp/marketing.png
# → { directUrl: "https://i.imgur.com/<id>.png",
#      pageUrl:  "https://imgur.com/<id>" }
```

Use the **page URL** (`https://imgur.com/<id>`) in the tweet — it has OG tags. The direct URL (`https://i.imgur.com/<id>.png`) does not render as a card.

Before retrying, show the revised tweet text (including the appended page URL) and capture fresh explicit confirmation because the public post content changed. Then call `post_tweet` again with the page URL appended to `text`, and **omit** `media_urls`.

#### Option B — China-friendly chain (if Imgur blocked)

Probe first:
```bash
curl --max-time 10 -sI https://api.imgur.com/3/image | head -1
```
- `HTTP 200` / `HTTP 400` → Imgur reachable
- timeout / connection refused → use this chain in order:

1. **Shopify product OG card** — skip image upload entirely. Rely on the Shopify product URL to render its own OG card. Works only if the storefront is not password-protected and the product page has OG tags.
2. **sm.ms** — `curl https://sm.ms/api/v2/upload -F "smfile=@file.png"` returns a direct URL with OG. Free tier: 5 MB per file, no API key needed.
3. **GitHub raw** — push the image to a public repo, use `https://raw.githubusercontent.com/<user>/<repo>/main/<file>.png`. No OG tags but Twitter renders inline.
4. **Original CDN passthrough** — if the source image already lives on a public CDN (e.g., `sc02.alicdn.com`), use that URL directly with no re-upload.

---

## Tooling

### accio-mcp-cli JSON escaping
- macOS / Linux shell: wrap `--json` value in **single quotes**.
- Windows PowerShell: prefer the local MCP gateway (`http://127.0.0.1:4097/mcp/proxy`) to avoid quoting hell.
