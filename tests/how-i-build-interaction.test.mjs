import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('HowIBuild component renders mirrored copy and 3x4 tool grid', () => {
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
  assert.match(jsx, /howIBuildData\.tools\.map/, 'must render every tool tile');
  assert.match(jsx, /className="tile-icon-wrap"/, 'each tile must render an icon wrapper');
  assert.match(jsx, /className="tile-name"/, 'each tile must render a bold tool name');
  assert.match(jsx, /className="tile-description"/, 'each tile must render a description');
  assert.match(jsx, /className="how-i-build-grid"/, 'tool grid must be a dedicated right-column surface');
  assert.match(jsx, /className="how-i-build-tags"/, 'scope tags must remain below the copy');
  assert.match(jsx, /type="button"/, 'scope tags must be keyboard and pointer clickable buttons');
  assert.match(jsx, /aria-pressed=\{isActive\}/, 'scope tags must expose their active state');
  assert.match(jsx, /how-i-build-sparkles/, 'scope tags must render a sparkle burst layer');
  assert.match(jsx, /onClick=\{handleClick\}/, 'scope tags must toggle on activation');

  // Copy block
  assert.match(jsx, /howIBuildData\.paragraphs\.map/, 'must render paragraphs');
});

test('ToolIcons maps every tool to a real brand icon component', () => {
  const icons = readFileSync(
    resolve('src/modules/home/presentation/how-i-build/ToolIcons.jsx'),
    'utf8'
  );

  assert.match(icons, /from 'react-icons\/si'/, 'must use Simple Icons brand marks');
  assert.match(icons, /from 'react-icons\/vsc'/, 'must use the VS Code icon set');
  assert.match(icons, /tool-icon--\$\{name\}/, 'must expose a per-brand class for icon colors');
  assert.match(icons, /function FirebaseLogo/, 'must use the full-color Firebase logomark');
  assert.match(icons, /function SlackLogo/, 'must use the full-color Slack logomark');
  assert.match(icons, /function PostmanInsomniaLogo/, 'must combine both API tool marks');
  assert.match(icons, /SiInsomnia/, 'must include the Insomnia brand mark');
  assert.doesNotMatch(icons, /SiFirebase|FaSlack/, 'Firebase and Slack must not use monochrome substitutes');

  for (const name of [
    'flutter',
    'android',
    'firebase',
    'nodejs',
    'mongodb',
    'sqlite',
    'vercel',
    'hostinger',
    'github',
    'vscode',
    'postman',
    'slack',
  ]) {
    assert.match(icons, new RegExp(`\\b${name}:`), `${name} must have a brand icon mapping`);
  }

  for (const color of ['#FFC400', '#FF9100', '#DD2C00', '#E01E5A', '#36C5F0', '#2EB67D', '#ECB22E']) {
    assert.match(icons, new RegExp(color), `${color} must be present in the full-color marks`);
  }
});

test('how-i-build.css matches About section design tokens and layout rules', () => {
  const css = readFileSync(
    resolve('src/modules/home/presentation/how-i-build/how-i-build.css'),
    'utf8'
  );

  assert.match(css, /scroll-margin-top:\s*var\(--header-offset,\s*4\.5rem\)/, 'must compensate for fixed header');
  assert.match(css, /min-height:\s*100vh/, 'must be min-height 100vh');
  assert.match(css, /grid-template-columns:\s*minmax\(0,\s*0\.78fr\)\s+minmax\(0,\s*1\.22fr\)/, 'must mirror the grid to the right of the copy');
  assert.match(css, /\.how-i-build-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/, 'must use three grid columns');
  assert.match(css, /\.how-i-build-grid\s*\{[\s\S]*position:\s*relative/, 'grid must support subtle decoration');
  assert.match(css, /radial-gradient\(/, 'grid must have a restrained ambient glow');
  assert.match(css, /\.how-i-build-grid::before\s*\{/, 'grid must have a quiet inset frame');
  assert.match(css, /\.how-i-build-tile\s*\{[\s\S]*border-bottom:/, 'tiles must have horizontal divider lines');
  assert.match(css, /\.how-i-build-tile:hover\s*\{/, 'tiles must have a restrained hover surface');
  assert.match(css, /\.how-i-build-tile:hover::before\s*\{/, 'tiles must have a quiet hover accent');
  assert.match(css, /\.how-i-build-tile:not\(:nth-child\(3n\)\)/, 'tiles must have column divider lines');
  assert.match(css, /\.how-i-build-tag\s*\{[\s\S]*border:/, 'tags must remain bordered pills');
  assert.match(css, /\.how-i-build-tag:hover/, 'tags must have an interactive hover state');
  assert.match(css, /\.how-i-build-tag:focus-visible/, 'tags must have a keyboard focus state');
  assert.match(css, /@keyframes\s+how-i-build-sparkle-burst/, 'tags must define a sparkle burst');
  assert.match(css, /\.how-i-build-sparkle\s*\{/, 'sparkle particles must be styled');
  assert.match(css, /\.tool-icon--postman-insomnia\s*\{/, 'Postman and Insomnia must share an overlapping icon wrapper');
  assert.match(css, /\.tool-sub-icon--postman\s*\{/, 'Postman must have its own layer');
  assert.match(css, /\.tool-sub-icon--insomnia\s*\{/, 'Insomnia must have its own overlapping layer');
  assert.doesNotMatch(css, /\.tile-icon-wrap\s*\{[\s\S]*color:\s*var\(--signal\)/, 'icons must not inherit the theme accent');
  for (const color of ['#54C5F8', '#5FA04E', '#47A248', '#673DE6', '#007ACC', '#FF6C37']) {
    assert.match(css, new RegExp(color), `${color} must be represented in the brand icon palette`);
  }
  assert.match(css, /font-variant-numeric:\s*lining-nums\s+tabular-nums/, 'must declare lining numerals');
  assert.match(css, /--signal:\s*#3ECF8E/, 'must declare --signal token');
  assert.match(css, /--bg-void:\s*#0A0D0B/, 'must declare --bg-void token');
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, 'must support reduced motion');
});
