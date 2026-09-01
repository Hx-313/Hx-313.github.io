// DataBusOverlay.jsx
import { useEffect, useState } from 'react';

export default function DataBusOverlay({ activeConnectionIds = [], systemConnections = [] }) {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsPulsing(false);
      return;
    }

    setIsPulsing(true);
    const timer = window.setTimeout(() => {
      setIsPulsing(false);
    }, 950);

    return () => window.clearTimeout(timer);
  }, [activeConnectionIds]);

  return (
    <svg
      className={`databus-overlay ${isPulsing ? 'is-pulsing' : ''}`}
      aria-hidden="true"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <defs>
        <linearGradient id="busGradActive" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--story-accent, #10b981)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--color-lime, #79f29a)" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="busGradDim" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(16, 185, 129, 0.12)" />
          <stop offset="100%" stopColor="rgba(16, 185, 129, 0.05)" />
        </linearGradient>
      </defs>

      {/* Decorative bus path traces */}
      {systemConnections.map((conn, i) => {
        const isActive = activeConnectionIds.includes(conn.id);
        const xOffset = 15 + (i * 8.5) % 70;
        const isEvents = conn.bus === 'events';
        const yStart = isEvents ? 28 : 62;
        const yEnd = isEvents ? 42 : 76;

        return (
          <g key={conn.id} className={`bus-connection ${isActive ? 'is-active' : 'is-dim'}`}>
            <line
              x1={`${xOffset}%`}
              y1={`${yStart}%`}
              x2={`${xOffset}%`}
              y2={`${yEnd}%`}
              stroke={isActive ? 'url(#busGradActive)' : 'url(#busGradDim)'}
              strokeWidth={isActive ? '2' : '1'}
              strokeDasharray={isActive ? 'none' : '2 3'}
            />
            {isActive && isPulsing && (
              <circle
                className="bus-pulse-dot"
                cx={`${xOffset}%`}
                cy={`${yStart}%`}
                r="3"
                fill="var(--color-lime, #79f29a)"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
