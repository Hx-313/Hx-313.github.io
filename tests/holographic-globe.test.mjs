import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('HolographicGlobe component has required canvas lifecycle and accessibility safeguards', () => {
  const content = readFileSync(resolve('src/modules/home/presentation/hero/HolographicGlobe.jsx'), 'utf-8');

  assert.ok(content.includes('canvasRef'), 'Uses canvas reference');
  assert.ok(content.includes('requestAnimationFrame'), 'Uses requestAnimationFrame for 60fps render loop');
  assert.ok(content.includes('cancelAnimationFrame'), 'Cleans up animation frame on unmount');
  assert.ok(content.includes('prefers-reduced-motion'), 'Checks prefers-reduced-motion media query');
  assert.ok(content.includes('ResizeObserver') || content.includes('resize'), 'Handles window or container resize');
  assert.ok(content.includes('aria-label') || content.includes('role="img"'), 'Includes accessibility label for canvas');
});
