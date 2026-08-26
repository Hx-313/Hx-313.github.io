# Step 1 — Extract Product Details

Used by the `shopify-marketing` social-media track Step 1. Three accepted input forms → unified product brief saved as `product_details.md`.

---

## Inputs accepted

| Input form | Example |
|---|---|
| Product **handle** | `example-product-handle` |
| Numeric **product ID** | `8123456789012` (→ `gid://shopify/Product/8123456789012`) |
| Public product **URL** | `https://{store}.myshopify.com/products/example-product-handle` |

If the user has not specified a product, list the store's recent active products (see "List recent products" below) and ask which one to market. **Do not invent a product.**

---

## Authentication — MUST go through Accio Work Connector

> Use the Connector binding (see steps below). The old Custom App + paste-a-`shpat_...`-token workflow is out of scope for this plugin.

If the store is not yet connected:
1. Stop and tell the user: "Please connect Shopify in Accio Work via **Sidebar → Capabilities → Plugins → Shopify (plugin detail page) → scroll down to App Authorization (应用授权) → Shopify Store Auth (Shopify店铺授权)**, then retry."
2. Once connected, the Connector grants the full default scope set including `read_products` — no extra setup needed.

If you do not know which store to query, read it from MEMORY (`Store URL`) or ask the user once for `<shop>.myshopify.com`.

---

## Execution path — `shopify-admin` + `shopify-use-shopify-cli` chain (mandatory)

This plugin's top-priority rule: **all Admin GraphQL must be authored via `shopify-admin` and run via `shopify-use-shopify-cli`.** No `curl`, no REST.

### Phase A — author + validate the query (skill: `shopify-admin`)

1. **Search docs** before writing anything:
   ```bash
   node skills/shopify-admin/scripts/search_docs.mjs "product query" \
     --model <YOUR_MODEL> --client-name accio-work --client-version 1
   ```
2. **Write** the query (template below).
3. **Validate** before returning:
   ```bash
   node skills/shopify-admin/scripts/validate.mjs \
     --code '<your query>' \
     --model <YOUR_MODEL> --client-name accio-work --client-version 1 \
     --artifact-id sm-extract-<random> --revision 1
   ```
4. On error → re-search the unfamiliar field → patch → re-validate. Max 3 retries.

### Reference query — `productByHandle`

Use this as a **starting point only**. You must still run `search_docs.mjs` + `validate.mjs` to pick up any current schema changes.

```graphql
query GetProductForMarketing($handle: String!) {
  productByHandle(handle: $handle) {
    id
    title
    handle
    descriptionHtml
    productType
    vendor
    tags
    onlineStoreUrl
    priceRangeV2 {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    featuredImage { url altText }
    images(first: 10) { edges { node { url altText } } }
    variants(first: 10) {
      edges { node { id title price compareAtPrice availableForSale } }
    }
    seo { title description }
  }
}
```

If input is a **numeric ID**, switch to `product(id: $id)` with `id = "gid://shopify/Product/<numeric>"`.
If input is a **URL**, parse the handle out of the path and use `productByHandle`.

### Phase B — execute on the store (skill: `shopify-use-shopify-cli`)

Auth is already handled by the Accio Work Connector (no `shopify store auth` needed). Run only the execute command:

```bash
shopify store execute \
  --store <shop>.myshopify.com \
  --query '<the validated query above>' \
  --variables '{"handle":"<product-handle>"}'
```

> If the user reports `shopify store execute` is unavailable, briefly note Shopify CLI must be ≥ 3.93.0 and still output the full workflow.

### List recent products (when no product specified)

Validate then run:
```graphql
query RecentActiveProducts {
  products(first: 10, query: "status:active", sortKey: UPDATED_AT, reverse: true) {
    edges { node { id title handle onlineStoreUrl featuredImage { url } } }
  }
}
```
Then ask the user: "Which product would you like to market?"

---

## Fields to extract → `product_details.md`

| Field | Source |
|---|---|
| **Title** | `product.title` |
| **Price** | `priceRangeV2.minVariantPrice.amount` |
| **Compare-at price** | first variant's `compareAtPrice` (drives `Was $X / Now $Y` framing) |
| **Description summary** | strip HTML from `descriptionHtml`, keep ≤ 500 chars |
| **Key features** | parse `<ul><li>` from `descriptionHtml` |
| **Product type / tags** | `productType` + `tags` (drives audience-research keywords) |
| **Images (top 3)** | `images.edges[].node.url` (candidate references for Step 4; do not blend different products / variants) |
| **Generation reference image** | Pick exactly one Shopify image as the identity anchor for Step 4, usually `featuredImage`. If the top images show different physical products, variants, or bundle items, ask which exact image/SKU to promote before generating. |
| **Product object invariants** | From visual inspection: physical product category/carrier (mug, plate, towel, tray, bowl, etc.), shape, material, color, handles/lids/edges, print/design placement, visible text/labels, package/accessory count. |
| **Storefront URL** | use `onlineStoreUrl` only. If `onlineStoreUrl` is `null`, the product is not publicly available on Online Store — do **not** construct `https://<shop>.myshopify.com/products/<handle>` as a substitute. |
| **Variants** | mention "X colors / sizes available" in copy |
| **SEO title/desc** | `seo.title` / `seo.description` (signal which keywords the page already targets) |

After saving, call `see_image` on the top 2–3 product images so you visually understand the product before generating marketing imagery (Step 4). Then explicitly record the single **Generation reference image** and **Product object invariants** in `product_details.md`. If the images are a product family (for example mug + plate + towel + tray using the same artwork), do not treat the shared artwork as the product; lock the exact physical item selected for the post.

### Product-link verification gate

Before Step 3 writes any caption/tweet that includes a Shopify product URL, verify the URL is both present and public:

1. `onlineStoreUrl` from GraphQL must be non-null.
2. Fetch the URL without tokens/cookies. It must not be 404, must not redirect to `/password`, and must render the product page publicly.
3. Save the checked URL and fetch status in `product_details.md`.

If this gate fails, do not invent or construct `/products/<handle>` from the handle. Either publish the product first, use store homepage/link-in-bio wording, or ask the user what to do.

---

## Edge cases

- **`onlineStoreUrl` is `null`** → product is not published to the Online Store. Halt and ask the user to publish it (this plugin's `shopify-use-shopify-cli` skill can run `publishablePublish`). Do not market a product that has no public URL.
- **Storefront is password-protected** → public links won't render OG cards. Check via `curl -sI <storefront URL>`; if it returns `401`, ask the user to remove the password or note that Twitter image cards may break.
- **0 reviews / 0 sales** → fine for new Shopify stores. Pull social proof from Step 2 (audience research). **Never fabricate review counts in the copy.**
