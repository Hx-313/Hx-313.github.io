export const aboutHooks = Object.freeze([
  Object.freeze({
    id: 'hook-1',
    number: '01',
    lead: "GREAT MOBILE PRODUCTS DON'T END AT THE INTERFACE.",
    punchline: 'THEY RUN ON SYSTEMS BUILT TO HOLD UP.',
    theme: 'systems',
  }),
  Object.freeze({
    id: 'hook-2',
    number: '02',
    lead: "PERFORMANCE ISN'T A FEATURE.",
    punchline: "IT'S THE FOUNDATION.",
    theme: 'performance',
  }),
  Object.freeze({
    id: 'hook-3',
    number: '03',
    lead: 'EVERY SCREEN IS A STATE. EVERY TAP IS AN EVENT.',
    punchline: 'THE PRODUCT IS THE LOGIC BETWEEN THEM.',
    theme: 'logic',
  }),
]);

export const aboutHeadline = Object.freeze([
  'Mobile first,',
  'systems included,',
  'built to last.',
]);

export const aboutParagraphs = Object.freeze([
  'I build mobile applications with Flutter and native technologies, then connect them to the Node.js services, APIs, and operational tools they need to work in production.',
  'My work spans customer-facing apps, internal workflows, dashboards, and connected systems — always shaped around the way people actually use them.',
  'One example is OnlineOrder.pk / WOS, a restaurant ordering and POS system I built for Webticians. My contribution covered mobile development, backend services, system connections, and UI/UX direction.',
]);

export const aboutStats = Object.freeze([
  Object.freeze({
    id: 'apps',
    targetNumber: 15,
    suffix: '+',
    label: 'apps shipped',
    highlight: false,
  }),
  Object.freeze({
    id: 'downloads',
    targetNumber: 100,
    suffix: 'k+',
    label: 'downloads',
    highlight: false,
  }),
  Object.freeze({
    id: 'systems',
    targetNumber: 1,
    suffix: '',
    label: 'connected system built',
    highlight: true,
  }),
]);

export const aboutIntro = Object.freeze({
  eyebrow: 'About me',
  title: 'Hafiz Ali Abdullah',
  subtitle: 'Flutter + Native Mobile Developer · Node.js Backend Engineer',
  headline: aboutHeadline,
  paragraphs: aboutParagraphs,
  heading: 'Mobile first, systems included, built for real use.',
  paragraph1: aboutParagraphs[0],
  paragraph2: aboutParagraphs[1],
  paragraph3: aboutParagraphs[2],
});

export const aboutMetrics = Object.freeze([
  Object.freeze({
    id: 'apps',
    value: '15+',
    label: 'apps shipped',
    description: 'Production mobile & web systems',
  }),
  Object.freeze({
    id: 'downloads',
    value: '100k+',
    label: 'downloads',
    description: 'Global user engagement',
  }),
  Object.freeze({
    id: 'systems',
    value: '1',
    label: 'connected system',
    description: 'Built for Webticians',
    highlight: true,
  }),
]);

export const toolCategories = Object.freeze([
  Object.freeze({
    id: 'mobile',
    label: 'Mobile layer',
    description: 'Flutter and native mobile interfaces shaped around real user flows.',
    tools: Object.freeze([
      'Flutter',
      'Dart',
      'Native Android',
      'Native iOS',
      'Figma',
      'UI/UX direction',
    ]),
  }),
  Object.freeze({
    id: 'ai',
    label: 'App architecture',
    description: 'State, navigation, integrations, offline behavior, and the logic between screens.',
    tools: Object.freeze([
      'Riverpod',
      'REST APIs',
      'Realtime data',
      'Offline-first',
      'Testing',
    ]),
  }),
  Object.freeze({
    id: 'backend',
    label: 'Backend & data',
    description: 'Node.js services, APIs, data models, and operational connections that hold state reliably.',
    tools: Object.freeze([
      'Node.js',
      'Express',
      'PostgreSQL',
      'MongoDB',
      'Docker',
      'Supabase',
      'Firebase',
      'Git',
    ]),
  }),
]);

export const aboutData = Object.freeze({
  hooks: aboutHooks,
  headline: aboutHeadline,
  paragraphs: aboutParagraphs,
  stats: aboutStats,
  intro: aboutIntro,
  metrics: aboutMetrics,
  categories: toolCategories,
});
