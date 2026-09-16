import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { animate, createTimeline, stagger } from 'animejs';
import AeroMascot from '../../../../components/mascots/AeroMascot.jsx';
import DashMascot from '../../../../components/mascots/DashMascot.jsx';
import OpeningNetworkGlobe from './OpeningNetworkGlobe.jsx';
import OpeningProjection from './OpeningProjection.jsx';
import { getMobileProjectionBounds, MOBILE_PROJECTION_HEIGHT } from './openingMobileGeometry.js';
import { OPENING_BEATS, OPENING_STATEMENTS } from './openingSequence.js';
import './opening.css';

const noop = () => {};

const callOnce = (callback, guard) => {
  if (guard.current) return;
  guard.current = true;
  callback();
};

export default function OpeningExperience({ onHandoff = noop, onComplete = noop }) {
  const [liveStatement, setLiveStatement] = useState(null);
  const [bootProgress, setBootProgress] = useState(0);
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
    const duration = OPENING_BEATS[0].end;
    let frame = 0;
    const startedAt = performance.now();
    const update = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      setBootProgress(Math.round(progress * 100));
      if (progress < 1) frame = window.requestAnimationFrame(update);
    };

    frame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const root = openingRef.current;
    if (!root) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.dataset.motion = reduced ? 'reduced' : 'standard';

    if (reduced) {
      let disposed = false;
      const setStatement = (statement) => {
        if (!disposed) setLiveStatement(statement);
      };
      const handoff = () => {
        if (!disposed) callOnce(onHandoff, handoffRef);
      };
      const complete = () => {
        if (!disposed) callOnce(onComplete, completeRef);
      };
      const reducedTimeline = createTimeline({ defaults: { ease: 'outQuad' } })
        .add(root.querySelectorAll('[data-opening-mascot]'), {
          opacity: [0, 1], y: [12, 0], duration: 180,
        }, 80)
        .call(() => setStatement(OPENING_STATEMENTS[0]), 220)
        .call(() => setStatement(OPENING_STATEMENTS[1]), 600)
        .call(() => setStatement(OPENING_STATEMENTS[2]), 980)
        .call(handoff, 1_340)
        .add(root, { opacity: [1, 0], duration: 300 }, 1_340)
        .call(complete, 1_640);

      timelineRef.current = reducedTimeline;
      const handleVisibility = () => (document.hidden ? reducedTimeline.pause() : reducedTimeline.resume());
      document.addEventListener('visibilitychange', handleVisibility);
      return () => {
        disposed = true;
        document.removeEventListener('visibilitychange', handleVisibility);
        skipAnimationRef.current?.revert?.();
        reducedTimeline.revert();
        timelineRef.current = null;
      };
    }

    const dash = root.querySelector('[data-opening-mascot="dash"]');
    const aero = root.querySelector('[data-opening-mascot="aero"]');
    const globe = root.querySelector('[data-opening-globe]');
    const bootHud = root.querySelector('[data-opening-boot-hud]');
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
    let disposed = false;
    const setStatement = (statement) => {
      if (!disposed) setLiveStatement(statement);
    };
    const handoff = () => {
      if (!disposed) callOnce(onHandoff, handoffRef);
    };
    const complete = () => {
      if (!disposed) callOnce(onComplete, completeRef);
    };

    const updateMobileProjectionGeometry = () => {
      if (!mobileStage) return;
      const measuredPanelHeight = Math.max(
        MOBILE_PROJECTION_HEIGHT,
        ...[mobileAeroProjection, mobileDashProjection]
          .map((projection) => projection?.querySelector('[data-opening-projection]')?.getBoundingClientRect().height ?? 0),
      );
      const bounds = getMobileProjectionBounds(window.innerWidth, window.innerHeight, measuredPanelHeight);
      mobileStage.style.setProperty('--mobile-projection-left', `${bounds.left}px`);
      mobileStage.style.setProperty('--mobile-projection-top', `${bounds.top}px`);
      mobileStage.style.setProperty('--mobile-projection-width', `${bounds.width}px`);
    };
    updateMobileProjectionGeometry();
    window.addEventListener('resize', updateMobileProjectionGeometry);

    const timeline = createTimeline({ defaults: { ease: 'outCubic' } });
    timeline
      // Beat 0: splash (0 - 6,000ms) - Initializing system while the globe breathes
      .add(globe, { scale: [1.02, 1], opacity: [0.76, 1], duration: 400 }, OPENING_BEATS[0].start)
      .call(() => {
        if (!disposed) setBootProgress(100);
      }, OPENING_BEATS[0].end - 100)

      // Beat 1: settle (6,000 - 6,400ms) - Mascots ease in, globe blurs to background
      .add(bootHud, { opacity: [1, 0], y: [0, -12], duration: 380 }, OPENING_BEATS[1].start)
      .add(globe, {
        scale: [1, 0.94],
        opacity: [1, 0.72],
        filter: ['blur(0px) brightness(1)', 'blur(8px) brightness(0.65)'],
        duration: OPENING_BEATS[1].end - OPENING_BEATS[1].start,
        ease: 'outQuad',
      }, OPENING_BEATS[1].start)
      .add([dash, aero], {
        opacity: [0, 1],
        x: (_, index) => (index === 0 ? ['-30vw', 0] : ['30vw', 0]),
        y: ['14vh', '0vh'],
        scale: [0.7, 1],
        duration: OPENING_BEATS[1].end - OPENING_BEATS[1].start,
        ease: 'outQuad',
      }, OPENING_BEATS[1].start)

      // Beat 2: card-one (2,400 - 4,100ms) - Dash statement 1
      .call(() => setStatement(OPENING_STATEMENTS[0]), OPENING_BEATS[2].start)
      .add(dash, { x: [0, '-4vw'], scale: 1, opacity: 1, filter: 'blur(0px) brightness(1.15) drop-shadow(0 0 24px rgba(25, 230, 140, .45))', duration: 520 }, OPENING_BEATS[2].start)
      .add(aero, { scale: 1, opacity: 0.62, filter: 'blur(1px) brightness(.82)', duration: 300 }, OPENING_BEATS[2].start)
      .add(dashArm, { rotate: [0, 16], duration: 400 }, OPENING_BEATS[2].start)
      .add(dashProjectionTargets, { opacity: [0, 1], scale: [0.94, 1], duration: 460 }, OPENING_BEATS[2].start + 80)
      .add(dashProjectionCopy, { opacity: [0, 1], y: [8, 0], delay: stagger(60), duration: 360 }, OPENING_BEATS[2].start + 80)

      // Beat 3: card-two-transition (4,100 - 4,400ms) - Crossfade between cards
      .add(dashProjectionTargets, { opacity: [1, 0], scale: [1, 0.9], duration: 250 }, OPENING_BEATS[3].start)
      .add(dashArm, { rotate: [16, 0], duration: 250 }, OPENING_BEATS[3].start)
      .add(dash, { x: ['-4vw', 0], duration: 300 }, OPENING_BEATS[3].start)

      // Beat 4: card-two (4,400 - 6,100ms) - Aero statement 2
      .call(() => setStatement(OPENING_STATEMENTS[1]), OPENING_BEATS[4].start)
      .add(aero, { x: [0, '4vw'], scale: 1, opacity: 1, filter: 'blur(0px) brightness(1.15) drop-shadow(0 0 24px rgba(98, 232, 232, .45))', duration: 520 }, OPENING_BEATS[4].start)
      .add(dash, { x: [0, 0], scale: 1, opacity: 0.62, filter: 'blur(1px) brightness(.82)', duration: 300 }, OPENING_BEATS[4].start)
      .add(aeroArm, { rotate: [0, -14], duration: 400 }, OPENING_BEATS[4].start)
      .add(aeroProjectionTargets, { opacity: [0, 1], scale: [0.94, 1], duration: 460 }, OPENING_BEATS[4].start + 80)
      .add(aeroProjectionCopy, { opacity: [0, 1], x: [10, 0], delay: stagger(60), duration: 360 }, OPENING_BEATS[4].start + 80)

      // Beat 5: breather (6,100 - 6,400ms) - Aero card closes, mascots idle
      .add(aeroProjectionTargets, { opacity: [1, 0], scale: [1, 0.9], duration: 250 }, OPENING_BEATS[5].start)
      .add(aeroArm, { rotate: [-14, 0], duration: 250 }, OPENING_BEATS[5].start)
      .add(aero, { x: ['4vw', 0], scale: 1, opacity: 0.75, filter: 'blur(0px) brightness(1)', duration: 300 }, OPENING_BEATS[5].start)
      .add(dash, { scale: 1, opacity: 0.75, filter: 'blur(0px) brightness(1)', duration: 250 }, OPENING_BEATS[5].start)

      // Beat 6: card-three (6,400 - 8,400ms) - Dash statement 3
      .call(() => setStatement(OPENING_STATEMENTS[2]), OPENING_BEATS[6].start)
      .add(dash, { x: [0, '-4vw'], scale: 1, opacity: 1, filter: 'blur(0px) brightness(1.15) drop-shadow(0 0 24px rgba(25, 230, 140, .45))', duration: 520 }, OPENING_BEATS[6].start)
      .add(aero, { scale: 1, opacity: 0.62, filter: 'blur(1px) brightness(.82)', duration: 300 }, OPENING_BEATS[6].start)
      .add(dashArm, { rotate: [0, 16], duration: 400 }, OPENING_BEATS[6].start)
      .add(dashProjectionTargets, { opacity: [0, 1], scale: [0.94, 1], duration: 460 }, OPENING_BEATS[6].start + 80)
      .add(dashProjectionCopy, { opacity: [0, 1], y: [8, 0], delay: stagger(60), duration: 360 }, OPENING_BEATS[6].start + 80)

      // Beat 7: exit (8,400 - 9,200ms) - Cards close, duo connection pulses, globe focuses, mascots slide down
      .add(dashProjectionTargets, { opacity: [1, 0], scale: [1, 0.9], duration: 250 }, OPENING_BEATS[7].start)
      .add(dashArm, { rotate: [16, 0], duration: 250 }, OPENING_BEATS[7].start)
      .add(dash, { x: ['-4vw', 0], duration: 300 }, OPENING_BEATS[7].start)
      .add([dash, aero], { scale: 1, opacity: 1, filter: 'blur(0px) brightness(1)', duration: 250 }, OPENING_BEATS[7].start)
      .add(root.querySelector('[data-duo-connection]'), { opacity: [0, 0.7, 0], scaleX: [0.4, 1, 1], duration: 500 }, OPENING_BEATS[7].start + 50)
      .add(globe, {
        scale: [0.94, 1],
        opacity: [0.72, 1],
        filter: ['blur(8px) brightness(0.65)', 'blur(0px) brightness(1)'],
        duration: 550,
        ease: 'outQuad',
      }, OPENING_BEATS[7].start + 200)
      .add([dash, aero], {
        y: ['0vh', '45vh'],
        opacity: [1, 0],
        duration: 600,
        ease: 'inQuad',
      }, OPENING_BEATS[7].start + 200)

      // Beat 8: transition (9,200 - 9,800ms) - Smooth crossfade into hero
      .call(handoff, OPENING_BEATS[8].start)
      .add(root, { opacity: [1, 0], duration: 600, ease: 'outQuad' }, OPENING_BEATS[8].start)
      .call(complete, OPENING_BEATS[8].end);

    timelineRef.current = timeline;
    const handleVisibility = () => (document.hidden ? timeline.pause() : timeline.resume());
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', updateMobileProjectionGeometry);
      skipAnimationRef.current?.revert?.();
      timeline.pause();
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
    callOnce(onHandoff, handoffRef);
    const root = openingRef.current;
    if (!root) {
      callOnce(onComplete, completeRef);
      return;
    }
    skipAnimationRef.current?.revert?.();
    skipAnimationRef.current = animate(root, {
      opacity: [Number.parseFloat(getComputedStyle(root).opacity) || 1, 0],
      duration: 180,
      ease: 'outQuad',
      onComplete: () => callOnce(onComplete, completeRef),
    });
  }, [onComplete, onHandoff]);

  const activeSpeaker = liveStatement?.speaker ?? null;
  const currentDashStatement = liveStatement?.id === 'statement-three'
    ? OPENING_STATEMENTS[2]
    : OPENING_STATEMENTS[0];

  return (
    <section ref={openingRef} className="opening" aria-label="HX313 portfolio introduction">
      <canvas ref={starCanvasRef} className="space-star-canvas" aria-hidden="true" />
      <div className="space-celestial-field" aria-hidden="true">
        {backgroundStars.map((star) => (
          <span
            key={star.id}
            className="celestial-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Tactical Sci-Fi Loader / Boot Indicator */}
      <div className="opening-boot-hud" data-opening-boot-hud aria-hidden="true">
        <div className="opening-boot-badge">
          <span className="opening-boot-beacon" />
          <span className="opening-boot-title">
            {bootProgress >= 100 ? 'SYSTEM READY' : 'INITIALIZING SYSTEM'}
          </span>
        </div>
        <div className="opening-boot-meter">
          <div className="opening-boot-fill" style={{ width: `${bootProgress}%` }} />
        </div>
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
          <DashMascot expression={activeSpeaker === 'dash' ? 'executing' : 'happy'} size={180} isFloating={false} armPose="wave" />
          <OpeningProjection mascot="dash" statement={currentDashStatement} />
        </div>
        <div className="opening-mobile-projections" data-opening-mobile-stage aria-hidden="true">
          <OpeningProjection mascot="aero" statement={OPENING_STATEMENTS[1]} mobile />
          <OpeningProjection mascot="dash" statement={currentDashStatement} mobile />
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
