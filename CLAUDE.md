@AGENTS.md
@memory/MEMORY.md

> If any of the files below cannot be opened, stop and tell me. Do not continue without them:
> - `AGENTS.md`
> - `memory/MEMORY.md`
> - `docs/design-system.md`
> - `docs/component-registry.md`
> - `docs/site-structure.md`
> - `CHANGELOG.md`

# HX313 Portfolio — Project Guide (Claude Code Directives)

## Mandatory Change Tracking & Memory Protocol
Follow all rules in `AGENTS.md`. Before proposing code edits, execute the Restate step (Target, Change, Untouched). If instructions are ambiguous, stop and ask. Append dated changes to `CHANGELOG.md` and record decisions in `memory/decisions.md`.

## Active Application Runtime
This repository is a React 18 + Vite portfolio. The active runtime is:

```text
index.html
  -> src/main.jsx
  -> src/app/App.jsx
  -> src/modules/home/presentation/HomePage.jsx
```

Do not reintroduce the retired Astro implementation.

## Product Direction
HX313 is Hafiz Ali Abdullah's premium software-engineering portfolio. Its visual language combines an industrial software interface, premium SaaS, aerospace command-center cues, and a restrained futuristic HUD. It must remain professional, legible, accessible, and conversion-oriented rather than resembling a gaming or generic admin dashboard.

The primary audience is potential clients and employers evaluating shipped mobile, SaaS, backend, and product-engineering work.

## Current Structure
- `src/app/` — application entry.
- `src/modules/home/` — opening, hero, navigation, command center, and home presentation.
- `src/data/` — projects, activity, technologies, and metrics.
- `src/hooks/` — command-center state.
- `src/shared/theme/` — theme behavior and tokens.
- `src/components/` — shared mascot system.
- `public/assets/` — deployable product imagery and logos.
- `assets/source/` — source material not imported by the application.
- `docs/` — design specifications, locked site structure, and component registry.

## Commands
```bash
npm ci
npm run dev
npm run build
npm run preview
```
Node.js 18 or newer is required.

## Core Guardrails
- Preserve the user's uncommitted work and unrelated changes.
- **Zero hardcoded copy in JSX**: All user-facing text, section headings, CTAs, button labels, and accessibility aria-labels must be defined under `src/core/constants/<module>/` and imported.
- Keep project content data-driven and avoid unverified claims.
- Reuse real project imagery where available.
- Maintain keyboard access, visible focus, reduced-motion behavior, responsive layouts, and semantic HTML.
- Use theme tokens from `docs/design-system.md` instead of scattering hardcoded visual values.
- Keep motion purposeful and avoid unnecessary continuous animation.
- Keep contact destinations, external project links, and site copy centralized in `src/core/constants/`.
- Verify meaningful changes with `npm test`, `npm run build`, and relevant tests.

## Next Product Milestone
Connect the command center's case-study action to a content-rich WOS flagship case study (`src/pages/projects/wos.jsx`). It should present the problem, Hafiz's role, system architecture, real interfaces, engineering decisions, verified outcomes, and live product surfaces before expanding into services, additional project stories, and conversion sections.
