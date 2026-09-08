import { useCallback, useEffect, useRef, useState } from 'react';
import { problemBeats, STORY_PHASE_COUNT, getStoryPhase } from './storyData.js';
import './client-story.css';

export const DELTA_THRESHOLD = 45;
export const LOCKOUT_DURATION = 680;
export const DECAY_TIMEOUT = 140;

/**
 * Calculates continuous scroll-driven interpolation for each hook and line.
 * Rhythm per hook:
 *   1. Line 1 in (u: 0.00 -> 0.18)
 *   2. Line 1 hold alone (u: 0.18 -> 0.36)
 *   3. Line 2 in / joins Line 1 (u: 0.36 -> 0.54)
 *   4. Both lines hold complete pair (u: 0.54 -> 0.82)
 *   5. Both lines exit together via dissolve (u: 0.82 -> 1.00)
 */
function calculateLineStyles(progress, index) {
  const hookDuration = 1 / STORY_PHASE_COUNT;
  const hookStart = index * hookDuration;
  const hookEnd = (index + 1) * hookDuration;

  const hiddenLine1 = {
    opacity: 0,
    transform: 'translate3d(0, 28px, 0) scale(0.96)',
    filter: 'blur(6px)',
    visibility: 'hidden',
  };

  const hiddenLine2 = {
    opacity: 0,
    transform: 'translate3d(0, 24px, 0) scale(0.96)',
    filter: 'blur(6px)',
    visibility: 'hidden',
  };

  if (progress < hookStart || progress > hookEnd) {
    return {
      beatVisible: false,
      line1: hiddenLine1,
      line2: hiddenLine2,
    };
  }

  const u = (progress - hookStart) / hookDuration;

  // 1. Line 1 In
  if (u <= 0.18) {
    const t = u / 0.18;
    const ease = t * (2 - t);
    const translateY = (1 - ease) * 28;
    const scale = 0.96 + ease * 0.04;
    const blur = (1 - ease) * 6;

    return {
      beatVisible: true,
      line1: {
        opacity: ease,
        transform: `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`,
        filter: blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : 'none',
        visibility: 'visible',
      },
      line2: hiddenLine2,
    };
  }

  // 2. Line 1 Hold Alone
  if (u <= 0.36) {
    return {
      beatVisible: true,
      line1: {
        opacity: 1,
        transform: 'translate3d(0, 0px, 0) scale(1)',
        filter: 'none',
        visibility: 'visible',
      },
      line2: hiddenLine2,
    };
  }

  // 3. Line 2 In (Joins Line 1)
  if (u <= 0.54) {
    const t = (u - 0.36) / 0.18;
    const ease = t * (2 - t);
    const translateY = (1 - ease) * 24;
    const scale = 0.96 + ease * 0.04;
    const blur = (1 - ease) * 6;

    return {
      beatVisible: true,
      line1: {
        opacity: 1,
        transform: 'translate3d(0, 0px, 0) scale(1)',
        filter: 'none',
        visibility: 'visible',
      },
      line2: {
        opacity: ease,
        transform: `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`,
        filter: blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : 'none',
        visibility: 'visible',
      },
    };
  }

  // 4. Both Lines Hold Complete (Legible Beat)
  if (u <= 0.82) {
    return {
      beatVisible: true,
      line1: {
        opacity: 1,
        transform: 'translate3d(0, 0px, 0) scale(1)',
        filter: 'none',
        visibility: 'visible',
      },
      line2: {
        opacity: 1,
        transform: 'translate3d(0, 0px, 0) scale(1)',
        filter: 'none',
        visibility: 'visible',
      },
    };
  }

  // 5. Both Lines Exit Together (Dissolve)
  const t = (u - 0.82) / 0.18;
  const ease = t * t;
  const opacity = 1 - ease;
  const translateY = -ease * 24;
  const scale = 1 - ease * 0.04;
  const blur = ease * 8;

  return {
    beatVisible: opacity > 0.01,
    line1: {
      opacity,
      transform: `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`,
      filter: blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : 'none',
      visibility: opacity > 0.01 ? 'visible' : 'hidden',
    },
    line2: {
      opacity,
      transform: `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`,
      filter: blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : 'none',
      visibility: opacity > 0.01 ? 'visible' : 'hidden',
    },
  };
}

export default function ClientStory() {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const phaseIndexRef = useRef(0);
  const beatRefs = useRef([]);
  const leadRefs = useRef([]);
  const statementRefs = useRef([]);
  const deltaAccumulatorRef = useRef(0);
  const lastWheelTimeRef = useRef(0);
  const lockTimerRef = useRef(0);
  const decayTimerRef = useRef(0);
  const touchStartYRef = useRef(0);

  const phaseInfo = getStoryPhase(activePhaseIndex);

  const goToPhase = useCallback((targetIndex, smoothScroll = true) => {
    const nextIndex = Math.min(Math.max(targetIndex, 0), STORY_PHASE_COUNT - 1);
    phaseIndexRef.current = nextIndex;
    setActivePhaseIndex(nextIndex);

    if (smoothScroll && typeof window !== 'undefined') {
      const section = document.getElementById('problem') || document.getElementById('client-story');
      if (section) {
        const rect = section.getBoundingClientRect();
        const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
        const sectionTop = window.scrollY + rect.top;
        // Scroll to the midpoint of the complete hold phase (u ≈ 0.68)
        const targetScroll = sectionTop + scrollDistance * ((nextIndex + 0.68) / STORY_PHASE_COUNT);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;

    const applyScrollProgress = () => {
      const section = document.getElementById('problem') || document.getElementById('client-story');
      if (!section) return;

      if (prefersReducedMotion) {
        beatRefs.current.forEach((el, index) => {
          if (!el) return;
          el.style.visibility = 'visible';
          el.style.opacity = '1';
          el.style.pointerEvents = 'auto';

          const lead = leadRefs.current[index];
          if (lead) {
            lead.style.opacity = '1';
            lead.style.transform = 'none';
            lead.style.filter = 'none';
            lead.style.visibility = 'visible';
          }

          const statement = statementRefs.current[index];
          if (statement) {
            statement.style.opacity = '1';
            statement.style.transform = 'none';
            statement.style.filter = 'none';
            statement.style.visibility = 'visible';
          }
        });
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(-rect.top / scrollDistance, 0), 1);
      const computedIndex = Math.min(Math.floor(progress * STORY_PHASE_COUNT), STORY_PHASE_COUNT - 1);

      if (computedIndex !== phaseIndexRef.current) {
        phaseIndexRef.current = computedIndex;
        setActivePhaseIndex(computedIndex);
      }

      // 60/120fps direct hardware-accelerated transform & opacity updates per line
      beatRefs.current.forEach((beatEl, index) => {
        if (!beatEl) return;
        const { beatVisible, line1, line2 } = calculateLineStyles(progress, index);

        beatEl.style.visibility = beatVisible ? 'visible' : 'hidden';
        beatEl.style.pointerEvents = beatVisible ? 'auto' : 'none';

        const leadEl = leadRefs.current[index];
        if (leadEl) {
          leadEl.style.opacity = String(line1.opacity);
          leadEl.style.transform = line1.transform;
          leadEl.style.filter = line1.filter;
          leadEl.style.visibility = line1.visibility;
        }

        const statementEl = statementRefs.current[index];
        if (statementEl) {
          statementEl.style.opacity = String(line2.opacity);
          statementEl.style.transform = line2.transform;
          statementEl.style.filter = line2.filter;
          statementEl.style.visibility = line2.visibility;
        }
      });
    };

    const queueSelection = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        applyScrollProgress();
      });
    };

    window.addEventListener('scroll', queueSelection, { passive: true });
    window.addEventListener('resize', queueSelection, { passive: true });

    const onWheel = (event) => {
      if (prefersReducedMotion || !event.deltaY) return;

      const section = document.getElementById('problem') || document.getElementById('client-story');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

      deltaAccumulatorRef.current += event.deltaY;
      lastWheelTimeRef.current = Date.now();

      if (Math.abs(deltaAccumulatorRef.current) >= DELTA_THRESHOLD) {
        deltaAccumulatorRef.current = 0;
      }
    };

    const onTouchStart = (event) => {
      if (event.touches && event.touches[0]) {
        touchStartYRef.current = event.touches[0].clientY;
      }
    };

    const onTouchMove = (event) => {
      if (prefersReducedMotion || !event.touches || !event.touches[0]) return;
      const currentY = event.touches[0].clientY;
      const deltaY = touchStartYRef.current - currentY;
      if (Math.abs(deltaY) >= DELTA_THRESHOLD) {
        touchStartYRef.current = currentY;
      }
    };

    const onKeyDown = (event) => {
      if (prefersReducedMotion) return;

      const section = document.getElementById('problem') || document.getElementById('client-story');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

      if (['ArrowDown', 'PageDown', ' '].includes(event.key)) {
        if (phaseIndexRef.current < STORY_PHASE_COUNT - 1) {
          event.preventDefault();
          goToPhase(phaseIndexRef.current + 1, true);
        }
      } else if (['ArrowUp', 'PageUp'].includes(event.key)) {
        if (phaseIndexRef.current > 0) {
          event.preventDefault();
          goToPhase(phaseIndexRef.current - 1, true);
        }
      }
    };

    if (!prefersReducedMotion) {
      window.addEventListener('wheel', onWheel, { passive: true });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('keydown', onKeyDown);
    }

    applyScrollProgress();

    return () => {
      window.removeEventListener('scroll', queueSelection);
      window.removeEventListener('resize', queueSelection);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
      if (rafId) window.cancelAnimationFrame(rafId);
      window.clearTimeout(lockTimerRef.current);
      window.clearTimeout(decayTimerRef.current);
    };
  }, [goToPhase]);

  return (
    <section
      id="problem"
      className="client-story chapter-problem"
      aria-labelledby="chapter-01-title"
      data-section="problem"
      style={{ '--story-scroll-height': `${STORY_PHASE_COUNT * 140}dvh` }}
    >
      {/* Backward-compatible anchor for legacy links */}
      <span id="client-story" className="section-anchor-compat" aria-hidden="true" />
      <h2 id="chapter-01-title" className="sr-only">01 · CORE THESIS — Architecture & Systems</h2>

      <div
        className="client-story__stage"
        data-story-phase={phaseInfo.phaseType}
        data-phase-index={activePhaseIndex}
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Cinematic Scroll-Linked Sequential Line Hook Experience */}
        {problemBeats.map((beat, idx) => {
          const isActive = idx === activePhaseIndex;

          return (
            <article
              key={beat.id}
              ref={(el) => {
                beatRefs.current[idx] = el;
              }}
              data-story-beat={beat.id}
              className={`client-story__beat ${isActive ? 'is-active' : ''}`}
              aria-hidden={!isActive}
            >
              <div className="client-story__line client-story__line--hook">
                <h3
                  ref={(el) => {
                    leadRefs.current[idx] = el;
                  }}
                  className="client-story__lead"
                >
                  {beat.title}
                </h3>
                <p
                  ref={(el) => {
                    statementRefs.current[idx] = el;
                  }}
                  className="client-story__statement"
                >
                  {beat.statement}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
