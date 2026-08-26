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






