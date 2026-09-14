import HeroContent from './HeroContent.jsx';
import HeroVisual from './HeroVisual.jsx';
import './hero.css';

export default function Hero({ revealed = false, transitioning = false }) {
  return (
    <section
      className={`hero ${revealed ? 'is-revealed' : ''} ${transitioning ? 'is-transitioning' : ''}`}
      aria-labelledby="hero-title"
    >
      <div className="hero-atmosphere" aria-hidden="true">
        <span className="hero-atmosphere__halo hero-atmosphere__halo--primary" />
        <span className="hero-atmosphere__halo hero-atmosphere__halo--secondary" />
        <span className="hero-atmosphere__thread hero-atmosphere__thread--one" />
        <span className="hero-atmosphere__thread hero-atmosphere__thread--two" />
      </div>
      <div className="hero-grid">
        <HeroContent />
        <HeroVisual />

        <div className="hero-marquee" aria-hidden="true">
          <div className="hero-marquee__track">
            {[0, 1].map((copy) => (
              <div className="hero-marquee__copy" key={copy}>
                {['Scalable', 'Reliable', 'Secure', 'Maintainable', 'Fast', 'Smooth'].map((word) => (
                  <span className="hero-marquee__item" key={`${copy}-${word}`}>
                    <strong>{word}</strong>
                    <i>✦</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
