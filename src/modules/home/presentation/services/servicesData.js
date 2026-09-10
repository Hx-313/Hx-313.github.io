function deepFreeze(value) {
  Object.keys(value).forEach((key) => {
    const nestedValue = value[key];
    if (nestedValue && typeof nestedValue === 'object' && !Object.isFrozen(nestedValue)) {
      deepFreeze(nestedValue);
    }
  });

  return Object.freeze(value);
}

export const servicesData = deepFreeze({
  label: 'Services',
  tabs: [
    {
      id: 'mobile-development',
      label: 'Mobile Development',
      items: [
        {
          id: 'mobile-app-development',
          name: 'Mobile App Development',
          description: 'Custom Flutter applications with clean UI and solid performance',
          icon: 'smartphone',
        },
        {
          id: 'app-revamping',
          name: 'App Revamping',
          description: 'Modernizing existing apps for better performance and architecture',
          icon: 'refresh',
        },
        {
          id: 'performance-optimization',
          name: 'Performance Optimization',
          description: 'Speed and resource usage tuned for a smoother experience',
          icon: 'zap',
        },
        {
          id: 'app-deployment',
          name: 'App Deployment',
          description: 'Shipped to the App Store and Google Play with expert guidance',
          icon: 'rocket',
        },
        {
          id: 'bug-fixes-maintenance',
          name: 'Bug Fixes & Maintenance',
          description: 'Ongoing support, troubleshooting, and upkeep',
          icon: 'shield',
        },
      ],
    },
    {
      id: 'backend',
      label: 'Backend',
      items: [
        {
          id: 'backend-development',
          name: 'Backend Development',
          description: 'APIs and server-side systems built to hold state reliably',
          icon: 'server',
        },
        {
          id: 'api-integration',
          name: 'API Integration',
          description: 'REST APIs and third-party services integrated cleanly',
          icon: 'link',
        },
      ],
    },
    {
      id: 'saas-development',
      label: 'SaaS Development',
      items: [
        {
          id: 'saas-product-development',
          name: 'SaaS Development',
          description: 'Full products, not just apps — from architecture to deployment',
          icon: 'layers',
        },
        {
          id: 'epos-development',
          name: 'ePOS Development',
          description: 'Point-of-sale systems built for real transactions, real uptime',
          icon: 'creditCard',
        },
      ],
    },
  ],
});
