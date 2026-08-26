# React Portfolio Foundation Design

## Goal

Replace the current Astro runtime in `portfolio-site` with a pure React + Vite foundation that uses module-based Clean Architecture and establishes the new forest/emerald visual theme without implementing the full portfolio yet.

## Scope

This first stone includes:

- React + Vite application entrypoint.
- Module-based Clean Architecture boundaries.
- A `home` module with a minimal themed shell.
- Shared theme tokens for the approved palette.
- A reusable application shell with header, main content, and footer regions.
- Existing portfolio assets and research notes preserved for later work.

This first stone does not include finished copy, case studies, contact forms, routing beyond the home screen, animations, CMS integration, or migration of every existing Astro component.

## Architecture

The application is organized by business/module boundaries rather than by one global layer folder:

```text
src/
├── app/
│   ├── App.jsx
│   └── routes.jsx
├── modules/
│   └── home/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── presentation/
├── shared/
│   ├── components/
│   ├── theme/
│   ├── hooks/
│   └── utils/
└── main.jsx
```

Dependency direction:

```text
Presentation → Application → Domain
Infrastructure → Domain
```

The home module owns the first screen. Shared code is limited to code that is genuinely reusable across modules. A module must not import another module's internal files; cross-module collaboration will happen through explicit public interfaces later.

## Initial module contract

The `home` module exposes a presentation entrypoint that renders the first portfolio screen. Its initial infrastructure layer supplies static placeholder content through a module-owned source. The UI consumes that content through the module boundary rather than embedding content directly in layout components.

The first screen is intentionally small: brand/header area, a hero foundation, and footer. It is a structural and visual starting point, not the final portfolio homepage.

## Theme

The theme uses CSS custom properties in `shared/theme/tokens.css`:

| Token | Value | Role |
|---|---|---|
| `--color-forest` | `#003B2F` | Primary dark brand surface |
| `--color-emerald` | `#069668` | Primary interactive accent |
| `--color-lime` | `#84F29B` | Highlight and focus accent |
| `--color-ink` | `#15181A` | Text and deep neutral |
| `--color-surface` | `#F8F9FA` | Light surface and contrast field |

Semantic tokens will be defined separately from raw palette tokens so future theme changes do not require editing components.

## Quality requirements

- The app must start with `npm run dev` from `D:\kaggle\portfolio-site`.
- The app must produce a production build with `npm run build`.
- The initial UI must be responsive and keyboard-accessible.
- Theme colors must be applied through tokens, not scattered hardcoded values.
- The first screen must not depend on Astro files or Astro runtime behavior.
- No existing assets will be deleted during this foundation step.

## Migration approach

The existing Astro files remain available as reference during the transition. The React foundation becomes the active runtime through a new Vite entrypoint and React source tree. Existing assets are reused only when a later module needs them; the first shell stays lightweight so we can validate architecture and theme before porting visual sections.

