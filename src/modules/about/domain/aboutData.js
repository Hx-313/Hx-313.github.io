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
  'Three years,',
  'fifteen systems,',
  'zero excuses for crashing.',
]);

export const aboutParagraphs = Object.freeze([
  "I'll admit it — I over-engineer. I overthink edge cases most people would ship around, I get curious about the failure mode nobody asked about yet, and I don't stop until the thing actually holds.",
  'That curiosity is exactly why the apps I build stay clean and solid — clean the way architecture should be, solid enough that "it crashed" isn\'t a sentence I hear back.',
  'That same obsession is what led me to build WOS EPOS, a SaaS EPOS system running in production right now — not a demo, not a case study screenshot. Real state, real transactions, real uptime.',
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
    id: 'experience',
    targetNumber: 3,
    suffix: '+',
    label: 'years experience',
    highlight: false,
  }),
  Object.freeze({
    id: 'uptime',
    targetNumber: 98.7,
    suffix: '%',
    label: 'uptime',
    highlight: true,
  }),
  Object.freeze({
    id: 'downloads',
    targetNumber: 100,
    suffix: 'k+',
    label: 'downloads',
    highlight: false,
  }),
]);

export const aboutIntro = Object.freeze({
  eyebrow: 'About me',
  title: 'Hafiz Ali Abdullah',
  subtitle: 'Mobile Application Architect & AI/ML Engineer',
  headline: aboutHeadline,
  paragraphs: aboutParagraphs,
  heading: 'Three years, fifteen systems, zero excuses for crashing.',
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
    id: 'experience',
    value: '3+',
    label: 'years experience',
    description: 'Flutter & fullstack engineering',
  }),
  Object.freeze({
    id: 'uptime',
    value: '98.7%',
    label: 'uptime',
    description: 'Live production reliability',
    highlight: true,
  }),
  Object.freeze({
    id: 'downloads',
    value: '100k+',
    label: 'downloads',
    description: 'Global user engagement',
  }),
]);

export const toolCategories = Object.freeze([
  Object.freeze({
    id: 'mobile',
    label: 'UI Layer',
    description: 'Fluid UI, reactive state machines and cross-platform native execution.',
    tools: Object.freeze([
      'Flutter',
      'Dart',
      'React Native',
      'Figma',
      'Tailwind CSS',
    ]),
  }),
  Object.freeze({
    id: 'ai',
    label: 'State & Logic',
    description: 'Deterministic state management, reactive streams and computer vision.',
    tools: Object.freeze([
      'Riverpod',
      'Redux Toolkit',
      'PyTorch',
      'OpenCV',
      'YOLOv8',
    ]),
  }),
  Object.freeze({
    id: 'backend',
    label: 'Data & Backend',
    description: 'High-throughput microservices, realtime APIs and containerized pipelines.',
    tools: Object.freeze([
      'Python',
      'FastAPI',
      'Node.js',
      'PostgreSQL',
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
