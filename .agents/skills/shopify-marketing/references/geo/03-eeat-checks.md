# E-E-A-T Checklist for Ecommerce Pages

E-E-A-T = **Experience, Expertise, Authoritativeness, Trustworthiness** — the framework Google's Quality Rater Guidelines use to judge content. Generative engines use similar heuristics when deciding whether to cite a source.

This checklist scores E-E-A-T on a per-page basis. Used as the `eeat` dimension in [02-citability-rubric.md](02-citability-rubric.md).

## How to score

Pass = 1 point. Fail = 0 points. Final dimension score = `(points / total_applicable_checks) * 100`.

Some checks are not applicable to all pages (e.g. an "About" page has no product schema). Skip them — denominator decreases accordingly.

---

## Experience (first-hand)

| # | Check | Pages it applies to |
|---|---|---|
| E1 | Photos that look like the seller actually owns / handled the product (not just stock CDN images) | PDP |
| E2 | "How we use it" or "Our pick" first-person voice on at least one block | PDP, blog |
| E3 | Behind-the-scenes content (process, sourcing trip, factory tour) referenced from product or about page | About, PDP |
| E4 | Verified buyer reviews displayed (count + average) | PDP, collection |

## Expertise

| # | Check | Pages it applies to |
|---|---|---|
| EX1 | Author / curator named for written content (`<meta name="author">` or visible byline) | Blog, FAQ, guides |
| EX2 | Author has a bio page or external profile (LinkedIn, professional site) | Blog, guides |
| EX3 | At least one specialized term used correctly (e.g. for crystals: "rhombohedral cleavage", "Mohs hardness 7"; for skincare: "INCI name") | PDP, blog |
| EX4 | Care instructions / usage instructions written with specifics (temperature, time, technique) | PDP, care guides |

## Authoritativeness

| # | Check | Pages it applies to |
|---|---|---|
| A1 | Cites at least one external authoritative source (research paper, government regulator, recognized publication) | Blog, FAQ, About |
| A2 | Schema.org `Organization` markup with `sameAs` links to social profiles | Site-wide (theme) |
| A3 | Press / publication mentions linked or quoted ("As featured in…") | About, PDP, homepage |
| A4 | Industry certifications shown (organic, fair trade, ISO, etc.) with proof | PDP, About |
| A5 | Domain-level signals: real `Organization` JSON-LD with founding date, address, contact info | Site-wide |

## Trustworthiness

| # | Check | Pages it applies to |
|---|---|---|
| T1 | Visible business address + contact email on the Contact page | Contact (required) |
| T2 | Shipping policy with specific timeframes (not "fast shipping") | Shipping page |
| T3 | Return / refund policy with specific window and conditions | Returns page |
| T4 | Privacy policy present and dated | Privacy page |
| T5 | Customer reviews include negative reviews (not curated to 5★ only) | PDP |
| T6 | HTTPS site-wide (no mixed-content warnings) | Site-wide |
| T7 | Custom domain bound (not `*.myshopify.com`) | Site-wide |
| T8 | At least 6 months of reviews / activity (not a brand-new store with synthetic content) | About, blog |

## Per-page minimum bars

- **PDP**: ≥ 5/9 applicable checks (E1, E2, E4, EX3, EX4, A3, A4, T5, T7)
- **Blog post / guide**: ≥ 4/6 applicable checks (EX1, EX2, EX3, A1, A3, T8)
- **About page**: ≥ 6/8 applicable checks (E3, EX1, EX2, A1, A3, A4, A5, T1)
- **FAQ page**: ≥ 3/4 applicable checks (EX1, EX3, A1, T2 or T3)

## How `/geo-audit` reports E-E-A-T

The audit JSON per product includes:

```json
{
  "eeat_score": 62,
  "eeat_passed": ["E1", "E4", "EX3", "EX4", "A4", "T7"],
  "eeat_failed": ["E2", "A3", "T5"],
  "eeat_recommendations": [
    "Add a '#our-pick' first-person paragraph to the description",
    "Cite the press mention from your About page",
    "Display 1-2 verified 3- or 4-star reviews to balance the 5-star wall"
  ]
}
```

## When to escalate

If a PDP scores < 30 on E-E-A-T after the standard fixes, recommend:

1. Author + publish a long-form `pages/{handle}-care-guide` resource that links from the PDP and is signed by a named expert.
2. Reach out to a third-party publication or guide site for a real link / mention.
3. Apply for a relevant industry certification — this is a multi-month process but is the most durable E-E-A-T lift.

These recommendations live in the audit JSON's `escalations` array. The GEO track does not execute them — they are merchant business decisions. Surface them, do not auto-do them.
