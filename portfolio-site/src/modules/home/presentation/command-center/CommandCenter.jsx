import { activity } from '../../../../data/activity.js';
import { proofMetrics, systemStatus } from '../../../../data/metrics.js';
import { technologies } from '../../../../data/technologies.js';
import ActiveBuild from './ActiveBuild.jsx';
import ProjectCard from './ProjectCard.jsx';
import SystemCore from './SystemCore.jsx';

export default function CommandCenter({ controller }) {
  const { projects, selectedProject, selectedId, setSelectedId, highlightedDomains } = controller;
  return <section className="command-center" aria-labelledby="command-center-title">
    <header className="command-center__header"><h2 id="command-center-title">/// System command center</h2><span>System map / 08</span></header>
    <div className="command-center__top"><SystemCore project={selectedProject} highlightedDomains={highlightedDomains} /><ActiveBuild project={selectedProject} /></div>
    <div className="command-center__lower">
      <section className="projects-panel panel" id="work" aria-labelledby="projects-title"><div className="panel__header"><span id="projects-title">Projects</span><span>Shipped ecosystem</span></div><div className="project-grid">{projects.slice(1).map((project) => <ProjectCard key={project.id} project={project} selected={project.id === selectedId} onSelect={setSelectedId} />)}</div></section>
      <section className="info-panel panel" aria-labelledby="status-title"><div className="panel__header"><span id="status-title">System status</span></div>{systemStatus.map(([label, value]) => <div className="info-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>
      <section className="info-panel activity-panel panel" aria-labelledby="activity-title"><div className="panel__header"><span id="activity-title">Activity feed</span></div>{activity.map(([label, time]) => <div className="activity-row" key={label}><i /><span>{label}</span><small>{time}</small></div>)}</section>
    </div>
    <div className="proof-bar">{proofMetrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
    <div className="technology-strip" aria-label="Technologies"> <span>Technologies</span>{technologies.map((technology) => <b key={technology}>{technology}</b>)}</div>
  </section>;
}
