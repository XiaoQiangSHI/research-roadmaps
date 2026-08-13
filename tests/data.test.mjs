import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import YAML from 'yaml';
import { listRoadmaps, loadRoadmap, readStandalonePapers } from '../src/lib/data.ts';

const roadmap = YAML.parse(await fs.readFile(new URL('../datasets/embodied-ai/roadmap.yaml', import.meta.url), 'utf8'));
const { papers } = YAML.parse(await fs.readFile(new URL('../datasets/embodied-ai/papers.yaml', import.meta.url), 'utf8'));
const embodiedRoadmap = await loadRoadmap('embodied-ai');
const institutions = embodiedRoadmap.institutions;

test('embodied AI migration preserves the source coverage', () => {
  assert.equal(roadmap.tracks.length, 7);
  assert.equal(papers.length, 60);
  assert.ok(institutions.length >= 25);
});

test('every paper has a valid institution and source', () => {
  const institutionIds = new Set(institutions.map((institution) => institution.id));
  for (const paper of papers) {
    assert.ok(paper.institutions.primary.length > 0, `${paper.id} has no primary institution`);
    assert.ok(paper.institutions.primary.every((id) => institutionIds.has(id)), `${paper.id} has an unknown institution`);
    assert.ok(paper.sources.some((source) => source.type === 'paper'), `${paper.id} has no paper source`);
  }
});

test('Prismer and AMAGO retain the reviewed institution attribution', () => {
  assert.deepEqual(papers.find((paper) => paper.id === 'prismer').institutions.primary, ['nvidia']);
  assert.deepEqual(papers.find((paper) => paper.id === 'amago').institutions.primary, ['ut-austin', 'nvidia']);
});

test('standalone paper files can be loaded without editing the aggregate file', async (context) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'research-roadmaps-'));
  context.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.mkdir(path.join(directory, 'papers'));
  await fs.writeFile(path.join(directory, 'papers', 'example-paper.yaml'), YAML.stringify({ id: 'example-paper', title: 'Example Paper' }));

  assert.deepEqual(await readStandalonePapers(directory), [{ id: 'example-paper', title: 'Example Paper' }]);
});

test('the catalogue includes active and empty research domains', async () => {
  const roadmaps = await listRoadmaps();
  assert.equal(roadmaps.length, 14);
  assert.equal(roadmaps[0].id, 'embodied-ai');
  assert.ok(roadmaps.some((item) => item.id === 'computer-vision' && item.papers.length === 0));
});

test('empty domains inherit shared institutions for first-paper contributions', async () => {
  const computerVision = await loadRoadmap('computer-vision');
  assert.equal(computerVision.papers.length, 0);
  assert.ok(computerVision.institutions.some((institution) => institution.id === 'nvidia'));
});
