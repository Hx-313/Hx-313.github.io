import HolographicGlobe from './HolographicGlobe.jsx';
import MascotCrew from './MascotCrew.jsx';
import SystemOverviewCard from './SystemOverviewCard.jsx';

export default function HeroVisual() {
  return (
    <div className="hero-visual" data-hero-enter>
      <div className="globe-stage">
        <HolographicGlobe />
        <MascotCrew />
      </div>
      <SystemOverviewCard />
    </div>
  );
}
