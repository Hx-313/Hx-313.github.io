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

function ToolTile({ tool, isActive, onToggle }) {
  const serviceId = `how-i-build-service-${tool.id}`;

  return (
    <div
      className={`how-i-build-tile ${isActive ? 'is-active' : ''}`}
      data-icon={tool.icon}
      role="listitem"
    >
      <button
        type="button"
        className="how-i-build-tile-button"
        aria-expanded={isActive}
        aria-controls={serviceId}
        onClick={() => onToggle(tool.id)}
      >
        <span className="tile-icon-wrap" aria-hidden="true">
          <ToolIcon name={tool.icon} />
        </span>
        <span className="tile-kind">{tool.kind}</span>
        <span className="tile-content">
          <span className="tile-name">{tool.name}</span>
          <span className="tile-description">{tool.description}</span>
          <span
            id={serviceId}
            className="tile-service"
            aria-hidden={!isActive}
          >
            <span className="tile-service-label">{howIBuildData.appliedToLabel}</span>
            <span className="tile-service-value">{tool.service}</span>
          </span>
        </span>
        <span className="tile-reveal-indicator" aria-hidden="true" />
      </button>
    </div>
  );
}

export default function HowIBuild() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeToolId, setActiveToolId] = useState(null);

  const handleToolToggle = (toolId) => {
    setActiveToolId((current) => (current === toolId ? null : toolId));
  };

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
            <h2 id="how-i-build-heading" className="how-i-build-label section-heading">
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
              aria-label={howIBuildData.aria.competencies}
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
            aria-label={howIBuildData.aria.toolGrid}
          >
            {howIBuildData.tools.map((tool) => (
              <ToolTile
                key={tool.id}
                tool={tool}
                isActive={activeToolId === tool.id}
                onToggle={handleToolToggle}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
