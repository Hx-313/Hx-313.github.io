export const OPENING_DURATION = 10_000;

export const OPENING_STATEMENTS = Object.freeze([
  Object.freeze({ id: 'statement-one', speaker: 'dash', label: 'DASH', text: 'IDEAS NEED STRUCTURE.', lead: 'IDEAS NEED', accent: 'STRUCTURE.' }),
  Object.freeze({ id: 'statement-two', speaker: 'aero', label: 'AERO', text: 'PRODUCTS NEED MOMENTUM.', lead: 'PRODUCTS NEED', accent: 'MOMENTUM.' }),
  Object.freeze({ id: 'statement-three', speaker: 'dash', label: 'DASH', text: 'MOMENTUM NEEDS CONVICTION.', lead: 'MOMENTUM NEEDS', accent: 'CONVICTION.' }),
]);

export const OPENING_BEATS = Object.freeze([
  Object.freeze({ id: 'globe-intro', start: 0, end: 1_200, speaker: null }),
  Object.freeze({ id: 'mascots-emerging', start: 1_200, end: 2_600, speaker: null }),
  Object.freeze({ id: 'mascots-focused', start: 2_600, end: 3_600, speaker: null }),
  Object.freeze({ id: 'dash-statement-one', start: 3_600, end: 5_000, speaker: 'dash' }),
  Object.freeze({ id: 'aero-statement-two', start: 5_000, end: 6_400, speaker: 'aero' }),
  Object.freeze({ id: 'dash-statement-three', start: 6_400, end: 7_800, speaker: 'dash' }),
  Object.freeze({ id: 'duo-focus', start: 7_800, end: 8_700, speaker: null }),
  Object.freeze({ id: 'transitioning-to-home', start: 8_700, end: 10_000, speaker: null }),
]);

export function getOpeningBeatAt(time) {
  const clamped = Math.min(Math.max(Number(time) || 0, 0), OPENING_DURATION - 1);
  return OPENING_BEATS.find(({ start, end }) => clamped >= start && clamped < end) ?? OPENING_BEATS.at(-1);
}
