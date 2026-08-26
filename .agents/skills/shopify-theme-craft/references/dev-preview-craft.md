# Dev-preview craft

> Audience: `shopify-theme-decorator` sub-agent.
> Sub-agent-side operational craft for theme surface discovery, precise theme
> file writes, checksum/content verification, and rare full-tree workflows.
>
> **Distinct from** the **main Agent's** preview-gate procedure, which lives in
> `../../shopify-storefront-validate/SKILL.md` mode `admin_preview` (the
> `?preview_theme_id=` URL, screenshot self-check, publish approval). This file
> is the sub-agent's own theme-file craft, not the main Agent's gate.

## §1 Default workflow: surface discovery first, then precise write

Theme decoration is a theme-graph problem, not a single-file problem. The default
execution path is:

1. Build a **surface map** before editing:
   - owning `templates/*.json` or section group file
   - existing section instances and `order` array
   - relevant `sections/*.liquid`
   - referenced `snippets/*`
   - relevant `assets/*.css` / theme CSS
   - `layout/theme.liquid`
   - `config/settings_data.json` when settings or app embeds matter
2. Decide and record the **change plan**: added files, modified files, removed /
   replaced section ids, and expected rendered section count.
3. Write only the planned changed files with `themeFilesUpsert`.
4. Re-read the touched files through `themeFiles` and verify checksum/content.
5. Validate the rendered admin preview and report browser visual evidence.

Do not start by writing a point file. But also do not assume you need a full
local theme tree. Start by reading the files that define the target surface.

## §2 Targeted `themeFiles` discovery

Use Admin GraphQL `themeFiles` to read the smallest file set that gives enough
context to reason about the surface.

For banner / hero / image-with-text / slideshow work, the discovery set usually
includes:

- `templates/index.json` or the owning `templates/*.json`
- section groups such as `sections/header-group.json` when the surface lives in
  the header
- the existing section file(s) referenced by those template instances
- referenced snippets from those section files
- `assets/base.css` and any section/theme CSS that controls layout
- `layout/theme.liquid`
- `config/settings_data.json` when settings or app embeds matter

For each `themeFiles` query, use `shopify-admin search_docs` / `validate` for the
actual query shape. Do not guess read-result fields.

## §3 Precise writes with `themeFilesUpsert`

Use `themeFilesUpsert` for ordinary decoration writes after the change plan is
clear. Typical write set:

- `sections/<brand>-hero.liquid`
- `templates/index.json`
- `sections/header-group.json`
- `config/settings_data.json`
- `assets/<brand>-hero.png` or other uploaded theme assets

Write text files with the correct body type and binary/remote assets with the
correct URL body type. After each batch, re-read the exact filenames with
`themeFiles` and verify the remote content/checksum. `userErrors: []` alone is
not proof that the intended files are present.

## §4 Rare full-tree `theme pull/push` exceptions

`theme pull` / `theme push` are full-tree developer workflows. They are not the
default Agent path. Use them only when all of the following are true:

- targeted `themeFiles` discovery cannot identify the dependency set or cannot
  provide enough context
- a full local theme tree is genuinely required (for example: broad migration,
  cross-template refactor, full theme-check pass over many dependencies, or a
  user-provided local theme project)
- you record why targeted discovery/upsert is insufficient

If you use a full-tree workflow:

- ensure the local path exists under the workspace before pulling
- set a bounded tool timeout via the tool call, not a shell `sleep` watchdog
- if pull/push times out or triggers interactive auth, do not loop retries; fall
  back to targeted `themeFiles` reads/writes or return a blocked report
- push only the logical change set and then re-read remote files/checksums

## §5 Theme check triage

Run theme check when you have a local tree or when the changed files can be
validated locally:

```bash
shopify theme check --path <local-theme-dir> --fail-level error --output json --no-color
```

Blocking:

- Liquid syntax errors
- invalid section schema
- missing snippets/assets referenced by changed files
- JSON parse errors in changed templates / settings files

Non-blocking but must be reported:

- suggestions outside the changed files
- pre-existing warnings that were not introduced by this run
- validation unavailable because local dependencies are missing

## §6 Remote verification after write

After writing, re-read exactly the files you changed:

- `templates/index.json` / owning template JSON: section ids + `order`
- changed `sections/*.liquid`
- changed `assets/*`
- changed `config/settings_data.json` / section group JSON

For banners/heroes, also verify the rendered DOM count in the admin preview:
expected hero/banner count, no default duplicate, content-edge alignment, and
browser screenshots per `shopify-storefront-validate`.
