import test from 'node:test';
import assert from 'node:assert/strict';
import { buildConstellationArtifacts } from '../src/modules/home/presentation/hero/constellationData.js';

test('builds one constellation artifact per project with stable layout classes', () => {
  const artifacts = buildConstellationArtifacts([
    { id: 'wos', name: 'WOS', category: 'Restaurant technology', status: 'production', featured: true },
    { id: 'dietify', name: 'Dietify', category: 'Health', status: 'shipped' },
  ]);

  assert.deepEqual(artifacts, [
    { id: 'wos', name: 'WOS', category: 'Restaurant technology', status: 'production', className: 'artifact--wos', featured: true },
    { id: 'dietify', name: 'Dietify', category: 'Health', status: 'shipped', className: 'artifact--dietify', featured: false },
  ]);
});
