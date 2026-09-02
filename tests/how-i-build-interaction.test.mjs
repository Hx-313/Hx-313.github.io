import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('DisciplineControllers and HowIBuild implement complete WAI-ARIA tabs contract and automatic activation', () => {
  const tablistJsx = readFileSync(
    resolve('src/modules/home/presentation/how-i-build/DisciplineControllers.jsx'),
    'utf8'
  );
  const rootJsx = readFileSync(
    resolve('src/modules/home/presentation/how-i-build/HowIBuild.jsx'),
    'utf8'
  );

  // Tablist structure
  assert.match(tablistJsx, /role="tablist"/, 'must have role="tablist"');
  assert.match(tablistJsx, /aria-label="Engineering disciplines"/, 'tablist must have aria-label');

  // Tab items
  assert.match(tablistJsx, /role="tab"/, 'tabs must have role="tab"');
  assert.match(tablistJsx, /aria-selected=\{isActive\}/, 'tabs must have aria-selected');
  assert.match(tablistJsx, /aria-controls="discipline-panel"/, 'tabs must link to panel with aria-controls');
  assert.match(tablistJsx, /tabIndex=\{isActive \? 0 : -1\}/, 'tabs must use roving tabIndex');

  // Tabpanel in unified console
  assert.match(rootJsx, /role="tabpanel"/, 'must render role="tabpanel"');
  assert.match(rootJsx, /id="discipline-panel"/, 'panel must have id="discipline-panel"');
  assert.match(rootJsx, /aria-labelledby=\{`discipline-tab-\${activeDiscipline\.id}`\}/, 'panel must reference active tab ID');
  assert.match(rootJsx, /tabIndex=\{0\}/, 'panel must be focusable with tabIndex={0}');

  // Keyboard navigation
  assert.match(tablistJsx, /ArrowRight/, 'must handle ArrowRight');
  assert.match(tablistJsx, /ArrowLeft/, 'must handle ArrowLeft');
  assert.match(tablistJsx, /Home/, 'must handle Home key');
  assert.match(tablistJsx, /End/, 'must handle End key');
});

test('SystemBlueprint renders 3 delivery tiers with accessible nodes and opacity states', () => {
  const jsx = readFileSync(
    resolve('src/modules/home/presentation/how-i-build/SystemBlueprint.jsx'),
    'utf8'
  );

  assert.match(jsx, /systemLayers\.map/, 'must dynamically map systemLayers');
  assert.match(jsx, /blueprint-node/, 'must render blueprint nodes');
  assert.match(jsx, /is-active/, 'must calculate active status');
  assert.match(jsx, /is-related/, 'must calculate related status');
  assert.match(jsx, /is-unrelated/, 'must calculate unrelated status');
  assert.match(jsx, /<DataBusOverlay/, 'must embed DataBusOverlay');
});

test('DataBusOverlay marks SVG as aria-hidden and respects prefers-reduced-motion in JS', () => {
  const jsx = readFileSync(
    resolve('src/modules/home/presentation/how-i-build/DataBusOverlay.jsx'),
    'utf8'
  );

  assert.match(jsx, /aria-hidden="true"/, 'SVG must be aria-hidden');
  assert.match(jsx, /prefers-reduced-motion/, 'must check prefers-reduced-motion before pulsing');
});

test('how-i-build.css defines scroll margin, non-disappearing node focus, and reduced-motion rules', () => {
  const css = readFileSync(
    resolve('src/modules/home/presentation/how-i-build/how-i-build.css'),
    'utf8'
  );

  assert.match(css, /scroll-margin-top:\s*var\(--header-offset,\s*4\.5rem\)/, 'must compensate for fixed header');
  assert.match(css, /\.blueprint-node\.is-active/, 'must style active nodes');
  assert.match(css, /\.blueprint-node\.is-related/, 'must style related nodes');
  assert.match(css, /\.blueprint-node\.is-unrelated/, 'must style unrelated nodes');
  assert.match(css, /opacity:\s*1/, 'active nodes must have full opacity');
  assert.doesNotMatch(css, /\.blueprint-node\.is-unrelated\s*\{[^}]*display:\s*none/, 'unrelated nodes must never be hidden with display:none');
  assert.match(css, /\.databus-overlay\s*\{[^}]*position:\s*absolute/, 'databus-overlay must be absolutely positioned to prevent empty space');
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, 'must support reduced motion');
});

test('HowIBuild root component renders 3 visual beats and bridges to #systems', () => {
  const jsx = readFileSync(
    resolve('src/modules/home/presentation/how-i-build/HowIBuild.jsx'),
    'utf8'
  );

  assert.match(jsx, /id="how-i-build"/, 'section ID must be how-i-build');
  assert.match(jsx, /02 \/\/ \{howIBuildContent\.kicker\}/, 'must display chapter badge');
  assert.match(jsx, /<SystemBlueprint/, 'must embed SystemBlueprint');
  assert.match(jsx, /<DisciplineControllers/, 'must embed DisciplineControllers');
  assert.match(jsx, /howIBuildContent\.bridgeCta\.href/, 'must link bridge CTA to #systems');
});
