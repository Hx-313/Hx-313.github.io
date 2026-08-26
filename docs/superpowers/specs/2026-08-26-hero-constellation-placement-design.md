# Hero constellation placement design

## Goal

Refine the right-side product constellation on the portfolio home hero to match the supplied visual reference more closely.

## Approved changes

- Move the Pet Care artifact upward within the desktop constellation.
- Move the EPOS artifact upward within the desktop constellation.
- Change the center metric copy from `100K+ COLLECTIVE DOWNLOADS` to `100K+ DOWNLOADS`.
- Keep the metric centered in the circled system area, with enough separation from the HX313 core mark to remain legible.

## Scope and constraints

- Update only the hero constellation presentation and its styles.
- Preserve the existing visual language, animation, interaction, selected-build readout, and unrelated uncommitted work.
- Keep mobile and short-viewport behavior usable; use existing media-query structure rather than introducing a new layout system.
- Do not change artifact data, routing, or project links.

## Implementation direction

Use a small JSX copy edit for the metric and targeted CSS position adjustments for `.artifact--petcare`, `.artifact--epos`, and `.constellation__metric`. Desktop placement should follow the reference first; the existing responsive overrides should be reviewed and adjusted only if the desktop changes create a collision at the current breakpoints.

## Verification

- Run the project checks/build available in the repository.
- Inspect the rendered hero at desktop width and a narrow/mobile width.
- Confirm the metric reads exactly `100K+ DOWNLOADS` and does not overlap the core or artifact labels.
