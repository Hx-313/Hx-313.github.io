import React from 'react';
import AboutSection from '../../modules/about/presentation/AboutSection.jsx';
import SEO from '../../shared/seo/SEO.jsx';
import { breadcrumbSchema, personSchema } from '../../core/constants/seo/schemas.js';

const aboutSchemas = [
  breadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
  ]),
  personSchema,
];

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Hafiz Ali Abdullah — Flutter Developer"
        description="Hafiz Ali Abdullah is a Flutter and Node.js developer based in Pakistan. I build mobile applications, REST APIs, and backend systems for production use."
        schemas={aboutSchemas}
      />
      <div style={{ paddingTop: '80px' }}>
        <AboutSection headingTag="h1" />
      </div>
    </>
  );
}
