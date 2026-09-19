# Certifications Archive Design

## Outcome

Replace the certifications placeholder on the home page with a restrained horizontal archive that presents professional certifications first and lifetime achievements second. The archive should feel like a supporting record of practice, not a second project showcase.

## Visual direction

- Keep the existing section position between Domains and How I Build.
- Use the app's existing display, body, and mono typography roles from the shared theme tokens.
- Use the app's semantic surface, foreground, border, muted, accent, and theme-specific tokens rather than introducing a separate color system.
- Keep the section heading small and consistent with adjacent content sections.
- Present two clearly labeled rails in this order:
  1. Professional certifications
  2. Lifetime achievements
- Each rail scrolls horizontally. On wide screens, several cards are visible at once; on narrow screens, the rail becomes a natural swipe row.
- Cards use the pasted mockup's 4:3 certificate preview, verified marker, issuer mark, metadata row, and quiet credential action.
- The card rail uses gentle `scroll-snap-type: x proximity`; it does not pin to the viewport, expand into a hero, or take over the page like the project showcase.
- Active-card feedback is intentionally small: the most visible card may reveal an attached action pill for opening the credential. This pill contains only an action such as “View credential” and never repeats the card's title, issuer, or date.
- The action pill is also available on hover and keyboard focus. It must not be the only way to reach a credential.
- Do not use slash characters as visible labels or separators. Use spacing, rules, dots, or line breaks where a relationship needs to be shown.

## Information architecture

There is no filter control. The two titled rails provide the organization and preserve the intended progression from professional credentials to lifetime achievements. Both rails always render in sequence, and each record belongs to exactly one category. Professional records are always rendered before lifetime achievements.

Each record has:

- a stable id;
- a category of `professional` or `lifetime`;
- a title;
- issuer or awarding body;
- a date label;
- a short issuer mark;
- a local asset path;
- an optional credential URL;
- a verification state used by the badge.

The local files in `/certifications` are the source artifacts. A small data manifest will map those files to display metadata so the JSX remains declarative and easy to update.

## Component boundaries

Create a focused certifications presentation module:

- `CertificationsSection.jsx` owns the section heading, the two category rails, and shared active-card behavior.
- `CertificationRail.jsx` owns one titled horizontal rail and reports the currently visible card.
- `CertificationCard.jsx` renders a single certificate card and its optional credential action.
- `certificationsData.js` contains the categorized record manifest.
- `certifications.css` contains the section, rail, card, responsive, theme, focus, and reduced-motion styles.

The existing placeholder stylesheet remains available to Testimonials and is not repurposed for the new archive. SectionReveal continues to own the section-level entrance transition; the certification module only handles rail/card interaction.

## Interaction and accessibility

- Use semantic `<section>`, headings, `<article>`, links, and buttons. Do not use click handlers on non-interactive containers.
- Every credential link opens the local PDF or credential URL in a new tab with an accessible label that includes the certificate title.
- Keyboard focus must reveal the same action affordance as pointer hover.
- The rail itself is keyboard-scrollable. Card links must be reachable without requiring drag or precise pointer positioning.
- Use an `IntersectionObserver` scoped to each rail to identify the most visible card for the small action-pill state. The observer is for presentation state only; certificate metadata remains derived from the data manifest.
- If a rail has no records, render a concise, instructive empty state instead of a blank region.
- Respect `prefers-reduced-motion`: disable card translation, rail/card reveal animation, and opacity transitions while preserving focus and content visibility.
- Maintain sufficient focus contrast in both light and dark themes.

## Responsive behavior

- Desktop: rails are full-width within the existing content container, with cards sized to show multiple records and a subtle overflow cue.
- Tablet: preserve the horizontal rail while reducing card width and gap.
- Mobile: cards remain large enough to read, with one primary card and part of the next visible to communicate horizontal continuation.
- The action pill remains attached to the active card and never causes horizontal layout shift.

## Failure and content handling

- Broken or missing local assets must fall back to a themed certificate placeholder rather than collapsing the card.
- Records without a credential URL omit the action pill and remain fully readable.
- Metadata is rendered from the manifest; no runtime network request is required.

## Verification

Implementation is complete when:

- the placeholder is gone and both rails render the local records in the required order;
- the page builds successfully;
- light and dark themes retain readable contrast;
- horizontal scrolling works with mouse, touch, and keyboard;
- the action pill appears on hover, focus, and active-card state without duplicating metadata;
- reduced-motion mode removes non-essential movement;
- the existing automated test suite passes;
- a visual browser check confirms the section does not behave like the project showcase or create layout shift.
