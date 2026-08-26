import { useEffect, useRef } from 'react';
import { animate as animeAnimate } from 'animejs';
import HeroContent from './HeroContent.jsx';
import HeroVisual from './HeroVisual.jsx';
import './hero.css';

export default function Hero({ revealed }) {
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
    <section ref={heroRef} className="hero" aria-labelledby="hero-title">
      <div className="hero-grid">
        <HeroContent />
        <HeroVisual />
      </div>
    </section>
  );
}
