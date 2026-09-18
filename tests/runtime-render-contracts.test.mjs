import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('services text constants are imported before render use', async () => {
  const source = await readFile(new URL('../src/modules/home/presentation/services/Services.jsx', import.meta.url), 'utf8');

  assert.match(source, /import\s*\{[^}]*SERVICES_TEXT[^}]*\}\s*from\s*['"]\.\/servicesData\.js['"]/);
});

test('contact text constants are imported before render use', async () => {
  const source = await readFile(new URL('../src/modules/contact/presentation/ContactChannels.jsx', import.meta.url), 'utf8');

  assert.match(source, /import\s*\{[^}]*CONTACT_TEXT[^}]*\}\s*from\s*['"]\.\.\/domain\/contactData\.js['"]/);
});
