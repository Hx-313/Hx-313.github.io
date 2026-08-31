import test from 'node:test';
import assert from 'node:assert/strict';
import { getMobileProjectionBounds } from '../src/modules/home/presentation/opening/openingMobileGeometry.js';

test('mobile projection panel bounds stay inside the viewport at phone and short-phone sizes', () => {
  for (const [width, height] of [[390, 844], [375, 667], [320, 568]]) {
    const bounds = getMobileProjectionBounds(width, height);

    assert.ok(bounds.left >= 0, `${width}px panel should not start outside the viewport`);
    assert.ok(bounds.top >= 0, `${height}px panel should not start above the viewport`);
    assert.ok(bounds.right <= width, `${width}px panel should not overflow the right edge`);
    assert.ok(bounds.bottom <= height, `${height}px panel should not overflow the bottom edge`);
    assert.equal(bounds.width, width * 0.9, 'the readable panel keeps the 90vw mobile width');
  }
});
