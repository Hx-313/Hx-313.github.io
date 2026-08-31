# Cinematic Globe and Mascot Intro Design

## Status

Approved for implementation planning on 2026-08-31.

## Goal

Create a single continuous opening sequence that begins with the connected globe as the dominant image, introduces Dash and Aero from behind it, lets the mascots present three statements through hand-emitted holograms, then follows them downward into the existing portfolio hero without a blackout or disconnected page transition.

The experience must preserve the supplied narrative order:

1. The globe establishes the world.
2. Dash and Aero emerge from behind it.
3. The globe recedes as the mascots move forward.
4. Dash presents `IDEAS NEED STRUCTURE.`
5. Aero presents `PRODUCTS NEED MOMENTUM.`
6. Dash presents `MOMENTUM NEEDS CONVICTION.`
7. Both mascots share focus.
8. They descend and lead into the portfolio.

## Audience and Design Read

The audience is hiring managers and potential clients evaluating Hafiz Ali Abdullah's engineering, product, and design judgment. The intro should communicate confidence and technical authorship without delaying access to the portfolio or resembling a generic loading screen.

Design direction: a cinematic systems-world built from the existing dark engineering atmosphere, connected globe, emerald accent, and Aero and Dash mascot designs.

Design dials:

- `DESIGN_VARIANCE: 8`
- `MOTION_INTENSITY: 9`
- `VISUAL_DENSITY: 4`

The sequence can be visually ambitious, but every frame has one dominant subject and the three statements remain immediately readable.

## Chosen Architecture

Use one imperative anime.js timeline scoped to the opening component. React owns mounting, semantic state, skip behavior, reduced-motion selection, and completion. Anime.js owns visual interpolation and sequencing.

This approach is preferred over a Three.js rebuild because the existing SVG globe and mascot components already provide the required visual identity. It is preferred over independent CSS timers because the brief requires predictable synchronization, attached holograms, coordinated focus changes, and reliable cleanup.

The timeline will animate refs and scoped selectors rather than updating React state on every frame. React state may expose only coarse semantic phases when needed for accessibility or testing.

## Component Boundaries

### `OpeningExperience`

Owns the complete timeline and the semantic lifecycle:

- initializes the standard or reduced-motion path
- creates one anime.js timeline
- pauses and resumes for document visibility
- handles skip and completion exactly once
- cleans up animations, animation frames, observers, and timers on unmount
- exposes the current statement through one polite live region

It will not contain unrelated hero or navigation logic.

### `OpeningNetworkGlobe`

Keeps the current connected-Earth treatment and remains the environmental anchor throughout the sequence. Its groups receive stable class names or refs for atmosphere, network, core, and orbit animation.

The globe will have explicit visual states for:

- dominant close view
- mascot emergence
- receded environmental anchor
- subtle response during the final statement
- upward departure during the hero handoff

### Mascot Stage Wrappers

The existing `AeroMascot` and `DashMascot` artwork remains intact. Each opening-only wrapper owns:

- the mascot render
- an emitter anchored at the mascot's hand position
- projection particles or a short beam
- the mascot-specific hologram
- local light spill affecting the mascot edge

Because the emitter and hologram live inside the moving wrapper, they remain attached as the mascot changes position and scale. Minimal stable hooks may be added to the mascot SVG arm groups so the gesture can rotate independently without redesigning the character.

### Holographic Statement

Each mascot receives a related but distinct projection behavior:

- Dash constructs upward from the palm with a compact beam, vertical frame build, and scan pass.
- Aero unfolds horizontally with a smoother arm arc and lateral frame expansion.
- Dash's final projection is slightly wider and receives a restrained globe-core response.

The holograms use thin geometry, one translucent spatial surface, a small number of particles, and subtle technical markings. They do not become generic webpage cards or dense cyberpunk dashboards.

### Hero Handoff

The existing site experience remains mounted beneath the intro. Near the end of the timeline:

- the hero begins moving from a recessed, softly blurred state into its final position
- the intro environment moves upward
- the mascots descend toward the lower viewport edge
- shared particles visually bridge the two layers
- pointer and accessibility gating switch only when the hero is ready
- the opening unmounts after the overlap is complete

No intermediate black frame is introduced.

## Layering and Occlusion

The opening uses a documented layer order rather than arbitrary z-index values:

1. ambient field
2. distant glow
3. mascots while hidden behind the globe
4. globe body
5. foreground mascots after the silhouette crossing
6. hand emitters and projection particles
7. holographic statements
8. foreground atmosphere and skip control

Mascots begin below and behind the globe. Their paths curve around the left and right silhouette. At the moment each mascot clears the visible edge, its wrapper changes to the foreground layer. The layer change is discrete, but it occurs while the mascot is outside the globe silhouette so the visual motion remains continuous.

## Timeline

The standard timeline targets approximately 10 seconds:

| Time | Beat | Dominant subject |
| --- | --- | --- |
| 0.0-1.2s | Globe establishes scale, atmosphere, and network activity | Globe |
| 1.2-2.6s | Dash and Aero become visible from behind opposite sides | Globe, then mascots |
| 2.6-3.6s | Mascots rise forward while the globe recedes | Mascots |
| 3.6-5.0s | Dash gesture and first projection | Dash and statement 1 |
| 5.0-6.4s | Energy passes to Aero and the second projection unfolds | Aero and statement 2 |
| 6.4-7.8s | Globe trace leads focus back to Dash and the final statement | Dash and statement 3 |
| 7.8-8.7s | Projection resolves into a shared connection and equal focus | Dash and Aero |
| 8.7-10.0s | Mascots descend while the hero enters underneath | Transition into portfolio |

The exact offsets may be tuned during browser verification, but narrative order and reading time will not change.

## Motion Language

- Use transform, opacity, and carefully bounded filter changes.
- Use curved paths or coordinated x/y keyframes for mascot travel.
- Use exponential or quintic easing for camera and focus transitions.
- Avoid bounce, elastic movement, large rotations, and layout-property animation.
- Use blur only for brief depth cues and avoid stacking broad backdrop filters.
- Keep ambient loops lightweight and pause them when the document is hidden.

Every motion communicates hierarchy, storytelling, or state change. There is no decorative animation that competes with the current speaker.

## Responsive Composition

### Large desktop and laptop

Use the full left and right emergence paths. Holograms can sit between each mascot and the central globe while maintaining readable line length.

### Tablet

Reduce mascot separation and globe scale. Keep projection frames narrower and move them closer to their emitter.

### Mobile

Recompose instead of scaling the desktop stage:

- globe occupies the upper region
- Dash and Aero emerge into left and right middle positions
- the active hologram uses a shared readable lower stage while its beam remains visibly connected to the active hand
- statements never scroll horizontally or clip
- skip remains reachable outside device safe areas

## Reduced Motion

For `prefers-reduced-motion: reduce`:

- remove the close camera move, sweeping parallax, long travel paths, and orbit acceleration
- show the globe briefly in a stable composition
- reveal both mascots with short fades and small translations
- present the three statements sequentially with restrained crossfades
- move directly into the hero through a short overlapping dissolve

The story remains understandable and the same text order is preserved.

## Interaction and Accessibility

- Provide a keyboard-focusable skip button at all times.
- Skip and natural completion call the completion handler only once.
- Keep the hidden site inert and excluded from assistive navigation until the handoff begins.
- Use one polite, atomic live region for statement changes.
- Treat decorative globe, particles, beams, and intro-only mascot copies as hidden from assistive technology.
- Preserve visible focus treatment and adequate text contrast.
- Do not autoplay audio.

## Performance and Failure Handling

- Do not trigger React renders on animation frames.
- Keep particle counts bounded and scale them down for mobile.
- Resize the canvas at device-appropriate resolution with a capped device-pixel ratio.
- Stop animation frames and timeline work when the document is hidden.
- Clean up resize and visibility listeners on unmount.
- If canvas is unavailable, the SVG and CSS layers still provide a complete visual sequence.
- If reduced-motion detection or timeline setup fails, reveal the hero immediately rather than trapping the visitor.

## Files Expected to Change

The implementation should remain focused on:

- `src/modules/home/presentation/opening/OpeningExperience.jsx`
- `src/modules/home/presentation/opening/OpeningNetworkGlobe.jsx`
- `src/modules/home/presentation/opening/opening.css`
- `src/modules/home/presentation/HomePage.jsx`
- `src/modules/home/presentation/home.css`
- minimal gesture hooks in `src/components/mascots/DashMascot.jsx`
- minimal gesture hooks in `src/components/mascots/AeroMascot.jsx`
- focused opening and browser tests

Existing unrelated portfolio sections, routes, content, mascot dialogue behavior, and project data remain out of scope.

## Verification

Implementation verification will include:

- unit or source-structure tests for the Dash, Aero, Dash statement order
- tests for a single controlled anime.js timeline and cleanup
- tests for reduced-motion behavior and one-shot completion
- tests for skip accessibility and hidden-content gating
- responsive browser screenshots at desktop, laptop, tablet, and mobile widths
- a browser test confirming that the hero becomes visible before the opening unmounts
- a browser test confirming there is no black intermediate frame
- visual confirmation that each projection remains attached to its mascot's hand
- production build and the existing repository test suite

## Definition of Done

The work is complete when the supplied narrative hierarchy is visible without explanation, all three statements have adequate reading time, focus transfers through depth and lighting rather than opacity alone, the two mascots share a final beat, and their descent visibly carries the visitor into the already interactive portfolio hero.
