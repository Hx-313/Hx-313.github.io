import { useCallback, useEffect, useState } from 'react';
import OpeningExperience from './opening/OpeningExperience.jsx';
import Hero from './hero/Hero.jsx';
import AboutSection from '../../about/presentation/AboutSection.jsx';
import SolutionsSection from './solutions/SolutionsSection.jsx';
import HowIBuild from './how-i-build/HowIBuild.jsx';
import Services from './services/Services.jsx';
import CommandCenter from './command-center/CommandCenter.jsx';
import CertificationsSection from './certifications/CertificationsSection.jsx';
import TestimonialsSection from './testimonials/TestimonialsSection.jsx';
import SectionReveal from '../../../shared/motion/SectionReveal.jsx';
import ContactSection from '../../contact/presentation/ContactSection.jsx';
import SEO from '../../../shared/seo/SEO.jsx';
import { useCommandCenter } from '../../../hooks/useCommandCenter.js';
import CosmicBackground from './CosmicBackground.jsx';
import './home.css';
import './command-center/command-center.css';

export default function HomePage({ initialExperienceState = 'intro', targetSection = null }) {
  const [experienceState, setExperienceState] = useState(initialExperienceState);
  const commandCenter = useCommandCenter();
  const startHandoff = useCallback(() => {
    setExperienceState((state) => (state === 'intro' ? 'handoff' : state));
  }, []);
  const completeOpening = useCallback(() => setExperienceState('ready'), []);
  const isSiteVisible = experienceState !== 'intro';
  const isSiteReady = experienceState === 'ready';

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    if (initialExperienceState === 'ready') {
      const hash = targetSection || window.location.hash;
      if (hash && hash !== '#top') {
        const scrollToTarget = () => {
          const target = document.querySelector(hash);
          if (target) {
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
          }
        };
        scrollToTarget();
        const timer = setTimeout(scrollToTarget, 60);
        return () => {
          clearTimeout(timer);
          window.history.scrollRestoration = previousScrollRestoration;
        };
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [initialExperienceState, targetSection]);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(navigator.userAgent !== 'ReactSnap'); }, []);
  const hideMainContent = !isSiteReady && isClient;

  return (
    <>
      <SEO
        title="Hafiz Ali Abdullah — Flutter & Node.js Developer | Mobile App & Backend Systems"
        description="I'm Hafiz Ali Abdullah — a Flutter developer and Node.js backend engineer. I build production mobile apps for Android and iOS, plus the APIs and dashboards behind them. 15+ apps shipped, 100K+ downloads."
      />
      {!isSiteReady && <OpeningExperience onHandoff={startHandoff} onComplete={completeOpening} />}
      <div
        className={`site-experience is-${experienceState}`}
        aria-hidden={hideMainContent ? 'true' : undefined}
        inert={hideMainContent ? '' : undefined}
      >
        <CosmicBackground />
        <Hero revealed={isSiteVisible} transitioning={experienceState === 'handoff'} />

        <SectionReveal id="projects" motion="projects" className="portfolio-flow-section">
          <span id="command-center" className="section-anchor-compat" aria-hidden="true" />
          <span id="systems" className="section-anchor-compat" aria-hidden="true" />
          <CommandCenter controller={commandCenter} />
        </SectionReveal>

        <SectionReveal motion="about" className="portfolio-flow-section">
          <AboutSection />
        </SectionReveal>

        <SectionReveal motion="services" className="portfolio-flow-section">
          <Services />
        </SectionReveal>

        <SectionReveal id="domains" motion="domains" className="portfolio-flow-section">
          <SolutionsSection />
        </SectionReveal>

        <SectionReveal motion="certifications" className="portfolio-flow-section">
          <CertificationsSection />
        </SectionReveal>

        <SectionReveal id="tools" motion="tools" className="portfolio-flow-section">
          <HowIBuild />
        </SectionReveal>

        <SectionReveal motion="contact" className="portfolio-flow-section">
          <ContactSection />
        </SectionReveal>

        <SectionReveal motion="testimonials" className="portfolio-flow-section">
          <TestimonialsSection />
        </SectionReveal>
      </div>
    </>
  );
}
