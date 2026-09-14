import FrameSequence from '../../../../shared/media/FrameSequence.jsx';
import { proofMetrics } from '../../../../data/metrics.js';
import { GLOBE_FRAMES } from '../media/visualSequences.js';

export default function HeroVisual() {
  return (
    <aside
      className="hero-visual"
      data-hero-enter
      style={{ '--hero-enter-delay': '0ms' }}
      aria-label="Digital green earth globe for Hafiz Ali Abdullah's systems portfolio"
    >
      <div className="hero-orbit-scene">
        <div className="hero-identity-arc hero-identity-arc--top" aria-hidden="true">
          <div className="hero-arc-track">
            <span>Hafiz Ali Abdullah</span>
          </div>
        </div>

        <div className="hero-identity-arc hero-identity-arc--bottom" aria-hidden="true">
          <div className="hero-arc-track">
            <span>Flutter Developer · Mobile Application Developer · SaaS Developer</span>
          </div>
        </div>

        <div
          className="hero-globe-portal"
          role="img"
          aria-label="Looping digital green earth representing connected products and systems"
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

        <ul className="hero-visual-stats" aria-label="Selected proof points">
          {proofMetrics.slice(0, 2).map(([value, label]) => (
            <li className="hero-stat-card" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </li>
          ))}
        </ul>

        <div className="hero-visual-readout" aria-hidden="true">
          <span>LIVE / CONNECTED</span>
          <span>GLB—01</span>
        </div>
      </div>

      <p className="hero-identity-accessible">
        Hafiz Ali Abdullah. Flutter Developer, Mobile Application Developer, and SaaS Developer.
      </p>
    </aside>
  );
}
