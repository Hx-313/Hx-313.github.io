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

    assert.match(projectSource, new RegExp(`/assets/${assetFolder}/hero\\.png`));
    assert.match(projectSource, /imageAlt:/);
    assert.match(projectSource, /description:/);
    assert.match(projectSource, /platforms:\s*\[[^\]]{2,}\]/);
  }
});

test('projects showcase owns the horizontal behavior and accessible CTA', async () => {
  const component = await readFile(new URL('../src/modules/home/presentation/command-center/ProjectsShowcase.jsx', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/modules/home/presentation/command-center/projects-showcase.css', import.meta.url), 'utf8');
  const commandCenter = await readFile(new URL('../src/modules/home/presentation/command-center/CommandCenter.jsx', import.meta.url), 'utf8');

  assert.match(commandCenter, /ProjectsShowcase/);
  assert.match(component, /aria-labelledby/);
  assert.match(component, /See all projects/);
  assert.match(component, /href="#contact"/);
  assert.match(component, /HOLD_START_PROGRESS/);
  assert.match(component, /matchMedia\('\(pointer:fine\)'\)/);
  assert.match(component, /prefers-reduced-motion/);
  assert.match(component, /is-holding/);
  assert.match(component, /projects-showcase__headline-line/);
  assert.match(component, /projects-showcase__header-stage/);
  assert.match(component, /projects-showcase__cards-stage/);
  assert.match(component, /ResizeObserver/);
  assert.match(component, /CAROUSEL_STEP_COUNT/);
  assert.match(component, /data-carousel-state/);
  assert.match(component, /activeIndex/);
  assert.match(component, /setActiveIndex/);
  assert.match(component, /projects-showcase__carousel-button/);
  assert.match(component, /% cards\.length/);
  assert.match(component, /--projects-scroll-distance/);
  assert.match(component, /clamp\(rawProgress, 0, 1\)/);

  assert.match(styles, /position:\s*sticky/);
  assert.match(styles, /height:\s*calc\(100vh \+ var\(--projects-scroll-distance\)/);
  assert.match(styles, /overflow:\s*visible/);
  assert.match(styles, /position:\s*absolute/);
  assert.match(styles, /data-carousel-state="active"/);
  assert.match(styles, /data-carousel-state="previous"/);
  assert.match(styles, /data-carousel-state="next"/);
  assert.match(styles, /data-carousel-state="hidden"/);
  assert.match(styles, /filter:\s*blur\(/);
  assert.match(styles, /overflow:\s*hidden/);
  assert.match(styles, /flex:\s*0 0 clamp\(20rem, 20vw, 24rem\)/);
  assert.match(styles, /padding-inline:\s*0/);
  assert.match(styles, /min-height:\s*clamp\(12rem, 28vh, 20rem\)/);
  assert.match(styles, /projects-showcase__cards-stage/);
  assert.match(styles, /@media\s*\(min-width:\s*900px\)/);
  assert.doesNotMatch(styles, /overflow-x:\s*auto/);
  assert.match(styles, /var\(--color-background\)/);
  assert.match(styles, /var\(--color-surface/);
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
