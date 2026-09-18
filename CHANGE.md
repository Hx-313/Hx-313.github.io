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

## 2026-09-19 — Upgrade Capabilities and Solutions to solid matte brand cards & apply itHX branding

- Summary: Per user request ("read new theme and website branding from ithx and apply in the portfolio and then change these grids in cpabilities with card design the cards must be mate brand solid coors not ai opacitry colors"):
  1. Solid matte brand card design for Capabilities (`Services.jsx` / `services.css`):
     - Replaced the open wireframe grid table layout (`border-top`, `border-left`, `border-right`, `border-bottom` on `.services-grid` and `.services-item`) with a responsive card grid (`gap: clamp(1.25rem, 2.2vw, 1.75rem)`).
     - Upgraded `.services-item` into standalone elevated cards using 100% solid, opaque itHX brand surfaces with zero opacity washes:
       * Dark mode: `--ithx-deep-surface` (`#092322`) card background, `--ithx-theme-border-dark` (`#28514A`) border, and `--ithx-dark-primary-green` (`#0A2C2B`) hover background.
       * Light mode: `--ithx-white` (`#FCFBF8`) card background, `--ithx-line-light` (`#CBD7D0`) border, and `--ithx-emerald-accent` (`#147A5D`) hover border.
     - Added a crisp 3px top accent band indicator on each card (`.services-item::before`) that smoothly shifts to the signal color on hover.
     - Created structured icon badges (`.services-item-icon`): `3.1rem × 3.1rem` solid badge with `--ithx-night-green` (`#08130A`) background, solid border, and `--ithx-mint-signal` (`#52C7A7`) / `--ithx-emerald-accent` (`#147A5D`) icons.
     - Added agency-grade drop shadows (`box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25)`) and smooth lift micro-interactions (`translateY(-4px)`).
  2. Solid matte brand card design for Solutions / Domains (`solutions.css`):
     - Transformed the open wireframe grid in `.solutions-grid` into distinct solid matte itHX brand cards matching Capabilities.
     - Applied solid deep surface (`#092322`) in dark mode and solid white (`#FCFBF8`) in light mode with 3px top accent lines.
  3. Contact section solid brand surfaces (`contact.css`):
     - Replaced semi-transparent `color-mix(... 90%, transparent)` on `.contact-form-card`, `.channel-card`, `.direct-channel-pill`, and `.social-tactical-badge` with solid brand surfaces (`var(--color-surface)` / `#092322`).
     - Upgraded input fields and category chips to solid background and borders, removing remaining AI opacity washes.
- Files: `src/modules/home/presentation/services/services.css`, `src/modules/home/presentation/solutions/solutions.css`, `src/modules/contact/presentation/contact.css`, `CHANGE.md`
- Verification: `npm test` ran with all 80 unit tests passing (100%). `npm run build` compiled cleanly in 8.08s with 0 errors. Visual verification confirmed solid matte brand cards.

## 2026-09-18 — Transform About section KPI cards to solid canonical brand surfaces with zero opacity

- Summary: Per user request ("thes kpi cards are opacity based colors ( make them no opacity ) solid brand colors based"):
  1. Zero opacity brand surfaces: Replaced all semi-transparent `color-mix(... transparent)` backgrounds on `.about-kpi` with 100% solid, opaque canonical itHX brand tokens:
     - Dark theme: Standard cards use solid deep surface `--ithx-deep-surface` (`#092322`) with solid border `--ithx-theme-border-dark` (`#28514A`); flagship highlighted card uses solid primary forest green `--ithx-primary-green` (`#0D3736`) with solid emerald accent border `--ithx-emerald-accent` (`#147A5D`).
     - Light theme: Cards use solid white `--ithx-white` (`#FCFBF8`) with solid border `--ithx-line-light` (`#CBD7D0`); flagship highlighted card uses solid emerald accent border `--ithx-emerald-accent` (`#147A5D`).
  2. Removed translucent glassmorphic blur: Removed `backdrop-filter: blur(14px)` and `-webkit-backdrop-filter: blur(14px)` to ensure pure opaque rendering without background bleed or performance overhead.
  3. Solid accent lines & chips:
     - Top accent line (`.about-kpi::before`) upgraded to a crisp solid 3px bar that cleanly switches to the solid hover/highlight accent color.
     - Featured badge (`.about-kpi-chip`) updated to solid brand backgrounds and borders (`--ithx-night-green` `#08130A` with `#147A5D` border in dark mode; `--ithx-paper-marble` `#F4F2EA` with `#147A5D` border in light mode).
     - Divider line (`.about-kpi-desc`) converted from dashed translucent mix to a solid 1px brand border line.
  4. Clean architecture constants: Added `featuredBadge: 'FEATURED'` to frozen `ABOUT_TEXT` in `src/core/constants/about/aboutText.js` to ensure zero hardcoded presentation strings, strictly adhering to zero `//` guidelines.
- Files: `src/core/constants/about/aboutText.js`, `src/modules/about/presentation/AboutSection.jsx`, `src/modules/about/presentation/about.css`, `CHANGE.md`
- Verification: `npm test` ran with 80/80 unit tests passing (100%). `npm run build` compiled 491 modules cleanly in 11.35s with 0 errors. Visual verification via Playwright Edge headless confirmed opaque surfaces in both dark (`kpis_dark.png`) and light (`kpis_light.png`) themes.

## 2026-09-18 — Mobile Projects Showcase card sizing, stacked peeking layout, and touch gestures

- Summary: Per user request ("in projects section for mobile deign see this crd is getting cut and on mobile horizontal scroll is not working and lastly move the card little in other so that stack becomes visible"):
  1. Fixed card vertical clipping: Replaced the oversized mobile card min-height and media height in `projects-showcase.css`. Calibrated mobile card height to `clamp(26.5rem, 55vh, 30.5rem)` with balanced media scaling (`clamp(10.5rem, 25vh, 13.5rem)`), multi-line text clamping (3 lines), and `margin-top: auto` on platform badges, ensuring mockups, titles, copy, and badges fit comfortably with zero vertical cutoff.
  2. Implemented touch gesture navigation and tap-to-advance: Added passive touch listeners (`touchstart`, `touchmove`, `touchend`, `touchcancel`) with real-time finger drag translation and a 35px swipe threshold in `ProjectsShowcase.jsx`. Enabled click-to-navigate on peeking cards (`next` and `previous`), and added horizontal trackpad/wheel handling with cooldown.
  3. Calibrated card offset to reveal the stack: Positioned the mobile active card at `left: 44%` and set `--projects-carousel-offset: calc(var(--projects-card-width) * 0.84 + 0.85rem)`. This leaves ~90px of the next card visibly stacked and peeking from the right edge (`scale(0.91)`, `opacity: 0.74`, `pointer-events: auto`), clearly communicating a swipeable deck.
  4. Centered mobile carousel controls: Positioned the `<` and `>` arrow buttons below the card stack (`bottom: -0.25rem; left: 50%; transform: translateX(-50%)`) for convenient thumb navigation alongside touch swipe and card tapping.
  5. Desktop & tablet integrity: Desktop scrub-driven 3D carousel (`> 720px` with fine pointer) remains completely undisturbed and pixel-perfect.
- Files: `src/modules/home/presentation/command-center/ProjectsShowcase.jsx`, `src/modules/home/presentation/command-center/projects-showcase.css`, `CHANGE.md`
- Verification: Ran `npm test` with all 80/80 tests passing (100%). Ran `npm run build` with 0 errors. Verified with Playwright on Microsoft Edge at iPhone (390x844), Android (360x740), and Desktop (1440x900) viewports; validated active card containment (no cutoff), next card peeking by ~90px, tap-to-advance, and touch swipe transitions.

## 2026-09-18 — Move Hero marquee ticker to the end of the hero section on mobile viewports

- Summary: Per user request ("while not disturbing other devices move this rliable tixker at the end of the hero section"):
  1. Positioned `.hero-marquee` absolutely at the bottom/end of the hero section on mobile screens (`@media (max-width: 960px)` and `@media (max-width: 480px)`), removing the prior `position: relative; margin-top: 2rem` rule that positioned it in the middle of the hero between the social links and proof stat cards.
  2. Calibrated `.hero` bottom padding (`clamp(10.5rem, 22vh, 14rem)`) to prevent content overlap on shorter mobile viewports.
  3. Re-aligned mobile `.hero-visual-readout` (`bottom: 2.4rem` to `2.5rem`) and `.hero-visual-stats` (`bottom: clamp(4.4rem, 10vh, 6.8rem)`) to maintain clean vertical rhythm above the marquee.
  4. Preserved desktop and larger device layouts (> 960px) completely undisturbed.
- Files: `src/modules/home/presentation/hero/hero.css`, `CHANGE.md`
- Verification: `npm test` ran with 80/80 tests passing (100%). `npm run build` compiled cleanly with 0 errors. Visual verification via Playwright Edge headless on iPhone 390x844, Android 360x740, and Desktop 1440x900 confirmed 0px horizontal overflow and verified visual hierarchy.

## 2026-09-18 — Animate KPI count-up on focus with luminous cyber color glow and tactical bento styling

- Summary: Implemented interactive KPI count-up animation and elevated bento HUD styling per user request and uploaded reference:
  1. Dedicated focus-based counting: Placed an IntersectionObserver directly on `kpisRef` in `AboutSection.jsx` (triggering at threshold 0.3 when the KPI row enters view), animating counts from 0 to target over a smooth 1200ms cubic-bezier curve (`15+`, `100k+`, `1`).
  2. Luminous color animation: Added `@keyframes kpiNumberGlow` during count-up (`.is-counting`), cycling the numbers through a radiant emerald/mint phosphor glow (`var(--color-accent)` and `var(--ithx-mint-signal)`) with active text shadows and scaling suffix before settling into crisp typography.
  3. Tactical bento card style: Transformed plain unboxed numbers into 3-column tactical bento cards (`.about-kpi`) with frosted glass backdrop blur, 1px blueprint borders, top accent hairline gradient, pulsating emerald status beacons (`.about-kpi-beacon`), tags (`01 · SHIPPED`, `02 · REACH`, `03 · FLAGSHIP`), and subtle description dividers.
- Files: `src/core/constants/about/aboutText.js`, `src/modules/about/presentation/AboutSection.jsx`, `src/modules/about/presentation/about.css`, `CHANGE.md`
- Verification: `npm test` ran with 80/80 unit tests passing (100%). `npm run build` compiled 106 modules cleanly in 3.24s with 0 errors.

## 2026-09-18 — Position Hero top and bottom name tickers at 15% offset

- Summary: Per user request ("now move hafiz Ali abdullah and flutter ticker that are animating in top and bottom move htme in 15% from top and bottom repsctivel"):
  1. Updated `.hero-identity-arc--top` to `top: 15%` in `src/modules/home/presentation/hero/hero.css`.
  2. Updated `.hero-identity-arc--bottom` to `bottom: 15%` in `src/modules/home/presentation/hero/hero.css`.
  3. Kept all animations, tilt angle (`-2.2deg`), typography, globe, and bottom white marquee ticker completely intact.
- Files: `src/modules/home/presentation/hero/hero.css`, `CHANGE.md`
- Verification: `npm test` ran with 80/80 unit tests passing (100%). `npm run build` compiled cleanly in 3.06s with 0 errors.

## 2026-09-18 — Synchronize itHX v1.2.0 canonical color palette into portfolio theme

- Summary: Updated portfolio design tokens, theme controller, and HTML metadata to mirror the canonical itHX v1.2.0 brand and website color system extracted from the ithx brand repository:
  1. Matte dark background: Updated `--ithx-night-green` from `#041312` to `#08130A` across tokens and theme mappings, providing a softer, authentic matte green-black base.
  2. Dark border tokens: Introduced `--ithx-theme-border-dark: #28514A` and updated dark theme `--color-border` to reference it, preserving `--ithx-line-dark: #244944` for hairline dividers.
  3. Status & functional color roles: Added primitive and semantic tokens for `--color-success`, `--color-warning`, `--color-danger`, and `--color-info` across light and dark themes (meeting WCAG >= 4.5:1 contrast).
  4. System metadata: Updated theme-color meta tag in `index.html` and `THEME_COLORS.dark` in `useTheme.js` to `#08130A`.
  5. JSON mirror & tests: Added `src/shared/theme/tokens.json` and unit test `tests/theme-palette.test.mjs` to assert token parity and stability.
- Files: `src/shared/theme/tokens.css`, `src/shared/theme/useTheme.js`, `src/shared/theme/tokens.json`, `index.html`, `tests/theme-palette.test.mjs`, `CHANGE.md`
- Verification: `node --test tests/theme-palette.test.mjs` passed (1/1), `node --test tests/theme-hook.test.mjs` passed (1/1), `npm run build` compiled 491 modules cleanly in 6.64s with 0 errors.

## 2026-09-18 — Restore bottom white marquee ticker in Hero

- Summary: Per user request ("while keepin the current feign og the hero bring back the bottom white ticker and do not touch any othrr thing"):
  1. Restored `.hero-marquee` container inside `Hero.jsx` rendering the continuous 60fps infinite white marquee ticker (`HERO_TEXT.marqueeWords` — "Scalable ✦ Reliable ✦ Secure ✦ Maintainable ✦ Fast ✦ Smooth") at `bottom: clamp(0.5rem, 2vh, 1.6rem)` with `-2.2deg` tilt.
  2. Maintained the Hero ambient name tickers, holographic globe, and layout completely intact without altering any other components or styling.
- Files: `src/modules/home/presentation/hero/Hero.jsx`, `CHANGE.md`
- Verification: `npm test` ran with 79/79 unit tests passing (100%). `npm run build` compiled all modules cleanly in 6.54s with 0 errors.

## 2026-09-18 — Resize Selected Work cards to 80% screen size with top nav bar clearance

- Summary: Per user request ("make cards 80% of screen size becuase there is also top nav bar cards are getting cutted by it too"):
  1. 80% screen card height: Reduced card height from 90dvh to 80dvh (`--projects-card-height: 80dvh; --projects-card-max-height: 80dvh;`) in `projects-showcase.css`, and updated dynamic `measure()` calculation in `ProjectsShowcase.jsx` to `Math.floor(window.innerHeight * 0.80)`.
  2. Top nav bar clearance: Updated sticky viewport padding to `padding: clamp(5.25rem, 9vh, 6.5rem) 5vw clamp(1.5rem, 3.5vh, 2.5rem)`, creating dedicated clearance below the sticky top navigation bar (`SiteHeader`, height ~4.5rem to 5.5rem) so cards are never obscured or clipped by the floating header.
  3. Image scaling adjustment: Tuned `.projects-showcase__media img` max-height to `min(100%, clamp(16rem, 42vh, 32rem))` to maintain balanced device mockup proportions inside the 80% height canvas.
- Files: `src/modules/home/presentation/command-center/ProjectsShowcase.jsx`, `src/modules/home/presentation/command-center/projects-showcase.css`, `tests/projects-showcase.test.mjs`, `CHANGE.md`
- Verification: `npm test` passed with 79/79 unit tests (100%). `npm run build` compiled 106 modules cleanly in 3.49s with 0 errors.

## 2026-09-18 — Implement Hero dual name ticker and restore Dietify card

- Summary: Per user reference mockup and request:
  1. Hero dual name ticker: Implemented full-bleed edge-to-edge ambient name tickers (`HAFIZ ALI ABDULLAH • FLUTTER DEVELOPER •`) tilted at `-2.2deg` across both the top and bottom of the Hero canvas matching the uploaded design reference. Applied deep emerald wash typography (`font-weight: 850; font-size: clamp(2.4rem, 4.4vw, 4.4rem); color: color-mix(in srgb, var(--color-accent) 20%, transparent); text-shadow: 0 0 1.6rem color-mix(in srgb, var(--color-accent) 14%, transparent);`) with bullet delimiters (`•`). Wired smooth 60fps infinite marquee sweeps (`heroArcTextSweep` and `heroArcTextSweepReverse`) and subtle organic floating oscillation keyframes (`heroArcRotateTop` and `heroArcRotateBottom`).
  2. Hero marquee cleanup: Removed the obsolete boxed `.hero-marquee` container (with "Scalable ✦ Reliable ✦ Secure" pill and borders) from `Hero.jsx` so the bottom name ticker spans the footer uninterrupted exactly as shown in the mockup image.
  3. Dietify card restoration: Verified and confirmed `'dietify'` in `FEATURED_PROJECT_IDS` in `src/modules/home/presentation/command-center/ProjectsShowcase.jsx` to ensure the Dietify card is restored as the first card in the Selected Work showcase sequence.
- Files: `src/modules/home/presentation/hero/HeroVisual.jsx`, `src/modules/home/presentation/hero/Hero.jsx`, `src/modules/home/presentation/hero/hero.css`, `src/modules/home/presentation/command-center/ProjectsShowcase.jsx`, `CHANGE.md`
- Verification: `npm test` passed with 79/79 unit tests (100%). `npm run build` compiled all modules cleanly in 4.62s with 0 errors.

## 2026-09-18 — Scale Selected Work cards to 90% screen height with 10% viewport padding

- Summary: Implemented user requested full-screen card scaling and padding in the Selected Work showcase:
  1. 90% screen card height: Set `--projects-card-height: 90dvh` and `--projects-card-max-height: 90dvh` in CSS, and updated dynamic `measure()` in `ProjectsShowcase.jsx` to `Math.floor(window.innerHeight * 0.90)` (removing the previous 54rem / 864px max-height cap), allowing cards to expand to 90% of screen height on full-screen displays.
  2. 10% viewport padding: Added `padding: 5vh 5vw` to `.projects-showcase__sticky-viewport` (providing 10% total vertical padding [5% top, 5% bottom] and 10% total horizontal padding [5% left, 5% right]), centering the 90% height cards with clean clearance from the edges.
  3. Proportional card internal padding: Updated `.projects-showcase__media`, `.projects-showcase__body`, and `.projects-showcase__card--cta` with 10% proportional width clamp padding and elevated image `max-height` (`min(100%, clamp(18rem, 48vh, 36rem))`) so mockups and copy fill the 90vh cards with balanced whitespace.
- Files: `src/modules/home/presentation/command-center/ProjectsShowcase.jsx`, `src/modules/home/presentation/command-center/projects-showcase.css`, `tests/projects-showcase.test.mjs`, `CHANGE.md`
- Verification: `npm test` ran with 79/79 unit tests passing (100%). `npm run build` compiled 106 modules cleanly in 3.89s with 0 errors.

## 2026-09-18 — Update Selected Work project sequence to 5-card sequence

- Summary: Updated the Selected Work project card sequence per user request:
  1. Dietify (`dietify`)
  2. Speak & Translate (`speak`)
  3. ExpenseFlow (`expenseflow`)
  4. WOS (`wos`)
  5. See all projects (`see-all-projects` CTA card)
- Files: `src/modules/home/presentation/command-center/ProjectsShowcase.jsx`, `tests/projects-showcase.test.mjs`, `CHANGE.md`
- Verification: `npm test` ran with 79/79 unit tests passing (100%). `npm run build` compiled 106 modules cleanly in 3.09s with 0 errors.

## 2026-09-18 — Selected Work: Vertical header scroll followed by sticky horizontal card scrub

- Summary: Implemented the requested two-phase scroll behavior for the Selected Work section:
  1. Header vertical scroll-up: When scrolling down from the Hero section, the header stage ("Selected work / 01" and "Built for the moment after the idea") is positioned in normal document flow (`min-height: 75vh`) and scrolls vertically up out of the viewport.
  2. Sticky full-viewport cards stage: Once the header scrolls off-screen and the cards reach the main viewport, the `.projects-showcase__sticky-viewport` pins to `top: 0` for `100vh` / `100dvh`.
  3. Horizontal scrub restored: While pinned in the viewport, downward vertical scroll translates into horizontal scrubbing across cards (Active, Previous, Next, Hidden) using a continuous delta scroll-track (`height: calc(100vh + var(--projects-scroll-distance))`), restoring the original horizontal carousel experience.
  4. Full vertical card height: Each card expands to take the full vertical length of the screen (`height: min(54rem, calc(100dvh - clamp(2.5rem, 5vh, 4rem)))`), leaving nothing else on screen.
  5. Removed progress bar and explore text: Completely removed the "Scroll to explore" text, progress rail/fill bar, and slide counter.
  6. Natural exit: When horizontal card scrub completes, sticky unpins and normal vertical page scrolling resumes into the About section.
- Files: `src/modules/home/presentation/command-center/ProjectsShowcase.jsx`, `src/modules/home/presentation/command-center/projects-showcase.css`, `src/modules/home/presentation/home.css`, `tests/projects-showcase.test.mjs`, `CHANGE.md`
- Verification: `npm test` ran with 79/79 unit tests passing (100%). `npm run build` compiled 106 modules cleanly in 3.25s with 0 errors.

## 2026-09-18 — Refactor Selected Work to vertical scroll showcase with full-height cards

- Summary: Converted the Selected Work section from a scroll-jacked horizontal carousel to natural vertical scrolling per user specifications:
  1. Header scrolls up naturally: Positioned the "Selected work / 01" and "Built for the moment after the idea" header in a dedicated stage (`min-height: 75vh`) that scrolls up smoothly when the user scrolls down, rather than remaining pinned at the top.
  2. Sequential full-height cards: Placed each project card in its own viewport container (`min-height: 100vh; min-height: 100dvh`), allowing each card to occupy the full vertical length of the screen (`height: min(54rem, calc(100vh - clamp(2.5rem, 5vh, 4.5rem)))`) with generous room for device mockups and unconstrained descriptions.
  3. Removed horizontal controls and progress area: Completely removed the "Scroll to explore" text, progress rail/fill, "04 / 04" counter, left/right horizontal arrow buttons, and scroll-jacking math (`CAROUSEL_STEP_COUNT`, horizontal offset transforms). Removed `.is-carousel-active` header override.
  4. Subtle reveal animations and accessibility: Added an IntersectionObserver to gently fade/reveal cards as they enter view, while guaranteeing cards remain visible by default and fully respecting `prefers-reduced-motion`.
- Files: `src/modules/home/presentation/command-center/ProjectsShowcase.jsx`, `src/modules/home/presentation/command-center/projects-showcase.css`, `src/modules/home/presentation/home.css`, `tests/projects-showcase.test.mjs`, `CHANGE.md`
- Verification: `npm test` ran with 79/79 unit tests passing (100%). `npm run build` compiled 106 modules cleanly with 0 errors in 3.81s.

## 2026-09-18 — Elevate Hero background typography visibility and vertical positioning

- Summary: Per user feedback ("lines got too faded barely can see and move it abit top"), elevated the vertical placement of the background typography watermark to `top: 40%` (previously `top: 50%`) across the upper hemisphere of the digital earth globe, and boosted its visibility from 9% to 22% accent opacity (`color: color-mix(in srgb, var(--color-accent) 22%, transparent)`) accompanied by a subtle emerald text glow (`text-shadow: 0 0 1.6rem color-mix(in srgb, var(--color-accent) 18%, transparent)`). Widened the mask fade window (`black 34%, black 94%`) so the typography is clearly discernible and luminous while continuing to sit strictly behind the globe and foreground content.
- Files: `src/modules/home/presentation/hero/hero.css`, `CHANGE.md`
- Verification: `npm test` ran with 79/79 unit tests passing (100%). `npm run build` compiled 106 modules cleanly with 0 errors in 13.10s.

## 2026-09-18 — Refactor Hero background typography to subtle dark-green ambient watermark

- Summary: Addressed layout collision and readability issues in the Hero section by refactoring background typography into an ambient background watermark per user specifications:
  1. Reduced to a single text layer: Collapsed multiple rotated strips into a single continuous repeating line combining `nameArc` ("Hafiz Ali Abdullah") and `rolesArc` ("Flutter Developer") with middle-dot delimiters.
  2. Removed steep rotation/skew: Eliminated the steep diagonal crossing the hero, flattening the typography to 0deg with a very gentle 1deg ambient float.
  3. Recolored to faint dark green wash: Dropped text opacity to roughly 9% (`color: color-mix(in srgb, var(--color-accent) 9%, transparent)`) and removed `mix-blend-mode: difference` so it renders as a washed-out ambient texture rather than competing white content.
  4. Fixed z-index & stacking: Placed the ambient layer at `z-index: 0` inside `.hero-visual`, guaranteeing it sits strictly behind the 3D globe portal (`z-index: 1`), headline, subtext, buttons, social links (`z-index: 3`), and KPI stat cards (`z-index: 4`).
  5. Constrained to avoid readable text: Confined the layer behind the globe graphic (`left: 62%`) with a directional linear gradient mask (`mask-image: linear-gradient(90deg, transparent 0%, transparent 26%, black 42%, black 86%, transparent 100%)`) that completely hides text over the left-hand content container.
- Files: `src/modules/home/presentation/hero/HeroVisual.jsx`, `src/modules/home/presentation/hero/hero.css`, `CHANGE.md`
- Verification: `npm test` ran with 79/79 unit tests passing (100%). `npm run build` compiled 106 modules cleanly with 0 errors in 9.79s.

## 2026-09-18 — Tilted continuous bottom marquee and central intersecting difference overlays

- Summary: Implemented the user's design updates for the Hero section:
  1. Tilted bottom marquee: Angled the bottom marquee bar (`transform: rotate(-2.2deg)`) across the bottom of the hero canvas with edge-to-edge bleed (`width: 112vw; left: -6vw;`) to match the user's reference image. Rebuilt the marquee track with 3x repeated word sequences per copy and mathematically identical padding (`clamp(1.2rem, 2.5vw, 2.8rem)` on every item) to eliminate all jumpiness and provide an entirely seamless, continuous 60fps infinite scroll loop.
  2. Central intersecting identity overlays with difference logic: Replaced faint ghost watermarks with prominent, bold typographic overlays ("Hafiz Ali Abdullah" and "Flutter Developer") centered at `top: 50%; left: 50%` with opposing angles (`rotate(-8deg)` and `rotate(8deg)`). Structured the ribbons to cross in the center with alternating trajectories: the top ribbon floats upward (`translateY(-22px)`) while sweeping forward, while the bottom ribbon floats downward (`translateY(22px)`) while sweeping in reverse. Applied CSS `mix-blend-mode: difference;` ("difference logic") with `#FFFFFF` typography, producing dynamic holographic color inversion against the glowing 3D earth and an inverted geometric stencil cutout where the two titles cross in the center.
- Files: `src/core/constants/hero/heroText.js`, `src/modules/home/presentation/hero/Hero.jsx`, `src/modules/home/presentation/hero/HeroVisual.jsx`, `src/modules/home/presentation/hero/hero.css`, `CHANGE.md`
- Verification: `npm test` ran with 79/79 unit tests passing (100%). `npm run build` compiled 106 modules cleanly with 0 errors in 13.08s.

## 2026-09-18 — Lock Hero section to Dark Mode and Redesign About Me section

- Summary: Per user requirement, locked the Hero section to Dark Mode across both Light and Dark site themes to preserve the high-contrast cinematic digital earth canvas, glowing mint accents, dark frosted HUD cards, and white navigation pill at the top. Removed light theme color inversion overrides from the hero, scoping `--color-background: var(--ithx-night-green);`, `--color-foreground: var(--ithx-paper-marble);`, `--color-accent: var(--ithx-mint-signal);`, and `color-scheme: dark;` directly to `.hero`. Redesigned the "About Me" section based on the user's architectural concept: implemented a 120px subtle technical blueprint grid (`--about-grid`), 3 ambient floating particles with subtle drift and pulse animations (`--about-particle`), a 2-column asymmetric composition with an eyebrow badge, stacked headline with a soft italicized third line (`built to last.`), narrative copy with an accent link, and a bottom horizontal technical KPI row with animated counters (`APPS SHIPPED`, `DOWNLOADS`, `CONNECTED SYSTEM BUILT`). Centralized and froze all About Me text strings in `src/core/constants/about/aboutText.js` in compliance with `AGENTS.md` and `CLAUDE.md`.
- Files: `src/modules/home/presentation/hero/hero.css`, `src/modules/about/presentation/AboutSection.jsx`, `src/modules/about/presentation/about.css`, `src/modules/about/domain/aboutData.js`, `src/core/constants/about/aboutText.js`, `tests/about-section.test.mjs`, `CHANGE.md`
- Verification: `npm test` ran with 78/78 passing unit tests (100%). `npm run build` compiled 106 modules cleanly with 0 errors in 8.81s.

## 2026-09-18 — Refine Hero section and Header for Light Theme

- Summary: Fixed foggy, low-contrast appearance in Light Theme starting with the Hero section and SiteHeader. Applied mathematical multiplicative color inversion (`mix-blend-mode: multiply; filter: invert(1) hue-rotate(180deg) contrast(1.18) brightness(1.04)`) to the digital earth frame sequence, turning the opaque black JPG background pure transparent white against the light paper marble canvas (`#F4F2EA`) while preserving crisp emerald green globe particles. Restructured Light Theme hero styling: updated KPI cards (`100K+`, `15+`) to elevated frosted glass cards (`rgba(252, 251, 248, 0.94)`) with crisp borders and deep ink typography; toned down spinning text watermark opacity to 0.12; upgraded secondary CTA and social links with clean white/marble surfaces; gave marquee bottom ticker crisp contrast; made SiteHeader navigation gap responsive (`gap: clamp(0.45rem, 0.95vw, 1.25rem)`) to completely eliminate the "Testimonials" collision with the theme toggle on 1024px-1280px viewports; and explicitly bound light theme semantic tokens to `:root[data-theme='light']`.
- Files: `src/modules/home/presentation/hero/hero.css`, `src/modules/home/presentation/header/header.css`, `src/shared/theme/tokens.css`, `CHANGE.md`
- Verification: `npm test` ran with 78/78 unit tests passing. `npm run build` compiled 106 modules cleanly with 0 errors in 12.32s.

## 2026-09-18 — Modular text constants extraction and multi-agent rule enforcement

- Summary: Extracted all user-facing, CTA, and accessibility text across all sections into clean-architecture modular constants under `src/core/constants/<module>/` to enable future reuse, multi-agent consistency, and SEO optimization. Preserved backward compatibility by forwarding legacy exports via `src/core/constants.js`. Deep-froze all constant contracts with `Object.freeze`. Refactored all components and domain data files to reference the new constants. Established a 3-tier agent enforcement rule (`AGENTS.md` at root, `.agents/rules/text-constants.md`, and updated `CLAUDE.md` guardrails) requiring all AI agents to read and comply with the zero-hardcoded-text architecture. Added `tests/constants-contracts.test.mjs` and updated existing test assertions.
- Files: `AGENTS.md`, `.agents/rules/text-constants.md`, `CLAUDE.md`, `src/core/constants/index.js`, `src/core/constants/links.js`, `src/core/constants/intro/introText.js`, `src/core/constants/hero/heroText.js`, `src/core/constants/command-center/commandCenterText.js`, `src/core/constants/about/aboutText.js`, `src/core/constants/services/servicesText.js`, `src/core/constants/solutions/solutionsText.js`, `src/core/constants/certifications/certificationsText.js`, `src/core/constants/how-i-build/howIBuildText.js`, `src/core/constants/contact/contactText.js`, `src/core/constants/testimonials/testimonialsText.js`, `src/core/constants/navigation/headerText.js`, `src/core/constants/navigation/footerText.js`, `src/core/constants/seo/seoText.js`, `src/core/constants.js`, `src/modules/about/presentation/AboutSection.jsx`, `src/modules/contact/application/useContactForm.js`, `src/modules/contact/domain/contactData.js`, `src/modules/contact/presentation/ContactChannels.jsx`, `src/modules/contact/presentation/ContactForm.jsx`, `src/modules/contact/presentation/ContactSection.jsx`, `src/modules/footer/domain/footerData.js`, `src/modules/footer/presentation/SiteFooter.jsx`, `src/modules/home/presentation/certifications/CertificationsSection.jsx`, `src/modules/home/presentation/command-center/ActiveBuild.jsx`, `src/modules/home/presentation/command-center/CommandCenter.jsx`, `src/modules/home/presentation/command-center/SystemCore.jsx`, `src/modules/home/presentation/header/SiteHeader.jsx`, `src/modules/home/presentation/hero/Hero.jsx`, `src/modules/home/presentation/hero/HeroContent.jsx`, `src/modules/home/presentation/hero/HeroVisual.jsx`, `src/modules/home/presentation/how-i-build/HowIBuild.jsx`, `src/modules/home/presentation/how-i-build/howIBuildData.js`, `src/modules/home/presentation/opening/OpeningExperience.jsx`, `src/modules/home/presentation/opening/openingSequence.js`, `src/modules/home/presentation/services/Services.jsx`, `src/modules/home/presentation/services/servicesData.js`, `src/modules/home/presentation/solutions/SolutionsSection.jsx`, `src/modules/home/presentation/testimonials/TestimonialsSection.jsx`, `tests/constants-contracts.test.mjs`, `tests/about-section.test.mjs`, `tests/contact-funnel.test.mjs`, `tests/cosmic-opening.test.mjs`, `tests/hero-content.test.mjs`, `tests/how-i-build-data.test.mjs`, `tests/site-footer.test.mjs`, `tests/site-header.test.mjs`, `CHANGE.md`
- Verification: `npm test` ran with 76/76 unit tests passing. `npm run build` compiled 106 modules cleanly with 0 errors in 8.54s.

## 2026-09-17 — Fix mascot intro sequence regressions and restore ground truth choreography

- Summary: Restored the animated intro sequence choreography and layout per the ground truth reference clips in `assets/ezgif-756a81963dde0ed5-jpg` and addressed all 7 regression points:
  1. Card auto-sizing: Replaced fixed/constraining dimensions with intrinsic auto-sizing (`height: auto; min-height: fit-content; padding: clamp(1.4rem, 2.5vw, 1.9rem) clamp(1.6rem, 2.8vw, 2.2rem); overflow: visible;`) to eliminate text clipping across 3-line and 4-line statements.
  2. Mascot overlap & scale: Locked mascot scale to 1.0 with subtle (≤5%) active speaker emphasis. Enforced guaranteed clearance gap (≥28px) between mascot body and projection card across all screen sizes.
  3. Background globe depth plane: Restored `OpeningNetworkGlobe.jsx` as a visible, softly blurred background layer (`filter: blur(8px) brightness(0.65); opacity: 0.72; scale: 0.94;`) behind cards throughout beats 2–7, refocusing cleanly upon card close.
  4. Pacing: Re-timed the sequence end-to-end to 9,800ms matching the canonical 9-beat choreography table with 1.7s–2.0s reading holds.
  5. Hero transition & element stagger: Ensured 600ms crossfade into hero with staggered entrance delays (Nav: 0ms, Headline: 150ms, Subhead: 300ms, CTAs/Stats: 450ms).
  6. Visual language: Linked intro 3D holographic globe directly with the hero's holographic globe language.
  7. Halo ring z-index: Cleaned stacking contexts (`--layer-ambient: 1; --layer-globe: 4; --layer-mascot: 5; --layer-projection: 6; --layer-control: 8;`) so halos never clip through text baselines.
- Files: `src/modules/home/presentation/opening/openingSequence.js`, `src/modules/home/presentation/opening/OpeningExperience.jsx`, `src/modules/home/presentation/opening/OpeningProjection.jsx`, `src/modules/home/presentation/opening/opening.css`, `src/modules/home/presentation/hero/HeroContent.jsx`, `tests/opening-sequence.test.mjs`, `tests/cosmic-opening.test.mjs`, `CHANGE.md`
- Verification: `node --test tests/cosmic-opening.test.mjs tests/opening-sequence.test.mjs tests/hero-content.test.mjs tests/holographic-globe.test.mjs tests/site-header.test.mjs` passed (26/26 tests passing). `npm run build` compiled cleanly in 8.69s with 0 errors.

## 2026-09-15 — Wire back intro mascots transmission sequence on cinematic orb background

- Summary: Preserved the background animation sequence (`FrameSequence` with `ORB_FRAMES` across a full-viewport borderless canvas, tactical loader HUD, and zoom-through handoff) while restoring the interactive mascots transmission dialogue between Dash and Aero. Re-introduced the 3-statement transmission sequence (Dash statement 1: "Your users only see the app", Aero statement 2: "Your business relies on everything behind it", Duo statement 3: "When both work, your product works") with dynamic expressions (`executing`, `analyzing`, `excited`, `happy`), arm waving, active speaker glows, and a cybernetic duo connection energy beam (`.opening-duo-connection`). Updated `tests/site-header.test.mjs` to support the chapter navigation label.
- Files: `src/modules/home/presentation/opening/OpeningExperience.jsx`, `src/modules/home/presentation/opening/opening.css`, `tests/site-header.test.mjs`, `CHANGE.md`
- Verification: `node --test tests/cosmic-opening.test.mjs tests/opening-sequence.test.mjs tests/hero-content.test.mjs tests/holographic-globe.test.mjs tests/site-header.test.mjs` passed (19/19 tests passing). `npm run build` compiled cleanly with 0 errors in 5.86s.

## 2026-09-09 — Rebuild How I Build section to four-row layered list and direct narrative copy

- Summary: Replaced the benchmark 3x3 icon grid, "building a house" metaphor, and buzzword chips with a clean four-row architectural layer list (UI layer, Data & backend, Infra & deploy, Workflow & tooling) using Hafiz's real tool stack and middle-dot delimiters. Added the new direct narrative copy block below the layer list. Matched the About Me section's typography, spacing, lining numerals, and vertical-centering rules. Removed obsolete interactive blueprint components and updated test suites.
- Files: `src/modules/home/presentation/how-i-build/howIBuildData.js`, `src/modules/home/presentation/how-i-build/HowIBuild.jsx`, `src/modules/home/presentation/how-i-build/how-i-build.css`, `tests/how-i-build-data.test.mjs`, `tests/how-i-build-interaction.test.mjs`, `CHANGE.md`
- Verification: `npm test` passed (61/61 tests passing). `npm run build` compiled cleanly with 0 errors in 10.22s.

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

## 2026-09-02 — Implement Dual-Column Contact Funnel & Multi-Column Architectural Footer

- Summary: Built the primary conversion funnel and closing landmark following `/impeccable`, `/ui-ux-pro-max`, `/brand-guidelines`, and `/app-engineering-guardrails`:
  1. Extended `src/core/constants.js` with `scheduleLink = 'https://cal.com/hafiz-ali'` for centralized calendar booking.
  2. Created Contact Domain (`src/modules/contact/domain/contactData.js`) centralizing channels, project scope categories, and operational telemetry (PKT timezone, <2h response latency).
  3. Created Contact Application hook (`src/modules/contact/application/useContactForm.js`) with client-side field validation, simulated 450ms network animation, success state, and prefilled `mailto:` fallback.
  4. Built `ContactChannels.jsx` (Fast-Track 30-min discovery meeting card, operational status beacon, WhatsApp direct chat, and copyable email) and `ContactForm.jsx` (category scope pills, accessible labels, inline errors, loading state).
  5. Built `ContactSection.jsx` (`#contact`) and `contact.css` (responsive 2-column grid, light/dark theme variables, WCAG AA contrast, focus rings, reduced-motion support).
  6. Created Footer Domain (`src/modules/footer/domain/footerData.js`), `SiteFooter.jsx`, and `footer.css` featuring a 4-column directory (Identity & Thesis, Navigation Sitemap, Live Systems [WOS Admin, EPOS, West Coast Coffee], Direct Channels) and a lower colophon bar with timezone, tech stack citation, and smooth Back-to-Top control.
  7. Mounted `<ContactSection />` and `<SiteFooter />` in `HomePage.jsx` and connected `#contact` into `SiteHeader.jsx` navigation and scroll-spy tracking.
- Files: `src/core/constants.js`, `src/modules/contact/domain/contactData.js`, `src/modules/contact/application/useContactForm.js`, `src/modules/contact/presentation/ContactChannels.jsx`, `src/modules/contact/presentation/ContactForm.jsx`, `src/modules/contact/presentation/ContactSection.jsx`, `src/modules/contact/presentation/contact.css`, `src/modules/footer/domain/footerData.js`, `src/modules/footer/presentation/SiteFooter.jsx`, `src/modules/footer/presentation/footer.css`, `src/modules/home/presentation/HomePage.jsx`, `src/modules/home/presentation/home.css`, `src/modules/home/presentation/header/SiteHeader.jsx`, `tests/core-constants.test.mjs`, `tests/contact-funnel.test.mjs`, `tests/site-footer.test.mjs`, `CHANGE.md`
- Verification: Executed `npm test` (`node --test tests/*.test.mjs`) with all 61 unit and integration tests passing. Ran `npm run build` with 132 modules transformed into optimized chunks in 2.22s with 0 errors.

## 2026-09-08 — Convert Scroll Story into 3-Phase Core Thesis Hooks and Streamline About Section

- Summary: Replaced legacy "The Problem" section with the 3 signature scroll hooks (`STORY_PHASE_COUNT = 3`):
  1. Updated `src/modules/home/presentation/client-story/storyData.js` with the 3 core theses:
     - Beat 1: `GREAT MOBILE PRODUCTS DON'T END AT THE INTERFACE.` / `THEY RUN ON SYSTEMS BUILT TO HOLD UP.`
     - Beat 2: `PERFORMANCE ISN'T A FEATURE.` / `IT'S THE FOUNDATION.`
     - Beat 3: `EVERY SCREEN IS A STATE. EVERY TAP IS AN EVENT.` / `THE PRODUCT IS THE LOGIC BETWEEN THEM.`
  2. Streamlined `ClientStory.jsx` and `client-story.css` into a clean 3-step scroll stage showing both lead and statement simultaneously in unified view with zero `//` pseudo-comments.
  3. Streamlined `AboutSection.jsx` to focus on Profile Narrative, Metrics Grid, and Categorized Tools Showcase directly following the scroll hook system.
  4. Updated site navigation in `SiteHeader.jsx` (`01 Thesis`, `02 About`) and `footerData.js`.
- Files: `src/modules/home/presentation/client-story/storyData.js`, `src/modules/home/presentation/client-story/ClientStory.jsx`, `src/modules/home/presentation/client-story/client-story.css`, `src/modules/about/presentation/AboutSection.jsx`, `src/modules/home/presentation/HomePage.jsx`, `src/modules/home/presentation/header/SiteHeader.jsx`, `src/modules/footer/domain/footerData.js`, `tests/client-scroll-story.test.mjs`, `tests/about-section.test.mjs`, `tests/site-header.test.mjs`, `tests/site-footer.test.mjs`, `CHANGE.md`
- Verification: Executed `npm test` (`node --test tests/*.test.mjs`) with all 67 unit/integration tests passing. Ran `npm run build` compiling cleanly with 0 errors.

## 2026-09-08 — Update Hero Proof Point to 3+ Years

- Summary: Updated the experience proof point in `HeroContent.jsx` from `2+ years building` to `3+ years building` for consistency with the About Me narrative and career milestone data.
- Files: `src/modules/home/presentation/hero/HeroContent.jsx`, `tests/hero-content.test.mjs`, `CHANGE.md`
- Verification: Executed `npm test` (`node --test tests/*.test.mjs`) with all 67 unit/integration tests passing. Executed `npm run build` compiling cleanly with 0 errors.

## 2026-09-08 — Implement About Me Final Spec & Remove Decorative Clutter

- Summary: Streamlined the About Me section (`AboutSection.jsx` and `about.css`) strictly to the final approved specification:
  1. Removed all decorative clutter: globe/orbit illustrations, floating badges, numbered eyebrow, bordered icon cards around stats, marketing subtext under numbers, sidebar tag lists, and signature icons.
  2. Implemented the clean, flat two-column structure with content vertically centered in the section (`min-height: 80vh`).
  3. Left column: Plain `About me` label (12px), natural wrapping headline at 26px with `"fifteen systems"` highlighted in `--signal` green, body copy at 14px (line-height 1.6, max-width ~38ch), and a clean plain-text name credit (*Hafiz Ali Abdullah / Mobile app developer*).
  4. Right column: Flat numbers at 28px (weight 500) and lowercase labels at 12px with 14px group spacing and `98.7%` in `--fault` amber.
- Files: `src/modules/about/presentation/AboutSection.jsx`, `src/modules/about/presentation/about.css`, `tests/about-section.test.mjs`, `CHANGE.md`
- Verification: Executed `npm test` (`node --test tests/*.test.mjs`) with all 67 unit/integration tests passing. Executed `npm run build` with 134 modules transforming and compiling cleanly in 5.38s with 0 errors.






## 2026-09-10 — Restore mirrored benchmark grid for How I Build

- Summary: Implemented the final How I Build v2 specification by mirroring the benchmark layout: narrative copy and bordered scope chips remain on the left, while the 12 real tools render as a card-style 3×4 grid on the right with icon, bold name, one-line description, and thin row/column dividers. Reconciled the component, stylesheet, and tests with the `tools`/`tags` data contract and preserved responsive two-column, two-column mobile, and single-column phone layouts.
- Files: `src/modules/home/presentation/how-i-build/HowIBuild.jsx`, `src/modules/home/presentation/how-i-build/how-i-build.css`, `tests/how-i-build-data.test.mjs`, `tests/how-i-build-interaction.test.mjs`, `CHANGE.md`
- Verification: `npm test` passed (61/61); `npm run build` passed with 132 modules transformed. Browser verification at 1280×720 confirmed 12 tiles, a 3-column grid measuring 632×455px, 23px icons, section height 720px, and no horizontal overflow.

## 2026-09-10 — Replace placeholder tool glyphs with brand icons

- Summary: Replaced the hand-drawn inline SVG sketches in the How I Build tool grid with real brand marks from the Simple Icons, Font Awesome, and VS Code icon sets. The existing green accent, 23px tile sizing, mirrored 3×4 layout, and accessibility-hidden decorative treatment remain unchanged.
- Files: `package.json`, `package-lock.json`, `src/modules/home/presentation/how-i-build/ToolIcons.jsx`, `tests/how-i-build-interaction.test.mjs`, `CHANGE.md`
- Verification: `npm test` passed (62/62); `npm run build` passed with 139 modules transformed. Browser verification confirmed all 12 brand marks render inside the existing 3×4 grid without layout changes.

## 2026-09-10 — Restore official brand icon colors

- Summary: Removed the shared `--signal` color from the tool icon wrapper and added per-brand color classes so each real icon renders in its own recognizable palette while the rest of the How I Build visual system remains unchanged.
- Files: `src/modules/home/presentation/how-i-build/ToolIcons.jsx`, `src/modules/home/presentation/how-i-build/how-i-build.css`, `tests/how-i-build-interaction.test.mjs`, `CHANGE.md`
- Verification: `npm test` passed (62/62); `npm run build` passed with 139 modules transformed. Browser verification confirmed the official brand colors render correctly across all 12 tiles.

## 2026-09-10 — Pair Postman and Insomnia marks in one tile

- Summary: Replaced the single Postman mark in the `Postman + Insomnia` tile with a contained overlapping pair of the Postman and Insomnia brand marks, using independent sizing, layering, and brand colors so both logos remain recognizable at compact scale.
- Files: `src/modules/home/presentation/how-i-build/ToolIcons.jsx`, `src/modules/home/presentation/how-i-build/how-i-build.css`, `tests/how-i-build-interaction.test.mjs`, `CHANGE.md`
- Verification: `npm test` passed (62/62); `npm run build` passed with 138 modules transformed. Browser verification confirmed the two marks overlap inside the existing icon slot without shifting the tile content.

## 2026-09-10 — Add clickable sparkle interactions to competency chips

- Summary: Converted the seven competency pills into accessible toggle buttons with `aria-pressed` state, hover/focus/pressed feedback, and a restrained four-particle sparkle burst on each activation. Added reduced-motion handling so the interaction remains usable without animated particles.
- Files: `src/modules/home/presentation/how-i-build/HowIBuild.jsx`, `src/modules/home/presentation/how-i-build/how-i-build.css`, `tests/how-i-build-interaction.test.mjs`, `CHANGE.md`
- Verification: `npm test` passed (62/62); `npm run build` passed with 139 modules transformed. Browser verification confirmed a chip toggles visibly and emits a sparkle burst.

## 2026-09-10 — Correct Firebase and Slack marks and add SaaS scope

- Summary: Replaced the monochrome Firebase and Slack substitutes with full-color flame and four-color octothorpe logomarks, then added the missing `SAAS DEVELOPMENT` competency to the How I Build scope tags.
- Files: `src/modules/home/presentation/how-i-build/howIBuildData.js`, `src/modules/home/presentation/how-i-build/ToolIcons.jsx`, `tests/how-i-build-data.test.mjs`, `tests/how-i-build-interaction.test.mjs`, `CHANGE.md`
- Verification: `npm test` passed (62/62); `npm run build` passed with 138 modules transformed. Browser verification confirmed the corrected marks and `SAAS DEVELOPMENT` chip render in the mirrored section.

## 2026-09-10 — Add restrained grid decoration

- Summary: Added a faint ambient glow, quiet inset frame, and low-key hover accent to the How I Build tool grid without changing its mirrored layout, divider mechanics, or official icon treatment.
- Files: `src/modules/home/presentation/how-i-build/how-i-build.css`, `tests/how-i-build-interaction.test.mjs`, `CHANGE.md`
- Verification: `npm test` passed (62/62); `npm run build` passed with 138 modules transformed. Browser verification confirmed the decoration stays subtle at the live 1280×720 preview size.

## 2026-09-15 — Refine hero screen full-bleed canvas, stacking hierarchy, KPI card equalization, and viewport framing

- Summary: Upgraded the Hero section to match the full-screen visual composition of reference Image 2 and address user feedback:
  1. Eliminated top empty space and background cutting by floating the navigation header directly over the hero canvas (`margin-top: -5.75rem` / `padding-top: 5.75rem`), extending the background and particle atmosphere from `top: 0` to `100dvh`.
  2. Moved animating identity tracks ("Hafiz Ali Abdullah" and "Flutter Developer · Mobile Application Developer · SaaS Developer") to `z-index: 0` (lowest in stack), so they sweep behind the globe.
  3. Expanded the 3D green globe portal and particle field to span the entire screen (`width: 100%; height: 100%; min-width: 100vw; min-height: 100vh;`) with smooth radial vignette and `mix-blend-mode: screen`.
  4. Equalized the KPI cards by removing the `.hero-stat-card:nth-child(2) { margin-top: 1.35rem; }` stagger offset and setting equal height, width, padding, and baseline alignment.
  5. Calibrated hero vertical rhythm so all content (kicker, title, description, CTAs, and social links) fits cleanly above the fold on the first screen without scrolling.
- Files: `src/modules/home/presentation/hero/hero.css`, `CHANGE.md`
- Verification: `node --test tests/hero-content.test.mjs tests/holographic-globe.test.mjs` passed (6/6 tests passing). `npm run build` compiled cleanly with 0 errors in 7.43s.

## 2026-09-18 — Align Phase 1 theme tokens and typography with itHX branding

- Summary: Replaced the active theme palette with canonical itHX light/dark semantic tokens, wired section-level colors to theme semantics, loaded Space Grotesk and Inter, and synchronized the theme-color metadata with explicit/system theme selection.
- Files: `index.html`, `src/shared/theme/tokens.css`, `src/shared/theme/global.css`, `src/shared/theme/useTheme.js`, `src/modules/about/presentation/about.css`, `src/modules/contact/presentation/contact.css`, `src/modules/footer/presentation/footer.css`, `src/modules/home/presentation/command-center/command-center.css`, `src/modules/home/presentation/header/header.css`, `src/modules/home/presentation/home.css`, `src/modules/home/presentation/how-i-build/how-i-build.css`, `src/modules/home/presentation/opening/opening.css`, `src/modules/home/presentation/services/services.css`, `tests/how-i-build-interaction.test.mjs`, `CHANGE.md`
- Verification: `npm run build` passed. Focused theme/header/footer tests passed. The full suite currently reports 57 passing and 6 unrelated pre-existing content-contract failures (about/client story/contact/how-i-build data).

## 2026-09-18 — Establish the post-hero portfolio flow and subject motion system

- Summary: Reordered the page after the hero into Projects, About, Services, Services in domains, Certifications, Tools, Contact, and Testimonials. Added honest placeholders for certifications and testimonials, updated header/footer/hero anchors, removed the retired thesis-first composition from the visible flow, and added subject-specific in-view choreography with reduced-motion support.
- Files: `src/modules/home/presentation/HomePage.jsx`, `src/shared/motion/SectionReveal.jsx`, `src/shared/motion/section-motion.css`, `src/modules/home/presentation/certifications/CertificationsSection.jsx`, `src/modules/home/presentation/testimonials/TestimonialsSection.jsx`, `src/modules/home/presentation/placeholders/placeholders.css`, `src/modules/home/presentation/solutions/SolutionsSection.jsx`, `src/modules/home/presentation/hero/HeroContent.jsx`, `src/modules/contact/presentation/ContactSection.jsx`, `src/modules/home/presentation/header/SiteHeader.jsx`, `src/modules/footer/domain/footerData.js`, `tests/portfolio-flow.test.mjs`, `tests/hero-content.test.mjs`, `tests/about-section.test.mjs`, `tests/client-scroll-story.test.mjs`, `tests/site-header.test.mjs`, `tests/site-footer.test.mjs`, `CHANGE.md`
- Verification: `npm run build` passed. Focused flow/motion/navigation tests passed (16/16). Browser QA covered desktop and mobile layouts, anchor navigation, placeholder rendering, and reduced-motion declarations. Full suite reports 63 passing and 4 unrelated pre-existing content-contract failures in About, Contact, and How I Build data tests.

## 2026-09-18 — Elevate mobile capability cards with service reveals

- Summary: Preserved the desktop 3×4 How I Build grid while turning the mobile layout into an elevated, full-width capability stack. Added keyboard/touch-friendly disclosure controls, one-at-a-time “Applied to” service reveals, subject-aligned motion, official icon color treatment, touch-sized targets, and reduced-motion support.
- Files: `src/modules/home/presentation/how-i-build/HowIBuild.jsx`, `src/modules/home/presentation/how-i-build/how-i-build.css`, `src/modules/home/presentation/how-i-build/howIBuildData.js`, `tests/how-i-build-mobile.test.mjs`, `CHANGE.md`
- Verification: Focused How I Build tests passed (6/6). `npm run build` passed. Full suite reports 66 passing and 4 pre-existing content-contract failures in About, Contact, and legacy How I Build data expectations. Browser QA confirmed the desktop grid remains intact and the mobile card reveal expands on tap.

## 2026-09-19 — Unify post-hero portfolio background into single continuous canvas

- Summary: Harmonized the entire portfolio flow after the Hero section so it renders as one continuous, seamless background canvas across both light and dark themes. Removed fragmented, sprint-specific background screens:
  1. Set section wrappers to transparent (`background: transparent`) in Projects Showcase (`projects-showcase.css`), About Me (`about.css`), Services (`services.css`), Solutions (`solutions.css`), Certifications/Testimonials placeholders (`placeholders.css`), How I Build (`how-i-build.css`), Contact Funnel (`contact.css`), and Site Footer (`footer.css`).
  2. Removed conflicting sprint-specific wallpaper grids and particle dots from About Me (120px blueprint grid in `about.css`) and Contact (5rem grid overlay in `contact.css`), and removed the harsh inter-section border seam in Solutions (`solutions.css`).
  3. Preserved all elevated card surfaces, buttons, forms, and interactive states using design tokens (`var(--color-surface)`, `var(--color-surface-raised)`, `var(--color-border)`), allowing the fixed `CosmicBackground` canvas to flow unbroken beneath the entire portfolio experience.
- Files: `src/modules/home/presentation/command-center/projects-showcase.css`, `src/modules/about/presentation/about.css`, `src/modules/home/presentation/services/services.css`, `src/modules/home/presentation/solutions/solutions.css`, `src/modules/home/presentation/placeholders/placeholders.css`, `src/modules/home/presentation/how-i-build/how-i-build.css`, `src/modules/contact/presentation/contact.css`, `src/modules/footer/presentation/footer.css`, `CHANGE.md`
- Verification: `npm test` ran with 80/80 unit tests passing (100%). `npm run build` compiled 106 modules cleanly with 0 errors in 4.25s.


