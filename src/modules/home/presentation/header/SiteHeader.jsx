import { useEffect, useState, useCallback } from 'react';
import ThemeToggle from '../../../../shared/theme/ThemeToggle.jsx';
import { contactLinks, siteLinks } from '../../../../core/constants.js';
import './header.css';

const NAV_ITEMS = [
  { id: 'top', label: 'Overview', code: '01', href: '#top' },
  { id: 'command-center', label: 'Command Center', code: '02', href: '#command-center' },
  { id: 'work', label: 'Active Builds', code: '03', href: '#command-center' },
  { id: 'contact', label: 'Contact', code: '04', href: contactLinks.email },
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

      // Simple scroll spy logic
      const commandCenterEl = document.getElementById('command-center');
      if (commandCenterEl) {
        const rect = commandCenterEl.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4) {
          setActiveSection('command-center');
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
        target.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setIsMobileOpen(false);
    }
  }, []);

  return (
    <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`} aria-label="Primary navigation">
      <div className="header-inner">
        {/* Brand / Logo */}
        <div className="header-brand-wrap">
          <a
            className="site-mark"
            href="#top"
            aria-label="Hafiz Ali Abdullah home"
            onClick={(e) => handleNavClick(e, '#top', 'top')}
          >
            Hx<span>313</span>
          </a>
          <div className="brand-sub-badge">
            <span className="header-role-sub">PRODUCT ENGINEER</span>
            <span className="brand-dot-sep" aria-hidden="true">•</span>
            <span className="brand-geo">PKT</span>
          </div>
        </div>

        {/* Center Desktop Navigation */}
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
                    <span className="nav-code" aria-hidden="true">{item.code}</span>
                    <span className="nav-label">{item.label}</span>
                    {isActive && <span className="nav-active-pip" aria-hidden="true" />}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right Action Controls */}
        <div className="header-actions">
          {/* Live Telemetry Clock */}
          <div className="header-telemetry-badge" title="Live System Time (Local)">
            <span className="telemetry-lbl">SYS TIME</span>
            <span className="telemetry-val">{sysTime || '12:00:00 AM'}</span>
          </div>

          {/* Live Online Status Beacon */}
          <div className="header-status-badge" title="System Operational">
            <span className="status-live-dot" aria-hidden="true" />
            <span className="status-text">SYS: ONLINE</span>
          </div>

          {/* Social Quick Portals */}
          <div className="header-social-links" aria-label="Social Profiles">
            <a
              href={siteLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              title="GitHub Profile"
              aria-label="GitHub Profile"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a
              href={siteLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              title="LinkedIn Profile"
              aria-label="LinkedIn Profile"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>

          {/* Theme Switcher */}
          <ThemeToggle theme={theme} onChange={setTheme} />

          {/* Primary CTA */}
          <a
            className="header-cta-btn"
            href={contactLinks.email}
            aria-label="Contact Hafiz Ali Abdullah"
          >
            <span>LET’S TALK</span>
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

      {/* Mobile Drawer Overlay & Content */}
      <div
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer ${isMobileOpen ? 'is-visible' : ''}`}
        aria-hidden={!isMobileOpen}
      >
        <div className="mobile-drawer-backdrop" onClick={() => setIsMobileOpen(false)} aria-hidden="true" />
        <div className="mobile-drawer-pane">
          <div className="mobile-drawer-header">
            <div className="mobile-status-pill">
              <span className="status-live-dot" aria-hidden="true" />
              <span>SYSTEM ONLINE</span>
            </div>
            <button
              type="button"
              className="mobile-close-btn"
              aria-label="Close navigation"
              onClick={() => setIsMobileOpen(false)}
            >
              ✕
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
                    <span className="mobile-nav-code">{item.code} //</span>
                    <span className="mobile-nav-text">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mobile-drawer-footer">
            <div className="mobile-telemetry-row">
              <span className="lbl">TIME (PKT)</span>
              <span className="val">{sysTime || '12:00:00 AM'}</span>
            </div>

            <div className="mobile-theme-row">
              <span className="lbl">APPEARANCE</span>
              <ThemeToggle theme={theme} onChange={setTheme} />
            </div>

            <div className="mobile-socials-row">
              <a href={siteLinks.github} target="_blank" rel="noopener noreferrer" className="mobile-social-link">
                GitHub ↗
              </a>
              <a href={siteLinks.linkedin} target="_blank" rel="noopener noreferrer" className="mobile-social-link">
                LinkedIn ↗
              </a>
              <a href={contactLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="mobile-social-link">
                WhatsApp ↗
              </a>
            </div>

            <a className="mobile-cta-btn" href={contactLinks.email} onClick={() => setIsMobileOpen(false)}>
              INITIALIZE CONTACT [ ↗ ]
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
