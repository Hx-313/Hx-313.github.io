# AI Bot Allowlist + GA4 AI-Referral Tracking

This file is the canonical source for two things: (a) which AI crawlers to allow in `robots.txt`, and (b) the regex GA4 needs to bucket AI-search referrals as their own channel.

---

## AI Crawlers — candidate allowlist

Crawler names and engine behavior change over time. Treat this table as a candidate allowlist for explicit GEO work, then verify current crawler documentation before making a production robots.txt change for a merchant.

| User-Agent | Operator | Purpose | Action |
|---|---|---|---|
| `GPTBot` | OpenAI | Model/content crawling signal | **Allow** for GEO unless the merchant has a policy reason to block |
| `OAI-SearchBot` | OpenAI | Search / retrieval crawler signal | **Allow** for GEO after current-doc verification |
| `ChatGPT-User` | OpenAI | On-demand fetch when a ChatGPT user asks the model to read a URL | **Allow** for direct URL fetches |
| `ClaudeBot` | Anthropic | Claude crawler signal | **Allow** for GEO unless the merchant has a policy reason to block |
| `Claude-SearchBot` | Anthropic | Live Claude search (rolled out 2025) | **Allow** |
| `Claude-User` | Anthropic | On-demand fetch by a Claude user | **Allow** |
| `PerplexityBot` | Perplexity AI | Crawls for Perplexity index | **Allow** for GEO after current-doc verification |
| `Perplexity-User` | Perplexity AI | On-demand fetch | **Allow** |
| `Google-Extended` | Google | Opt-in/out signal for Bard / Gemini / AI Overviews use of content | **Allow** (default in robots.txt is "no preference" which means in) |
| `Applebot-Extended` | Apple | Opt-out for Apple Intelligence training | **Allow** |
| `cohere-ai` | Cohere | Cohere training crawler | **Allow** |
| `Bytespider` | ByteDance | TikTok / Doubao training | Decision: allow if selling in CN/SEA, otherwise neutral |
| `CCBot` | Common Crawl | Public dataset many models use | **Allow** — broad downstream impact |
| `Diffbot` | Diffbot | Knowledge-graph crawler | **Allow** |
| `Meta-ExternalAgent` | Meta | LLaMA training | **Allow** |

## Robots.txt block to inject

In Shopify, the file lives at `templates/robots.txt.liquid`. We *append* to the existing default rather than replace, because Shopify's default has important blocks for `/cart`, `/checkout`, etc.

The block to append:

```liquid
{%- comment -%}
  Begin: AI Bot Allowlist (managed by shopify-marketing GEO track)
  Last updated: {{ "now" | date: "%Y-%m-%d" }}
  Source: skills/shopify-marketing/references/geo/04-ai-bot-allowlist.md
{%- endcomment -%}

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: CCBot
Allow: /

User-agent: Diffbot
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

{%- comment -%} End: AI Bot Allowlist {%- endcomment -%}
```

### Hard constraint

- **Never** push this file before confirming the storefront is *public* (no password). AI bots cannot crawl password-protected storefronts. Verify via `curl -I https://{store}.myshopify.com/` returns `200` (not `401`).
- After upsert, verify with `curl https://{store}.myshopify.com/robots.txt | grep -E "GPTBot|ClaudeBot|PerplexityBot"` — should print 3 hits.

---

## GA4 AI-Referral Channel Grouping

GA4 does not natively recognize AI search engines as a distinct channel — they appear as "Referral" or "Direct" depending on the engine. We add a **custom channel group** to bucket them.

### Channel definition

| Channel name | Source matches regex | Medium matches |
|---|---|---|
| AI Search — ChatGPT | `chatgpt\.com|chat\.openai\.com|openai\.com` | (any) |
| AI Search — Perplexity | `perplexity\.ai` | (any) |
| AI Search — Claude | `claude\.ai|anthropic\.com` | (any) |
| AI Search — Google AI Overview | `google\..*` AND landing page contains `srsltid=` query param | organic |
| AI Search — Bing Copilot | `bing\.com` AND landing page contains `?form=BCJSCN` or `&form=BCJSCN` | (any) |
| AI Search — Gemini | `gemini\.google\.com` | (any) |
| AI Search — Other AI | `you\.com|kagi\.com|brave\.com/search|metaphor\.systems|exa\.ai|phind\.com` | (any) |

### Combined regex (paste into GA4)

For convenience, the merchant can configure a single "AI Search — All" channel using:

```
^(.*\.)?(chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|you\.com|kagi\.com|phind\.com)(/.*)?$
```

### Manual setup steps (deliver to merchant — STRUCTURE verbatim, LANGUAGE in the user's language)

GA4 Channel Groups cannot be created via the public Admin API without a Google Cloud Service Account, which most merchants do not have. Hand the merchant the 7 steps below.

> 💡 **Language contract** (per `prompt.md` RULE #-2): the steps are an EN reference rendering. Re-render them in the user's language (Chinese / Spanish / etc.). **Keep these tokens as-is in any language** — they are GA4 UI labels and a literal regex:
> - GA4 menu labels: `Admin`, `Channel groups`, `Data display`, `Create new channel group`, `Add new channel`, `Source`, `Reports`, `Acquisition`, `Traffic acquisition`
> - Quoted names: `"AI Search Visibility"`, `"AI Search — All"`
> - The regex line itself

EN reference:

1. Open GA4 → Admin (gear icon) → **Channel groups** (under Data display)
2. Click **Create new channel group** → name it "AI Search Visibility"
3. Click **Add new channel** → name it "AI Search — All"
4. Add condition: `Source` matches regex → paste the combined regex above
5. Save → Apply to the property
6. (Optional) Repeat for per-engine breakouts using the per-engine table above
7. Wait 24–48 hours for data to repopulate; then check **Reports → Acquisition → Traffic acquisition** with the new channel group selected

### Verification

Two weeks after setup, run a Looker Studio (or GA4 Explore) report grouped by the new channel group. If "AI Search — All" shows ≥ 1 session, the configuration works. If 0 sessions across 2 weeks: check the regex for typos, and confirm at least one optimized PDP is being cited (use `/geo-preview`).

---

## Why this matters

Without the allowlist, an engine that respects robots rules may not crawl the source content. Allowing bots is necessary for some GEO scenarios, but it is not sufficient for citation.
Without the GA4 grouping, the merchant cannot cleanly inspect AI referral traffic in standard acquisition reports.

Both should be considered before Stage 5 (`/geo-preview`) to make the loop easier to measure.
