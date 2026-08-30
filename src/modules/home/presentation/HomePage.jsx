import { useCallback, useEffect, useState } from 'react';
import OpeningExperience from './opening/OpeningExperience.jsx';
import CosmicBackground from './CosmicBackground.jsx';
import SiteHeader from './header/SiteHeader.jsx';
import Hero from './hero/Hero.jsx';
import ClientStory from './client-story/ClientStory.jsx';
import CommandCenter from './command-center/CommandCenter.jsx';
import Mascots from '../../../components/Mascots.jsx';
import { useTheme } from '../../../shared/theme/useTheme.js';
import { useCommandCenter } from '../../../hooks/useCommandCenter.js';
import './home.css';
import './command-center/command-center.css';
import '../../../styles/mascots.css';

export default function HomePage() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isOpeningDismissed, setIsOpeningDismissed] = useState(false);
  const { theme, setTheme } = useTheme();
  const commandCenter = useCommandCenter();
  const completeOpening = useCallback(() => setIsRevealed(true), []);

  useEffect(() => {
    if (!isRevealed) return undefined;
    const dismissalTimer = window.setTimeout(() => setIsOpeningDismissed(true), 750);
    return () => window.clearTimeout(dismissalTimer);
  }, [isRevealed]);

  return (
    <div className="home-page">
      <CosmicBackground />
      {!isOpeningDismissed && <OpeningExperience isRevealing={isRevealed} onComplete={completeOpening} theme={theme} />}
      <div className={`site-experience ${isRevealed ? 'is-revealed' : ''}`} aria-hidden={!isRevealed} inert={isRevealed ? undefined : ''}>
        <SiteHeader theme={theme} setTheme={setTheme} />

        <main id="top">
          {/* Page 1: Clean Entry Portal (Mascots bound strictly to Page 1) */}
          <Hero revealed={isRevealed} />

          <ClientStory />

          {/* Page 2: Dedicated Command Center & System Proof */}
          <section id="command-center" className="command-center-portal-section" aria-label="System Command Center">
            <Mascots stage="page2" showController={false} />
            <CommandCenter controller={commandCenter} />
          </section>
        </main>

        <footer className="site-footer">
          <div className="footer-left">
            <strong>Hafiz Ali Abdullah</strong>
            <span>Software engineering · Product building · 2026</span>
          </div>
          <div className="footer-right">
            <a href="#top">Back to top ↑</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
