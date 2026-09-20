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
    prefix: 'Have a project in mind? ',
    accent: 'Let’s talk it through.',
  }),
  lead: 'A rough idea is enough. Tell me what you know, and I’ll help you work out a clear next step.',
  form: Object.freeze({
    title: 'Start with the essentials',
    subtitle: 'Your email is all I need to reply.',
    categoryLabel: 'What are you hoping to make?',
    categoryHelp: 'Pick one if you know. You can skip this for now.',
    optionalBadge: 'optional',
    requiredBadge: 'required',
    nameLabel: 'Your name',
    namePlaceholder: 'e.g. Alex',
    emailLabel: 'Your email address',
    emailPlaceholder: 'you@example.com',
    messageLabel: 'Anything else I should know?',
    messagePlaceholder: 'A rough idea, a question, or a link…',
    messageHelp: 'A sentence is enough. You can leave this blank.',
    submitIdle: 'Open email draft',
    footerNote: 'Your email app opens a draft for you to review. Nothing is sent until you press Send.',
    draftReady: 'Your draft should open in your email app. Review it and press Send when you’re ready.',
    draftFallback: 'If it doesn’t open,',
    emailMeDirectly: 'email me directly.',
    validation: Object.freeze({
      emailRequired: 'Add an email address so I can reply.',
      emailInvalid: 'That email looks incomplete. Check it and try again.',
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
    'Mobile app',
    'Website or store',
    'Business tool',
    'Connect existing tools',
    'Automate a task',
    'Not sure yet',
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
