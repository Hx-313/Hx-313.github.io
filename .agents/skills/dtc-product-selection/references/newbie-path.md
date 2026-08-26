# Newbie Branching Path (Blank + Broad Direction)

Applicable: Users who say "I want to do Shopify but don't know what to sell," or "I'm interested in women's / health / outdoor / pet niches."

> 📅 **Data Benchmark: 2026 Q1**. AOV / Profit Margins / Competition numbers drift with inflation and market shifts; verify latest trends for 1-2 niches using `web_search` every 6 months.

---

## 🎯 Agent Behavior Rules

1. **Do not ask the user "What do you want to do?"** First, use `web_search` / Google Trends / Shopify Trends / Pinterest Predicts to find 3 candidate directions.
2. Output 3 recommended directions + **explicitly suggest the 1st one** for user confirmation. Example: *"I recommend Direction A because of X. What do you think? Let me know if you want to switch to B or C."* — Avoid pushy phrasing like "I am starting with A."
3. If the user provides a broad niche (e.g., "Women / Health / Outdoor"), follow the agent recommendation first—suggest 5 sub-niches + explicitly recommend the 1st one for the user to decide.
4. **Never use "5-question interest tests" or similar questionnaire-style interactions.**

---

## A. Completely Blank: 3 Candidate Directions (Agent-led)

After fetching data, provide 3 directions (**do not list 7+ for the user to choose from**):

- Shopify Commerce Trends reports (Quarterly)
- TikTok "Made Me Buy It" hashtag 30-day top trends
- Google Trends comparison of major categories
- Pinterest Predicts annual trends

Output Format:

```markdown
🥇 Direction A: [Niche]
  - Data Evidence: [Source + Timestamp]
  - Typical AOV / Markup / SKU Formats
  - Why it fits you: [1-2 points]
  - Main Risks: [1-2 points]

🥈 Direction B / 🥉 Direction C (Same structure)

➡️ I recommend Direction A. Would you like to proceed with this direction? Let me know if you prefer B or C.
```

### Candidate Direction Attribute Reference (Internal use, do not show to user)

| Category Dimension | Representative Niche | AOV | Profit Margin | Traffic Difficulty | Content Pressure |
|--------------------|----------------------|-----|---------------|--------------------|------------------|
| High Emotional Premium | Crystals / Scented Candles / Handmade Jewelry | \$30-80 | 60-75% | Medium | Medium (Visuals) |
| Functional Solution | Storage / Small Appliances / Tools | \$40-100 | 40-55% | Low (Clear intent) | Low (Demo) |
| Health Trend-driven | Recovery / Sleep / Skincare | \$35-90 | 50-70% | High (Competitive) | High (Professional) |
| Hobbyist/Interest | Board Games / Anime / Camping | \$30-150 | 45-65% | Low (Targeted) | High (Expertise) |
| Gifting | Holiday Boxes / Personalized | \$50-120 | 55-70% | Medium (Seasonal) | Medium |
| Home Aesthetics | Nordic / Instagrammable Decor | \$35-90 | 50-65% | Medium | High (Consistency) |

**Anti-Patterns (Agent Self-Check)**:
- ❌ Recommending evergreen categories that are too broad (e.g., "Pets," "Electronics," "Home").
- ❌ Listing 5+ options for the user—stick to 3 + a default 1st choice.
- ❌ Using surveys for inference—use data for inference.

---

## B. Broad Direction Provided: 5 Sub-niches + Default Recommendation

### "Women's" → 5 Sub-niche Candidates
- Beauty/Skincare Tools (Sell tools, not cosmetics, to avoid regulation)
- Period Care / Women's Wellness
- Contemporary Jewelry / Accessories
- Yoga / Meditation / Spirituality
- Home Essentials (Kitchen / Cleaning / Storage)

### "Health" → 5 Sub-niche Candidates
- Sleep Optimization (Eye masks / White noise machines)
- Sports Recovery (Massage guns / Massage balls / Compression socks)
- Mental Health (Meditation / Aromatherapy / Fidget toys)
- Supplement Accessories (**Sell shakers/organizers**, not supplements, to avoid FDA)
- Posture Correction (Standing desks / Back support / Arch supports)

### "Outdoor" → 5 Sub-niche Candidates
- Camping Gear (Tents / Lights / Portable cookware)
- Fishing Gear (Highly vertical)
- Hiking Gear (Socks / Poles / Knee pads)
- Outdoor Imaging (GoPro accessories / Tripods / Waterproof bags)
- Urban Outdoor (Commuter backpacks / Rain gear / Portable chairs)

### "Pet" → 5 Sub-niche Candidates
- Smart Pet Tech (Automatic feeders / Cameras)
- Training/Behavior (Clickers / Treat bags / Toys)
- Travel/Commute (Backpacks / Car mats)
- Grooming (Brushes / Nail clippers)
- Apparel (Holiday outfits / Raincoats - Highly seasonal)

> For other broad directions (Digital accessories / Office / Home Aesthetics / Baby / Hobby...), split into 5 sub-niches following the template above.

### 6-Dimension Scoring (Agent-led, do not ask user to fill)

| Dimension | 1 Point | 3 Points | 5 Points |
|-----------|---------|----------|----------|
| AOV Potential | Avg < \$25 | \$25-50 | > \$50 |
| Profit Margin | < 35% | 35-55% | > 55% |
| Competition | Giant monopoly | Many mid-sized brands | Fragmented long-tail |
| Content Difficulty | Human + Pro | Semi-pro | Photo-only OK |
| Seasonality | Single holiday | High but year-round | Stable year-round |
| Seller Friendliness | Corporate only | Some certs needed | Individuals OK |

> Data sources: Google Trends (Seasonality) / Jungle Scout (Competition) / 1688 Cost (Profit) / Reddit/IG competitors (AOV).

**Output**:

```markdown
I have broken down your broad direction "X" into 5 sub-niches and scored them across 6 dimensions:
(Table: 5 rows + sorted by total score)

🥇 Recommend [Sub-niche A], Score 28, Reason X.
🥈 Alternative [Sub-niche B] / 🥉 Alternative [Sub-niche C]

➡️ I recommend [Sub-niche A] because [X]. Shall we proceed with this direction? Let me know if you want to switch.
```

**Tie-break Rule**: If 2 sub-niches both score ≥24, **prioritize the one with higher "Individual Seller Friendliness"** (a hidden critical dimension for independent sellers).

**Geography-specific friendliness signals** (apply when scoring solo entrepreneur viability):
- **US** → sole prop OK; Shopify Payments + PayPal frictionless; sales tax = nexus-based (auto via Shopify Tax)
- **Canada** → register Business Number for Shopify Payments Canada; GST/HST registration mandatory at CA\$30K revenue/yr; PayPal Canada works without business; can use Faire/Tundra (Canadian-friendly B2B) instead of Alibaba for lifestyle/handmade
- **EU/UK** → VAT registration mandatory before launch; OSS/IOSS for cross-border EU sales; Stripe + PayPal frictionless
- **China cross-border** → use Payoneer / Wise / PingPong for receiving USD; Shopify Payments not available; rely on PayPal + Stripe via overseas entity

---

## C. Next Step After Selection

→ Proceed to `references/focused-path.md` for winning product matrix mining.
