import { useCallback, useEffect, useState } from 'react';
import OpeningExperience from './opening/OpeningExperience.jsx';
import Hero from './hero/Hero.jsx';
import CommandCenter from './command-center/CommandCenter.jsx';
import ThemeToggle from '../../../shared/theme/ThemeToggle.jsx';
import { useTheme } from '../../../shared/theme/useTheme.js';
import { useCommandCenter } from '../../../hooks/useCommandCenter.js';
import { contactLinks } from '../../../core/constants.js';
import './home.css';
import './command-center/command-center.css';

export default function HomePage() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isOpeningDismissed, setIsOpeningDismissed] = useState(false);
  const [sysTime, setSysTime] = useState('');
  const { theme, setTheme } = useTheme();
  const commandCenter = useCommandCenter();
  const completeOpening = useCallback(() => setIsRevealed(true), []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setSysTime(now.toLocaleTimeString());
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isRevealed) return undefined;
    const dismissalTimer = window.setTimeout(() => setIsOpeningDismissed(true), 280);
    return () => window.clearTimeout(dismissalTimer);
  }, [isRevealed]);

  return (
    <div className="home-page">
      {!isOpeningDismissed && <OpeningExperience isRevealing={isRevealed} onComplete={completeOpening} theme={theme} />}
      <div className={`site-experience ${isRevealed ? 'is-revealed' : ''}`} aria-hidden={!isRevealed} inert={isRevealed ? undefined : ''}>
        <header className="site-header" aria-label="Primary navigation">
          <div className="header-brand-wrap">
            <a className="site-mark" href="#top" aria-label="Hafiz Ali Abdullah home">Hx<span>313</span></a>
            <span className="header-role-sub">PRODUCT ENGINEER</span>
          </div>

          <div className="header-constellation-track" aria-hidden="true">
            <span className="track-dots">········</span>
            <span>PRODUCT CONSTELLATION</span>
            <span className="track-dots">········</span>
          </div>

          <div className="header-actions">
            <div className="header-telemetry-badge" title="Live System Time">
              <span className="telemetry-lbl">TIME</span>
              <span className="telemetry-val">{sysTime || '11:37:42 PM'}</span>
            </div>

            <div className="header-status-badge">
              <span className="status-live-dot" aria-hidden="true" />
              <span>ONLINE</span>
            </div>

            <ThemeToggle theme={theme} onChange={setTheme} />
            <a className="header-link" href={contactLinks.email}>Let’s talk <span aria-hidden="true">↗</span></a>
          </div>
        </header>

        <main id="top">
          {/* Page 1: Clean Entry Portal */}
          <Hero revealed={isRevealed} />

          {/* Page 2: Dedicated Command Center & System Proof */}
          <section id="command-center" className="command-center-portal-section" aria-label="System Command Center">
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
