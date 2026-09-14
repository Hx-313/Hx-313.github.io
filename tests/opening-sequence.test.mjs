import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OPENING_BEATS,
  OPENING_DURATION,
  getOpeningBeatAt,
} from '../src/modules/home/presentation/opening/openingSequence.js';

test('opening matches the approved 5.2 second cinematic choreography', () => {
  assert.equal(OPENING_DURATION, 5_200);
  assert.deepEqual(
    OPENING_BEATS.map(({ id, start, end }) => ({ id, start, end })),
    [
      { id: 'splash', start: 0, end: 2_500 },
      { id: 'unfocus', start: 2_500, end: 2_800 },
      { id: 'mascot-entrance', start: 2_800, end: 4_300 },
      { id: 'refocus', start: 4_300, end: 4_600 },
      { id: 'zoom-through', start: 4_600, end: 5_200 },
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
  assert.equal(getOpeningBeatAt(2_600).id, 'unfocus');
  assert.equal(getOpeningBeatAt(3_400).id, 'mascot-entrance');
  assert.equal(getOpeningBeatAt(4_450).id, 'refocus');
  assert.equal(getOpeningBeatAt(4_900).id, 'zoom-through');
});

test('phase lookup includes every beat boundary and clamps out-of-range times', () => {
  for (const beat of OPENING_BEATS) {
    assert.equal(getOpeningBeatAt(beat.start), beat);
    assert.equal(getOpeningBeatAt(beat.end - 1), beat);
  }

  assert.equal(getOpeningBeatAt(OPENING_DURATION), OPENING_BEATS.at(-1));
  assert.equal(getOpeningBeatAt(-1), OPENING_BEATS[0]);
});
