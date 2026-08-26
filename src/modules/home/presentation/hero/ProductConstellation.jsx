import { buildConstellationArtifacts } from './constellationData.js';

export default function ProductConstellation({ controller }) {
  const { projects, selectedId, selectedProject, setSelectedId } = controller;
  const artifacts = buildConstellationArtifacts(projects);

  return (
    <section className="product-constellation" aria-labelledby="constellation-title">
      <div className="constellation__header">
        <span>Product constellation</span>
        <span>Live system / 08</span>
      </div>
      <div className="constellation" role="group" aria-label="HX313 product constellation">
        <div className="constellation__field" aria-hidden="true">
          <span className="constellation__orbit constellation__orbit--outer" />
          <span className="constellation__orbit constellation__orbit--inner" />
          <span className="constellation__scanline" />
          <span className="constellation__coordinate constellation__coordinate--one">HX313 / PRODUCT SYSTEM</span>
          <span className="constellation__coordinate constellation__coordinate--two">SYS / 2026</span>
          <span className="constellation__metric">{projects.length} shipped products · one build system</span>
        </div>
        <div className="constellation__connections" aria-hidden="true">
          {artifacts.map((artifact) => <span className={`constellation__connection ${artifact.className}`} key={artifact.id} />)}
        </div>
        <div className="constellation__core">
          <span className="constellation__core-ring" aria-hidden="true" />
          <strong id="constellation-title" className="constellation__core-mark">Hx<span>313</span></strong>
          <small>Product engineering<br />system</small>
          <i aria-hidden="true" />
        </div>
        <div className="constellation__artifacts">
          {artifacts.map((artifact) => {
            const project = projects.find((candidate) => candidate.id === artifact.id);
            const isSelected = artifact.id === selectedId;
            return (
              <button
                className={`constellation__artifact ${artifact.className} ${isSelected ? 'is-selected' : ''}`}
                key={artifact.id}
                type="button"
                aria-pressed={isSelected}
                aria-label={`Select ${artifact.name}, ${artifact.category} project`}
                onClick={() => setSelectedId(artifact.id)}
              >
                <span className="constellation__artifact-logo"><img src={project.image} alt="" /></span>
                <span className="constellation__artifact-copy"><strong>{artifact.name}</strong><small>{artifact.category}</small></span>
                <span className="constellation__artifact-status"><i aria-hidden="true" /> {artifact.status}</span>
              </button>
            );
          })}
        </div>
        <div className="constellation__readout" aria-live="polite">
          <span className="constellation__readout-kicker">Selected build</span>
          <strong>{selectedProject.name}</strong>
          <small>{selectedProject.type}</small>
        </div>
      </div>
    </section>
  );
}
