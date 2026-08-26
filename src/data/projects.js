import { assetPath } from '../shared/assetPath.js';

export const projects = [
  {
    id: 'wos', name: 'WOS', category: 'Restaurant technology', type: 'OnlineOrder.pk · Restaurant technology', status: 'production', featured: true,
    description: 'Restaurant commerce and operations platform connecting ordering, administration, terminals, ePOS, and kitchen workflows.',
    image: assetPath('/assets/wos/epos-desktop.png'), metrics: { outlets: '24', products: '1,842', users: '3.2K+' },
    domains: ['saas', 'backend', 'cloud'], cta: 'View case study',
    surfaces: [
      { label: 'Admin panel', image: assetPath('/assets/wos/epos-dark-mode-menu.jpeg') },
      { label: 'Order terminal', image: assetPath('/assets/wos/terminal-1.jpeg') },
      { label: 'ePOS', image: assetPath('/assets/wos/epos-desktop.png') },
      { label: 'Customer web', image: assetPath('/assets/wos/customer-web.png') },
    ],
  },
  { id: 'dietify', name: 'Dietify', category: 'Health', type: 'Health · Mobile App', status: 'shipped', image: assetPath('/assets/logos/dietify.png'), domains: ['mobile'], cta: 'Explore project' },
  { id: 'petcare', name: 'Pet Care', category: 'Care', type: 'Care · Mobile App', status: 'shipped', image: assetPath('/assets/logos/pet-care.webp'), domains: ['mobile'], cta: 'Explore project' },
  { id: 'noor', name: 'Noor-ul-Quran', category: 'Learning', type: 'Learning · Mobile App', status: 'shipped', image: assetPath('/assets/logos/noor-ul-quran.png'), domains: ['mobile'], cta: 'Explore project' },
  { id: 'readmate', name: 'ReadMate', category: 'Reading', type: 'Reading · Mobile App', status: 'shipped', image: assetPath('/assets/logos/readmate.jpeg'), domains: ['mobile'], cta: 'Explore project' },
  { id: 'qr', name: 'QR Scanner', category: 'Utility', type: 'Utility · Mobile App', status: 'shipped', image: assetPath('/assets/logos/qr-scanner.png'), domains: ['mobile'], cta: 'Explore project' },
  { id: 'speak', name: 'Speak & Translate', category: 'Language', type: 'Language · AI Voice', status: 'shipped', image: assetPath('/assets/logos/speak-and-translate.png'), domains: ['mobile', 'cloud'], cta: 'Explore project' },
];

export const systemDomains = [
  { id: 'mobile', label: 'Mobile Applications', short: 'MOBILE' },
  { id: 'saas', label: 'SaaS Platforms', short: 'SAAS' },
  { id: 'backend', label: 'Backend Systems', short: 'BACKEND' },
  { id: 'cloud', label: 'API & Cloud Integrations', short: 'API / CLOUD' },
];
