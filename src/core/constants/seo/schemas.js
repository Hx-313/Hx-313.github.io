const SITE_URL = 'https://solithx.com';
const AUTHOR_NAME = 'Hafiz Ali Abdullah';

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, url }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: `${SITE_URL}${url}`,
    })),
  };
}

export const profilePageSchema = Object.freeze({
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  name: `${AUTHOR_NAME} — Flutter & Node.js Developer`,
  url: SITE_URL,
  mainEntity: {
    '@type': 'Person',
    name: AUTHOR_NAME,
    alternateName: 'HX313',
    jobTitle: 'Flutter Developer & Node.js Backend Engineer',
    url: SITE_URL,
    sameAs: [
      'https://www.linkedin.com/in/hafiz-ali-abdullah-660429207',
      'https://github.com/Hx-313',
      'https://www.instagram.com/ithx313/',
    ],
  },
});

export const personSchema = Object.freeze({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: AUTHOR_NAME,
  url: SITE_URL,
  jobTitle: 'Flutter Developer & Node.js Backend Engineer',
  sameAs: [
    'https://www.linkedin.com/in/hafiz-ali-abdullah-660429207',
    'https://github.com/Hx-313',
  ],
});

export function softwareAppSchema(project) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.name,
    description: project.description,
    applicationCategory: 'MobileApplication',
    operatingSystem: project.platforms.join(', '),
    url: `${SITE_URL}/projects/${project.id}`,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
  };

  if (project.storeLinks?.googlePlay) {
    schema.downloadUrl = project.storeLinks.googlePlay;
    schema.installUrl = project.storeLinks.googlePlay;
  }

  return schema;
}

export const wosEntitySchemas = Object.freeze([
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'WOS — Restaurant Operating System',
    description:
      'Full-stack restaurant operating system connecting customer ordering, administration, ePOS terminals, and payment processing. Designed and built by Hafiz Ali Abdullah for Webticians.',
    url: 'https://onlineorder.pk',
    sameAs: [`${SITE_URL}/projects/wos`, 'https://onlineorder.pk/wos/admin'],
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Android, iOS',
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
      sameAs: [
        'https://www.linkedin.com/in/hafiz-ali-abdullah-660429207',
        'https://github.com/Hx-313',
      ],
    },
    creator: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    provider: {
      '@type': 'Organization',
      name: 'Webticians',
      url: 'https://webticians.com',
    },
    mainEntityOfPage: `${SITE_URL}/projects/wos`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Webticians',
    url: 'https://webticians.com',
    description: 'Technology company. Client for WOS — a restaurant operating system developed by Hafiz Ali Abdullah.',
    subjectOf: {
      '@type': 'SoftwareApplication',
      name: 'WOS',
      url: 'https://onlineorder.pk',
      author: {
        '@type': 'Person',
        name: AUTHOR_NAME,
        url: SITE_URL,
      },
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: `${SITE_URL}/projects` },
      { '@type': 'ListItem', position: 3, name: 'WOS', item: `${SITE_URL}/projects/wos` },
    ],
  },
]);

export function projectsItemListSchema(projectList) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Projects by ${AUTHOR_NAME}`,
    url: `${SITE_URL}/projects`,
    itemListElement: projectList.map(({ name, id }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      url: `${SITE_URL}/projects/${id}`,
    })),
  };
}
