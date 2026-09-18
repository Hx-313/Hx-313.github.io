import ProjectsShowcase from './ProjectsShowcase.jsx';

export default function CommandCenter({ controller }) {
  return <ProjectsShowcase projects={controller.projects} />;
}
