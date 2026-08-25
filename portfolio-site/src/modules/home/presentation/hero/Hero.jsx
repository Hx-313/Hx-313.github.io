import { useEffect, useRef } from 'react';
import { animate as animeAnimate } from 'animejs';
import { animate as motionAnimate } from 'motion';
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
      opacity: [0, 1], translateY: [18, 0], delay: (_, index) => index * 90, duration: 650, ease: 'out(4)',
    });
    const beyond = hero.querySelector('[data-beyond]');
    const motion = motionAnimate(beyond, { opacity: [0, 1], scale: [0.96, 1] }, { duration: 0.8, easing: [0.22, 1, 0.36, 1] });
    return () => { anime.pause(); motion.cancel(); };
  }, [revealed]);

  return (
    <section ref={heroRef} className="hero" aria-labelledby="hero-title">
      <div className="hero-grid"><HeroContent /><HeroVisual /></div>
    </section>
  );
}
