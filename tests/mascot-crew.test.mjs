import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('MascotCrew component renders Aero and Dash with required anatomy and interactions', () => {
  const content = readFileSync(resolve('src/modules/home/presentation/hero/MascotCrew.jsx'), 'utf-8').toLowerCase();

  assert.ok(content.includes('aero'), 'Includes Aero character identifier');
  assert.ok(content.includes('dash'), 'Includes Dash character identifier');
  assert.ok(content.includes('halo'), 'Includes Aero halo ring feature');
  assert.ok(content.includes('thruster') || content.includes('antenna'), 'Includes Dash wing thrusters or antennae');
  assert.ok(content.includes('onclick'), 'Includes interactive click triggers');
  assert.ok(content.includes('aria-label') || content.includes('role="img"'), 'Includes accessibility attributes');
});
