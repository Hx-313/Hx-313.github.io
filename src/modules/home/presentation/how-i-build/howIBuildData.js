function deepFreeze(obj) {
  Object.keys(obj).forEach((prop) => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
}

export const howIBuildContent = deepFreeze({
  chapter: '02',
  kicker: 'HOW I BUILD',
  tagline: 'SYSTEM DELIVERY MODEL',
  lead: 'FROM PRODUCT VISION TO PRODUCTION SYSTEM.',
  statementPart1: "A SYSTEM ISN'T ONE PIECE OF SOFTWARE.",
  statementPart2: "IT'S HOW THE PIECES WORK TOGETHER.",
  description:
    'I structure products around clear boundaries between experience, domain logic, data, integrations and operations — so each part can evolve without turning the entire system into a dependency chain.',
  prioritiesLabel: 'ENGINEERING PRIORITIES',
  priorities: ['RELIABILITY', 'RESILIENCE', 'MAINTAINABILITY', 'SCALE'],
  bridgeLead: 'THE MODEL IS ONLY USEFUL IF IT SURVIVES REAL PRODUCTS.',
  bridgeCta: {
    label: '03 // EXPLORE SHIPPED SYSTEMS',
    href: '#systems',
  },
});

export const systemLayers = deepFreeze([
  {
    id: 'experience',
    number: '01',
    title: 'EXPERIENCE',
    subtitle: 'Client & Peripherals',
    nodes: [
      { id: 'exp-mobile', label: 'MOBILE', detail: 'iOS / Android Native & Flutter', icon: 'mobile' },
      { id: 'exp-web', label: 'WEB', detail: 'Platforms & Web Portals', icon: 'web' },
      { id: 'exp-terminals', label: 'TERMINALS', detail: 'ePOS & Order Terminals', icon: 'terminal' },
      { id: 'exp-admin', label: 'ADMIN', detail: 'Operations & Management Dashboards', icon: 'admin' },
    ],
    busId: 'events',
    busLabel: 'SYSTEM EVENTS / DATA FLOW',
  },
  {
    id: 'domain-data',
    number: '02',
    title: 'DOMAIN & DATA',
    subtitle: 'Execution & Persistence',
    nodes: [
      { id: 'core-apis', label: 'APIS', detail: 'REST & WebSocket Gateways', icon: 'api' },
      { id: 'core-rules', label: 'BUSINESS RULES', detail: 'Domain Logic & Workflows', icon: 'rules' },
      { id: 'core-data', label: 'DATA', detail: 'Local Persistence & Cloud DB', icon: 'data' },
      { id: 'core-identity', label: 'IDENTITY', detail: 'Auth, RBAC & Permissions', icon: 'auth' },
    ],
    busId: 'integrations',
    busLabel: 'SERVICES / OPERATIONS INTEGRATIONS',
  },
  {
    id: 'operations',
    number: '03',
    title: 'OPERATIONS & INTELLIGENCE',
    subtitle: 'Automation & Health',
    nodes: [
      { id: 'ops-ai', label: 'AI / LLM', detail: 'Intelligent Workflows & Processing', icon: 'ai' },
      { id: 'ops-jobs', label: 'BACKGROUND', detail: 'Scheduled Jobs & Workers', icon: 'jobs' },
      { id: 'ops-delivery', label: 'DELIVERY', detail: 'CI/CD & Versioned Releases', icon: 'delivery' },
      { id: 'ops-observability', label: 'OBSERVABILITY', detail: 'Telemetry, Logging & Health', icon: 'metrics' },
    ],
  },
]);

export const systemBuses = deepFreeze([
  {
    id: 'events',
    label: 'SYSTEM EVENTS / DATA FLOW',
    fromLayer: 'experience',
    toLayer: 'domain-data',
  },
  {
    id: 'integrations',
    label: 'SERVICES / OPERATIONS INTEGRATIONS',
    fromLayer: 'domain-data',
    toLayer: 'operations',
  },
]);

export const systemConnections = deepFreeze([
  { id: 'mobile-to-api', from: 'exp-mobile', to: 'core-apis', bus: 'events' },
  { id: 'web-to-api', from: 'exp-web', to: 'core-apis', bus: 'events' },
  { id: 'terminal-to-rules', from: 'exp-terminals', to: 'core-rules', bus: 'events' },
  { id: 'admin-to-identity', from: 'exp-admin', to: 'core-identity', bus: 'events' },
  { id: 'rules-to-data', from: 'core-rules', to: 'core-data', bus: 'events' },
  { id: 'api-to-jobs', from: 'core-apis', to: 'ops-jobs', bus: 'integrations' },
  { id: 'data-to-ai', from: 'core-data', to: 'ops-ai', bus: 'integrations' },
  { id: 'identity-to-delivery', from: 'core-identity', to: 'ops-delivery', bus: 'integrations' },
  { id: 'rules-to-observability', from: 'core-rules', to: 'ops-observability', bus: 'integrations' },
]);

export const disciplines = deepFreeze([
  {
    id: 'build',
    number: '01',
    label: 'BUILD',
    headline: 'Responsive product interfaces, native capabilities and performant client experiences.',
    stack: 'Flutter • Native Android • React • TypeScript',
    summary:
      'Built for responsive interaction, native platform capabilities, offline-aware experiences, and consistent behavior across screen sizes and platforms.',
    activeNodeIds: ['exp-mobile', 'exp-web', 'exp-terminals', 'exp-admin'],
    relatedNodeIds: ['core-apis', 'core-rules'],
    activeConnectionIds: ['mobile-to-api', 'web-to-api', 'terminal-to-rules', 'admin-to-identity'],
  },
  {
    id: 'architect',
    number: '02',
    label: 'ARCHITECT',
    headline: 'Boundaries, state ownership, persistence, recovery and role-aware workflows.',
    stack: 'Clean Architecture • Modular State • Offline-First • RBAC',
    summary:
      'Clear separation between presentation, domain behavior, persistence, and infrastructure, with offline-first strategies and explicit role boundaries where the product requires them.',
    activeNodeIds: ['core-rules', 'core-data', 'core-identity', 'exp-terminals'],
    relatedNodeIds: ['core-apis', 'exp-mobile', 'exp-admin'],
    activeConnectionIds: ['terminal-to-rules', 'rules-to-data', 'admin-to-identity'],
  },
  {
    id: 'connect',
    number: '03',
    label: 'CONNECT',
    headline: 'APIs, realtime synchronization, authentication, printers, scanners and platform services.',
    stack: 'REST • WebSockets • Firebase • Node.js • Device Integrations',
    summary:
      'Reliable exchange between applications, backend services, realtime channels, authentication systems, and device integrations such as scanners and thermal printers.',
    activeNodeIds: ['core-apis', 'core-identity', 'exp-terminals', 'ops-jobs'],
    relatedNodeIds: ['exp-mobile', 'exp-web', 'core-data'],
    activeConnectionIds: ['mobile-to-api', 'web-to-api', 'api-to-jobs', 'admin-to-identity'],
  },
  {
    id: 'automate',
    number: '04',
    label: 'AUTOMATE',
    headline: 'Scheduled work, intelligent features, automation, diagnostics and production visibility.',
    stack: 'AI Workflows • Background Jobs • Delivery Pipelines • Observability',
    summary:
      'Background processing, AI-assisted workflows, repeatable delivery pipelines, logging, diagnostics, and production visibility where the system requires them.',
    activeNodeIds: ['ops-ai', 'ops-jobs', 'ops-delivery', 'ops-observability'],
    relatedNodeIds: ['core-data', 'core-apis', 'core-rules'],
    activeConnectionIds: ['data-to-ai', 'api-to-jobs', 'identity-to-delivery', 'rules-to-observability'],
  },
]);
