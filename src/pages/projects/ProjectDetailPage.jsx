import { useParams } from 'react-router-dom';
import { projects } from '../../data/projects.js';
import NotFound from '../not-found/NotFound.jsx';
import SEO from '../../shared/seo/SEO.jsx';
import { breadcrumbSchema, softwareAppSchema, wosEntitySchemas } from '../../core/constants/seo/schemas.js';
import { SEO_TEXT } from '../../core/constants/seo/seoText.js';
import WosCaseStudy from './wos.jsx';

const PROJECT_SLUG_ALIASES = Object.freeze({
  'speak-and-translate': 'speak',
});

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const project = projects.find(({ id }) => id === (PROJECT_SLUG_ALIASES[slug] ?? slug));

  if (!project) return <NotFound />;

  const detailSchemas = slug === 'wos'
    ? [...wosEntitySchemas]
    : [
        breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Projects', url: '/projects' },
          { name: project.name, url: `/projects/${slug}` },
        ]),
        softwareAppSchema({ ...project, id: slug }),
      ];

  const isWos = slug === 'wos';

  return (
    <>
      <SEO
        title={isWos ? SEO_TEXT.wosTitle : `${project.name} — Project by Hafiz Ali Abdullah`}
        description={isWos ? SEO_TEXT.wosDescription : project.description}
        schemas={detailSchemas}
        ogType="article"
      />
      {isWos ? (
        <WosCaseStudy />
      ) : (
        <div style={{ minHeight: '80vh', padding: '120px 2rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
          <img
            src={project.image}
            alt={project.imageAlt}
            width={project.imageWidth}
            height={project.imageHeight}
            fetchpriority="high"
          />
        </div>
      )}
    </>
  );
}
