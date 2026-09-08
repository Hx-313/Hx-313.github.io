import test from 'node:test';
import assert from 'node:assert/strict';
import { howIBuildData } from '../src/modules/home/presentation/how-i-build/howIBuildData.js';

test('howIBuildData exports valid frozen data for four architectural layers and narrative copy', () => {
  assert.equal(howIBuildData.label, 'How I build');
  assert.equal(howIBuildData.layers.length, 4);

  const [uiLayer, dataBackend, infraDeploy, workflowTooling] = howIBuildData.layers;

  // UI layer
  assert.equal(uiLayer.id, 'ui-layer');
  assert.equal(uiLayer.name, 'UI layer');
  assert.deepEqual(uiLayer.tools, ['Flutter', 'Android Native']);

  // Data & backend
  assert.equal(dataBackend.id, 'data-backend');
  assert.equal(dataBackend.name, 'Data & backend');
  assert.deepEqual(dataBackend.tools, ['Firebase', 'Node.js', 'MongoDB', 'Relational DBs (SQL)']);

  // Infra & deploy
  assert.equal(infraDeploy.id, 'infra-deploy');
  assert.equal(infraDeploy.name, 'Infra & deploy');
  assert.deepEqual(infraDeploy.tools, ['Vercel', 'Hostinger', 'GitHub']);

  // Workflow & tooling
  assert.equal(workflowTooling.id, 'workflow-tooling');
  assert.equal(workflowTooling.name, 'Workflow & tooling');
  assert.deepEqual(workflowTooling.tools, ['VS Code', 'Postman + Insomnia', 'Slack']);

  // Paragraphs
  assert.equal(howIBuildData.paragraphs.length, 3);
  assert.match(howIBuildData.paragraphs[0], /Every layer gets a tool chosen for what it actually has to survive/);
  assert.match(howIBuildData.paragraphs[1], /Flutter and native Android for the UI layer/);
  assert.match(howIBuildData.paragraphs[1], /98\.7% uptime isn’t an accident/);
  assert.match(howIBuildData.paragraphs[2], /Architecture decides what’s possible\. Tooling decides what’s actually reliable\./);

  // Deep freeze verification
  assert.throws(() => {
    howIBuildData.layers.push({ id: 'test' });
  }, /TypeError/);

  assert.throws(() => {
    howIBuildData.layers[0].tools.push('React');
  }, /TypeError/);
});
