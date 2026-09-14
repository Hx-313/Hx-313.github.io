import { useEffect, useRef, useState } from 'react';

export default function FrameSequence({
  frames = [],
  frameDuration = 100,
  alt = '',
  className = '',
  ...imageProps
}) {
  const [frameIndex, setFrameIndex] = useState(0);
  const frameIndexRef = useRef(0);

  useEffect(() => {
    frameIndexRef.current = 0;
    setFrameIndex(0);

    if (frames.length < 2) return undefined;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = 0;
    let startedAt = performance.now();
    let disposed = false;

    const preload = frames.map((src) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = src;
      return image;
    });

    const tick = (now) => {
      if (disposed || mediaQuery.matches || document.hidden) return;

      const nextIndex = Math.floor((now - startedAt) / frameDuration) % frames.length;
      if (nextIndex !== frameIndexRef.current) {
        frameIndexRef.current = nextIndex;
        setFrameIndex(nextIndex);
      }
      animationFrame = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (disposed || mediaQuery.matches || document.hidden || animationFrame) return;
      startedAt = performance.now() - frameIndexRef.current * frameDuration;
      animationFrame = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const handleVisibility = () => {
      stop();
      if (!document.hidden) start();
    };

    const handleMotionChange = () => {
      stop();
      if (!mediaQuery.matches) start();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    mediaQuery.addEventListener?.('change', handleMotionChange);
    start();

    return () => {
      disposed = true;
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
      mediaQuery.removeEventListener?.('change', handleMotionChange);
      preload.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, [frames, frameDuration]);

  return (
    <img
      {...imageProps}
      className={className}
      src={frames[frameIndex] || frames[0]}
      alt={alt}
      draggable="false"
    />
  );
}
