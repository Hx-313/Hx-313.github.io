import { systemDomains } from '../../../../data/projects.js';

const positions = [
  { x: 18, y: 22 }, { x: 82, y: 22 }, { x: 18, y: 78 }, { x: 82, y: 78 },
];

export default function SystemCore({ project, highlightedDomains }) {
  if (project?.featured) {
    return <section className="system-core wos-core" aria-labelledby="wos-core-title">
      <div className="system-core__topline"><span>Active system</span><span>WOS / 01</span></div>
      <div className="wos-core__map" role="img" aria-labelledby="wos-core-title wos-core-desc">
        <h2 id="wos-core-title">WOS <span>core</span></h2><p id="wos-core-desc">OnlineOrder.pk restaurant technology platform.</p>
        <div className="wos-core__node wos-core__node--customer"><strong>Customer web</strong><small>Online ordering</small></div>
        <div className="wos-core__node wos-core__node--admin"><strong>Admin panel</strong><small>Control center</small></div>
        <div className="wos-core__node wos-core__node--terminal"><strong>Order terminal</strong><small>Front of house</small></div>
        <div className="wos-core__node wos-core__node--epos"><strong>ePOS</strong><small>Sales + inventory</small></div>
        <div className="wos-core__node wos-core__node--kitchen"><strong>Kitchen / KDS</strong><small>Fulfilment</small></div>
        <i className="wos-core__line wos-core__line--one" /><i className="wos-core__line wos-core__line--two" /><i className="wos-core__line wos-core__line--three" /><i className="wos-core__line wos-core__line--four" /><i className="wos-core__line wos-core__line--five" />
      </div>
    </section>;
  }
  return (
    <section className="system-core" aria-labelledby="system-core-title">
      <div className="system-core__topline"><span>System core</span><span>HX313 / 01</span></div>
      <svg className="system-core__map" viewBox="0 0 100 100" role="img" aria-labelledby="system-core-title system-core-desc">
        <title id="system-core-title">HX313 system core</title>
        <desc id="system-core-desc">A connected system map linking HX313 to mobile, SaaS, backend, and cloud engineering domains.</desc>
        <defs><radialGradient id="coreGlow"><stop stopColor="currentColor" stopOpacity=".32" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></radialGradient></defs>
        <circle cx="50" cy="50" r="42" className="system-core__grid-ring" />
        <circle cx="50" cy="50" r="31" className="system-core__grid-ring system-core__grid-ring--inner" />
        <circle cx="50" cy="50" r="20" fill="url(#coreGlow)" className="system-core__glow" />
        {positions.map((point, index) => <line key={systemDomains[index].id} x1="50" y1="50" x2={point.x} y2={point.y} className={`system-core__line ${highlightedDomains.has(systemDomains[index].id) ? 'is-highlighted' : ''}`} />)}
        <circle cx="50" cy="50" r="15" className="system-core__core-ring" />
        {positions.map((point, index) => <circle key={`node-${systemDomains[index].id}`} cx={point.x} cy={point.y} r="1.5" className={`system-core__node ${highlightedDomains.has(systemDomains[index].id) ? 'is-highlighted' : ''}`} />)}
      </svg>
      <div className="system-core__center"><strong>Hx<span>313</span></strong><small>Full-stack<br />software engineer</small><em><i /> Online</em></div>
      {systemDomains.map((domain, index) => <div key={domain.id} className={`system-core__domain system-core__domain--${index + 1} ${highlightedDomains.has(domain.id) ? 'is-highlighted' : ''}`}><i aria-hidden="true" /><span>{domain.short}</span><small>{domain.label}</small></div>)}
    </section>
  );
}
