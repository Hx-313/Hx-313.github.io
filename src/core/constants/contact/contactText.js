import { contactLinks, scheduleLink, siteLinks } from '../links.js';

export const CONTACT_TEXT = Object.freeze({
  aria: Object.freeze({
    section: 'Contact and Technical Inquiries',
    channels: 'Direct Communication Channels & Fast-Track Booking',
  }),
  kicker: Object.freeze({
    index: '07',
    label: 'Start here',
  }),
  title: Object.freeze({
    prefix: 'Have a system to build? ',
    accent: 'Start here.',
  }),
  lead: 'Tell me what you’re building, who it is for, and where the workflow gets difficult. I’ll help turn the brief into a buildable plan.',
  form: Object.freeze({
    title: 'Tell me about the project',
    subtitle: 'About 60 seconds · No pitch deck required',
    categoryLabel: 'What are you building?',
    optionalBadge: 'optional',
    nameLabel: 'Your name',
    namePlaceholder: 'e.g. Elena Rostova',
    emailLabel: 'Best email',
    emailPlaceholder: 'elena@company.com',
    messageLabel: 'What can I help with?',
    messagePlaceholder: 'A link, rough brief, or one sentence is enough.',
    submitIdle: 'Send project note',
    submitLoading: 'Preparing your email…',
    footerNote: 'I’ll reply to this address within 2 hours.',
    validation: Object.freeze({
      nameRequired: 'Please provide your name (at least 2 characters).',
      emailRequired: 'Please provide your email address.',
      emailInvalid: 'Please enter a valid email address.',
      messageRequired: 'Please provide a brief description of your project (at least 10 characters).',
    }),
    success: Object.freeze({
      heading: 'Your note is ready',
      thanksPrefix: 'Thanks, ',
      detailsMiddle: '. Your email app is ready with the details for your ',
      detailsSuffix: ' project.',
      openEmailBtn: 'Open in Email App →',
      startAnotherBtn: 'Start another note',
      emailAria: 'Open prefilled inquiry in your default email client',
    }),
  }),
  channelsIntro: Object.freeze({
    eyebrow: 'Prefer a direct route?',
    description: 'Skip the form and choose one of these.',
    fastTrackBadge: 'FAST TRACK',
  }),
  telemetryLabels: Object.freeze({
    operationalStatus: 'OPERATIONAL STATUS',
    timezone: 'LOCAL BASE / TIMEZONE',
    latency: 'RESPONSE LATENCY',
  }),
  projectCategories: Object.freeze([
    'Mobile application',
    'Event or university app',
    'Government / civic system',
    'Business operations system',
    'Restaurant ordering / POS',
    'Node.js backend / API',
    'Full-time role',
  ]),
  telemetry: Object.freeze({
    timezone: 'PKT / UTC+5 (Rawalpindi)',
    responseTime: '< 2 hours',
    status: '🟢 Available for project conversations & selected roles',
  }),
  channels: Object.freeze({
    meeting: Object.freeze({
      title: 'Schedule Discovery Call',
      duration: '30 mins',
      link: scheduleLink,
      description:
        '30-minute direct technical discovery session. Ideal for project scoping, architecture review, and contract alignment.',
      buttonLabel: 'Schedule 30-Min Call →',
    }),
    whatsapp: Object.freeze({
      title: 'Instant WhatsApp Chat',
      link: contactLinks.whatsapp,
      label: '0347 5662750',
      actionLabel: 'Chat on WhatsApp →',
    }),
    phone: Object.freeze({
      title: 'Phone call',
      link: contactLinks.phone,
      label: '0347 5662750',
      actionLabel: 'Call now →',
    }),
    email: Object.freeze({
      title: 'Direct Engineering Email',
      address: 'aliabdullahva313@gmail.com',
      mailto: contactLinks.email,
      label: 'aliabdullahva313@gmail.com',
      actionLabel: 'Copy / Send Email →',
      copiedBadge: 'Copied to clipboard',
    }),
    socials: Object.freeze([
      Object.freeze({
        id: 'instagram',
        name: 'Instagram',
        handle: '@ithx313',
        url: siteLinks.instagram,
      }),
      Object.freeze({
        id: 'linkedin',
        name: 'LinkedIn',
        handle: 'Hafiz Ali Abdullah',
        url: siteLinks.linkedin,
      }),
    ]),
  }),
});
