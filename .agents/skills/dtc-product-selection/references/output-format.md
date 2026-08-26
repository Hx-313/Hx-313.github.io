# Output format & deliverable spec

After all phases, **strictly two layers**. **The user-facing chat only mentions paths under `deliverables/`; never expose `.workspace/`.**

---

## 📦 `project/deliverables/` — for the buyer (always shown)

Pick **one set** based on `buyer_level`:

| buyer_level | Primary deliverables | Templates |
|---|---|---|
| 🌱 novice | `product-selection-report.md` (1 file) | `templates/buyer-report-novice.md` |
| 🎯 pro | `product-selection-report.md` + `financial-model.md` (2 files) | `templates/buyer-report-pro.md` + `templates/buyer-finance-pro.md` |

**Novice version**: zero "Markup / CM% / Break-even ROAS / GM% / Landed Cost / MOQ"; instead use "sell at X× cost" / "\$X net per order" type phrasing.

**Pro version**: keep professional metrics, but every metric's **first occurrence** gets a plain-language gloss + industry health band.

---

## 🔧 `project/.workspace/` — agent's internal worksheet (**hidden from the user**)

**Never bring up these files in chat unprompted.** If the user asks, say "those are the underlying calculation files".

**🔴 Mandatory outputs (not optional)**: the 5 files below must be physically written to disk, otherwise the downstream skill chain breaks (dtc-builder reads `_product-marketing-ops.csv` for listing; shopify-monitoring reads `_unit-economics.csv` to validate CAC). Before reporting completion, the agent must use the `list` tool to confirm `.workspace/` has ≥ 5 files.

| File | Required | Purpose |
|---|---|---|
| `_discovery-brief.md` | 🔴 | **buyer_level** / niche / budget / geography (downstream reads this first to identify the user) |
| `_unit-economics.csv` | 🔴 | Full 17-column financial model |
| `_product-marketing-ops.csv` | 🔴 | 26 columns: cols 1-13 are Shopify-listing fields (consumed by dtc-builder); cols 14-26 are selection metadata (holiday/SEO long-tail/MOQ/supplier_url) |
| `_red-line-check.md` | 🔴 | Per-SKU record of red-line checks: 5 selection-phase rows during Phase 1-2; +5 pre-launch rows when Phase 3-4 completes; the 2 post-launch targets are tracked in monitoring, not here |
| `_research-raw.md` | 🟡 recommended | Multi-source raw scrape data |

Missing any 🔴 file = skill incomplete; you may not report "done" to the user.

---

## 📌 Naming + numbering rules

- `deliverables/` uses **English filenames** (so the user can recognize them in Finder); `.workspace/` uses **English with underscore prefix**
- Every file's header must include the data baseline date
- **Any "product count" in a report must be consistent end-to-end**: if the title says "5 SKUs", every table, body paragraph, and next-step section must use 5. To introduce "future expansion", create a separate "Expansion roadmap" subsection — don't mix it into the main count
- **Section numbering uses standard multi-level digits**: `## 1. Market read` → `### 1.1 Data sources`; never use "I·A / Chapter Six"; no skipped numbers; novice version may use unnumbered narrative paragraphs ("My pick / What I cut")

---

## Layout basics (every deliverable obeys these)

- **Each section ≤ 1 screen** (~250 words / 8-row table); split into subheadings if it overflows
- **Bold the key numbers**: `**\$31 net profit**`
- **Lead with the conclusion**: every paragraph's first sentence states the conclusion
- **Avoid tables wider than 4 columns** (mobile wraps and breaks the layout)
- **End every file with a "What to do next" action block**

---

## Section names should sound like a DTC seller, not an academic

Don't let jargon own the heading:

- ❌ `## 4. Unit Economics`
- ✅ `## 4. Unit Economics (How much per order + How much per customer)`
  - `### 4.1 How much per order`
  - `### 4.2 How much per customer`
  - `### 4.3 Whole-store composite verdict`

The health-check table uses **a single "Measured value" column** (not a "measured + status" double column).
