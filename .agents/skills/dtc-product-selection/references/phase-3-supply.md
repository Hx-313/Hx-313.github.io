# Phase 3: Supply (Visual Assets + MOQ Cash Flow + Logistics Compliance)

3 items, one document: 5 Hard Thresholds for Visual Assets / MOQ & Cash Flow Projections / Logistics Lead Time & US Regulations.

> **Multi-platform supplier sourcing** (Alibaba + 1688 + AliExpress + Made-in-China comparison templates, link formats, and price-comparison CSV structure): see [`multi-source-supply.md`](multi-source-supply.md). Use this whenever you need to deliver "Reference Samples" or build the official sourcing comparison.

---

## 🎯 Agent Behavior Rules

1. **Upon receiving a candidate SKU, immediately call `product_supplier_search` to find supplier images**—do not judge by text descriptions alone.
2. Score each SKU against the 5 hard metrics; pass immediately if below 2 stars.
3. If MOQ × Unit Cost > 30% of the testing budget → Cut immediately (Red Line).
4. If US regulations are 🔴 and the seller lacks certification capability → Reject immediately.
5. Factor Visual Remediation Cost + Logistics + Compliance into the Landed Cost during product selection; do not add them as afterthoughts.

---

## A. Visual Asset Hard Thresholds (5 Indicators)

**Visual assets determine over 50% of Shopify DTC conversion rates.** If the supplier's images are sub-par, either switch suppliers or pass on this SKU entirely.

### 5 Hard Indicators (5-Star Scale, 1 Star per Metric)

| # | Indicator | 5 Stars | 3 Stars | 1 Star |
|---|-----------|---------|---------|--------|
| 1 | **Main Image Clarity** | ≥ 1500x1500, no watermarks/pixelation, accurate colors | ≥ 800x800, no obvious flaws | < 500px or with watermarks/collages |
| 2 | **Multi-angle Coverage** | 5+ images (front/side/detail/packaging/lifestyle) | 3-4 images (basic coverage) | Only 1-2 images |
| 3 | **Lifestyle/Contextual Images** | 2+ real-world scenes (in-use/home environment) | 1 lifestyle image | Plain white background only |
| 4 | **Detail Showcase** | Materials/craftsmanship/size comparisons complete | 1-2 detail shots | Unclear details |
| 5 | **Model/Human Interaction** (if applicable) | Real person wearing/using (essential for jewelry, apparel, beauty) | Hand comparison/partial view | Product only, no people |

> For categories not requiring humans (home decor, tools) → Skip #5 and score on a 4-star scale.

### Ratings & Decisions

| Total Score | Decision | Action |
|-------------|----------|--------|
| 5 Stars | ✅ List Directly | Use supplier images + minor tweaks |
| 4 Stars | ✅ List | Add 1-2 lifestyle images (AI-generated or stock) |
| 3 Stars | 🟡 Caution | Must supplement with original photography; include in cost |
| 2 Stars | 🔴 Do Not List | Find another supplier or change SKU |
| 1 Star | 🔴 Reject immediately | Do not hesitate |

### Visual Asset Costs (Calculate in Advance)

| Method | Cost/SKU | Lead Time | Best For |
|--------|----------|-----------|----------|
| Supplier Images + AI Tweaks (watermark removal/background swap) | \$0-5 | 1 Day | 4-5 Stars |
| AI-Generated Lifestyle Images (image_edit) | \$2-10 | 1 Day | Supplementing 1-2 shots |
| Purchase Stock Photos | \$10-30 | Instant | General lifestyle scenes |
| DIY Sample Photography | \$30-100 | 1-2 Weeks | 3-star products |
| Hire Professional Photographer | \$200-1000 | 2-4 Weeks | Only for Flagship products |

🟥 **Red Line**: Visual Cost > Gross Profit per order × 5 → Not worth pursuing.

### Record in Selection Matrix

For each SKU in `_product-marketing-ops.csv`, add:
- Supplier Image Rating (e.g., 3★)
- Visual Remediation Plan (e.g., AI + 2 lifestyle + 1 DIY detail)
- Visual Remediation Cost (e.g. \$15)
- Impact on Selection (Yes/No)
- **Listing Media Readiness**: `ready` | `needs_editing` | `poor` | `reject_risk`
- **Batch Cover Aspect Ratio**: the aspect ratio chosen for the launch batch after inspecting actual candidate images (e.g., `0.82`, `1 / 1`, or `4 / 5`), with a short evidence note. Do NOT hardcode `1:1` or `4:5`.
- **Cover Image Fit Risk**: `low` | `medium` | `high` — flag SKUs whose product subject is much narrower/taller or has heavy whitespace compared with the batch

### Listing media readiness gate (selection → listing handoff)

Product image consistency is an **upstream listing-readiness issue**, not primarily a theme-decoration issue. Before a SKU is handed to listing:

1. Inspect the real supplier/reference images for every candidate in the launch batch.
2. Choose a **single batch cover aspect ratio** based on the actual image set and target surfaces (homepage cards, collection cards, PDP main image). Do not default to `1:1` or `4:5` without evidence.
3. Classify each SKU against the chosen batch ratio:
   - `ready`: cover image already fits the batch ratio and subject scale is consistent.
   - `needs_editing`: usable, but needs crop/canvas extension/background cleanup/subject-scale normalization.
   - `poor`: image can support sourcing validation but is not launch-ready.
   - `reject_risk`: only watermarked/collage/low-res/misleading images; avoid first-batch listing unless replacement media is available.
4. Include visual remediation cost/time in unit economics before recommending the SKU.
5. If several promising SKUs cannot be made visually consistent without heavy editing, prefer a different supplier or SKU for the first launch batch.

Theme/Catalog CSS may later normalize containers, but it must be treated as a fallback. It cannot fix inconsistent product-subject scale inside supplier images.


---

## B. MOQ and Cash Flow Calculation

Product selection isn't just about "can it make money," but "can it survive until it makes money."

### MOQ Reality for Different Fulfillment Methods

| Method | MOQ | Unit Cost | Suitable Phase |
|--------|-----|-----------|----------------|
| **Dropshipping** | 1 Unit | Highest (+30-50%) | Phase 0: Validation |
| **Small Batch Stocking (In-house)** | 50-200 Units | Medium | Validated SKUs |
| **Bulk Customization** | 500-1000+ Units | Lowest | Proven Hero products |
| **Overseas Warehouse (3PL)** | 100+ Units | Medium (Fast shipping) | High US customer volume |

### Recommended Strategies per Phase

| Phase | Order Volume | Strategy | Cash Flow Requirement | Bundle |
|-------|--------------|----------|-----------------------|--------|
| 1 | 0-100 Orders | 100% Dropshipping | Pay supplier after receiving customer payment | ❌ Not feasible |
| 2 | 100-1000 Orders | Small batch stocking for Hero (50-200 units), others dropshipping | \$1000-5000 for stock | ✅ Feasible |
| 3 | 1000+ Orders | Custom production + Overseas warehouse | \$10000+ | ✅ Custom gift boxes |

### MOQ Product Filter (Must ask for every candidate SKU)

1. **What is the minimum MOQ?** (Dropshipping 1 / Stocking ≥ 50 / Custom ≥ 500)
2. **MOQ × Unit Cost = Upfront Investment**
   - < \$300: Acceptable
   - \$300-1000: Medium risk
   - \> \$1000: Proceed with caution
3. **Cash Flow Recovery Cycle**: Full MOQ sold = MOQ ÷ Monthly Sales (months)

### Initial Stocking Capital Calculation

Total Stocking Capital = Σ(MOQ per SKU × Unit Cost × 1.2) (×1.2 = First-mile freight + buffer for losses)

Advice for Beginners:
- Full Dropshipping: \$0 inventory capital, but lower margins
- Semi-Dropshipping/Stocking: \$1500-3000 starting capital
- Full Stocking (Professional): \$5000-15000 starting capital

### Cash Flow Bankruptcy Red Lines (Avoid the most common failure in Year 1)

1. **Always reserve 30% as emergency cash** (do not lock everything in inventory).
2. **First batch per SKU should not exceed 50 units** (unless validated).
3. **Prioritize SKUs with high Gross Margins** (same capital lasts longer).
4. **Avoid suppliers with long payment terms** (require COD or > 3 months terms only if established).

### Record in Selection Matrix

For each SKU in `_product-marketing-ops.csv`, add: MOQ / Initial Stocking Qty / Initial Investment / Estimated Sales Cycle.

---

## C. Logistics Lead Time + US Regulations + Prohibited Items

**Failure to check during selection leads to customs seizures or platform bans—losses far outweighing an extra 30 minutes of research.**

### 1. Logistics Methods (China → US)

| Method | Lead Time | Unit Cost | Volume Limits | Best For |
|--------|-----------|-----------|---------------|----------|
| China Post Small Packet | 15-30 Days | \$3-8 | < 500g | Entry |
| ePacket / Surface Mail | 12-20 Days | \$5-12 | < 2kg | Entry-Hero |
| Special Line (e.g., YunExpress) | 7-15 Days | \$8-20 | < 5kg | Hero-Premium |
| Overseas Warehouse (US Local) | 2-5 Days | Pre-stock + \$3-8 | No limit | Validated SKUs |
| Air Freight (Commercial) | 5-10 Days | \$15-50 | Bulky items | Premium |

### Logistics Impact during Selection (Reject Signals)

- **Weight > 1kg** → Logistics costs skyrocket; select carefully.
- **Fragile Items (Glass, Crystal)** → High packaging costs + high return rates.
- **Oversized (> 50cm)** → Only Air Freight or Overseas Warehouse viable.
- **Liquids/Sprays** → Rejected by most logistics providers.
- **Magnets** → Rejected by most air logistics.
- **Lithium Batteries** → Requires special channels; costs double.

### 2. Destination-Market Regulations and Certifications

> Pick the section matching your **destination market** (where customers receive the goods), not the seller's home country. Cross-border sellers must comply with the destination market's rules.

#### 🇺🇸 United States

🟢 **General (no certification)**: Home decor, stationery, jewelry (non-precious), office supplies, adult apparel, pet toys.

🟡 **Simple labeling / declaration**:
- Food/Beverage → FDA Food Facility Registration (free but mandatory)
- Cosmetics → MoCRA Registration (mandatory from 2025)
- Scented Candles → ASTM F2417 labels
- Electronics (non-wireless) → FCC Verification

🔴 **High risk (heavy certification)**: Children's <12 (CPSC + CPSIA), Baby (CPSC), Battery-powered (UL + UN38.3 + Prop 65), Medical Devices (FDA 510(k)), Supplements (FDA + GMP), Food-contact (FDA 21 CFR), Lasers (FDA Notification).

#### 🇪🇺 European Union

🟢 **General (no certification)**: Same scope as US general.

🟡 **Mandatory product safety**:
- **GPSR** (General Product Safety Regulation, mandatory since Dec 2024): every consumer product needs a **Responsible Person established in the EU** + technical safety documentation + traceability label
- **REACH**: chemicals, fragrances, candles, cosmetics — restricted-substances list compliance
- **CE marking**: electronics, toys, PPE, machinery
- **Cosmetics**: EU 1223/2009 + CPNP notification
- **Toys** (< 14 yrs): EN 71 + CE
- **Electronics**: EMC + RoHS + WEEE registration
- **Food contact**: EU 1935/2004 framework

🔴 **High risk**: Medical devices (CE under MDR 2017/745), supplements (per-country health-claim rules vary widely).

#### 🇬🇧 United Kingdom

Post-Brexit: similar to EU but separate scheme.
- **UKCA** marking (replaces CE for UK market; CE still accepted in NI)
- **REACH-UK** (separate registration from EU REACH)
- **PAS-71** for fragrance/candles
- UK Responsible Person required for cosmetics

#### 🇨🇦 Canada

- General CCPSA (Canada Consumer Product Safety Act) compliance
- **Health Canada** notification for cosmetics + supplements
- Bilingual EN/FR labels mandatory (Quebec Charter of French Language)
- Electronics → CSA marking

#### 🇨🇳 China-domestic

- **CCC** (China Compulsory Certification) for electronics, appliances, toys, safety products
- **NMPA** for cosmetics + medical devices
- Food: SAMR registration

#### 🚫 High-controversy categories (avoid in any market)
Weapons / paintball / laser pointers, CBD/Hemp-infused products, counterfeits, prescription drugs / syringes.

### 3. China Export Prohibitions/Restrictions

#### Strictly Prohibited
Weapons/Ammo, Flammable/Explosive materials, Hazardous chemicals, Radioactive substances, Cultural relics, Endangered species, Pornographic/Politically sensitive materials.

#### Restricted Export (Requires special permits)
- **Jade/Emerald** → Requires customs declaration.
- **Antiques/Replicas** → Requires Cultural Relics Department certificate.
- **Food/Cosmetics** → Requires Inspection and Quarantine Certificate.
- **CBD Products** → Strictly controlled for export from China.

### Record in Selection Matrix

For each SKU in `_product-marketing-ops.csv`, add: Logistics Method / Unit Freight / Lead Time / Weight / Fragility / US Certification / China Export Restriction / Compliance Risk Rating.

### 🟥 Red Lines (Reject immediately if any apply)

1. US Regulation 🔴 but seller lacks certification capability.
2. China Export "Strictly Prohibited."
3. Logistics restricted to Commercial Air Freight + Unit Price < \$50.
4. Counterfeit/Intellectual Property infringement.
5. Contains CBD/Hemp/Prescription ingredients.

---

## Anti-Patterns (Agent Self-Check)

- ❌ Blindly trusting supplier claims of "great images"—must verify personally.
- ❌ Forcing low-quality images (caps conversion potential).
- ❌ Ignoring visual remediation costs (eats profit).
- ❌ Assuming all SKUs are dropshippable.
- ❌ Asking the user to commit all capital at once.
- ❌ Assuming "nobody checks small sellers" (fines start at \$1k+).
- ❌ Dealing in counterfeits (even if the logo is only slightly similar).
- ❌ Ignoring logistics weight (> 1kg can eat half of the profit).
