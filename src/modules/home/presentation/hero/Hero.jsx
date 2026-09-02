import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import HeroContent from './HeroContent.jsx';
import HeroVisual from './HeroVisual.jsx';
import Mascots from '../../../../components/Mascots.jsx';
import './hero.css';

export default function Hero({ revealed, settled }) {
  const heroRef = useRef(null);

  useEffect(() => {
    if (!revealed || !heroRef.current) return undefined;
    const hero = heroRef.current;
    const content = hero.querySelectorAll('[data-hero-enter]');

    if (content && content.length > 0) {
      content.forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(18px) scale(0.98)';
      });

      const anim = animate(content, {
        opacity: [0, 1],
        translateY: [18, 0],
        scale: [0.98, 1],
        duration: 550,
        delay: stagger(60, { start: 40 }),
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

  const isMascotsActive = typeof settled === 'boolean' ? settled : Boolean(revealed);

  return (
    <section ref={heroRef} className="hero" aria-labelledby="hero-title">
      <Mascots stage="page1" showController={true} active={isMascotsActive} />
      <div className="hero-grid">
        <HeroContent />
        <HeroVisual />
      </div>
    </section>
  );
}
