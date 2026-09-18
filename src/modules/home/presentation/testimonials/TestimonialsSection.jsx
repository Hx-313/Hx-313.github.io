import { TESTIMONIALS_TEXT } from '../../../../core/constants/testimonials/testimonialsText.js';
import '../placeholders/placeholders.css';

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="portfolio-placeholder-section testimonials-section"
      aria-labelledby="testimonials-heading"
      data-section="testimonials"
      data-motion="testimonials"
    >
      <div className="portfolio-placeholder-container">
        <h2 id="testimonials-heading" className="portfolio-placeholder-heading">
          {TESTIMONIALS_TEXT.heading}
        </h2>
        <div className="testimonials-placeholder__frame" aria-label={TESTIMONIALS_TEXT.aria.frame}>
          <div className="testimonials-placeholder__line">
            <span className="portfolio-placeholder-index">{TESTIMONIALS_TEXT.archiveIndex}</span>
            <strong>{TESTIMONIALS_TEXT.archiveTitle}</strong>
          </div>
          <div className="testimonials-placeholder__line">
            <span className="portfolio-placeholder-status">{TESTIMONIALS_TEXT.placeholderStatus}</span>
            <span>{TESTIMONIALS_TEXT.description}</span>
          </div>
          <div className="testimonials-placeholder__line">
            <span className="portfolio-placeholder-rule" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
