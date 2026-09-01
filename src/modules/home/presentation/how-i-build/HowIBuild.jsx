import { useState, useEffect, useRef } from 'react';
import { animate } from 'animejs';
import SystemBlueprint from './SystemBlueprint.jsx';
import DisciplineControllers from './DisciplineControllers.jsx';
import { howIBuildContent, disciplines } from './howIBuildData.js';
import './how-i-build.css';

export default function HowIBuild() {
  const [activeDisciplineId, setActiveDisciplineId] = useState(disciplines[0].id);
  const activeDiscipline = disciplines.find((d) => d.id === activeDisciplineId) || disciplines[0];
  const panelRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !panelRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    try {
      animate(panelRef.current, {
        opacity: [0.4, 1],
        translateY: [6, 0],
        duration: 320,
        ease: 'outQuad',
      });
    } catch {
      // Fallback
    }
  }, [activeDisciplineId]);

  return (
    <section
      id="how-i-build"
      className="how-i-build-section"
      aria-labelledby="chapter-02-title"
      data-section="how-i-build"
    >
      <div className="how-i-build__container">
        {/* 1. EDITORIAL HEADER */}
        <header className="how-i-build__header">
          <div className="chapter-marker-pill">
            <span className="pill-chapter">02 // {howIBuildContent.kicker}</span>
            <span className="pill-divider" aria-hidden="true" />
            <span className="pill-tagline">{howIBuildContent.tagline}</span>
          </div>

          <h2 id="chapter-02-title" className="how-i-build__hook-headline">
            <span>{howIBuildContent.statementPart1}</span>
            <strong className="accent-statement">{howIBuildContent.statementPart2}</strong>
          </h2>

          <p className="how-i-build__subtext">{howIBuildContent.description}</p>
        </header>

        {/* 2. UNIFIED ARCHITECTURAL CONSOLE */}
        <div className="how-i-build__console-card">
          {/* Top: Segmented Discipline Tabs */}
          <div className="console-controls-header">
            <DisciplineControllers
              activeDisciplineId={activeDisciplineId}
              onSelectDiscipline={setActiveDisciplineId}
            />
          </div>

          {/* Console Body: Split Architecture & Reasoning */}
          <div className="console-split-body">
            {/* Left: Active Discipline Deep-Dive & Reasoning Panel */}
            <div
              id="discipline-panel"
              role="tabpanel"
              className="discipline-reasoning-panel"
              aria-labelledby={`discipline-tab-${activeDiscipline.id}`}
              tabIndex={0}
              ref={panelRef}
            >
              <div className="panel-badge-row">
                <span className="panel-number-pill">
                  {activeDiscipline.number} // {activeDiscipline.label}
                </span>
                <span className="panel-focus-tag">DISCIPLINE FOCUS</span>
              </div>

              <h3 className="panel-lead-headline">{activeDiscipline.headline}</h3>

              {/* Stack Chips */}
              <div className="panel-stack-section">
                <span className="stack-label">PRIMARY STACK</span>
                <div className="stack-chips-group">
                  {activeDiscipline.stack.split('•').map((tech) => (
                    <span key={tech.trim()} className="tech-chip">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="panel-summary-box">
                <span className="summary-label">ARCHITECTURAL APPROACH</span>
                <p className="summary-text">{activeDiscipline.summary}</p>
              </div>
            </div>

            {/* Right: Living System Map Blueprint */}
            <div className="console-blueprint-view">
              <SystemBlueprint activeDiscipline={activeDiscipline} />
            </div>
          </div>

          {/* Console Footer: Engineering Priorities */}
          <div className="console-priorities-footer">
            <span className="priorities-tag">{howIBuildContent.prioritiesLabel}</span>
            <div className="priorities-chips" role="list">
              {howIBuildContent.priorities.map((priority) => (
                <span key={priority} className="priority-pill" role="listitem">
                  <span className="priority-bullet" aria-hidden="true">•</span>
                  {priority}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. CHAPTER BRIDGE BANNER */}
        <div className="chapter-bridge-banner">
          <p className="bridge-lead">{howIBuildContent.bridgeLead}</p>
          <a className="bridge-cta-btn" href={howIBuildContent.bridgeCta.href}>
            <span>{howIBuildContent.bridgeCta.label}</span>
            <span className="btn-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
