import HolographicGlobe from './HolographicGlobe.jsx';
import SystemOverviewCard from './SystemOverviewCard.jsx';

export default function HeroVisual() {
  return (
    <div className="hero-visual" data-hero-enter>
      <div className="globe-stage">
        <HolographicGlobe />
      </div>
      <SystemOverviewCard />
    </div>
  );
}
