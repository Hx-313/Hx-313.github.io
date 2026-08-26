import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('HeroContent contains exact approved hook and Image 1 CTA', () => {
  const content = readFileSync(resolve('src/modules/home/presentation/hero/HeroContent.jsx'), 'utf-8');

  assert.ok(content.includes('Hafiz Ali Abdullah'), 'Includes developer name');
  assert.ok(content.includes('Full-Stack Software Engineer'), 'Includes developer role');
  assert.ok(content.includes('A mindset'), 'Includes headline part 1');
  assert.ok(content.includes('Beyond'), 'Includes headline beyond keyword');
  assert.ok(content.includes('ordinary.'), 'Includes headline part 3');
  assert.ok(content.includes('I turn ambitious ideas into production-ready software, apps, and SaaS platforms that move businesses forward.'), 'Includes pitch');
  assert.ok(content.includes('SYSTEM ACCESS'), 'Includes SYSTEM ACCESS label');
  assert.ok(content.includes('ONLINE'), 'Includes ONLINE indicator');
  assert.ok(content.includes('ENTER COMMAND CENTER'), 'Includes ENTER COMMAND CENTER CTA');
  assert.ok(content.includes('EXPLORE WORK'), 'Includes EXPLORE WORK secondary link');
});
