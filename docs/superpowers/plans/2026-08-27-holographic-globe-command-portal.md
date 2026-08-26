# HX313 Holographic Globe Command Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Page 1 Command Portal featuring the left-side typographic hook and tactical CTA, the central 3D Holographic Particle Globe with playing Aero & Dash mascots, and the right-side System Overview telemetry panel.

**Architecture:** Maintain the React/Vite/Astro island structure. Isolate the 3D particle globe canvas into a dedicated component, the vector mascot crew (Aero & Dash) with their autonomous mischief engine into a clean overlay, and the System Overview metrics into a dedicated telemetry card. Connect the primary CTA directly to the `#work` command center.

**Tech Stack:** React 18, JSX, HTML5 Canvas, modern CSS, Anime.js, inline SVG, Vite.

---

## Global Constraints

- Preserve React 18 / JSX / Vite and do not introduce unapproved third-party dependencies.
- Left-side copy must match exact portfolio hook: *"Hafiz Ali Abdullah · Full-Stack Software Engineer"*, *"A mindset Beyond ordinary."*, *"I turn ambitious ideas into production-ready software, apps, and SaaS platforms that move businesses forward."*
- CTA must match Image 1: `SYSTEM ACCESS • ONLINE`, `[ ENTER COMMAND CENTER >> ]`, `EXPLORE WORK >>`.
- Mascot design must match Image 2: Aero (Halo ring, ear pods, spherical body, glowing LED face) & Dash (Antennae, wing thrusters, articulated arms, glowing LED visor).
- Right side must display `SYSTEM OVERVIEW •` telemetry panel only.
- 60fps canvas performance and strict `prefers-reduced-motion` compliance.

---

## Task Breakdown

### Task 1: Left Hook & Tactical CTA Component
**Files:**
- Modify: `src/modules/home/presentation/hero/HeroContent.jsx`
- Modify: `src/modules/home/presentation/hero/hero.css`
- Test: `tests/hero-content.test.mjs`

- [ ] **Step 1:** Write unit test for `HeroContent` checking for kicker, headline, pitch, and Image 1 CTA buttons.
- [ ] **Step 2:** Update `HeroContent.jsx` with the exact hook, `SYSTEM ACCESS • ONLINE` indicator, `[ ENTER COMMAND CENTER >> ]`, and `EXPLORE WORK >>` links.
- [ ] **Step 3:** Add CSS for glowing emerald laser button, pulsing online status dot, and responsive spacing.
- [ ] **Step 4:** Run test to verify passes.
- [ ] **Step 5:** Commit changes.

---

### Task 2: 3D Holographic Particle Globe Component
**Files:**
- Create: `src/modules/home/presentation/hero/HolographicGlobe.jsx`
- Modify: `src/modules/home/presentation/hero/hero.css`
- Test: `tests/holographic-globe.test.mjs`

- [ ] **Step 1:** Create `HolographicGlobe.jsx` with HTML5 canvas point-cloud Fibonacci sphere algorithm, latitude/longitude orbital rings, and mouse drag/inertia rotation.
- [ ] **Step 2:** Add `prefers-reduced-motion` detection to pause auto-rotation when user prefers reduced motion.
- [ ] **Step 3:** Add responsive resize observer to adapt canvas dimensions seamlessly.
- [ ] **Step 4:** Write unit test verifying canvas lifecycle and mount/unmount safety.
- [ ] **Step 5:** Commit changes.

---

### Task 3: Official Mascot Crew (Aero & Dash) & Mischief Engine
**Files:**
- Create: `src/modules/home/presentation/hero/MascotCrew.jsx`
- Modify: `src/modules/home/presentation/hero/hero.css`
- Test: `tests/mascot-crew.test.mjs`

- [ ] **Step 1:** Create `MascotCrew.jsx` implementing the official vector models from the Image 2 character sheet (Aero with Halo ring, ear pods, LED face, thruster leaves; Dash with signal antennae, wing thrusters, articulated arms).
- [ ] **Step 2:** Implement autonomous mischief loop: Dash pecks Aero $\rightarrow$ Aero gets startled with `(>_<)` / `(o_O)` $\rightarrow$ Dash does a 360 loop-de-loop.
- [ ] **Step 3:** Add click-to-provoke handlers with custom character taglines and comic emote bubbles.
- [ ] **Step 4:** Write unit tests for mascot rendering and click provocation handlers.
- [ ] **Step 5:** Commit changes.

---

### Task 4: Right System Overview Telemetry Card
**Files:**
- Create: `src/modules/home/presentation/hero/SystemOverviewCard.jsx`
- Modify: `src/modules/home/presentation/hero/hero.css`
- Test: `tests/system-overview.test.mjs`

- [ ] **Step 1:** Create `SystemOverviewCard.jsx` displaying the exact telemetry items: Active Nodes (`08`), Systems (`14`), Deployments (`12`), Integrations (`26`), Uptime (`99.98%`), Response Time (`42ms`), and cluster status.
- [ ] **Step 2:** Style as semi-transparent dark obsidian panel (`rgba(10, 15, 24, 0.75)`) with emerald monospace accents.
- [ ] **Step 3:** Write unit test verifying all telemetry fields render properly.
- [ ] **Step 4:** Commit changes.

---

### Task 5: Integration & Page 1 Assembly
**Files:**
- Modify: `src/modules/home/presentation/hero/HeroVisual.jsx`
- Modify: `src/modules/home/presentation/hero/Hero.jsx`
- Modify: `src/modules/home/presentation/HomePage.jsx`
- Modify: `src/modules/home/presentation/home.css`
- Modify: `CHANGE.md`

- [ ] **Step 1:** Assemble `HolographicGlobe`, `MascotCrew`, and `SystemOverviewCard` inside `HeroVisual.jsx` and `Hero.jsx`.
- [ ] **Step 2:** Update `HomePage.jsx` layout and navigation anchors so `#command-center` and `#work` smoothly transition to the deep Command Center and WOS System Core.
- [ ] **Step 3:** Run `npm run build` and all automated tests to verify zero regressions.
- [ ] **Step 4:** Log all project changes in `CHANGE.md` per project protocol.
- [ ] **Step 5:** Final git commit.
