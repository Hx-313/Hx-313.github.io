import { useEffect, useRef, useState } from 'react';
import { FaApple, FaGooglePlay } from 'react-icons/fa6';
import { FiArrowLeft, FiArrowUpRight } from 'react-icons/fi';

import { showcaseProjects } from '../../data/projects.js';
import './projects-page.css';

const STACK_QUERY = '(max-width: 900px) and (min-height: 521px)';
const DUR = 1400; // ms: image travel time
const DWELL = 450; // ms: pause after arriving
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

export default function ProjectsPage({ onBackToHome }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const barRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const projects = showcaseProjects;
  const N = projects.length;

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    const bar = barRef.current;
    if (!container || !stage || !bar) return undefined;

    const sections = Array.from(container.querySelectorAll('.projects-page__section'));
    const copies = sections.map((s) => s.querySelector('.projects-page__copy'));
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

    // Prevent body/html scrolling during full-screen paged view
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

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
      const barH = bar.offsetHeight || 60;
      geo.mobile = stackMQ.matches;
      geo.tops = sections.map((s) => s.offsetTop);
      geo.tops.push(document.documentElement.scrollHeight || vh * N);

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
        const maxH = Math.min(vh * 0.7, vh - 2 * barH - 24);
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
      const i = Math.min(Math.floor(t), N - 2);
      const u = t - i;
      const e = clamp((u - 0.03) / 0.94);
      const fromX = i % 2 === 0 ? geo.xL : geo.xR;
      const toX = i % 2 === 0 ? geo.xR : geo.xL;
      const dir = toX > fromX ? 1 : -1;
      const arc = Math.sin(Math.PI * e);

      const x = geo.mobile ? geo.xL : fromX + (toX - fromX) * e;
      const y = geo.y - (geo.mobile ? 0 : arc * 18);
      const rot = reduce ? 0 : dir * arc * 4.5;
      const sc = reduce ? 1 : 1 - arc * 0.06;

      put(stage, 'transform', `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(3)}deg) scale(${sc.toFixed(4)})`);

      const m = smooth(0.3, 0.7, e);
      for (let k = 0; k < N; k++) {
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

      for (let s = 0; s < N; s++) {
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
        const shift = geo.mobile || reduce ? 0 : side * (1 - vis) * 9 * (d < 0 ? -1 : 1);
        const lift = geo.mobile && !reduce ? (1 - vis) * 24 : 0;
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
      if (busy || k < 0 || k >= N || k === idx) return;
      busy = true;
      animating = true;
      const from = geo.tops[idx] || 0;
      const to = geo.tops[k] || 0;
      const dur = reduce ? 250 : DUR + (Math.abs(k - idx) - 1) * 450;
      let startTime = null;

      function frame(now) {
        if (startTime === null) startTime = now;
        const p = clamp((now - startTime) / dur);
        const y = from + (to - from) * ease(p);
        window.scrollTo(0, y);
        const span = (geo.tops[idx + 1] - geo.tops[idx]) || window.innerHeight;
        current = target = clamp(idx + (y - from) / ((to - from) || 1) * (k - idx), 0, N - 1);
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
        }, reduce ? 0 : DWELL);
      }

      requestAnimationFrame(frame);
    }

    let lastWheel = 0;
    function handleWheel(e) {
      if (e.ctrlKey) return;
      e.preventDefault();
      const now = performance.now();
      const gap = now - lastWheel;
      lastWheel = now;
      if (busy || gap < WHEEL_GAP || Math.abs(e.deltaY) < 8) return;
      goTo(idx + (e.deltaY > 0 ? 1 : -1));
    }

    let touchY = null;
    function handleTouchStart(e) {
      touchY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
      e.preventDefault();
      if (touchY === null || busy) return;
      const dy = touchY - e.touches[0].clientY;
      if (Math.abs(dy) > 36) {
        touchY = null;
        goTo(idx + (dy > 0 ? 1 : -1));
      }
    }

    function handleTouchEnd() {
      touchY = null;
    }

    function handleKeyDown(e) {
      const k = e.key;
      const tag = (e.target.tagName || '').toLowerCase();
      const onControl = tag === 'a' || tag === 'button';
      const next = k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey && !onControl);
      const prev = k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey && !onControl);

      if (next || prev) {
        e.preventDefault();
        goTo(idx + (next ? 1 : -1));
      } else if (k === 'Home') {
        e.preventDefault();
        goTo(0);
      } else if (k === 'End') {
        e.preventDefault();
        goTo(N - 1);
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

    // Expose goTo on container for React dot buttons
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
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [N]);

  const handleDotClick = (i) => {
    if (containerRef.current && typeof containerRef.current._goTo === 'function') {
      containerRef.current._goTo(i);
    }
  };

  return (
    <main className="projects-page" ref={containerRef} data-theme="light">
      {/* Top Bar Navigation */}
      <header className="projects-page__bar" ref={barRef} aria-label="Projects navigation">
        <button
          type="button"
          onClick={onBackToHome}
          className="projects-page__back-btn"
          aria-label="Return to portfolio overview"
        >
          <FiArrowLeft aria-hidden="true" />
          <span>Overview</span>
        </button>
        <span className="projects-page__bar-title">
          Selected Builds ({String(activeIdx + 1).padStart(2, '0')} / {String(N).padStart(2, '0')})
        </span>
        <a href="#contact" onClick={onBackToHome} className="projects-page__contact-btn">
          <span>Get in touch</span>
          <FiArrowUpRight aria-hidden="true" />
        </a>
      </header>

      {/* Side Navigation Dots */}
      <nav className="projects-page__dots" aria-label="Projects list">
        {projects.map((project, i) => (
          <button
            key={project.id}
            type="button"
            aria-label={`Jump to ${project.name}`}
            aria-current={i === activeIdx ? 'true' : 'false'}
            onClick={() => handleDotClick(i)}
          />
        ))}
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
      {projects.map((project, i) => (
        <section
          key={project.id}
          className={`projects-page__section ${project.theme || (i % 2 === 0 ? 'light' : 'dark')} ${
            project.flip ? 'flip' : ''
          }`}
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
      ))}
    </main>
  );
}
