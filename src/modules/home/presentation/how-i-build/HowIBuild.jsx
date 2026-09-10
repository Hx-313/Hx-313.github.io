import { useEffect, useRef, useState } from 'react';
import { howIBuildData } from './howIBuildData.js';
import ToolIcon from './ToolIcons.jsx';
import './how-i-build.css';

function ScopeTag({ tag }) {
  const [isActive, setIsActive] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);

  const handleClick = () => {
    setIsActive((current) => !current);
    setSparkleKey((current) => current + 1);
  };

  return (
    <button
      type="button"
      className={`how-i-build-tag ${isActive ? 'is-active' : ''}`}
      aria-pressed={isActive}
      onClick={handleClick}
    >
      <span>{tag}</span>
      <span key={sparkleKey} className="how-i-build-sparkles" aria-hidden="true">
        <span className="how-i-build-sparkle how-i-build-sparkle--one">✦</span>
        <span className="how-i-build-sparkle how-i-build-sparkle--two">✧</span>
        <span className="how-i-build-sparkle how-i-build-sparkle--three">✦</span>
        <span className="how-i-build-sparkle how-i-build-sparkle--four">·</span>
      </span>
    </button>
  );
}

export default function HowIBuild() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-i-build"
      ref={sectionRef}
      className={`how-i-build-section ${isVisible ? 'is-visible' : ''}`}
      aria-labelledby="how-i-build-heading"
      data-section="how-i-build"
    >
      <div className="how-i-build-container">
        <div className="how-i-build-layout">
          {/* Left column: narrative copy and scope tags */}
          <div className="how-i-build-narrative">
            <h2 id="how-i-build-heading" className="how-i-build-label">
              {howIBuildData.label}
            </h2>

            <div className="how-i-build-copy">
              {howIBuildData.paragraphs.map((paragraph, index) => (
                <p key={index} className="how-i-build-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>

            <div
              className="how-i-build-tags"
              role="list"
              aria-label="Engineering competencies"
            >
              {howIBuildData.tags.map((tag) => (
                <span key={tag} role="listitem">
                  <ScopeTag tag={tag} />
                </span>
              ))}
            </div>
          </div>

          {/* Right column: benchmark-style 3×4 tool grid */}
          <div
            className="how-i-build-grid"
            role="list"
            aria-label="Technologies and development tools"
          >
            {howIBuildData.tools.map((tool) => (
              <div key={tool.id} className="how-i-build-tile" role="listitem">
                <div className="tile-icon-wrap">
                  <ToolIcon name={tool.icon} />
                </div>
                <div className="tile-content">
                  <h3 className="tile-name">{tool.name}</h3>
                  <p className="tile-description">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
