import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { animate, createTimeline, stagger } from 'animejs';
import AeroMascot from '../../../../components/mascots/AeroMascot.jsx';
import DashMascot from '../../../../components/mascots/DashMascot.jsx';
import OpeningNetworkGlobe from './OpeningNetworkGlobe.jsx';
import OpeningProjection from './OpeningProjection.jsx';
import { getMobileProjectionBounds, MOBILE_PROJECTION_HEIGHT } from './openingMobileGeometry.js';
import { OPENING_BEATS, OPENING_STATEMENTS } from './openingSequence.js';
import { INTRO_TEXT } from '../../../../core/constants/intro/introText.js';
import './opening.css';

const noop = () => {};
const readThemeColor = (token) => getComputedStyle(document.documentElement).getPropertyValue(token).trim();

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
    let lastUpdatedAt = startedAt;
    const update = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const nextProgress = Math.round(progress * 100);
      if (now - lastUpdatedAt >= 100 || nextProgress === 100) {
        setBootProgress(nextProgress);
        lastUpdatedAt = now;
      }
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
      // Beat 0: splash — let the globe settle before the mascots arrive.
      .add(globe, { scale: [1.02, 1], opacity: [0.76, 1], duration: 520, ease: 'outCubic' }, OPENING_BEATS[0].start)
      .call(() => {
        if (!disposed) setBootProgress(100);
      }, OPENING_BEATS[0].end - 100)

      // Beat 1: bring the mascot pair into the center of the stage.
      .add(bootHud, { opacity: [1, 0], y: [0, -12], duration: 480, ease: 'outCubic' }, OPENING_BEATS[1].start)
      .add(globe, {
        scale: [1, 0.96],
        opacity: [1, 0.78],
        duration: OPENING_BEATS[1].end - OPENING_BEATS[1].start,
        ease: 'outCubic',
      }, OPENING_BEATS[1].start)
      const isMobile = window.innerWidth <= 600;

      timeline
        .add([dash, aero], {
          opacity: [0, 1],
          x: (_, index) => {
            if (isMobile) {
              return index === 0 ? ['20vw', '0vw'] : ['-20vw', '0vw'];
            }
            return index === 0 ? ['-30vw', 0] : ['30vw', 0];
          },
          y: ['14vh', '0vh'],
          scale: [0.7, 1],
          duration: OPENING_BEATS[1].end - OPENING_BEATS[1].start,
          ease: 'outCubic',
        }, OPENING_BEATS[1].start)

        // Beat 2: Dash steps to center and introduces the first statement.
        .call(() => setStatement(OPENING_STATEMENTS[0]), OPENING_BEATS[2].start)
        .add(dash, {
          x: isMobile ? ['-6vw', '0vw'] : ['0vw', '-8vw'],
          scale: [1, 1.04],
          opacity: 1,
          duration: 620,
          ease: 'outCubic',
        }, OPENING_BEATS[2].start)
        .add(aero, {
          x: isMobile ? '6vw' : 0,
          scale: isMobile ? 0.88 : 0.94,
          opacity: isMobile ? 0.5 : 0.62,
          duration: 520,
          ease: 'outCubic',
        }, OPENING_BEATS[2].start)
        .add(dashArm, { rotate: [0, 14], duration: 520, ease: 'outCubic' }, OPENING_BEATS[2].start)
        .add(dashProjectionTargets, { opacity: [0, 1], scale: [0.97, 1], duration: 560, ease: 'outCubic' }, OPENING_BEATS[2].start + 80)
        .add(dashProjectionCopy, { opacity: [0, 1], y: [10, 0], delay: stagger(80), duration: 480, ease: 'outCubic' }, OPENING_BEATS[2].start + 80)

        // Beat 3: crossfade the first projection as Dash eases aside.
        .add(dashProjectionTargets, { opacity: [1, 0], scale: [1, 0.97], duration: 480, ease: 'outCubic' }, OPENING_BEATS[3].start)
        .add(dashArm, { rotate: [14, 0], duration: 480, ease: 'outCubic' }, OPENING_BEATS[3].start)
        .add(dash, {
          x: isMobile ? ['0vw', '-6vw'] : ['-8vw', '0vw'],
          opacity: isMobile ? [1, 0.5] : 1,
          scale: isMobile ? [1.04, 0.92] : 1,
          duration: 520,
          ease: 'outCubic',
        }, OPENING_BEATS[3].start)

        // Beat 4: Aero takes center for the second statement.
        .call(() => setStatement(OPENING_STATEMENTS[1]), OPENING_BEATS[4].start)
        .add(aero, {
          x: isMobile ? ['6vw', '0vw'] : ['0vw', '8vw'],
          scale: [0.94, 1.04],
          opacity: 1,
          duration: 620,
          ease: 'outCubic',
        }, OPENING_BEATS[4].start)
        .add(dash, {
          x: isMobile ? '-6vw' : 0,
          scale: isMobile ? 0.92 : 1,
          opacity: isMobile ? 0.5 : 0.62,
          duration: 520,
          ease: 'outCubic',
        }, OPENING_BEATS[4].start)
        .add(aeroArm, { rotate: [0, -12], duration: 520, ease: 'outCubic' }, OPENING_BEATS[4].start)
        .add(aeroProjectionTargets, { opacity: [0, 1], scale: [0.97, 1], duration: 560, ease: 'outCubic' }, OPENING_BEATS[4].start + 80)
        .add(aeroProjectionCopy, { opacity: [0, 1], x: [8, 0], delay: stagger(80), duration: 480, ease: 'outCubic' }, OPENING_BEATS[4].start + 80)

        // Beat 5: both mascots settle into a balanced, quiet pair.
        .add(aeroProjectionTargets, { opacity: [1, 0], scale: [1, 0.97], duration: 480, ease: 'outCubic' }, OPENING_BEATS[5].start)
        .add(aeroArm, { rotate: [-12, 0], duration: 480, ease: 'outCubic' }, OPENING_BEATS[5].start)
        .add(aero, {
          x: isMobile ? ['0vw', '6vw'] : ['8vw', '0vw'],
          scale: isMobile ? 0.92 : 1,
          opacity: isMobile ? [1, 0.5] : 0.72,
          duration: 520,
          ease: 'outCubic',
        }, OPENING_BEATS[5].start)
        .add(dash, {
          x: isMobile ? '-6vw' : 0,
          scale: isMobile ? 0.92 : 1,
          opacity: isMobile ? 0.5 : 0.72,
          duration: 520,
          ease: 'outCubic',
        }, OPENING_BEATS[5].start)

        // Beat 6: Dash returns to center for the final statement.
        .call(() => setStatement(OPENING_STATEMENTS[2]), OPENING_BEATS[6].start)
        .add(dash, {
          x: isMobile ? ['-6vw', '0vw'] : ['0vw', '-8vw'],
          scale: [0.92, 1.04],
          opacity: 1,
          duration: 620,
          ease: 'outCubic',
        }, OPENING_BEATS[6].start)
        .add(aero, {
          x: isMobile ? '6vw' : 0,
          scale: isMobile ? 0.92 : 1,
          opacity: isMobile ? 0.5 : 0.62,
          duration: 520,
          ease: 'outCubic',
        }, OPENING_BEATS[6].start)
        .add(dashArm, { rotate: [0, 14], duration: 520, ease: 'outCubic' }, OPENING_BEATS[6].start)
        .add(dashProjectionTargets, { opacity: [0, 1], scale: [0.97, 1], duration: 560, ease: 'outCubic' }, OPENING_BEATS[6].start + 80)
        .add(dashProjectionCopy, { opacity: [0, 1], y: [10, 0], delay: stagger(80), duration: 480, ease: 'outCubic' }, OPENING_BEATS[6].start + 80)

        // Beat 7: close the transmission and reunite the pair.
        .add(dashProjectionTargets, { opacity: [1, 0], scale: [1, 0.97], duration: 480, ease: 'outCubic' }, OPENING_BEATS[7].start)
        .add(dashArm, { rotate: [14, 0], duration: 480, ease: 'outCubic' }, OPENING_BEATS[7].start)
        .add(dash, {
          x: isMobile ? ['0vw', '-6vw'] : ['-8vw', '0vw'],
          duration: 520,
          ease: 'outCubic',
        }, OPENING_BEATS[7].start)
        .add(aero, {
          x: isMobile ? '6vw' : 0,
          opacity: 1,
          duration: 520,
          ease: 'outCubic',
        }, OPENING_BEATS[7].start)
        .add([dash, aero], { scale: 1, opacity: 1, duration: 520, ease: 'outCubic' }, OPENING_BEATS[7].start)
        .add(root.querySelector('[data-duo-connection]'), { opacity: [0, 0.7, 0], scaleX: [0.4, 1, 1], duration: 680, ease: 'outCubic' }, OPENING_BEATS[7].start + 50)
        .add(globe, {
          scale: [0.96, 1],
          opacity: [0.78, 1],
          duration: 720,
          ease: 'outCubic',
        }, OPENING_BEATS[7].start + 200)
        .add([dash, aero], {
          y: ['0vh', '45vh'],
          opacity: [1, 0],
          duration: 720,
          ease: 'inOutCubic',
        }, OPENING_BEATS[7].start + 200)

      // Beat 8: fade smoothly into the main hero without blocking its content.
      .call(handoff, OPENING_BEATS[8].start)
      .add(root, { opacity: [1, 0], duration: 600, ease: 'outCubic' }, OPENING_BEATS[8].start)
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
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      particles = Array.from({ length: 68 }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.25 + 0.35,
        speed: Math.random() * 0.16 + 0.04,
        color: index % 7 === 0 ? readThemeColor('--color-accent') : readThemeColor('--color-foreground'),
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
    <section ref={openingRef} className="opening" aria-label={INTRO_TEXT.aria.portfolioIntro}>
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
            {bootProgress >= 100 ? INTRO_TEXT.bootHud.ready : INTRO_TEXT.bootHud.initializing}
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
        {INTRO_TEXT.actions.skipIntro} <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}
