# HX313 System Command Center Design

**Goal:** Replace the current product constellation hero with a responsive, interactive HX313 portfolio command center that communicates systems thinking, shipped products, and premium engineering credibility within the first viewport.

## Design direction

The experience uses an almost-black, green-undertoned visual language with mint-green accents, bold technical typography, 1px borders, restrained HUD details, and generous spacing. It should feel like a premium software studio and aerospace command center rather than a gaming interface, hacker terminal, or generic admin dashboard.

The visual hierarchy is: `A MINDSET BEYOND ORDINARY.` → `SYSTEM COMMAND CENTER` → `WOS — ONLINEORDER.PK ACTIVE SYSTEM` → connected product surfaces → project ecosystem → supporting status, activity, technologies, and proof metrics.

## Experience structure

- Fixed/sticky minimal navigation with HX313 mark, Work/Services/About anchors, System/Light/Dark theme control, and Let's Talk CTA.
- Desktop hero split into a left positioning rail and right command center. The left rail contains the approved HX313 copy, availability status, and technology strip.
- Command center contains a header, WOS system map, four-surface active system panel, project inventory, system status, activity feed, and proof metrics.
- Project selection is stateful. Selecting a project updates the active panel, selected number, image, metadata, system domain highlights, and CTA without immediate navigation.
- Mobile intentionally reflows into Hero → System Core → Active Build → Projects → Status/Activity → Metrics; decorative orbital detail is reduced rather than squeezed.

## Data and component boundaries

Portfolio content lives in focused data modules for projects, technologies, activity, and metrics. Presentation components consume those objects and do not duplicate copy. The command-center state owns the selected project and derives active domains from project data.

The system core is SVG/CSS-first. GSAP is optional for the entry sequence, and existing animation dependencies may be retained only where they provide meaningful value. Reduced-motion mode disables orbiting, scan movement, and entry choreography while preserving readable state transitions.

## Theme behavior

System is the default premium dark mode. Light is a designed light engineering theme rather than a simple inversion. Dark is a deeper monochrome variant. The selected mode persists in localStorage, and System follows `prefers-color-scheme`.

## Quality requirements

- Semantic headings, buttons, links, keyboard project selection, visible focus states, and live updates for selected project details.
- No fake real-time claims; activity is static portfolio storytelling content.
- Reuse supplied project assets, especially the WOS surface screenshots for admin, order terminal, ePOS, and customer web, plus project logos.
- No horizontal overflow at mobile widths; no unnecessary 3D or expensive animation loops.
- Verify production build, console cleanliness, responsive layout, theme switching, reduced motion, and first-viewport hierarchy.
