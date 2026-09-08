import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const cosmicJsxPath = path.resolve('src/modules/home/presentation/CosmicBackground.jsx');
const cosmicCssPath = path.resolve('src/modules/home/presentation/cosmic-background.css');
const homeJsxPath = path.resolve('src/modules/home/presentation/HomePage.jsx');

test('CosmicBackground component renders a restrained, minimal surface', () => {
  const jsx = fs.readFileSync(cosmicJsxPath, 'utf8');

  assert.match(jsx, /cosmic-ambient-wash/, 'Must render the restrained ambient wash');
  assert.match(jsx, /cosmic-grain/, 'Must render a texture layer');
  assert.doesNotMatch(jsx, /cosmic-tactical-grid/, 'Must remove decorative grids from the background');
  assert.doesNotMatch(jsx, /canvas|cosmic-star|nebula/i, 'Must retire the animated starfield and nebula effects');
});

test('cosmic-background.css defines mature tinted surfaces without neon effects', () => {
  const css = fs.readFileSync(cosmicCssPath, 'utf8');

  assert.match(css, /position:\s*fixed/, 'Must stay fixed across the site');
  assert.match(css, /var\(--color-background\)/, 'Must inherit the theme canvas color');
  assert.match(css, /rgb\(61 112 79 \/ 0\.16\)/, 'Must use the muted forest wash');
  assert.match(css, /cosmic-grain/, 'Must include subtle texture');
  assert.doesNotMatch(css, /#00f2fe|twinkleCosmicStar|nebulaPulsePage/, 'Must not retain cyan or animated cosmic effects');
});

test('HomePage.jsx embeds CosmicBackground for Page 1', () => {
  const homeJsx = fs.readFileSync(homeJsxPath, 'utf8');

  assert.match(homeJsx, /import CosmicBackground/, 'HomePage must import CosmicBackground');
  assert.match(homeJsx, /<CosmicBackground\s*\/>/, 'HomePage must render CosmicBackground');
});
