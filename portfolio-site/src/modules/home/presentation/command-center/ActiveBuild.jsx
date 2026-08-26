export default function ActiveBuild({ project }) {
  const metrics = Object.entries(project.metrics ?? {});
  return (
    <section className="active-build panel" aria-labelledby="active-build-title">
      <div className="panel__header"><span>Active system</span><span>01 / 08</span></div>
      <div className={`active-build__body ${project.featured ? 'active-build__body--system' : ''}`}>
        <div><h2 id="active-build-title">{project.name}</h2><p className="active-build__type">{project.type}</p><p className="active-build__description">{project.description ?? `${project.name} — a shipped product in the HX313 system.`}</p><p className="status status--production"><i /> {project.status}</p></div>
        {project.surfaces ? <div className="surface-grid" aria-label="WOS connected surfaces">{project.surfaces.map((surface) => <figure key={surface.label}><img src={surface.image} alt={`${surface.label} interface`} /><figcaption>{surface.label}</figcaption></figure>)}</div> : <img src={project.image} alt={`${project.name} product preview`} />}
      </div>
      {metrics.length > 0 && <div className="active-build__metrics">{metrics.map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>}
      <a className="active-build__cta" href="#work">{project.cta} <span aria-hidden="true">↗</span></a>
    </section>
  );
}
