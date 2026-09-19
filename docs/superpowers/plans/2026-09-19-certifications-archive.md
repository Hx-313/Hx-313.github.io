# Certifications Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the certifications placeholder with a theme-aware, horizontally scrolling archive that presents professional certifications before lifetime achievements without behaving like the project showcase.

**Architecture:** Keep the existing `CertificationsSection` entry point and split the new UI into a data manifest, a rail component, and a card component. The manifest keeps preview references separate from document references; each rail owns local active-card state through an `IntersectionObserver`, while CSS handles the quiet attached credential action and responsive overflow.

**Tech Stack:** React 18 function components, Vite asset URLs, CSS custom properties from `src/shared/theme/tokens.css`, browser `IntersectionObserver`, Node's built-in test runner, and the repository's existing Playwright smoke-test tooling.

## Global Constraints

- The archive has no filter control; two titled rails are the organization.
- Professional certifications render before lifetime achievements, and each category uses manifest-array order with no runtime sort.
- Preview image and document reference are separate fields; PDFs are opened as documents and are never passed to `<img>`.
- Records use only `verified` and `documented` statuses; `verified` maps to “Verified” and `documented` maps to “Documented.”
- Use the existing `--color-*`, `--ithx-*`, `--font-*`, `--radius-*`, and `--ease-out` tokens; do not create a second palette.
- Visible compact metadata separators use the middot `·`; visible slash separators are not allowed.
- Missing preview images use a theme-aware inline SVG fallback driven by CSS variables.
- Horizontal rails use `scroll-snap-type: x proximity`, remain non-sticky, and must be keyboard-scrollable.
- Hover, focus, and active-card feedback must expose only the credential action and must not duplicate title, issuer, or date.
- Preserve the user-provided `certifications/` files; do not rename, delete, move, or stage unrelated asset changes.
- Respect `prefers-reduced-motion` and keep visible focus states in both themes.

---

### Task 1: Establish the certification manifest contract

**Files:**
- Create: `tests/certifications.test.mjs`
- Modify: `src/core/constants/certifications/certificationsText.js`
- Create: `src/modules/home/presentation/certifications/certificationsData.js`

**Interfaces:**
- Produces `CERTIFICATION_GROUPS`, an ordered frozen array of `{ id, heading, ariaLabel, records }` groups.
- Produces records with `{ id, category, title, issuer, date, issuerMark, preview, document, status }`.
- `preview` is `{ type: 'image', src, alt }` or `null`.
- `document` is `{ type: 'pdf' | 'url', href }` or `null`.

- [ ] **Step 1: Write the manifest contract tests**

Add tests that import the data module and assert:

```js
test('certification groups preserve professional-first order and immutable records', async () => {
  const { CERTIFICATION_GROUPS } = await import(
    '../src/modules/home/presentation/certifications/certificationsData.js'
  );

  assert.deepEqual(
    CERTIFICATION_GROUPS.map((group) => group.id),
    ['professional', 'lifetime']
  );
  assert.ok(Object.isFrozen(CERTIFICATION_GROUPS));
  assert.ok(CERTIFICATION_GROUPS.every((group) => Object.isFrozen(group.records)));
  assert.ok(CERTIFICATION_GROUPS.every((group) => group.records.length > 0));
  assert.equal(
    CERTIFICATION_GROUPS.flatMap((group) => group.records).length,
    new Set(CERTIFICATION_GROUPS.flatMap((group) => group.records).map((record) => record.id)).size
  );
});

test('records separate image previews from PDF documents and enumerate status values', async () => {
  const { CERTIFICATION_GROUPS } = await import(
    '../src/modules/home/presentation/certifications/certificationsData.js'
  );
  const records = CERTIFICATION_GROUPS.flatMap((group) => group.records);

  assert.ok(records.some((record) => record.preview?.type === 'image'));
  assert.ok(records.some((record) => record.preview === null));
  assert.ok(records.every((record) => ['verified', 'documented'].includes(record.status)));
  assert.ok(records.every((record) => record.document?.type === 'pdf'));
  assert.ok(records.every((record) => record.document?.href));
  assert.ok(records.every((record) => !record.title.includes('/') && !record.issuer.includes('/')));
});
```

- [ ] **Step 2: Run the focused test to confirm it fails**

Run: `node --test tests/certifications.test.mjs`

Expected: FAIL because the new data module and updated copy do not exist yet.

- [ ] **Step 3: Update section copy and define the actual asset manifest**

Replace the placeholder values in `certificationsText.js` with copy for the compact archive heading and rail labels. Keep the existing frozen-object style and use no slash characters in visible text.

Create `certificationsData.js` with one explicit record per logical source artifact. First inspect the first page of each PDF with Poppler so the display title and issuer are grounded in the source files. Use this PowerShell command to create temporary, untracked first-page previews for inspection:

```powershell
$previewDirectory = '.tmp/certification-pages'
$pdftoppm = (Get-Command pdftoppm).Source
New-Item -ItemType Directory -Force -Path $previewDirectory | Out-Null
Get-ChildItem -LiteralPath 'certifications' -Filter '*.pdf' -File | ForEach-Object {
  $outputBase = Join-Path $previewDirectory $_.BaseName
  & $pdftoppm -f 1 -l 1 -singlefile -png -r 96 $_.FullName $outputBase
}
```

Use literal Vite `new URL` expressions so the bundler can discover every file with spaces:

```js
const assets = Object.freeze({
  cert5816324103Pdf: new URL('../../../../../certifications/Cert5816324103.pdf', import.meta.url).href,
  courseraGgPdf: new URL('../../../../../certifications/Coursera GG2Y2MZOL6ZU.pdf', import.meta.url).href,
  courseraGgPreview: new URL('../../../../../certifications/Coursera GG2Y2MZOL6ZU.png', import.meta.url).href,
  courseraTuPdf: new URL('../../../../../certifications/Coursera TUZAVQAMZ1G1.pdf', import.meta.url).href,
  courseraTuPreview: new URL('../../../../../certifications/Coursera TUZAVQAMZ1G1.png', import.meta.url).href,
  navttcPdf: new URL('../../../../../certifications/navttc.pdf', import.meta.url).href,
  sscPdf: new URL('../../../../../certifications/1 pos in ssc1.pdf', import.meta.url).href,
  urduSpeechPdf: new URL('../../../../../certifications/2nd pos in Urdu soeach.pdf', import.meta.url).href,
  icsPdf: new URL('../../../../../certifications/best achievement in ics.pdf', import.meta.url).href,
  readersClubPdf: new URL('../../../../../certifications/g sec of readers club.pdf', import.meta.url).href,
  classSixPdf: new URL('../../../../../certifications/merit in 6 class pos 1.pdf', import.meta.url).href,
  cricketPdf: new URL('../../../../../certifications/participate in cricket.pdf', import.meta.url).href,
  wafaqPdf: new URL('../../../../../certifications/wafaq ul madaris.pdf', import.meta.url).href,
});

const pdf = (href) => ({
  type: 'pdf',
  href,
});

const image = (src, alt) => ({
  type: 'image',
  src,
  alt,
});
```

Use these source files without moving them:

Professional records:

- `Cert5816324103.pdf`
- `Coursera GG2Y2MZOL6ZU.pdf` with `Coursera GG2Y2MZOL6ZU.png` as its preview
- `Coursera TUZAVQAMZ1G1.pdf` with `Coursera TUZAVQAMZ1G1.png` as its preview
- `navttc.pdf`

Lifetime achievement records:

- `1 pos in ssc1.pdf`
- `2nd pos in Urdu soeach.pdf`
- `best achievement in ics.pdf`
- `g sec of readers club.pdf`
- `merit in 6 class pos 1.pdf`
- `participate in cricket.pdf`
- `wafaq ul madaris.pdf`

Use the inspected first-page text to map each record to a clear title and issuer label. Keep all records in explicit manifest order. Mark professional records `verified` only when the artifact contains a certificate identity or issuer evidence; mark school, club, and competition records `documented`. Use `preview: null` when no trusted image preview exists. Do not use the duplicate `Coursera GG2Y2MZOL6ZU-1.png` in the manifest; leave it untouched on disk.

Freeze the record objects, record arrays, groups, and exported group array.

- [ ] **Step 4: Run the focused test to confirm it passes**

Run: `node --test tests/certifications.test.mjs`

Expected: PASS with both groups present, 11 logical records, separate image/PDF fields, and no visible slash characters in metadata.

- [ ] **Step 5: Commit the manifest contract**

```bash
git add src/core/constants/certifications/certificationsText.js src/modules/home/presentation/certifications/certificationsData.js tests/certifications.test.mjs
git commit -m "feat: add certification archive manifest"
```

### Task 2: Build the card preview and credential action

**Files:**
- Create: `src/modules/home/presentation/certifications/CertificationCard.jsx`
- Modify: `tests/certifications.test.mjs`

**Interfaces:**
- Consumes one manifest record plus `isActive`.
- Produces an `<article>` with the certificate preview, status badge, metadata, and an optional document link.

- [ ] **Step 1: Add source-contract tests for the card**

Extend the test file with source checks that require the card to contain:

```js
const cardSource = readFileSync(
  resolve('src/modules/home/presentation/certifications/CertificationCard.jsx'),
  'utf8'
);

assert.match(cardSource, /<article/);
assert.match(cardSource, /preview\?\.type === 'image'/);
assert.match(cardSource, /status === 'verified'/);
assert.match(cardSource, /Verified/);
assert.match(cardSource, /Documented/);
assert.match(cardSource, /target="_blank"/);
assert.match(cardSource, /rel="noreferrer"/);
assert.match(cardSource, /View credential/);
assert.doesNotMatch(cardSource, /Now viewing|NOW VIEWING|\//);
```

- [ ] **Step 2: Run the focused test to confirm the card contract fails**

Run: `node --test tests/certifications.test.mjs`

Expected: FAIL because the card component does not exist.

- [ ] **Step 3: Implement the card with an inline themed fallback**

Implement `CertificationCard({ record, isActive })` with these rules:

- Use a stable `record.id` key at the caller and `data-certification-card={record.id}` on the article.
- Render `record.preview.src` only when `record.preview?.type === 'image'`; use `alt={record.preview.alt}`.
- When there is no image preview, render an inline SVG with `currentColor` and CSS custom properties for paper, line, accent, and ink. Keep it decorative with `aria-hidden="true"`.
- Render the status badge as “Verified” for `verified` and “Documented” for `documented`.
- Render title, issuer mark, issuer, and date once in the card body. Use a `<span aria-hidden="true">·</span>` only when the metadata row has both date and an identifier.
- Render the credential action only when `record.document?.href` exists. Use `target="_blank"`, `rel="noreferrer"`, and an `aria-label` containing the record title.
- Give the action pill `data-active={isActive ? 'true' : 'false'}`; CSS will reveal it for active, hover, and focus states without changing card layout.

- [ ] **Step 4: Run the focused test to confirm the card contract passes**

Run: `node --test tests/certifications.test.mjs`

Expected: PASS for the manifest and card source contract.

- [ ] **Step 5: Commit the card component**

```bash
git add src/modules/home/presentation/certifications/CertificationCard.jsx tests/certifications.test.mjs
git commit -m "feat: add certification card preview"
```

### Task 3: Add horizontal rail behavior and active-card tracking

**Files:**
- Create: `src/modules/home/presentation/certifications/CertificationRail.jsx`
- Modify: `tests/certifications.test.mjs`

**Interfaces:**
- Consumes `{ id, heading, ariaLabel, records }` from `CERTIFICATION_GROUPS`.
- Produces a titled rail with keyboard scrolling and `CertificationCard` children.

- [ ] **Step 1: Add rail behavior contract tests**

Add source assertions for the required interaction primitives:

```js
const railSource = readFileSync(
  resolve('src/modules/home/presentation/certifications/CertificationRail.jsx'),
  'utf8'
);

assert.match(railSource, /IntersectionObserver/);
assert.match(railSource, /scrollIntoView|scrollBy/);
assert.match(railSource, /ArrowLeft/);
assert.match(railSource, /ArrowRight/);
assert.match(railSource, /disconnect\(\)/);
assert.match(railSource, /<CertificationCard/);
assert.doesNotMatch(railSource, /position:\s*sticky|ScrollTrigger/);
```

- [ ] **Step 2: Run the focused test to confirm the rail contract fails**

Run: `node --test tests/certifications.test.mjs`

Expected: FAIL because the rail component does not exist.

- [ ] **Step 3: Implement `CertificationRail`**

Use a `useRef` for the overflow element and `useState(null)` for the active record id. In `useEffect`:

```js
const cards = Array.from(rail.querySelectorAll('[data-certification-card]'));
const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveId(visible.target.dataset.certificationCard);
  },
  { root: rail, threshold: [0.55, 0.75] }
);
cards.forEach((card) => observer.observe(card));
return () => observer.disconnect();
```

Render a `header` with the rail heading, then a `div` with `ref`, `tabIndex={0}`, `role="region"`, and the group `ariaLabel`. On `ArrowLeft` and `ArrowRight`, call `scrollBy({ left: ±Math.round(rail.clientWidth * 0.72), behavior: prefersReducedMotion ? 'auto' : 'smooth' })`. Render cards in the supplied array order and pass `isActive={record.id === activeId}`.

- [ ] **Step 4: Run the focused test to confirm the rail contract passes**

Run: `node --test tests/certifications.test.mjs`

Expected: PASS for manifest, card, and rail contracts.

- [ ] **Step 5: Commit rail behavior**

```bash
git add src/modules/home/presentation/certifications/CertificationRail.jsx tests/certifications.test.mjs
git commit -m "feat: add horizontal certification rails"
```

### Task 4: Replace the placeholder section and wire shared motion

**Files:**
- Modify: `src/modules/home/presentation/certifications/CertificationsSection.jsx`
- Create: `src/modules/home/presentation/certifications/certifications.css`
- Modify: `src/shared/motion/section-motion.css`
- Modify: `tests/certifications.test.mjs`

**Interfaces:**
- `CertificationsSection` imports `CERTIFICATIONS_TEXT`, `CERTIFICATION_GROUPS`, and `CertificationRail`.
- `HomePage.jsx` remains unchanged because it already renders the section in the required location.

- [ ] **Step 1: Add section and style contract tests**

Add assertions that require:

```js
const sectionSource = readFileSync(
  resolve('src/modules/home/presentation/certifications/CertificationsSection.jsx'),
  'utf8'
);
const styles = readFileSync(
  resolve('src/modules/home/presentation/certifications/certifications.css'),
  'utf8'
);

assert.match(sectionSource, /id="certifications"/);
assert.match(sectionSource, /CERTIFICATION_GROUPS/);
assert.match(sectionSource, /<CertificationRail/);
assert.doesNotMatch(sectionSource, /portfolio-placeholder|filter|button/);
assert.match(styles, /overflow-x:\s*auto/);
assert.match(styles, /scroll-snap-type:\s*x\s+proximity/);
assert.match(styles, /var\(--color-surface/);
assert.match(styles, /var\(--color-accent/);
assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
assert.match(styles, /:focus-visible/);
```

- [ ] **Step 2: Run the focused test to confirm the section contract fails**

Run: `node --test tests/certifications.test.mjs`

Expected: FAIL because the placeholder section and stylesheet are still present.

- [ ] **Step 3: Replace the placeholder component**

Render:

```jsx
<section id="certifications" className="certifications-section" aria-labelledby="certifications-heading" data-section="certifications" data-motion="certifications">
  <div className="certifications-container">
    <header className="certifications-header">
      <p className="certifications-kicker">{CERTIFICATIONS_TEXT.kicker}</p>
      <h2 id="certifications-heading" className="certifications-heading">{CERTIFICATIONS_TEXT.heading}</h2>
      <p className="certifications-intro">{CERTIFICATIONS_TEXT.description}</p>
    </header>
    <div className="certifications-rails">
      {CERTIFICATION_GROUPS.map((group) => <CertificationRail key={group.id} group={group} />)}
    </div>
  </div>
</section>
```

Keep the section small-header treatment consistent with the rest of the site; do not reintroduce the old placeholder frame or a filter control.

- [ ] **Step 4: Implement the certification CSS**

Use a `min(1180px, 88vw)` container, compact section padding, a two-column header that collapses to one column under `800px`, and rail/card styles with these requirements:

- `.certification-rail__track` has `display: flex`, `overflow-x: auto`, `scroll-snap-type: x proximity`, `scrollbar-width: thin`, and a safe inline end padding.
- `.certification-card` has a fixed responsive basis such as `clamp(16.75rem, 29vw, 21rem)`, `scroll-snap-align: start`, `background: var(--color-surface)`, `border: 1px solid var(--color-border)`, and a modest radius from `var(--radius-lg)`.
- The preview uses `aspect-ratio: 4 / 3`, paper-like semantic colors, and `object-fit: cover` for supplied PNGs.
- The action pill is absolutely positioned at the lower edge of the preview, hidden by opacity/transform only until hover, focus-within, or `[data-active='true']`; it must not alter card height.
- Use `var(--color-accent)`, `var(--color-accent-foreground)`, and `var(--color-muted-foreground)` for status and quiet metadata.
- Add explicit `:root[data-theme='light']` and `:root[data-theme='dark']` fallback-art overrides only where CSS variables need different illustration contrast.
- Add `@media (max-width: 800px)` and `@media (max-width: 520px)` rules so mobile exposes one full card plus the next card edge without viewport overflow.
- Add `@media (prefers-reduced-motion: reduce)` to remove transforms, transitions, and smooth scroll behavior while leaving the rail usable.

- [ ] **Step 5: Update section-level reveal selectors**

In `src/shared/motion/section-motion.css`, replace placeholder-only selectors with the new `.certifications-header`, `.certification-rail`, and `.certification-card` hooks. Preserve the existing section reveal class and add no sticky or scroll-linked project behavior.

- [ ] **Step 6: Run the focused test to confirm the section contract passes**

Run: `node --test tests/certifications.test.mjs`

Expected: PASS with no placeholder markup, no filter control, horizontal overflow rules, focus styles, and reduced-motion rules.

- [ ] **Step 7: Commit section integration and styles**

```bash
git add src/modules/home/presentation/certifications/CertificationsSection.jsx src/modules/home/presentation/certifications/certifications.css src/shared/motion/section-motion.css tests/certifications.test.mjs
git commit -m "feat: render certifications archive section"
```

### Task 5: Verify themes, rails, asset links, and responsive behavior

**Files:**
- Create: `tests/certifications-horizontal.py`
- Modify: `tests/certifications.test.mjs`

**Interfaces:**
- The visual test consumes the running Vite app and verifies the public behavior without modifying source files.

- [ ] **Step 1: Add the Playwright behavior test**

Create a concise Playwright script that checks the section after the opening experience is skipped:

```python
from playwright.sync_api import expect, sync_playwright

VIEWPORTS = ((1440, 900), (768, 1024), (390, 844))

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://127.0.0.1:4173", wait_until="networkidle")
    page.locator(".space-skip-btn").click()
    expect(page.locator("#certifications")).to_be_visible(timeout=2_000)
    expect(page.locator(".certification-rail")).to_have_count(2)
    expect(page.get_by_role("heading", name="Professional certifications")).to_be_visible()
    expect(page.get_by_role("heading", name="Lifetime achievements")).to_be_visible()
    assert page.locator("button").filter(has_text="Professional").count() == 0
    assert page.locator(".certification-rail__track").first.evaluate("element => element.scrollWidth > element.clientWidth")
    link = page.locator(".certification-card a").first
    expect(link).to_have_attribute("target", "_blank")
    assert link.get_attribute("href")
    page.get_by_role("button", name="Light").click()
    expect(page.locator("html[data-theme=light]")).to_have_count(1)
    page.get_by_role("button", name="Dark").click()
    expect(page.locator("html[data-theme=dark]")).to_have_count(1)
    for width, height in VIEWPORTS:
        page.set_viewport_size({"width": width, "height": height})
        assert page.locator("body").evaluate("element => element.scrollWidth <= window.innerWidth + 1")
    browser.close()
```

Use the class names defined in Task 4: `.certifications-section`, `.certification-rail`, `.certification-rail__track`, and `.certification-card`. Preserve the assertions and do not reintroduce filter behavior.

- [ ] **Step 2: Run automated checks**

Run: `npm test`

Expected: PASS for the existing suite plus the new certification contract tests.

Run: `npm run build`

Expected: Vite completes without unresolved asset imports or chunk errors.

- [ ] **Step 3: Run the visual behavior check**

Run from a second terminal while Vite is serving on port 4173:

```powershell
python tests/certifications-horizontal.py
```

Expected: both rails are visible, the rails overflow horizontally without page-level overflow, both themes render, credential links have document targets, and the filter count remains zero.

- [ ] **Step 4: Check reduced motion**

Run a Playwright context with `reduced_motion="reduce"` and assert the rail still scrolls while computed transition duration is `0s` on `.certification-card` and `.certification-card__action`.

- [ ] **Step 5: Commit verification coverage**

```bash
git add tests/certifications.test.mjs tests/certifications-horizontal.py
git commit -m "test: verify certifications archive behavior"
```

## Plan self-review

- Spec coverage: the plan covers the two-rail information architecture, separate preview/document schema, explicit statuses, middot separator, manifest ordering, themed SVG fallback, semantic links, keyboard scrolling, active-card observer, responsive behavior, reduced motion, light/dark themes, and build/test verification.
- Placeholder scan: no `TBD`, `TODO`, or unbounded implementation step is used; every task names files, interfaces, commands, and expected outcomes.
- Type consistency: `CERTIFICATION_GROUPS` feeds `CertificationRail`, `CertificationRail` passes a manifest record and `isActive` to `CertificationCard`, and the card consumes the documented `preview`, `document`, and `status` shapes.
