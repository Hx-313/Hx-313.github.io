import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { animate, createTimeline, stagger } from 'animejs';
import AeroMascot from '../../../../components/mascots/AeroMascot.jsx';
import DashMascot from '../../../../components/mascots/DashMascot.jsx';
import OpeningNetworkGlobe from './OpeningNetworkGlobe.jsx';
import OpeningProjection from './OpeningProjection.jsx';
import { getMobileProjectionBounds } from './openingMobileGeometry.js';
import { OPENING_BEATS, OPENING_STATEMENTS } from './openingSequence.js';
import './opening.css';

const noop = () => {};

const once = (callback, guard) => {
  if (guard.current) return;
  guard.current = true;
  callback();
};

export default function OpeningExperience({ onHandoff = noop, onComplete = noop }) {
  const [liveStatement, setLiveStatement] = useState(null);
  const openingRef = useRef(null);
  const starCanvasRef = useRef(null);
  const timelineRef = useRef(null);
  const skipAnimationRef = useRef(null);
  const handoffRef = useRef(false);
  const completeRef = useRef(false);

  const backgroundStars = useMemo(() => Array.from({ length: 42 }, (_, index) => ({
    id: index,
    x: (index * 19 + 7) % 100,
    y: (index * 23 + 13) % 100,
    size: (index % 3) * 0.7 + 0.8,
    duration: (index % 4) + 3,
    delay: (index % 5) * 0.45,
  })), []);

  useEffect(() => {
    const root = openingRef.current;
    if (!root) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.dataset.motion = reduced ? 'reduced' : 'standard';

    if (reduced) {
      const reducedTimeline = createTimeline({ defaults: { ease: 'outQuad' } })
        .add(root.querySelectorAll('[data-opening-mascot]'), {
          opacity: [0, 1], y: [12, 0], duration: 180,
        }, 80)
        .call(() => setLiveStatement(OPENING_STATEMENTS[0]), 220)
        .call(() => setLiveStatement(OPENING_STATEMENTS[1]), 600)
        .call(() => setLiveStatement(OPENING_STATEMENTS[2]), 980)
        .call(() => once(onHandoff, handoffRef), 1_340)
        .add(root, { opacity: [1, 0], duration: 300 }, 1_340)
        .call(() => once(onComplete, completeRef), 1_640);

      timelineRef.current = reducedTimeline;
      const handleVisibility = () => (document.hidden ? reducedTimeline.pause() : reducedTimeline.resume());
      document.addEventListener('visibilitychange', handleVisibility);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibility);
        skipAnimationRef.current?.revert?.();
        reducedTimeline.revert();
        timelineRef.current = null;
      };
    }

    const dash = root.querySelector('[data-opening-mascot="dash"]');
    const aero = root.querySelector('[data-opening-mascot="aero"]');
    const globe = root.querySelector('[data-opening-globe]');
    const dashProjection = dash.querySelector('[data-opening-projection]').closest('.opening-projector');
    const aeroProjection = aero.querySelector('[data-opening-projection]').closest('.opening-projector');
    const mobileStage = root.querySelector('[data-opening-mobile-stage]');
    const mobileDashProjection = root.querySelector('[data-opening-mobile-projection="dash"]');
    const mobileAeroProjection = root.querySelector('[data-opening-mobile-projection="aero"]');
    const dashProjectionTargets = [dashProjection, mobileDashProjection].filter(Boolean);
    const aeroProjectionTargets = [aeroProjection, mobileAeroProjection].filter(Boolean);
    const dashProjectionCopy = dashProjectionTargets.flatMap((projection) => [...projection.querySelectorAll('[data-opening-copy] > *')]);
    const aeroProjectionCopy = aeroProjectionTargets.flatMap((projection) => [...projection.querySelectorAll('[data-opening-copy] > *')]);
    const dashArm = dash.querySelector('[data-opening-arm="dash"]');
    const aeroArm = aero.querySelector('[data-opening-arm="aero"]');

    const updateMobileProjectionGeometry = () => {
      if (!mobileStage) return;
      const bounds = getMobileProjectionBounds(window.innerWidth, window.innerHeight);
      mobileStage.style.setProperty('--mobile-projection-left', `${bounds.left}px`);
      mobileStage.style.setProperty('--mobile-projection-top', `${bounds.top}px`);
      mobileStage.style.setProperty('--mobile-projection-width', `${bounds.width}px`);
    };
    updateMobileProjectionGeometry();
    window.addEventListener('resize', updateMobileProjectionGeometry);

    const timeline = createTimeline({ defaults: { ease: 'outCubic' } });
    timeline
      .add(globe, { scale: [1.16, 1], opacity: [0.72, 1], duration: 1_200 }, OPENING_BEATS[0].start)
      .add([dash, aero], {
        opacity: [0, 0.62], y: ['42vh', '18vh'], scale: [0.46, 0.72], duration: 1_520, delay: stagger(120),
      }, OPENING_BEATS[1].start)
      .call(() => root.classList.add('opening--mascots-front'), 2_560)
      .add(globe, { scale: [1, 0.72], y: [0, '-7vh'], opacity: [1, 0.48], duration: 1_000 }, OPENING_BEATS[2].start)
      .add([dash, aero], { y: ['18vh', 0], scale: [0.72, 1], opacity: [0.62, 1], duration: 1_120 }, OPENING_BEATS[2].start)
      .call(() => setLiveStatement(OPENING_STATEMENTS[0]), OPENING_BEATS[3].start)
      .add(aero, { scale: 0.82, opacity: 0.56, filter: 'blur(1.5px) brightness(.72)', duration: 420 }, OPENING_BEATS[3].start)
      .add(dash, { x: '-8vw', scale: 1.08, opacity: 1, filter: 'blur(0px) brightness(1.16)', duration: 420 }, OPENING_BEATS[3].start)
      .add(dashArm, { rotate: [-4, -34], duration: 420 }, 3_680)
      .add(dashProjectionTargets, { opacity: [0, 1], scale: [0.2, 1], duration: 480 }, 3_850)
      .add(dashProjectionCopy, {
        opacity: [0, 1], y: [12, 0], delay: stagger(90), duration: 260,
      }, 4_120)
      .add(dashProjectionTargets, { opacity: [1, 0], scale: [1, 0.72], duration: 240 }, 4_760)
      .call(() => setLiveStatement(OPENING_STATEMENTS[1]), OPENING_BEATS[4].start)
      .add(dash, { scale: 0.82, opacity: 0.56, filter: 'blur(1.5px) brightness(.72)', duration: 400 }, OPENING_BEATS[4].start)
      .add(aero, { x: '7vw', scale: 1.04, opacity: 1, filter: 'blur(0px) brightness(1.14)', duration: 400 }, OPENING_BEATS[4].start)
      .add(aeroArm, { rotate: [0, -18], duration: 480 }, 5_080)
      .add(aeroProjectionTargets, { opacity: [0, 1], scaleX: [0.1, 1], duration: 500 }, 5_240)
      .add(aeroProjectionCopy, {
        opacity: [0, 1], x: [18, 0], delay: stagger(90), duration: 260,
      }, 5_520)
      .add(aeroProjectionTargets, { opacity: [1, 0], scaleX: [1, 0.65], duration: 230 }, 6_170)
      .call(() => setLiveStatement(OPENING_STATEMENTS[2]), OPENING_BEATS[5].start)
      .add(root.querySelector('[data-globe-core]'), { scale: [1, 1.55, 1], opacity: [0.5, 1, 0.5], duration: 600 }, OPENING_BEATS[5].start)
      .add(aero, { scale: 0.82, opacity: 0.56, filter: 'blur(1.5px) brightness(.72)', duration: 400 }, OPENING_BEATS[5].start)
      .add(dash, { scale: 1.1, opacity: 1, filter: 'blur(0px) brightness(1.18)', duration: 400 }, OPENING_BEATS[5].start)
      .add(dashProjectionTargets, { opacity: [0, 1], scale: [0.25, 1.08], duration: 480 }, 6_620)
      .add(dashProjectionCopy, {
        opacity: [0, 1], y: [12, 0], delay: stagger(90), duration: 260,
      }, 6_900)
      .add(dashProjectionTargets, { opacity: [1, 0], scale: [1.08, 0.5], duration: 260 }, 7_540)
      .add([dash, aero], { x: 0, scale: 1, opacity: 1, filter: 'blur(0px) brightness(1)', duration: 500 }, OPENING_BEATS[6].start)
      .add(root.querySelector('[data-duo-connection]'), { opacity: [0, 0.75, 0.2], scaleX: [0.2, 1, 1], duration: 700 }, 7_900)
      .call(() => once(onHandoff, handoffRef), OPENING_BEATS[7].start)
      .add([dash, aero], {
        y: ['0vh', '55vh'],
        x: (_, index) => (index === 0 ? '5vw' : '-5vw'),
        opacity: [1, 0.25],
        duration: 1_300,
      }, OPENING_BEATS[7].start)
      .add(globe, { y: ['-7vh', '-28vh'], scale: [0.72, 0.54], opacity: [0.48, 0], duration: 1_300 }, OPENING_BEATS[7].start)
      .add(root, { y: [0, '-8vh'], opacity: [1, 0], duration: 1_300 }, OPENING_BEATS[7].start)
      .call(() => once(onComplete, completeRef), OPENING_BEATS[7].end);

    timelineRef.current = timeline;
    const handleVisibility = () => (document.hidden ? timeline.pause() : timeline.resume());
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', updateMobileProjectionGeometry);
      skipAnimationRef.current?.revert?.();
      timeline.revert();
      timelineRef.current = null;
    };
  }, [onComplete, onHandoff]);

  useEffect(() => {
    const canvas = starCanvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    let frame = 0;
    let particles = [];
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      particles = Array.from({ length: 68 }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.25 + 0.35,
        speed: Math.random() * 0.16 + 0.04,
        color: index % 7 === 0 ? '#19e68c' : '#dffcf6',
        alpha: Math.random() * 0.45 + 0.14,
      }));
    };
    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      context.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.y -= particle.speed;
        if (particle.y < -8) particle.y = height + 8;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = particle.color;
        context.globalAlpha = particle.alpha;
        context.fill();
      });
      context.globalAlpha = 1;
      frame = window.requestAnimationFrame(render);
    };
    const handleVisibility = () => {
      window.cancelAnimationFrame(frame);
      if (!document.hidden) frame = window.requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const skipOpening = useCallback(() => {
    timelineRef.current?.pause();
    once(onHandoff, handoffRef);
    const root = openingRef.current;
    if (!root) {
      once(onComplete, completeRef);
      return;
    }
    skipAnimationRef.current?.revert?.();
    skipAnimationRef.current = animate(root, {
      opacity: [Number.parseFloat(getComputedStyle(root).opacity) || 1, 0],
      y: [0, '-3vh'],
      duration: 220,
      ease: 'outQuad',
      onComplete: () => once(onComplete, completeRef),
    });
  }, [onComplete, onHandoff]);

  const activeSpeaker = liveStatement?.speaker ?? null;

  return (
    <section ref={openingRef} className="opening" aria-label="HX313 portfolio introduction">
      <canvas ref={starCanvasRef} className="space-star-canvas" aria-hidden="true" />
      <div className="space-celestial-field" aria-hidden="true">
        {backgroundStars.map((star) => (
          <span
            key={star.id}
            className="celestial-star"
            style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size, animationDuration: `${star.duration}s`, animationDelay: `${star.delay}s` }}
          />
        ))}
      </div>

      <div className="opening-cinematic-stage">
        <OpeningNetworkGlobe />
        <div className="opening-mascot opening-mascot--aero" data-opening-mascot="aero" inert="" aria-hidden="true">
          <span className="opening-mascot-thrust" />
          <AeroMascot expression={activeSpeaker === 'aero' ? 'analyzing' : 'happy'} size={180} isFloating={false} />
          <OpeningProjection mascot="aero" statement={OPENING_STATEMENTS[1]} />
        </div>
        <div className="opening-mascot opening-mascot--dash" data-opening-mascot="dash" inert="" aria-hidden="true">
          <span className="opening-mascot-thrust" />
          <DashMascot expression={activeSpeaker === 'dash' ? 'executing' : 'happy'} size={176} isFloating={false} armPose="wave" />
          <OpeningProjection mascot="dash" statement={activeSpeaker === 'dash' ? liveStatement : OPENING_STATEMENTS[0]} />
        </div>
        <div className="opening-mobile-projections" data-opening-mobile-stage aria-hidden="true">
          <OpeningProjection mascot="aero" statement={OPENING_STATEMENTS[1]} mobile />
          <OpeningProjection mascot="dash" statement={activeSpeaker === 'dash' ? liveStatement : OPENING_STATEMENTS[0]} mobile />
        </div>
        <span className="opening-duo-connection" data-duo-connection aria-hidden="true" />
        <div className="opening-reduced-statement" aria-hidden="true">
          <span>{liveStatement?.lead}</span>
          <strong>{liveStatement?.accent}</strong>
        </div>
      </div>

      <p className="opening-live-region" data-opening-live aria-live="polite" aria-atomic="true">
        {liveStatement?.text ?? ''}
      </p>
      <button className="space-skip-btn" type="button" onClick={skipOpening}>
        SKIP INTRO <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}
