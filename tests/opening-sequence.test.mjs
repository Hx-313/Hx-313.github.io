import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OPENING_BEATS,
  OPENING_DURATION,
  OPENING_STATEMENTS,
  getOpeningBeatAt,
} from '../src/modules/home/presentation/opening/openingSequence.js';

test('opening gives the approved narrative room to breathe', () => {
  assert.equal(OPENING_DURATION, 12_400);
  assert.deepEqual(
    OPENING_STATEMENTS.map(({ speaker, text }) => ({ speaker, text })),
    [
      { speaker: 'dash', text: 'IDEAS NEED STRUCTURE.' },
      { speaker: 'aero', text: 'PRODUCTS NEED MOMENTUM.' },
      { speaker: 'dash', text: 'MOMENTUM NEEDS CONVICTION.' },
    ],
  );
});

test('opening beats are contiguous and finish at the declared duration', () => {
  assert.equal(OPENING_BEATS[0].start, 0);
  assert.equal(OPENING_BEATS[0].end, 400, 'the globe has a 0.4s solo beat before the crew rises');
  for (let index = 1; index < OPENING_BEATS.length; index += 1) {
    assert.equal(OPENING_BEATS[index - 1].end, OPENING_BEATS[index].start);
  }
  assert.equal(OPENING_BEATS.at(-1).end, OPENING_DURATION);
});

test('phase lookup resolves the major camera states', () => {
  assert.equal(getOpeningBeatAt(200).id, 'globe-intro');
  assert.equal(getOpeningBeatAt(2_000).id, 'mascots-emerging');
  assert.equal(getOpeningBeatAt(4_200).speaker, 'dash');
  assert.equal(getOpeningBeatAt(6_200).speaker, 'aero');
  assert.equal(getOpeningBeatAt(10_200).id, 'duo-focus');
  assert.equal(getOpeningBeatAt(11_400).id, 'transitioning-to-home');
});

test('phase lookup includes every beat boundary and clamps out-of-range times', () => {
  for (const beat of OPENING_BEATS) {
    assert.equal(getOpeningBeatAt(beat.start), beat);
    assert.equal(getOpeningBeatAt(beat.end - 1), beat);
  }

  assert.equal(getOpeningBeatAt(OPENING_DURATION), OPENING_BEATS.at(-1));
  assert.equal(getOpeningBeatAt(-1), OPENING_BEATS[0]);
});
