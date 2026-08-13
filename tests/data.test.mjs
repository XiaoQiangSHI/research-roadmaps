import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import YAML from 'yaml';

const roadmap = YAML.parse(await fs.readFile(new URL('../datasets/embodied-ai/roadmap.yaml', import.meta.url), 'utf8'));
const { papers } = YAML.parse(await fs.readFile(new URL('../datasets/embodied-ai/papers.yaml', import.meta.url), 'utf8'));
const { institutions } = YAML.parse(await fs.readFile(new URL('../datasets/embodied-ai/institutions.yaml', import.meta.url), 'utf8'));

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
