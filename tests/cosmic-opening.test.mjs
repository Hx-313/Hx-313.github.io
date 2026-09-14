import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const openingJsxPath = path.resolve('src/modules/home/presentation/opening/OpeningExperience.jsx');
const openingCssPath = path.resolve('src/modules/home/presentation/opening/opening.css');
const sequencePath = path.resolve('src/modules/home/presentation/opening/openingSequence.js');
const mediaPath = path.resolve('src/modules/home/presentation/media/visualSequences.js');
const frameSequencePath = path.resolve('src/shared/media/FrameSequence.jsx');
const homePagePath = path.resolve('src/modules/home/presentation/HomePage.jsx');
const heroVisualPath = path.resolve('src/modules/home/presentation/hero/HeroVisual.jsx');

test('opening uses the approved asset-led cinematic sequence', () => {
  const opening = fs.readFileSync(openingJsxPath, 'utf8');
  const sequence = fs.readFileSync(sequencePath, 'utf8');
  const media = fs.readFileSync(mediaPath, 'utf8');

  assert.match(sequence, /OPENING_DURATION = 5_200/);
  assert.match(sequence, /id: 'splash', start: 0, end: 2_500/);
  assert.match(sequence, /id: 'unfocus', start: 2_500, end: 2_800/);
  assert.match(sequence, /id: 'mascot-entrance', start: 2_800, end: 4_300/);
  assert.match(sequence, /id: 'refocus', start: 4_300, end: 4_600/);
  assert.match(sequence, /id: 'zoom-through', start: 4_600, end: 5_200/);
  assert.match(opening, /<FrameSequence/);
  assert.match(opening, /frames=\{ORB_FRAMES\}/);
  assert.match(opening, /frameDuration=\{82\}/);
  assert.match(opening, /<DashMascot/);
  assert.match(opening, /<AeroMascot/);
  assert.match(opening, /opening-transmission/);
  assert.match(opening, /AERO\. TRANSMISSION/);
  assert.match(opening, /everything<br \/>behind it\./);
  assert.match(opening, /setPhase\('transition'\)/);
  assert.match(opening, /callOnce\(onHandoff, handoffRef\)/);
  assert.match(opening, /callOnce\(onComplete, completeRef\)/);
  assert.match(opening, /formatLoaderTime\(loaderElapsed\)/);
  assert.match(opening, /requestAnimationFrame\(tick\)/);
  assert.match(media, /assets\/animation/);
  assert.match(media, /assets\/main_backgrund/);
});

test('opening runs both looping sequences and supports reduced motion', () => {
  const opening = fs.readFileSync(openingJsxPath, 'utf8');
  const frameSequence = fs.readFileSync(frameSequencePath, 'utf8');
  const css = fs.readFileSync(openingCssPath, 'utf8');

  assert.match(frameSequence, /requestAnimationFrame/);
  assert.match(frameSequence, /prefers-reduced-motion/);
  assert.match(frameSequence, /visibilitychange/);
  assert.match(opening, /prefers-reduced-motion/);
  assert.match(opening, /root\.dataset\.motion\s*=\s*reduced\s*\?\s*'reduced'\s*:\s*'standard'/);
  assert.match(css, /openingLoaderFill 2500ms linear/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('opening is a borderless full-viewport takeover', () => {
  const css = fs.readFileSync(openingCssPath, 'utf8');

  assert.match(css, /position: fixed/);
  assert.match(css, /z-index: 10000/);
  assert.match(css, /inset: 0/);
  assert.match(css, /width: 100vw/);
  assert.match(css, /height: 100dvh/);
  assert.match(css, /padding: 0/);
  assert.match(css, /border: 0/);
  assert.match(css, /object-fit: cover/);
  assert.match(css, /object-position: center/);
  assert.match(css, /\.opening--transition \.space-skip-btn/);
  assert.match(css, /overflow: clip/);
});

test('mascots enter from opposite sides at the same time', () => {
  const opening = fs.readFileSync(openingJsxPath, 'utf8');
  const css = fs.readFileSync(openingCssPath, 'utf8');

  assert.match(opening, /\.add\(aero,[\s\S]*?duration: OPENING_BEATS\[2\]\.end - OPENING_BEATS\[2\]\.start/);
  assert.match(opening, /\.add\(dash,[\s\S]*?duration: OPENING_BEATS\[2\]\.end - OPENING_BEATS\[2\]\.start/);
  assert.match(opening, /x: \['-58vw', '-25vw'\]/);
  assert.match(opening, /x: \['58vw', '25vw'\]/);
  assert.match(css, /opening-mascot__trail--aero/);
  assert.match(css, /opening-mascot__trail--dash/);
  assert.match(css, /opening--mascot-entrance \.opening-mascot > div/);
  assert.match(css, /opening--mascot-entrance \.opening-transmission \{[\s\S]*?opacity: 1/);
  assert.match(css, /opening-transmission__inner/);
  assert.match(css, /openingTransmissionEnter/);
  assert.match(css, /opening--refocus \.opening-transmission/);
  assert.match(css, /opening-transmission__title strong/);
});

test('intro and hero share a continuous zoom-through handoff', () => {
  const opening = fs.readFileSync(openingJsxPath, 'utf8');
  const homePage = fs.readFileSync(homePagePath, 'utf8');
  const visual = fs.readFileSync(heroVisualPath, 'utf8');
  const heroCss = fs.readFileSync(path.resolve('src/modules/home/presentation/hero/hero.css'), 'utf8');

  assert.match(opening, /scale: \[1, 14\]/);
  assert.match(opening, /duration: OPENING_BEATS\[4\]\.end - OPENING_BEATS\[4\]\.start/);
  assert.match(homePage, /transitioning=\{experienceState === 'handoff'\}/);
  assert.match(visual, /frames=\{GLOBE_FRAMES\}/);
  assert.match(visual, /hero-globe-portal/);
  assert.match(heroCss, /\.hero\.is-transitioning \.hero-globe-portal/);
  assert.match(heroCss, /@keyframes heroGlobeHandoff/);
  assert.match(heroCss, /scale\(0\.2\)/);
  assert.match(heroCss, /scale\(1\)/);
});

test('opening keeps a skip path and the intro starts at the top', () => {
  const opening = fs.readFileSync(openingJsxPath, 'utf8');
  const homePage = fs.readFileSync(homePagePath, 'utf8');

  assert.match(opening, /className="space-skip-btn"/);
  assert.match(opening, /onClick=\{skipOpening\}/);
  assert.match(homePage, /window\.history\.scrollRestoration\s*=\s*'manual'/);
  assert.match(homePage, /window\.scrollTo\(\{ top: 0, left: 0, behavior: 'auto' \}\)/);
});
