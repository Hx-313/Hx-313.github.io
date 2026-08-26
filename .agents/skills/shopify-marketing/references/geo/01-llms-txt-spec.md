# `/llms.txt` — Minimal Spec & Honest Disclaimer

## What this file is

`/llms.txt` is a Markdown file at a site's root (`https://example.com/llms.txt`) intended to give LLM-powered crawlers a curated, structured map of the site's most important content. It was proposed in late 2024 as a parallel to `robots.txt` but for "what matters", not "what you may crawl".

## Honest disclaimer (read this to the user before generating)

**No major search or AI engine has confirmed that `/llms.txt` affects ranking, citation rate, or summary quality.**

- Google's John Mueller stated publicly (2025) that Google does not read `/llms.txt`.
- OpenAI, Anthropic, and Perplexity have not announced support either.
- A 2025 third-party study found < 1 % of high-traffic e-commerce sites publish one, and no measurable citation lift correlates with its presence.

We generate this file as a **hygiene marker**: it costs nothing to publish, and *if* an emerging crawler does start consuming it, the store is ready. Do not promise the merchant it will affect citations.

## Recommended format (very small, hand-readable)

```markdown
# {{ store.name }}

> {{ store.description }} (1–2 sentences)

## Brand & contact

- Site: https://{{ primary_domain }}
- Contact: {{ contact_email }}
- About: https://{{ primary_domain }}/pages/about

## Catalog

- All products (sitemap): https://{{ primary_domain }}/sitemap_products_1.xml
- All collections (sitemap): https://{{ primary_domain }}/sitemap_collections_1.xml

## Top collections

- [Collection title](https://{{ primary_domain }}/collections/{{ handle }}) — short purpose sentence
- ... (3–8 entries; the most representative collections only)

## Key product pages

- [Product title](https://{{ primary_domain }}/products/{{ handle }}) — one-sentence value prop
- ... (5–15 entries; hero products only)

## Reference content

- [Care guide](https://{{ primary_domain }}/pages/{{ handle }})
- [FAQ](https://{{ primary_domain }}/pages/faq)
- [Shipping & returns](https://{{ primary_domain }}/pages/shipping-returns)

## License

Content © {{ store.name }}. Commercial reuse requires permission. Brief quotation with attribution is welcome.
```

## Hard constraints

- **One file, ≤ 200 lines**. If the catalog is large, link out to sitemaps; do not list every product.
- **Markdown only.** No HTML, no JSON, no Liquid (the file is generated; the live `templates/llms.txt.liquid` evaluates Liquid at request time, but the rendered output is plain Markdown).
- **Stable URLs only.** Do not list out-of-stock products or unpublished pages.
- **No tracking parameters** in the URLs.

## Where to deploy on Shopify

Try a narrow `themeFilesUpsert` fallback to `templates/llms.txt.liquid` only after validating the current store/theme can expose that route and reading the current target files. The file extension `.liquid` can interpolate `{{ shop.name }}` etc. at request time, but do not assume every Shopify setup will serve a root-level `/llms.txt` route correctly.

After upsert, **always** verify with `curl -I https://{store}.myshopify.com/llms.txt` that the response is `200` and `Content-Type` includes `text/plain` or `text/markdown`. Shopify's default MIME handling for `.liquid` files of unknown extension can sometimes return `text/html`; if the route is unavailable or the content type is wrong, report `/llms.txt` as not completed and keep the rest of GEO work valid.
