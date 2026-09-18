import { INTRO_TEXT } from '../../../../core/constants/intro/introText.js';

export const OPENING_SPLASH_DURATION = 6_000;
export const OPENING_DURATION = 13_800;

export const OPENING_STATEMENTS = INTRO_TEXT.statements;

export const OPENING_BEATS = Object.freeze([
  Object.freeze({ id: 'splash', start: 0, end: OPENING_SPLASH_DURATION, speaker: null }),
  Object.freeze({ id: 'settle', start: 6_000, end: 6_400, speaker: null }),
  Object.freeze({ id: 'card-one', start: 6_400, end: 8_100, speaker: 'dash' }),
  Object.freeze({ id: 'card-two-transition', start: 8_100, end: 8_400, speaker: null }),
  Object.freeze({ id: 'card-two', start: 8_400, end: 10_100, speaker: 'aero' }),
  Object.freeze({ id: 'breather', start: 10_100, end: 10_400, speaker: null }),
  Object.freeze({ id: 'card-three', start: 10_400, end: 12_400, speaker: 'dash' }),
  Object.freeze({ id: 'exit', start: 12_400, end: 13_200, speaker: null }),
  Object.freeze({ id: 'transition', start: 13_200, end: OPENING_DURATION, speaker: null }),
]);

export function getOpeningBeatAt(time) {
  const clamped = Math.min(Math.max(Number(time) || 0, 0), OPENING_DURATION - 1);
  return OPENING_BEATS.find(({ start, end }) => clamped >= start && clamped < end) ?? OPENING_BEATS.at(-1);
}
