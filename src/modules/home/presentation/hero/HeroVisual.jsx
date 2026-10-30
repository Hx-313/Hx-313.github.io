import LoopVideo from '../../../../shared/media/LoopVideo.jsx';
import { HERO_TEXT } from '../../../../core/constants/hero/heroText.js';
import { proofMetrics } from '../../../../data/metrics.js';
import { HERO_GLOBE_VIDEO } from '../media/visualSequences.js';

export default function HeroVisual() {
  return (
    <aside className="hero-visual" aria-hidden="true">
      <div className="hero-globe-wash">
        <LoopVideo className="hero-globe-video" src={HERO_GLOBE_VIDEO} />
      </div>
      <div className="hero-arc-container">
        <div className="hero-arc-ring">
          <span className="hero-arc-text hero-arc-text--top">{HERO_TEXT.orbitVisual.nameArc}</span>
          <span className="hero-arc-text hero-arc-text--bottom">{HERO_TEXT.orbitVisual.rolesArc}</span>
        </div>
      </div>
      <ul className="hero-visual-stats" aria-label={HERO_TEXT.aria.proofMetrics}>
        {proofMetrics.map(([value, label]) => (
          <li key={label} className="hero-visual-stat">
            <strong>{value}</strong>
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
