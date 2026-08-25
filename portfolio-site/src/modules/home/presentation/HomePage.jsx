import { useCallback, useState } from 'react';
import OpeningExperience from './opening/OpeningExperience.jsx';
import Hero from './hero/Hero.jsx';
import ThemeToggle from '../../../shared/theme/ThemeToggle.jsx';
import { useTheme } from '../../../shared/theme/useTheme.js';
import './home.css';

export default function HomePage() {
  const [isRevealed, setIsRevealed] = useState(false);
  const { theme, setTheme } = useTheme();
  const completeOpening = useCallback(() => setIsRevealed(true), []);

  return (
    <div className="home-page">
      {!isRevealed && <OpeningExperience onComplete={completeOpening} theme={theme} />}
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

        <main id="top"><Hero revealed={isRevealed} /></main>

        <footer className="site-footer">
          <span>Hafiz Ali Abdullah</span>
          <span>Software engineering · Product building</span>
        </footer>
      </div>
    </div>
  );
}
