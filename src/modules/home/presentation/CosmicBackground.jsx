import { useEffect, useRef, useMemo } from 'react';
import './cosmic-background.css';

export default function CosmicBackground() {
  const canvasRef = useRef(null);

  // Generate celestial stars
  const backgroundStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 72; i++) {
      stars.push({
        id: i,
        x: (i * 17 + 5) % 100,
        y: (i * 29 + 11) % 100,
        size: (i % 3) * 0.8 + 1,
        opacity: (i % 5) * 0.15 + 0.3,
        duration: (i % 4) + 2.5,
        delay: (i % 3) * 0.7,
      });
    }
    return stars;
  }, []);

  // Smooth zero-g space particle canvas spanning the entire viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let animationFrameId;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const numParticles = 95;
    const particles = Array.from({ length: numParticles }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.25 + 0.08), // calm upward zero-g drift
      color: i % 4 === 0 ? '#10b981' : i % 7 === 0 ? '#00f2fe' : '#ffffff',
      alpha: Math.random() * 0.45 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.008,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // Smooth mouse parallax lerp
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulsePhase += p.pulseSpeed;
        const currentAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulsePhase));

        p.x += p.vx + mouseX * 0.15;
        p.y += p.vy + mouseY * 0.15;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowBlur = p.color === '#ffffff' ? 4 : 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="cosmic-page-background" aria-hidden="true">
      {/* 1. Tactical Micro-Grid Mesh Layer */}
      <div className="cosmic-tactical-grid" />

      {/* 2. Interactive Starfield Canvas */}
      <canvas ref={canvasRef} className="cosmic-canvas" />

      {/* 3. Ambient Cosmic Nebula Glow */}
      <div className="cosmic-nebula-glow" />

      {/* 4. Deep Space Ambient Aura 2 */}
      <div className="cosmic-secondary-aura" />

      {/* 5. Twinkling Celestial Starfield */}
      <div className="cosmic-celestial-field">
        {backgroundStars.map((s) => (
          <span
            key={s.id}
            className="cosmic-star"
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
    </div>
  );
}
