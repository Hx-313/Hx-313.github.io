import { useEffect, useRef, useState } from 'react';
import './section-motion.css';

export const SECTION_MOTIONS = Object.freeze([
  'projects',
  'about',
  'services',
  'domains',
  'certifications',
  'tools',
  'contact',
  'testimonials',
]);

export default function SectionReveal({ motion = 'services', className = '', id, children, ...rest }) {
  const sectionRef = useRef(null);
  const [isMotionReady, setIsMotionReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const subject = SECTION_MOTIONS.includes(motion) ? motion : 'services';

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return undefined;

    setIsMotionReady(true);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.14,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      id={id}
      className={`section-reveal section-reveal--${subject} ${isMotionReady ? 'is-motion-ready' : ''} ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
      data-motion={subject}
      {...rest}
    >
      {children}
    </div>
  );
}

