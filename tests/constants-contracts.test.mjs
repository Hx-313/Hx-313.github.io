import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INTRO_TEXT,
  HERO_TEXT,
  COMMAND_CENTER_TEXT,
  ABOUT_TEXT,
  SERVICES_TEXT,
  SOLUTIONS_TEXT,
  CERTIFICATIONS_TEXT,
  HOW_I_BUILD_TEXT,
  CONTACT_TEXT,
  TESTIMONIALS_TEXT,
  HEADER_TEXT,
  FOOTER_TEXT,
  SEO_TEXT,
  siteLinks,
  contactLinks,
} from '../src/core/constants/index.js';

test('constants index exports all required feature constants', () => {
  assert.ok(INTRO_TEXT, 'INTRO_TEXT should be exported');
  assert.ok(HERO_TEXT, 'HERO_TEXT should be exported');
  assert.ok(COMMAND_CENTER_TEXT, 'COMMAND_CENTER_TEXT should be exported');
  assert.ok(ABOUT_TEXT, 'ABOUT_TEXT should be exported');
  assert.ok(SERVICES_TEXT, 'SERVICES_TEXT should be exported');
  assert.ok(SOLUTIONS_TEXT, 'SOLUTIONS_TEXT should be exported');
  assert.ok(CERTIFICATIONS_TEXT, 'CERTIFICATIONS_TEXT should be exported');
  assert.ok(HOW_I_BUILD_TEXT, 'HOW_I_BUILD_TEXT should be exported');
  assert.ok(CONTACT_TEXT, 'CONTACT_TEXT should be exported');
  assert.ok(TESTIMONIALS_TEXT, 'TESTIMONIALS_TEXT should be exported');
  assert.ok(HEADER_TEXT, 'HEADER_TEXT should be exported');
  assert.ok(FOOTER_TEXT, 'FOOTER_TEXT should be exported');
  assert.ok(SEO_TEXT, 'SEO_TEXT should be exported');
  assert.ok(siteLinks, 'siteLinks should be exported');
  assert.ok(contactLinks, 'contactLinks should be exported');
});

test('constants contracts are immutable (frozen)', () => {
  assert.ok(Object.isFrozen(INTRO_TEXT), 'INTRO_TEXT must be frozen');
  assert.ok(Object.isFrozen(HERO_TEXT), 'HERO_TEXT must be frozen');
  assert.ok(Object.isFrozen(COMMAND_CENTER_TEXT), 'COMMAND_CENTER_TEXT must be frozen');
  assert.ok(Object.isFrozen(ABOUT_TEXT), 'ABOUT_TEXT must be frozen');
  assert.ok(Object.isFrozen(SERVICES_TEXT), 'SERVICES_TEXT must be frozen');
  assert.ok(Object.isFrozen(SOLUTIONS_TEXT), 'SOLUTIONS_TEXT must be frozen');
  assert.ok(Object.isFrozen(CERTIFICATIONS_TEXT), 'CERTIFICATIONS_TEXT must be frozen');
  assert.ok(Object.isFrozen(HOW_I_BUILD_TEXT), 'HOW_I_BUILD_TEXT must be frozen');
  assert.ok(Object.isFrozen(CONTACT_TEXT), 'CONTACT_TEXT must be frozen');
  assert.ok(Object.isFrozen(TESTIMONIALS_TEXT), 'TESTIMONIALS_TEXT must be frozen');
  assert.ok(Object.isFrozen(HEADER_TEXT), 'HEADER_TEXT must be frozen');
  assert.ok(Object.isFrozen(FOOTER_TEXT), 'FOOTER_TEXT must be frozen');
  assert.ok(Object.isFrozen(SEO_TEXT), 'SEO_TEXT must be frozen');
});

test('hero and intro text structures contain essential properties', () => {
  assert.ok(typeof HERO_TEXT.kicker === 'string' && HERO_TEXT.kicker.length > 0);
  assert.ok(typeof HERO_TEXT.title.combined === 'string');
  assert.ok(Array.isArray(HERO_TEXT.marqueeWords) && HERO_TEXT.marqueeWords.length > 0);
  assert.ok(Array.isArray(INTRO_TEXT.statements) && INTRO_TEXT.statements.length === 3);
  assert.ok(typeof INTRO_TEXT.bootHud.ready === 'string');
});

test('seo text contains metadata for search indexing', () => {
  assert.ok(SEO_TEXT.defaultTitle.includes('Hafiz Ali Abdullah'));
  assert.ok(SEO_TEXT.defaultDescription.length > 20);
  assert.ok(Array.isArray(SEO_TEXT.keywords) && SEO_TEXT.keywords.length > 3);
});
