import FrameSequence from '../../../../shared/media/FrameSequence.jsx';
import { proofMetrics } from '../../../../data/metrics.js';
import { GLOBE_FRAMES } from '../media/visualSequences.js';
import { HERO_TEXT } from '../../../../core/constants/hero/heroText.js';

export default function HeroVisual() {
  return (
    <aside
      className="hero-visual"
      aria-label={HERO_TEXT.aria.globePortal}
    >
      <div className="hero-orbit-scene">
        <div className="hero-identity-arc hero-identity-arc--top" aria-hidden="true">
          <div className="hero-arc-track">
            {[0, 1].map((copy) => (
              <span className="hero-arc-chunk" key={copy}>
                <span>{HERO_TEXT.orbitVisual.nameArc}</span>
                <i className="hero-arc-separator">·</i>
                <span>{HERO_TEXT.orbitVisual.rolesArc}</span>
                <i className="hero-arc-separator">·</i>
                <span>{HERO_TEXT.orbitVisual.nameArc}</span>
                <i className="hero-arc-separator">·</i>
                <span>{HERO_TEXT.orbitVisual.rolesArc}</span>
                <i className="hero-arc-separator">·</i>
              </span>
            ))}
          </div>
        </div>

        <div
          className="hero-globe-portal"
          role="img"
          aria-label={HERO_TEXT.aria.globeSequence}
        >
          <FrameSequence
            frames={GLOBE_FRAMES}
            frameDuration={112}
            className="hero-globe-sequence"
            alt=""
          />
          <span className="hero-globe-portal__veil" />
          <span className="hero-globe-portal__ring" />
          <span className="hero-globe-portal__crosshair hero-globe-portal__crosshair--horizontal" />
          <span className="hero-globe-portal__crosshair hero-globe-portal__crosshair--vertical" />
        </div>

        <ul
          className="hero-visual-stats"
          data-hero-enter
          style={{ '--hero-enter-delay': '760ms' }}
          aria-label={HERO_TEXT.aria.proofMetrics}
        >
          {proofMetrics.slice(0, 2).map(([value, label]) => (
            <li className="hero-stat-card" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </li>
          ))}
        </ul>

        <div
          className="hero-visual-readout"
          data-hero-enter
          style={{ '--hero-enter-delay': '880ms' }}
          aria-hidden="true"
        >
          <span>{HERO_TEXT.orbitVisual.readoutStatus}</span>
          <span>{HERO_TEXT.orbitVisual.readoutCode}</span>
        </div>
      </div>

      <p className="hero-identity-accessible">
        {HERO_TEXT.orbitVisual.accessibleBio}
      </p>
    </aside>
  );
}
