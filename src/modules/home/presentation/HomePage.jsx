import { useCallback, useEffect, useState } from 'react';
import OpeningExperience from './opening/OpeningExperience.jsx';
import CosmicBackground from './CosmicBackground.jsx';
import SiteHeader from './header/SiteHeader.jsx';
import Hero from './hero/Hero.jsx';
import ClientStory from './client-story/ClientStory.jsx';
import HowIBuild from './how-i-build/HowIBuild.jsx';
import CommandCenter from './command-center/CommandCenter.jsx';
import Mascots from '../../../components/Mascots.jsx';
import { useTheme } from '../../../shared/theme/useTheme.js';
import { useCommandCenter } from '../../../hooks/useCommandCenter.js';
import './home.css';
import './command-center/command-center.css';
import '../../../styles/mascots.css';

export default function HomePage() {
  const [experienceState, setExperienceState] = useState('intro');
  const [isTransitionSettled, setIsTransitionSettled] = useState(false);
  const { theme, setTheme } = useTheme();
  const commandCenter = useCommandCenter();
  const startHandoff = useCallback(() => {
    setExperienceState((state) => (state === 'intro' ? 'handoff' : state));
  }, []);
  const completeOpening = useCallback(() => setExperienceState('ready'), []);
  const isSiteVisible = experienceState !== 'intro';
  const isSiteReady = experienceState === 'ready';

  useEffect(() => {
    if (!isSiteReady) {
      setIsTransitionSettled(false);
      return undefined;
    }

    // Wait for the .site-experience.is-ready transition (320ms) to settle completely
    const timer = setTimeout(() => {
      setIsTransitionSettled(true);
    }, 360);

    return () => clearTimeout(timer);
  }, [isSiteReady]);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  return (
    <div className="home-page">
      <CosmicBackground />
      {!isSiteReady && <OpeningExperience onHandoff={startHandoff} onComplete={completeOpening} />}
      <div
        className={`site-experience is-${experienceState}`}
        aria-hidden={isSiteReady ? 'false' : 'true'}
        inert={isSiteReady ? undefined : ''}
      >
        <SiteHeader theme={theme} setTheme={setTheme} />

        <main id="top">
          {/* Page 1: Clean Entry Portal (Mascots bound strictly to Page 1) */}
          <Hero revealed={isSiteVisible} settled={isTransitionSettled} />

          <ClientStory />

          <HowIBuild />

          {/* Page 2: Dedicated Command Center & System Proof */}
          <section id="command-center" className="command-center-portal-section" aria-label="System Command Center" data-section="systems">
            <span id="systems" className="section-anchor-compat" aria-hidden="true" />
            <Mascots stage="page2" showController={false} active={isTransitionSettled} />
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
