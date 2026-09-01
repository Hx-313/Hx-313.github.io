import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('problem data preserves semantic beats, chapter marker, and nextChapter target', () => {
  const data = readFileSync(resolve('src/modules/home/presentation/client-story/storyData.js'), 'utf8');

  // Semantic Beat IDs
  for (const id of ['scale-friction', 'system-gap', 'builder-bridge']) {
    assert.match(data, new RegExp(`id:\\s*'${id}'`));
  }

  // Chapter 01 Kicker
  assert.match(data, /chapter:\s*'01'/);
  assert.match(data, /kicker:\s*'THE PROBLEM'/);

  // Next Chapter target
  assert.match(data, /nextChapter:\s*\{/);
  assert.match(data, /href:\s*'#how-i-build'/);
});

test('storyData exports helper methods and 6 discrete phase definitions', async () => {
  const { problemBeats, TOTAL_BEATS, STORY_PHASE_COUNT, getStoryPhase } = await import('../src/modules/home/presentation/client-story/storyData.js');
  assert.equal(TOTAL_BEATS, 3);
  assert.equal(STORY_PHASE_COUNT, 6);
  assert.equal(typeof getStoryPhase, 'function');
  const phase0 = getStoryPhase(0);
  assert.equal(phase0.beatId, 'scale-friction');
  assert.equal(phase0.phaseType, 'title');
  const phase5 = getStoryPhase(5);
  assert.equal(phase5.beatId, 'builder-bridge');
  assert.equal(phase5.phaseType, 'statement');
});

test('ClientStory component renders Chapter 01 stage, diagnostics, and accessible lifecycle', () => {
  const component = readFileSync(resolve('src/modules/home/presentation/client-story/ClientStory.jsx'), 'utf8');

  assert.match(component, /id="problem"/);
  assert.match(component, /client-story__stage/);
  assert.match(component, /01 \/\/ THE PROBLEM/);
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
  assert.match(css, /\.client-story__chapter-marker/);
  assert.match(css, /\.chapter-step-badge/);
  assert.match(css, /\.client-story__phase-hud/);
  assert.match(css, /\.phase-dot/);
  assert.match(css, /text-shadow/);
  assert.match(css, /blur\(1[0-9]px\)/);
  assert.match(css, /\.diagnostics-grid/);
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

