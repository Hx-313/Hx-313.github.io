import { CERTIFICATIONS_TEXT } from '../../../../core/constants/certifications/certificationsText.js';
import { CERTIFICATION_GROUPS } from './certificationsData.js';
import CertificationRail from './CertificationRail.jsx';
import './certifications.css';

export default function CertificationsSection() {
  return (
    <section
      id="certifications"
      className="certifications-section"
      aria-labelledby="certifications-heading"
      aria-label={CERTIFICATIONS_TEXT.aria.section}
      data-section="certifications"
      data-motion="certifications"
    >
      <div className="certifications-container">
        <header className="certifications-header">
          <p className="certifications-kicker">{CERTIFICATIONS_TEXT.kicker}</p>
          <h2 id="certifications-heading" className="certifications-heading">
          {CERTIFICATIONS_TEXT.heading}
          </h2>
          <p className="certifications-intro">{CERTIFICATIONS_TEXT.description}</p>
        </header>

        <div className="certifications-rails">
          {CERTIFICATION_GROUPS.map((group) => (
            <CertificationRail key={group.id} group={group} />
          ))}
        </div>
      </div>
    </section>
  );
}
