# HX313 System Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved HX313 System Command Center portfolio experience in the existing React/Vite home application.

**Architecture:** Keep the existing React home shell and theme hook, replacing the hero constellation with a data-driven command-center composition. Separate content data, stateful selection, SVG system visualization, and responsive CSS so each surface remains independently testable.

**Tech Stack:** React 18, JSX, Vite/Astro integration, modern CSS, existing Anime.js where useful, inline SVG, existing project assets.

## Global Constraints

- Preserve React/JSX/Vite and do not introduce TypeScript, Next.js, Angular, Vue, Bootstrap, or Material UI.
- Use supplied portfolio facts and assets only; do not invent credentials, clients, awards, or real-time infrastructure claims.
- Prefer CSS/SVG over 3D and continuous JavaScript animation.
- Support keyboard navigation, visible focus, semantic HTML, reduced motion, and no horizontal overflow.
- Keep the hero headline dominant and use green as a scarce accent.

## Sprint 1 alignment with portfolio-trends guidance

- [ ] Preserve the dark-mode engineering atmosphere and a single recognizable green brand thread.
- [ ] Keep micro-interactions purposeful: hover, focus, selection, and reveal states should make work discovery clearer without puzzle navigation.
- [ ] Keep contact access visible in sticky navigation and expose live WOS destinations directly from the command center.
- [ ] Use real product screenshots and the system map for tactile/retro-futurist depth; avoid decorative effects that compete with the work.
- [ ] Keep the first viewport focused on positioning, capability, and a clear next action.

---

## Sprint roadmap

| Sprint | Outcome | Main deliverable |
|---|---|---|
| 1. Foundation | Stable visual system and content model | Tokens, project data, theme contract, command-center state |
| 2. Composition | Static visual target in the browser | Navigation, hero copy, WOS system core, four-surface active system, project/status/metrics panels |
| 3. Interaction | Portfolio feels like one connected system | Project selection, domain highlighting, CTA transitions, theme persistence |
| 4. Responsive + motion | Intentional tablet/mobile experience | Mobile reflow, reduced-motion behavior, restrained entry/idle motion |
| 5. Verification | Production-ready handoff | Build checks, Playwright checks, visual viewport review, accessibility/performance fixes |

### Sprint 1: Foundation

**Files:** `src/data/projects.js`, `src/data/technologies.js`, `src/data/activity.js`, `src/data/metrics.js`, `src/hooks/useCommandCenter.js`, `src/shared/theme/tokens.css`, `src/shared/theme/useTheme.js`.

- [ ] Model EPOS plus the six supplied shipped projects with image paths, categories, statuses, metrics, featured state, and system domains.
- [ ] Move technologies, activity, and proof metrics into data modules.
- [ ] Extend theme tokens for system/light/dark command-center surfaces without breaking existing theme consumers.
- [ ] Add selected-project state and derived highlighted domains in `useCommandCenter`.
- [ ] Run `npm run build` and confirm the data layer does not change routing or existing pages.

### Sprint 2: Composition

**Files:** `src/modules/home/presentation/HomePage.jsx`, `src/modules/home/presentation/command-center/CommandCenter.jsx`, `SystemCore.jsx`, `ActiveBuild.jsx`, `ProjectGrid.jsx`, `ProjectCard.jsx`, `SystemStatus.jsx`, `ActivityFeed.jsx`, `MetricsBar.jsx`, `src/modules/home/presentation/hero/HeroContent.jsx`, `src/modules/home/presentation/hero/HeroVisual.jsx`, `src/modules/home/presentation/home.css`, `src/modules/home/presentation/hero/hero.css`.

- [ ] Replace the current constellation readout with the command-center layout while keeping the existing opening experience contract.
- [ ] Build the WOS system core with connected Customer Web, Admin Panel, Order Terminal, ePOS, and Kitchen/KDS nodes.
- [ ] Build the WOS-first active system panel using the real customer, terminal, ePOS, and administration screenshots.
- [ ] Build compact project inventory cards, system status, activity feed, proof strip, and technology strip.
- [ ] Update navigation labels and theme control presentation to match the reference image.
- [ ] Verify the desktop first viewport at 1440×900 and 1920×1080.

### Sprint 3: Interaction

**Files:** `src/modules/home/presentation/command-center/CommandCenter.jsx`, `SystemCore.jsx`, `ActiveBuild.jsx`, `ProjectCard.jsx`, `src/shared/theme/ThemeToggle.jsx`, `src/shared/theme/useTheme.js`.

- [ ] Wire all project cards to `useCommandCenter` and expose selection with `aria-pressed` and an `aria-live` active-build summary.
- [ ] Highlight only the selected project's system domains and transition the active image/metadata in 250–500ms.
- [ ] Make case-study and contact CTAs resolve to existing routes/contact methods without fake destinations.
- [ ] Implement System, Light, and Dark modes with localStorage persistence and OS preference handling for System.
- [ ] Test keyboard-only selection and focus visibility.

### Sprint 4: Responsive + motion

**Files:** `src/modules/home/presentation/home.css`, `src/modules/home/presentation/hero/hero.css`, command-center component styles, `src/modules/home/presentation/opening/opening.css`.

- [ ] Reflow desktop split into stacked mobile sections; convert projects to a compact horizontal scroller or stack.
- [ ] Scale the system core down and hide non-essential orbital decorations below 768px.
- [ ] Add restrained system-core entry choreography and idle pulse/scan effects using the existing animation approach.
- [ ] Add `prefers-reduced-motion: reduce` overrides that disable orbit/scan/entry motion while retaining state transitions.
- [ ] Check tablet widths 768–1199px and mobile widths 320–767px for overflow and readable tap targets.

### Sprint 5: Verification

**Files:** `tests/system-command-center.py`, any affected source files.

- [ ] Run `npm run build` and fix all build errors and unused imports.
- [ ] Run the existing Playwright checks plus a command-center smoke test for project selection, theme switching, and responsive layout.
- [ ] Inspect desktop and mobile screenshots for hierarchy, clipping, green-accent restraint, and asset correctness.
- [ ] Verify semantic landmarks, button labels, image alt text, focus states, and reduced-motion behavior.
- [ ] Review the final diff for scope creep and remove unused legacy hero code only when it is no longer referenced.
