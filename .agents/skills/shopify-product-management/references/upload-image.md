# Upload Reusable Image

Use `scripts/upload_image.mjs` to create one reusable Shopify File/CDN URL from exactly one local image or public HTTPS source.

Minimum input is exactly one readable absolute local image path or one public HTTPS source URL. `alt`, `filename`, and local `mimeType` override are optional, except `filename` becomes required when a remote URL contains no filename and the script cannot infer one.

Use one input shape:

```json
{ "image": "/absolute/path/image.png", "filename": "hero.png", "alt": "Hero" }
```

```json
{ "sourceUrl": "https://example.com/image.jpg", "alt": "Product image" }
```

Run dry-run first and add `--apply` only after the write gate passes. Let the script perform staging when needed, create the Shopify File, and poll until a permanent URL is ready. Never expose or manually rebuild signed upload parameters.

Keep this capability independent so its permanent URL can be reused by product updates, collections, and other assets. For product creation, pass an approved local image path directly to `create_product.mjs` unless a reusable file is itself part of the confirmed outcome; creation already owns its local-image staging fast path.
