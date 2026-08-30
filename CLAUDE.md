# HX313 Portfolio — Project Guide

## Mandatory change tracking

Read `CHANGE.md` before changing the project. Append a dated entry for every source, configuration, dependency, asset, test, or documentation change. Never rewrite historical entries.

## Active application

This repository is a React 18 + Vite portfolio. The active runtime is:

```text
index.html
  -> src/main.jsx
  -> src/app/App.jsx
  -> src/modules/home/presentation/HomePage.jsx
```

Do not reintroduce the retired Astro implementation.

## Product direction

HX313 is Hafiz Ali Abdullah's premium software-engineering portfolio. Its visual language combines an industrial software interface, premium SaaS, aerospace command-center cues, and a restrained futuristic HUD. It must remain professional, legible, accessible, and conversion-oriented rather than resembling a gaming or generic admin dashboard.

The primary audience is potential clients and employers evaluating shipped mobile, SaaS, backend, and product-engineering work.

## Current structure

- `src/app/` — application entry.
- `src/modules/home/` — opening, hero, navigation, command center, and home presentation.
- `src/data/` — projects, activity, technologies, and metrics.
- `src/hooks/` — command-center state.
- `src/shared/theme/` — theme behavior and tokens.
- `src/components/` — shared mascot system.
- `public/assets/` — deployable product imagery and logos.
- `assets/source/` — source material not imported by the application.
- `docs/` — design specifications and implementation history.

## Commands

```bash
npm ci
npm run dev
npm run build
npm run preview
```

Node.js 18 or newer is required.

## Guardrails

- Preserve the user's uncommitted work and unrelated changes.
- Keep project content data-driven and avoid unverified claims.
- Reuse real project imagery where available.
- Maintain keyboard access, visible focus, reduced-motion behavior, responsive layouts, and semantic HTML.
- Use theme tokens instead of scattering hardcoded visual values.
- Keep motion purposeful and avoid unnecessary continuous animation.
- Keep contact destinations and external project links centralized in `src/core/constants.js`.
- Verify meaningful changes with `npm run build` and relevant tests.

## Next product milestone

Connect the command center's case-study action to a content-rich WOS flagship case study. It should present the problem, Hafiz's role, system architecture, real interfaces, engineering decisions, verified outcomes, and live product surfaces before expanding into services, additional project stories, and conversion sections.
