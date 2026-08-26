# ICP (Ideal Customer Profile)

One document for three scenarios: ICP **Defined** / ICP **Vague** / **No** ICP (Reverse-inference from product).

---

## 🎯 Agent Behavior Rules

1. **Do not make the user fill out the full 6-dimension set**—most won't know how or will provide random guesses.
2. **Never ask the user for fields that the agent can infer**: Repurchase frequency (determined by niche), media preferences, and reachability. The agent provides benchmarks directly.
3. **Prioritize reverse-inference from products** (the product itself carries information about "who would buy it"); do not force the user to start from scratch.
4. **Never ask open-ended questions** like "Who is your customer?"—provide 3 candidate profiles for the user to choose from.

---

## Simplified Structure: 3 Required + 3 Inferred + 1 Optional

### ✅ 3 Required Items (Must get from user)

| # | Field | Content |
|---|-------|---------|
| 1 | **Demographics** | Gender / Age Range / Income Level / Geography (Country + Urban/Rural) |
| 2 | **Core Pain Point** | One sentence: What is the user's biggest pain? (Anxiety / Insomnia / Lack of time / Aesthetic needs / Parenting stress) — The soul of the ICP; cannot be inferred by agent. |
| 3 | **AOV Preference** | < \$30 / \$30-80 / > \$80 — Directly determines the 3-Tier price points. |

### 🤖 3 Inferred Items (Agent provides benchmarks for user calibration)

#### 4. Repurchase Frequency (Benchmark by niche)
- Food / Skincare / Pet Food → **30-90 days**
- Apparel / Home → **3-6 months**
- Crystals / Spirituality / Gifting → **6-12 months**
- Large Furniture / Appliances → **1 Year+**

#### 5. Media Preferences (Inferred from demographics)
- 18-25 Female → TikTok / IG / Pinterest
- 25-35 Female → IG / Pinterest / Reddit
- 25-40 Male → YouTube / Reddit / Discord
- 35+ → Facebook / Google / Email

#### 6. Reachability (Agent's judgment)
- Can this group be reached via Meta / Google / TikTok?
- Can an solo entrepreneur target this group? (Meta: Yes / TikTok Shop US: Limited / Google: Yes)
- CAC Benchmark (Range by niche, e.g., Crystals \$15-30)

### 📝 1 Optional Item

**Deep Psychological Motivation**: What do they crave? What do they fear? Brand value preferences? — **Do not force this**; record only if the user provides it voluntarily.

---

## Scenario Routing (read first)

| Signal in user's message | Use Scenario |
|---|---|
| User states demographics + pain point ("women 30+, anxious, urban") | **A. Defined** |
| User gives partial signal — pain-point fragment, audience hint, or vague vibe ("burned-out professionals", "Gen Z aesthetic", "people who can't sleep") | **B. Vague** (run the 5-question wizard) |
| User has a specific product or category in hand but no audience clue | **C. Reverse-inference from product** |
| User has nothing — no product, no audience, no pain point ("I don't know what to sell") | Defer ICP; first run [`newbie-path.md`](newbie-path.md) §A "Completely Blank" → after 3 candidate directions are picked, return to **C** to back-infer ICP from the chosen direction |

---

## Scenario A: ICP Already Defined (Direct Validation)

User-provided ICPs usually only cover demographics. The agent proactively supplements fields 4/5/6 using niche benchmarks and asks the user to calibrate. **Do not throw all 6 items back as questions.**

---

## Scenario B: Vague ICP (5 Multiple-choice questions, 30-sec finish)

Ask in order, **providing 3-4 options for each**; do not use open-ended questions:

### Q1: Age Group (Affects aesthetics and spending power)
- A. 18-24 (Gen Z, TikTok natives, limited budget but impulsive)
- B. 25-34 (Young professionals, medium budget, taste-oriented)
- C. 35-44 (Established, highest budget, quality-oriented)
- D. 45+ (Mature, utility + health-oriented)

### Q2: Income Level (Affects pricing tiers)
- A. Monthly < \$3k (Students/Blue-collar, focus on < \$30)
- B. \$3-6k (Standard white-collar, price range \$30-80)
- C. \$6-12k (Middle class, price range \$80-200)
- D. \$12k+ (Affluent, price range \$200+)

### Q3: Core Pain Point (Determines Value Proposition)
Pick 1-2: Lack of time / Lack of confidence / Anxiety & Stress / Loneliness & Connection / Health concerns / Aesthetic pursuit / Value for money / Identity

### Q4: Media Habits (Determines traffic acquisition)
- A. TikTok Heavy → Content-driven
- B. IG Heavy → IG Hashtags + Influencers
- C. Pinterest → Visual content
- D. Google Search → SEO Long-tail
- E. Reddit / Forums → Community + Content
- F. Active Email → Email Marketing

### Q5: Shopping Decision Habits
- A. Impulsive → \$15-40 + TikTok
- B. Comparative → \$40-100 + Detailed comparisons
- C. Research-driven → \$80+ + Long-form SEO content
- D. Gifting → \$50-150 Gift sets + Holiday marketing

**Immediately summarize into a full profile after 5 questions**:

> "Your target customer is [Q1 Age][Q2 Income], with the main pain point [Q3]. They are active on [Q4 Platform] and have a [Q5] shopping habit.
>
> This means your store should:
> - Target price points \$XX-XX
> - Focus traffic on [Platform]
> - Content style [XX]
> - Priority SKU focus [XX]"

---

## Scenario C: No ICP (Reverse-inference from product, agent provides 3 candidates)

### 5 Inference Signals (Agent internal use)
Self-ask for the niche/product:
1. Who has this need? (What problem is solved?)
2. Who can afford this price? (Spending power)
3. Who is most likely to share on social media? (Virality)
4. Who will repurchase? (Consumption/Growth)
5. Who will give this as a gift? (Gifting scenario)

### Output 3 Candidate Profiles (Ensure distinct differences)

Each profile must include: Age+Gender+Occupation / One-sentence pain point / Main platform / AOV tendency / Preferred categories.

**Example: 3 Candidates for Crystal Niche**

| Candidate | Profile | Pain Point | Platform | AOV | Preference |
|-----------|---------|------------|----------|-----|------------|
| **A. WitchTok Spiritualist** | 18-24 Female Student | Identity search / Belonging | TikTok #witchtok | \$20-50 | Tarot accessories / Moon phases / Zodiac |
| **B. Urban Professional Healer** | 28-38 Female Professional | Anxiety / Insomnia / Work stress | IG / Pinterest / Yoga | \$50-120 | Desk decor / Sleep aid / Meditation sets |
| **C. High-end Gift Buyer** | 35-50 Middle class | Finding meaningful gifts | Google "unique gifts" / Pinterest | \$80-200 | Gift boxes / Large clusters / Artisan designs |

### Ask user to pick 1 Primary + 1 Secondary + 1 Excluded

```markdown
Based on your products, I infer 3 types of buyers. Please pick:
- 1 Primary (Main focus, 60-70% of sales)
- 1 Secondary (Expansion group, 20-30%)
- 1 Excluded (Explicitly do not target, to avoid distraction)
```

If the user cannot decide, provide recommendations:
- Pick the **group you are most similar to or understand best** (you know them best).
- Or pick the **Premium pricing group** (higher margins, faster CAC recovery).

### Inference Data Sources
- Amazon Reviews: Look for "User self-introductions".
- Reddit Niche Subreddits: Real discussions.
- Instagram Hashtags: Poster bios/identities.
- TikTok Comments: Profile info in viral video comments.
- Etsy Reviews: Real buyers for handmade/high-premium items.
- Pinterest Boards: What boards are they saving to.

---

## Output Format (Write to `project/.workspace/_icp-profile.md`)

```markdown
# ICP Profile — [Niche Name]

## Primary ICP (60-70% of Sales)
[3 Required + 3 Inferred fields, 1-2 sentences each]

## Secondary ICP (20-30%)
[Simplified 2-3 sentences]

## Excluded Audience (Explicitly do not sell to)
[Avoid being "all things to all people"]

## One-Sentence Golden Rule
"[Age][Identity], because of [Pain Point], will buy [Product Type], prioritizing [Key Factor]"

Example: A 30-year-old urban yoga instructor, because of anxiety and insomnia, will buy sleep-aid crystal sets, prioritizing ethically sourced materials and IG-aesthetic imagery.
```

---

## Use ICP to Back-Validate SKU Matrix

After writing the ICP, return to the SKU matrix and **validate each item**:
- Would the Primary ICP buy this SKU?
- Are the images/copy/price points what the Primary ICP likes?
- Mismatch → Delete or adjust.

### ICP → Product Selection Mapping

| ICP Preference | Impact on Selection |
|----------------|---------------------|
| AOV Tendency | Focus on Entry / Hero / Premium pricing |
| Media Preference | Main channel: TikTok / IG / SEO / Pinterest |
| Content Preference | PDP focus on Images+Text vs. Video |
| Decision Cycle | Marketing rhythm: Impulse promos vs. Long-term education |

---

## Anti-Patterns (Agent Self-Check)

- ❌ Making the user fill all 6 dimensions (won't know how).
- ❌ Asking for metrics the user doesn't know (e.g., "Decision cycle / Industry avg CAC").
- ❌ Settling for vague descriptions like "Young women" (Must be specific: Age + Income + Location type).
- ❌ Assuming "anyone might buy it" (Must converge to 1-2 types).
- ❌ Letting the user brainstorm ICP from scratch (Use reverse-inference + options).
- ✅ Agent provides benchmarks for user calibration (Saves 50% of questioning).
- ✅ Must have an "Excluded Audience" to force focus.
- ✅ Golden Rule must include Pain point + Product + Decision factor.
