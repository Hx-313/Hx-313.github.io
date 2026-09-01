import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import DataBusOverlay from './DataBusOverlay.jsx';
import { systemLayers, systemConnections } from './howIBuildData.js';

export default function SystemBlueprint({ activeDiscipline }) {
  const containerRef = useRef(null);
  const activeNodeIds = activeDiscipline?.activeNodeIds || [];
  const relatedNodeIds = activeDiscipline?.relatedNodeIds || [];
  const activeConnectionIds = activeDiscipline?.activeConnectionIds || [];

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    try {
      // Smooth anime.js cascade on active blueprint nodes
      animate(containerRef.current.querySelectorAll('.blueprint-node.is-active'), {
        opacity: [0.35, 1],
        translateY: [8, 0],
        duration: 350,
        ease: 'outQuad',
        delay: stagger(45),
      });
    } catch {
      // Graceful fallback to CSS transitions
    }
  }, [activeDiscipline?.id]);

  return (
    <div
      ref={containerRef}
      className="system-blueprint-canvas"
      aria-label="System Delivery Model Blueprint"
    >
      <div className="blueprint-stack">
        {systemLayers.map((layer) => {
          const hasActiveNodes = layer.nodes.some((n) => activeNodeIds.includes(n.id));

          return (
            <div
              key={layer.id}
              className={`blueprint-tier tier--${layer.id} ${hasActiveNodes ? 'is-tier-focused' : 'is-tier-context'}`}
            >
              <div className="tier-header-bar">
                <div className="tier-title-group">
                  <span className="tier-number">{layer.number}</span>
                  <span className="tier-sep" aria-hidden="true">//</span>
                  <span className="tier-name">{layer.title}</span>
                </div>
                <div className="tier-meta-tags">
                  <span className="tier-subtitle">{layer.subtitle}</span>
                  {hasActiveNodes && (
                    <span className="tier-active-tag" aria-hidden="true">
                      ● ACTIVE FOCUS
                    </span>
                  )}
                </div>
              </div>

              <div
                className={`tier-nodes-layout ${hasActiveNodes ? 'layout--expanded' : 'layout--compact'}`}
                role="list"
                aria-label={`${layer.title} components`}
              >
                {layer.nodes.map((node) => {
                  const isActive = activeNodeIds.includes(node.id);
                  const isRelated = !isActive && relatedNodeIds.includes(node.id);
                  const statusClass = isActive ? 'is-active' : isRelated ? 'is-related' : 'is-unrelated';

                  return (
                    <article
                      key={node.id}
                      id={`node-${node.id}`}
                      className={`blueprint-node ${statusClass}`}
                      role="listitem"
                      aria-label={`${node.label}: ${node.detail}`}
                    >
                      <div className="node-head">
                        <span className="node-status-dot" aria-hidden="true" />
                        <strong className="node-title">{node.label}</strong>
                      </div>
                      <span className="node-detail-text">{node.detail}</span>
                    </article>
                  );
                })}
              </div>

              {/* Inter-layer bus separator */}
              {layer.busLabel && (
                <div className="tier-bus-line" aria-hidden="true">
                  <div className="bus-track" />
                  <span className="bus-pill-label">{layer.busLabel}</span>
                  <div className="bus-track" />
                </div>
              )}
            </div>
          );
        })}

        {/* Decorative SVG connection overlay */}
        <DataBusOverlay
          activeConnectionIds={activeConnectionIds}
          systemConnections={systemConnections}
        />
      </div>
    </div>
  );
}
