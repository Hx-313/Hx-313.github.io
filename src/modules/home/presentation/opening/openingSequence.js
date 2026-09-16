export const OPENING_SPLASH_DURATION = 6_000;
export const OPENING_DURATION = 13_800;

export const OPENING_STATEMENTS = Object.freeze([
  Object.freeze({
    id: 'statement-one',
    speaker: 'dash',
    label: 'DASH',
    text: 'YOUR USERS ONLY SEE THE APP.',
    lead: 'YOUR USERS ONLY SEE',
    accent: 'THE APP.',
  }),
  Object.freeze({
    id: 'statement-two',
    speaker: 'aero',
    label: 'AERO',
    text: 'YOUR BUSINESS RELIES ON EVERYTHING BEHIND IT.',
    lead: 'YOUR BUSINESS RELIES ON',
    accent: 'EVERYTHING BEHIND IT.',
  }),
  Object.freeze({
    id: 'statement-three',
    speaker: 'dash',
    label: 'DASH',
    text: 'WHEN BOTH WORK, YOUR PRODUCT WORKS.',
    lead: 'WHEN BOTH WORK,',
    accent: 'YOUR PRODUCT WORKS.',
  }),
]);

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
