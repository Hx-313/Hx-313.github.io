import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { animate, stagger } from 'animejs';
import './opening.css';

const STATEMENTS = [
  'IDEAS NEED STRUCTURE.',
  'PRODUCTS NEED MOMENTUM.',
  'MOMENTUM NEEDS CONVICTION.',
];

export default function OpeningExperience({ isRevealing, onComplete, theme }) {
  const [statementIndex, setStatementIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const openingRef = useRef(null);
  const starCanvasRef = useRef(null);
  const statementRef = useRef(null);
  const hasCompletedRef = useRef(false);
  const activeAnimationRef = useRef(null);

  // Generate celestial starfield coordinates
  const backgroundStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 50; i++) {
      stars.push({
        id: i,
        x: (i * 19 + 7) % 100,
        y: (i * 23 + 13) % 100,
        size: (i % 3) * 0.8 + 1,
        opacity: (i % 5) * 0.15 + 0.35,
        duration: (i % 4) + 2.5,
        delay: (i % 3) * 0.7,
      });
    }
    return stars;
  }, []);

  const completeOpening = useCallback(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setIsTransitioning(true);

    if (activeAnimationRef.current) {
      try {
        activeAnimationRef.current.pause?.();
      } catch (e) {
        // ignore
      }
    }

    // Forward fly-through and warp cruise out
    if (statementRef.current) {
      animate(statementRef.current, {
        scale: [1, 1.35],
        translateY: [0, 50],
        opacity: [1, 0],
        filter: ['blur(0px)', 'blur(10px)'],
        duration: 650,
        ease: 'inQuad',
      });
    }

    if (openingRef.current) {
      animate(openingRef.current, {
        opacity: [1, 0],
        scale: [1, 1.05],
        duration: 750,
        ease: 'inOutQuad',
        onComplete: () => {
          onComplete();
        },
      });
    }

    // Trigger station arrival handoff halfway through warp cruise for seamless continuity
    const handoffTimer = setTimeout(() => {
      onComplete();
    }, 320);

    return () => clearTimeout(handoffTimer);
  }, [onComplete]);

  // Smooth zero-g space particle canvas with hyperspace warp acceleration
  useEffect(() => {
    const canvas = starCanvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 85 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.6 + 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.15, // gentle upward zero-g drift
      speed: 1,
      color: i % 3 === 0 ? '#10b981' : '#ffffff',
      alpha: Math.random() * 0.5 + 0.25,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isWarping = isTransitioning;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (isWarping) {
          p.speed = p.speed * 1.07 + 0.45;
          p.y -= (p.speed * 3.8 + 2.5);
          p.x += p.vx * 1.8;
        } else {
          p.x += p.vx;
          p.y += p.vy;
        }

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        if (isWarping) {
          // Forward hyperspace vector streaks
          const tail = Math.min(75, p.speed * 4.5);
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + tail);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.radius * 1.5;
          ctx.globalAlpha = Math.min(0.9, p.alpha * 1.8);
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.stroke();
        } else {
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isTransitioning]);

  // Initial loader progression with calibrated snappy pacing
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      completeOpening();
      return undefined;
    }

    if (hasStarted) return undefined;

    const progressObj = { val: 0 };
    const loaderAnim = animate(progressObj, {
      val: 100,
      duration: 1300,
      ease: 'outCubic',
      onRender: () => {
        setLoadingProgress(Math.round(progressObj.val));
      },
      onComplete: () => {
        // Quick 150ms hold at 100% then dissolve into statement chamber
        const startTimer = setTimeout(() => {
          setHasStarted(true);
        }, 150);
        return () => clearTimeout(startTimer);
      },
    });

    return () => {
      try {
        loaderAnim.pause?.();
      } catch (e) {
        // ignore
      }
    };
  }, [hasStarted, completeOpening]);

  // Anime.js Statement orchestration: gentle snappy enter -> readable hold -> smooth exit
  useEffect(() => {
    if (!hasStarted || hasCompletedRef.current) return undefined;

    const container = statementRef.current;
    if (!container) return undefined;

    const wordEls = container.querySelectorAll('.space-word');
    if (!wordEls || wordEls.length === 0) return undefined;

    // Reset initial style states cleanly before entering
    wordEls.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px) scale(0.97)';
    });

    // 1. Snappy staggered entry animation
    const enterAnim = animate(wordEls, {
      opacity: [0, 1],
      translateY: [18, 0],
      scale: [0.97, 1],
      duration: 450,
      delay: stagger(70),
      ease: 'outCubic',
    });
    activeAnimationRef.current = enterAnim;

    // 2. Clean readable hold (~1200ms) then perform smooth exit
    const holdTimer = setTimeout(() => {
      const exitAnim = animate(wordEls, {
        opacity: [1, 0],
        translateY: [0, -14],
        scale: [1, 0.98],
        duration: 350,
        delay: stagger(40, { from: 'last' }),
        ease: 'inOutQuad',
        onComplete: () => {
          if (hasCompletedRef.current) return;
          if (statementIndex < STATEMENTS.length - 1) {
            setStatementIndex((prev) => prev + 1);
          } else {
            completeOpening();
          }
        },
      });
      activeAnimationRef.current = exitAnim;
    }, 1950); // 450ms enter + 1200ms hold + 300ms exit = ~1950ms per statement

    return () => {
      clearTimeout(holdTimer);
      try {
        enterAnim?.pause?.();
      } catch (e) {
        // ignore
      }
    };
  }, [hasStarted, statementIndex, completeOpening]);

  const loaderStatusText = useMemo(() => {
    if (loadingProgress < 30) return 'INITIALIZING ZERO-G PROTOCOL';
    if (loadingProgress < 65) return 'ALIGNING CELESTIAL VECTORS';
    if (loadingProgress < 95) return 'CALIBRATING INTERSTELLAR DRIVE';
    return 'SYSTEM READY // ONLINE';
  }, [loadingProgress]);

  const currentStatement = STATEMENTS[statementIndex] || STATEMENTS[0];
  const words = currentStatement.split(' ');

  return (
    <section
      ref={openingRef}
      className={`opening ${isTransitioning || isRevealing ? 'opening--blackout' : ''} theme-${theme}`}
      aria-label="Portfolio space introduction"
    >
      {/* 1. Starfield Canvas */}
      <canvas ref={starCanvasRef} className="space-star-canvas" aria-hidden="true" />

      {/* 2. Ambient Celestial Glow & Stars */}
      <div className="space-nebula-glow" aria-hidden="true" />
      <div className="space-celestial-field" aria-hidden="true">
        {backgroundStars.map((s) => (
          <span
            key={s.id}
            className="celestial-star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 2.5 Hyperspace Warp Horizon Shockwave */}
      {isTransitioning && <div className="space-warp-shockwave" aria-hidden="true" />}

      {/* 3. Floating Zero-G Space Object Chamber */}
      <div className="opening-center" aria-live="polite" aria-atomic="true">
        {hasStarted && (
          <div ref={statementRef} className="space-statement">
            {/* Gentle 3D Space Orbital Rings around statement */}
            <div className="space-orbit-ring" aria-hidden="true" />

            <div className="space-statement-content">
              {words.map((word, wIdx) => {
                const isLast = wIdx === words.length - 1;
                return (
                  <span
                    key={`${statementIndex}-${word}-${wIdx}`}
                    className={`space-word ${isLast ? 'space-word--accent' : ''}`}
                  >
                    {word}&nbsp;
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Orbital Progress Gauge */}
      {!hasStarted && (
        <div className="space-loader-panel" aria-label={`Orbital Initialization ${loadingProgress}%`}>
          <div className="space-loader-header">
            <span className="space-loader-dot" aria-hidden="true" />
            <span className="space-loader-title">SYSTEM INITIALIZATION // SPACE PROTOCOL</span>
          </div>
          <div className="space-loader-bar">
            <div className="space-loader-fill" style={{ width: `${loadingProgress}%` }} />
          </div>
          <div className="space-loader-footer">
            <span>{loaderStatusText}</span>
            <span className="space-loader-val">{loadingProgress}%</span>
          </div>
        </div>
      )}

      {/* 5. Footer HUD & Skip Button */}
      <div className="opening-footer-hud">
        <p className="space-caption">HAFIZ ALI ABDULLAH · ARCHITECTING SPACE & SYSTEMS · 2026</p>
        <button className="space-skip-btn" type="button" onClick={completeOpening}>
          <span>SKIP TO COMMAND</span>
          <span className="skip-arrow" aria-hidden="true">&gt;&gt;</span>
        </button>
      </div>
    </section>
  );
}
