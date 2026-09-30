import React from 'react';
import ContactSection from '../../modules/contact/presentation/ContactSection.jsx';
import SEO from '../../shared/seo/SEO.jsx';

export default function ContactPage() {
  return (
    <>
      <SEO
        title="Contact Hafiz Ali Abdullah — Hire a Flutter & Node.js Developer"
        description="Get in touch with Hafiz Ali Abdullah for Flutter development, Node.js backends, or full-stack mobile projects. Available for freelance and contract work."
      />
      <div style={{ paddingTop: '80px' }}>
        <ContactSection />
      </div>
    </>
  );
}
