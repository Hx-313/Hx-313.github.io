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
          Testimonials will follow the work.
        </h2>
        <div className="testimonials-placeholder__frame" aria-label="Testimonials placeholder">
          <div className="testimonials-placeholder__line">
            <span className="portfolio-placeholder-index">VOICE / 00</span>
            <strong>Client perspective</strong>
          </div>
          <div className="testimonials-placeholder__line">
            <span className="portfolio-placeholder-status">Content placeholder</span>
            <span>Approved, attributable client feedback will be added here.</span>
          </div>
          <div className="testimonials-placeholder__line">
            <span className="portfolio-placeholder-rule" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

