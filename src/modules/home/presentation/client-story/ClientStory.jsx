import { useEffect, useRef, useState } from 'react';
import { storyBeats } from './storyData.js';
import './client-story.css';

const STORY_PHASES = storyBeats.length * 2;

export default function ClientStory() {
  const phaseIndexRef = useRef(0);
  const wheelLockRef = useRef(false);
  const [storyState, setStoryState] = useState({
    id: storyBeats[0].id,
    phase: 'title',
  });

  useEffect(() => {
    let selectionTimer = 0;

    const selectStoryPhase = () => {
      const section = document.getElementById('client-story');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(-rect.top / scrollDistance, 0), 1);
      const phaseIndex = Math.min(Math.floor(progress * STORY_PHASES), STORY_PHASES - 1);
      const beat = storyBeats[Math.floor(phaseIndex / 2)];
      const phase = phaseIndex % 2 === 0 ? 'title' : 'statement';
      phaseIndexRef.current = phaseIndex;

      setStoryState((previous) => (
        previous.id === beat.id && previous.phase === phase
          ? previous
          : { id: beat.id, phase }
      ));
    };

    const queueSelection = () => {
      if (selectionTimer) return;
      selectionTimer = window.setTimeout(() => {
        selectionTimer = 0;
        selectStoryPhase();
      }, 32);
    };

    window.addEventListener('scroll', queueSelection, { passive: true });
    window.addEventListener('resize', queueSelection);

    const advanceOnePhase = (event) => {
      if (!event.deltaY || wheelLockRef.current) return;

      const section = document.getElementById('client-story');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

      const direction = event.deltaY > 0 ? 1 : -1;
      const atFirstPhase = phaseIndexRef.current === 0 && direction < 0;
      const atLastPhase = phaseIndexRef.current === STORY_PHASES - 1 && direction > 0;
      if (atFirstPhase || atLastPhase) return;

      event.preventDefault();
      wheelLockRef.current = true;
      const nextPhase = Math.min(
        Math.max(phaseIndexRef.current + direction, 0),
        STORY_PHASES - 1,
      );
      const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
      const sectionTop = window.scrollY + rect.top;
      const target = sectionTop + scrollDistance * ((nextPhase + 0.5) / STORY_PHASES);
      window.scrollTo({ top: target, behavior: 'smooth' });
      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 620);
    };

    window.addEventListener('wheel', advanceOnePhase, { passive: false });
    selectStoryPhase();

    return () => {
      window.removeEventListener('scroll', queueSelection);
      window.removeEventListener('resize', queueSelection);
      window.removeEventListener('wheel', advanceOnePhase);
      window.clearTimeout(selectionTimer);
    };
  }, []);

  return (
    <section
      id="client-story"
      className="client-story"
      aria-labelledby="client-story-title"
      style={{ '--story-scroll-height': `${storyBeats.length * 110}dvh` }}
    >
      <h2 id="client-story-title" className="sr-only">From uncertainty to evidence</h2>

      <div
        className="client-story__stage"
        data-story-phase={storyState.phase}
        aria-live="polite"
        aria-atomic="true"
      >
        {storyBeats.map((beat) => {
          const isActive = beat.id === storyState.id;

          return (
            <article
              key={beat.id}
              data-story-beat={beat.id}
              className={`client-story__beat ${isActive ? 'is-active' : ''}`}
              aria-hidden={!isActive}
            >
              <div className="client-story__line client-story__line--title">
                <h3>{beat.title}</h3>
              </div>

              <div className="client-story__line client-story__line--statement">
                <p className="client-story__statement">{beat.statement}</p>
                {beat.detail && <p className="client-story__detail">{beat.detail}</p>}
                {beat.ctaLabel && (
                  <a className="client-story__cta" href="#command-center">
                    {beat.ctaLabel} <span aria-hidden="true">↓</span>
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
