import { contactLinks, siteLinks, scheduleLink } from '../../../core/constants.js';

export const PROJECT_CATEGORIES = Object.freeze([
  'Full-Stack SaaS',
  'Web Application',
  'POS & Systems Architecture',
  'Technical Advisory / Audit',
]);

export const TELEMETRY_DATA = Object.freeze({
  timezone: 'PKT / UTC+5 (Lahore)',
  responseTime: '< 2 hours',
  status: '🟢 Available for Q3/Q4 contracts & advisory',
});

export const CONTACT_CHANNELS = Object.freeze({
  meeting: Object.freeze({
    title: 'Schedule Discovery Call',
    duration: '30 mins',
    link: scheduleLink,
    description: '30-minute direct technical discovery session. Ideal for project scoping, architecture review, and contract alignment.',
    buttonLabel: 'Schedule 30-Min Call →',
  }),
  whatsapp: Object.freeze({
    title: 'Instant WhatsApp Chat',
    link: contactLinks.whatsapp,
    label: '+92 347 5662750',
    actionLabel: 'Chat on WhatsApp →',
  }),
  email: Object.freeze({
    title: 'Direct Engineering Email',
    address: 'aliabdullahva313@gmail.com',
    mailto: contactLinks.email,
    label: 'aliabdullahva313@gmail.com',
    actionLabel: 'Copy / Send Email →',
  }),
  socials: Object.freeze([
    Object.freeze({
      id: 'github',
      name: 'GitHub',
      handle: '@Hx-313',
      url: siteLinks.github,
    }),
    Object.freeze({
      id: 'linkedin',
      name: 'LinkedIn',
      handle: 'Hafiz Ali Abdullah',
      url: siteLinks.linkedin,
    }),
  ]),
});
