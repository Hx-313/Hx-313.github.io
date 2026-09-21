import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const projectIds = ['dietify', 'speak', 'expenseflow', 'wos'];
const projectsSource = await readFile(new URL('../src/data/projects.js', import.meta.url), 'utf8');

test('projects are ordered for the showcase story', () => {
  const positions = projectIds.map((projectId) => projectsSource.indexOf(`id: '${projectId}'`));

  assert.ok(positions.every((position) => position >= 0), 'all featured projects must be present');
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.match(projectsSource, /id: 'dietify'[\s\S]*name: 'Dietify'/);
  assert.match(projectsSource, /id: 'speak'[\s\S]*name: 'Speak & Translate'/);
  assert.match(projectsSource, /id: 'expenseflow'[\s\S]*name: 'ExpenseFlow'/);
  assert.match(projectsSource, /id: 'wos'[\s\S]*name: 'WOS'/);
});

test('showcase projects use their app-specific hero asset folders', () => {
  for (const projectId of projectIds) {
    const assetFolder = projectId === 'speak' ? 'speak-and-translate' : projectId;
    const projectStart = projectsSource.indexOf(`id: '${projectId}'`);
    const projectEnd = projectsSource.indexOf('\n  },', projectStart);
    const projectSource = projectsSource.slice(projectStart, projectEnd === -1 ? undefined : projectEnd);

    assert.match(projectSource, new RegExp(`/assets/${assetFolder}/hero\\.(webp|png)`));
    assert.match(projectSource, /imageAlt:/);
    assert.match(projectSource, /description:/);
    assert.match(projectSource, /platforms:\s*\[[^\]]{2,}\]/);
  }
});

test('projects showcase provides vertical header scroll and sticky horizontal card carousel', async () => {
  const component = await readFile(new URL('../src/modules/home/presentation/command-center/ProjectsShowcase.jsx', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/modules/home/presentation/command-center/projects-showcase.css', import.meta.url), 'utf8');
  const headerStyles = await readFile(new URL('../src/modules/home/presentation/header/header.css', import.meta.url), 'utf8');
  const commandCenter = await readFile(new URL('../src/modules/home/presentation/command-center/CommandCenter.jsx', import.meta.url), 'utf8');

  assert.match(commandCenter, /ProjectsShowcase/);
  assert.match(component, /const FEATURED_PROJECT_IDS = \['dietify', 'speak', 'expenseflow', 'wos'\];/);
  assert.match(component, /aria-labelledby/);
  assert.match(component, /See all projects/);
  assert.match(component, /href="#contact"/);
  assert.match(component, /projects-showcase__headline-line/);
  assert.match(component, /projects-showcase__header-stage/);
  assert.match(component, /projects-showcase__scroll-track/);
  assert.match(component, /projects-showcase__sticky-viewport/);
  assert.match(component, /projects-showcase__card/);
  assert.match(component, /data-carousel-state/);
  assert.match(component, /CAROUSEL_STEP_COUNT/);
  assert.match(component, /setActiveIndex/);
  assert.match(component, /projects-showcase__carousel-button/);
  assert.doesNotMatch(component, /projects-showcase__progress/);
  assert.doesNotMatch(component, /Scroll to explore/);

  assert.match(component, /0\.8/);
  assert.match(styles, /projects-showcase__header-stage/);
  assert.match(styles, /projects-showcase__scroll-track/);
  assert.match(styles, /projects-showcase__sticky-viewport/);
  assert.match(styles, /position:\s*sticky/);
  assert.match(styles, /height:\s*calc\(100vh \+ var\(--projects-scroll-distance\)\)/);
  assert.match(styles, /100dvh/);
  assert.match(styles, /--projects-card-height:\s*80dvh;/);
  assert.match(styles, /padding:\s*clamp\(5\.25rem,\s*9vh,\s*6\.5rem\)\s+5vw/);
  assert.match(styles, /data-carousel-state="active"/);
  assert.match(styles, /data-carousel-state="previous"/);
  assert.match(styles, /data-carousel-state="next"/);
  assert.match(styles, /data-carousel-state="hidden"/);
  assert.match(styles, /filter:\s*blur\(/);
  assert.match(styles, /projects-showcase__media/);
  assert.match(styles, /projects-showcase__body/);
  assert.match(styles, /@media\s*\(min-width:\s*900px\)/);
  assert.match(styles, /@media\s*\(max-width:\s*720px\)/);
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.doesNotMatch(styles, /overflow-x:\s*auto/);
  assert.match(styles, /var\(--color-background\)/);
  assert.match(styles, /var\(--color-surface/);
  assert.match(headerStyles, /\.site-header[\s\S]*position:\s*sticky/);
});
