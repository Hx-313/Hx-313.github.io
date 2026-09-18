import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { howIBuildData } from '../src/modules/home/presentation/how-i-build/howIBuildData.js';

const componentSource = readFileSync(
  resolve('src/modules/home/presentation/how-i-build/HowIBuild.jsx'),
  'utf8'
);

const stylesheet = readFileSync(
  resolve('src/modules/home/presentation/how-i-build/how-i-build.css'),
  'utf8'
);

test('every capability carries a truthful service mapping for the reveal state', () => {
  assert.equal(howIBuildData.tools.length, 12);
  assert.ok(
    howIBuildData.tools.every((tool) => typeof tool.service === 'string' && tool.service.length > 0),
    'each tool must describe the service it supports'
  );
});

test('capability tiles expose a keyboard and touch-friendly service reveal', () => {
  assert.match(componentSource, /activeToolId/, 'component must track the active capability');
  assert.match(componentSource, /how-i-build-tile-button/, 'tile needs a real interactive control');
  assert.match(componentSource, /aria-expanded=\{isActive\}/, 'tile must expose its reveal state');
  assert.match(componentSource, /tile-service/, 'tile must render the applied service detail');
  assert.match(componentSource, /onClick=\{\(\) => onToggle\(tool\.id\)\}/, 'tile must toggle on activation');
});

test('mobile capability tiles use an elevated surface and preserve reduced motion', () => {
  assert.match(stylesheet, /\.how-i-build-tile-button\s*\{/, 'tile button needs a dedicated surface reset');
  assert.match(stylesheet, /box-shadow:/, 'mobile tiles need depth');
  assert.match(stylesheet, /\.how-i-build-tile\.is-active[\s\S]*\.tile-service/, 'active tiles reveal service copy');
  assert.match(stylesheet, /@media\s*\(max-width:\s*480px\)/, 'mobile-specific card rules must exist');
  assert.match(stylesheet, /min-height:\s*44px/, 'interactive affordance must meet touch target guidance');
  assert.match(stylesheet, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, 'motion must be suppressible');
});
