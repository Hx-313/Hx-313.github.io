import { WOS_TEXT } from '../../core/constants/projects/wosText.js';
import './wos.css';

export default function WosCaseStudy() {
  const { nav, hero, problem, role, architecture, surfaces, engineering, outcomes, liveProduct, cta } = WOS_TEXT;

  return (
    <article className="wos-page">
      {/* Back navigation */}
      <nav className="wos-back-nav" aria-label="Project navigation">
        <a href={nav.backHref} className="wos-back-link">
          <span aria-hidden="true">←</span>
          <span>{nav.backLabel}</span>
        </a>
      </nav>

      {/* Hero */}
      <header className="wos-hero">
        <div className="wos-hero-content">
          <p className="wos-kicker">{hero.kicker}</p>
          <div className="wos-hero-title-row">
            <h1 className="wos-title">{hero.title}</h1>
            <span className="wos-client-badge">{hero.client}</span>
          </div>
          <p className="wos-subtitle">{hero.subtitle}</p>
          <p className="wos-hero-description">{hero.description}</p>
          <dl className="wos-hero-stats">
            {hero.stats.map(({ value, label }) => (
              <div key={label} className="wos-stat">
                <dt className="wos-stat-value">{value}</dt>
                <dd className="wos-stat-label">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="wos-hero-image-wrap">
          <img
            src={hero.image.src}
            alt={hero.image.alt}
            className="wos-hero-image"
            width={hero.image.width}
            height={hero.image.height}
            fetchpriority="high"
          />
        </div>
      </header>

      {/* Problem */}
      <section className="wos-section wos-problem" aria-labelledby="wos-problem-heading">
        <div className="wos-section-inner">
          <h2 id="wos-problem-heading" className="wos-section-heading">{problem.heading}</h2>
          <p className="wos-lead">{problem.lead}</p>
          <ul className="wos-problem-list">
            {problem.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Role */}
      <section className="wos-section wos-role" aria-labelledby="wos-role-heading">
        <div className="wos-section-inner wos-role-inner">
          <div className="wos-role-label">
            <h2 id="wos-role-heading" className="wos-section-heading">{role.heading}</h2>
            <p className="wos-role-title">{role.title}</p>
            <p className="wos-role-client">{role.client}</p>
          </div>
          <ul className="wos-role-scope" aria-label="Responsibilities on this project">
            {role.scope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Architecture */}
      <section className="wos-section wos-architecture" aria-labelledby="wos-arch-heading">
        <div className="wos-section-inner">
          <h2 id="wos-arch-heading" className="wos-section-heading">{architecture.heading}</h2>
          <p className="wos-section-lead">{architecture.description}</p>
          <div className="wos-arch-grid">
            {architecture.layers.map(({ id, label, description }) => (
              <div key={id} className="wos-arch-card">
                <h3 className="wos-arch-label">{label}</h3>
                <p className="wos-arch-desc">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Surface screenshots */}
      <section className="wos-section wos-surfaces" aria-labelledby="wos-surfaces-heading">
        <div className="wos-section-inner">
          <h2 id="wos-surfaces-heading" className="wos-section-heading">{surfaces.heading}</h2>
          <div className="wos-surfaces-grid" role="list" aria-label={surfaces.aria}>
            {surfaces.items.map(({ id, label, caption, image, href }) => (
              <figure key={id} className="wos-surface-card" role="listitem">
                {href ? (
                  <a
                    href={href}
                    className="wos-surface-image-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} — view live`}
                  >
                    <img src={image} alt={caption} className="wos-surface-image" loading="lazy" />
                  </a>
                ) : (
                  <img src={image} alt={caption} className="wos-surface-image" loading="lazy" />
                )}
                <figcaption className="wos-surface-caption">
                  <span className="wos-surface-label">{label}</span>
                  {href && <span className="wos-surface-live" aria-hidden="true">↗ Live</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Engineering decisions */}
      <section className="wos-section wos-engineering" aria-labelledby="wos-eng-heading">
        <div className="wos-section-inner">
          <h2 id="wos-eng-heading" className="wos-section-heading">{engineering.heading}</h2>
          <div className="wos-decisions-grid">
            {engineering.decisions.map(({ id, title, body }) => (
              <div key={id} className="wos-decision-card">
                <h3 className="wos-decision-title">{title}</h3>
                <p className="wos-decision-body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="wos-section wos-outcomes" aria-labelledby="wos-outcomes-heading">
        <div className="wos-section-inner">
          <h2 id="wos-outcomes-heading" className="wos-section-heading">{outcomes.heading}</h2>
          <p className="wos-section-lead">{outcomes.intro}</p>
          <dl className="wos-scale-stats">
            {outcomes.scale.map(({ value, label }) => (
              <div key={label} className="wos-scale-stat wos-stat">
                <dt className="wos-stat-value">{value}</dt>
                <dd className="wos-stat-label">{label}</dd>
              </div>
            ))}
          </dl>
          <div className="wos-clients-grid">
            {outcomes.clients.map(({ id, name, location, stats }) => (
              <div key={id} className="wos-client-card">
                <div className="wos-client-header">
                  <h3 className="wos-client-name">{name}</h3>
                  <p className="wos-client-location">{location}</p>
                </div>
                <dl className="wos-client-stats">
                  {stats.map(({ value, label }) => (
                    <div key={label} className="wos-client-stat wos-stat">
                      <dt className="wos-stat-value">{value}</dt>
                      <dd className="wos-stat-label">{label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live product */}
      <section className="wos-section wos-live" aria-labelledby="wos-live-heading">
        <div className="wos-section-inner">
          <h2 id="wos-live-heading" className="wos-section-heading">{liveProduct.heading}</h2>
          <p className="wos-section-lead">{liveProduct.description}</p>
          <nav className="wos-live-links" aria-label={liveProduct.aria}>
            {liveProduct.links.map(({ id, label, href }) => (
              <a
                key={id}
                href={href}
                className="wos-live-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{label}</span>
                <span className="wos-live-link-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* CTA */}
      <section className="wos-section wos-cta" aria-labelledby="wos-cta-heading">
        <div className="wos-section-inner wos-cta-inner">
          <h2 id="wos-cta-heading" className="wos-cta-heading">{cta.heading}</h2>
          <p className="wos-cta-body">{cta.body}</p>
          <div className="wos-cta-actions">
            <a href={cta.primary.href} className="wos-cta-primary">{cta.primary.label}</a>
            <a href={cta.secondary.href} className="wos-cta-secondary">{cta.secondary.label}</a>
          </div>
        </div>
      </section>
    </article>
  );
}
