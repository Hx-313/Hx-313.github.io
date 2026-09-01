export default function OpeningProjection({ mascot, statement, mobile = false }) {
  const projectionClassName = mascot === 'dash'
    ? 'opening-projection opening-projection--dash'
    : 'opening-projection opening-projection--aero';
  const projectorClassName = `opening-projector opening-projector--${mascot}`;

  return (
    <div
      className={projectorClassName}
      data-opening-projection-owner={mobile ? 'mobile-stage' : 'mascot'}
      data-opening-mobile-projection={mobile ? mascot : undefined}
      aria-hidden="true"
    >
      <span className="opening-emitter" data-opening-emitter />
      <span className="opening-beam" />
      <span className="opening-projector-particles">
        {Array.from({ length: 8 }, (_, index) => (
          <i key={index} style={{ '--particle-index': index }} />
        ))}
      </span>
      <div className={projectionClassName} data-opening-projection>
        <span className="opening-projection-frame" data-opening-frame />
        <span className="opening-projection-scan" />
        <span className="opening-projection-mark opening-projection-mark--start" />
        <span className="opening-projection-mark opening-projection-mark--end" />
        <span className="opening-projection-speaker">{statement.label} · TRANSMISSION</span>
        <p className="opening-projection-copy" data-opening-copy>
          <span>{statement.lead}</span>
          <strong>{statement.accent}</strong>
        </p>
      </div>
    </div>
  );
}
