import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OPENING_BEATS,
  OPENING_DURATION,
  OPENING_SPLASH_DURATION,
  OPENING_STATEMENTS,
  getOpeningBeatAt,
} from '../src/modules/home/presentation/opening/openingSequence.js';

test('opening uses a six-second splash before the cinematic mascot choreography', () => {
  assert.equal(OPENING_SPLASH_DURATION, 6_000);
  assert.equal(OPENING_DURATION, 13_800);
  assert.deepEqual(
    OPENING_STATEMENTS.map(({ speaker, text }) => ({ speaker, text })),
    [
      { speaker: 'dash', text: 'YOUR USERS ONLY SEE THE APP.' },
      { speaker: 'aero', text: 'YOUR BUSINESS RELIES ON EVERYTHING BEHIND IT.' },
      { speaker: 'dash', text: 'WHEN BOTH WORK, YOUR PRODUCT WORKS.' },
    ],
  );
  assert.deepEqual(
    OPENING_BEATS.map(({ id, start, end, speaker }) => ({ id, start, end, speaker })),
    [
      { id: 'splash', start: 0, end: 6_000, speaker: null },
      { id: 'settle', start: 6_000, end: 6_400, speaker: null },
      { id: 'card-one', start: 6_400, end: 8_100, speaker: 'dash' },
      { id: 'card-two-transition', start: 8_100, end: 8_400, speaker: null },
      { id: 'card-two', start: 8_400, end: 10_100, speaker: 'aero' },
      { id: 'breather', start: 10_100, end: 10_400, speaker: null },
      { id: 'card-three', start: 10_400, end: 12_400, speaker: 'dash' },
      { id: 'exit', start: 12_400, end: 13_200, speaker: null },
      { id: 'transition', start: 13_200, end: 13_800, speaker: null },
    ],
  );
});
test('opening beats are contiguous and finish at the declared duration', () => {
  assert.equal(OPENING_BEATS[0].start, 0);
  for (let index = 1; index < OPENING_BEATS.length; index += 1) {
    assert.equal(OPENING_BEATS[index - 1].end, OPENING_BEATS[index].start);
  }
  assert.equal(OPENING_BEATS.at(-1).end, OPENING_DURATION);
});

test('phase lookup resolves every major camera state', () => {
  assert.equal(getOpeningBeatAt(200).id, 'splash');
  assert.equal(getOpeningBeatAt(2_100).id, 'splash');
  assert.equal(getOpeningBeatAt(6_100).id, 'settle');
  assert.equal(getOpeningBeatAt(7_000).speaker, 'dash');
  assert.equal(getOpeningBeatAt(8_200).id, 'card-two-transition');
  assert.equal(getOpeningBeatAt(9_000).speaker, 'aero');
  assert.equal(getOpeningBeatAt(10_200).id, 'breather');
  assert.equal(getOpeningBeatAt(11_000).speaker, 'dash');
  assert.equal(getOpeningBeatAt(12_800).id, 'exit');
  assert.equal(getOpeningBeatAt(13_500).id, 'transition');
});

test('phase lookup includes every beat boundary and clamps out-of-range times', () => {
  for (const beat of OPENING_BEATS) {
    assert.equal(getOpeningBeatAt(beat.start), beat);
    assert.equal(getOpeningBeatAt(beat.end - 1), beat);
  }

  assert.equal(getOpeningBeatAt(OPENING_DURATION), OPENING_BEATS.at(-1));
  assert.equal(getOpeningBeatAt(-1), OPENING_BEATS[0]);
});
