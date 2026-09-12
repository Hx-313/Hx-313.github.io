import { contactLinks, siteLinks, wosLinks, scheduleLink } from '../../../core/constants.js';

export const FOOTER_NAVIGATION = Object.freeze([
  Object.freeze({ label: 'Overview', href: '#top' }),
  Object.freeze({ label: 'Thesis', href: '#problem' }),
  Object.freeze({ label: 'About & tools', href: '#about' }),
  Object.freeze({ label: 'How I build', href: '#how-i-build' }),
  Object.freeze({ label: 'Systems', href: '#command-center' }),
  Object.freeze({ label: 'Contact', href: '#contact' }),
]);

export const FOOTER_SYSTEMS = Object.freeze([
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
]);

export const FOOTER_CONNECT = Object.freeze([
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
]);

export const FOOTER_COLOPHON = Object.freeze({
  author: 'Hafiz Ali Abdullah',
  handle: 'Hx-313',
  title: 'Full-Stack Software Engineer & Product Architect',
  positioning: 'Architecting high-velocity SaaS products, distributed point-of-sale systems, and cinematic digital experiences.',
  status: '🟢 Open for Q3/Q4 contracts & technical advisory',
  timezone: 'PKT / UTC+5 (Lahore)',
  craft: 'Engineered with React 19, Vite, Anime.js & Three.js',
  copyright: '© 2026 Hafiz Ali Abdullah. All rights reserved.',
});
