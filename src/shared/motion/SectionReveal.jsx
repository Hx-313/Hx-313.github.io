import { useEffect, useRef, useState } from 'react';
import './section-motion.css';

export default function SectionReveal({ className = '', id, children, ...rest }) {
  const sectionRef = useRef(null);
  const [isMotionReady, setIsMotionReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return undefined;

    setIsMotionReady(true);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return undefined;
    }

    let observer;
    let revealed = false;
    let scheduledFrame = 0;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setIsVisible(true);
      observer?.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (scheduledFrame) {
        window.cancelAnimationFrame(scheduledFrame);
        scheduledFrame = 0;
      }
    };
    const handleScroll = () => {
      if (scheduledFrame) return;
      scheduledFrame = window.requestAnimationFrame(() => {
        scheduledFrame = 0;
        const { top, bottom } = element.getBoundingClientRect();
        if (top <= window.innerHeight || bottom <= 0) reveal();
      });
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        reveal();
      },
      {
        rootMargin: '0px 0px 10% 0px',
        threshold: 0.01,
      }
    );

    window.addEventListener('scroll', handleScroll, { passive: true });
    observer.observe(element);
    handleScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (scheduledFrame) window.cancelAnimationFrame(scheduledFrame);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      id={id}
      className={`section-reveal ${isMotionReady ? 'is-motion-ready' : ''} ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}

