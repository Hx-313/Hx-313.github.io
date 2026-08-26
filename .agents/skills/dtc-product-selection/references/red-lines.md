# Decision red lines (use them by phase)

12 red lines split across 3 time windows. **Don't dump all 12 upfront** — surface only the ones relevant to the current phase; skip the rest.

---

## 🟥 Selection phase (Phase 1-2)

| # | Red line | Meaning |
|---|---|---|
| 1 | Markup < 4× | Price / landed cost < 4×; no headroom for ads + returns + platform fees |
| 2 | GM% < 60% | Gross margin too thin; unit economics don't work |
| 3 | MOQ × unit cost > 50% of test budget | First batch eats too much of the budget; if validation fails, cash flow snaps |
| 4 | Destination-market regulations not verified | Food / cosmetics / kids / batteries / magnets / fragrances must clear: **US** → FDA / CPSC / FAA / Prop 65; **EU** → GPSR (mandatory since Dec 2024, every consumer product needs Responsible Person + safety docs) / REACH (chemicals/fragrances) / CE marking; **UK** → UKCA / REACH-UK; **Canada** → Health Canada / CCPSA; **China-domestic** → CCC. Wrong region = product seizure at customs. |
| 5 | Supplier visual assets < 3 stars | Factory photos too poor to use directly → reshoot/remake before launch → budget + time both blow up |

---

## 🟧 Pre-launch (Phase 3-4)

| # | Red line | Meaning |
|---|---|---|
| 6 | CM% < 30% | Contribution margin can't carry CAC + ops |
| 7 | Break-even ROAS > 2.5 | Every \$1 of ad spend must return ≥ \$2.5 just to break even — too hard |
| 8 | First-Order Profit < -\$5 (and not high-LTV) | Lose > \$5 on first order with weak repeat-purchase signal = the more you sell, the more you lose |
| 9 | Total logistics lead time > 22 days | US buyers' patience ceiling — past this point, refund rate spikes |
| 10 | Initial SKU count < 5 (with at least 2 hero SKUs) | Too few SKUs to A/B-test ad creative; storefront also can't sustain conversion |

---

## 🟨 Targets within 3 months post-launch

| # | Target | Meaning |
|---|---|---|
| 11 | Store-wide SKUs ≥ 15 | Returning customers need fresh things to buy → AOV grows |
| 12 | LTV:CAC ≥ 2 | Customer lifetime value is at least 2× acquisition cost — model is working |

---

## How to use

- Hitting any 🟥/🟧 red line: **tell the user immediately** with a "swap to direction X / add optimization Y" suggestion
- Hitting a red line **does not block** the user from proceeding (unless they explicitly ask "is this still viable?") — the agent is a consultant, not a gate
- All red-line check results go into `.workspace/_red-line-check.md` (mandatory output)
