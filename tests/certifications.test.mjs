import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const certificationsDirectory = resolve('src/modules/home/presentation/certifications');

test('certification groups preserve professional-first order and immutable records', async () => {
  const { CERTIFICATION_GROUPS } = await import(
    '../src/modules/home/presentation/certifications/certificationsData.js'
  );

  assert.deepEqual(
    CERTIFICATION_GROUPS.map((group) => group.id),
    ['professional', 'lifetime']
  );
  assert.ok(Object.isFrozen(CERTIFICATION_GROUPS));
  assert.ok(CERTIFICATION_GROUPS.every((group) => Object.isFrozen(group.records)));
  assert.ok(CERTIFICATION_GROUPS.every((group) => group.records.length > 0));

  const records = CERTIFICATION_GROUPS.flatMap((group) => group.records);
  assert.equal(records.length, 11);
  assert.equal(records.length, new Set(records.map((record) => record.id)).size);
});

test('records separate image previews from PDF documents and enumerate status values', async () => {
  const { CERTIFICATION_GROUPS } = await import(
    '../src/modules/home/presentation/certifications/certificationsData.js'
  );
  const records = CERTIFICATION_GROUPS.flatMap((group) => group.records);

  assert.ok(records.some((record) => record.preview?.type === 'image'));
  assert.ok(records.some((record) => record.preview === null));
  assert.ok(records.every((record) => ['verified', 'documented'].includes(record.status)));
  assert.ok(records.every((record) => record.document?.type === 'pdf'));
  assert.ok(records.every((record) => record.document?.href));
  assert.ok(records.every((record) => !record.title.includes('/') && !record.issuer.includes('/')));
});

test('CertificationCard exposes the preview fallback, status labels, and document action', () => {
  const cardSource = readFileSync(resolve(certificationsDirectory, 'CertificationCard.jsx'), 'utf8');

  assert.match(cardSource, /<article/);
  assert.match(cardSource, /preview\?\.type === 'image'/);
  assert.match(cardSource, /status === 'verified'/);
  assert.match(cardSource, /Verified/);
  assert.match(cardSource, /Documented/);
  assert.match(cardSource, /target="_blank"/);
  assert.match(cardSource, /rel="noreferrer"/);
  assert.match(cardSource, /View credential/);
  assert.doesNotMatch(cardSource, /Now viewing|NOW VIEWING/);
});

test('CertificationRail tracks active cards and supports keyboard scrolling', () => {
  const railSource = readFileSync(resolve(certificationsDirectory, 'CertificationRail.jsx'), 'utf8');

  assert.match(railSource, /IntersectionObserver/);
  assert.match(railSource, /scrollIntoView|scrollBy/);
  assert.match(railSource, /ArrowLeft/);
  assert.match(railSource, /ArrowRight/);
  assert.match(railSource, /disconnect\(\)/);
  assert.match(railSource, /<CertificationCard/);
  assert.doesNotMatch(railSource, /position:\s*sticky|ScrollTrigger/);
});

test('CertificationsSection renders two rails without placeholder or filter controls', () => {
  const sectionSource = readFileSync(resolve(certificationsDirectory, 'CertificationsSection.jsx'), 'utf8');
  const styles = readFileSync(resolve(certificationsDirectory, 'certifications.css'), 'utf8');

  assert.match(sectionSource, /id="certifications"/);
  assert.match(sectionSource, /CERTIFICATION_GROUPS/);
  assert.match(sectionSource, /<CertificationRail/);
  assert.doesNotMatch(sectionSource, /portfolio-placeholder|filter|button/);
  assert.match(styles, /overflow-x:\s*auto/);
  assert.match(styles, /scroll-snap-type:\s*x\s+proximity/);
  assert.match(styles, /var\(--color-surface/);
  assert.match(styles, /var\(--color-accent/);
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(styles, /:focus-visible/);
});
