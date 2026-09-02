import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  FOOTER_NAVIGATION,
  FOOTER_SYSTEMS,
  FOOTER_CONNECT,
  FOOTER_COLOPHON,
} from '../src/modules/footer/domain/footerData.js';

test('footerData exports navigation chapters, live systems, and colophon', () => {
  // Navigation
  assert.ok(Array.isArray(FOOTER_NAVIGATION), 'FOOTER_NAVIGATION is an array');
  const navHrefs = FOOTER_NAVIGATION.map((n) => n.href);
  assert.ok(navHrefs.includes('#top'), 'Navigation includes #top');
  assert.ok(navHrefs.includes('#story'), 'Navigation includes #story');
  assert.ok(navHrefs.includes('#how-i-build'), 'Navigation includes #how-i-build');
  assert.ok(navHrefs.includes('#command-center'), 'Navigation includes #command-center');
  assert.ok(navHrefs.includes('#contact'), 'Navigation includes #contact');

  // Live Systems
  assert.ok(Array.isArray(FOOTER_SYSTEMS), 'FOOTER_SYSTEMS is an array');
  const systemUrls = FOOTER_SYSTEMS.map((s) => s.url);
  assert.ok(systemUrls.includes('https://onlineorder.pk/wos/admin'), 'Includes WOS Admin link');
  assert.ok(systemUrls.includes('https://onlineorder.pk/epos'), 'Includes EPOS Terminal link');
  assert.ok(systemUrls.includes('https://westcoastcoffee.pk/'), 'Includes West Coast Coffee link');
  assert.ok(systemUrls.includes('https://github.com/Hx-313'), 'Includes GitHub repo link');

  // Connect Channels
  assert.ok(Array.isArray(FOOTER_CONNECT), 'FOOTER_CONNECT is an array');
  const connectUrls = FOOTER_CONNECT.map((c) => c.url);
  assert.ok(connectUrls.includes('mailto:aliabdullahva313@gmail.com'), 'Includes email link');
  assert.ok(connectUrls.some((u) => u.startsWith('https://wa.me/')), 'Includes WhatsApp link');
  assert.ok(connectUrls.some((u) => u.includes('linkedin.com')), 'Includes LinkedIn link');
  assert.ok(connectUrls.some((u) => u.includes('cal.com')), 'Includes Calendar schedule link');

  // Colophon
  assert.ok(FOOTER_COLOPHON.timezone.includes('PKT'), 'Colophon contains PKT timezone');
  assert.ok(FOOTER_COLOPHON.copyright.includes('2026'), 'Colophon contains copyright year');
});

test('SiteFooter renders 4-column directory, colophon, and back-to-top control', () => {
  const footerJsx = fs.readFileSync(path.resolve('src/modules/footer/presentation/SiteFooter.jsx'), 'utf8');
  const footerCss = fs.readFileSync(path.resolve('src/modules/footer/presentation/footer.css'), 'utf8');

  // Semantic landmark
  assert.ok(footerJsx.includes('role="contentinfo"'), 'Footer has role="contentinfo"');
  assert.ok(footerJsx.includes('className="site-footer"'), 'Footer has className="site-footer"');

  // Brand lockup & positioning
  assert.ok(footerJsx.includes('Hx-313') || footerJsx.includes('Hafiz Ali Abdullah'), 'Footer renders brand identity');

  // Interactive back to top
  assert.ok(footerJsx.includes('href="#top"'), 'Footer has anchor to #top');
  assert.ok(footerJsx.includes('scrollToTop') || footerJsx.includes('back-to-top'), 'Footer contains back to top affordance');

  // CSS Rules
  assert.ok(footerCss.includes('.site-footer'), 'CSS defines .site-footer');
  assert.ok(footerCss.includes('.footer-directory-grid'), 'CSS defines .footer-directory-grid');
  assert.ok(footerCss.includes(':focus-visible'), 'CSS defines focus visible outline');
  assert.ok(footerCss.includes(":root[data-theme='light']"), 'CSS defines light theme styles');
  assert.ok(footerCss.includes('prefers-reduced-motion'), 'CSS supports reduced motion');
});
