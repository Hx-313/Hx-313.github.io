import { CERTIFICATIONS_TEXT } from '../../../../core/constants/certifications/certificationsText.js';
import { CERTIFICATION_RECORDS } from './certificationsData.js';
import CertificationRail from './CertificationRail.jsx';
import './certifications.css';

export default function CertificationsSection() {
  const professionalRecords = CERTIFICATION_RECORDS.filter((record) => record.category === 'professional');
  const personalRecords = CERTIFICATION_RECORDS.filter((record) => record.category === 'personal');

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

        <div className="certifications-archive">
          <h3 className="certifications-subheading">Professional certifications</h3>
          <CertificationRail
            records={professionalRecords}
            ariaLabel={CERTIFICATIONS_TEXT.aria.archive}
          />
          <h3 className="certifications-subheading">Personal excellence</h3>
          <CertificationRail
            records={personalRecords}
            ariaLabel="Personal excellence archive"
          />
        </div>
      </div>
    </section>
  );
}
