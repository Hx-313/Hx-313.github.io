export const OPENING_DURATION = 5_200;

export const OPENING_BEATS = Object.freeze([
  Object.freeze({ id: 'splash', start: 0, end: 2_500 }),
  Object.freeze({ id: 'unfocus', start: 2_500, end: 2_800 }),
  Object.freeze({ id: 'mascot-entrance', start: 2_800, end: 4_300 }),
  Object.freeze({ id: 'refocus', start: 4_300, end: 4_600 }),
  Object.freeze({ id: 'zoom-through', start: 4_600, end: 5_200 }),
]);

export function getOpeningBeatAt(time) {
  const clamped = Math.min(Math.max(Number(time) || 0, 0), OPENING_DURATION - 1);
  return OPENING_BEATS.find(({ start, end }) => clamped >= start && clamped < end) ?? OPENING_BEATS.at(-1);
}
