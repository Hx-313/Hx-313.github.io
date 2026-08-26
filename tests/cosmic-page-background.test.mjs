import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const cosmicJsxPath = path.resolve('src/modules/home/presentation/CosmicBackground.jsx');
const cosmicCssPath = path.resolve('src/modules/home/presentation/cosmic-background.css');
const homeJsxPath = path.resolve('src/modules/home/presentation/HomePage.jsx');

test('CosmicBackground component renders canvas starfield and celestial nebula', () => {
  const jsx = fs.readFileSync(cosmicJsxPath, 'utf8');

  assert.match(jsx, /cosmic-canvas/, 'Must render dynamic starfield canvas');
  assert.match(jsx, /cosmic-nebula-glow/, 'Must render nebula glow');
  assert.match(jsx, /cosmic-star/, 'Must render celestial stars');
});

test('cosmic-background.css defines exact deep-space radial gradients', () => {
  const css = fs.readFileSync(cosmicCssPath, 'utf8');

  assert.match(css, /position:\s*fixed/, 'Must be fixed across Page 1');
  assert.match(css, /rgba\(16,\s*185,\s*129,\s*0\.12\)/, 'Must use emerald cosmic radial gradient');
  assert.match(css, /rgba\(14,\s*116,\s*144,\s*0\.14\)/, 'Must use cyan cosmic radial gradient');
  assert.match(css, /#03070d/, 'Must use deep-space base void color');
  assert.match(css, /nebulaPulsePage/, 'Must include nebula pulse keyframe animation');
});

test('HomePage.jsx embeds CosmicBackground for Page 1', () => {
  const homeJsx = fs.readFileSync(homeJsxPath, 'utf8');

  assert.match(homeJsx, /import CosmicBackground/, 'HomePage must import CosmicBackground');
  assert.match(homeJsx, /<CosmicBackground\s*\/>/, 'HomePage must render CosmicBackground');
});
