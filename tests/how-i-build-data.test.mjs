import test from 'node:test';
import assert from 'node:assert/strict';
import {
  howIBuildContent,
  systemLayers,
  systemBuses,
  systemConnections,
  disciplines,
} from '../src/modules/home/presentation/how-i-build/howIBuildData.js';

test('howIBuildData exports valid frozen content and narrative structure', () => {
  assert.equal(howIBuildContent.chapter, '02');
  assert.equal(howIBuildContent.kicker, 'HOW I BUILD');
  assert.equal(howIBuildContent.tagline, 'SYSTEM DELIVERY MODEL');
  assert.equal(howIBuildContent.lead, 'FROM PRODUCT VISION TO PRODUCTION SYSTEM.');
  assert.ok(howIBuildContent.priorities.includes('RELIABILITY'));
  assert.ok(howIBuildContent.priorities.includes('RESILIENCE'));
  assert.ok(howIBuildContent.priorities.includes('MAINTAINABILITY'));
  assert.ok(howIBuildContent.priorities.includes('SCALE'));
  assert.equal(howIBuildContent.bridgeCta.href, '#systems');

  // Verify deep freeze
  assert.throws(() => {
    howIBuildContent.priorities.push('MUTATION');
  }, /TypeError/);
});

test('systemLayers defines 3 delivery tiers with unique node IDs', () => {
  assert.equal(systemLayers.length, 3);
  const layerIds = systemLayers.map((l) => l.id);
  assert.deepEqual(layerIds, ['experience', 'domain-data', 'operations']);

  const allNodeIds = new Set();
  for (const layer of systemLayers) {
    assert.ok(layer.nodes.length >= 4);
    for (const node of layer.nodes) {
      assert.ok(!allNodeIds.has(node.id), `Duplicate node ID: ${node.id}`);
      allNodeIds.add(node.id);
      assert.ok(node.label && node.detail);
    }
  }
  assert.equal(allNodeIds.size, 12);
});

test('systemBuses and systemConnections are first-class objects with valid references', () => {
  assert.equal(systemBuses.length, 2);
  const busIds = new Set(systemBuses.map((b) => b.id));
  assert.ok(busIds.has('events'));
  assert.ok(busIds.has('integrations'));

  const allNodeIds = new Set(systemLayers.flatMap((l) => l.nodes.map((n) => n.id)));
  const connectionIds = new Set();

  for (const conn of systemConnections) {
    assert.ok(!connectionIds.has(conn.id), `Duplicate connection ID: ${conn.id}`);
    connectionIds.add(conn.id);
    assert.ok(allNodeIds.has(conn.from), `Invalid from node ID: ${conn.from}`);
    assert.ok(allNodeIds.has(conn.to), `Invalid to node ID: ${conn.to}`);
    assert.ok(busIds.has(conn.bus), `Invalid bus ID: ${conn.bus}`);
  }
});

test('disciplines defines 4 interactive controllers with valid node and connection mappings', () => {
  assert.equal(disciplines.length, 4);
  const disciplineIds = disciplines.map((d) => d.id);
  assert.deepEqual(disciplineIds, ['build', 'architect', 'connect', 'automate']);

  const allNodeIds = new Set(systemLayers.flatMap((l) => l.nodes.map((n) => n.id)));
  const allConnIds = new Set(systemConnections.map((c) => c.id));

  for (const d of disciplines) {
    assert.ok(d.number && d.label && d.headline && d.stack && d.summary);
    assert.ok(d.activeNodeIds.length > 0);
    for (const nodeId of d.activeNodeIds) {
      assert.ok(allNodeIds.has(nodeId), `Discipline ${d.id} references invalid activeNodeId: ${nodeId}`);
    }
    for (const nodeId of d.relatedNodeIds) {
      assert.ok(allNodeIds.has(nodeId), `Discipline ${d.id} references invalid relatedNodeId: ${nodeId}`);
    }
    for (const connId of d.activeConnectionIds) {
      assert.ok(allConnIds.has(connId), `Discipline ${d.id} references invalid activeConnectionId: ${connId}`);
    }
  }
});
