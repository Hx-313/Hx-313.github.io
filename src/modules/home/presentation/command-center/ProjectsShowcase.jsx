import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useEffect, useRef } from 'react';

import './projects-showcase.css';

export const HOLD_START_PROGRESS = 0.82;

const FEATURED_PROJECT_IDS = ['speak', 'expenseflow', 'wos'];

function getCarouselState(index, total) {
  if (index === 0) return 'active';
  if (index === 1) return 'next';
  if (index === total - 1) return 'previous';
  return 'hidden';
}

function ProjectCard({ project, carouselState }) {
  return (
    <article
      className="projects-showcase__card"
      data-project-id={project.id}
      data-carousel-state={carouselState}
      aria-hidden={carouselState === 'hidden'}
    >
      <div className="projects-showcase__media">
        <img src={project.image} alt={project.imageAlt} loading="lazy" />
      </div>
      <div className="projects-showcase__body">
        <span className="projects-showcase__tag">{project.category}</span>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <div className="projects-showcase__platforms" aria-label={`${project.name} surfaces`}>
          {project.platforms.map((platform) => <span className="projects-showcase__platform" key={platform}>{platform}</span>)}
        </div>
      </div>
    </article>
  );
}

function SeeAllProjectsCard({ carouselState }) {
  return (
    <article
      className="projects-showcase__card projects-showcase__card--cta"
      data-project-id="see-all-projects"
      data-carousel-state={carouselState}
      aria-hidden={carouselState === 'hidden'}
    >
      <span className="projects-showcase__tag">Next build</span>
      <span className="projects-showcase__cta-mark" aria-hidden="true">↗</span>
      <h3>See all projects</h3>
      <p>Browse the wider archive of mobile products, systems, and experiments behind the main sequence.</p>
      <a className="projects-showcase__cta-link" href="#contact" tabIndex={carouselState === 'hidden' ? -1 : 0}>
        Start with a project brief <span aria-hidden="true">↗</span>
      </a>
      <span className="projects-showcase__hold-note">You are here for a moment — choose a direction.</span>
    </article>
  );
}

export default function ProjectsShowcase({ projects = [] }) {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const fillRef = useRef(null);
  const previousButtonRef = useRef(null);
  const nextButtonRef = useRef(null);
  const featuredProjects = FEATURED_PROJECT_IDS
    .map((projectId) => projects.find((project) => project.id === projectId))
    .filter(Boolean);
  const cardCount = featuredProjects.length + 1;

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const fill = fillRef.current;
    const previousButton = previousButtonRef.current;
    const nextButton = nextButtonRef.current;
    if (!section || !viewport || !track || !fill) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(pointer:fine)');
    const cards = [...track.querySelectorAll('[data-project-id]')];
    const CAROUSEL_STEP_COUNT = Math.max(1, cards.length - 1);
    let activeIndex = 0;
    let frame = 0;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const isScrubMode = () => finePointer.matches && !reducedMotion.matches && window.innerWidth > 720;
    const getStateForCard = (cardIndex, currentIndex) => {
      const relativeIndex = (cardIndex - currentIndex + cards.length) % cards.length;
      if (relativeIndex === 0) return 'active';
      if (relativeIndex === 1) return 'next';
      if (relativeIndex === cards.length - 1) return 'previous';
      return 'hidden';
    };

    const applyCardStates = (currentIndex) => {
      cards.forEach((card, cardIndex) => {
        const state = getStateForCard(cardIndex, currentIndex);
        card.dataset.carouselState = state;
        card.setAttribute('aria-hidden', String(state === 'hidden'));
        const link = card.querySelector('a');
        if (link) link.tabIndex = state === 'hidden' ? -1 : 0;
      });
    };

    const scrollToIndex = (index) => {
      if (!isScrubMode()) return;
      const scrollable = Math.max(0, section.offsetHeight - window.innerHeight);
      const progress = CAROUSEL_STEP_COUNT > 0 ? index / CAROUSEL_STEP_COUNT : 0;
      window.scrollTo({
        top: section.offsetTop + scrollable * progress,
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });
    };

    const setActiveIndex = (nextIndex, { syncScroll = false } = {}) => {
      if (!cards.length) return;
      activeIndex = (nextIndex + cards.length) % cards.length;
      applyCardStates(activeIndex);
      section.dataset.activeIndex = String(activeIndex);
      section.classList.toggle('is-holding', activeIndex === cards.length - 1);
      if (syncScroll) scrollToIndex(activeIndex);
    };

    const measure = () => {
      const cardHeight = cards.reduce((height, card) => Math.max(height, card.scrollHeight), 0);
      if (cardHeight > 0) track.style.setProperty('--projects-carousel-height', `${cardHeight}px`);

      const stepDistance = Math.max(220, Math.round(window.innerHeight * 0.42));
      const scrollDistance = isScrubMode() ? stepDistance * CAROUSEL_STEP_COUNT : 0;
      section.style.setProperty('--projects-scroll-distance', `${scrollDistance}px`);
    };

    const update = () => {
      frame = 0;
      measure();
      const scrub = isScrubMode();
      const interaction = scrub ? 'scrub' : 'carousel';
      const modeChanged = section.dataset.interaction !== interaction;
      section.dataset.interaction = interaction;

      if (!scrub) {
        if (modeChanged) setActiveIndex(0);
        fill.style.transform = 'scaleX(0)';
        section.style.removeProperty('--projects-progress');
        return;
      }

      const scrollable = Math.max(0, section.offsetHeight - window.innerHeight);
      const rawProgress = scrollable > 0 ? (-section.getBoundingClientRect().top) / scrollable : 0;
      const progress = clamp(rawProgress, 0, 1);
      const targetIndex = clamp(Math.round(progress * CAROUSEL_STEP_COUNT), 0, CAROUSEL_STEP_COUNT);

      setActiveIndex(targetIndex);
      fill.style.transform = `scaleX(${progress})`;
      section.style.setProperty('--projects-progress', progress);
      section.classList.toggle('is-holding', rawProgress >= HOLD_START_PROGRESS && targetIndex === cards.length - 1);
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const handlePrevious = () => setActiveIndex(activeIndex - 1, { syncScroll: true });
    const handleNext = () => setActiveIndex(activeIndex + 1, { syncScroll: true });
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleUpdate);
    resizeObserver?.observe(track);
    resizeObserver?.observe(viewport);
    cards.forEach((card) => resizeObserver?.observe(card));
    const images = [...track.querySelectorAll('img')];
    images.forEach((image) => image.addEventListener('load', scheduleUpdate));
    previousButton?.addEventListener('click', handlePrevious);
    nextButton?.addEventListener('click', handleNext);

    applyCardStates(0);
    measure();
    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    reducedMotion.addEventListener?.('change', scheduleUpdate);
    finePointer.addEventListener?.('change', scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      reducedMotion.removeEventListener?.('change', scheduleUpdate);
      finePointer.removeEventListener?.('change', scheduleUpdate);
      resizeObserver?.disconnect();
      images.forEach((image) => image.removeEventListener('load', scheduleUpdate));
      previousButton?.removeEventListener('click', handlePrevious);
      nextButton?.removeEventListener('click', handleNext);
      section.style.removeProperty('--projects-scroll-distance');
      track.style.removeProperty('--projects-carousel-height');
    };
  }, []);

  return (
    <section className="projects-showcase" ref={sectionRef} id="work" aria-labelledby="projects-showcase-title">
      <div className="projects-showcase__sticky">
        <div className="projects-showcase__header-stage">
          <header className="projects-showcase__header">
            <div>
              <span className="projects-showcase__eyebrow">Selected work / 01</span>
              <h2 id="projects-showcase-title">
                <span className="projects-showcase__headline-line">Built for the moment </span>
                <span className="projects-showcase__headline-line">after the idea.</span>
              </h2>
            </div>
            <p className="projects-showcase__intro">A few products and systems where clear thinking became something people could use.</p>
          </header>
        </div>

        <div className="projects-showcase__cards-stage">
          <div className="projects-showcase__viewport" ref={viewportRef} role="region" aria-label="Selected work carousel">
            <div className="projects-showcase__track" ref={trackRef}>
              {featuredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  carouselState={getCarouselState(index, cardCount)}
                />
              ))}
              <SeeAllProjectsCard carouselState={getCarouselState(cardCount - 1, cardCount)} />
            </div>
          </div>
          <div className="projects-showcase__carousel-controls" aria-label="Change selected project">
            <button className="projects-showcase__carousel-button" ref={previousButtonRef} type="button" aria-label="Show previous project">
              <FiArrowLeft aria-hidden="true" />
            </button>
            <button className="projects-showcase__carousel-button" ref={nextButtonRef} type="button" aria-label="Show next project">
              <FiArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="projects-showcase__progress" aria-hidden="true">
          <span className="projects-showcase__progress-label">Scroll to explore</span>
          <span className="projects-showcase__progress-rail"><span className="projects-showcase__progress-fill" ref={fillRef} /></span>
          <span className="projects-showcase__progress-label">04 / 04</span>
        </div>
      </div>
    </section>
  );
}
