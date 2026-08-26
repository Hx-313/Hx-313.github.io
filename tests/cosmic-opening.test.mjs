import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const openingJsxPath = path.resolve('src/modules/home/presentation/opening/OpeningExperience.jsx');
const openingCssPath = path.resolve('src/modules/home/presentation/opening/opening.css');
const aeroJsxPath = path.resolve('src/components/mascots/AeroMascot.jsx');

test('OpeningExperience contains cosmic 3-statement sequence and starfield background', () => {
  const jsx = fs.readFileSync(openingJsxPath, 'utf8');

  // 3 Statements Check
  assert.match(jsx, /IDEAS NEED STRUCTURE\./, 'Statement 1 must be present');
  assert.match(jsx, /PRODUCTS NEED MOMENTUM\./, 'Statement 2 must be present');
  assert.match(jsx, /MOMENTUM NEEDS CONVICTION\./, 'Statement 3 must be present');

  // Starfield & Space Elements
  assert.match(jsx, /space-star-canvas/, 'Must render dynamic starfield canvas');
  assert.match(jsx, /celestial-star/, 'Must render celestial stars');
  assert.match(jsx, /space-loader-panel/, 'Must render space loader panel');
  assert.match(jsx, /space-skip-btn/, 'Must render skip button');
});

test('opening.css defines space animations and transition constraints', () => {
  const css = fs.readFileSync(openingCssPath, 'utf8');

  assert.match(css, /spaceWarpIn/, 'Must define space warp in keyframe animation');
  assert.match(css, /spaceWarpOut/, 'Must define space warp out keyframe animation');
  assert.match(css, /spaceFloat/, 'Must define space float animation');
  assert.match(css, /transition:\s*opacity\s*280ms/, 'Opening transition duration must be within budget');
});

test('Aero robot mascot includes high-definition robot design features', () => {
  const jsx = fs.readFileSync(aeroJsxPath, 'utf8');

  assert.match(jsx, /aeroHaloGrad|Halo/, 'Must include glowing halo ring');
  assert.match(jsx, /aeroBodyGrad|Titanium|Obsidian/, 'Must include titanium / obsidian sphere shading');
  assert.match(jsx, /aeroEarGrad|Ear/, 'Must include cybernetic ear pods');
  assert.match(jsx, /aeroVisorGrad|Visor/, 'Must include glass visor face');
  assert.match(jsx, /Hx313/, 'Must include Hx313 insignia');
  assert.match(jsx, /aeroGlow/, 'Must include intense cyber glow filter');
});
