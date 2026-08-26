import { useEffect, useRef } from 'react';
import { animate as animeAnimate } from 'animejs';
import HeroContent from './HeroContent.jsx';
import HeroVisual from './HeroVisual.jsx';
import './hero.css';
import '../command-center/command-center.css';

export default function Hero({ revealed, controller }) {
  const heroRef = useRef(null);

  useEffect(() => {
    if (!revealed || !heroRef.current) return undefined;
    const hero = heroRef.current;
    const content = hero.querySelectorAll('[data-hero-enter]');
    const anime = animeAnimate(content, {
      opacity: [0, 1], translateY: [22, 0], duration: 760, ease: 'out(4)',
    });
    return () => anime.pause();
  }, [revealed]);

  return (
    <>
      <section ref={heroRef} className="hero" aria-labelledby="hero-title">
        <div className="hero-grid"><HeroContent /><HeroVisual controller={controller} /></div>
      </section>
      <section className="hero-cta-rail" aria-label="Portfolio actions">
        <p className="hero-cta-rail__label">Explore the work when you’re ready</p>
        <div className="hero-actions">
          <a className="hero-button hero-button--primary" href="#work">Explore the work <span aria-hidden="true">↗</span></a>
          <a className="hero-button hero-button--ghost" href="mailto:aliabdullahva313@gmail.com">Start a conversation</a>
        </div>
      </section>
    </>
  );
}
