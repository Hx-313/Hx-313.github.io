# Multi-Platform Supplier Reference (Beyond Alibaba)

> **Purpose**: "Reference samples" in the selection phase and "Supplier sourcing" before official launch must be **cross-referenced across platforms**. Relying solely on Alibaba often leads to traps like "middlemen rebranding, inflated prices, and inability to see the real factory." Multi-platform comparison allows buyers to clearly see **price ranges** and **source authenticity**.
> **Usage Rules**:
> - **"Reference Samples" section of the selection report**: Include at least 1 `product_supplier_search` (Alibaba) reference image + 1 link to a similar product from another platform (Choose 1 from B/C/D).
> - **Official Sourcing Phase** (After user confirmation): Must cover **at least 2 channels** from the 4 categories below for price comparison before recommending a final supplier.

---

## Platform Categories & Use Cases

| Platform | Type | MOQ | Suitable Stage | Pricing | Pros | Cons |
|----------|------|-----|----------------|---------|------|------|
| **A. Alibaba.com** | B2B International | 50–500 | Official Stocking | Medium | English support, Trade Assurance, `product_supplier_search` integration | Many middlemen, needs factory verification |
| **B. 1688.com** | B2B Domestic (China) | 1–100 | Small Batch / Sample Verification | Lowest | Factory prices, complete SKU range, samples available | Chinese only, needs forwarding, no English support |
| **C. AliExpress.com** | B2C Cross-border | 1+ | **Sample Verification / Dropshipping Start** | Higher | 1 piece OK, direct shipping to US, English support | 30–50% more expensive, not for scaling |
| **D. Made-in-China.com** | B2B Factory Directory | 100+ | Industrial / Large Items | Low-Med | Strong factory presence, detailed specs | Outdated UI, slow response |

> Selection Phase "Reference Image" → Priority A (Real image_url via `product_supplier_search` on Alibaba).
> Sample Phase (Confirmed direction, need samples) → Recommend C (AliExpress 1+ piece + direct US shipping, fastest).
> Stocking Phase → Cross-reference A + B to compare "Ex-factory price" vs. "Export price"; select suppliers with < 30% gap.
> **US/Canada-domestic sellers** (lifestyle, handmade, candles, food, beauty niches) → may use **E. Faire** as the primary channel; cross-reference with A for cost comparison.

---

## Platform Link Formats (For Selection Reports)

| Platform | Link Example Format | How to list in report |
|----------|---------------------|-----------------------|
| Alibaba | `https://www.alibaba.com/product-detail/xxx.html` | "Alibaba Reference" |
| 1688 | `https://detail.1688.com/offer/xxx.html` | "1688 Wholesale Reference (Lower cost)" |
| AliExpress | `https://www.aliexpress.com/item/xxx.html` | "AliExpress Single Unit Reference (Best for sampling)" |
| Made-in-China | `https://www.made-in-china.com/products-search/...` | "Made-in-China Factory Reference" |
| TikTok Shop (Comp) | `https://www.tiktok.com/@xxx/video/xxx` | "TikTok Shop Best-seller Reference" |
| Amazon (Comp) | `https://www.amazon.com/dp/xxx` | "Amazon Best-seller Reference" |

---

## Multi-Platform Price Comparison Template (Official Sourcing)

> After the user confirms the direction, pull this structure into `_supplier-sourcing.csv`:

| SKU | Alibaba Price | 1688 Price | AliExpress Price | Est. Ex-factory Price | Recommended Channel | Reason |
|-----|---------------|------------|------------------|-----------------------|---------------------|--------|
| Soy Wax Candle 200g | \$4.5 (MOQ 100) | ¥18 ≈ \$2.5 (MOQ 50) | \$8/unit | ~$2.3 | **1688 Samples + Alibaba Stocking** | 1688 transparency, Alibaba Trade Assurance |

---

## Multi-Platform Format for "Reference Samples" Section

```markdown
| Product | Reference Image | Reference Links (Multi-channel comparison) |
|---------|-----------------|-------------------------------------------|
| Scented Candle | <img src="..." width=60> | [Alibaba](url) \| [1688](url) \| [AliExpress Single Unit](url) |
```

> At least Alibaba + 1 other channel. Choose from 1688 / AliExpress / Made-in-China / TikTok Comp / Amazon Comp.
> If no other channel is found, state it clearly: `Only Alibaba found (1688/others to be added during sourcing phase)`. **Do not forge links.**

---

## Methods for Finding Other Platform Links

Beyond `product_supplier_search`, the agent can use:

1. **web_search**: `"Product Name site:1688.com"` / `"Product Name site:aliexpress.us"` (Use search operators to limit sites).
2. **web_fetch**: `https://s.1688.com/selloffer/offer_search.htm?keywords=xxx` to pull 1688 search results.
3. **product_supplier_search**: Limited to Alibaba (its only role; do not use for other sites).

---

## Red Lines (Must Follow)

- ❌ Forging platform links ("AliExpress should have it" ≠ "I actually found it") — state clearly if not found.
- ❌ Using Alibaba image URLs for 1688 / AliExpress (CDNs differ by platform).
- ❌ Claiming "multi-platform comparison" in reports while showing only 1 platform — either show multiple or be honest that only Alibaba was found.
- ✅ Platform names must be specific terms the user recognizes ("Alibaba," "1688," "AliExpress"); do not use abstract terms like "B2B platform."
