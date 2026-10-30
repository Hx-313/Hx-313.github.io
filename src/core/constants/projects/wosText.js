export const WOS_TEXT = Object.freeze({
  nav: Object.freeze({
    backLabel: 'Back to projects',
    backHref: '/projects',
  }),
  hero: Object.freeze({
    kicker: 'Case Study',
    client: 'Webticians',
    title: 'WOS',
    subtitle: 'Restaurant Operating System',
    description:
      'A full-stack ordering and operations platform connecting customer ordering, admin management, ePOS terminals, and kitchen display — deployed across 30+ restaurants in three countries.',
    stats: Object.freeze([
      { value: '30+', label: 'Restaurants' },
      { value: '4', label: 'Surfaces' },
      { value: '0%', label: 'Commission' },
      { value: '3', label: 'Countries' },
    ]),
    image: Object.freeze({
      src: '/assets/wos/hero.webp',
      alt: 'WOS restaurant operating system shown across admin laptop, tablets, phone, and payment terminal',
      width: 1672,
      height: 941,
    }),
  }),
  problem: Object.freeze({
    heading: 'The Problem',
    lead: 'Restaurants were losing 15–30% of every order to third-party platforms — and getting nothing back.',
    points: Object.freeze([
      'No direct relationship with customers — platforms owned all ordering data',
      'Commission-heavy model eroded margins on every delivery order',
      'No branded online presence; restaurants appeared only inside aggregator apps',
      'Orders managed through paper or generic POS with no kitchen coordination',
    ]),
  }),
  role: Object.freeze({
    heading: 'My Role',
    title: 'Full-Stack Developer',
    client: 'Webticians, Pakistan',
    scope: Object.freeze([
      'Designed and built the entire 4-surface system architecture',
      'Built the Node.js backend, real-time order pipeline, and multi-tenant data layer',
      'Developed the React admin dashboard and ePOS terminal interfaces',
      'Integrated customer ordering website with live restaurant menus',
      'Deployed the system to production across initial restaurant clients',
    ]),
  }),
  architecture: Object.freeze({
    heading: 'System Architecture',
    description: 'Four interconnected surfaces. One shared backend.',
    layers: Object.freeze([
      {
        id: 'customer',
        label: 'Customer Ordering',
        description:
          'Branded website and Android/iOS apps. Customers browse menus, place orders, and pay directly — no aggregator in the loop.',
      },
      {
        id: 'admin',
        label: 'Admin Dashboard',
        description:
          'Restaurant owners configure menus, view analytics, manage branches, and control staff access from a web dashboard.',
      },
      {
        id: 'epos',
        label: 'ePOS Terminal',
        description:
          'Counter-facing point-of-sale on tablet. Walk-in orders, table management, and payment processing in one screen.',
      },
      {
        id: 'kitchen',
        label: 'Kitchen Display',
        description:
          'Orders land instantly on the kitchen screen with ticket status, priority flags, and preparation timers.',
      },
    ]),
  }),
  surfaces: Object.freeze({
    heading: 'Product Surfaces',
    aria: 'WOS product surface screenshots',
    items: Object.freeze([
      {
        id: 'admin',
        label: 'Admin Panel',
        caption: 'Restaurant management dashboard — menus, orders, analytics',
        image: '/assets/wos/epos-dark-mode-menu.webp',
        href: 'https://onlineorder.pk/wos/admin',
      },
      {
        id: 'epos',
        label: 'ePOS Terminal',
        caption: 'Counter-facing point-of-sale on desktop',
        image: '/assets/wos/epos-desktop.webp',
        href: 'https://onlineorder.pk/epos',
      },
      {
        id: 'terminal',
        label: 'Order Terminal',
        caption: 'Tablet-based order receipt and kitchen dispatch',
        image: '/assets/wos/terminal-1.webp',
        href: null,
      },
      {
        id: 'customer',
        label: 'Customer Web',
        caption: 'Branded ordering site — West Coast Coffee, Islamabad',
        image: '/assets/wos/customer-web.webp',
        href: 'https://westcoastcoffee.pk/',
      },
    ]),
  }),
  engineering: Object.freeze({
    heading: 'Engineering Decisions',
    decisions: Object.freeze([
      {
        id: 'web-pos',
        title: 'Web-first POS',
        body: 'Running the ePOS in the browser eliminated hardware lock-in and the deployment friction of native terminal software. A tablet with Chrome is all a restaurant needs.',
      },
      {
        id: 'realtime',
        title: 'Real-time order pipeline',
        body: 'WebSocket-based push from customer order to kitchen display. Orders appear on the kitchen screen in under a second — no polling, no manual refresh.',
      },
      {
        id: 'multitenant',
        title: 'Multi-tenant architecture',
        body: 'One deployment serves all restaurants. Each tenant gets isolated data, their own ordering domain, and independent menu and staff management.',
      },
      {
        id: 'commission',
        title: '0% commission model',
        body: 'WOS charges a flat monthly fee, not a cut per order. A restaurant doing PKR 125K/month in direct sales keeps the entire margin — vs. losing 15–30% to a platform.',
      },
    ]),
  }),
  outcomes: Object.freeze({
    heading: 'Verified Outcomes',
    intro: 'Results from active WOS clients, as published on onlineorder.pk.',
    scale: Object.freeze([
      { value: '30+', label: 'Restaurants live' },
      { value: '12+', label: 'Cities in Pakistan' },
      { value: 'PK · UK · USA', label: 'Countries served' },
    ]),
    clients: Object.freeze([
      {
        id: 'kpfc',
        name: 'Kentucky Pizza & Fried Chicken',
        location: 'Wah Cantt · 2 branches',
        stats: Object.freeze([
          { value: 'PKR 879K', label: 'direct sales in 2 months' },
          { value: 'PKR 300K+', label: 'commission kept' },
          { value: '+30%', label: 'order growth' },
        ]),
      },
      {
        id: 'wildwings',
        name: 'Wild Wings',
        location: 'I-8, Islamabad',
        stats: Object.freeze([
          { value: 'PKR 125K', label: 'monthly direct sales' },
          { value: 'PKR 50K+', label: 'commission kept monthly' },
        ]),
      },
      {
        id: 'crisp',
        name: 'Crisp n Spice',
        location: 'Pakistan',
        stats: Object.freeze([
          { value: 'PKR 75K', label: 'monthly direct sales' },
          { value: '24/7', label: 'ordering availability' },
        ]),
      },
    ]),
  }),
  liveProduct: Object.freeze({
    heading: 'Live Product',
    description: 'WOS is in active production. These surfaces are available to explore.',
    aria: 'Live WOS product links',
    links: Object.freeze([
      { id: 'platform', label: 'Live ordering platform', href: 'https://onlineorder.pk' },
      { id: 'admin', label: 'Admin dashboard', href: 'https://onlineorder.pk/wos/admin' },
      { id: 'epos', label: 'ePOS terminal', href: 'https://onlineorder.pk/epos' },
      { id: 'westcoast', label: 'West Coast Coffee (client site)', href: 'https://westcoastcoffee.pk/' },
      { id: 'webticians', label: 'Webticians', href: 'https://webticians.com' },
    ]),
  }),
  cta: Object.freeze({
    heading: 'Want something like this built?',
    body: 'I design and build operational systems — multi-surface products with backends that handle real load and interfaces that teams actually use.',
    primary: Object.freeze({ label: 'Start a project brief', href: '/#contact' }),
    secondary: Object.freeze({ label: 'View all projects', href: '/projects' }),
  }),
});
