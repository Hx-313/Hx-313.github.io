import { useCallback } from 'react';
import {
  FOOTER_NAVIGATION,
  FOOTER_SYSTEMS,
  FOOTER_CONNECT,
  FOOTER_COLOPHON,
} from '../domain/footerData.js';
import './footer.css';

export default function SiteFooter() {
  const scrollToTop = useCallback((e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  return (
    <footer className="site-footer" role="contentinfo" aria-label="Site Footer and Navigation Directory">
      <div className="footer-container">
        {/* Upper Tier: 4-Column Directory Grid */}
        <div className="footer-directory-grid">
          {/* Column 1: Identity & Thesis */}
          <div className="footer-col footer-col--brand">
            <div className="footer-brand-lockup">
              <span className="footer-monogram" aria-label="Hx-313 Insignia">[ Hx-313 ]</span>
              <h2 className="footer-author-name">{FOOTER_COLOPHON.author}</h2>
            </div>
            <p className="footer-author-title">{FOOTER_COLOPHON.title}</p>
            <p className="footer-positioning">{FOOTER_COLOPHON.positioning}</p>
            <div className="footer-availability-tag">
              <span className="availability-dot" aria-hidden="true" />
              <span>{FOOTER_COLOPHON.status}</span>
            </div>
          </div>

          {/* Column 2: Sitemap */}
          <nav className="footer-col footer-col--nav" aria-label="Footer Sitemap">
            <h3 className="footer-col-heading">NAVIGATION SITEMAP</h3>
            <ul className="footer-link-list">
              {FOOTER_NAVIGATION.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="footer-nav-link">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Live Systems */}
          <div className="footer-col footer-col--systems">
            <h3 className="footer-col-heading">LIVE PLATFORMS</h3>
            <ul className="footer-link-list">
              {FOOTER_SYSTEMS.map((system) => (
                <li key={system.name} className="footer-system-item">
                  <a
                    href={system.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-system-link"
                    aria-label={`${system.name} (${system.role})`}
                  >
                    <span className="system-name-row">
                      <strong>{system.name}</strong>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </span>
                    <span className="system-role-desc">{system.role}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="footer-col footer-col--connect">
            <h3 className="footer-col-heading">DIRECT CHANNELS</h3>
            <ul className="footer-link-list">
              {FOOTER_CONNECT.map((channel) => (
                <li key={channel.label}>
                  <a
                    href={channel.url}
                    target={channel.url.startsWith('mailto:') ? undefined : '_blank'}
                    rel={channel.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="footer-connect-link"
                  >
                    <span className="connect-label">{channel.label}</span>
                    <span className="connect-action">{channel.action}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lower Tier: Colophon & Status Bar */}
        <div className="footer-colophon-bar">
          <div className="colophon-item colophon-item--timezone">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{FOOTER_COLOPHON.timezone}</span>
          </div>

          <div className="colophon-item colophon-item--craft">
            <span>{FOOTER_COLOPHON.craft}</span>
          </div>

          <div className="colophon-item colophon-item--copyright">
            <span>{FOOTER_COLOPHON.copyright}</span>
            <a
              href="#top"
              onClick={scrollToTop}
              className="back-to-top-btn"
              aria-label="Back to top of page"
            >
              <span>Back to top</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
