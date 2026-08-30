import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('AeroMascot supports rich bubble payload, action chips, and bottom/top orientation', () => {
  const content = readFileSync(resolve('src/components/mascots/AeroMascot.jsx'), 'utf-8');

  assert.ok(content.includes('bubbleChips'), 'AeroMascot processes interactive quick-action chips');
  assert.ok(content.includes('bubble--bottom'), 'AeroMascot supports bottom-flipped speech bubble');
  assert.ok(content.includes('bubble-audio-wave'), 'AeroMascot includes animated audio wave indicator');
  assert.ok(content.includes('bubble-close-btn'), 'AeroMascot includes message dismiss button');
  assert.ok(content.includes('renderBubbleText'), 'AeroMascot supports rich text bold highlights');
});

test('DashMascot supports rich bubble payload, action chips, and bottom/top orientation', () => {
  const content = readFileSync(resolve('src/components/mascots/DashMascot.jsx'), 'utf-8');

  assert.ok(content.includes('bubbleChips'), 'DashMascot processes interactive quick-action chips');
  assert.ok(content.includes('bubble--bottom'), 'DashMascot supports bottom-flipped speech bubble');
  assert.ok(content.includes('bubble-audio-wave'), 'DashMascot includes animated audio wave indicator');
  assert.ok(content.includes('bubble-close-btn'), 'DashMascot includes message dismiss button');
  assert.ok(content.includes('renderBubbleText'), 'DashMascot supports rich text bold highlights');
});

test('Mascots component has non-conflicting hero positions and warm interactive greetings', () => {
  const content = readFileSync(resolve('src/components/Mascots.jsx'), 'utf-8');

  assert.ok(content.includes('HERO_GREETINGS'), 'Includes warm welcome greeting sequences');
  assert.ok(content.includes('handleChipAction'), 'Includes interactive chip click handler');
  assert.ok(content.includes('handleAeroClick'), 'Includes direct click interactive dialogue for Aero');
  assert.ok(content.includes('handleDashClick'), 'Includes direct click interactive dialogue for Dash');
  assert.ok(content.includes('isAeroBottom'), 'Includes viewport awareness to flip bubbles when near top');
  assert.ok(content.includes('PAGE_ZONES'), 'Defines safe visual stage roaming waypoints');
});

test('CSS styles provide proper dialog sizing, no squashing, and light theme support', () => {
  const mascotsCss = readFileSync(resolve('src/styles/mascots.css'), 'utf-8');
  const heroCss = readFileSync(resolve('src/modules/home/presentation/hero/hero.css'), 'utf-8');

  // Verify hero.css does not have conflicting nowrap or top: -24px rules
  assert.ok(!heroCss.includes('top: -24px; right: 0; border-color: #14b8a6;'), 'hero.css does not contain conflicting bubble rules');
  assert.ok(!heroCss.includes('.mischief-bubble {'), 'hero.css does not contain old mischief-bubble styles');

  // Verify mascots.css has proper sizing and features
  assert.ok(mascotsCss.includes('min-width: 220px;'), 'mascots.css sets comfortable min-width');
  assert.ok(mascotsCss.includes('max-width: min(320px, calc(100vw - 32px));'), 'mascots.css sets responsive max-width');
  assert.ok(mascotsCss.includes('.bubble-chip-btn'), 'mascots.css styles action chips');
  assert.ok(mascotsCss.includes('.bubble-audio-wave'), 'mascots.css styles audio waves');
  assert.ok(mascotsCss.includes(".mischief-bubble.bubble--bottom"), 'mascots.css supports bottom-oriented bubble');
  assert.ok(mascotsCss.includes(":root[data-theme='light'] .mischief-bubble"), 'mascots.css provides full light theme support');
});
