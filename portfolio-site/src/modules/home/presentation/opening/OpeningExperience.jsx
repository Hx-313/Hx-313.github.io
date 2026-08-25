import { useEffect, useRef, useState } from 'react';
import { animate as animeAnimate } from 'animejs';
import './opening.css';

const statements = [
  'IDEAS NEED STRUCTURE.',
  'PRODUCTS NEED MOMENTUM.',
  'MOMENTUM NEEDS CONVICTION.',
];
export default function OpeningExperience({ onComplete, theme }) {
  const [statementIndex, setStatementIndex] = useState(0);
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isReduced, setIsReduced] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const openingRef = useRef(null);
  const statementRef = useRef(null);

  useEffect(() => {
    const characters = statementRef.current?.querySelectorAll('.opening-character');
    const lastCharacter = characters?.[characters.length - 1];
    if (!lastCharacter || isHolding || isTransitioning) return undefined;
    const animation = animeAnimate(lastCharacter, {
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 220,
      ease: 'out(3)',
    });
    return () => animation.pause();
  }, [isHolding, isTransitioning, visibleCharacters]);

  useEffect(() => {
    if (!isHolding || isTransitioning || !statementRef.current) return undefined;
    const animation = animeAnimate(statementRef.current, {
      opacity: [1, 0],
      scale: [1, 1.04],
      translateY: [0, -10],
      delay: 480,
      duration: 820,
      ease: 'in(3)',
    });
    return () => animation.pause();
  }, [isHolding, isTransitioning]);

  useEffect(() => {
    if (hasStarted || isReduced || !openingRef.current) return undefined;
    const bars = openingRef.current.querySelectorAll('.opening-loader__bar');
    const animation = animeAnimate(bars, {
      opacity: [0.25, 1],
      scaleY: [0.45, 1],
      delay: (_, index) => index * 140,
      duration: 620,
      ease: 'inOut(2)',
      loop: true,
      direction: 'alternate',
    });
    return () => animation.pause();
  }, [hasStarted, isReduced]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsReduced(reduced);
    if (reduced) {
      onComplete();
      return undefined;
    }

    if (!hasStarted) {
      if (loadingProgress < 100) {
        const progressTimer = window.setTimeout(() => setLoadingProgress((value) => Math.min(100, value + 2)), 28);
        return () => window.clearTimeout(progressTimer);
      }
      const loadingPause = window.setTimeout(() => setHasStarted(true), 420);
      return () => window.clearTimeout(loadingPause);
    }

    let characterTimer;
    let holdTimer;
    const line = statements[statementIndex];

    if (visibleCharacters < line.length) {
      characterTimer = window.setTimeout(() => setVisibleCharacters((count) => count + 1), 76);
    } else {
      setIsHolding(true);
      holdTimer = window.setTimeout(() => {
        if (statementIndex === statements.length - 1) {
          setIsTransitioning(true);
          animeAnimate(openingRef.current, {
            opacity: [1, 0],
            scale: [1, 0.99],
            filter: ['blur(0px)', 'blur(3px)'],
            duration: 850,
            ease: 'out(3)',
            complete: onComplete,
          });
          return;
        }
        setIsHolding(false);
        setVisibleCharacters(0);
        setStatementIndex((index) => index + 1);
      }, 1450);
    }

    return () => {
      window.clearTimeout(characterTimer);
      window.clearTimeout(holdTimer);
    };
  }, [hasStarted, loadingProgress, onComplete, statementIndex, visibleCharacters]);

  const statement = statements[statementIndex];
  const activeText = isReduced || !hasStarted ? '' : statement.slice(0, visibleCharacters);
  const words = statement.split(' ');
  let wordStart = 0;

  const renderedWords = words.map((word, wordIndex) => {
    const visibleCount = Math.max(0, Math.min(word.length, visibleCharacters - wordStart));
    const visibleWord = activeText ? word.slice(0, visibleCount) : '';
    const currentWordStart = wordStart;
    wordStart += word.length + 1;

    return (
      <span key={`${statementIndex}-word-${wordIndex}`} className={`opening-word ${wordIndex === words.length - 1 ? 'opening-word--accent' : ''}`}>
        {visibleWord.split('').map((character, characterIndex) => (
          <span key={`${currentWordStart}-${characterIndex}`} className="opening-character" style={{ '--character-index': currentWordStart + characterIndex }}>
            {character}
          </span>
        ))}
        {visibleCharacters > currentWordStart + word.length && wordIndex < words.length - 1 && <span className="opening-space">&nbsp;</span>}
      </span>
    );
  });

  function skipOpening() {
    onComplete();
  }

  return (
    <section ref={openingRef} className={`opening ${isHolding ? 'opening--holding' : ''} ${isTransitioning ? 'opening--transitioning' : ''} theme-${theme}`} aria-label="Portfolio introduction">
      <div className="opening-noise" aria-hidden="true" />
      <div className="opening-center" aria-live="polite" aria-atomic="true">
        <div key={statementIndex} ref={statementRef} className="opening-statement" data-rendering={!isHolding}>
          {renderedWords}
          {!isHolding && hasStarted && <span className="opening-cursor" aria-hidden="true" />}
        </div>
      </div>
      {!hasStarted && <div className="opening-loader" aria-label={`Loading ${loadingProgress}%`}><div className="opening-loader__track"><span style={{ width: `${loadingProgress}%` }} /></div><span className="opening-loader__value">{loadingProgress}%</span></div>}
      <p className="opening-caption">Thinking · building · moving forward</p>
      <button className="opening-skip" type="button" onClick={skipOpening}>Skip intro <span aria-hidden="true">↗</span></button>
    </section>
  );
}
