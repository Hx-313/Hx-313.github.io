import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('HeroContent establishes Hafiz as a mobile application developer before presenting proof', () => {
  const content = readFileSync(resolve('src/modules/home/presentation/hero/HeroContent.jsx'), 'utf-8');

  assert.ok(content.includes('Hafiz Ali Abdullah'), 'Leads with the developer name');
  assert.ok(content.includes('Mobile Application Developer'), 'Establishes the developer specialty');
  assert.ok(content.includes('YOUR IDEA DESERVES MORE'), 'Uses the primary hero hook');
  assert.ok(content.includes('THAN AN APP THAT WORKS.'), 'Uses the outcome-focused hero hook');
  assert.ok(content.includes('Let’s talk'), 'Uses a minimal, personal collaboration CTA');
  assert.ok(content.includes('href="#contact"'), 'Primary CTA targets contact');
  assert.ok(content.includes('View apps'), 'Includes an approachable work fast path');
  assert.ok(content.includes('href="#systems"'), 'Secondary CTA targets systems section');
  assert.ok(content.includes('hero-proof'), 'Includes concise proof');
  assert.ok(content.includes('3+ years building'), 'Uses Hafiz’s accurate years-building experience');
  assert.ok(content.includes('15+ apps shipped'), 'Frames proof around Hafiz’s app work');
  assert.ok(content.includes('100k+ downloads'), 'Includes mobile-app reach proof');
  assert.ok(content.includes('100k+'), 'Includes download proof point');
});

test('HeroVisual gives Hafiz’s portrait the full visual focus', () => {
  const visual = readFileSync(resolve('src/modules/home/presentation/hero/HeroVisual.jsx'), 'utf-8');
  const css = readFileSync(resolve('src/modules/home/presentation/hero/hero.css'), 'utf-8');

  assert.ok(visual.includes('/assets/hafiz-ali-abdullah.png'), 'Uses Hafiz’s portrait as the hero visual');
  assert.ok(visual.includes('className="hero-portrait"'), 'Uses a dedicated, uncluttered portrait treatment');
  assert.doesNotMatch(visual, /hero-apps|Dietify|ReadMate|Pet Care|Speak & Translate/, 'Removes app icons from the hero');
  assert.match(css, /\.hero-visual::before[\s\S]*?radial-gradient/, 'Adds a contained neon halo behind the portrait');
  assert.doesNotMatch(visual, /WOS|ePOS/i, 'Does not present a single business system as Hafiz’s identity');
});

test('HomePage starts with opening intro hook experience', () => {
  const homePage = readFileSync(resolve('src/modules/home/presentation/HomePage.jsx'), 'utf-8');

  assert.ok(homePage.includes("useState('intro')"), 'Starts with the intro hook experience');
});
