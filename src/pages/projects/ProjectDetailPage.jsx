import { useParams } from 'react-router-dom';
import { projects } from '../../data/projects.js';
import SEO from '../../shared/seo/SEO.jsx';

const PROJECT_SLUG_ALIASES = Object.freeze({
  'speak-and-translate': 'speak',
});

const projectSchemaFor = (slug) => {
  const project = projects.find(({ id }) => id === (PROJECT_SLUG_ALIASES[slug] ?? slug));
  const name = project?.name ?? slug.replaceAll('-', ' ');

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    applicationCategory: project?.category ?? 'MobileApplication',
    operatingSystem: project?.platforms?.join(', ') ?? 'Android, iOS',
    author: {
      '@type': 'Person',
      name: 'Hafiz Ali Abdullah',
      url: 'https://solithx.com',
    },
  };
};

export default function ProjectDetailPage() {
  const { slug } = useParams();

  // The user will provide the case study content later
  return (
    <>
      <SEO
        title={`${slug} — Flutter App by Hafiz Ali Abdullah`}
        description={`Case study for ${slug} built by Hafiz Ali Abdullah.`}
        schema={projectSchemaFor(slug)}
      />
      <div style={{ paddingTop: '120px', minHeight: '80vh', padding: '120px 2rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>{slug}</h1>
        <p>Project case study content will be placed here.</p>
      </div>
    </>
  );
}
