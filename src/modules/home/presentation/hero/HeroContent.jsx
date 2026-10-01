import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import { contactLinks, siteLinks } from '../../../../core/constants.js';
import { HERO_TEXT } from '../../../../core/constants/hero/heroText.js';

const SOCIAL_LINKS = [
  {
    label: HERO_TEXT.socials.github,
    href: siteLinks.github,
    icon: FaGithub,
    external: true,
  },
  {
    label: HERO_TEXT.socials.linkedin,
    href: siteLinks.linkedin,
    icon: FaLinkedinIn,
    external: true,
  },
  {
    label: HERO_TEXT.socials.email,
    href: contactLinks.email,
    icon: FiMail,
    external: false,
  },
];

export default function HeroContent() {
  return (
    <div className="hero-content">
      <p className="hero-kicker" data-hero-enter style={{ '--hero-enter-delay': '0ms' }}>
        {HERO_TEXT.kicker}
      </p>

      <h1 id="hero-title" className="hero-title" data-hero-enter style={{ '--hero-enter-delay': '150ms' }}>
        <span>{HERO_TEXT.title.prefix}</span>
        <strong>{HERO_TEXT.title.highlight}</strong>
      </h1>

      <p className="hero-description" data-hero-enter style={{ '--hero-enter-delay': '300ms' }}>
        {HERO_TEXT.description}
      </p>

      <div className="hero-actions" data-hero-enter style={{ '--hero-enter-delay': '450ms' }}>
        <a className="hero-action hero-action--primary" href="#projects">
          <span>{HERO_TEXT.actions.seeWork}</span>
          <span aria-hidden="true">↘</span>
        </a>
        <a className="hero-action hero-action--secondary" href="#contact">
          <span>{HERO_TEXT.actions.letPlan}</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <nav className="hero-socials" aria-label={HERO_TEXT.aria.socialLinks} data-hero-enter style={{ '--hero-enter-delay': '600ms' }}>
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
