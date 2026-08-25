# React Hero Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the pure React/Vite runtime and build the first responsive hero section around the approved “A Mindset Beyond Ordinary” glitch-to-clean sequence.

**Architecture:** The active runtime will be Vite + React. The hero belongs to `modules/home/presentation` and is split into intro animation, content, and visual components; animation details stay inside the module and shared theme tokens remain framework-agnostic. Existing Astro files remain untouched as reference material.

**Tech Stack:** React 18, Vite, Anime.js 4, Motion 13, CSS custom properties.

## Global Constraints

- Use the approved palette: `#003B2F`, `#069668`, `#84F29B`, `#15181A`, `#F8F9FA`.
- Keep the application module-based with `presentation` owning UI and animation orchestration.
- Preserve the existing Astro files and assets during this first milestone.
- Glitch animation runs once, then settles into a readable static state.
- Respect `prefers-reduced-motion` by skipping the intro animation.
- Avoid horizontal overflow on mobile.

---

### Task 1: Switch the active runtime to React/Vite

**Files:**
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/app/App.jsx`
- Modify: `package.json`

- [ ] **Step 1: Add Vite scripts and dependencies**

Set `dev` to `vite`, `build` to `vite build`, and `preview` to `vite preview`. Add Vite and the React plugin as development dependencies.

- [ ] **Step 2: Add the Vite entrypoint**

`src/main.jsx` mounts `<App />` into `#root`; `src/app/App.jsx` renders the home module.

- [ ] **Step 3: Verify the runtime**

Run `npm run build` from `D:\kaggle\portfolio-site`. Expected: Vite produces `dist/` without processing Astro pages.

### Task 2: Add module-owned theme and home presentation

**Files:**
- Create: `src/shared/theme/tokens.css`
- Create: `src/shared/theme/global.css`
- Create: `src/modules/home/presentation/HomePage.jsx`
- Create: `src/modules/home/presentation/home.css`
- Modify: `src/app/App.jsx`

- [ ] **Step 1: Define semantic color and layout tokens**

Expose the five approved colors through CSS custom properties and add responsive typography, spacing, focus, and surface tokens.

- [ ] **Step 2: Build the home page shell**

Render a header, hero region, and footer with semantic landmarks and keyboard-visible focus states.

- [ ] **Step 3: Verify responsive layout**

Run the production build and inspect the page at desktop and narrow mobile widths. Expected: no horizontal scrollbar and readable text at both widths.

### Task 3: Build the glitch-to-clean hero sequence

**Files:**
- Create: `src/modules/home/presentation/hero/Hero.jsx`
- Create: `src/modules/home/presentation/hero/GlitchIntro.jsx`
- Create: `src/modules/home/presentation/hero/HeroContent.jsx`
- Create: `src/modules/home/presentation/hero/HeroVisual.jsx`
- Create: `src/modules/home/presentation/hero/hero.css`
- Modify: `src/modules/home/presentation/HomePage.jsx`

- [ ] **Step 1: Render the approved copy**

Use the sequence “Ideas need structure.”, “Products need momentum.”, “Momentum needs conviction.”, then “A MINDSET BEYOND ORDINARY.” with `BEYOND` as the dominant landing word.

- [ ] **Step 2: Add one-time animation orchestration**

Use Anime.js for the short glitch timeline and Motion for the clean hero entrance. Guard browser-only behavior, cancel active animation on cleanup, and skip the intro when reduced motion is requested.

- [ ] **Step 3: Add desktop and mobile visual treatment**

Use a layered, CSS-built product frame as the first visual placeholder. Keep the composition calm after the intro and collapse it below the copy on mobile.

- [ ] **Step 4: Verify behavior**

Run `npm run build`, then `npm run dev`. Confirm the intro completes once, `BEYOND` remains readable, CTAs are keyboard reachable, and reduced motion renders the clean state immediately.

---
