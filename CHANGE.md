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
