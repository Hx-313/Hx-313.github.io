export default function ProjectCard({ project, selected, onSelect }) {
  return <button type="button" className={`project-card ${selected ? 'is-selected' : ''}`} aria-pressed={selected} onClick={() => onSelect(project.id)}>
    <img src={project.image} alt="" /><span className="project-card__copy"><strong>{project.name}</strong><small>{project.type}</small></span><span className="status"><i /> {project.status}</span>
  </button>;
}
