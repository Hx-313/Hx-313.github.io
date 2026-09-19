import { useEffect, useRef, useState } from 'react';
import CertificationCard from './CertificationCard.jsx';

export default function CertificationRail({ group }) {
  const railRef = useRef(null);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !('IntersectionObserver' in window)) return undefined;

    const cards = Array.from(rail.querySelectorAll('[data-certification-card]'));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveId(visible.target.dataset.certificationCard);
        }
      },
      {
        root: rail,
        threshold: [0.55, 0.75],
      }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [group.records]);

  const handleKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    const rail = railRef.current;
    if (!rail) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    rail.scrollBy({
      left: direction * Math.round(rail.clientWidth * 0.72),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section className={`certification-rail certification-rail--${group.id}`} aria-labelledby={`${group.id}-certifications-heading`}>
      <header className="certification-rail__header">
        <h3 id={`${group.id}-certifications-heading`}>{group.heading}</h3>
        <span className="certification-rail__count" aria-hidden="true">
          {String(group.records.length).padStart(2, '0')} records
        </span>
      </header>

      <div
        ref={railRef}
        className="certification-rail__track"
        tabIndex={0}
        role="region"
        aria-label={group.ariaLabel}
        onKeyDown={handleKeyDown}
      >
        {group.records.map((record) => (
          <CertificationCard key={record.id} record={record} isActive={record.id === activeId} />
        ))}
      </div>
    </section>
  );
}
