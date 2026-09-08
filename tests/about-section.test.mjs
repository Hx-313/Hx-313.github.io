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
  assert.equal(aboutHeadline[0], 'Three years,');
  assert.equal(aboutHeadline[1], 'fifteen systems,');
  assert.equal(aboutHeadline[2], 'zero excuses for crashing.');

  // Verify Body Copy
  assert.equal(aboutParagraphs.length, 3);
  assert.match(aboutParagraphs[0], /I'll admit it — I over-engineer/);
  assert.match(aboutParagraphs[1], /apps I build stay clean and solid/);
  assert.match(aboutParagraphs[2], /WOS EPOS/);
  assert.match(aboutParagraphs[2], /Real state, real transactions, real uptime/);

  // Verify Stats with Uptime Fault Highlight
  assert.equal(aboutStats.length, 4);
  const uptimeStat = aboutStats.find((s) => s.id === 'uptime');
  assert.ok(uptimeStat);
  assert.equal(uptimeStat.targetNumber, 98.7);
  assert.equal(uptimeStat.highlight, true);
});

test('AboutSection component renders asymmetric single flow, headline, and humanist stats', () => {
  const jsx = readFileSync(resolve('src/modules/about/presentation/AboutSection.jsx'), 'utf8');

  assert.match(jsx, /id="about"/, 'Section must have #about id');
  assert.match(jsx, /about-section/);
  assert.match(jsx, /about-headline/);
  assert.match(jsx, /about-signal-phrase/);
  assert.match(jsx, /about-body/);
  assert.match(jsx, /about-credit/);
  assert.match(jsx, /Hafiz Ali Abdullah/);
  assert.match(jsx, /Mobile app developer/);
  assert.match(jsx, /about-stats-col/);
  assert.match(jsx, /about-stats-vertical-list/);
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
    } else if (typeof val === 'object' && val !== null) {
      Object.values(val).forEach(checkStrings);
    }
  };
  checkStrings(aboutData);

  // Verify JSX UI copy lines do not contain '//'
  const jsxLines = jsx.split('\n');
  for (const line of jsxLines) {
    if (line.includes('<') && line.includes('>')) {
      // Ignore developer comment tags like {/* ... */}
      const cleaned = line.replace(/\{\/\*.*?\*\/\}/g, '');
      assert.ok(!cleaned.includes('//'), `JSX line must not contain '//': ${line}`);
    }
  }
});

test('HomePage embeds ClientStory and AboutSection in sequence', () => {
  const homePage = readFileSync(resolve('src/modules/home/presentation/HomePage.jsx'), 'utf8');

  assert.match(homePage, /import AboutSection from '\.\.\/\.\.\/about\/presentation\/AboutSection\.jsx'/);
  const heroPos = homePage.indexOf('<Hero');
  const storyPos = homePage.indexOf('<ClientStory');
  const aboutPos = homePage.indexOf('<AboutSection');

  assert.ok(heroPos !== -1 && storyPos !== -1 && aboutPos !== -1);
  assert.ok(storyPos > heroPos, 'ClientStory must appear after Hero');
  assert.ok(aboutPos > storyPos, 'AboutSection must appear after ClientStory');
});
