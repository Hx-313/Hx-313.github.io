import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('client scroll story preserves the approved five-beat narrative', () => {
  const data = readFileSync(resolve('src/modules/home/presentation/client-story/storyData.js'), 'utf8');

  for (const copy of [
    'You have the idea.',
    'Your business is growing.',
    "You don't need another app.",
    'You need the right system.',
    "That's where I come in.",
    "I'm Hafiz.",
    'Ideas are easy to talk about.',
    'Execution leaves evidence.',
    'Spreadsheets · manual work · disconnected tools · duplicated effort',
  ]) {
    assert.match(data, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  for (const id of ['idea', 'friction', 'system', 'builder', 'proof']) {
    assert.match(data, new RegExp(`id: '${id}'`));
  }
});

test('ClientStory drives a marker-free two-phase sequence inside one visual stage', () => {
  const component = readFileSync(resolve('src/modules/home/presentation/client-story/ClientStory.jsx'), 'utf8');

  assert.match(component, /id="client-story"/);
  assert.match(component, /client-story__stage/);
  assert.match(component, /getBoundingClientRect/);
  assert.match(component, /addEventListener\('wheel'/);
  assert.match(component, /passive:\s*false/);
  assert.match(component, /event\.preventDefault\(\)/);
  assert.match(component, /atFirstPhase/);
  assert.match(component, /atLastPhase/);
  assert.match(component, /data-story-phase=\{storyState\.phase\}/);
  assert.match(component, /href="#command-center"/);
  assert.doesNotMatch(component, /client-story__rail/);
  assert.doesNotMatch(component, /client-story__marker/);
  assert.doesNotMatch(component, /aria-current/);
  assert.doesNotMatch(component, /ScrollTrigger/);
});

test('client story CSS pins one centered stage while native scrolling advances the copy', () => {
  const css = readFileSync(resolve('src/modules/home/presentation/client-story/client-story.css'), 'utf8');

  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.client-story__stage/);
  assert.match(css, /position:\s*sticky/);
  assert.match(css, /place-items:\s*center/);
  assert.match(css, /text-align:\s*center/);
  assert.match(css, /transform/);
  assert.match(css, /opacity/);
  assert.doesNotMatch(css, /client-story__rail/);
  assert.doesNotMatch(css, /client-story__marker/);
  assert.doesNotMatch(css, /scroll-snap-type/);
  assert.doesNotMatch(css, /position:\s*fixed/);
  assert.doesNotMatch(css, /repeating-linear-gradient/);
});

test('HomePage places the client story between the hero and command center', () => {
  const page = readFileSync(resolve('src/modules/home/presentation/HomePage.jsx'), 'utf8');
  const heroIndex = page.indexOf('<Hero');
  const storyIndex = page.indexOf('<ClientStory');
  const commandCenterIndex = page.indexOf('id="command-center"');

  assert.match(page, /import ClientStory from '.\/client-story\/ClientStory\.jsx'/);
  assert.ok(heroIndex >= 0 && storyIndex > heroIndex && commandCenterIndex > storyIndex);
});
