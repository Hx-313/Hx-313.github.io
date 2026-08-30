import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('useTheme exposes mutable light, dark, and system theme state', () => {
  const source = readFileSync(resolve('src/shared/theme/useTheme.js'), 'utf8');

  assert.match(source, /const \[theme, setTheme\] = useState/);
  assert.match(source, /document\.documentElement\.dataset\.theme = theme/);
  assert.match(source, /return \{ theme, setTheme \}/);
  assert.doesNotMatch(source, /setTheme: \(\) => \{\}/);
});
