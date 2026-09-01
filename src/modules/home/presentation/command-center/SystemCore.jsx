import HolographicGlobe from '../hero/HolographicGlobe.jsx';

export default function SystemCore({ project }) {
  return (
    <section className="system-core system-core--shared-globe" aria-label="Holographic system globe">
      <div className="system-core__topline"><span>Active system</span><span>{project?.name ?? 'HX313'} / 01</span></div>
      <div className="system-core__globe">
        <HolographicGlobe className="holographic-stage-wrapper--dashboard" />
      </div>
    </section>
  );
}
