import { useEffect, useRef, useState } from 'react';
import CertificationCard from './CertificationCard.jsx';

export default function CertificationRail({ records, ariaLabel }) {
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
  }, [records]);

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
    <div className="certification-rail">
      <div
        ref={railRef}
        className="certification-rail__track"
        tabIndex={0}
        role="region"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
      >
        {records.map((record) => (
          <CertificationCard key={record.id} record={record} isActive={record.id === activeId} />
        ))}
      </div>
    </div>
  );
}
