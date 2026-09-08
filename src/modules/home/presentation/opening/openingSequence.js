export const OPENING_DURATION = 17_000;

export const OPENING_STATEMENTS = Object.freeze([
  Object.freeze({ id: 'statement-one', speaker: 'dash', label: 'DASH', text: 'YOUR USERS ONLY SEE THE APP.', lead: 'YOUR USERS ONLY SEE', accent: 'THE APP.' }),
  Object.freeze({ id: 'statement-two', speaker: 'aero', label: 'AERO', text: 'YOUR BUSINESS RELIES ON EVERYTHING BEHIND IT.', lead: 'YOUR BUSINESS RELIES ON', accent: 'EVERYTHING BEHIND IT.' }),
  Object.freeze({ id: 'statement-three', speaker: 'dash', label: 'DASH', text: 'WHEN BOTH WORK, YOUR PRODUCT WORKS.', lead: 'WHEN BOTH WORK,', accent: 'YOUR PRODUCT WORKS.' }),
]);

export const OPENING_BEATS = Object.freeze([
  Object.freeze({ id: 'globe-intro', start: 0, end: 400, speaker: null }),
  Object.freeze({ id: 'mascots-emerging', start: 400, end: 2_600, speaker: null }),
  Object.freeze({ id: 'mascots-focused', start: 2_600, end: 3_600, speaker: null }),
  Object.freeze({ id: 'dash-statement-one', start: 3_600, end: 7_200, speaker: 'dash' }),
  Object.freeze({ id: 'aero-statement-two', start: 7_200, end: 10_800, speaker: 'aero' }),
  Object.freeze({ id: 'dash-statement-three', start: 10_800, end: 14_400, speaker: 'dash' }),
  Object.freeze({ id: 'duo-focus', start: 14_400, end: 15_400, speaker: null }),
  Object.freeze({ id: 'transitioning-to-home', start: 15_400, end: 17_000, speaker: null }),
]);

export function getOpeningBeatAt(time) {
  const clamped = Math.min(Math.max(Number(time) || 0, 0), OPENING_DURATION - 1);
  return OPENING_BEATS.find(({ start, end }) => clamped >= start && clamped < end) ?? OPENING_BEATS.at(-1);
}
