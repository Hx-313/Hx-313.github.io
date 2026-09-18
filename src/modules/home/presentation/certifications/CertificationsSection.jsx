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
          Certifications will live here when the record is ready.
        </h2>
        <div className="certifications-placeholder__frame" aria-label="Certification archive placeholder">
          <div className="certifications-placeholder__line">
            <span className="portfolio-placeholder-index">CERT / 00</span>
            <strong>Verification archive</strong>
          </div>
          <div className="certifications-placeholder__line">
            <span className="portfolio-placeholder-status">Content placeholder</span>
            <span>Verified credentials will be added with issuer, date, and evidence.</span>
          </div>
          <div className="certifications-placeholder__line">
            <span className="portfolio-placeholder-rule" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

