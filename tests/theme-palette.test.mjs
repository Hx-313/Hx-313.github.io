import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('portfolio theme tokens mirror itHX v2.0.0 canonical palette', () => {
  const tokensCss = readFileSync(resolve('src/shared/theme/tokens.css'), 'utf8');
  const tokensJson = JSON.parse(readFileSync(resolve('src/shared/theme/tokens.json'), 'utf8'));
  const useThemeJs = readFileSync(resolve('src/shared/theme/useTheme.js'), 'utf8');
  const indexHtml = readFileSync(resolve('index.html'), 'utf8');

  // Core tokens parity (itHX Palette System 2.0.0)
  assert.match(tokensCss, /--ithx-night-green:\s*#08130A;/);
  assert.match(tokensCss, /--ithx-primary-green:\s*#0F352E;/);
  assert.match(tokensCss, /--ithx-paper-marble:\s*#F3F4EE;/);
  assert.match(tokensCss, /--ithx-deep-surface:\s*#092420;/);
  assert.match(tokensCss, /--ithx-edge-green:\s*#205047;/);
  assert.match(tokensCss, /--ithx-sage-mist:\s*#93B2A8;/);
  assert.match(tokensCss, /--ithx-action-cream:\s*#F5EAD7;/);
  assert.match(tokensCss, /--ithx-border-light:\s*#D4DED7;/);
  assert.match(tokensCss, /--ithx-border-dark:\s*#1A2E28;/);
  assert.match(tokensCss, /--ithx-canvas-muted:\s*#4F6B63;/);

  // Status roles parity
  assert.match(tokensCss, /--ithx-warning-canvas:\s*#8C5800;/);
  assert.match(tokensCss, /--ithx-warning-surface:\s*#FFB74D;/);
  assert.match(tokensCss, /--ithx-danger-canvas:\s*#BA1A1A;/);
  assert.match(tokensCss, /--ithx-danger-surface:\s*#FF6B5F;/);
  assert.match(tokensCss, /--ithx-info-canvas:\s*#0B4F6C;/);
  assert.match(tokensCss, /--ithx-info-surface:\s*#82CFFF;/);

  // useTheme & index.html meta theme-color parity
  assert.match(useThemeJs, /meta\[name="theme-color"\]/);
  assert.match(indexHtml, /<meta name="theme-color"/);

  // JSON mirror verification
  assert.equal(tokensJson.version, '2.0.0');
  assert.equal(tokensJson.colors.nightGreen, '#08130A');
  assert.equal(tokensJson.colors.primaryGreen, '#0F352E');
  assert.equal(tokensJson.colors.themeBorderDark, '#205047');
  assert.equal(tokensJson.themes.dark.background, '#08130A');
  assert.equal(tokensJson.themes.dark.border, '#1A2E28');
  assert.equal(tokensJson.themes.dark.warning, '#FFB74D');
  assert.equal(tokensJson.themes.dark.danger, '#FF6B5F');
  assert.equal(tokensJson.themes.dark.info, '#82CFFF');
});
