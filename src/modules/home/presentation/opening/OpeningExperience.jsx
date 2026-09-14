import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, createTimeline } from 'animejs';
import AeroMascot from '../../../../components/mascots/AeroMascot.jsx';
import DashMascot from '../../../../components/mascots/DashMascot.jsx';
import FrameSequence from '../../../../shared/media/FrameSequence.jsx';
import { ORB_FRAMES } from '../media/visualSequences.js';
import { OPENING_BEATS } from './openingSequence.js';
import './opening.css';

const noop = () => {};
const LOADER_DURATION = OPENING_BEATS[0].end;

function formatLoaderTime(milliseconds) {
  const seconds = Math.min(Math.max(milliseconds, 0), LOADER_DURATION) / 1000;
  return `00:${seconds.toFixed(1).padStart(4, '0')}`;
}

function callOnce(callback, guard) {
  if (guard.current) return;
  guard.current = true;
  callback();
}

export default function OpeningExperience({ onHandoff = noop, onComplete = noop }) {
  const [phase, setPhase] = useState('splash');
  const [loaderElapsed, setLoaderElapsed] = useState(0);
  const openingRef = useRef(null);
  const timelineRef = useRef(null);
  const skipAnimationRef = useRef(null);
  const handoffRef = useRef(false);
  const completeRef = useRef(false);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setLoaderElapsed(LOADER_DURATION);
      return () => {
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousDocumentOverflow;
      };
    }

    let animationFrame = 0;
    let elapsed = 0;
    let lastTick = performance.now();

    const tick = (now) => {
      elapsed = Math.min(LOADER_DURATION, elapsed + now - lastTick);
      lastTick = now;
      const displayElapsed = Math.floor(elapsed / 100) * 100;
      setLoaderElapsed((current) => (current === displayElapsed ? current : displayElapsed));

      if (elapsed < LOADER_DURATION) {
        animationFrame = window.requestAnimationFrame(tick);
      } else {
        animationFrame = 0;
      }
    };

    const start = () => {
      if (!animationFrame) {
        lastTick = performance.now();
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    const stop = () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else if (elapsed < LOADER_DURATION) {
        start();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    start();

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
    };
  }, []);

  useEffect(() => {
    const root = openingRef.current;
    if (!root) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.dataset.motion = reduced ? 'reduced' : 'standard';

    const orbStage = root.querySelector('[data-opening-orb-stage]');
    const orb = root.querySelector('[data-opening-orb]');
    const aero = root.querySelector('[data-opening-mascot="aero"]');
    const dash = root.querySelector('[data-opening-mascot="dash"]');

    if (reduced) {
      setPhase('reduced');
      callOnce(onHandoff, handoffRef);
      const timer = window.setTimeout(() => callOnce(onComplete, completeRef), 520);
      return () => window.clearTimeout(timer);
    }

    let disposed = false;
    const setActivePhase = (nextPhase) => {
      if (!disposed) setPhase(nextPhase);
    };
    const handoff = () => {
      if (!disposed) callOnce(onHandoff, handoffRef);
    };
    const complete = () => {
      if (!disposed) callOnce(onComplete, completeRef);
    };

    const timeline = createTimeline({ defaults: { ease: 'outCubic' } });
    timeline
      .call(() => setActivePhase('unfocus'), OPENING_BEATS[1].start)
      .add(orb, {
        scale: [1, 0.7],
        opacity: [1, 0.72],
        filter: ['blur(0px) brightness(1)', 'blur(10px) brightness(.72)'],
        duration: OPENING_BEATS[1].end - OPENING_BEATS[1].start,
        ease: 'outQuad',
      }, OPENING_BEATS[1].start)
      .call(() => setActivePhase('mascot-entrance'), OPENING_BEATS[2].start)
      // Mascot SVGs currently do not expose completion callbacks, so the
      // agreed 1.5s entrance beat controls their settle/exit and refocus.
      .add(aero, {
        opacity: [0, 1],
        x: ['-58vw', '-25vw'],
        y: ['7vh', '0vh'],
        scale: [0.62, 1],
        filter: ['blur(8px) brightness(.65)', 'blur(0px) brightness(1)'],
        duration: OPENING_BEATS[2].end - OPENING_BEATS[2].start,
        ease: 'outExpo',
      }, OPENING_BEATS[2].start)
      .add(dash, {
        opacity: [0, 1],
        x: ['58vw', '25vw'],
        y: ['7vh', '0vh'],
        scale: [0.62, 1],
        filter: ['blur(8px) brightness(.65)', 'blur(0px) brightness(1)'],
        duration: OPENING_BEATS[2].end - OPENING_BEATS[2].start,
        ease: 'outExpo',
      }, OPENING_BEATS[2].start)
      .call(() => setActivePhase('refocus'), OPENING_BEATS[3].start)
      .add([aero, dash], {
        opacity: [1, 0],
        y: ['0vh', '8vh'],
        scale: [1, 0.82],
        filter: ['blur(0px) brightness(1)', 'blur(4px) brightness(.7)'],
        duration: OPENING_BEATS[3].end - OPENING_BEATS[3].start,
        ease: 'inQuad',
      }, OPENING_BEATS[3].start)
      .add(orb, {
        scale: [0.7, 1],
        opacity: [0.72, 1],
        filter: ['blur(10px) brightness(.72)', 'blur(0px) brightness(1)'],
        duration: OPENING_BEATS[3].end - OPENING_BEATS[3].start,
        ease: 'outQuad',
      }, OPENING_BEATS[3].start)
      .call(() => {
        setActivePhase('transition');
        handoff();
      }, OPENING_BEATS[4].start)
      .add(orbStage, {
        scale: [1, 14],
        opacity: [1, 0],
        filter: ['blur(0px)', 'blur(2px)'],
        duration: OPENING_BEATS[4].end - OPENING_BEATS[4].start,
        ease: 'inExpo',
      }, OPENING_BEATS[4].start)
      .add(root, {
        opacity: [1, 0],
        duration: OPENING_BEATS[4].end - OPENING_BEATS[4].start,
        ease: 'outQuad',
      }, OPENING_BEATS[4].start)
      .call(complete, OPENING_BEATS[4].end);

    timelineRef.current = timeline;
    const handleVisibility = () => (document.hidden ? timeline.pause() : timeline.resume());
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      skipAnimationRef.current?.revert?.();
      timeline.pause();
      timeline.revert();
      timelineRef.current = null;
    };
  }, [onComplete, onHandoff]);

  const skipOpening = useCallback(() => {
    timelineRef.current?.pause();
    callOnce(onHandoff, handoffRef);
    setPhase('transition');

    const root = openingRef.current;
    if (!root) {
      callOnce(onComplete, completeRef);
      return;
    }

    skipAnimationRef.current?.revert?.();
    skipAnimationRef.current = animate(root, {
      opacity: [1, 0],
      duration: 180,
      ease: 'outQuad',
      onComplete: () => callOnce(onComplete, completeRef),
    });
  }, [onComplete, onHandoff]);

  return (
    <section
      ref={openingRef}
      className={`opening opening--${phase}`}
      aria-label="Hafiz Ali Abdullah portfolio opening sequence"
    >
      <div className="opening-stage" aria-hidden="true">
        <div className="opening-orb-stage" data-opening-orb-stage>
          <FrameSequence
            frames={ORB_FRAMES}
            frameDuration={82}
            className="opening-orb"
            data-opening-orb
            alt=""
          />
        </div>

        <div className="opening-transmission" data-opening-transmission aria-hidden="true">
          <div className="opening-transmission__inner">
            <span className="opening-transmission__eyebrow">AERO. TRANSMISSION</span>
            <h2 className="opening-transmission__title">
              Your business
              <br />
              relies on
              <br />
              <strong>everything<br />behind it.</strong>
            </h2>
            <span className="opening-transmission__signal">CHANNEL 01 / LIVE</span>
          </div>
        </div>

        <div
          className="opening-mascot opening-mascot--aero"
          data-opening-mascot="aero"
          inert=""
        >
          <span className="opening-mascot__trail opening-mascot__trail--aero" />
          <AeroMascot expression="happy" size={188} isFloating={false} />
        </div>

        <div
          className="opening-mascot opening-mascot--dash"
          data-opening-mascot="dash"
          inert=""
        >
          <span className="opening-mascot__trail opening-mascot__trail--dash" />
          <DashMascot expression="excited" size={184} isFloating={false} armPose="wave" />
        </div>
      </div>

      <div className="opening-loader" aria-hidden="true">
        <div className="opening-loader__meta">
          <span>INITIALIZING</span>
          <span>{formatLoaderTime(loaderElapsed)}</span>
        </div>
        <div className="opening-loader__track">
          <span className="opening-loader__fill" />
        </div>
      </div>

      <p className="opening-live-region" aria-live="polite">
        Hafiz Ali Abdullah portfolio opening sequence.
      </p>

      <button className="space-skip-btn" type="button" onClick={skipOpening}>
        SKIP INTRO <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}
