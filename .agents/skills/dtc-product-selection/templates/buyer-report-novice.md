<!--
Template Instructions (Read by agent, delete all before output):
- All [REQ:xxx] are required sections; without data, the skill is not complete—go back and fill it.
- All [OPT:xxx] are optional sections; if no data, delete the entire section (including heading), do not leave dashes.
- All [LOOP:xxx] loop according to the number of SKUs; fewer items mean fewer rows.
- Use English punctuation.
- Round numbers to 2 decimal places; add \$ or ¥ before currency.
- Before output, review SKILL.md §1 (2 hard rules) + §1.5 (5 soft references), especially "Reference image + multi-channel link" and "Tone & wording".
-->

# {Brand Name} · Product Selection Recommendations

> Target: First-time store owners | Data Benchmark: {Month YYYY}

---

## Summary at a Glance

**Launch in the {Category} niche with {N} products. The first batch of inventory will cost approximately {CURRENCY_AMOUNT}, and you can see results within 60 days.**

<!-- {CURRENCY_AMOUNT} = follow Currency rule above. USD → "\$X". RMB → "¥X (about \$X)". -->

> If this direction doesn't feel right, tell me what's not working, and I'll provide an alternative plan.

---

## Why This Direction?

[REQ:Candidate Comparison]

I compared the {N} candidate directions you provided:

| Candidate Direction | Recommendation | Key Reason |
|---|---|---|
| 🥇 **{Winning Direction}** | ⭐⭐⭐⭐⭐ | {One-sentence key advantage} |
| 🥈 {Runner-up Direction} | ⭐⭐⭐ | {One-sentence main drawback} |
| 🥉 {Third-place Direction} | ⭐⭐ | {One-sentence main drawback} |

**Why the winning direction is best:**

- 💰 **High profit potential**: {Generic example showing markup using the seller's currency — show landed cost vs retail and compute the multiple. Format: "A {category} costing {symbol}{cost} can be sold for {symbol}{retail}, which is {multiple}× the cost"}
- 📈 **Growing market**: {Cite specific market size numbers + data source year}
- 📸 **Visual appeal**: {Explain why content creation costs are low}
- ⚖️ **Friendly for individual sellers**: {Explain low regulatory / logistics / capital barriers}

---

## Your {N}-Product Collection

I've built a complete mix using 4 roles: "Loss Leader / Hero Product / Brand Flagship / Gift Set":

[LOOP:SKU]

| # | Reference Image | Product Name | Role | Price | Cost | **Profit per Sale** | Samples (Multi-channel) |
|---|---|---|---|---|---|---|---|
| 1 | <img src="{IMG_URL_1}" width="60"> | {Product Name} | 🎁 Loss Leader (Entry-level offer) | **\${X}** | \${X} | **\${X}** | [Alibaba]({REF_ALIBABA_1}) \| [{Platform 2}]({REF_ALT_1}) |
| 2 | <img src="{IMG_URL_2}" width="60"> | {Product Name} | 🌟 Hero Product (Primary ad focus) | **\${X}** | \${X} | **\${X}** | [Alibaba]({REF_ALIBABA_2}) \| [{Platform 2}]({REF_ALT_2}) |
| 3 | <img src="{IMG_URL_3}" width="60"> | {Product Name} | 🌟 Hero Product (Alternative variant) | **\${X}** | \${X} | **\${X}** | [Alibaba]({REF_ALIBABA_3}) \| [{Platform 2}]({REF_ALT_3}) |
| 4 | <img src="{IMG_URL_4}" width="60"> | {Product Name} | 👑 Brand Flagship (Premium high-ticket item) | **\${X}** | \${X} | **\${X}** | [Alibaba]({REF_ALIBABA_4}) \| [{Platform 2}]({REF_ALT_4}) |
| 5 | <img src="{IMG_URL_5}" width="60"> | {Product Name} | 🎀 Gift Set (Seasonal/Holiday bundle) | **\${X}** | \${X} | **\${X}** | [Alibaba]({REF_ALIBABA_5}) \| [{Platform 2}]({REF_ALT_5}) |

> ⚠️ **About Reference Samples**
> The images and links above are just to show **what the products look like**—they are not final suppliers.
> Links are provided from **multiple channels** for comparison. Pick by Geography: US/EU sellers see Alibaba (international wholesale) + AliExpress (single-unit sampling); China-domestic sellers see 1688 (lowest factory price) + Alibaba. Once you confirm the direction, the final supplier is **your choice**.

> 💡 **Why so many products? Can't I just sell one?** Customers entering a shop with only one product may feel it's a "empty/incomplete store" and hesitate to order. A collection of {N} products creates a professional brand identity.

**📌 Template Variable Instructions** (Hidden during agent output):
- `{IMG_URL_X}` must use a real image_url returned by `product_supplier_search` (Direct CDN links: s.alicdn.com / cbu01.alicdn.com), and must be wrapped in `<img src="..." width="60">` (Markdown `![]()` is forbidden).
- `{REF_ALIBABA_X}` = Real Alibaba product_url (Required).
- `{REF_ALT_X}` = Real link for a secondary channel. `{Platform 2}` should be AliExpress / Made-in-China / TikTok / Amazon (or 1688 only if Geography = China-domestic). If not found, write "`Alibaba only (additional channels to be added during sourcing phase)`"—**do not fabricate URLs**.
- Do not use imaginary URLs; do not use the same image for 5 different SKUs.
- If an SKU lacks a reference image, delete the row and note "Sample image for SKU N pending" below the table.

---

## Products I Filtered Out (So you can see my decision process)

Before selecting these 5, I reviewed a total of {Total Candidates} products. These were filtered out, and **here is why**—so you can judge if my reasoning is sound. If you think one should be brought back (e.g., if you have a special source), let me know and I'll recalculate.

| Candidate Product | Why I Rejected |
|---|---|
| {Candidate A} | {e.g., Only \$3 profit per order—not enough to cover overhead} |
| {Candidate B} | {e.g., Strict US Customs—risky for a new seller} |
| {Candidate C} | {e.g., Factory MOQ is 1,000 units, requiring an upfront \$8,000—over budget} |
| {Candidate D} | {e.g., Requires \$3 return for every \$1 spent on ads just to break even—unrealistic} |

> This is just my initial screening—the final decision is yours.

**📌 Template Constraints**: At least 3 rows; reasons must be data-driven (e.g., no vague "poor sales" or "low profit").

---

## Can This Business Make Money?

I've verified 3 key checks:

### ✅ Check 1: Profit per Sale

Selling the hero product ({Hero Product Name}) nets **\${X} profit per order**.

> This "profit" is the money that actually lands in your pocket after subtracting inventory costs, shipping, Shopify fees, and a reserve for returns.

### ✅ Check 2: Is Advertising Worth It?

For every \$1 spent on ads, you only need to earn back **\${X}** to break even. The industry average is \${X}—your product has healthy room to grow.

> As a beginner, you don't need to run ads yet. Start with free traffic on TikTok or Pinterest. This metric is for your peace of mind when you scale later.

### ✅ Check 3: Initial Inventory Cost

Stocking the full 5-product collection will cost approximately **{CURRENCY_AMOUNT}**. (Apply Currency rule from template header.)

> I've calculated this based on factory minimum order quantities (MOQ). It stays within your test budget, keeping your cash flow safe.

---

## What’s Next (Weekly Plan)

| Timeline | Action | Expected Result |
|---|---|---|
| **Week 1** | Register Shopify + Let AI build the store | Store is live and ready for orders |
| **Weeks 1-2** | List 5 products + Design + Install reviews/analytics | Store looks professional and trustworthy |
| **Week 2** | Place small orders via the supplier channel from your selection report (Faire for US/Canada-domestic lifestyle; Alibaba for US/EU/Canada cross-border; 1688 for China-domestic) + Film 5 TikToks | Inventory is on its way |
| **Weeks 3-4** | Goods arrive → Test shipping → Launch on social media | First orders start coming in |
| **Week 8** | Review data to decide on scaling with ads | Data-backed decisions for growth |

---

## Suggested Next Steps

1. ✅ Selection plan is ready (this report).
2. ⏭ **Next step: Build the store** — Use AI to set up your Shopify store from scratch (approx. 2 hours). I'll need your store login info.
3. ⏭ List the 5 products + Design the homepage.
4. ⏭ Set up store monitoring (receive a "Daily Store Health Report" in your email every morning).

> Please confirm: Direction, 5 products, and pricing strategy—anything you want to adjust? If it looks good, say "Start building the store," and we'll move to the next phase.
se.
