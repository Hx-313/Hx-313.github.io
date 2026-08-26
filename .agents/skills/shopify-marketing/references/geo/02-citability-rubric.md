# Citability Rubric — How a Page Gets Cited by an LLM

This rubric scores how likely an LLM is to **quote or paraphrase** a given page when answering a buyer's question. It is the contract between the audit script (`scripts/geo/citability_score.py`) and the optimization stages.

## Scoring formula

Total Citability Score = sum of weighted dimensions, normalized to 0–100.

| Dimension | Weight | What it measures |
|---|---|---|
| Self-containment | 0.25 | Each paragraph stands alone — no "as mentioned above", no orphaned pronouns. |
| Statistic density | 0.20 | Numbers, measurements, percentages, dates, named quantities per 100 words. |
| Verifiable claims | 0.15 | Named entities (places, brands, materials, certifications) + dates + sources. |
| Structured Q&A | 0.15 | Visible on-page Q&A structure: H2/H3 phrased as natural questions with self-contained answer paragraphs. FAQPage JSON-LD is a tie-breaker only — it no longer yields Google rich results for commerce sites (restricted to gov/health sites Aug 2023; fully retired for all sites May 7, 2026, per Google Search updates changelog), and its effect on AI-engine citation is unproven. |
| E-E-A-T markers | 0.15 | Author byline, expertise signals, citations to outside sources. See [03-eeat-checks.md](03-eeat-checks.md). |
| Schema completeness | 0.10 | Product + Offer + AggregateRating + Brand + at least one entity link (`isRelatedTo`, `material`, etc.). |

## Per-dimension scoring detail

### Self-containment (0–100 → ×0.25)

For each `<p>` block, ask: "if an LLM extracts only this paragraph, is the meaning clear?" Penalize:

- pronouns with no antecedent in the same paragraph (`it`, `this`, `they` referring upward)
- demonstratives without nouns (`this works for…`)
- chains of `also`, `additionally`, `further` — implies a missing sentence above
- phrases like "as we mentioned", "see above", "below"

Score = (clean paragraphs / total paragraphs) × 100.

### Statistic density (0–100 → ×0.20)

Count `(stat_tokens / total_words) * 1000`. Targets:

- ≥ 8 stat tokens per 1 000 words → 100
- 4–7 → 70
- 1–3 → 35
- 0 → 0

A "stat token" is any of: integer ≥ 2 digits, decimal, percentage, currency value, ISO date, dimension (`4.2 kg`, `12 in`), named quantity (`14-piece`, `3-pack`).

### Verifiable claims (0–100 → ×0.15)

Count distinct named entities AND outbound source citations:

- ≥ 3 named entities + ≥ 1 source link → 100
- 2 entities + 1 source → 70
- 1 entity → 35
- 0 → 0

Named-entity buckets: place of origin, certifying body, named material, named designer, named publication, named event.

### Structured Q&A (0–100 → ×0.15)

Scoring is **visible-structure first** — what an LLM can extract from the rendered page matters; the schema markup alone does not:

- ≥ 3 visible Q&A pairs: H2/H3 phrased as natural questions (`How long does shipping take?`) each followed by a self-contained answer paragraph → 100
- 1–2 visible Q&A pairs in that format → 70
- Question-style headings present but answers are thin / not self-contained → 50
- No question structure → 0
- FAQPage JSON-LD, when also present and matching the visible content, acts as a tie-breaker within a band (e.g. 70 → 75); it can never lift a page to a higher band on its own.

> **Evidence note (updated 2026-07):** Google restricted FAQ rich results to well-known government/health sites in Aug 2023 and retired the feature for ALL sites on May 7, 2026 (Google Search updates changelog). For commerce stores, FAQPage markup has produced no Google rich-result value since 2023. Its impact on AI-engine citation is plausible but unproven — no engine has confirmed reading it. The extractable value lives in the *visible, self-contained Q&A text*, which is what this dimension now scores. Google's own guidance: existing unused structured data "does not cause problems for Search" — do NOT proactively strip FAQPage markup from stores that already have it.

### E-E-A-T markers (0–100 → ×0.15)

See [03-eeat-checks.md](03-eeat-checks.md) for the full checklist. Score is the percentage of checks passed.

### Schema completeness (0–100 → ×0.10)

Required: `Product` + `Offer` + `AggregateRating` + `Brand`.
Bonus +25 if at least one entity link is present (`isRelatedTo`, `isAccessoryOrSparePartFor`, `material`, `audience`, `award`).

- All required + bonus → 100
- All required → 75
- Missing 1 required → 50
- Missing 2+ required → 25
- No Product schema → 0

## Score interpretation

| Score | Verdict | Action |
|---|---|---|
| 80–100 | Strong citability | Maintain. Re-audit quarterly. |
| 60–79 | Moderate | Run `/geo-enrich-stats` and `/geo-inject-quotes` to push past 80. |
| 40–59 | Weak | Mandatory: stats, quotes, FAQ block, schema repair. |
| < 40 | Effectively invisible to LLMs | Full rewrite of the description with the answer-first pattern (TL;DR paragraph at top, then sections). |

## Engine prompts (used by `/geo-preview`)

When simulating a citation by ChatGPT / Perplexity / Claude, use one of these prompt templates against the live page URL. Vary the buyer-intent phrasing to stress-test the page.

### Comparative-intent prompt
> "I'm looking for [PRODUCT CATEGORY] for [USE CASE]. Compare [BRAND-A] to [BRAND-B] using only the information on their websites. Quote sources directly when possible."

### Decision-support prompt
> "Is the [PRODUCT NAME] at [URL] a good choice for [BUYER PERSONA]? Explain in 2–3 sentences and quote the page when possible."

### Specification prompt
> "What are the exact dimensions, materials, and certifications of [PRODUCT NAME] at [URL]? Cite the page directly."

### Trust-and-verification prompt
> "Should I trust the claims on [URL]? Look for author info, certifications, third-party reviews, and named sources."

## Score this page → action map

After running `/geo-audit`, the audit JSON should include a `next_actions` array per product, derived from the lowest-scoring dimensions:

```json
{
  "handle": "example-product",
  "score": 52,
  "dimensions": {
    "self_containment": 88,
    "statistic_density": 30,
    "verifiable_claims": 25,
    "structured_qa": 0,
    "eeat": 60,
    "schema_completeness": 75
  },
  "next_actions": [
    "/geo-enrich-stats",
    "/geo-inject-quotes",
    "/geo-add-faq-block"
  ]
}
```
