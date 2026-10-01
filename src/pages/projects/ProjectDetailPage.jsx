import React from 'react';
import { useParams } from 'react-router-dom';
import SEO from '../../shared/seo/SEO.jsx';

export default function ProjectDetailPage() {
  const { slug } = useParams();

  // The user will provide the case study content later
  return (
    <>
      <SEO
        title={`${slug} — Flutter App by Hafiz Ali Abdullah`}
        description={`Case study for ${slug} built by Hafiz Ali Abdullah.`}
      />
      <div style={{ paddingTop: '120px', minHeight: '80vh', padding: '120px 2rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>{slug}</h1>
        <p>Project case study content will be placed here.</p>
      </div>
    </>
  );
}
