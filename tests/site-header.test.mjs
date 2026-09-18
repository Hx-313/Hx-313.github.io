import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const headerJsxPath = path.resolve('src/modules/home/presentation/header/SiteHeader.jsx');
const headerCssPath = path.resolve('src/modules/home/presentation/header/header.css');
const homeCssPath = path.resolve('src/modules/home/presentation/home.css');

test('SiteHeader component contains tactical navigation, live telemetry, socials, and theme controls', async () => {
  const jsx = fs.readFileSync(headerJsxPath, 'utf8');
  const { HEADER_TEXT } = await import('../src/core/constants/navigation/headerText.js');

  // Navigation Items from constants contract
  const labels = HEADER_TEXT.navItems.map((item) => item.label);
  assert.ok(labels.includes('Overview'), 'should contain Overview nav item');
  assert.ok(labels.includes('01 Projects'), 'should contain projects nav item');
  assert.ok(labels.includes('02 About'), 'should contain about chapter nav item');
  assert.ok(labels.includes('03 Services'), 'should contain services nav item');
  assert.ok(labels.includes('04 Domains'), 'should contain domain services nav item');
  assert.ok(labels.includes('05 Certifications'), 'should contain certifications nav item');
  assert.ok(labels.includes('06 Tools'), 'should contain tools nav item');
  assert.ok(labels.includes('07 Contact'), 'should contain Contact nav item');
  assert.ok(labels.includes('08 Testimonials'), 'should contain testimonials nav item');
  assert.match(jsx, /HEADER_TEXT\.navItems/, 'SiteHeader should reference HEADER_TEXT.navItems');
  assert.match(jsx, /aria-current=\{isActive \? 'location' : undefined\}/, 'should set aria-current="location" for active section');
  assert.match(jsx, /IntersectionObserver/, 'should use IntersectionObserver for performant scroll-spying');
  assert.match(jsx, /prefers-reduced-motion/, 'should avoid smooth scrolling for reduced-motion users');

  // Telemetry & Status
  assert.match(jsx, /ithx-logo\.png|site-brand-logo-img/, 'should render official itHX brand logo image');
  assert.match(jsx, /HEADER_TEXT\.mobileDrawer\.sysTimeLabel/, 'should contain system time telemetry');
  assert.match(jsx, /HEADER_TEXT\.mobileDrawer\.sysOnline|status-live-dot/, 'should contain online status beacon');

  // Social Quick Portals
  assert.match(jsx, /siteLinks\.github/, 'should link to GitHub profile');
  assert.match(jsx, /siteLinks\.linkedin/, 'should link to LinkedIn profile');

  // Theme & CTA
  assert.match(jsx, /<ThemeToggle/, 'should embed ThemeToggle component');
  assert.match(jsx, /header-cta-btn/, 'should render primary CTA button');
  assert.match(jsx, /contactLinks\.email/, 'should bind CTA to contact email link');
});

test('SiteHeader includes accessible mobile drawer and responsive toggles', () => {
  const jsx = fs.readFileSync(headerJsxPath, 'utf8');

  // Mobile Toggle & Accessibility
  assert.match(jsx, /header-burger-btn/, 'should contain burger button');
  assert.match(jsx, /aria-expanded=\{isMobileOpen\}/, 'should bind aria-expanded to drawer state');
  assert.match(jsx, /aria-controls="mobile-nav-drawer"/, 'should link burger button to mobile drawer');
  assert.match(jsx, /mobile-nav-drawer/, 'should define mobile nav drawer');
  assert.match(jsx, /mobile-theme-controls/, 'should keep theme controls available inside the mobile drawer');
  assert.match(jsx, /Escape/, 'should handle Escape key to close drawer');
});

test('header.css defines sticky styling, frosted backdrop, light theme tokens, and mobile media queries', () => {
  const css = fs.readFileSync(headerCssPath, 'utf8');

  assert.match(css, /position:\s*sticky/, 'header must have sticky positioning');
  assert.match(css, /backdrop-filter:\s*blur/, 'header must have backdrop blur for frosted glass');
  assert.match(css, /:root\[data-theme='light'\]\s+\.site-header/, 'must have light theme styling');
  assert.match(css, /@media\s*\(max-width:\s*980px\)/, 'must contain responsive mobile breakpoint');
  assert.match(css, /\.mobile-nav-drawer/, 'must contain mobile drawer styles');
  assert.match(css, /height:\s*100dvh/, 'mobile drawer must span the viewport height');
});

test('ready site does not trap the sticky header inside a transformed experience shell', () => {
  const css = fs.readFileSync(homeCssPath, 'utf8');

  assert.match(css, /\.site-experience\.is-ready\s*\{[\s\S]*?transform:\s*none/, 'ready experience should release its transform containing block');
});
