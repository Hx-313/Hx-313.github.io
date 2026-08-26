# Pricing & compliance live-fetch rule (MANDATORY)

⚠️ Any answer that touches **Shopify plan monthly fees, annual fees, trial offers, transaction fee rates, or current promotions** is FORBIDDEN from using prices baked into SKILL.md or training-data memory. Prices change multiple times a year (Shopify routinely runs $1/mo × 3-month trials, adjusts regional pricing, modifies transaction fees). Stale numbers mislead the merchant.

## Mandatory fetch order (run on every pricing-related question, no exceptions)

1. **Primary — `web_fetch` the official pricing page** (pick by user locale):
   - International / English: `https://www.shopify.com/pricing`
   - China (Simplified Chinese): `https://www.shopify.com/zh/pricing`
   - If user locale unknown, ask once: "Which currency / region — USD (US) / GBP (UK) / EUR (EU) / CNY (China cross-border)?" Then fetch the matching localized page.

2. **Fallback — `web_search`** if web_fetch fails or returns truncated data:
   - Query template: `shopify pricing 2026 [region] site:shopify.com`
   - For trial / promo questions: `shopify trial offer 2026 site:shopify.com`

3. **Output requirements:**
   - The pricing table's **last column** must include the source attribution + fetch date. Render the label in the user's language; example in English: `Source: shopify.com/pricing  Fetched: YYYY-MM-DD`.
   - If a current promotion is detected (e.g. $1/mo trial), surface it as a separate row above the standard table — do NOT bury it in footnotes.
   - Quote prices in the user's local currency when the localized page provides one; otherwise quote USD and explicitly say "USD only — convert at current FX".

4. **Never answer plan questions from memory.** Even if the user asks the same question twice in one session, re-fetch — promos can launch mid-session.

## Same rule applies (with adapted sources) to:

- **China cross-border seller compliance** (KYC, ICP, payment provider availability) — these policies change every quarter; on any compliance question, `web_search` for items posted within the last 30 days before answering.
- **Shopify Markets / multi-currency fees** — fetch from `shopify.com/markets` when the question touches conversion fees or third-party currency.

> **Violation = factually wrong answer.** Do not skip web_fetch to save 3 seconds — a wrong price quote loses the merchant's trust on the very first interaction.
