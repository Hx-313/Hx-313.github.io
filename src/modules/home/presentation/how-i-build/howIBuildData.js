function deepFreeze(obj) {
  Object.keys(obj).forEach((prop) => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
}

export const howIBuildData = deepFreeze({
  label: 'How I build',
  paragraphs: [
    'Every layer gets a tool chosen for what it actually has to survive \u2014 not what\u2019s trending this year.',
    'Flutter and native mobile for the interface people use. Node.js, REST APIs, MongoDB, SQL, and Firebase for the services and data layer behind it. The stack follows the product, the workflow, and the reliability it needs.',
    'Architecture decides what\u2019s possible. Clear ownership of every layer makes it shippable.',
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
      icon: 'flutter',
    },
    {
      id: 'android',
      name: 'Android Native',
      description: 'Platform-specific builds',
      icon: 'android',
    },
    {
      id: 'firebase',
      name: 'Firebase',
      description: 'Backend and authentication',
      icon: 'firebase',
    },
    // Row 2
    {
      id: 'nodejs',
      name: 'Node.js',
      description: 'Server-side runtime',
      icon: 'nodejs',
    },
    {
      id: 'mongodb-sql',
      name: 'MongoDB + SQL',
      description: 'Document and relational data',
      icon: 'mongodb',
    },
    {
      id: 'sqlite',
      name: 'SQLite',
      description: 'Local data storage',
      icon: 'sqlite',
    },
    // Row 3
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Frontend deployment',
      icon: 'vercel',
    },
    {
      id: 'hostinger',
      name: 'Hostinger',
      description: 'Backend hosting',
      icon: 'hostinger',
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Version control and collaboration',
      icon: 'github',
    },
    // Row 4
    {
      id: 'vscode',
      name: 'VS Code',
      description: 'Code editor',
      icon: 'vscode',
    },
    {
      id: 'postman-insomnia',
      name: 'Postman + Insomnia',
      description: 'API testing and documentation',
      icon: 'postman',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Messaging and collaboration',
      icon: 'slack',
    },
  ],
});
