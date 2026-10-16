import HeroContent, { HeroSocials } from './HeroContent.jsx';
import HeroVisual from './HeroVisual.jsx';
import { HERO_TEXT } from '../../../../core/constants/hero/heroText.js';
import './hero.css';

export default function Hero({ revealed = false, transitioning = false }) {
  return (
    <section
      className={`hero ${revealed ? 'is-revealed' : ''} ${transitioning ? 'is-transitioning' : ''}`}
      aria-labelledby="hero-title"
    >
      <HeroVisual />
      <div className="hero-grid">
        <HeroContent />
      </div>
      <HeroSocials />
      <div className="hero-marquee">
        <div className="hero-marquee__inner">
          <div className="hero-marquee__viewport">
            <div className="hero-marquee__track" aria-hidden="true">
              {[0, 1, 2].map((copy) => (
                <div className="hero-marquee__copy" key={copy}>
                  {HERO_TEXT.marqueeWords.map((word) => (
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
      </div>
    </section>
  );
}
