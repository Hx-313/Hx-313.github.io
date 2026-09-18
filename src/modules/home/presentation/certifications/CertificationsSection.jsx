import { CERTIFICATIONS_TEXT } from '../../../../core/constants/certifications/certificationsText.js';
import '../placeholders/placeholders.css';

export default function CertificationsSection() {
  return (
    <section
      id="certifications"
      className="portfolio-placeholder-section certifications-section"
      aria-labelledby="certifications-heading"
      data-section="certifications"
      data-motion="certifications"
    >
      <div className="portfolio-placeholder-container">
        <h2 id="certifications-heading" className="portfolio-placeholder-heading">
          {CERTIFICATIONS_TEXT.heading}
        </h2>
        <div className="certifications-placeholder__frame" aria-label={CERTIFICATIONS_TEXT.aria.frame}>
          <div className="certifications-placeholder__line">
            <span className="portfolio-placeholder-index">{CERTIFICATIONS_TEXT.archiveIndex}</span>
            <strong>{CERTIFICATIONS_TEXT.archiveTitle}</strong>
          </div>
          <div className="certifications-placeholder__line">
            <span className="portfolio-placeholder-status">{CERTIFICATIONS_TEXT.placeholderStatus}</span>
            <span>{CERTIFICATIONS_TEXT.description}</span>
          </div>
          <div className="certifications-placeholder__line">
            <span className="portfolio-placeholder-rule" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
