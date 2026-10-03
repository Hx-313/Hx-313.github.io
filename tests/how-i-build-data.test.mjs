import test from 'node:test';
import assert from 'node:assert/strict';
import { howIBuildData } from '../src/modules/home/presentation/how-i-build/howIBuildData.js';

test('howIBuildData exports the current benchmark grid and narrative copy', () => {
  assert.equal(howIBuildData.label, 'How I build');
  assert.equal(howIBuildData.tools.length, 15);
  assert.deepEqual(
    howIBuildData.tools.map(({ name, description }) => [name, description]),
    [
      ['Flutter', 'Cross-platform mobile development'],
      ['Android Native', 'Platform-specific builds'],
      ['Firebase', 'Backend and authentication'],
      ['Node.js', 'Server-side runtime'],
      ['MongoDB', 'Document data'],
      ['MySQL', 'Relational data'],
      ['SQLite', 'Local data storage'],
      ['AI Integration', 'Product intelligence and automation'],
      ['GitHub Actions', 'Automated delivery workflows'],
      ['Vercel', 'Frontend deployment'],
      ['Hostinger', 'Backend hosting'],
      ['GitHub', 'Version control and collaboration'],
      ['VS Code', 'Code editor'],
      ['Postman + Insomnia', 'API testing and documentation'],
      ['Slack', 'Messaging and collaboration'],
    ],
  );
  assert.deepEqual(howIBuildData.tags, [
    'MOBILE APP',
    'NATIVE MOBILE',
    'BACKEND',
    'SYSTEM DESIGN',
    'DEPLOYMENT',
    'API DESIGN',
    'DATABASE',
    'VERSION CONTROL',
  ]);

  // Paragraphs
  assert.equal(howIBuildData.paragraphs.length, 3);
  assert.match(howIBuildData.paragraphs[0], /Every layer gets a tool chosen for what it actually has to survive/);
  assert.match(howIBuildData.paragraphs[1], /Flutter and Android native for the interface people use/);
  assert.match(howIBuildData.paragraphs[2], /Architecture decides what’s possible/);

  // Deep freeze verification
  assert.throws(() => {
    howIBuildData.tools.push({ id: 'test' });
  }, /TypeError/);

  assert.throws(() => {
    howIBuildData.tools[0].name = 'React';
  }, /TypeError/);
});
