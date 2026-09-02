import test from 'node:test';
import assert from 'node:assert/strict';
import { contactLinks, siteLinks, wosLinks, scheduleLink } from '../src/core/constants.js';

test('defines the external WOS destinations used by the system constellation', () => {
  assert.deepEqual(wosLinks, {
    adminPanel: 'https://onlineorder.pk/wos/admin',
    epos: 'https://onlineorder.pk/epos',
    customerWebsite: 'https://westcoastcoffee.pk/',
  });
});

test('centralizes shared contact and site destinations', () => {
  assert.equal(contactLinks.email, 'mailto:aliabdullahva313@gmail.com');
  assert.equal(contactLinks.whatsapp, 'https://wa.me/923475662750');
  assert.equal(siteLinks.github, 'https://github.com/Hx-313');
  assert.equal(siteLinks.linkedin, 'https://www.linkedin.com/in/hafiz-ali-abdullah-660429207');
});

test('defines the schedule meeting link for the conversion funnel', () => {
  assert.equal(scheduleLink, 'https://cal.com/hafiz-ali');
});
