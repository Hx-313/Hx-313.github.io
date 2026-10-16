export const HEADER_TEXT = Object.freeze({
  aria: Object.freeze({
    header: 'Primary navigation',
    logo: 'ITHX — Hafiz Ali Abdullah',
    mainNav: 'Main Navigation',
    contactCta: 'Contact Hafiz Ali Abdullah',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    mobileDialog: 'Navigation menu',
    mobileNav: 'Mobile Navigation',
    closeBtn: 'Close navigation',
  }),
  brand: Object.freeze({
    titleAvailable: 'Available for hire',
  }),
  cta: Object.freeze({
    label: 'Start a project',
    mobileLabel: 'Start a project ↗',
  }),
  mobileDrawer: Object.freeze({
    sysOnline: 'SYS: ONLINE',
    mainNavKicker: 'MAIN NAVIGATION',
    sysTimeLabel: 'SYS TIME',
  }),
  topLevelNavIds: Object.freeze(['top', 'about', 'projects', 'contact']),
  navGroups: Object.freeze([
    Object.freeze({
      id: 'capabilities',
      label: 'Capabilities',
      itemIds: Object.freeze(['services', 'domains', 'tools']),
    }),
    Object.freeze({
      id: 'credentials',
      label: 'Credentials',
      itemIds: Object.freeze(['certifications']),
    }),
  ]),
  navItems: Object.freeze([
    Object.freeze({ id: 'top', label: 'Overview', shortLabel: 'Overview', index: '00', href: '/' }),
    Object.freeze({ id: 'about', label: '01 About', shortLabel: 'About', index: '01', href: '/about' }),
    Object.freeze({ id: 'projects', label: '02 Projects', shortLabel: 'Projects', index: '02', href: '/projects' }),
    Object.freeze({ id: 'services', label: '03 Services', shortLabel: 'Services', index: '03', href: '/#services' }),
    Object.freeze({ id: 'domains', label: '04 Industries', shortLabel: 'Industries', index: '04', href: '/#domains' }),
    Object.freeze({ id: 'certifications', label: '05 Certifications', shortLabel: 'Certifications', index: '05', href: '/#certifications' }),
    Object.freeze({ id: 'tools', label: '06 How I Build', shortLabel: 'How I Build', index: '06', href: '/#tools' }),
    Object.freeze({ id: 'contact', label: '07 Contact', shortLabel: 'Contact', index: '07', href: '/contact' }),
  ]),
});
