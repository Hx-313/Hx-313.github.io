import { useEffect, useRef } from 'react';

export default function FrameSequence({
  frames = [],
  frameDuration = 100,
  alt = '',
  className = '',
  ...imageProps
}) {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return undefined;

    let frameIndex = 0;
    imageElement.src = frames[0] || '';
    if (frames.length < 2) return undefined;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timerId = 0;
    let disposed = false;

    const preload = frames.map((src) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = src;
      return image;
    });

    const tick = () => {
      if (disposed || mediaQuery.matches || document.hidden) return;

      frameIndex = (frameIndex + 1) % frames.length;
      imageElement.src = frames[frameIndex];
      timerId = window.setTimeout(tick, frameDuration);
    };

    const start = () => {
      if (disposed || mediaQuery.matches || document.hidden || timerId) return;
      timerId = window.setTimeout(tick, frameDuration);
    };

    const stop = () => {
      if (timerId) {
        window.clearTimeout(timerId);
        timerId = 0;
      }
    };

    const handleVisibility = () => {
      stop();
      if (!document.hidden) start();
    };

    const handleMotionChange = () => {
      stop();
      if (mediaQuery.matches) {
        frameIndex = 0;
        imageElement.src = frames[0] || '';
      } else {
        start();
      }
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
      ref={imageRef}
      className={className}
      src={frames[0] || ''}
      alt={alt}
      draggable="false"
    />
  );
}