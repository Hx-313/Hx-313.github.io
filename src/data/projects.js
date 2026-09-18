import { assetPath } from '../shared/assetPath.js';
import { wosLinks } from '../core/constants.js';

export const projects = [
  {
    id: 'dietify', name: 'Dietify', category: 'Health & wellness', type: 'Health · Mobile App', status: 'shipped',
    description: 'A calm nutrition companion for meals, hydration, movement, and the small daily choices that add up.',
    image: assetPath('/assets/dietify/hero.png'), imageAlt: 'Dietify nutrition and daily health tracking app shown on a phone and tablet',
    platforms: ['Flutter', 'Android', 'iOS'], domains: ['mobile'], cta: 'Explore Dietify',
  },
  {
    id: 'speak', name: 'Speak & Translate', category: 'Language & AI', type: 'Language · AI Voice', status: 'shipped',
    description: 'A smart language companion for real-time conversation, voice, camera translation, and offline communication.',
    image: assetPath('/assets/speak-and-translate/hero.png'), imageAlt: 'Speak and Translate language app shown on blue and white mobile devices',
    platforms: ['Flutter', 'AI engine', 'Offline mode'], domains: ['mobile', 'cloud'], cta: 'Explore Speak & Translate',
  },
  {
    id: 'expenseflow', name: 'ExpenseFlow', category: 'Personal finance', type: 'Finance · Mobile App', status: 'shipped',
    description: 'A focused financial companion that makes income, spending, transfers, and everyday money decisions easier to see.',
    image: assetPath('/assets/expenseflow/hero.png'), imageAlt: 'ExpenseFlow financial dashboard shown across two dark mobile devices',
    platforms: ['Flutter', 'Android', 'iOS'], domains: ['mobile', 'backend'], cta: 'Explore ExpenseFlow',
  },
  {
    id: 'wos', name: 'WOS', category: 'Restaurant operations', type: 'Full-stack system · POS', status: 'production', featured: true,
    description: 'A full-stack restaurant operating system connecting customer ordering, administration, terminals, ePOS, and service workflows.',
    image: assetPath('/assets/wos/hero.png'), imageAlt: 'WOS restaurant operating system shown across an admin laptop, tablets, phone, and payment terminal',
    platforms: ['Admin dashboard', 'POS', 'Customer web', 'Payment terminal'],
    metrics: { surfaces: '04', layers: '03', builtFor: 'Webticians' }, domains: ['saas', 'backend', 'cloud'], cta: 'Explore the build',
    surfaces: [
      { label: 'Admin panel', image: assetPath('/assets/wos/epos-dark-mode-menu.jpeg'), href: wosLinks.adminPanel },
      { label: 'Order terminal', image: assetPath('/assets/wos/terminal-1.jpeg') },
      { label: 'ePOS', image: assetPath('/assets/wos/epos-desktop.png'), href: wosLinks.epos },
      { label: 'Customer web', image: assetPath('/assets/wos/customer-web.png'), href: wosLinks.customerWebsite },
    ],
  },
];

export const systemDomains = [
  { id: 'mobile', label: 'Mobile Applications', short: 'MOBILE' },
  { id: 'saas', label: 'SaaS Platforms', short: 'SAAS' },
  { id: 'backend', label: 'Backend Systems', short: 'BACKEND' },
  { id: 'cloud', label: 'API & Cloud Integrations', short: 'API / CLOUD' },
];
