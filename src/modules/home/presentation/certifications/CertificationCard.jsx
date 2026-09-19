function CertificateFallback() {
  return (
    <svg
      className="certification-card__fallback"
      viewBox="0 0 400 300"
      role="img"
      aria-label="Certificate preview illustration"
    >
      <rect className="certification-card__fallback-paper" width="400" height="300" rx="10" />
      <rect
        className="certification-card__fallback-border"
        x="16"
        y="16"
        width="368"
        height="268"
        rx="5"
      />
      <rect
        className="certification-card__fallback-border certification-card__fallback-border--inner"
        x="25"
        y="25"
        width="350"
        height="250"
        rx="3"
      />
      <path className="certification-card__fallback-line" d="M62 78h166M62 98h132M62 116h108" />
      <path className="certification-card__fallback-line certification-card__fallback-line--soft" d="M62 224h86" />
      <circle className="certification-card__fallback-seal" cx="311" cy="184" r="45" />
      <circle className="certification-card__fallback-seal certification-card__fallback-seal--inner" cx="311" cy="184" r="35" />
      <path className="certification-card__fallback-check" d="m292 184 12 12 27-29" />
      <path className="certification-card__fallback-ribbon" d="m286 222-10 42 25-13 10 18 10-18 25 13-10-42" />
    </svg>
  );
}

export default function CertificationCard({ record, isActive = false }) {
  const statusLabel = record.status === 'verified' ? 'Verified' : 'Documented';

  return (
    <article
      className={`certification-card certification-card--${record.category}`}
      data-certification-card={record.id}
      data-active={isActive ? 'true' : 'false'}
    >
      <div className="certification-card__preview">
        {record.preview?.type === 'image' ? (
          <img src={record.preview.src} alt={record.preview.alt} />
        ) : (
          <CertificateFallback />
        )}

        <span className="certification-card__status">
          <span aria-hidden="true">✓</span>
          {statusLabel}
        </span>

        {record.document?.href ? (
          <a
            className="certification-card__action"
            href={record.document.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`View credential for ${record.title}`}
          >
            View credential
            <span aria-hidden="true">→</span>
          </a>
        ) : null}
      </div>

      <div className="certification-card__body">
        <h3 className="certification-card__title">{record.title}</h3>

        <div className="certification-card__issuer-row">
          <span className="certification-card__issuer-mark" aria-hidden="true">
            {record.issuerMark}
          </span>
          <span className="certification-card__issuer">{record.issuer}</span>
        </div>

        <div className="certification-card__meta">
          <span>{record.date}</span>
          {record.identifier ? (
            <>
              <span className="certification-card__meta-separator" aria-hidden="true">·</span>
              <span>{record.identifier}</span>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
