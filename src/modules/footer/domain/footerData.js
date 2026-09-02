import { contactLinks, siteLinks, wosLinks, scheduleLink } from '../../../core/constants.js';

export const FOOTER_NAVIGATION = Object.freeze([
  Object.freeze({ label: '00 // Top & Hero', href: '#top' }),
  Object.freeze({ label: '01 // The Problem', href: '#story' }),
  Object.freeze({ label: '02 // Architecture', href: '#how-i-build' }),
  Object.freeze({ label: '03 // Systems Console', href: '#command-center' }),
  Object.freeze({ label: '04 // Contact & Schedule', href: '#contact' }),
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
    label: 'Schedule 30-Min Call',
    url: scheduleLink,
    action: 'Book on Cal.com →',
  }),
  Object.freeze({
    label: 'Direct WhatsApp',
    url: contactLinks.whatsapp,
    action: '+92 347 5662750 →',
  }),
  Object.freeze({
    label: 'Engineering Email',
    url: contactLinks.email,
    action: 'aliabdullahva313@gmail.com →',
  }),
  Object.freeze({
    label: 'LinkedIn Professional',
    url: siteLinks.linkedin,
    action: 'Connect on LinkedIn →',
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
