import { useEffect, useRef, useMemo } from 'react';
import './cosmic-background.css';

export default function CosmicBackground() {
  const canvasRef = useRef(null);

  // Generate celestial stars
  const backgroundStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 65; i++) {
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

  // Smooth zero-g space particle canvas for Page 1
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.6 + 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.15, // gentle upward zero-g drift
      color: i % 3 === 0 ? '#10b981' : '#ffffff',
      alpha: Math.random() * 0.5 + 0.25,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="cosmic-page-background" aria-hidden="true">
      {/* 1. Starfield Canvas */}
      <canvas ref={canvasRef} className="cosmic-canvas" />

      {/* 2. Ambient Cosmic Nebula Glow */}
      <div className="cosmic-nebula-glow" />

      {/* 3. Twinkling Celestial Starfield */}
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
