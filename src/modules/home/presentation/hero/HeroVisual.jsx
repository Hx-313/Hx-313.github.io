import LoopVideo from '../../../../shared/media/LoopVideo.jsx';
import { HERO_GLOBE_VIDEO } from '../media/visualSequences.js';

export default function HeroVisual() {
  return (
    <aside className="hero-visual" aria-hidden="true">
      <div className="hero-globe-wash">
        <LoopVideo className="hero-globe-video" src={HERO_GLOBE_VIDEO} />
      </div>
      <div className="hero-arc-container">
        <div className="hero-arc-ring" />
      </div>
    </aside>
  );
}
