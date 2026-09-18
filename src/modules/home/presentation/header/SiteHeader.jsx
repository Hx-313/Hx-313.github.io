import { useEffect, useState, useCallback } from 'react';
import { contactLinks, siteLinks } from '../../../../core/constants.js';
import ThemeToggle from '../../../../shared/theme/ThemeToggle.jsx';
import './header.css';

const NAV_ITEMS = [
  { id: 'top', label: 'Overview', shortLabel: 'Overview', index: '00', href: '#top' },
  { id: 'projects', label: '01 Projects', shortLabel: 'Projects', index: '01', href: '#projects' },
  { id: 'about', label: '02 About', shortLabel: 'About', index: '02', href: '#about' },
  { id: 'services', label: '03 Services', shortLabel: 'Services', index: '03', href: '#services' },
  { id: 'domains', label: '04 Domains', shortLabel: 'Domains', index: '04', href: '#domains' },
  { id: 'certifications', label: '05 Certifications', shortLabel: 'Certifications', index: '05', href: '#certifications' },
  { id: 'tools', label: '06 Tools', shortLabel: 'Tools', index: '06', href: '#tools' },
  { id: 'contact', label: '07 Contact', shortLabel: 'Contact', index: '07', href: '#contact' },
  { id: 'testimonials', label: '08 Testimonials', shortLabel: 'Testimonials', index: '08', href: '#testimonials' },
];

export default function SiteHeader({ theme, setTheme }) {
  const [sysTime, setSysTime] = useState('');
  const [activeSection, setActiveSection] = useState('top');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setSysTime(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScrollScrolled = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScrollScrolled, { passive: true });
    handleScrollScrolled();

    const sections = [
      { id: 'top', element: document.getElementById('top') },
      { id: 'projects', element: document.getElementById('projects') || document.getElementById('command-center') },
      { id: 'about', element: document.getElementById('about') },
      { id: 'services', element: document.getElementById('services') },
      { id: 'domains', element: document.getElementById('domains') || document.getElementById('solutions') },
      { id: 'certifications', element: document.getElementById('certifications') },
      { id: 'tools', element: document.getElementById('tools') || document.getElementById('how-i-build') },
      { id: 'contact', element: document.getElementById('contact') },
      { id: 'testimonials', element: document.getElementById('testimonials') },
    ];

    if (!('IntersectionObserver' in window)) {
      const handleScrollFallback = () => {
        for (const s of [...sections].reverse()) {
          if (s.element && s.element.getBoundingClientRect().top <= window.innerHeight * 0.4) {
            setActiveSection(s.id);
            return;
          }
        }
        setActiveSection('top');
      };
      window.addEventListener('scroll', handleScrollFallback, { passive: true });
      handleScrollFallback();
      return () => {
        window.removeEventListener('scroll', handleScrollScrolled);
        window.removeEventListener('scroll', handleScrollFallback);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          const matched = sections.find((s) => s.element === visibleEntries[0].target);
          if (matched) {
            setActiveSection(matched.id);
          }
        }
      },
      {
        rootMargin: '-15% 0px -55% 0px',
        threshold: [0, 0.2],
      }
    );

    sections.forEach((s) => {
      if (s.element) observer.observe(s.element);
    });

    return () => {
      window.removeEventListener('scroll', handleScrollScrolled);
      observer.disconnect();
    };
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const handleNavClick = useCallback((e, href, id) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      setIsMobileOpen(false);
      setActiveSection(id);
      const target = document.querySelector(href);
      if (target) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    } else {
      setIsMobileOpen(false);
    }
  }, []);

  return (
    <header
      className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}
      data-hero-enter
      style={{ '--hero-enter-delay': '0ms' }}
      aria-label="Primary navigation"
    >
      <div className="header-inner">
        {/* Left: Brand mark */}
        <div className="header-brand-wrap">
          <a
            className="site-mark site-mark--logo"
            href="#top"
            aria-label="itHX - Hafiz Ali Abdullah"
            onClick={(e) => handleNavClick(e, '#top', 'top')}
          >
            <span className="site-mark-visual">
              <img
                src="/brand/ithx-logo.png"
                alt="itHX Logo"
                className="site-brand-logo-img"
                width="120"
                height="35"
              />
              <span className="status-live-dot" title="Available for hire" aria-hidden="true" />
            </span>
          </a>
        </div>

        {/* Center: Primary navigation */}
        <nav className="header-desktop-nav" aria-label="Main Navigation">
          <div className="nav-rail">
            <ul className="nav-list" role="list">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id} className="nav-item">
                    <a
                      href={item.href}
                      className={`nav-link ${isActive ? 'is-active' : ''}`}
                      aria-label={item.shortLabel}
                      aria-current={isActive ? 'location' : undefined}
                      onClick={(e) => handleNavClick(e, item.href, item.id)}
                    >
                      <span className="nav-label">{item.shortLabel}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Right: Theme and contact */}
        <div className="header-actions">
          <ThemeToggle theme={theme} onChange={setTheme} />

          {/* Primary CTA */}
          <a
            className="header-cta-btn"
            href={contactLinks.email}
            aria-label="Contact Hafiz Ali Abdullah"
          >
            <span>Start a project</span>
            <span className="cta-arrow" aria-hidden="true">↗</span>
          </a>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className={`header-burger-btn ${isMobileOpen ? 'is-open' : ''}`}
            aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setIsMobileOpen((prev) => !prev)}
          >
            <span className="burger-bar" />
            <span className="burger-bar" />
            <span className="burger-bar" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay with Full Telemetry, Socials & Navigation */}
      <div
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer ${isMobileOpen ? 'is-visible' : ''}`}
        aria-hidden={!isMobileOpen}
        inert={!isMobileOpen ? '' : undefined}
      >
        <div className="mobile-drawer-backdrop" onClick={() => setIsMobileOpen(false)} aria-hidden="true" />
        <div className="mobile-drawer-pane" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="mobile-drawer-header">
            <div className="mobile-drawer-identity">
              <span className="mobile-status-pill" title="Live System Time">
                <span className="status-live-dot" aria-hidden="true" />
                <span>SYS: ONLINE</span>
              </span>
              <span className="mobile-drawer-kicker">MAIN NAVIGATION</span>
            </div>
            <button
              type="button"
              className="mobile-close-btn"
              aria-label="Close navigation"
              onClick={() => setIsMobileOpen(false)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <nav className="mobile-nav-links" aria-label="Mobile Navigation">
            <ul role="list">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className={`mobile-nav-link ${activeSection === item.id ? 'is-active' : ''}`}
                    aria-label={item.shortLabel}
                    onClick={(e) => handleNavClick(e, item.href, item.id)}
                  >
                    <span className="mobile-nav-text">{item.shortLabel}</span>
                    <span className="mobile-nav-arrow" aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mobile-drawer-footer">
            <div className="mobile-theme-controls">
              <ThemeToggle theme={theme} onChange={setTheme} />
            </div>

            <div className="mobile-telemetry-row" title="Live System Time">
              <span className="lbl">SYS TIME</span>
              <span className="val">{sysTime || '12:00:00 AM'}</span>
            </div>

            <div className="mobile-socials-row">
              <a href={siteLinks.github} target="_blank" rel="noopener noreferrer" className="mobile-social-link" title="GitHub Profile">
                GitHub ↗
              </a>
              <a href={siteLinks.instagram} target="_blank" rel="noopener noreferrer" className="mobile-social-link" title="Instagram Profile">
                Instagram ↗
              </a>
              <a href={siteLinks.linkedin} target="_blank" rel="noopener noreferrer" className="mobile-social-link" title="LinkedIn Profile">
                LinkedIn ↗
              </a>
              <a href={contactLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="mobile-social-link">
                WhatsApp ↗
              </a>
            </div>

            <a className="mobile-cta-btn" href={contactLinks.email} onClick={() => setIsMobileOpen(false)}>
              Start a project ↗
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
