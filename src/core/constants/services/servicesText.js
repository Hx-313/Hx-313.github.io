function deepFreeze(value) {
  Object.keys(value).forEach((key) => {
    const nestedValue = value[key];
    if (nestedValue && typeof nestedValue === 'object' && !Object.isFrozen(nestedValue)) {
      deepFreeze(nestedValue);
    }
  });

  return Object.freeze(value);
}

export const SERVICES_TEXT = deepFreeze({
  label: 'Capabilities',
  aria: {
    tablist: 'Service categories',
    panelPrefix: 'services',
  },
  tabs: [
    {
      id: 'mobile-development',
      label: 'Mobile apps',
      items: [
        {
          id: 'mobile-app-development',
          name: 'Flutter + Native Apps',
          description: 'Customer-facing and internal mobile applications shaped around real workflows',
          icon: 'smartphone',
        },
        {
          id: 'app-revamping',
          name: 'App Revamping',
          description: 'Modernizing existing apps for clearer architecture, better performance, and smoother flows',
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
          name: 'App Delivery',
          description: 'Prepared, tested, and shipped to the App Store and Google Play',
          icon: 'rocket',
        },
        {
          id: 'bug-fixes-maintenance',
          name: 'Stabilization',
          description: 'Ongoing support, troubleshooting, and the unglamorous work that keeps software dependable',
          icon: 'shield',
        },
      ],
    },
    {
      id: 'backend',
      label: 'Node.js backend',
      items: [
        {
          id: 'backend-development',
          name: 'Node.js Backend',
          description: 'APIs and server-side systems built to hold business state reliably',
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
      label: 'Connected systems',
      items: [
        {
          id: 'saas-product-development',
          name: 'Connected Systems',
          description: 'Full products, not just apps — mobile, backend, dashboards, and integrations',
          icon: 'layers',
        },
        {
          id: 'ordering-pos-systems',
          name: 'Ordering & POS Systems',
          description: 'Commerce workflows connecting ordering, terminals, admin tools, and backend services',
          icon: 'creditCard',
        },
      ],
    },
  ],
});
