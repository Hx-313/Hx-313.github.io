import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('SystemOverviewCard displays exact required telemetry metrics', () => {
  const content = readFileSync(resolve('src/modules/home/presentation/hero/SystemOverviewCard.jsx'), 'utf-8');

  assert.ok(content.includes('SYSTEM OVERVIEW'), 'Includes card header');
  assert.ok(content.includes('ACTIVE NODES') && content.includes('08'), 'Includes Active Nodes metric');
  assert.ok(content.includes('SYSTEMS') && content.includes('14'), 'Includes Systems metric');
  assert.ok(content.includes('DEPLOYMENTS') && content.includes('12'), 'Includes Deployments metric');
  assert.ok(content.includes('INTEGRATIONS') && content.includes('26'), 'Includes Integrations metric');
  assert.ok(content.includes('UPTIME') && content.includes('99.98%'), 'Includes Uptime metric');
  assert.ok(content.includes('RESPONSE TIME') && content.includes('42ms'), 'Includes Response Time metric');
});
