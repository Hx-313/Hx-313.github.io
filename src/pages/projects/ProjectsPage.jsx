import { useEffect, useRef, useState, useMemo } from 'react';
import { FaApple, FaGooglePlay } from 'react-icons/fa6';
import { FiArrowUpRight } from 'react-icons/fi';

import { showcaseProjects } from '../../data/projects.js';
import SiteHeader from '../../modules/home/presentation/header/SiteHeader.jsx';
import ContactSection from '../../modules/contact/presentation/ContactSection.jsx';
import SiteFooter from '../../modules/footer/presentation/SiteFooter.jsx';
import './projects-page.css';

const STACK_QUERY = '(max-width: 900px) and (min-height: 521px)';
const DUR = 1200; // ms: image travel duration
const DWELL = 300; // ms: quiet pause after landing (Total lock = 1200 + 300 = 1500ms = 1.5s)
const WHEEL_GAP = 120; // ms: quiet period for trackpad gating

function clamp(v, a = 0, b = 1) {
  return Math.max(a, Math.min(b, v));
}

function smooth(a, b, v) {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
}

function ease(p) {
  return 0.5 - 0.5 * Math.cos(Math.PI * p);
}

export default function ProjectsPage({ theme, setTheme, onNavigate }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const projects = showcaseProjects;
  const projectCount = projects.length; // 3
  const totalSections = projectCount + 1; // 3 projects + 1 contact section = 4

  // Main theme resolver: if dark theme is active -> first card dark, second light, etc.
  // If light theme is active -> first card light, second dark, etc.
  const isDarkActive = useMemo(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  }, [theme]);

  const getThemeForIndex = (index) => {
    if (index >= projectCount) {
      return isDarkActive ? 'dark' : 'light';
    }
    if (isDarkActive) {
      return index % 2 === 0 ? 'dark' : 'light';
    }
    return index % 2 === 0 ? 'light' : 'dark';
  };

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return undefined;

    const sections = Array.from(container.querySelectorAll('.projects-page__section, .projects-page__contact-wrap'));
    const copies = Array.from(container.querySelectorAll('.projects-page__copy'));
    const layers = Array.from(stage.querySelectorAll('.projects-page__layer'));
    const reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stackMQ = window.matchMedia(STACK_QUERY);

    let reduce = reduceMotionMQ.matches;
    let idx = 0;
    let busy = false;
    let animating = false;
    let lastActive = -1;
    let current = 0;
    let target = 0;
    const geo = { tops: [] };

    function put(el, prop, v) {
      if (!el) return;
      const c = el._c || (el._c = {});
      if (c[prop] !== v) {
        c[prop] = v;
        el.style[prop] = v;
      }
    }

    function measure() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const barH = 72; // SiteHeader height
      geo.mobile = stackMQ.matches;
      geo.tops = sections.map((s) => s.offsetTop);
      geo.tops.push(document.documentElement.scrollHeight || vh * totalSections);

      if (geo.mobile) {
        const top = barH + 8;
        const free = vh - top;
        geo.w = Math.min(vw * 0.86, free * 0.4 * 1.25, 520);
        geo.h = geo.w * 0.8;
        geo.xL = (vw - geo.w) / 2;
        geo.xR = geo.xL;
        geo.y = top;
        container.style.setProperty('--copy-top', `${Math.round(geo.y + geo.h + Math.max(14, vh * 0.025))}px`);
      } else {
        const pad = vw * 0.06;
        const gap = vw * 0.06;
        const col = (vw - 2 * pad - gap) / 2;
        const maxH = Math.min(vh * 0.68, vh - 2 * barH - 24);
        geo.w = Math.min(col, maxH * 1.25);
        geo.h = geo.w * 0.8;
        geo.xL = pad + (col - geo.w) / 2;
        geo.xR = pad + col + gap + (col - geo.w) / 2;
        geo.y = (vh - geo.h) / 2;
      }

      stage.style.width = `${geo.w}px`;
      stage.style.height = `${geo.h}px`;
    }

    function render(t) {
      const isPastProjects = t >= projectCount - 0.15;
      // Fade out stage when arriving at contact section
      if (isPastProjects) {
        const fade = clamp(1 - (t - (projectCount - 1)) * 1.6);
        put(stage, 'opacity', fade.toFixed(3));
      } else {
        put(stage, 'opacity', '1');
      }

      const i = Math.min(Math.floor(t), projectCount - 2);
      const u = t - i;
      const e = clamp((u - 0.03) / 0.94);
      const fromX = i % 2 === 0 ? geo.xL : geo.xR;
      const toX = i % 2 === 0 ? geo.xR : geo.xL;
      const dir = toX > fromX ? 1 : -1;
      const arc = Math.sin(Math.PI * e);

      const x = geo.mobile ? geo.xL : fromX + (toX - fromX) * e;
      const y = geo.y - (geo.mobile ? 0 : arc * 16);
      const rot = reduce ? 0 : dir * arc * 3.5;
      const sc = reduce ? 1 : 1 - arc * 0.05;

      put(
        stage,
        'transform',
        `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(3)}deg) scale(${sc.toFixed(4)})`
      );

      const m = smooth(0.25, 0.75, e);
      for (let k = 0; k < projectCount; k++) {
        const l = layers[k];
        if (!l) continue;
        if (k === i) {
          put(l, 'opacity', (1 - m).toFixed(3));
          put(l, 'clipPath', 'none');
          put(l, 'zIndex', '1');
        } else if (k === i + 1) {
          const cut = (1 - m) * 100;
          put(l, 'opacity', Math.min(1, 0.2 + m * 1.2).toFixed(3));
          put(l, 'clipPath', m >= 1 ? 'none' : dir > 0 ? `inset(0 ${cut.toFixed(2)}% 0 0)` : `inset(0 0 0 ${cut.toFixed(2)}%)`);
          put(l, 'zIndex', '2');
        } else {
          put(l, 'opacity', '0');
          put(l, 'zIndex', '0');
        }
      }

      for (let s = 0; s < copies.length; s++) {
        const d = t - s;
        const a = Math.abs(d);
        const copy = copies[s];
        if (!copy) continue;
        if (a >= 1) {
          put(copy, 'opacity', '0');
          continue;
        }
        const side = s % 2 === 0 ? 1 : -1;
        const vis = 1 - smooth(0.15, 0.85, a);
        const shift = geo.mobile || reduce ? 0 : side * (1 - vis) * 7 * (d < 0 ? -1 : 1);
        const lift = geo.mobile && !reduce ? (1 - vis) * 20 : 0;
        put(copy, 'opacity', vis.toFixed(3));
        put(copy, 'transform', `translate3d(${shift.toFixed(3)}vw, ${lift.toFixed(2)}px, 0)`);
      }

      const active = Math.round(t);
      if (active !== lastActive) {
        lastActive = active;
        setActiveIdx(active);
        const activeTheme = sections[active]?.classList.contains('dark') ? 'dark' : 'light';
        container.dataset.theme = activeTheme;
      }
    }

    function goTo(k) {
      if (busy || k < 0 || k >= totalSections || k === idx) return;
      busy = true;
      animating = true;
      const from = geo.tops[idx] || 0;
      const to = geo.tops[k] || 0;
      const dur = reduce ? 250 : DUR;
      let startTime = null;

      function frame(now) {
        if (startTime === null) startTime = now;
        const p = clamp((now - startTime) / dur);
        const y = from + (to - from) * ease(p);
        window.scrollTo(0, y);
        current = target = clamp(idx + ((y - from) / ((to - from) || 1)) * (k - idx), 0, totalSections - 1);
        render(current);

        if (p < 1) {
          requestAnimationFrame(frame);
          return;
        }

        idx = k;
        current = target = k;
        render(k);
        animating = false;
        setTimeout(() => {
          busy = false;
        }, reduce ? 0 : DWELL); // Exactly 1.5 sec total lock (1200 + 300)
      }

      requestAnimationFrame(frame);
    }

    let lastWheel = 0;
    function handleWheel(e) {
      if (e.ctrlKey) return;
      // Allow natural scrolling inside contact/footer section unless scrolling up at the top of contact
      if (idx === projectCount) {
        if (window.scrollY <= (geo.tops[projectCount] || 0) + 10 && e.deltaY < -15) {
          e.preventDefault();
          goTo(projectCount - 1);
        }
        return;
      }

      e.preventDefault();
      const now = performance.now();
      const gap = now - lastWheel;
      lastWheel = now;
      if (busy || gap < WHEEL_GAP || Math.abs(e.deltaY) < 8) return;
      goTo(idx + (e.deltaY > 0 ? 1 : -1));
    }

    let touchStartY = null;
    function handleTouchStart(e) {
      touchStartY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
      if (idx === projectCount) return; // Allow natural touch scrolling on contact/footer
      e.preventDefault();
      if (touchStartY === null || busy) return;
      const dy = touchStartY - e.touches[0].clientY;
      if (Math.abs(dy) > 36) {
        touchStartY = null;
        goTo(idx + (dy > 0 ? 1 : -1));
      }
    }

    function handleTouchEnd() {
      touchStartY = null;
    }

    function handleKeyDown(e) {
      const k = e.key;
      const tag = (e.target.tagName || '').toLowerCase();
      const onControl = tag === 'a' || tag === 'button' || tag === 'input' || tag === 'textarea';
      if (onControl) return;

      const next = k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey);
      const prev = k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey);

      if (next) {
        e.preventDefault();
        goTo(idx + 1);
      } else if (prev) {
        e.preventDefault();
        goTo(idx - 1);
      } else if (k === 'Home') {
        e.preventDefault();
        goTo(0);
      } else if (k === 'End') {
        e.preventDefault();
        goTo(totalSections - 1);
      }
    }

    let resizeTimer = null;
    function handleResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        reduce = reduceMotionMQ.matches;
        measure();
        window.scrollTo(0, geo.tops[idx] || 0);
        render(idx);
      }, 50);
    }

    container._goTo = goTo;

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    measure();
    render(0);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [totalSections, projectCount]);

  const handleDotClick = (i) => {
    if (containerRef.current && typeof containerRef.current._goTo === 'function') {
      containerRef.current._goTo(i);
    }
  };

  const handleHeaderNavigate = (e, href, id) => {
    if (id === 'projects') {
      handleDotClick(0);
    } else if (id === 'contact') {
      handleDotClick(projectCount);
    } else if (typeof onNavigate === 'function') {
      onNavigate(e, href, id);
    }
  };

  return (
    <div className="projects-page" ref={containerRef} data-theme={getThemeForIndex(0)}>
      {/* Universal SiteHeader with Main Page Routes & ThemeToggle */}
      <SiteHeader
        theme={theme}
        setTheme={setTheme}
        onNavigate={handleHeaderNavigate}
        activeSectionOverride={activeIdx >= projectCount ? 'contact' : 'projects'}
      />

      {/* Side Navigation Dots */}
      <nav className="projects-page__dots" aria-label="Projects navigation deck">
        {projects.map((project, i) => (
          <button
            key={project.id}
            type="button"
            aria-label={`Jump to ${project.name}`}
            aria-current={i === activeIdx ? 'true' : 'false'}
            onClick={() => handleDotClick(i)}
          />
        ))}
        <button
          key="contact-dot"
          type="button"
          aria-label="Jump to Contact & Inquiries"
          aria-current={activeIdx === projectCount ? 'true' : 'false'}
          onClick={() => handleDotClick(projectCount)}
        />
      </nav>

      {/* Shared Traveling Stage */}
      <div className="projects-page__stage" ref={stageRef} id="stage" aria-hidden="true">
        {projects.map((project) => (
          <div className="projects-page__layer" key={`layer-${project.id}`}>
            <img src={project.image} alt={project.imageAlt} loading="eager" />
          </div>
        ))}
      </div>

      {/* Alternating Project Sections */}
      {projects.map((project, i) => {
        const cardTheme = getThemeForIndex(i);
        const isFlip = i % 2 !== 0;

        return (
          <section
            key={project.id}
            className={`projects-page__section ${cardTheme} ${isFlip ? 'flip' : ''}`}
            id={project.id}
            data-title={project.name}
          >
            <div className="projects-page__copy">
              {project.eyebrow && <span className="projects-page__eyebrow">{project.eyebrow}</span>}
              <h2>{project.name}</h2>
              <p>{project.description}</p>

              <dl className="projects-page__meta">
                <dt>Role</dt>
                <dd>{project.role}</dd>
                <dt>Tech</dt>
                <dd>{project.tech}</dd>
                <dt>Tools</dt>
                <dd>{project.tools}</dd>
              </dl>

              <div className="projects-page__actions">
                <div className="projects-page__platforms" aria-label={`${project.name} platform links`}>
                  {project.storeLinks?.googlePlay && (
                    <a
                      className="projects-page__pf-link"
                      href={project.storeLinks.googlePlay}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.name} on Google Play`}
                      title="Google Play Store"
                    >
                      <FaGooglePlay size={18} aria-hidden="true" />
                    </a>
                  )}
                  {project.storeLinks?.appStore && (
                    <a
                      className="projects-page__pf-link"
                      href={project.storeLinks.appStore}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.name} on Apple App Store`}
                      title="Apple App Store"
                    >
                      <FaApple size={20} aria-hidden="true" />
                    </a>
                  )}
                </div>

                <a className="projects-page__action-link" href={project.actionHref || `#${project.id}`}>
                  <span>{project.actionText || 'View case study'}</span>
                  <FiArrowUpRight aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        );
      })}

      {/* Section 4: Contact Form tailored to Projects + SiteFooter */}
      <div
        className={`projects-page__contact-wrap ${getThemeForIndex(projectCount)}`}
        data-title="Contact & Colophon"
      >
        <ContactSection
          kickerIndex="04"
          kickerLabel="Project Inquiries · Engineering Scope"
          titlePrefix="Have a project in mind? "
          titleAccent="Let's engineer it."
          lead="From offline-first Flutter applications to complex financial systems and AI engines, let's discuss requirements, technical architecture, and deployment milestones."
        />
        <SiteFooter />
      </div>
    </div>
  );
}
