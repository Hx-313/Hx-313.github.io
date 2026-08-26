# Step 2 — Audience Research

Used by the `shopify-marketing` social-media track Step 2. Output saved as `audience_research.md`.

---

## Purpose

Find **real** pain points, desires, and emotional triggers from actual social-media conversations. These drive the content angles. **Do not skip this step** — without it, captions are generic template-soup.

> 🚨 **Hard rule — verbatim quotes only.** Every pain point and desire MUST be backed by a real quote from a real public source URL. No paraphrasing, no fabrication. If you can't find a real quote for a claim, drop the claim.

---

## Reuse-from-MEMORY shortcut

If MEMORY or `agent-core/diary/*.md` already has audience research for this niche from the last **30 days**, reuse it and skip the scan. Refresh only if the user explicitly asks.

---

## Where to scan

Use `web_search` and/or a `browser` sub-agent. Adapt the source list to the niche.

| Platform | Query pattern | What to look for |
|---|---|---|
| **Reddit** | `site:reddit.com "<pain phrase>" <category>` | First-person pain language in comments and post bodies |
| **Twitter / X** | `site:x.com "<category>"` (or `search_twitter` if connector available) | Frustration tweets, "I wish there was…" |
| **Instagram** | search high-engagement `#<niche>` posts; read **comments**, not captions | Repeated objections / desires |
| **TikTok / YouTube** | `site:tiktok.com <category>` for trending hooks | Comment threads on viral videos = raw desires |
| **Niche forums** | depends on niche (e.g., spiritual, parenting, fitness) | Long-form pain narratives |

Aim for ≥ 3 different platforms so the insights are not skewed by one community.

---

## Output schema → `audience_research.md`

```markdown
## Target Audience Profile
- Demographics (age, gender, lifestyle, income tier)
- Psychographics (values, interests, what they're trying to escape/achieve)
- Where they hang out online (specific subreddits, hashtags, IG accounts)

## Pain Points (verbatim quotes — NO paraphrasing)
1. "<exact quote>" — <source URL>
2. ...
(target: 6–8 pain points)

## Needs & Desires
1. <what they want from this product category, backed by quote/source>
(target: 5–6 needs)

## Emotional Triggers
- Recurring phrases / vocabulary the audience uses (literal words to mirror in copy)
- Values that drive purchase decisions

## Content Angles (3–5)
- Angle 1: <pain point> + <product benefit> framing
- Angle 2: ...
```

The Content Angles section is the direct hand-off to Step 3. Each angle should be traceable to a quoted pain point.

---

## Quality bar before exiting Step 2

- [ ] At least 6 verbatim pain-point quotes with source URLs
- [ ] At least 3 different source platforms represented
- [ ] At least 3 content angles, each tied to ≥ 1 quoted pain point
- [ ] No fabricated quotes, stats, or sources
