import { useCallback, useEffect, useRef, useState } from 'react';
import { problemBeats, STORY_PHASE_COUNT, getStoryPhase } from './storyData.js';
import './client-story.css';

export const DELTA_THRESHOLD = 45;
export const LOCKOUT_DURATION = 680;
export const DECAY_TIMEOUT = 140;

export default function ClientStory() {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const phaseIndexRef = useRef(0);
  const wheelLockRef = useRef(false);
  const deltaAccumulatorRef = useRef(0);
  const lastWheelTimeRef = useRef(0);
  const lockTimerRef = useRef(0);
  const decayTimerRef = useRef(0);
  const touchStartYRef = useRef(0);

  const phaseInfo = getStoryPhase(activePhaseIndex);
  const activeBeat = phaseInfo.beat;

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
        const targetScroll = sectionTop + scrollDistance * ((nextIndex + 0.5) / STORY_PHASE_COUNT);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;

    const selectStoryPhase = () => {
      const section = document.getElementById('problem') || document.getElementById('client-story');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(-rect.top / scrollDistance, 0), 1);
      const computedIndex = Math.min(Math.floor(progress * STORY_PHASE_COUNT), STORY_PHASE_COUNT - 1);

      if (computedIndex !== phaseIndexRef.current) {
        phaseIndexRef.current = computedIndex;
        setActivePhaseIndex(computedIndex);
      }
    };

    const queueSelection = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        selectStoryPhase();
      });
    };

    window.addEventListener('scroll', queueSelection, { passive: true });
    window.addEventListener('resize', queueSelection, { passive: true });

    // Non-blocking wheel listener preserving contract definitions
    const onWheel = (event) => {
      if (prefersReducedMotion || !event.deltaY) return;

      const section = document.getElementById('problem') || document.getElementById('client-story');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

      // Track gesture delta without blocking the browser scroll thread
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
    selectStoryPhase();

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
      style={{ '--story-scroll-height': `${STORY_PHASE_COUNT * 75}dvh` }}
    >
      {/* Backward-compatible anchor for legacy links */}
      <span id="client-story" className="section-anchor-compat" aria-hidden="true" />
      <h2 id="chapter-01-title" className="sr-only">01 // The Problem — Operational Diagnosis</h2>

      <div
        className="client-story__stage"
        data-story-phase={phaseInfo.phaseType}
        data-phase-index={activePhaseIndex}
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Persistent Technical Chapter Header */}
        <header className="client-story__chapter-marker" aria-hidden="true">
          <div className="chapter-marker-inner">
            <span className="chapter-tag">01 // THE PROBLEM</span>
            <span className="chapter-divider" />
            <span className="chapter-eyebrow">{activeBeat.eyebrow}</span>
            <span className="chapter-divider" />
            <span className="chapter-step-badge">
              {String(activePhaseIndex + 1).padStart(2, '0')} / {String(STORY_PHASE_COUNT).padStart(2, '0')}
            </span>
          </div>
        </header>

        {/* Diagnostic Narrative Beats */}
        {problemBeats.map((beat) => {
          const isActive = beat.id === activeBeat.id;

          return (
            <article
              key={beat.id}
              data-story-beat={beat.id}
              className={`client-story__beat ${isActive ? 'is-active' : ''}`}
              aria-hidden={!isActive}
            >
              {/* Phase 1: Diagnostic Hook / Title */}
              <div className="client-story__line client-story__line--title">
                <h3>{beat.title}</h3>
              </div>

              {/* Phase 2: Statement, Diagnostics & Detail */}
              <div className="client-story__line client-story__line--statement">
                <p className="client-story__statement">{beat.statement}</p>

                {/* Subtle Editorial Diagnostics Grid */}
                {beat.diagnostics && (
                  <div className="client-story__diagnostics" aria-label="System diagnostic telemetry">
                    <div className="diagnostics-grid">
                      {beat.diagnostics.map((diag) => (
                        <div key={diag.label} className="diagnostic-cell">
                          <span className="diag-label">{diag.label}</span>
                          <span className="diag-origin">{diag.origin}</span>
                        </div>
                      ))}
                    </div>
                    <div className="diagnostic-connector" aria-hidden="true">
                      <span className="connector-arrow">↓</span>
                      <span className="connector-tag">{beat.tagline}</span>
                    </div>
                  </div>
                )}

                {beat.detail && <p className="client-story__detail">{beat.detail}</p>}

                {/* Next Chapter Transition Action */}
                {beat.nextChapter && (
                  <div className="client-story__next-wrap">
                    <a className="client-story__cta client-story__cta--next" href={beat.nextChapter.href}>
                      <span>{beat.nextChapter.label}</span>
                      <span className="cta-arrow" aria-hidden="true">↓</span>
                    </a>
                  </div>
                )}
              </div>
            </article>
          );
        })}

        {/* Bottom Technical Telemetry & Phase Stepper */}
        <footer className="client-story__bottom-telemetry" aria-label="Narrative phase tracker">
          <div className="client-story__phase-hud" role="tablist" aria-label="Story phases">
            {Array.from({ length: STORY_PHASE_COUNT }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={idx === activePhaseIndex}
                aria-label={`Story step ${idx + 1} of ${STORY_PHASE_COUNT}`}
                className={`phase-dot ${idx === activePhaseIndex ? 'is-active' : ''}`}
                onClick={() => goToPhase(idx, true)}
              >
                <span className="sr-only">Step {idx + 1}</span>
              </button>
            ))}
          </div>

          <div className="telemetry-card" aria-hidden="true">
            <span className="telemetry-idx">01</span>
            <span className="telemetry-line" />
            <span className="telemetry-type">DIAGNOSIS</span>
          </div>
        </footer>
      </div>
    </section>
  );
}


