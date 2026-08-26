const artifactLayout = {
  wos: 'artifact--wos',
  dietify: 'artifact--dietify',
  ebill: 'artifact--ebill',
  noor: 'artifact--noor',
  qr: 'artifact--qr',
  readmate: 'artifact--readmate',
  speak: 'artifact--speak',
  petcare: 'artifact--petcare',
};

export function buildConstellationArtifacts(projects) {
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    category: project.category,
    status: project.status,
    className: artifactLayout[project.id] ?? 'artifact--default',
    featured: Boolean(project.featured),
  }));
}
