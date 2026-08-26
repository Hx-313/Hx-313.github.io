import { useCallback, useEffect, useState } from 'react';
import OpeningExperience from './opening/OpeningExperience.jsx';
import Hero from './hero/Hero.jsx';
import ThemeToggle from '../../../shared/theme/ThemeToggle.jsx';
import { useTheme } from '../../../shared/theme/useTheme.js';
import { useCommandCenter } from '../../../hooks/useCommandCenter.js';
import './home.css';

export default function HomePage() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isOpeningDismissed, setIsOpeningDismissed] = useState(false);
  const { theme, setTheme } = useTheme();
  const commandCenter = useCommandCenter();
  const completeOpening = useCallback(() => setIsRevealed(true), []);

  useEffect(() => {
    if (!isRevealed) return undefined;

    // Keep the opening mounted just long enough for the cut-through to overlap
    // the hero reveal. The home experience is already visible underneath.
    const dismissalTimer = window.setTimeout(() => setIsOpeningDismissed(true), 280);
    return () => window.clearTimeout(dismissalTimer);
  }, [isRevealed]);

  return (
    <div className="home-page">
      {!isOpeningDismissed && <OpeningExperience isRevealing={isRevealed} onComplete={completeOpening} theme={theme} />}
      <div className={`site-experience ${isRevealed ? 'is-revealed' : ''}`} aria-hidden={!isRevealed} inert={isRevealed ? undefined : ''}>
        <header className="site-header" aria-label="Primary navigation">
          <a className="site-mark" href="#top" aria-label="Hafiz Ali Abdullah home">Hx<span>313</span></a>
          <nav className="site-nav">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
          </nav>
          <div className="header-actions">
            <ThemeToggle theme={theme} onChange={setTheme} />
            <a className="header-link" href="mailto:aliabdullahva313@gmail.com">Let’s talk <span aria-hidden="true">↗</span></a>
          </div>
        </header>

        <main id="top"><Hero revealed={isRevealed} controller={commandCenter} /></main>

        <footer className="site-footer">
          <span>Hafiz Ali Abdullah</span>
          <span>Software engineering · Product building</span>
        </footer>
      </div>
    </div>
  );
}
