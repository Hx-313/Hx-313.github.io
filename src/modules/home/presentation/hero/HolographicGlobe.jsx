import { useEffect, useRef } from 'react';

export default function HolographicGlobe() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let animId = null;
    let width = 0;
    let height = 0;
    let globeRadius = 0;
    const numParticles = 640;
    const particles = [];

    // Generate Points on Sphere (Fibonacci Lattice)
    for (let i = 0; i < numParticles; i += 1) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
      const theta = Math.PI * (1 + 5 ** 0.5) * i;
      particles.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
        size: Math.random() * 1.5 + 1.1,
      });
    }

    let rotationAngle = 0;
    let tiltAngle = 0.26;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = mediaQuery.matches;
    const handleMotionChange = (e) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth || 360;
      height = containerRef.current.clientHeight || 360;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      globeRadius = Math.min(width, height) * 0.4;
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    handleResize();

    // Mouse Drag Listeners
    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      rotationAngle += dx * 0.006;
      tiltAngle += dy * 0.006;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch Support
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMouseX;
      const dy = e.touches[0].clientY - prevMouseY;
      rotationAngle += dx * 0.006;
      tiltAngle += dy * 0.006;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Render Loop
    const render = () => {
      if (!isDragging && !prefersReducedMotion) {
        rotationAngle += 0.0028;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw faint orbital rings around globe
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, globeRadius * 1.18, globeRadius * 0.46, rotationAngle * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(20, 184, 166, 0.14)';
      ctx.beginPath();
      ctx.ellipse(0, 0, globeRadius * 1.32, globeRadius * 0.62, -rotationAngle * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Rotate & Project Particles
      const cosR = Math.cos(rotationAngle);
      const sinR = Math.sin(rotationAngle);
      const cosT = Math.cos(tiltAngle);
      const sinT = Math.sin(tiltAngle);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];

        const x1 = p.x * cosR - p.z * sinR;
        const z1 = p.z * cosR + p.x * sinR;

        const y2 = p.y * cosT - z1 * sinT;
        const z2 = z1 * cosT + p.y * sinT;

        const screenX = cx + x1 * globeRadius;
        const screenY = cy + y2 * globeRadius;

        const depthAlpha = (z2 + 1) / 2;
        if (z2 > -0.35) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, p.size * (0.8 + depthAlpha * 0.7), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(16, 185, 129, ${0.18 + depthAlpha * 0.8})`;
          if (depthAlpha > 0.65) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#22c55e';
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      mediaQuery.removeEventListener('change', handleMotionChange);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div ref={containerRef} className="holographic-globe-container">
      <canvas
        ref={canvasRef}
        className="holographic-globe-canvas"
        role="img"
        aria-label="Interactive 3D Holographic Particle Globe Constellation"
      />
    </div>
  );
}
