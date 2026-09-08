import { useEffect, useRef, useState } from 'react';
import { aboutParagraphs, aboutStats } from '../domain/aboutData.js';
import './about.css';

const HEADLINE_TEXT = 'Three years, fifteen systems, zero excuses for crashing.';

export default function AboutSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState(() => aboutStats.map(() => 0));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      setCounts(aboutStats.map((s) => s.targetNumber));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);

          // Fast, synchronized count-up (350ms) across all stats as group settles
          const startTime = performance.now();
          const duration = 350;

          const animateCounts = (now) => {
            const elapsed = Math.min((now - startTime) / duration, 1);
            // easeOutQuad
            const ease = elapsed * (2 - elapsed);

            setCounts(
              aboutStats.map((stat) => {
                const current = stat.targetNumber * ease;
                if (stat.id === 'uptime') {
                  return Number(current.toFixed(1));
                }
                return Math.floor(current);
              })
            );

            if (elapsed < 1) {
              requestAnimationFrame(animateCounts);
            } else {
              setCounts(aboutStats.map((s) => s.targetNumber));
            }
          };

          requestAnimationFrame(animateCounts);
          observer.disconnect();
        }
      },
      {
        threshold: 0.25,
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className={`about-section ${isVisible ? 'is-visible' : ''}`}
      aria-labelledby="about-heading"
    >
      <div className="about-container">
        <div className="about-composition-grid">
          {/* Left Column (~60%): Label + Natural Wrapped Headline + Body Copy */}
          <div className="about-narrative-col">
            <span className="about-label">About me</span>

            <h2 id="about-heading" className="about-headline">
              {HEADLINE_TEXT}
            </h2>

            <div className="about-body">
              <p className="about-paragraph">{aboutParagraphs[0]}</p>
              <p className="about-paragraph">{aboutParagraphs[1]}</p>
              <p className="about-paragraph">
                That same obsession is what led me to build{' '}
                <strong className="about-emphasis-product">WOS EPOS</strong>, a SaaS EPOS system
                running in production right now — not a demo, not a case study screenshot.{' '}
                <span className="about-signal-closing">Real state, real transactions, real uptime.</span>
              </p>
            </div>
          </div>

          {/* Right Column (~40%): Vertically Stacked Stat Mass */}
          <aside className="about-stats-col" aria-label="Key engineering metrics">
            <div className="about-stats-vertical-list" role="list">
              {aboutStats.map((stat, idx) => (
                <div
                  key={stat.id}
                  className={`about-stat-item ${stat.highlight ? 'is-highlight' : ''}`}
                  role="listitem"
                >
                  <div className="about-stat-number">
                    <span className="stat-value">{counts[idx]}</span>
                    <span className="stat-suffix">{stat.suffix}</span>
                  </div>
                  <span className="about-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
