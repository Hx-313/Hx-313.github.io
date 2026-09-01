export const problemBeats = Object.freeze([
  {
    id: 'scale-friction',
    chapter: '01',
    kicker: 'THE PROBLEM',
    eyebrow: 'OPERATIONAL FRICTION',
    title: 'YOUR BUSINESS IS GROWING.',
    statement: "YOUR SYSTEMS AREN'T.",
    detail:
      'Orders live in one system. Inventory in another. Staff depend on spreadsheets. Customers wait while teams reconcile the gaps.',
    diagnostics: [
      { label: 'ORDERS', origin: 'SYSTEM A' },
      { label: 'INVENTORY', origin: 'SYSTEM B' },
      { label: 'SPREADSHEETS', origin: 'STAFF' },
      { label: 'MANUAL RECONCILIATION', origin: 'OPERATIONS' },
    ],
    tagline: 'SYSTEM FRICTION',
  },

  {
    id: 'system-gap',
    chapter: '01',
    kicker: 'THE PROBLEM',
    eyebrow: 'THE SYSTEM GAP',
    title: 'OR MAYBE THE CHALLENGE STARTS EARLIER.',
    statement: 'YOU HAVE THE IDEA. NOT THE SYSTEM.',
    detail:
      'The workflow makes sense in your head. The business rules exist. The opportunity is real. But turning all of it into software that can survive real use is a different problem.',
    tagline: 'THE REALITY GAP',
  },

  {
    id: 'builder-bridge',
    chapter: '01',
    kicker: 'THE PROBLEM',
    eyebrow: 'THE HANDOFF',
    title: "THAT'S THE PART I WORK ON.",
    statement: 'I TURN THE GAP INTO A SYSTEM.',
    detail:
      'From product structure to architecture, interfaces, integrations and production behavior.',
    nextChapter: {
      label: '02 // HOW I BUILD',
      href: '#how-i-build',
    },
  },
]);

export const TOTAL_BEATS = problemBeats.length;
export const STORY_PHASE_COUNT = TOTAL_BEATS * 2;

export function getStoryPhase(phaseIndex) {
  const clampedIndex = Math.min(Math.max(Number(phaseIndex) || 0, 0), STORY_PHASE_COUNT - 1);
  const beatIndex = Math.floor(clampedIndex / 2);
  const beat = problemBeats[beatIndex] || problemBeats[0];
  const phaseType = clampedIndex % 2 === 0 ? 'title' : 'statement';
  return {
    index: clampedIndex,
    beatId: beat.id,
    phaseType,
    beat,
  };
}

// Backward compatibility alias for any existing consumer
export const storyBeats = problemBeats;

