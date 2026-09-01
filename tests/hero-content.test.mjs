import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('HeroContent contains positioning hook and dual-route CTAs', () => {
  const content = readFileSync(resolve('src/modules/home/presentation/hero/HeroContent.jsx'), 'utf-8');

  assert.ok(content.includes('Hafiz Ali Abdullah'), 'Includes developer name');
  assert.ok(content.includes('Full-Stack Software Engineer'), 'Includes developer role');
  assert.ok(content.includes('A mindset'), 'Includes headline part 1');
  assert.ok(content.includes('Beyond'), 'Includes headline beyond keyword');
  assert.ok(content.includes('ordinary.'), 'Includes headline part 3');
  assert.ok(content.includes('SYSTEM ACCESS'), 'Includes SYSTEM ACCESS label');
  assert.ok(content.includes('ONLINE'), 'Includes ONLINE indicator');
  assert.ok(content.includes('EXPLORE THE SYSTEM'), 'Includes primary story CTA label');
  assert.ok(content.includes('href="#problem"'), 'Primary CTA targets problem chapter');
  assert.ok(content.includes('VIEW SYSTEMS'), 'Includes secondary fast-path CTA label');
  assert.ok(content.includes('href="#systems"'), 'Secondary CTA targets systems section');
});

