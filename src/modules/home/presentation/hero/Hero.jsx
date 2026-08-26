import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import HeroContent from './HeroContent.jsx';
import HeroVisual from './HeroVisual.jsx';
import Mascots from '../../../../components/Mascots.jsx';
import './hero.css';

export default function Hero({ revealed }) {
  const heroRef = useRef(null);

  useEffect(() => {
    if (!revealed || !heroRef.current) return undefined;
    const hero = heroRef.current;
    const content = hero.querySelectorAll('[data-hero-enter]');

    if (content && content.length > 0) {
      content.forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px) scale(0.97)';
      });

      const anim = animate(content, {
        opacity: [0, 1],
        translateY: [28, 0],
        scale: [0.97, 1],
        duration: 900,
        delay: stagger(110, { start: 100 }),
        ease: 'outCubic',
      });

      return () => {
        try {
          anim.pause?.();
        } catch (e) {
          // ignore
        }
      };
    }
    return undefined;
  }, [revealed]);

  return (
    <section ref={heroRef} className="hero" aria-labelledby="hero-title">
      <Mascots stage="page1" showController={true} />
      <div className="hero-grid">
        <HeroContent />
        <HeroVisual />
      </div>
    </section>
  );
}
