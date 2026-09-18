import { SOLUTIONS_TEXT } from '../../../../core/constants/solutions/solutionsText.js';
import './solutions.css';

export default function SolutionsSection() {
  return (
    <section id="solutions" className="solutions-section" aria-labelledby="solutions-heading" data-section="solutions">
      <div className="solutions-container">
        <header className="solutions-header">
          <div>
            <p className="solutions-kicker">{SOLUTIONS_TEXT.kicker}</p>
            <h2 id="solutions-heading">{SOLUTIONS_TEXT.heading}</h2>
          </div>
          <p className="solutions-intro">{SOLUTIONS_TEXT.intro}</p>
        </header>

        <div className="solutions-grid" role="list">
          {SOLUTIONS_TEXT.items.map((solution) => (
            <article key={solution.number} className="solution-card" role="listitem">
              <span className="solution-card__number">{solution.number}</span>
              <h3>{solution.title}</h3>
              <p>{solution.description}</p>
              <span className="solution-card__tags">{solution.tags}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
