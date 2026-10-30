import React from 'react';
import ContactSection from '../../modules/contact/presentation/ContactSection.jsx';
import SEO from '../../shared/seo/SEO.jsx';
import { breadcrumbSchema } from '../../core/constants/seo/schemas.js';

const contactSchemas = [
  breadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact' },
  ]),
];

export default function ContactPage() {
  return (
    <>
      <SEO
        title="Contact Hafiz Ali Abdullah — Flutter & Node.js Developer"
        description="Get in touch with Hafiz Ali Abdullah for Flutter development, Node.js backends, or full-stack mobile projects. Available for freelance and contract work."
        schemas={contactSchemas}
      />
      <div style={{ paddingTop: '80px' }}>
        <ContactSection titleTag="h1" />
      </div>
    </>
  );
}
