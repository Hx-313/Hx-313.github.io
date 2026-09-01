import { useRef } from 'react';
import { disciplines } from './howIBuildData.js';

export default function DisciplineControllers({ activeDisciplineId, onSelectDiscipline }) {
  const tabRefs = useRef([]);
  const activeDiscipline = disciplines.find((d) => d.id === activeDisciplineId) || disciplines[0];

  const handleKeyDown = (event, index) => {
    let nextIndex = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % disciplines.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + disciplines.length) % disciplines.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = disciplines.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const targetDiscipline = disciplines[nextIndex];
      onSelectDiscipline(targetDiscipline.id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Engineering disciplines"
      className="discipline-tablist-bar"
    >
      {disciplines.map((d, index) => {
        const isActive = d.id === activeDiscipline.id;

        return (
          <button
            key={d.id}
            id={`discipline-tab-${d.id}`}
            type="button"
            role="tab"
            className={`discipline-tab-btn ${isActive ? 'is-active-tab' : ''}`}
            aria-selected={isActive}
            aria-controls="discipline-panel"
            tabIndex={isActive ? 0 : -1}
            ref={(el) => (tabRefs.current[index] = el)}
            onClick={() => onSelectDiscipline(d.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <span className="tab-num-tag">{d.number}</span>
            <span className="tab-sep-slash" aria-hidden="true">//</span>
            <span className="tab-title-text">{d.label}</span>
            {isActive && <span className="tab-pulse-beacon" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
