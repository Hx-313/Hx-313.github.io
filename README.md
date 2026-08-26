# HX313 Portfolio

The personal portfolio of Hafiz Ali Abdullah, presented as a premium software engineering command center. The active experience is a React/Vite application with a WOS — OnlineOrder.pk restaurant technology system as its featured build.

## Stack

- React 18 + JSX
- Vite
- Modern CSS and inline SVG
- Anime.js for the opening/reveal motion
- JavaScript only

## Local development

Requires Node.js 18 or newer.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. Production commands:

```bash
npm run build
npm run preview
```

## Project structure

- `src/app/` — application entry.
- `src/modules/home/` — home presentation, hero, WOS command center, and opening experience.
- `src/data/` — projects, technologies, activity, and proof metrics.
- `src/hooks/` — stateful command-center behavior.
- `src/shared/theme/` — System/Light/Dark theme state and tokens.
- `public/assets/` — deployable images and logos.
- `assets/source/` — original source screenshots and working assets that are not imported by the app.
- `docs/superpowers/` — design specs and sprint plans.
- `docs/design-system/` — the visual reference and implementation prompt used for the command-center direction.

## Deployment

The repository includes a GitHub Pages workflow at `.github/workflows/deploy.yml`.

1. Push the project to GitHub.
2. In repository Settings → Pages, select **GitHub Actions** as the source.
3. Push to `main`; the workflow builds `dist/` and publishes it.

For a project-page repository rather than a `*.github.io` user site, set `VITE_BASE` to `/<repository-name>/` in the workflow or deployment environment. The Vite config already supports this variable.

## Content and assets

Featured system assets are organized under `public/assets/wos/`. Project logos are under `public/assets/logos/`. Keep content claims configurable in `src/data/` and do not add unverified production or real-time system claims.

## Verification

```bash
npm run build
```

The Playwright smoke test is in `tests/system-command-center.py`; it requires Python Playwright to be installed separately.
