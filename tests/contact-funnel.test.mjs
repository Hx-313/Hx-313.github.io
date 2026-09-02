import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  CONTACT_CHANNELS,
  PROJECT_CATEGORIES,
  TELEMETRY_DATA,
} from '../src/modules/contact/domain/contactData.js';
import {
  validateContactForm,
  buildMailtoUrl,
} from '../src/modules/contact/application/useContactForm.js';

test('contactData exports immutable channels, categories, and operational telemetry', () => {
  assert.ok(CONTACT_CHANNELS.meeting.link.includes('cal.com'), 'Meeting channel contains cal.com booking link');
  assert.equal(CONTACT_CHANNELS.meeting.duration, '30 mins');
  assert.ok(CONTACT_CHANNELS.whatsapp.link.startsWith('https://wa.me/'), 'WhatsApp channel contains wa.me link');
  assert.equal(CONTACT_CHANNELS.email.address, 'aliabdullahva313@gmail.com');
  assert.equal(CONTACT_CHANNELS.email.mailto, 'mailto:aliabdullahva313@gmail.com');

  assert.ok(Array.isArray(PROJECT_CATEGORIES), 'Project categories is an array');
  assert.ok(PROJECT_CATEGORIES.includes('Full-Stack SaaS'));
  assert.ok(PROJECT_CATEGORIES.includes('Web Application'));
  assert.ok(PROJECT_CATEGORIES.includes('POS & Systems Architecture'));
  assert.ok(PROJECT_CATEGORIES.includes('Technical Advisory / Audit'));

  assert.equal(TELEMETRY_DATA.timezone, 'PKT / UTC+5 (Lahore)');
  assert.equal(TELEMETRY_DATA.responseTime, '< 2 hours');
  assert.ok(TELEMETRY_DATA.status.includes('Available'));
});

test('validateContactForm checks required fields and formats', () => {
  const emptyResult = validateContactForm({ name: '', email: '', message: '' });
  assert.equal(emptyResult.isValid, false);
  assert.ok(emptyResult.errors.name, 'Name is required');
  assert.ok(emptyResult.errors.email, 'Email is required');
  assert.ok(emptyResult.errors.message, 'Message is required');

  const invalidEmailResult = validateContactForm({
    name: 'Ada Lovelace',
    email: 'not-an-email',
    message: 'We would love to discuss a project with you.',
  });
  assert.equal(invalidEmailResult.isValid, false);
  assert.ok(invalidEmailResult.errors.email, 'Invalid email format is detected');

  const validResult = validateContactForm({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    category: 'Full-Stack SaaS',
    message: 'We are building a distributed POS platform and need technical leadership.',
  });
  assert.equal(validResult.isValid, true);
  assert.deepEqual(validResult.errors, {});
});

test('buildMailtoUrl constructs prefilled inquiry email', () => {
  const url = buildMailtoUrl({
    name: 'Grace Hopper',
    email: 'grace@navy.mil',
    category: 'POS & Systems Architecture',
    message: 'Let us build a compiler architecture.',
  });

  assert.ok(url.startsWith('mailto:aliabdullahva313@gmail.com?'));
  assert.ok(url.includes('POS%20%26%20Systems%20Architecture') || url.includes('POS'), 'Subject contains category');
  assert.ok(url.includes('Grace%20Hopper') || url.includes('Grace+Hopper'), 'Body contains client name');
});

test('ContactSection, ContactChannels, and ContactForm implement accessible funnel structure', () => {
  const sectionJsx = fs.readFileSync(path.resolve('src/modules/contact/presentation/ContactSection.jsx'), 'utf8');
  const channelsJsx = fs.readFileSync(path.resolve('src/modules/contact/presentation/ContactChannels.jsx'), 'utf8');
  const formJsx = fs.readFileSync(path.resolve('src/modules/contact/presentation/ContactForm.jsx'), 'utf8');
  const contactCss = fs.readFileSync(path.resolve('src/modules/contact/presentation/contact.css'), 'utf8');

  // Landmark and anchor ID
  assert.ok(sectionJsx.includes('id="contact"'), 'ContactSection has id="contact" for navigation');
  assert.ok(sectionJsx.includes('ContactChannels'), 'ContactSection embeds ContactChannels');
  assert.ok(sectionJsx.includes('ContactForm'), 'ContactSection embeds ContactForm');

  // Channels column
  assert.ok(channelsJsx.includes('meeting.link'), 'ContactChannels embeds meeting schedule link');
  assert.ok(channelsJsx.includes('whatsapp.link'), 'ContactChannels embeds whatsapp link');
  assert.ok(channelsJsx.includes('email.address'), 'ContactChannels renders email address');
  assert.ok(channelsJsx.includes('TELEMETRY_DATA.timezone'), 'ContactChannels renders timezone telemetry');

  // Form column accessibility
  assert.ok(formJsx.includes('htmlFor="contact-name"'), 'Form binds label to name input');
  assert.ok(formJsx.includes('htmlFor="contact-email"'), 'Form binds label to email input');
  assert.ok(formJsx.includes('htmlFor="contact-message"'), 'Form binds label to message input');
  assert.ok(formJsx.includes('type="submit"'), 'Form has explicit type="submit" button');
  assert.ok(formJsx.includes('PROJECT_CATEGORIES'), 'Form renders project categories chips');

  // CSS rules
  assert.ok(contactCss.includes('.contact-section'), 'CSS defines .contact-section');
  assert.ok(contactCss.includes('.contact-grid'), 'CSS defines .contact-grid');
  assert.ok(contactCss.includes(':focus-visible'), 'CSS defines visible focus rings');
  assert.ok(contactCss.includes(":root[data-theme='light']"), 'CSS defines light theme styling');
  assert.ok(contactCss.includes('prefers-reduced-motion'), 'CSS supports reduced motion');
});

