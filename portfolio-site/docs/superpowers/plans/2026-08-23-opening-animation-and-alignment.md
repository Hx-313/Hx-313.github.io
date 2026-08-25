# Opening Animation and Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each opening statement animate visibly and center the loader and footer content.

**Architecture:** The opening experience remains state-driven. The statement wrapper is keyed by the active statement index so React replaces the element after its exit transition and removes stale inline animation styles. Layout-only CSS centers the loader's contents and the footer at all breakpoints.

**Tech Stack:** React 18, Anime.js, CSS, Vite.

## Global Constraints

- Preserve existing copy, intro timings, and reduced-motion behavior.
- Modify only `OpeningExperience.jsx` and the relevant opening/home CSS files.
- Verify with a production build and responsive browser inspection.

---

### Task 1: Reset the statement wrapper between lines

**Files:**
- Modify: `src/modules/home/presentation/opening/OpeningExperience.jsx:143`
- Test: browser opening sequence

**Interfaces:**
- Consumes: `statementIndex` state already maintained by `OpeningExperience`.
- Produces: a fresh `.opening-statement` DOM node for every active statement.

- [ ] **Step 1: Verify the current failure**

Run the Vite application and observe the opening sequence. Expected: statement one types and exits, while statements two and three are not visible because the statement wrapper retains its exit animation styles.

- [ ] **Step 2: Apply the minimal DOM lifecycle fix**

```jsx
<div key={statementIndex} ref={statementRef} className="opening-statement" data-rendering={!isHolding}>
```

- [ ] **Step 3: Verify the opening sequence**

Observe the intro again. Expected: all three statements type in character-by-character, hold, exit, then reveal the hero.

### Task 2: Center loader and footer content

**Files:**
- Modify: `src/modules/home/presentation/opening/opening.css:90-101`
- Modify: `src/modules/home/presentation/home.css:74-83,119`
- Test: desktop and mobile layout inspection

**Interfaces:**
- Consumes: existing `.opening-loader` and `.site-footer` elements.
- Produces: centered loader contents and a centered footer label group.

- [ ] **Step 1: Update layout declarations**

```css
.opening-loader { justify-content: center; }
.site-footer { flex-direction: column; justify-content: center; gap: 0.4rem; text-align: center; }
```

- [ ] **Step 2: Build and inspect both widths**

Run `npm run build`, then inspect at desktop and mobile widths. Expected: the build succeeds, loader track/percentage stay centered, and both footer labels are centered.
