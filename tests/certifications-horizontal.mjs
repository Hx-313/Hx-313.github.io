import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
];

async function openReadyPage(browser, viewport, reducedMotion) {
  const context = await browser.newContext({
    viewport,
    ...(reducedMotion ? { reducedMotion } : {}),
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  const skipButton = page.locator('.space-skip-btn');
  if (await skipButton.count()) {
    await skipButton.click();
  }
  await page.locator('.site-experience.is-ready').waitFor({ state: 'attached', timeout: 2_000 });
  await page.locator('.site-header').waitFor({ state: 'visible', timeout: 2_000 });
  return { context, page };
}

async function assertNoPageOverflow(page) {
  const hasSafeWidth = await page.locator('body').evaluate(
    (element) => element.scrollWidth <= window.innerWidth + 1
  );
  assert.equal(hasSafeWidth, true, 'horizontal certification rails must not widen the page');
}

const browser = await chromium.launch({ headless: true });
const { context, page } = await openReadyPage(browser, VIEWPORTS[0]);

await page.locator('#certifications').evaluate(
  (element) => element.scrollIntoView({ behavior: 'auto', block: 'start' })
);
await page.locator('.section-reveal--certifications.is-visible').waitFor({ state: 'attached', timeout: 2_000 });
await page.waitForTimeout(900);
await page.screenshot({ path: 'test-artifacts/certifications-desktop.png' });
assert.equal(await page.locator('#certifications').isVisible(), true);
assert.equal(await page.locator('.certification-rail').count(), 2);
assert.equal(await page.getByRole('heading', { name: 'Professional certifications' }).isVisible(), true);
assert.equal(await page.getByRole('heading', { name: 'Lifetime achievements' }).isVisible(), true);
assert.equal(await page.locator('button').filter({ hasText: 'Professional' }).count(), 0);
assert.equal(
  await page.locator('.certification-rail__track').first().evaluate(
    (element) => element.scrollWidth > element.clientWidth
  ),
  true,
  'professional rail should overflow horizontally'
);

const link = page.locator('.certification-card a').first();
assert.equal(await link.getAttribute('target'), '_blank');
assert.equal(await link.getAttribute('rel'), 'noreferrer');
assert.ok(await link.getAttribute('href'));

await page.getByRole('button', { name: 'Light' }).click();
assert.equal(await page.locator('html[data-theme="light"]').count(), 1);
await page.getByRole('button', { name: 'Dark' }).click();
assert.equal(await page.locator('html[data-theme="dark"]').count(), 1);

for (const viewport of VIEWPORTS) {
  await page.setViewportSize(viewport);
  if (viewport.width === 390) {
    await page.locator('#certifications').evaluate(
      (element) => element.scrollIntoView({ behavior: 'auto', block: 'start' })
    );
    await page.locator('.section-reveal--certifications.is-visible').waitFor({ state: 'attached', timeout: 2_000 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: 'test-artifacts/certifications-mobile.png' });
  }
  await assertNoPageOverflow(page);
}

await context.close();

const reduced = await openReadyPage(browser, { width: 768, height: 1024 }, 'reduce');
await reduced.page.locator('#certifications').evaluate(
  (element) => element.scrollIntoView({ behavior: 'auto', block: 'start' })
);
await reduced.page.locator('.section-reveal--certifications.is-visible').waitFor({ state: 'attached', timeout: 2_000 });
assert.equal(await reduced.page.locator('.certification-rail').count(), 2);
assert.equal(
  await reduced.page.locator('.certification-card').first().evaluate(
    (element) => getComputedStyle(element).transitionDuration === '0s'
  ),
  true,
  'reduced motion should remove card transitions'
);
await assertNoPageOverflow(reduced.page);
await reduced.context.close();
await browser.close();
