import { useEffect, useRef, useState } from 'react';
import './section-motion.css';

const SECTION_SUBJECTS = ['projects', 'about', 'services', 'domains', 'certifications', 'tools', 'contact'];

export default function SectionReveal({ className = '', id, subject, children, ...rest }) {
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: '0px 0px 10% 0px',
        threshold: 0.01,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const subjectClass = subject && SECTION_SUBJECTS.includes(subject) ? `section-reveal--${subject}` : '';

  return (
    <div
      ref={sectionRef}
      id={id}
      className={`section-reveal ${subjectClass} ${isMotionReady ? 'is-motion-ready' : ''} ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}

