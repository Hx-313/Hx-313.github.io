import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('problem data preserves semantic beats, chapter marker, and nextChapter target', () => {
  const data = readFileSync(resolve('src/modules/home/presentation/client-story/storyData.js'), 'utf8');

  // Semantic Beat IDs
  for (const id of ['interface-and-system', 'performance-foundation', 'state-event-logic']) {
    assert.match(data, new RegExp(`id:\\s*'${id}'`));
  }

  // Chapter 01 Kicker
  assert.match(data, /chapter:\s*'01'/);
  assert.match(data, /kicker:\s*'CORE THESIS'/);

  // Next Chapter target
  assert.match(data, /nextChapter:\s*(Object\.freeze\()?\{/);
  assert.match(data, /href:\s*'#how-i-build'/);
});

test('storyData exports helper methods and 3 discrete phase definitions', async () => {
  const { problemBeats, TOTAL_BEATS, STORY_PHASE_COUNT, getStoryPhase } = await import('../src/modules/home/presentation/client-story/storyData.js');
  assert.equal(TOTAL_BEATS, 3);
  assert.equal(STORY_PHASE_COUNT, 3);
  assert.equal(typeof getStoryPhase, 'function');
  const phase0 = getStoryPhase(0);
  assert.equal(phase0.beatId, 'interface-and-system');
  assert.equal(phase0.phaseType, 'active');
  const phase2 = getStoryPhase(2);
  assert.equal(phase2.beatId, 'state-event-logic');
  assert.equal(phase2.phaseType, 'active');
});

test('ClientStory component renders Chapter 01 stage, centered hooks, and accessible lifecycle', () => {
  const component = readFileSync(resolve('src/modules/home/presentation/client-story/ClientStory.jsx'), 'utf8');

  assert.match(component, /id="problem"/);
  assert.match(component, /client-story__stage/);
  assert.match(component, /01 · CORE THESIS/);
  assert.match(component, /DELTA_THRESHOLD/);
  assert.match(component, /LOCKOUT_DURATION/);
  assert.match(component, /goToPhase/);
  assert.match(component, /data-phase-index/);
  assert.match(component, /prefers-reduced-motion/);
  assert.match(component, /addEventListener\('wheel'/);
  assert.match(component, /problemBeats/);
  assert.doesNotMatch(component, /client-story__rail/);
  assert.doesNotMatch(component, /ScrollTrigger/);
});

test('client story CSS pins sticky stage, handles scroll offset, and provides true reduced motion', () => {
  const css = readFileSync(resolve('src/modules/home/presentation/client-story/client-story.css'), 'utf8');

  assert.match(css, /scroll-margin-top/);
  assert.match(css, /\.client-story__stage/);
  assert.match(css, /position:\s*sticky/);
  assert.match(css, /\.client-story__beat/);
  assert.match(css, /\.client-story__line/);
  assert.match(css, /\.client-story__lead/);
  assert.match(css, /\.client-story__statement/);
  assert.match(css, /text-shadow/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /height:\s*auto\s*!important/);
  assert.doesNotMatch(css, /scroll-snap-type/);
});

test('HomePage places the problem story between the hero and systems command center', () => {
  const page = readFileSync(resolve('src/modules/home/presentation/HomePage.jsx'), 'utf8');
  const heroIndex = page.indexOf('<Hero');
  const storyIndex = page.indexOf('<ClientStory');
  const systemsIndex = page.indexOf('id="command-center"');

  assert.match(page, /import ClientStory from '.\/client-story\/ClientStory\.jsx'/);
  assert.ok(heroIndex >= 0 && storyIndex > heroIndex && systemsIndex > storyIndex);
});
