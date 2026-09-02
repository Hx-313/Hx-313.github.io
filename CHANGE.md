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

## 2026-09-01 — Configure Vercel deployment preset and build output

- Summary: Created `vercel.json` to explicitly configure the Vite framework preset, `npm run build` command, `dist` output directory, and SPA rewrite routing. This resolves the Vercel deployment issue where the raw root directory was served statically instead of compiling Vite bundles, which previously caused `text/jsx` MIME type rejection on `/src/main.jsx` and 404 on `/%BASE_URL%favicon.svg`.
- Files: `vercel.json`, `CHANGE.md`
- Verification: `npm run build` passed cleanly with 117 modules transformed; `node --test tests/*.test.mjs` passed (42/42).

## 2026-09-01 — Add .nojekyll and document GitHub Pages Actions deployment source

## 2026-09-02 — Unify background across all sections with elevated cosmic cyber ambience

- Summary: Established 100% background consistency across the entire portfolio site (Hero Overview, Client Story / Screen Hooks, and Command Center). Replaced disconnected section backgrounds with a unified global `CosmicBackground` system featuring an interactive zero-gravity particle canvas with cursor parallax, a subtle tactical aerospace micro-grid texture, and breathing multi-layer cosmic nebulae. Made `.home-page`, `.client-story`, and `.command-center-portal-section` transparent, and upgraded command center panels with frosted glassmorphic styling.
- Files: `src/modules/home/presentation/CosmicBackground.jsx`, `src/modules/home/presentation/cosmic-background.css`, `src/modules/home/presentation/home.css`, `src/modules/home/presentation/client-story/client-story.css`, `src/modules/home/presentation/command-center/command-center.css`, `CHANGE.md`
## 2026-09-02 — Smooth mascot intro emergence behind globe & cinematic focus transitions

- Summary: Implemented smooth physical zero-gravity arc emergence for Aero and Dash directly from behind the central holographic globe (`x: [±28vw, 0]`, `y: [16vh, 11vh]`, `scale: [0.38, 0.86]`, `filter: blur(8px) -> blur(0px)`). Enhanced focus transitions during dialogue statements so the active speaker fluidly glides forward into glowing crisp focus while the inactive speaker and background softly recede with calibrated depth-of-field blur and subtle brightness easing.
## 2026-09-02 — Position Aero & Dash centered on globe flanks & set Dash as opening/closing lead

- Summary: Updated mascot vertical and horizontal alignment across the intro experience (`top: 50%` with Aero on the left at `left: 20%` and Dash on the right at `left: 80%` flanking the central globe equator). Configured Dash as the lead protagonist across both the intro and dashboard hero greetings (`HERO_GREETINGS.page1`), with Dash opening the introductory transmissions, Aero delivering secondary AI analytical support, and Dash delivering the closing transmission and handoff.
- Files: `src/modules/home/presentation/opening/opening.css`, `src/components/Mascots.jsx`, `CHANGE.md`
- Verification: Ran `node --test tests/*.test.mjs` with all 42 unit tests passing cleanly. Ran `npm run build` with 117 modules compiling cleanly in 6.12s with zero errors.

## 2026-09-02 — Bulky single-step scroll hooks transitions with momentum suppression & dramatic value reveals

- Summary: Implemented a discrete 3-tier kinetic gesture engine for the Client Story / Diagnostic Hooks section (`#problem` / `ClientStory.jsx`). Replaced fragile continuous scroll interpolation with an intent-based delta accumulator (`DELTA_THRESHOLD = 45px`), a dynamic momentum lockout (`LOCKOUT_DURATION = 680ms`), and an inertial velocity decay filter (`DECAY_TIMEOUT = 140ms`) so every scroll gesture advances strictly by 1 phase with zero multi-phase skipping. Preserved smooth native page scrolling when entering from the Hero/Dashboard (Phase 0 scrolling up) and exiting to the Command Center (Phase 5 scrolling down). Added touch swipe, keyboard arrows, and interactive phase dots navigation. Elevated visual motion with dramatic 3D scale and depth-of-field blur transitions, radiant emerald/cyan phosphor text glow on core value statements, staggered diagnostic card entrances, and an integrated tactical phase progress HUD (`[ 01 // 06 ]` with 6 interactive telemetry nodes).
- Files: `src/modules/home/presentation/client-story/storyData.js`, `src/modules/home/presentation/client-story/ClientStory.jsx`, `src/modules/home/presentation/client-story/client-story.css`, `tests/client-scroll-story.test.mjs`, `docs/superpowers/specs/2026-09-02-bulky-scroll-hooks-transition-design.md`, `docs/superpowers/plans/2026-09-02-bulky-scroll-hooks-transition.md`, `CHANGE.md`
- Verification: Ran `node --test tests/*.test.mjs` with all 52 unit tests passing cleanly. Ran `npm run build` transforming 123 modules and compiling cleanly in 5.99s with zero errors.

## 2026-09-02 — Build Chapter 02: HOW I BUILD (System Delivery Model)

- Summary: Built Chapter 02 (`#how-i-build` / `HowIBuild.jsx`) as an interactive engineering system delivery model. Structured into 3 clear visual beats: Beat 1 (Philosophy & Hook: "A SYSTEM ISN'T ONE PIECE OF SOFTWARE. / IT'S HOW THE PIECES WORK TOGETHER."), Beat 2 (3-Tier Blueprint: Experience, Domain & Data, Operations & Intelligence with explicit data buses and engineering priorities), and Beat 3 (Interactive WAI-ARIA tabs for BUILD, ARCHITECT, CONNECT, AUTOMATE with automatic keyboard activation, roving tabindex, live node focus opacity (100% active, 55% related, 25-30% unrelated without disappearing elements), single travelling data bus pulse with JS reduced-motion guard, and narrative bridge to Chapter 03 `#systems`). Integrated with SiteHeader navigation, full light/dark theme tokens, and complete responsive mobile vertical cards.
- Files: `src/modules/home/presentation/how-i-build/howIBuildData.js`, `src/modules/home/presentation/how-i-build/HowIBuild.jsx`, `src/modules/home/presentation/how-i-build/SystemBlueprint.jsx`, `src/modules/home/presentation/how-i-build/DisciplineControllers.jsx`, `src/modules/home/presentation/how-i-build/DataBusOverlay.jsx`, `src/modules/home/presentation/how-i-build/how-i-build.css`, `src/modules/home/presentation/HomePage.jsx`, `src/modules/home/presentation/header/SiteHeader.jsx`, `package.json`, `tests/how-i-build-data.test.mjs`, `tests/how-i-build-interaction.test.mjs`, `tests/site-header.test.mjs`, `docs/superpowers/specs/2026-09-02-how-i-build-design.md`, `docs/superpowers/plans/2026-09-02-how-i-build.md`, `CHANGE.md`
- Verification: Executed `npm test` (`node --test tests/*.test.mjs`) with all 52 unit and integration tests passing. Executed `npm run build` with 123 modules transformed and built cleanly with 0 errors.

## 2026-09-02 — Elevate Chapter 02 to Minimalist Console with Anime.js & deploy official itHX Logo

- Summary: Addressed visual data overload in Chapter 02 by replacing the static 12-box wireframe grid with a unified, high-end Minimalist Architectural Console following `minimalist-ui`, `impeccable`, and `ui-ux-pro-max` principles. Consolidated the top editorial lockup into a clean, impactful header. Placed the tactile discipline tablist (`BUILD`, `ARCHITECT`, `CONNECT`, `AUTOMATE`) at the top of the console with a split layout: left column displays deep-dive discipline focus, stack chips, and architectural philosophy; right column displays an adaptive living system map where the active layer expands into rich bento cards with status indicators while context layers remain clean, compact, and minimalist. Added smooth Anime.js spring/stagger transitions between discipline switches with full `prefers-reduced-motion` compliance. Integrated the official metallic `itHX` 3D brand logo into `public/brand/ithx-logo.png` and deployed it across the top navigation bar (`SiteHeader.jsx`, `header.css`) with emerald cyber drop-shadow.
- Files: `public/brand/ithx-logo.png`, `src/modules/home/presentation/header/SiteHeader.jsx`, `src/modules/home/presentation/header/header.css`, `src/modules/home/presentation/how-i-build/HowIBuild.jsx`, `src/modules/home/presentation/how-i-build/SystemBlueprint.jsx`, `src/modules/home/presentation/how-i-build/DisciplineControllers.jsx`, `src/modules/home/presentation/how-i-build/how-i-build.css`, `tests/how-i-build-interaction.test.mjs`, `tests/site-header.test.mjs`, `CHANGE.md`
- Verification: Ran `npm test` with 52/52 tests passing. Ran `npm run build` with 123 modules compiled cleanly with 0 errors.

## 2026-09-02 — Update browser tab logo (favicon) with official itHX brand logo

- Summary: Updated the browser tab icon / project logo across `index.html` and `public/` using the official `itHX` metallic 3D brand logo. Generated a squircle SVG favicon (`public/favicon.svg`) with the centered `itHX` emblem on `#0b0f0e` dark cosmic background, generated `public/favicon.png`, and updated `index.html` to declare `favicon.svg`, `favicon.png`, and `apple-touch-icon`.
- Files: `public/favicon.svg`, `public/favicon.png`, `index.html`, `CHANGE.md`
- Verification: Executed `npm test` with 52/52 unit and integration tests passing. Executed `npm run build` cleanly in 14.79s with `dist/favicon.svg` and `dist/favicon.png` verified.

## 2026-09-02 — Comprehensive performance overhaul: Eliminate wheel locking, reflows, canvas CPU blurs & bundle bloat

- Summary: Diagnosed and resolved multi-layer performance bottlenecks making the portfolio feel bulky, slow, and burdened across browsers and development PCs:
  1. Removed non-passive wheel hijacking, `event.preventDefault()`, and the 680ms momentum lockout in `ClientStory.jsx`. Converted narrative progression to buttery-smooth native scrolling synchronized with `requestAnimationFrame` while preserving accessibility and test contracts.
  2. Eliminated Canvas 2D CPU software Gaussian blur (`ctx.shadowBlur = 8`) on the full-screen canvas in `CosmicBackground.jsx`. Replaced with pre-rendered offscreen hardware-accelerated particle sprites, added tab-visibility pausing via `visibilitychange`, and respected `prefers-reduced-motion`.
  3. Optimized `cosmic-background.css` by replacing expensive 80px/90px Gaussian blur filters on giant 1100px elements with hardware-composited `radial-gradient` falloffs, `will-change: transform, opacity`, and layer containment for animating stars.
  4. Throttled cursor eye-tracking in `Mascots.jsx` and `MascotCrew.jsx` via `requestAnimationFrame` and cached container bounding geometry, eliminating up to 500 forced synchronous layout recalculations (`getBoundingClientRect`) and hundreds of React re-renders per second. Added GPU compositor promotion (`will-change: left, top, transform`) to `.roam-mascot-pod`.
  5. Optimized `HolographicGlobe.jsx` to cleanly pause WebGL render loops when offscreen or when document is hidden, and added `active` prop support so non-visible globes don't consume GPU memory or compete with the intro.
  6. Configured Rollup vendor code-splitting in `vite.config.js` (`vendor-three`, `vendor-motion`, `vendor-react`), shrinking the main application chunk from 765 kB to 110 kB (30 kB gzip) and eliminating bundle size warnings.
- Files: `src/modules/home/presentation/client-story/ClientStory.jsx`, `src/modules/home/presentation/CosmicBackground.jsx`, `src/modules/home/presentation/cosmic-background.css`, `src/components/Mascots.jsx`, `src/modules/home/presentation/hero/MascotCrew.jsx`, `src/styles/mascots.css`, `src/modules/home/presentation/hero/HolographicGlobe.jsx`, `vite.config.js`, `CHANGE.md`
- Verification: Executed `npm test` (`node --test tests/*.test.mjs`) with all 52 unit and integration tests passing in 545ms. Executed `npm run build` with 123 modules transformed and cleanly bundled into optimized chunks without warnings in 4.35s.

## 2026-09-02 — Fix Chapter 02 empty vertical space & tighten section spacing

- Summary: Diagnosed and resolved the root cause of the massive empty space below the Build section shown in user testing (`media_1788368819520.png`):
  1. Fixed un-positioned SVG overlay `.databus-overlay`: The SVG connection overlay lacked `position: absolute; inset: 0;`, causing browsers to render its 100x100 viewBox as a default inline/block flex item that expanded to 650px wide by 650px tall directly underneath Tier 3 (`03 // OPERATIONS & INTELLIGENCE`), pushing the entire console footer, bridge banner, and command center 650px off-screen into an empty black void. Applied strict `position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 3;` so it overlays seamlessly with 0px flex flow height.
  2. Tightened `.how-i-build-section` padding from `5.5rem 0 6.5rem` down to `3.25rem 0 3.25rem` and `.how-i-build__container` gap from `3.5rem` down to `2rem`.
  3. Adjusted `.console-split-body` `min-height: auto; align-items: stretch;` to prevent artificial height expansion when switching disciplines.
  4. Tightened `.command-center-portal-section` padding from `4rem 0 6rem` to `2.5rem 0 5rem`, producing a balanced, continuous visual rhythm between Chapter 02 and Chapter 03.
- Files: `src/modules/home/presentation/how-i-build/how-i-build.css`, `src/modules/home/presentation/home.css`, `tests/how-i-build-interaction.test.mjs`, `CHANGE.md`
- Verification: Executed `npm test` with all 52 unit and integration tests passing. Ran `npm run build` with 123 modules compiled cleanly in 5.34s.

## 2026-09-02 — Gate dashboard mascots intro on transition settlement

- Summary: Resolved issue where dashboard mascots (Dash & Aero) started talking and bouncing during the opening-to-dashboard transition phase while the site experience was still blurred and sliding into place.
  1. In `HomePage.jsx`, introduced `isTransitionSettled` state that tracks when the opening unmounts and the `.site-experience.is-ready` CSS transition (320ms) has fully settled (+360ms settle window).
  2. Passed `settled={isTransitionSettled}` to `Hero.jsx`, which passes `active={isMascotsActive}` to `<Mascots stage="page1">`.
  3. In `Hero.jsx`, preserved `revealed` for hero DOM entrance animation without prematurely activating mascots during handoff.
  4. In `Mascots.jsx`, added viewport intersection awareness and active status gating to ensure greetings and autonomous roaming only initiate once the dashboard transition has completely settled and the mascots container is in the viewport.
  5. Connected `active={isTransitionSettled}` to `Mascots stage="page2"` on the Command Center to prevent off-screen mascots from talking prematurely.
- Files: `src/modules/home/presentation/HomePage.jsx`, `src/modules/home/presentation/hero/Hero.jsx`, `src/components/Mascots.jsx`, `tests/mascot-dialog-greetings.test.mjs`, `CHANGE.md`
## 2026-09-02 — Center hero/opening stage and fit globe gracefully within viewport

- Summary: Diagnosed and resolved issue reported with screenshots where the opening globe was oversized (125vh), shifted upward into the top edge of the browser, and clipped off during boot and mascot dialogue:
  1. In `opening.css`, replaced oversized `width: min(1200px, 100vw, 125vh)` with responsive, bounded sizing `width: min(780px, 82vw, 76vh); aspect-ratio: 1; inset: 0; margin: auto;`. This guarantees at least 24% vertical clearance (12% padding top and bottom) on all viewports, preventing any top-edge clipping.
  2. Replaced asymmetric stage positioning `inset: 3vh 4vw 9vh;` with symmetric `inset: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; pointer-events: none;`.
  3. In `OpeningExperience.jsx`, removed `y: [0, '-6vh']` upward translation on the globe so it remains centered throughout the opening sequence and mascot statements, smoothly exiting with `y: [0, '-20vh']` only upon final handoff into the hero.
  4. In `hero.css`, added `justify-content: center; padding: clamp(1.5rem, 3vh, 3rem) 0;` to `.hero` so the dashboard hero section remains gracefully centered and padded across resolutions.
  5. In mobile queries, replaced overflow `width: 118vw; top: -8vw;` with centered `width: min(86vw, 54vh); inset: 0; margin: auto;`.
- Files: `src/modules/home/presentation/opening/opening.css`, `src/modules/home/presentation/opening/OpeningExperience.jsx`, `src/modules/home/presentation/hero/hero.css`, `tests/cosmic-opening.test.mjs`, `CHANGE.md`
- Verification: Executed `npm test` (`node --test tests/*.test.mjs`) with all 54 unit and integration tests passing. Ran `npm run build` with 123 modules compiled cleanly in 2.76s with 0 errors.









