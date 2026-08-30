import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Mascots component includes active-page confinement, free flight, and interactive dialogues', () => {
  const content = readFileSync(resolve('src/components/Mascots.jsx'), 'utf-8');

  assert.ok(content.includes('HERO_GREETINGS'), 'Includes multi-spot contextual commentary and greetings');
  assert.ok(content.includes('handleChipAction'), 'Includes interactive action chip handling');
  assert.ok(content.includes('getRandomWaypoint'), 'Includes autonomous flight waypoint generation');
  assert.ok(content.includes('handlePointerDown'), 'Includes manual dragging physics for user interactivity');
  assert.ok(content.includes('activePage'), 'Includes active page boundary lock and migration');
  assert.ok(content.includes('isRoam'), 'Includes free-roam toggle controller');
});
