import { animate, stagger } from 'animejs';
import { useEffect, useRef } from 'react';
import { FaApple, FaGooglePlay } from 'react-icons/fa6';
import { FiArrowDown, FiArrowUpRight } from 'react-icons/fi';

import { SEO_TEXT } from '../../core/constants/seo/seoText.js';
import { showcaseProjects } from '../../data/projects.js';
import ContactSection from '../../modules/contact/presentation/ContactSection.jsx';
import SEO from '../../shared/seo/SEO.jsx';
import './projects-page.css';

const projectSummaries = {
  readmate: 'Read and work across document formats in one mobile office suite. Create protected PDFs, listen to EPUBs, and edit XLSX workbooks in version 2.',
  expenseflow: 'One offline-first workspace for personal and business finances, from daily spending to cheque lifecycles.',
  translator: 'Voice, conversation, camera, and text translation for online and offline communication.',
  'noor-ul-quran': 'Quran reading, prayer times, Qibla, and Ramadan tools in one Islamic app, with 10K+ downloads across Android and iOS.',
  'pet-care': 'On-device profiles, care history, daily routines, and reminders for multi-pet households.',
  quickscan: 'Scan QR codes and barcodes, open the right action, or create your own. Works offline on Android, with 10K+ Google Play downloads.',
};

const featuredSummary =
  'Your documents, together in one place. Read PDF, Word, Excel, PowerPoint, EPUB, and more; turn images and scans into password-protected PDFs; then work in the full XLSX editor and basic Word editor added in version 2.';

function getStoreLinks(project) {
  const candidates = [
    { label: 'Google Play', href: project.storeLinks?.googlePlay, Icon: FaGooglePlay },
    { label: 'App Store', href: project.storeLinks?.appStore, Icon: FaApple },
  ];

  return candidates.filter(({ label, href }) => {
    if (!href) return false;

    try {
      const url = new URL(href);
      const expectedHost = label === 'Google Play' ? 'play.google.com' : 'apps.apple.com';
      return url.protocol === 'https:' && url.hostname === expectedHost && url.pathname.length > 1;
    } catch {
      return false;
    }
  });
}

function StoreLinks({ project, featured = false }) {
  const links = getStoreLinks(project);
  if (links.length === 0) return null;

  return (
    <div className={`projects-page__store-links ${featured ? 'is-featured' : ''}`}>
      {links.map(({ label, href, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer">
          <Icon aria-hidden="true" />
          <span>{featured ? `Get it on ${label}` : label}</span>
          <FiArrowUpRight aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

function ProjectCard({ project }) {
  const summary = projectSummaries[project.id] || project.description;

  return (
    <article
      className={`projects-page__card projects-page__card--${project.id}`}
      id={project.id}
      data-tone={project.theme === 'light' ? 'light' : 'dark'}
      aria-labelledby={`${project.id}-title`}
    >
      <div className="projects-page__card-media">
        <img
          src={project.image}
          alt={project.imageAlt}
          width={project.imageWidth}
          height={project.imageHeight}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="projects-page__card-copy">
        <h3 id={`${project.id}-title`}>{project.name}</h3>
        <p className="projects-page__category">{project.category}</p>
        <p className="projects-page__summary">{summary}</p>

        <div className="projects-page__card-meta">
          <div>
            <span>Role</span>
            <strong>{project.role}</strong>
          </div>
          <div>
            <span>Built with</span>
            <strong>{project.tech}</strong>
          </div>
        </div>

        <details className="projects-page__details">
          <summary>Project details</summary>
          <div className="projects-page__details-content">
            <p>{project.description}</p>
            <dl>
              <div>
                <dt>{project.toolsLabel || 'Tools'}</dt>
                <dd>{project.tools}</dd>
              </div>
              <div>
                <dt>Platforms</dt>
                <dd>{project.platforms.join(' · ')}</dd>
              </div>
            </dl>
          </div>
        </details>

        <StoreLinks project={project} />
      </div>
    </article>
  );
}

export default function ProjectsPage({ theme = 'dark' }) {
  const introRef = useRef(null);
  const featuredRef = useRef(null);
  const featuredProject = showcaseProjects.find((project) => project.id === 'readmate');
  const archiveProjects = showcaseProjects.filter((project) => project.id !== 'readmate');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const targets = [introRef.current, featuredRef.current].filter(Boolean);
    if (targets.length === 0) return undefined;

    const entrance = animate(targets, {
      opacity: [0.88, 1],
      translateY: [14, 0],
      delay: stagger(90),
      duration: 560,
      ease: 'outExpo',
    });

    return () => entrance.pause();
  }, []);

  return (
    <div className="projects-page" data-theme={theme}>
      <SEO title={SEO_TEXT.projectsTitle} description={SEO_TEXT.projectsDescription} />

      <div className="projects-page__shell">
        <header className="projects-page__intro" ref={introRef}>
          <h1>Selected projects</h1>
          <div className="projects-page__intro-row">
            <p>
              Mobile products built for everyday life—from money and language to faith, care, and work.
              Designed, engineered, and shipped with a focus on useful details.
            </p>
            <a className="projects-page__scroll-link" href="#featured-project">
              <span>Explore the work</span>
              <FiArrowDown aria-hidden="true" />
            </a>
          </div>
        </header>

        {featuredProject && (
          <section className={`projects-page__featured projects-page__featured--${featuredProject.id}`} id="featured-project" ref={featuredRef} aria-labelledby="featured-project-title">
            <div className="projects-page__featured-media">
              <img
                src={featuredProject.image}
                alt={featuredProject.imageAlt}
                width={featuredProject.imageWidth}
                height={featuredProject.imageHeight}
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>

            <div className="projects-page__featured-copy">
              <h2 id="featured-project-title">{featuredProject.name}</h2>
              <p className="projects-page__category">{featuredProject.category}</p>
              <p className="projects-page__featured-description">{featuredSummary}</p>

              <div className="projects-page__proof-row">
                {featuredProject.highlights?.map((highlight) => <span key={highlight}>{highlight}</span>)}
                <span>{featuredProject.platforms.join(' · ')}</span>
              </div>

              <div className="projects-page__featured-meta">
                <div>
                  <span>My role</span>
                  <strong>{featuredProject.role}</strong>
                </div>
                <div>
                  <span>Built with</span>
                  <strong>{featuredProject.tech}</strong>
                </div>
              </div>

              <details className="projects-page__featured-details">
                <summary>Full project scope</summary>
                <p>{featuredProject.description}</p>
                <dl>
                  <div>
                    <dt>{featuredProject.toolsLabel || 'Scope'}</dt>
                    <dd>{featuredProject.tools}</dd>
                  </div>
                </dl>
              </details>

              <StoreLinks project={featuredProject} featured />
            </div>
          </section>
        )}

        <section className="projects-page__archive" id="project-archive" aria-labelledby="project-archive-title">
          <div className="projects-page__archive-heading">
            <div>
              <h2 id="project-archive-title">More from the portfolio</h2>
              <p>Products and platforms, each shaped around a real workflow.</p>
            </div>
            <span className="projects-page__archive-count">{String(archiveProjects.length).padStart(2, '0')} projects</span>
          </div>

          <div className="projects-page__grid">
            {archiveProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      </div>

      <div className="projects-page__contact-wrap">
        <ContactSection
          kickerIndex="07"
          kickerLabel="Project inquiries · Engineering scope"
          titlePrefix="Have a project in mind? "
          titleAccent="Let's build it."
          lead="Tell me what you are working on. We can talk through the product, its constraints, and the right way to ship it."
          className="projects-page__contact"
        />
      </div>
    </div>
  );
}
