import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
const skipButton = page.locator('.space-skip-btn');
if (await skipButton.count()) await skipButton.click();
await page.locator('.site-experience.is-ready').waitFor({ state: 'attached', timeout: 2_000 });

const section = page.locator('#how-i-build');
await section.scrollIntoViewIfNeeded();
const button = page.getByRole('button', { name: /Vercel/ });
const tile = button.locator('xpath=..');
await button.click();

const service = tile.locator('.tile-service');
await service.waitFor({ state: 'visible' });
await page.screenshot({ path: 'test-artifacts/how-i-build-overlay.png' });
const tileBox = await tile.boundingBox();
const serviceBox = await service.boundingBox();

assert.ok(tileBox && serviceBox, 'expanded service details should have measurable layout boxes');
assert.ok(serviceBox.height > 0, 'expanded service details should be visible');
assert.ok(
  serviceBox.y + serviceBox.height <= tileBox.y + tileBox.height + 1,
  'expanded service details must remain inside the tile instead of being clipped'
);

await context.close();
await browser.close();
