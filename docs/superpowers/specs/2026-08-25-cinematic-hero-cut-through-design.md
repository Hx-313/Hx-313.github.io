# Cinematic Hero Cut-Through Design

## Context

The portfolio's opening statements currently behave like a separate full-screen intro. The final statement fades into a long blackout, while the home experience waits behind it and then fades upward. This creates a perceptible gap between the opening and the actual portfolio.

The surface is a client- and employer-facing portfolio. Its visual register is modern and cinematic, but the opening must communicate capability quickly and keep the hero content as the primary focus.

## Goal

Make the opening statements and home hero feel like one continuous cinematic sequence. The final handoff should feel as quick and smooth as a blink, with a target duration of about 260ms and an upper ceiling of 320ms.

## Chosen approach: cinematic cut-through

Keep all three statements and tighten their pacing. After the final statement, allow a short 100–150ms breathing pause so it lands. Then:

1. The final statement compresses slightly and loses opacity.
2. The opening light field converges subtly toward the center while the opening layer compresses away.
3. There is no black or blank intermediate frame.
4. The home/hero layer is already positioned underneath and begins revealing during the final 100–150ms.
5. The hero and atmosphere drift upward by a small amount as the opening exits.

Motion should use compositor-friendly `transform` and `opacity` wherever possible. Background effects may use opacity, scale, and filter only when they remain subtle and do not compromise readability.

## Visual treatment

- Add a soft emerald atmospheric glow to the opening and hero relationship.
- Add a deep vignette to focus attention on the statement and hero content.
- Use an extremely fine scan/grain texture with low opacity.
- Keep ambient movement almost imperceptible.
- Preserve the existing dark/green visual language and theme support.
- Maintain typography hierarchy: muted setup/context, lime bold primary statement, quieter supporting copy.

## Component responsibilities

### `OpeningExperience`

- Own statement sequencing and the final cut-through state.
- Start the completion callback at the point where the hero reveal should overlap, not after a long blackout.
- Keep skip behavior immediate and safe against duplicate completion.
- Keep reduced-motion completion immediate/minimal.

### `HomePage`

- Keep the hero mounted under the opening layer.
- Replace the current long dismissal delay with a value aligned to the cut-through duration.
- Allow the site experience to begin its reveal as soon as the final opening state begins.

### Opening and hero CSS

- Replace the blackout/visibility transition with a short transform/opacity cut-through.
- Add atmospheric depth using existing design tokens and pseudo-elements.
- Keep layout stable; do not animate layout properties.
- Add explicit reduced-motion overrides for the new states.

## Timing contract

- Final statement hold: 100–150ms before cut-through begins.
- Cut-through: target 260ms, never more than 320ms.
- Hero reveal overlap: begins during the final 100–150ms of cut-through.
- Hero content entrance: may continue gently after the layer handoff, but should not delay usability.

## Accessibility and resilience

- Under `prefers-reduced-motion: reduce`, skip character and cinematic movement, reveal the home experience statically, and keep content immediately usable.
- Preserve the existing skip control and semantic `aria-live` statement region.
- Ensure the opening cannot remain mounted indefinitely if animation callbacks are interrupted.
- Avoid luminance flashes and high-frequency visual effects.

## Verification

- Run a production build.
- Verify the final statement-to-hero handoff has no visible blank/black frame.
- Check desktop and mobile layouts.
- Check light and dark themes.
- Check reduced-motion behavior.
- Confirm the hero remains readable and interactive as soon as the reveal begins.
