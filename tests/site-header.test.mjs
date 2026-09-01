import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const headerJsxPath = path.resolve('src/modules/home/presentation/header/SiteHeader.jsx');
const headerCssPath = path.resolve('src/modules/home/presentation/header/header.css');

test('SiteHeader component contains tactical navigation, live telemetry, socials, and theme controls', () => {
  const jsx = fs.readFileSync(headerJsxPath, 'utf8');

  // Navigation Items
  assert.match(jsx, /Overview/, 'should contain Overview nav item');
  assert.match(jsx, /01 Problem/, 'should contain problem chapter nav item');
  assert.match(jsx, /02 Build/, 'should contain build chapter nav item');
  assert.match(jsx, /03 Systems/, 'should contain systems chapter nav item');
  assert.match(jsx, /Contact/, 'should contain Contact nav item');
  assert.match(jsx, /aria-current=\{isActive \? 'location' : undefined\}/, 'should set aria-current="location" for active section');
  assert.match(jsx, /IntersectionObserver/, 'should use IntersectionObserver for performant scroll-spying');
  assert.match(jsx, /prefers-reduced-motion/, 'should avoid smooth scrolling for reduced-motion users');

  // Telemetry & Status
  assert.match(jsx, /ithx-logo\.png|site-brand-logo-img/, 'should render official itHX brand logo image');
  assert.match(jsx, /SYS TIME|Live System Time/, 'should contain system time telemetry');
  assert.match(jsx, /SYS: ONLINE|status-live-dot/, 'should contain online status beacon');

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

