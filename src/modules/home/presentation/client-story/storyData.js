export const problemBeats = Object.freeze([
  Object.freeze({
    id: 'interface-and-system',
    chapter: '01',
    kicker: 'CORE THESIS',
    eyebrow: 'SYSTEM DEPTH',
    title: "GREAT MOBILE PRODUCTS DON'T END AT THE INTERFACE.",
    statement: 'THEY RUN ON SYSTEMS BUILT TO HOLD UP.',
    detail:
      'Smooth 60fps interactions require resilient backend services, real-time data synchronization, and clean architecture under real production load.',
    diagnostics: Object.freeze([
      Object.freeze({ label: 'UI LAYER', origin: 'CLIENT' }),
      Object.freeze({ label: 'BACKEND SERVICES', origin: 'INFRASTRUCTURE' }),
      Object.freeze({ label: 'STATE ENGINE', origin: 'DATA BUS' }),
      Object.freeze({ label: 'REALTIME SYNC', origin: 'NETWORK' }),
    ]),
    tagline: 'END-TO-END CRAFT',
  }),

  Object.freeze({
    id: 'performance-foundation',
    chapter: '01',
    kicker: 'CORE THESIS',
    eyebrow: 'PERFORMANCE',
    title: "PERFORMANCE ISN'T A FEATURE.",
    statement: "IT'S THE FOUNDATION.",
    detail:
      'Zero-lag frame rates, instant load times, and memory efficiency under real-world concurrency and flaky network environments.',
    diagnostics: Object.freeze([
      Object.freeze({ label: '60 FPS', origin: 'RENDER THREAD' }),
      Object.freeze({ label: 'CACHE-FIRST', origin: 'OFFLINE ENGINE' }),
      Object.freeze({ label: 'ZERO JANK', origin: 'FRAME BUDGET' }),
      Object.freeze({ label: 'LOW LATENCY', origin: 'EDGE APIS' }),
    ]),
    tagline: 'FOUNDATIONAL SPEED',
  }),

  Object.freeze({
    id: 'state-event-logic',
    chapter: '01',
    kicker: 'CORE THESIS',
    eyebrow: 'ARCHITECTURE',
    title: 'EVERY SCREEN IS A STATE. EVERY TAP IS AN EVENT.',
    statement: 'THE PRODUCT IS THE LOGIC BETWEEN THEM.',
    detail:
      'From deterministic state machines to edge AI pipelines, computer vision models, and robust cloud integrations.',
    nextChapter: Object.freeze({
      label: '02 · HOW I BUILD',
      href: '#how-i-build',
    }),
    tagline: 'SYSTEM ARCHITECTURE',
  }),
]);

export const TOTAL_BEATS = problemBeats.length;
export const STORY_PHASE_COUNT = 3;

export function getStoryPhase(phaseIndex) {
  const clampedIndex = Math.min(Math.max(Number(phaseIndex) || 0, 0), STORY_PHASE_COUNT - 1);
  const beat = problemBeats[clampedIndex] || problemBeats[0];
  return {
    index: clampedIndex,
    beatId: beat.id,
    phaseType: 'active',
    beat,
  };
}

export const storyBeats = problemBeats;
