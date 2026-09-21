import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const certificationsDirectory = resolve('src/modules/home/presentation/certifications');

test('certification records preserve manifest order and immutable records', async () => {
  const { CERTIFICATION_RECORDS } = await import(
    '../src/modules/home/presentation/certifications/certificationsData.js'
  );

  assert.ok(Object.isFrozen(CERTIFICATION_RECORDS));
  assert.equal(CERTIFICATION_RECORDS.length, 11);
  assert.equal(CERTIFICATION_RECORDS.length, new Set(CERTIFICATION_RECORDS.map((record) => record.id)).size);
  assert.equal(CERTIFICATION_RECORDS[0].id, 'certiport-java');
  assert.equal(CERTIFICATION_RECORDS.at(-1).id, 'wifaq-ul-madaris-hifz');
});

test('records use the new PNG assets for both previews and credential links', async () => {
  const { CERTIFICATION_RECORDS } = await import(
    '../src/modules/home/presentation/certifications/certificationsData.js'
  );
  const records = CERTIFICATION_RECORDS;

  assert.ok(records.every((record) => record.preview?.type === 'image'));
  assert.ok(records.every((record) => ['verified', 'documented'].includes(record.status)));
  assert.ok(records.every((record) => record.document?.type === 'image'));
  assert.ok(records.every((record) => /\.(webp|png)$/.test(record.document?.href)));
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

test('CertificationsSection renders one sequential rail without categories or filter controls', () => {
  const sectionSource = readFileSync(resolve(certificationsDirectory, 'CertificationsSection.jsx'), 'utf8');
  const railSource = readFileSync(resolve(certificationsDirectory, 'CertificationRail.jsx'), 'utf8');
  const styles = readFileSync(resolve(certificationsDirectory, 'certifications.css'), 'utf8');

  assert.match(sectionSource, /id="certifications"/);
  assert.match(sectionSource, /CERTIFICATION_RECORDS/);
  assert.match(sectionSource, /<CertificationRail/);
  assert.doesNotMatch(sectionSource, /professional|lifetime/i);
  assert.doesNotMatch(railSource, /group|Professional certifications|Lifetime achievements/);
  assert.doesNotMatch(sectionSource, /portfolio-placeholder|filter|button/);
  assert.match(styles, /overflow-x:\s*auto/);
  assert.match(styles, /scrollbar-width:\s*none/);
  assert.match(styles, /::-webkit-scrollbar[\s\S]*display:\s*none/);
  assert.match(styles, /scroll-snap-type:\s*x\s+proximity/);
  assert.match(styles, /var\(--color-surface/);
  assert.match(styles, /var\(--color-accent/);
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(styles, /:focus-visible/);
});
