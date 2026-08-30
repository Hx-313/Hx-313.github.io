import { useEffect, useState, useCallback } from 'react';
import { contactLinks, siteLinks } from '../../../../core/constants.js';
import ThemeToggle from '../../../../shared/theme/ThemeToggle.jsx';
import './header.css';

const NAV_ITEMS = [
  { id: 'top', label: 'Overview', href: '#top' },
  { id: 'client-story', label: 'The Problem', href: '#client-story' },
  { id: 'command-center', label: 'Command Center', href: '#command-center' },
  { id: 'contact', label: 'Contact', href: contactLinks.email },
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sectionIds = ['command-center', 'client-story'];
      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= window.innerHeight * 0.4) {
          setActiveSection(id);
          return;
        }
      }
      setActiveSection('top');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
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
    <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`} aria-label="Primary navigation">
      <div className="header-inner">
        {/* Left: Clean Brand + Minimal Available Indicator */}
        <div className="header-brand-wrap">
          <a
            className="site-mark"
            href="#top"
            aria-label="Hafiz Ali Abdullah home"
            onClick={(e) => handleNavClick(e, '#top', 'top')}
          >
            Hx<span>313</span>
            <span className="status-live-dot" title="Available for hire" aria-hidden="true" />
          </a>
        </div>

        {/* Center: Clean Airy Desktop Navigation */}
        <nav className="header-desktop-nav" aria-label="Main Navigation">
          <ul className="nav-list" role="list">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id} className="nav-item">
                  <a
                    href={item.href}
                    className={`nav-link ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={(e) => handleNavClick(e, item.href, item.id)}
                  >
                    <span className="nav-label">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right: Clean, Minimal Actions (Let's Talk CTA & Mobile Menu) */}
        <div className="header-actions">
          <ThemeToggle theme={theme} onChange={setTheme} />

          {/* Primary CTA */}
          <a
            className="header-cta-btn"
            href={contactLinks.email}
            aria-label="Contact Hafiz Ali Abdullah"
          >
            <span>Let’s talk</span>
            <span className="cta-arrow" aria-hidden="true">↗</span>
          </a>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className={`header-burger-btn ${isMobileOpen ? 'is-open' : ''}`}
            aria-label="Toggle navigation menu"
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
      >
        <div className="mobile-drawer-backdrop" onClick={() => setIsMobileOpen(false)} aria-hidden="true" />
        <div className="mobile-drawer-pane">
          <div className="mobile-drawer-header">
            <div className="mobile-status-pill" title="Live System Time">
              <span className="status-live-dot" aria-hidden="true" />
              <span>SYS: ONLINE</span>
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
                    onClick={(e) => handleNavClick(e, item.href, item.id)}
                  >
                    <span className="mobile-nav-text">{item.label}</span>
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
              <a href={siteLinks.linkedin} target="_blank" rel="noopener noreferrer" className="mobile-social-link" title="LinkedIn Profile">
                LinkedIn ↗
              </a>
              <a href={contactLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="mobile-social-link">
                WhatsApp ↗
              </a>
            </div>

            <a className="mobile-cta-btn" href={contactLinks.email} onClick={() => setIsMobileOpen(false)}>
              Let’s Talk ↗
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
