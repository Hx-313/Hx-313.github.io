import { useEffect, useRef, useState } from 'react';
import { howIBuildData } from './howIBuildData.js';
import ToolIcon from './ToolIcons.jsx';
import './how-i-build.css';

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
          {/* Left Column: Label + Narrative Copy + Tag Chips */}
          <div className="how-i-build-narrative">
            <span id="how-i-build-heading" className="how-i-build-label">
              {howIBuildData.label}
            </span>

            <div className="how-i-build-copy">
              {howIBuildData.paragraphs.map((paragraph, index) => (
                <p key={index} className="how-i-build-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Tag Chips Row */}
            <div
              className="how-i-build-tags"
              role="list"
              aria-label="Engineering competencies"
            >
              {howIBuildData.tags.map((tag) => (
                <span key={tag} className="how-i-build-tag" role="listitem">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: 3×4 Tool Grid with Divider Lines */}
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
