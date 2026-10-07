import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (file) => readFileSync(resolve(file), 'utf8');

test('HomePage follows the approved post-hero portfolio sequence', () => {
  const homePage = read('src/modules/home/presentation/HomePage.jsx');

  const markers = [
    '<Hero',
    '<CommandCenter',
    '<AboutSection',
    '<Services',
    '<SolutionsSection',
    '<CertificationsSection',
    '<HowIBuild',
    '<ContactSection',
  ];

  const positions = markers.map((marker) => homePage.indexOf(marker));
  assert.ok(positions.every((position) => position >= 0), 'every active portfolio section is mounted');
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, 'sections remain in portfolio order');
  assert.doesNotMatch(homePage, /<ThesisSection/, 'the previous thesis section is not in the portfolio flow');
  assert.doesNotMatch(homePage, /<ClientStory/, 'the thesis story is not presented as a portfolio testimonial');
});

test('portfolio sections are honest, accessible, and motion-addressable', () => {
  const certifications = read('src/modules/home/presentation/certifications/CertificationsSection.jsx');

  assert.match(certifications, /<section/, 'certifications must be a semantic section');
  assert.match(certifications, /aria-labelledby=/, 'certifications must have an accessible heading relationship');
  assert.match(certifications, /data-section=/, 'certifications must expose a navigation section hook');
  assert.match(certifications, /CERTIFICATION_RECORDS/);
  assert.match(certifications, /<CertificationRail/);
  assert.match(certifications, /Professional certifications/);
  assert.match(certifications, /Personal excellence/);
  assert.doesNotMatch(certifications, /placeholder|coming soon/i, 'certifications should render real archive content');
  assert.match(certifications, /data-motion=/, 'certifications must declare its subject motion');

  assert.doesNotMatch(read('src/modules/home/presentation/HomePage.jsx'), /TestimonialsSection/);
});

test('section motion exposes subject-specific choreography with a reduced-motion path', () => {
  const jsx = read('src/shared/motion/SectionReveal.jsx');
  const css = read('src/shared/motion/section-motion.css');

  for (const subject of ['projects', 'about', 'services', 'domains', 'certifications', 'tools', 'contact']) {
    assert.match(jsx, new RegExp(subject), `${subject} should be a supported motion subject`);
    assert.match(css, new RegExp(`section-reveal--${subject}`), `${subject} should have its own motion treatment`);
  }

  assert.match(jsx, /IntersectionObserver/);
  assert.match(jsx, /setIsVisible\(entry\.isIntersecting\)/, 'section choreography should replay when sections re-enter the viewport');
  assert.match(jsx, /prefers-reduced-motion/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /animation-delay/);
});

test('project gallery assigns distinct transitions and removes the post-transition dwell', () => {
  const jsx = read('src/pages/projects/ProjectsPage.jsx');

  assert.match(jsx, /from 'animejs'/, 'Anime.js should drive the gallery transition');
  assert.match(jsx, /reveal: 'radial'/);
  assert.match(jsx, /reveal: 'horizontal'/);
  assert.match(jsx, /reveal: 'vertical'/);
  assert.match(jsx, /WHEEL_GESTURE_GAP/);
  assert.doesNotMatch(jsx, /DWELL/, 'the old fixed post-transition lock should be removed');
  assert.match(jsx, /prefers-reduced-motion/);
});

