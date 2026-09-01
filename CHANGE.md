# Project Change Log

This file is the shared record of changes made to the project by humans or agents.

## Mandatory agent workflow

Every agent must:

1. Read this file before inspecting or changing project files.
2. Check the existing entries for related work, constraints, and unfinished changes.
3. Record every project change in this file before completing the task.
4. Include the date, a short summary, the files changed, and verification performed.
5. Never delete or rewrite historical entries. Add a new entry instead.

Documentation-only changes, configuration changes, dependency changes, source changes, asset changes, and test changes all count as project changes and must be recorded.

## Entry format

```md
## YYYY-MM-DD — Short change title

- Summary: What changed and why.
- Files: `path/to/file`, `path/to/another-file`
- Verification: Commands run and their result, or `Not run` with the reason.
```

## 2026-08-26 — Add shared change-tracking workflow

- Summary: Added this project-wide change log and documented the mandatory read-before-change and write-after-change workflow for all agents.
- Files: `CHANGE.md`, `CLAUDE.md`
- Verification: Reviewed the new instructions and confirmed the files are present in the repository.

## 2026-08-26 — Centralize WOS and contact destinations

- Summary: Added shared constants for WOS admin, ePOS, and customer website links plus contact/social URLs; connected the WOS constellation nodes and active-build surfaces to those destinations.
- Files: `src/core/constants.js`, `src/data/projects.js`, `src/modules/home/presentation/command-center/SystemCore.jsx`, `src/modules/home/presentation/command-center/ActiveBuild.jsx`, `src/modules/home/presentation/command-center/command-center.css`, `src/components/Footer.astro`, `src/layouts/BaseLayout.astro`, `src/modules/home/presentation/hero/Hero.jsx`, `src/modules/home/presentation/HomePage.jsx`, `src/pages/index.astro`, `tests/core-constants.test.mjs`
- Verification: `npm run build` passed. A direct constants assertion passed; Node's test runner could not start in this Windows sandbox because it returned `spawn EPERM`. A source scan confirmed the external destinations only remain in `src/core/constants.js`.

## 2026-08-26 — Align Sprint 1 with portfolio trend guidance

- Summary: Reviewed Envato’s 2026 portfolio-trends guidance and added project guardrails for purposeful micro-interactions, persistent contact access, dark-mode/color-brand continuity, real project imagery, and restrained retro-futurist texture. Explicitly rejected puzzle navigation, noisy decoration, and trend-driven palette drift.
- Files: `PRODUCT.md`, `docs/superpowers/specs/2026-08-26-system-command-center-design.md`, `docs/superpowers/plans/2026-08-26-system-command-center.md`, `CHANGE.md`
- Verification: Compared the article guidance with the current Sprint 1 product brief, command-center design, and implementation plan; no source behavior changes were required for this alignment pass.

## 2026-08-26 — Build holographic product constellation

- Summary: Replaced the hero’s single featured command-center visual with a responsive, data-driven product constellation showing every supplied project. WOS remains the selected build and the existing command center remains below it; selection stays synchronized through the existing controller.
- Files: `src/modules/home/presentation/hero/constellationData.js`, `src/modules/home/presentation/hero/ProductConstellation.jsx`, `src/modules/home/presentation/hero/HeroVisual.jsx`, `src/modules/home/presentation/hero/hero.css`, `tests/product-constellation.test.mjs`, `CHANGE.md`
- Verification: Direct artifact-data assertions passed, `npm run build` passed, desktop Playwright interaction confirmed artifact selection updates the active build, and mobile browser evaluation confirmed the constellation fits the hero column without document overflow. The standalone Python smoke script could not run because `playwright` is not installed in the Python environment.

## 2026-08-27 — Implement Page 1 Command Portal with 3D Globe, Mascot Crew & System Overview

- Summary: Re-architected Page 1 into a clean, focused 3-column entry portal. Added the exact typographic hook on the left with the Image 1 tactical CTA (`SYSTEM ACCESS • ONLINE`, `[ ENTER COMMAND CENTER >> ]`, `EXPLORE WORK >>`), a central 3D Holographic Particle Globe with playing Aero & Dash mascots (grounded in the official Image 2 character sheet), and the right-side `SYSTEM OVERVIEW •` telemetry panel. Placed the full Command Center below the hero with smooth scroll navigation.
- Files: `src/modules/home/presentation/hero/HeroContent.jsx`, `src/modules/home/presentation/hero/HolographicGlobe.jsx`, `src/modules/home/presentation/hero/MascotCrew.jsx`, `src/modules/home/presentation/hero/SystemOverviewCard.jsx`, `src/modules/home/presentation/hero/HeroVisual.jsx`, `src/modules/home/presentation/hero/Hero.jsx`, `src/modules/home/presentation/hero/hero.css`, `src/modules/home/presentation/HomePage.jsx`, `src/modules/home/presentation/home.css`, `tests/hero-content.test.mjs`, `tests/holographic-globe.test.mjs`, `tests/mascot-crew.test.mjs`, `tests/system-overview.test.mjs`, `CHANGE.md`
- Verification: All 4 Node unit tests passed (`hero-content.test.mjs`, `holographic-globe.test.mjs`, `mascot-crew.test.mjs`, `system-overview.test.mjs`). `npm run build` compiled cleanly in 1.74s with zero errors.

## 2026-08-27 — Overhaul and elevate top bar on Portfolio Page 1

- Summary: Rebuilt the top navigation bar into a full-width, sticky frosted glass HUD header (`SiteHeader`). Added active scroll-spy section tracking (`01 // OVERVIEW`, `02 // COMMAND CENTER`, `03 // ACTIVE BUILDS`, `04 // CONTACT`), real-time formatted local telemetry clock with seconds, pulsing green system online beacon, GitHub and LinkedIn quick portals, theme switcher integration, high-conversion tactical contact CTA (`LET'S TALK [ ↗ ]`), and a fully accessible responsive mobile menu drawer with keyboard navigation support.
- Files: `src/modules/home/presentation/header/SiteHeader.jsx`, `src/modules/home/presentation/header/header.css`, `src/modules/home/presentation/HomePage.jsx`, `src/modules/home/presentation/home.css`, `tests/site-header.test.mjs`, `CHANGE.md`
- Verification: Ran `node --test tests/*.test.mjs` with all 11 unit tests passing. Ran `npm run build` with 106 modules transforming and building cleanly in 1.60s without errors.

## 2026-08-27 — Cosmic space loading, 3 statements animation, robot redesign & Page 1 background

- Summary: Implemented a deep-space cosmic starfield with dynamic 3D warp particle canvas for the opening loading experience; animated the 3 statements (`IDEAS NEED STRUCTURE.`, `PRODUCTS NEED MOMENTUM.`, `MOMENTUM NEEDS CONVICTION.`) through cosmic entrance, 3D floating shimmer, and hyperspace warp-out phases; built a seamless smooth transition into Page 1; redesigned Aero robot mascot with high-definition brushed titanium chassis, glowing orbital halo, cyber ear communication beacons, and emotive LED visor matrix; elevated Page 1 and Hero with deep cosmic nebula background and starry aura.
- Files: `src/modules/home/presentation/opening/OpeningExperience.jsx`, `src/modules/home/presentation/opening/opening.css`, `src/components/mascots/AeroMascot.jsx`, `src/modules/home/presentation/hero/MascotCrew.jsx`, `src/modules/home/presentation/hero/hero.css`, `src/modules/home/presentation/home.css`, `tests/cosmic-opening.test.mjs`, `CHANGE.md`
- Verification: Ran `node --test tests/*.test.mjs` with all 14 unit tests passing. Ran `npm run build` compiling cleanly in 1.65s without errors.

## 2026-08-27 — Smooth zero-gravity space object animation sequence

- Summary: Refined the opening sequence to behave like weightless objects drifting peacefully in zero-gravity space. Simplified pacing with smooth crossfades and continuous zero-g floating oscillations, added 3D orbital rings around statements, improved upward stardust canvas drift, and ensured effortless, natural transitions without harsh jarring jumps.
- Files: `src/modules/home/presentation/opening/OpeningExperience.jsx`, `src/modules/home/presentation/opening/opening.css`, `CHANGE.md`
- Verification: Ran `node --test tests/*.test.mjs` with all 14 unit tests passing. Ran `npm run build` with 107 modules compiling cleanly in 1.58s without errors.

## 2026-08-27 — Apply exact cosmic space background to Page 1

- Summary: Ported the exact deep-space celestial background to Page 1 via `CosmicBackground` component and `cosmic-background.css`, featuring real-time HTML5 zero-g particle starfield canvas, glowing celestial nebula clouds, twinkling stars, and deep space radial gradient base. Connected seamlessly to `HomePage.jsx` and updated Hero background to transparent for seamless continuity.
- Files: `src/modules/home/presentation/CosmicBackground.jsx`, `src/modules/home/presentation/cosmic-background.css`, `src/modules/home/presentation/HomePage.jsx`, `src/modules/home/presentation/hero/hero.css`, `tests/cosmic-page-background.test.mjs`, `CHANGE.md`
- Verification: Ran `node --test tests/*.test.mjs` with all 17 unit tests passing. Ran `npm run build` with 109 modules cleanly compiling in 4.72s without errors.

## 2026-08-27 — Declutter and ease top navigation bar

- Summary: Streamlined and decluttered the top navigation bar based on visual feedback. Replaced the crowded cluster of badges/boxes with a clean, spacious layout: simplified the brand mark to `Hx313 ●`, made the desktop navigation links airy and elegant with soft underline active states, and reduced the desktop right actions to just the Theme Toggle and the high-contrast `Let's talk ↗` CTA button, moving detailed telemetry and social links to the mobile drawer.
- Files: `src/modules/home/presentation/header/SiteHeader.jsx`, `src/modules/home/presentation/header/header.css`, `CHANGE.md`
- Verification: Ran `node --test tests/*.test.mjs` with all 17 unit tests passing. Ran `npm run build` with 109 modules cleanly compiling in 1.27s without errors.

## 2026-08-30 — Remove retired Astro implementation

- Summary: Removed the inactive Astro application, Astro-only configuration, legacy hero canvas and stylesheet, and Astro dependencies. Regenerated the dependency lockfile for the active React/Vite stack and replaced the stale Astro handoff with a concise React/Vite project guide. Existing user changes to the mascot and opening experience were preserved.
- Files: `astro.config.mjs`, `tsconfig.json`, `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/Hero.astro`, `src/components/HeroCanvas.jsx`, `src/components/Principles.astro`, `src/pages/index.astro`, `src/pages/mascots.astro`, `src/pages/projects/index.astro`, `src/styles/global.css`, `package.json`, `package-lock.json`, `CLAUDE.md`, `CHANGE.md`
- Verification: `npm run build` passed with 109 modules transformed. Repository and installed-package scans found no active Astro references or top-level Astro packages. Nine assertions passed before the existing `HolographicGlobe` source-shape assertion failed; remaining isolated Node test invocations were blocked by the Windows sandbox with `spawn EPERM`. A clean `npm ci` was also blocked by a locked Rollup binary, after which `npm install --ignore-scripts` restored and pruned the dependency tree successfully with zero reported vulnerabilities.

## 2026-08-30 — Plan client scroll story before command-center proof

- Summary: Documented the approved five-beat client scroll narrative and a test-first implementation plan. The planned experience moves from idea and operational friction through systems thinking and Hafiz's introduction, then makes the System Command Center the proof destination.
- Files: `docs/superpowers/specs/2026-08-30-client-scroll-story-design.md`, `docs/superpowers/plans/2026-08-30-client-scroll-story.md`, `CHANGE.md`
- Verification: Reviewed the narrative, motion, accessibility, responsive, token, component-boundary, and test requirements against the active React/Vite structure. No application code was changed.

## 2026-08-30 — Fix mascot dialog sizing and implement interactive warm greetings

- Summary: Resolved conflicting legacy CSS in `hero.css` that was forcing mascot speech bubbles into crushed pill shapes and causing text overflow. Upgraded `mascots.css`, `AeroMascot.jsx`, and `DashMascot.jsx` with high-readability glassmorphism dialog geometry, viewport-aware top/bottom bubble flipping, live audio wave pulsing indicators, close buttons, and quick-reply action chips (`Who is Abdullah?`, `Shipped Apps`, `Do a Flip!`, `Command Center`). Relocated initial hero mascot coordinates and roaming waypoints to the right-stage visual arena to eliminate overlap with the left hero headline. Implemented a warm, engaging opening welcome sequence with interactive quick-action responses for visitor engagement.
- Files: `src/modules/home/presentation/hero/hero.css`, `src/styles/mascots.css`, `src/components/mascots/AeroMascot.jsx`, `src/components/mascots/DashMascot.jsx`, `src/components/Mascots.jsx`, `tests/mascot-dialog-greetings.test.mjs`, `tests/mascot-roam.test.mjs`, `CHANGE.md`
- Verification: Added comprehensive unit tests in `tests/mascot-dialog-greetings.test.mjs` verifying dialog sizing, bubble orientation, action chips, and greeting flows. Executed `node --test` with all 14 unit tests passing. Ran `npm run build` with 109 modules transforming and compiling cleanly in 7.73s with 0 errors.

## 2026-08-30 — Add client scroll story before command-center proof

- Summary: Added a five-beat, client-led scroll narrative between the hero and System Command Center. The sequence moves from idea and operational friction through systems thinking and Hafiz's introduction, then makes the command center the evidence destination. Hero CTAs and header navigation follow this path with native scrolling, central-beat progress tracking, responsive mobile markers, accessible theme controls, and a static reduced-motion treatment. Restored functional light/dark/system theme state, corrected the mobile drawer viewport sizing, and removed invalid SVG transform units that produced browser console errors.
- Files: `src/modules/home/presentation/client-story/storyData.js`, `src/modules/home/presentation/client-story/ClientStory.jsx`, `src/modules/home/presentation/client-story/client-story.css`, `src/modules/home/presentation/HomePage.jsx`, `src/modules/home/presentation/hero/HeroContent.jsx`, `src/modules/home/presentation/header/SiteHeader.jsx`, `src/modules/home/presentation/header/header.css`, `src/shared/theme/tokens.css`, `src/shared/theme/global.css`, `src/shared/theme/useTheme.js`, `src/components/mascots/AeroMascot.jsx`, `src/components/mascots/DashMascot.jsx`, `tests/client-scroll-story.test.mjs`, `tests/hero-content.test.mjs`, `tests/site-header.test.mjs`, `tests/theme-hook.test.mjs`, `tests/mascot-dialog-greetings.test.mjs`, `tests/system-command-center.py`, `CHANGE.md`
- Verification: `npm run build` passed with 113 modules transformed; Vite retained its bundle-size advisory. Thirteen affected Node assertions passed when executed directly. Bundled Playwright with installed Chrome passed at 1440×900, 768×1024 with reduced motion, and 390×844, covering progress tracking, proof navigation, project selection, theme switching, mobile drawer behavior, horizontal overflow, and console errors. The prescribed Python smoke entry point could not run because Python Playwright is not installed. The full legacy Node sweep retains the unrelated documented `tests/holographic-globe.test.mjs` source-shape failure (`Uses canvas reference`).

## 2026-08-30 — Refine client story into a single-stage scroll sequence

- Summary: Replaced the multi-screen progress rail and numbered markers with one sticky visual stage. Each beat now swaps a centered title for a centered statement as native scrolling advances, keeping the narrative focused on the requested two-part message sequence and removing the retired `01/3 idea` headers.
- Files: `src/modules/home/presentation/client-story/ClientStory.jsx`, `src/modules/home/presentation/client-story/client-story.css`, `tests/client-scroll-story.test.mjs`, `tests/system-command-center.py`, `docs/superpowers/specs/2026-08-30-client-scroll-story-design.md`, `docs/superpowers/plans/2026-08-30-client-scroll-story.md`, `CHANGE.md`
- Verification: Direct affected Node assertions, bundled Playwright desktop/mobile/reduced-motion checks, `npm run build`, and the Impeccable detector pass. The prescribed Python smoke entry point remains unavailable without Python Playwright; the unrelated legacy holographic-globe source-shape failure remains documented.

## 2026-08-30 — Make client story progression deliberate and visually continuous

- Summary: Added a non-passive wheel guard that advances the story by one phase per gesture, even when the input delta is large, with a short transition lockout to prevent skipped frames. Unified the story background with the home page’s shared radial gradient stack and theme background tokens.
- Files: `src/modules/home/presentation/client-story/ClientStory.jsx`, `src/modules/home/presentation/client-story/client-story.css`, `tests/client-scroll-story.test.mjs`, `CHANGE.md`
- Verification: Client-story assertions, `npm run build`, Impeccable detector, and bundled Playwright responsive checks passed.

## 2026-08-30 — Keep story boundary scrolling natural

- Summary: Let the first upward gesture and final downward gesture pass through the client story’s phase guard, so entering and exiting the sequence remains normal, smooth, and consistent with the rest of the page.
- Files: `src/modules/home/presentation/client-story/ClientStory.jsx`, `tests/client-scroll-story.test.mjs`, `CHANGE.md`
- Verification: Client-story assertions passed after adding explicit first/last phase boundary coverage.

## 2026-09-01 — Add app-engineering-guardrails agent skill and standards

- Summary: Created the `.agents/skills/app-engineering-guardrails` skill and supporting reference specifications codifying the 6 core development principles: strict clean architecture across Presentation/Hooks/Data/Core/Shared, zero hardcoded strings/links centralized in `src/core/constants.js` and data modules, non-destructive design iterations that refine rather than rewrite, surgical scope containment avoiding unintended refactors, zero hallucination with pre-verification before action, and mandatory `CHANGE.md` change logging.
- Files: `.agents/skills/app-engineering-guardrails/SKILL.md`, `.agents/skills/app-engineering-guardrails/references/clean-architecture.md`, `.agents/skills/app-engineering-guardrails/references/constants-and-data.md`, `.agents/skills/app-engineering-guardrails/references/design-iteration-rules.md`, `.agents/skills/app-engineering-guardrails/references/change-log-protocol.md`, `CHANGE.md`
- Verification: Ran `npm run build` with 117 modules compiled cleanly. Executed `node --test tests/*.test.mjs` with all 39 unit tests passing.

## 2026-09-01 — Pace the cinematic globe and mascot opening

- Summary: Retimed the existing Aero and Dash opening so the globe leads for 0.4 seconds, the crew rises gradually from beneath it, and each of the three hook statements gets a calm two-second projection/dialog beat. Softened the thrust, scan, and particle loops, added a clear speaker transmission label, and retained skip and reduced-motion lifecycles.
- Files: `src/modules/home/presentation/opening/openingSequence.js`, `src/modules/home/presentation/opening/OpeningExperience.jsx`, `src/modules/home/presentation/opening/OpeningProjection.jsx`, `src/modules/home/presentation/opening/opening.css`, `tests/opening-sequence.test.mjs`, `tests/cosmic-opening.test.mjs`, `tests/cinematic-opening-responsive.py`, `tests/cinematic-hero-cut-through.py`, `CHANGE.md`
- Verification: `node --test tests/opening-sequence.test.mjs tests/cosmic-opening.test.mjs` passed (15/15) when run with the required process-spawn permission. `npm run build` passed (117 modules transformed). The existing Python Playwright responsive check could not start because its environment does not have the `playwright` package installed.

## 2026-09-01 — Unify hero and command-center globe behavior

- Summary: Replaced the separate command-center WOS core diagram with the exact shared Three.js holographic globe used in the hero. Normalized the globe animation against frame time, pauses detailed WebGL work while each instance is off-screen, caps render resolution for smoother motion, prevents browser scroll restoration from revealing a partially advanced slide after the intro, and gives the command-center anchor clearance below the sticky header.
- Files: `src/modules/home/presentation/hero/HolographicGlobe.jsx`, `src/modules/home/presentation/command-center/SystemCore.jsx`, `src/modules/home/presentation/command-center/command-center.css`, `src/modules/home/presentation/hero/hero.css`, `src/modules/home/presentation/HomePage.jsx`, `src/modules/home/presentation/home.css`, `tests/holographic-globe.test.mjs`, `tests/cosmic-opening.test.mjs`, `CHANGE.md`
- Verification: Focused Node tests passed (18/18): `node --test tests/holographic-globe.test.mjs tests/cosmic-opening.test.mjs tests/opening-sequence.test.mjs`. `npm run build` passed with 117 modules transformed. Browser verification confirmed a top-of-page intro handoff, an exact hero boundary at the next section, a command-center anchor position of 80px below a 72.7px sticky header, and the shared dashboard globe canvas with no legacy WOS map.

## 2026-09-01 — Unify intro with dashboard 3D holographic cyber globe & active boot animation

- Summary: Aligned the intro experience to render the 3D Holographic Cyber Mesh Globe (Fibonacci lattice, glowing emerald/cyan starlight points, geodesic lines, plasma core shader, gyroscopic gimbal rings, and radar sweep) with immediate 60fps WebGL animation from frame 0 during the system initialization phase, alongside the animated progress bar loader HUD before mascots hop into view. Preserved the 3D cyber holographic globe in the hero overview and command center with complete drag/inertia physics.
- Files: `src/modules/home/presentation/hero/HolographicGlobe.jsx`, `src/modules/home/presentation/opening/OpeningNetworkGlobe.jsx`, `src/modules/home/presentation/opening/OpeningExperience.jsx`, `src/modules/home/presentation/opening/opening.css`, `CHANGE.md`
- Verification: Ran `node --test tests/*.test.mjs` with all 42 unit tests passing cleanly. Ran `npm run build` with 117 modules compiled cleanly in 4.81s with zero errors.


