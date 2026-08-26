import { useMemo, useState } from 'react';
import { projects } from '../data/projects.js';

export function useCommandCenter() {
  const [selectedId, setSelectedId] = useState('wos');
  const selectedProject = useMemo(() => projects.find((project) => project.id === selectedId) ?? projects[0], [selectedId]);
  const highlightedDomains = useMemo(() => new Set(selectedProject.domains), [selectedProject]);
  return { projects, selectedProject, selectedId, setSelectedId, highlightedDomains };
}
