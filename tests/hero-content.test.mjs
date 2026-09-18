import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('HeroContent presents the approved punchline and conversion paths', () => {
  const content = readFileSync(resolve('src/modules/home/presentation/hero/HeroContent.jsx'), 'utf-8');

  assert.ok(content.includes('Built to'), 'Includes the hero punchline lead');
  assert.ok(content.includes('hold together.'), 'Includes the hero punchline accent');
  assert.ok(content.includes('See Work'), 'Includes the work CTA');
  assert.ok(content.includes("Let's Plan"), 'Includes the planning CTA');
  assert.ok(content.includes('href="#projects"'), 'Work CTA targets the projects sequence');
  assert.ok(content.includes('href="#contact"'), 'Planning CTA targets contact');
  assert.ok(content.includes('GitHub'), 'Includes GitHub social link');
  assert.ok(content.includes('LinkedIn'), 'Includes LinkedIn social link');
  assert.ok(content.includes('Email'), 'Includes email social link');
});

test('HeroVisual assembles the globe portal and opposing identity arcs', () => {
  const visual = readFileSync(resolve('src/modules/home/presentation/hero/HeroVisual.jsx'), 'utf-8');
  const css = readFileSync(resolve('src/modules/home/presentation/hero/hero.css'), 'utf-8');

  assert.ok(visual.includes('GLOBE_FRAMES'), 'Uses the digital earth frame sequence');
  assert.ok(visual.includes('Hafiz Ali Abdullah'), 'Uses the approved top arc identity');
  assert.ok(visual.includes('Flutter Developer'), 'Uses the approved role arc');
  assert.ok(visual.includes('Mobile Application Developer'), 'Uses the mobile role arc');
  assert.ok(visual.includes('SaaS Developer'), 'Uses the SaaS role arc');
  assert.ok(visual.includes('proofMetrics'), 'Uses real proof-point KPI data');
  assert.match(visual, /hero-visual-stats/);
  assert.match(css, /\.hero-visual\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?inset:\s*0;/);
  assert.match(css, /\.hero-globe-portal\s*\{[\s\S]*?aspect-ratio:\s*16\s*\/\s*9/);
  assert.match(css, /mask-image:/);
  assert.match(css, /filter:\s*blur\(0\.8px\)/);
  assert.match(css, /heroArcTextSweep/);
  assert.match(css, /animation: heroArcTextSweep 13s linear/);
  assert.match(css, /heroArcRotateTop/);
  assert.match(css, /heroArcRotateBottom/);
  assert.match(css, /heroMarqueeSweep/);
  assert.match(css, /border-radius:\s*9999px/);
  assert.match(css, /\.hero-social-link\s*\{[\s\S]*?border-radius:\s*50%/);
});

test('HomePage starts with opening intro hook experience', () => {
  const homePage = readFileSync(resolve('src/modules/home/presentation/HomePage.jsx'), 'utf-8');

  assert.ok(homePage.includes("useState('intro')"), 'Starts with the intro hook experience');
  assert.ok(homePage.includes("transitioning={experienceState === 'handoff'}"), 'Passes handoff state into the hero');
});
