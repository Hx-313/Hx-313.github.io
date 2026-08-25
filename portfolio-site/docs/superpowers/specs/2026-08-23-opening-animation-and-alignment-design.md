# Opening Animation and Alignment Design

## Goal

Ensure every startup statement runs the same entrance animation, and center the footer and loading indicator across screen sizes.

## Root cause

The statement wrapper retains inline opacity and transform values from the first line's exit animation. Subsequent statement text is rendered inside that same faded wrapper, so its per-character animation runs but is not visible.

## Approach

Key the statement wrapper by `statementIndex`. React will replace the wrapper whenever the next statement begins, clearing exit-animation styles while preserving the existing character-by-character entrance and final exit sequence.

The footer will become a centered, vertical flex group at every breakpoint. The loader will retain its existing viewport-centered placement, with an explicit centered layout for its progress track and percentage.

## Scope and verification

- Modify only the opening experience and home-page styles.
- Preserve reduced-motion behavior and the existing intro timing.
- Confirm all three statements appear, animate character-by-character, hold, and exit.
- Confirm loader and footer contents remain centered at desktop and mobile widths.
