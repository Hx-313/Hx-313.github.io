# Sticky Navigation and Signal Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the top navigation on-screen without horizontal overflow and replace the oversized dashboard mockup with a distinctive selected-work signal board.

**Architecture:** Constrain the header with a three-column grid so brand, nav, and actions each have a defined region. Make the header sticky within the page with a solid theme-aware surface. Replace the current `HeroVisual` markup with an upright signal board containing one featured project, metadata, and a compact flow diagram; style it with the existing tokens and compositor-friendly motion.

**Tech Stack:** React, CSS custom properties, animejs, Vite/Astro, Playwright browser verification.

## Global Constraints

- The header must not create horizontal document overflow.
- The header remains visible while scrolling on desktop and mobile.
- The desktop nav stays centered between the brand and action controls.
- The right-side hero visual must read as selected work evidence, not a generic dashboard.
- Preserve light/dark themes, keyboard focus, and reduced-motion behavior.
- Do not alter unrelated existing working-tree edits.

### Task 1: Add a failing browser layout check

**Files:**
- Create: `tests/sticky-nav-signal-board.py`

- [x] **Step 1: Write the failing test**

Assert that the header is sticky, the document scroll width equals the viewport width, and the new signal-board selectors exist.

- [x] **Step 2: Run the test and observe the expected failure**

Run it against the local dev server. It should fail because the current header is not sticky and the signal board does not exist.

### Task 2: Repair the header layout

**Files:**
- Modify: `src/modules/home/presentation/home.css`

- [x] **Step 1: Use a constrained three-column header**

Set `.site-header` to `grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr)`, keep the brand left, center `.site-nav`, and right-align `.header-actions`.

- [x] **Step 2: Make the header sticky and theme-aware**

Use `position: sticky; top: 0;`, a theme-aware solid/tinted background, a bottom border, and a semantic z-index. Keep the header compact and prevent action controls from shrinking.

- [x] **Step 3: Add responsive overflow protection**

Reduce nav gaps at narrower desktop widths, allow the nav to hide before it causes overflow, and keep mobile controls inside the viewport.

### Task 3: Build the selected-work signal board

**Files:**
- Modify: `src/modules/home/presentation/hero/HeroVisual.jsx`
- Modify: `src/modules/home/presentation/hero/hero.css`

- [x] **Step 1: Replace the dashboard mockup markup**

Create a `signal-board` with a top label, selected project title, project metadata, a three-stage flow (`Shape`, `Build`, `Ship`), a small active pulse indicator, and a vertical index marker.

- [x] **Step 2: Style the board as an upright editorial composition**

Use a controlled tilt or layered offset only on the board container, no oversized card shadow, no gradient text, and no nested card grid. Keep the main project title readable at all widths.

- [x] **Step 3: Add responsive and reduced-motion states**

Stack the board below the hero copy on mobile, reduce decorative offsets, and disable ambient motion under `prefers-reduced-motion: reduce`.

### Task 4: Verify

**Files:**
- Modify: `tests/sticky-nav-signal-board.py` only if selectors need correction.

- [x] **Step 1: Run the browser check**

Confirm no horizontal overflow, sticky header behavior, and signal-board presence.

- [x] **Step 2: Run the production build**

Run `npm run build` and confirm it succeeds.

- [x] **Step 3: Inspect desktop and mobile screenshots**

Check the hero at desktop and mobile widths, both themes, and while scrolled. Confirm the nav remains visible and the right-side composition does not clip or overlap the copy.
