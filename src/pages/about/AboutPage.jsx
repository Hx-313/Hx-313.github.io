import React from 'react';
import AboutSection from '../../modules/about/presentation/AboutSection.jsx';
import SEO from '../../shared/seo/SEO.jsx';

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Hafiz Ali Abdullah — Flutter Developer & Node.js Engineer"
        description="Hafiz Ali Abdullah is a Flutter and Node.js developer based in Pakistan. Founder of ITHX. I build mobile applications, REST APIs, and backend systems for production use."
      />
      <div style={{ paddingTop: '80px' }}>
        <AboutSection />
      </div>
    </>
  );
}
