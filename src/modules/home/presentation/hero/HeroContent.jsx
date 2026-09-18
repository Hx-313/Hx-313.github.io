import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import { contactLinks, siteLinks } from '../../../../core/constants.js';

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: siteLinks.github,
    icon: FaGithub,
    external: true,
  },
  {
    label: 'LinkedIn',
    href: siteLinks.linkedin,
    icon: FaLinkedinIn,
    external: true,
  },
  {
    label: 'Email',
    href: contactLinks.email,
    icon: FiMail,
    external: false,
  },
];

export default function HeroContent() {
  return (
    <div className="hero-content">
      <p className="hero-kicker" data-hero-enter style={{ '--hero-enter-delay': '0ms' }}>
        Product-minded mobile &amp; systems engineer
      </p>

      <h1 id="hero-title" className="hero-title" data-hero-enter style={{ '--hero-enter-delay': '150ms' }}>
        <span>Built to</span>
        <strong>hold together.</strong>
      </h1>

      <p className="hero-description" data-hero-enter style={{ '--hero-enter-delay': '300ms' }}>
        I build mobile applications and the systems behind them—from Flutter interfaces to the APIs, dashboards, and workflows that keep a product moving.
      </p>

      <div className="hero-actions" data-hero-enter style={{ '--hero-enter-delay': '450ms' }}>
        <a className="hero-action hero-action--primary" href="#projects">
          <span>See Work</span>
          <span aria-hidden="true">↘</span>
        </a>
        <a className="hero-action hero-action--secondary" href="#contact">
          <span>Let's Plan</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <nav className="hero-socials" aria-label="Social links" data-hero-enter style={{ '--hero-enter-delay': '600ms' }}>
        {SOCIAL_LINKS.map(({ label, href, icon: Icon, external }) => (
          <a
            key={label}
            className="hero-social-link"
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            aria-label={label}
          >
            <Icon aria-hidden="true" focusable="false" />
            <span>{label}</span>
          </a>
        ))}
      </nav>

    </div>
  );
}
