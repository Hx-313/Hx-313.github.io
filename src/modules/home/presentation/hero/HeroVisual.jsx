import CommandCenter from '../command-center/CommandCenter.jsx';

export default function HeroVisual({ controller }) {
  return <div className="hero-visual" data-hero-enter><CommandCenter controller={controller} /></div>;
}
