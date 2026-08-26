# Cinematic Hero Cut-Through Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the opening statements and portfolio hero read as one continuous cinematic sequence with a 260ms cut-through and no blank intermediate frame.

**Architecture:** Keep `OpeningExperience` mounted above the already-rendered home experience. Introduce an explicit reveal phase that starts the home layer during the final opening movement, then remove the opening layer after the short cut-through completes. Use CSS transforms and opacity for motion, with low-contrast atmospheric pseudo-elements in the opening and hero styles.

**Tech Stack:** Astro + React, animejs, CSS custom properties, Playwright browser verification, npm/Vite production build.

## Global Constraints

- Cut-through target is 260ms and must not exceed 320ms.
- Final statement gets a 100–150ms breathing pause before cut-through.
- Hero reveal begins during the final 100–150ms of the cut-through.
- Do not create a black or blank intermediate frame.
- Prefer `transform` and `opacity`; do not animate layout properties.
- Preserve reduced-motion behavior and usable skip behavior.
- Keep the existing green/dark visual language and light/dark theme support.

### Task 1: Add a failing browser regression check

**Files:**
- Create: `tests/cinematic-hero-cut-through.py`

**Interfaces:**
- Consumes: the local Vite dev server at `http://127.0.0.1:4321`.
- Produces: a repeatable check for the opening state, hero overlap, and transition duration.

- [x] **Step 1: Write the failing test**

Create a Playwright script that loads the home page, waits for the opening to reach the reveal state, and asserts the new contract: the home layer is revealed while the opening remains mounted, the opening transition duration is at most 320ms, and the opening is dismissed shortly afterward.

- [x] **Step 2: Run the test to verify it fails**

Run:

```powershell
python tests/cinematic-hero-cut-through.py
```

Expected: FAIL because the current implementation exposes no overlap state and still uses the 900ms/950ms handoff.

### Task 2: Coordinate the overlapping React states

**Files:**
- Modify: `src/modules/home/presentation/HomePage.jsx`
- Modify: `src/modules/home/presentation/opening/OpeningExperience.jsx`

**Interfaces:**
- `OpeningExperience` continues to consume `isRevealing`, `onComplete`, and `theme`.
- `HomePage` keeps `isRevealed` as the signal that starts the underlying hero reveal.
- Opening completion must remain idempotent through `hasCompletedRef`.

- [x] **Step 1: Start the home reveal at cut-through start**

Keep the opening mounted when `onComplete` fires, but shorten dismissal to the 260ms cut-through window. Remove the long 950ms wait so the home experience is revealed underneath during the opening exit.

- [x] **Step 2: Tighten the final statement timing**

Use a 120ms final breathing pause, then animate the opening light field and statement with a 260ms transform/opacity transition. Invoke `onComplete` at cut-through start so the hero reveal overlaps the final opening movement.

- [x] **Step 3: Preserve reduced-motion and skip behavior**

Keep reduced motion immediate and keep skip idempotent. Ensure timers and anime instances are cleaned up on unmount or state changes.

### Task 3: Implement the cinematic atmosphere and motion styling

**Files:**
- Modify: `src/modules/home/presentation/opening/opening.css`
- Modify: `src/modules/home/presentation/hero/hero.css`
- Modify: `src/modules/home/presentation/home.css`

**Interfaces:**
- Uses existing theme tokens from `src/shared/theme/tokens.css`.
- Exposes state classes consumed by React: `.opening--transitioning`, `.site-experience.is-revealed`, and the existing hero entry selectors.

- [x] **Step 1: Replace blackout behavior**

Change `.opening--blackout` from an opaque black state to a short converging light-field state. Animate the opening center and atmospheric layers with `transform`, `opacity`, and subtle blur only.

- [x] **Step 2: Add restrained atmosphere**

Use pseudo-elements for a soft emerald glow, vignette, and fine scan texture. Keep opacity low enough that the statement and hero typography remain the visual focus.

- [x] **Step 3: Align the hero reveal**

Reduce the home layer reveal to a short upward drift that begins immediately when `isRevealed` changes. Add small, staged hero content motion without delaying interaction. Add explicit reduced-motion overrides.

### Task 4: Verify and refine

**Files:**
- Modify: `tests/cinematic-hero-cut-through.py` only if selectors or timing assertions need correction.

- [x] **Step 1: Run the browser regression check**

Run:

```powershell
python tests/cinematic-hero-cut-through.py
```

Expected: PASS with no blank/black intermediate state and a computed opening transition duration at or below 320ms.

- [x] **Step 2: Build the production site**

Run:

```powershell
npm run build
```

Expected: Vite/Astro build succeeds with no compile errors.

- [x] **Step 3: Check reduced motion and responsive surfaces**

Use Playwright with reduced motion enabled and mobile viewport dimensions to confirm the hero is immediately readable, the skip control remains usable, and no horizontal overflow is introduced.

- [x] **Step 4: Review the diff**

Run:

```powershell
git status --short
git diff -- src/modules/home/presentation/HomePage.jsx src/modules/home/presentation/opening/OpeningExperience.jsx src/modules/home/presentation/opening/opening.css src/modules/home/presentation/hero/hero.css src/modules/home/presentation/home.css
```

Confirm unrelated working-tree changes are untouched.
