import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('aboutData exports frozen contract with headline, paragraphs, stats, and metadata', async () => {
  const { aboutData, aboutHeadline, aboutParagraphs, aboutStats } = await import(
    '../src/modules/about/domain/aboutData.js'
  );

  assert.ok(aboutData, 'aboutData is exported');
  assert.ok(Object.isFrozen(aboutData), 'aboutData is frozen');

  // Verify Headline
  assert.equal(aboutHeadline.length, 3);
  assert.equal(aboutHeadline[0], 'Mobile first,');
  assert.equal(aboutHeadline[1], 'systems included,');
  assert.equal(aboutHeadline[2], 'built to last.');

  // Verify Body Copy
  assert.equal(aboutParagraphs.length, 3);
  assert.match(aboutParagraphs[0], /Flutter and native technologies/);
  assert.match(aboutParagraphs[1], /customer-facing apps, internal workflows/);
  assert.match(aboutParagraphs[2], /OnlineOrder\.pk \/ WOS/);

  // Verify Stats
  assert.equal(aboutStats.length, 3);
  const systemsStat = aboutStats.find((s) => s.id === 'systems');
  assert.ok(systemsStat);
  assert.equal(systemsStat.targetNumber, 1);
  assert.equal(systemsStat.highlight, true);
});

test('AboutSection component renders headline, grid narrative, and technical kpi stats', () => {
  const jsx = readFileSync(resolve('src/modules/about/presentation/AboutSection.jsx'), 'utf8');

  assert.match(jsx, /id="about"/, 'Section must have #about id');
  assert.match(jsx, /about-section/);
  assert.match(jsx, /about-headline/);
  assert.match(jsx, /about-grid/);
  assert.match(jsx, /about-copy/);
  assert.match(jsx, /about-credit/);
  assert.match(jsx, /ABOUT_TEXT\.credit\.name/);
  assert.match(jsx, /ABOUT_TEXT\.credit\.title/);
  assert.match(jsx, /about-kpis/);
  assert.match(jsx, /about-signal-closing/);
});

test('AboutSection and aboutData contain strictly zero // pseudo-comment text in UI copy', async () => {
  const { aboutData } = await import('../src/modules/about/domain/aboutData.js');
  const jsx = readFileSync(resolve('src/modules/about/presentation/AboutSection.jsx'), 'utf8');

  // Verify all string fields in exported domain data do not contain '//'
  const checkStrings = (val) => {
    if (typeof val === 'string') {
      assert.ok(!val.includes('//'), `String in aboutData must not contain '//': ${val}`);
    } else if (Array.isArray(val)) {
      val.forEach(checkStrings);
    } else if (val && typeof val === 'object') {
      Object.values(val).forEach(checkStrings);
    }
  };

  checkStrings(aboutData);

  // Verify visible JSX text nodes don't contain raw `//`
  const renderedTextOnly = jsx
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove block comments
    .replace(/\/\/.*/g, ''); // remove single-line comments in JS

  assert.ok(
    !renderedTextOnly.includes('//'),
    'AboutSection JSX should not contain hardcoded "//" in visible markup'
  );
});
