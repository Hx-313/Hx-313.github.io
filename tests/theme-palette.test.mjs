import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('portfolio theme tokens mirror itHX v1.2.0 canonical palette', () => {
  const tokensCss = readFileSync(resolve('src/shared/theme/tokens.css'), 'utf8');
  const tokensJson = JSON.parse(readFileSync(resolve('src/shared/theme/tokens.json'), 'utf8'));
  const useThemeJs = readFileSync(resolve('src/shared/theme/useTheme.js'), 'utf8');
  const indexHtml = readFileSync(resolve('index.html'), 'utf8');

  // Core tokens parity
  assert.match(tokensCss, /--ithx-night-green:\s*#08130A;/);
  assert.match(tokensCss, /--ithx-primary-green:\s*#0D3736;/);
  assert.match(tokensCss, /--ithx-paper-marble:\s*#F4F2EA;/);
  assert.match(tokensCss, /--ithx-deep-surface:\s*#092322;/);
  assert.match(tokensCss, /--ithx-dark-primary-green:\s*#0A2C2B;/);
  assert.match(tokensCss, /--ithx-emerald-accent:\s*#147A5D;/);
  assert.match(tokensCss, /--ithx-mint-signal:\s*#52C7A7;/);
  assert.match(tokensCss, /--ithx-theme-border-dark:\s*#28514A;/);
  assert.match(tokensCss, /--ithx-line-dark:\s*#244944;/);

  // Status roles parity
  assert.match(tokensCss, /--ithx-warning-light:\s*#8C5800;/);
  assert.match(tokensCss, /--ithx-warning-dark:\s*#FFB951;/);
  assert.match(tokensCss, /--ithx-danger-light:\s*#9B4E45;/);
  assert.match(tokensCss, /--ithx-danger-dark:\s*#FFB4AB;/);
  assert.match(tokensCss, /--ithx-info-light:\s*#0B4F6C;/);
  assert.match(tokensCss, /--ithx-info-dark:\s*#82CFFF;/);

  // useTheme & index.html meta theme-color parity
  assert.match(useThemeJs, /dark:\s*'#08130A'/);
  assert.match(indexHtml, /<meta name="theme-color" content="#08130A" \/>/);

  // JSON mirror verification
  assert.equal(tokensJson.version, '1.2.0');
  assert.equal(tokensJson.colors.nightGreen, '#08130A');
  assert.equal(tokensJson.colors.themeBorderDark, '#28514A');
  assert.equal(tokensJson.themes.dark.background, '#08130A');
  assert.equal(tokensJson.themes.dark.border, '#28514A');
  assert.equal(tokensJson.themes.dark.warning, '#FFB951');
  assert.equal(tokensJson.themes.dark.danger, '#FFB4AB');
  assert.equal(tokensJson.themes.dark.info, '#82CFFF');
});
