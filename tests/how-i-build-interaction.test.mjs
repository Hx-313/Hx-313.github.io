import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('HowIBuild component renders four-row layered list and direct narrative copy block', () => {
  const jsx = readFileSync(
    resolve('src/modules/home/presentation/how-i-build/HowIBuild.jsx'),
    'utf8'
  );

  // Section ID & attributes
  assert.match(jsx, /id="how-i-build"/, 'section ID must be how-i-build');
  assert.match(jsx, /aria-labelledby="how-i-build-heading"/, 'must have aria-labelledby');
  assert.match(jsx, /data-section="how-i-build"/, 'must have data-section');

  // Semantic list
  assert.match(jsx, /role="list"/, 'must render role="list"');
  assert.match(jsx, /role="listitem"/, 'must render role="listitem"');
  assert.match(jsx, /\.join\(' · '\)/, 'tools must be joined with middle dot');

  // Copy block
  assert.match(jsx, /howIBuildData\.paragraphs\.map/, 'must render paragraphs');
});

test('how-i-build.css matches About section design tokens and layout rules', () => {
  const css = readFileSync(
    resolve('src/modules/home/presentation/how-i-build/how-i-build.css'),
    'utf8'
  );

  assert.match(css, /scroll-margin-top:\s*var\(--header-offset,\s*4\.5rem\)/, 'must compensate for fixed header');
  assert.match(css, /min-height:\s*100vh/, 'must be min-height 100vh');
  assert.match(css, /font-variant-numeric:\s*lining-nums\s+tabular-nums/, 'must declare lining numerals');
  assert.match(css, /--signal:\s*#3ECF8E/, 'must declare --signal token');
  assert.match(css, /--bg-void:\s*#0A0D0B/, 'must declare --bg-void token');
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, 'must support reduced motion');
});
