// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// 👉 Replace with your real domain before deploying (used for canonical URLs + sitemap).
const SITE = 'https://YOURDOMAIN.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [react(), sitemap()],
  // Smooth cross-page fade transitions are enabled per-page via <ClientRouter/>.
  build: { inlineStylesheets: 'auto' },
});
