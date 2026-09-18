import { contactLinks, scheduleLink, siteLinks, wosLinks } from '../links.js';

export const FOOTER_TEXT = Object.freeze({
  aria: Object.freeze({
    footer: 'Site Footer and Navigation Directory',
    monogram: 'Hx-313 Insignia',
    sitemap: 'Footer Sitemap',
    backToTop: 'Back to top of page',
  }),
  headings: Object.freeze({
    explore: 'Explore',
    systems: 'Systems',
    contact: 'Contact',
  }),
  contactNote: 'Available for select product builds, system reviews, and technical advisory.',
  location: Object.freeze({
    basedIn: 'Based in',
    cityCountry: 'Lahore, Pakistan',
    workingScope: 'Working worldwide',
  }),
  backToTop: 'Back to top',
  navigation: Object.freeze([
    Object.freeze({ label: 'Overview', href: '#top' }),
    Object.freeze({ label: 'Projects', href: '#projects' }),
    Object.freeze({ label: 'About', href: '#about' }),
    Object.freeze({ label: 'Services', href: '#services' }),
    Object.freeze({ label: 'Services in domains', href: '#domains' }),
    Object.freeze({ label: 'Certifications', href: '#certifications' }),
    Object.freeze({ label: 'Tools', href: '#tools' }),
    Object.freeze({ label: 'Contact', href: '#contact' }),
    Object.freeze({ label: 'Testimonials', href: '#testimonials' }),
  ]),
  systems: Object.freeze([
    Object.freeze({
      name: 'WOS Multi-Store Admin',
      role: 'Centralized Multi-Tenant Retail Ops',
      url: wosLinks.adminPanel,
    }),
    Object.freeze({
      name: 'EPOS Terminal Platform',
      role: 'Real-Time Point-of-Sale Engine',
      url: wosLinks.epos,
    }),
    Object.freeze({
      name: 'West Coast Coffee Live',
      role: 'Production E-Commerce Customer Web',
      url: wosLinks.customerWebsite,
    }),
    Object.freeze({
      name: 'GitHub Core Repositories',
      role: 'Open-Source & Distributed Systems',
      url: siteLinks.github,
    }),
  ]),
  connect: Object.freeze([
    Object.freeze({
      label: 'Book a call',
      url: scheduleLink,
      action: '30 minutes · Cal.com →',
    }),
    Object.freeze({
      label: 'WhatsApp',
      url: contactLinks.whatsapp,
      action: '0347 5662750 →',
    }),
    Object.freeze({
      label: 'Call me',
      url: contactLinks.phone,
      action: '0347 5662750 →',
    }),
    Object.freeze({
      label: 'Email',
      url: contactLinks.email,
      action: 'aliabdullahva313@gmail.com →',
    }),
    Object.freeze({
      label: 'LinkedIn',
      url: siteLinks.linkedin,
      action: 'Connect with me →',
    }),
    Object.freeze({
      label: 'Instagram',
      url: siteLinks.instagram,
      action: '@ithx313 →',
    }),
  ]),
  colophon: Object.freeze({
    author: 'Hafiz Ali Abdullah',
    handle: 'Hx-313',
    title: 'Flutter + Native Mobile Developer · Node.js Backend Engineer',
    positioning:
      'Building mobile applications, APIs, dashboards, and operational systems for teams that need the whole workflow to work.',
    status: 'Available for project conversations & selected roles',
    timezone: 'PKT / UTC+5 (Lahore)',
    craft: 'Engineered with React, Vite, Motion & Three.js',
    copyright: '© 2026 Hafiz Ali Abdullah. All rights reserved.',
  }),
});
