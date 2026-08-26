# Hero constellation placement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use inline execution with checkpoints.

**Goal:** Align the hero's Pet Care and EPOS artifacts with the supplied reference and rename/reposition the center download metric.

**Architecture:** Keep the existing React constellation markup and CSS positioning system. Change the metric label in `HeroVisual.jsx` and tune only the relevant desktop and responsive CSS selectors in `hero.css`.

**Tech Stack:** React, CSS, Vite, Playwright/Python visual checks.

## Global Constraints

- Update only the hero constellation presentation and its styles.
- Preserve existing animation, interaction, selected-build readout, and unrelated uncommitted work.
- Keep mobile and short-viewport behavior usable.
- Do not change artifact data, routing, or project links.

### Task 1: Add regression coverage for requested copy and selectors

**Files:**
- Create: `tests/hero-constellation-placement.py`

- [ ] **Step 1: Write the failing browser assertions**

```python
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


def test_hero_constellation_placement_and_metric():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://127.0.0.1:4321/", wait_until="networkidle")

        expect(page.locator(".constellation__metric")).to_have_text("100K+ DOWNLOADS")
expect(page.locator(".artifact--petcare")).to_have_css("top", "8%")
expect(page.locator(".artifact--epos")).to_have_css("top", "3%")

        browser.close()
```

- [ ] **Step 2: Run the check before implementation**

Run: `python tests/hero-constellation-placement.py`

Expected: FAIL because the metric still contains `COLLECTIVE` and the existing selectors do not yet match the requested placement.

### Task 2: Implement the targeted hero adjustment

**Files:**
- Modify: `src/modules/home/presentation/hero/HeroVisual.jsx`
- Modify: `src/modules/home/presentation/hero/hero.css`

- [ ] **Step 1: Change the metric copy**

Replace:

```jsx
<span className="constellation__metric">100K+ COLLECTIVE DOWNLOADS</span>
```

with:

```jsx
<span className="constellation__metric">100K+ DOWNLOADS</span>
```

- [ ] **Step 2: Tune desktop and responsive positions**

Keep the existing selectors and adjust only their position values so Pet Care and EPOS sit above their current locations while the metric remains centered in the core area:

```css
.constellation__metric { top: 30%; }
.artifact--epos { top: 3%; left: 51%; }
.artifact--petcare { top: 8%; left: 27%; right: auto; bottom: auto; }
```

Preserve the existing mobile and short-viewport overrides unless rendered inspection shows overlap.

### Task 3: Verify the rendered result

**Files:**
- Verify: `src/modules/home/presentation/hero/HeroVisual.jsx`
- Verify: `src/modules/home/presentation/hero/hero.css`

- [ ] **Step 1: Run the regression check after implementation**

Run: `python tests/hero-constellation-placement.py`

Expected: PASS.

- [ ] **Step 2: Run the project build**

Run: `npm run build`

Expected: successful Vite/Astro production build with no new errors.

- [ ] **Step 3: Inspect desktop and mobile screenshots**

Confirm the metric reads exactly `100K+ DOWNLOADS`, Pet Care and EPOS are raised, the metric does not collide with the HX313 core, and mobile remains readable.
