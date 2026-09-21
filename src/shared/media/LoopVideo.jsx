import { useEffect, useRef } from 'react';

export default function LoopVideo({ src, className = '', alt = '', ...props }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncPlayback = () => {
      if (mediaQuery.matches || document.hidden) {
        video.pause();
      } else {
        video.play().catch(() => {
          // Handled: browser autoplay restrictions
        });
      }
    };

    syncPlayback();

    const handleVisibility = () => syncPlayback();
    const handleMotionChange = () => syncPlayback();

    document.addEventListener('visibilitychange', handleVisibility);
    mediaQuery.addEventListener?.('change', handleMotionChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      mediaQuery.removeEventListener?.('change', handleMotionChange);
    };
  }, [src]);

  return (
    <video
      {...props}
      ref={videoRef}
      className={className}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  );
}
