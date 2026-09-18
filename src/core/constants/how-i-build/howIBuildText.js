function deepFreeze(obj) {
  Object.keys(obj).forEach((prop) => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
}

export const HOW_I_BUILD_TEXT = deepFreeze({
  label: 'How I build',
  appliedToLabel: 'Applied to',
  aria: {
    competencies: 'Engineering competencies',
    toolGrid: 'Technologies and development tools',
  },
  paragraphs: [
    'Every layer gets a tool chosen for what it actually has to survive — not what’s trending this year.',
    'Flutter and native mobile for the interface people use. Node.js, REST APIs, MongoDB, SQL, and Firebase for the services and data layer behind it. The stack follows the product, the workflow, and the reliability it needs.',
    'Architecture decides what’s possible. Clear ownership of every layer makes it shippable.',
  ],
  tags: [
    'MOBILE APP',
    'NATIVE MOBILE',
    'BACKEND',
    'SYSTEM DESIGN',
    'DEPLOYMENT',
    'API DESIGN',
    'DATABASE',
    'VERSION CONTROL',
  ],
  tools: [
    // Row 1
    {
      id: 'flutter',
      name: 'Flutter',
      description: 'Cross-platform mobile development',
      service: 'Mobile product delivery',
      icon: 'flutter',
    },
    {
      id: 'android',
      name: 'Android Native',
      description: 'Platform-specific builds',
      service: 'Platform-specific product builds',
      icon: 'android',
    },
    {
      id: 'firebase',
      name: 'Firebase',
      description: 'Backend and authentication',
      service: 'Auth, data, and realtime services',
      icon: 'firebase',
    },
    // Row 2
    {
      id: 'nodejs',
      name: 'Node.js',
      description: 'Server-side runtime',
      service: 'API and backend systems',
      icon: 'nodejs',
    },
    {
      id: 'mongodb-sql',
      name: 'MongoDB + SQL',
      description: 'Document and relational data',
      service: 'Product data architecture',
      icon: 'mongodb',
    },
    {
      id: 'sqlite',
      name: 'SQLite',
      description: 'Local data storage',
      service: 'Local-first mobile storage',
      icon: 'sqlite',
    },
    // Row 3
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Frontend deployment',
      service: 'Web product deployment',
      icon: 'vercel',
    },
    {
      id: 'hostinger',
      name: 'Hostinger',
      description: 'Backend hosting',
      service: 'Backend hosting and operations',
      icon: 'hostinger',
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Version control and collaboration',
      service: 'Source control and team delivery',
      icon: 'github',
    },
    // Row 4
    {
      id: 'vscode',
      name: 'VS Code',
      description: 'Code editor',
      service: 'Daily engineering workflow',
      icon: 'vscode',
    },
    {
      id: 'postman-insomnia',
      name: 'Postman + Insomnia',
      description: 'API testing and documentation',
      service: 'API quality and documentation',
      icon: 'postman',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Messaging and collaboration',
      service: 'Team communication',
      icon: 'slack',
    },
  ],
});
