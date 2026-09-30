export const ABOUT_TEXT = Object.freeze({
  label: 'About me',

  // Category term lives HERE, in the H2
  roleHeading: 'Hafiz Ali Abdullah — Mobile Application Developer | Flutter, Android & iOS | Node.js Backend',

  headline: Object.freeze({
    line1: 'Mobile first,',
    line2: 'systems included,',
    line3Soft: 'built to last.',
    combined: 'Mobile first, systems included, built to last.',
  }),

  paragraphs: Object.freeze([
    "I'm a mobile application developer specializing in Flutter, with native Android and iOS experience. I build mobile applications and connect them to the Node.js services, APIs, and operational tools they need to work in production.",
    'My work spans customer-facing apps, internal workflows, dashboards, and connected systems — always shaped around the way people actually use them.',
    'is a restaurant ordering and POS system I built for Webticians.',
    'Based in Rawalpindi, Pakistan. Available for freelance projects and full-time roles, working remotely with teams worldwide.',
  ]),

  featuredProduct: 'OnlineOrder.pk / WOS',
  signalClosing: 'The work connected mobile, backend, and operations.',
  featuredBadge: 'FEATURED',

  credit: Object.freeze({
    name: 'Hafiz Ali Abdullah',
    title: 'Flutter + Native Mobile · Node.js Backend',
  }),

  aria: Object.freeze({
    keyMetrics: 'Key engineering metrics',
  }),

  stats: Object.freeze([
    Object.freeze({
      id: 'apps',
      targetNumber: 15,
      suffix: '+',
      label: 'APPS SHIPPED',
      highlight: false,
      tag: '01 · SHIPPED',
      description: '15+ production mobile & web systems delivered',
    }),
    Object.freeze({
      id: 'downloads',
      targetNumber: 100,
      suffix: 'k+',
      label: 'DOWNLOADS',
      highlight: false,
      tag: '02 · REACH',
      description: '100k+ global user downloads',
    }),
    Object.freeze({
      id: 'systems',
      targetNumber: 1,
      suffix: '',
      label: 'CONNECTED SYSTEM BUILT',
      highlight: true,
      tag: '03 · FLAGSHIP',
      description: 'Full-stack POS & ordering system',
    }),
  ]),
});
