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
  assert.ok(content.includes('IntersectionObserver'), 'Suspends detailed rendering while the globe is off-screen');
  assert.ok(content.includes('clock.getDelta'), 'Uses frame-time deltas for consistent globe motion');
  assert.ok(content.includes('Math.min(window.devicePixelRatio || 1, 1.5)'), 'Caps render resolution for smooth animation');
});

test('dashboard reuses the hero holographic globe and anchors clear the sticky header', () => {
  const dashboard = readFileSync(resolve('src/modules/home/presentation/command-center/SystemCore.jsx'), 'utf-8');
  const heroCss = readFileSync(resolve('src/modules/home/presentation/hero/hero.css'), 'utf-8');
  const homeCss = readFileSync(resolve('src/modules/home/presentation/home.css'), 'utf-8');

  assert.match(dashboard, /import HolographicGlobe from '\.\.\/hero\/HolographicGlobe\.jsx'/);
  assert.match(dashboard, /<HolographicGlobe/);
  assert.match(dashboard, /system-core--shared-globe/);
  assert.match(heroCss, /min-height:\s*min\(880px, calc\(100dvh - 4\.5rem\)\)/);
  assert.match(homeCss, /\.command-center-portal-section\s*\{[^}]*scroll-margin-top:\s*5rem/s);
});

test('globeData exports hubs, routes, continent polygons, and procedural map texture generator', async () => {
  const { GLOBE_HUBS, GLOBE_ROUTES, CONTINENT_POLYGONS, latLngToVector3 } = await import('../src/modules/home/presentation/hero/globeData.js');

  assert.ok(Array.isArray(GLOBE_HUBS), 'GLOBE_HUBS is an array');
  assert.ok(GLOBE_HUBS.length >= 10, 'Includes global network tech hubs');
  const coreHub = GLOBE_HUBS.find((h) => h.isCore);
  assert.ok(coreHub, 'Defines system core hub');
  assert.equal(coreHub.id, 'lahore', 'Core hub is centered at Lahore');

  assert.ok(Array.isArray(GLOBE_ROUTES), 'GLOBE_ROUTES is an array');
  assert.ok(GLOBE_ROUTES.length >= 8, 'Defines global interconnection routes');

  assert.ok(Array.isArray(CONTINENT_POLYGONS), 'CONTINENT_POLYGONS is an array');
  assert.ok(CONTINENT_POLYGONS.length >= 6, 'Defines world continent geometries');

  const vec = latLngToVector3(0, 0, 1.75);
  assert.ok(typeof vec.x === 'number' && typeof vec.y === 'number' && typeof vec.z === 'number', 'Converts lat/lng to 3D Cartesian coordinates');
});

