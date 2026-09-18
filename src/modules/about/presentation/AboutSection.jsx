import { useEffect, useRef, useState } from 'react';
import { aboutParagraphs } from '../domain/aboutData.js';
import { ABOUT_TEXT } from '../../../core/constants/about/aboutText.js';
import './about.css';

export default function AboutSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState(() => ABOUT_TEXT.stats.map(() => 0));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      setCounts(ABOUT_TEXT.stats.map((s) => s.targetNumber));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);

          const startTime = performance.now();
          const duration = 400;

          const animateCounts = (now) => {
            const elapsed = Math.min((now - startTime) / duration, 1);
            const ease = elapsed * (2 - elapsed);

            setCounts(
              ABOUT_TEXT.stats.map((stat) => {
                const current = stat.targetNumber * ease;
                return Math.floor(current);
              })
            );

            if (elapsed < 1) {
              requestAnimationFrame(animateCounts);
            } else {
              setCounts(ABOUT_TEXT.stats.map((s) => s.targetNumber));
            }
          };

          requestAnimationFrame(animateCounts);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className={`about-section about ${isVisible ? 'is-visible' : ''}`}
      aria-labelledby="about-heading"
    >
      <div className="about-container">
        {/* Accent floating particles */}
        <span className="about-particle particle" style={{ top: '96px', left: '52%' }} aria-hidden="true" />
        <span className="about-particle particle" style={{ top: '200px', left: '31%' }} aria-hidden="true" />
        <span className="about-particle particle" style={{ top: '340px', left: '78%' }} aria-hidden="true" />

        <p className="about-eyebrow eyebrow">{ABOUT_TEXT.label}</p>

        <div className="about-grid grid">
          <h2 id="about-heading" className="about-headline headline">
            <span className="line">{ABOUT_TEXT.headline.line1}</span>
            <span className="line">{ABOUT_TEXT.headline.line2}</span>
            <span className="line soft">{ABOUT_TEXT.headline.line3Soft}</span>
          </h2>

          <div className="about-copy copy about-body">
            <p>{aboutParagraphs[0]}</p>
            <p>{aboutParagraphs[1]}</p>
            <p>
              <strong>{ABOUT_TEXT.featuredProduct}</strong> {ABOUT_TEXT.paragraphs[2]}{' '}
              <a href="#projects" className="about-signal-closing">{ABOUT_TEXT.signalClosing}</a>
            </p>

            <div className="about-credit">
              <span className="about-credit-name">{ABOUT_TEXT.credit.name}</span>
              <span className="about-credit-title">{ABOUT_TEXT.credit.title}</span>
            </div>
          </div>
        </div>

        <div className="about-kpis kpis" aria-label={ABOUT_TEXT.aria.keyMetrics}>
          {ABOUT_TEXT.stats.map((stat, idx) => (
            <div className="about-kpi kpi" key={stat.id}>
              <div className="about-kpi-num num">
                <span>{counts[idx]}</span>
                {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
              </div>
              <div className="about-kpi-lbl lbl">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
