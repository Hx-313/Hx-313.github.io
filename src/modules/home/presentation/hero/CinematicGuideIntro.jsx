import { useEffect, useMemo, useState } from 'react';
import DashMascot from '../../../../components/mascots/DashMascot.jsx';

const GUIDE_STEPS = [
  { id: 'rest', duration: 520 },
  { id: 'launch', duration: 760 },
  { id: 'arrive', duration: 360 },
  { id: 'core', duration: 560 },
  { id: 'projection', duration: 820 },
  { id: 'ready', duration: 3600 },
  { id: 'closing', duration: 760 },
];

const OPTIONS = [
  { number: '01', title: "SEE WHAT I'VE BUILT", copy: 'Projects, products and deployed systems.', icon: '◈' },
  { number: '02', title: 'SEE HOW I BUILD', copy: 'Architecture, process and engineering approach.', icon: '⌁' },
  { number: '03', title: 'MEET THE ENGINEER', copy: 'Experience, capabilities and the mindset behind the work.', icon: '◎' },
];

export const GUIDE_INTRO_SEEN_KEY = 'hx313-guide-intro-seen';

export default function CinematicGuideIntro({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const step = GUIDE_STEPS[stepIndex]?.id || 'ready';
  const isProjection = step === 'projection' || step === 'ready' || step === 'closing';

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const onChange = (event) => setReducedMotion(event.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setStepIndex(GUIDE_STEPS.findIndex(({ id }) => id === 'ready'));
      return undefined;
    }
    const current = GUIDE_STEPS[stepIndex];
    if (!current) return undefined;
    const timer = window.setTimeout(() => {
      if (current.id === 'closing') {
        window.sessionStorage.setItem(GUIDE_INTRO_SEEN_KEY, '1');
        onComplete?.();
        return;
      }
      setStepIndex((index) => Math.min(index + 1, GUIDE_STEPS.length - 1));
    }, current.duration);
    return () => window.clearTimeout(timer);
  }, [onComplete, reducedMotion, stepIndex]);

  const statement = useMemo(() => {
    if (step === 'projection' || step === 'ready') return "Hi. I'm Hafiz.";
    return '';
  }, [step]);

  const skip = () => {
    window.sessionStorage.setItem(GUIDE_INTRO_SEEN_KEY, '1');
    onComplete?.();
  };

  return (
    <div className={`guide-intro guide-intro--${step} ${isProjection ? 'guide-intro--projection-visible' : ''}`} aria-live="polite">
      <button className="guide-intro-skip" type="button" onClick={skip}>SKIP INTRO <span aria-hidden="true">→</span></button>

      <div className="guide-dash-flight" aria-hidden="true">
        <DashMascot expression={step === 'arrive' || isProjection ? 'focused' : 'executing'} size={step === 'rest' ? 82 : 190} isFloating={false} armPose="wave" />
        <span className="guide-thruster-trail" />
      </div>

      <div className="guide-speech" aria-hidden={!statement}>
        <span className="guide-speech-label">⚡ DASH // GUIDE SYSTEM</span>
        <span>{statement}</span>
      </div>

      <div className="guide-projection" role={isProjection ? 'dialog' : undefined} aria-modal={isProjection ? 'true' : undefined} aria-label={isProjection ? 'HX313 system introduction' : undefined}>
        <div className="guide-projection-scan" aria-hidden="true" />
        <div className="guide-projection-header"><span>HX313 // SYSTEM INTRODUCTION</span><span className="guide-projection-status">GUIDE ONLINE</span></div>
        <div className="guide-projection-copy">
          <p className="guide-eyebrow">SYSTEM PROJECTION / 01</p>
          <h2>{statement}</h2>
          <p>I design and build software systems<br className="desktop-only" /> from product idea to production.</p>
        </div>
        <div className="guide-options" aria-label="Choose where to start">
          {OPTIONS.map((option) => (
            <button key={option.number} type="button" className={`guide-option ${selected === option.number ? 'is-selected' : ''}`} onClick={() => setSelected(option.number)}>
              <span className="guide-option-top"><span>{option.number}</span><span>{option.icon}</span></span>
              <strong>{option.title}</strong>
              <span>{option.copy}</span>
            </button>
          ))}
        </div>
        <div className="guide-projection-footer"><span>WHERE DO YOU WANT TO START?</span><span className="guide-footer-line" /></div>
      </div>
    </div>
  );
}
