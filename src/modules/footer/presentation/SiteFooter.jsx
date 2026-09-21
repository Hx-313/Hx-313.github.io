import { useCallback } from 'react';
import { FaGithub, FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa6';
import { LuArrowUpRight, LuCalendarDays, LuClock3, LuMail, LuMapPin, LuPhone } from 'react-icons/lu';
import {
  FOOTER_NAVIGATION,
  FOOTER_SYSTEMS,
  FOOTER_CONTACT_CHANNELS,
  FOOTER_SOCIALS,
  FOOTER_COLOPHON,
  FOOTER_TEXT,
} from '../domain/footerData.js';
import './footer.css';

const SOCIAL_ICONS = Object.freeze({
  github: FaGithub,
  linkedin: FaLinkedinIn,
  instagram: FaInstagram,
});

const CONTACT_ICONS = Object.freeze({
  meeting: LuCalendarDays,
  whatsapp: FaWhatsapp,
  phone: LuPhone,
  email: LuMail,
});

export default function SiteFooter() {
  const scrollToTop = useCallback((event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  return (
    <footer className="site-footer" role="contentinfo" aria-label={FOOTER_TEXT.aria.footer}>
      <div className="footer-container">
        <div className="footer-directory-grid">
          <div className="footer-col footer-col--brand">
            <div className="footer-brand-lockup">
              <img src="/brand/ithx-logo.webp" alt="itHX" className="footer-brand-logo" width="120" height="35" />
              <span className="footer-monogram" aria-label={FOOTER_TEXT.aria.monogram}>HX-313</span>
            </div>
            <h2 className="footer-author-name">{FOOTER_COLOPHON.author}</h2>
            <p className="footer-author-title">{FOOTER_COLOPHON.title}</p>
            <p className="footer-positioning">{FOOTER_COLOPHON.positioning}</p>
            <nav className="footer-social-nav" aria-label={FOOTER_TEXT.aria.socials}>
              <ul className="footer-social-list">
                {FOOTER_SOCIALS.map((social) => {
                  const Icon = SOCIAL_ICONS[social.id];
                  return (
                    <li key={social.id}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-social-link"
                        data-social={social.id}
                        aria-label={social.ariaLabel}
                        title={social.handle}
                      >
                        <span className="footer-social-mark" aria-hidden="true">
                          <Icon />
                        </span>
                        <span className="footer-social-copy">
                          <span className="footer-social-name">{social.name}</span>
                          <span className="footer-social-handle">{social.handle}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="footer-col footer-col--systems">
            <h3 className="footer-col-heading">{FOOTER_TEXT.headings.systems}</h3>
            <ul className="footer-link-list">
              {FOOTER_SYSTEMS.map((system) => (
                <li key={system.name} className="footer-system-item">
                  <a
                    href={system.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-system-link"
                    aria-label={system.accessibleLabel}
                  >
                    <span className="system-name-row">
                      <strong>{system.name}</strong>
                      <LuArrowUpRight aria-hidden="true" />
                    </span>
                    <span className="system-role-desc">{system.role}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav className="footer-col footer-col--company" aria-label={FOOTER_TEXT.aria.sitemap}>
            <h3 className="footer-col-heading">{FOOTER_TEXT.headings.company}</h3>
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

          <div className="footer-col footer-col--connect">
            <h3 className="footer-col-heading">{FOOTER_TEXT.headings.contact}</h3>
            <p className="footer-contact-note">{FOOTER_TEXT.contactNote}</p>
            <ul className="footer-contact-list">
              {FOOTER_CONTACT_CHANNELS.map((channel) => {
                const Icon = CONTACT_ICONS[channel.id];
                const opensNewTab = channel.url.startsWith('https://');
                return (
                  <li key={channel.id}>
                    <a
                      href={channel.url}
                      target={opensNewTab ? '_blank' : undefined}
                      rel={opensNewTab ? 'noopener noreferrer' : undefined}
                      className={'footer-connect-link footer-connect-link--' + channel.id}
                    >
                      <span className="footer-contact-icon" aria-hidden="true">
                        <Icon />
                      </span>
                      <span className="footer-connect-copy">
                        <span className="connect-label">{channel.label}</span>
                        <span className="connect-action">
                          {channel.id === 'email' ? (
                            <>
                              {channel.action.slice(0, channel.action.indexOf('@') + 1)}
                              <wbr />
                              {channel.action.slice(channel.action.indexOf('@') + 1)}
                            </>
                          ) : channel.action}
                        </span>
                      </span>
                      <LuArrowUpRight className="footer-connect-arrow" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="footer-col footer-col--base">
            <h3 className="footer-col-heading">{FOOTER_TEXT.headings.base}</h3>
            <div className="footer-location-card">
              <div className="footer-location-overline">
                <span>{FOOTER_TEXT.location.basedIn}</span>
                <LuMapPin aria-hidden="true" />
              </div>
              <strong>{FOOTER_TEXT.location.cityCountry}</strong>
              <small>{FOOTER_TEXT.location.workingScope}</small>
            </div>
            <div className="footer-base-status">
              <span className="availability-dot" aria-hidden="true" />
              <span>{FOOTER_TEXT.location.availability}</span>
            </div>
            <div className="footer-base-timezone">
              <LuClock3 aria-hidden="true" />
              <span>{FOOTER_TEXT.location.timezone}</span>
            </div>
            <p className="footer-response-time">
              <span>{FOOTER_TEXT.location.responseLabel}</span>
              <strong>{FOOTER_TEXT.location.responseValue}</strong>
            </p>
          </div>
        </div>

        <div className="footer-conversation-band">
          <div className="footer-conversation-copy">
            <span className="footer-conversation-eyebrow">{FOOTER_TEXT.conversation.eyebrow}</span>
            <h3>{FOOTER_TEXT.conversation.title}</h3>
            <p>{FOOTER_TEXT.conversation.description}</p>
          </div>
          <a href="#contact" className="footer-project-cta">
            <span>{FOOTER_TEXT.conversation.action}</span>
            <LuArrowUpRight aria-hidden="true" />
          </a>
        </div>

        <div className="footer-colophon-bar">
          <div className="colophon-item colophon-item--timezone">
            <LuClock3 aria-hidden="true" />
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
              aria-label={FOOTER_TEXT.aria.backToTop}
            >
              <span>{FOOTER_TEXT.backToTop}</span>
              <LuArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}