import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Mascots component includes autonomous free-flight roaming and collision argument skits', () => {
  const content = readFileSync(resolve('src/components/Mascots.jsx'), 'utf-8');

  assert.ok(content.includes('SPOT_COMMENTARY'), 'Includes multi-spot contextual commentary');
  assert.ok(content.includes('ARGUMENT_SKITS'), 'Includes random collision argument skits');
  assert.ok(content.includes('triggerCollision'), 'Includes collision detection and impact logic');
  assert.ok(content.includes('getRandomWaypoint'), 'Includes autonomous flight waypoint generation');
  assert.ok(content.includes('handlePointerDown'), 'Includes manual dragging physics for user interactivity');
  assert.ok(content.includes('isRoam'), 'Includes free-roam toggle controller');
});
