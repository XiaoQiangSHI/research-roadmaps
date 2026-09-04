import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import YAML from 'yaml';
import { listRoadmaps, loadRoadmap, readStandaloneExplanations, readStandalonePapers } from '../src/lib/data.ts';

const roadmap = YAML.parse(await fs.readFile(new URL('../datasets/embodied-ai/roadmap.yaml', import.meta.url), 'utf8'));
const { papers } = YAML.parse(await fs.readFile(new URL('../datasets/embodied-ai/papers.yaml', import.meta.url), 'utf8'));
const embodiedRoadmap = await loadRoadmap('embodied-ai');
const threeDAigcRoadmap = await loadRoadmap('3d-aigc');
const institutions = embodiedRoadmap.institutions;

test('embodied AI migration preserves the source coverage', () => {
  assert.equal(roadmap.tracks.length, 7);
  assert.equal(papers.length, 60);
  assert.equal(embodiedRoadmap.papers.length, 62);
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

test('GaP and RoboTTT retain their reviewed routes, institutions, and explanations', () => {
  const gap = embodiedRoadmap.papers.find((paper) => paper.id === 'gap');
  const robottt = embodiedRoadmap.papers.find((paper) => paper.id === 'robottt');

  assert.equal(gap.track, 'agent');
  assert.deepEqual(gap.relatedTracks, ['simreal']);
  assert.deepEqual(gap.institutions.primary, ['uc-berkeley', 'nvidia']);
  assert.ok(gap.links.explanations.some((item) => item.url.endsWith('/22481629')));

  assert.equal(robottt.track, 'open');
  assert.deepEqual(robottt.relatedTracks, ['policy']);
  assert.deepEqual(robottt.institutions.primary, ['nvidia']);
  assert.ok(robottt.links.explanations.some((item) => item.url.endsWith('/22480410')));
});

test('3D AIGC includes the complete blog category with explanation links', () => {
  assert.equal(threeDAigcRoadmap.papers.length, 27);
  assert.equal(threeDAigcRoadmap.tracks.length, 6);

  const explanationUrls = threeDAigcRoadmap.papers.flatMap((paper) => (paper.links.explanations || []).map((item) => item.url));
  assert.equal(explanationUrls.length, 27);
  assert.equal(new Set(explanationUrls).size, 27);
  assert.ok(explanationUrls.every((url) => /^https:\/\/www\.cnblogs\.com\/sxq-blog\/p\/\d+$/.test(url)));
});

test('SceneSmith is classified as scene generation with an asset-generation crossover', () => {
  const scenesmith = threeDAigcRoadmap.papers.find((paper) => paper.id === 'scenesmith');
  assert.equal(scenesmith.track, 'scene-world-generation');
  assert.deepEqual(scenesmith.relatedTracks, ['object-reconstruction']);
  assert.deepEqual(scenesmith.institutions.primary, ['mit']);
  assert.deepEqual(scenesmith.institutions.collaborators, ['toyota-research']);
  assert.equal(scenesmith.links.project, 'https://scenesmith.github.io/');
  assert.equal(scenesmith.links.code, 'https://github.com/nepfaff/scenesmith');
  assert.ok(scenesmith.links.explanations.some((item) => item.url.endsWith('/22846498')));
});

test('TRELLIS series keeps recognizable project and code links', () => {
  const trellis = threeDAigcRoadmap.papers.find((paper) => paper.id === 'trellis');
  const trellis2 = threeDAigcRoadmap.papers.find((paper) => paper.id === 'trellis-2');
  assert.equal(trellis.track, 'structured-latents');
  assert.equal(trellis2.track, 'structured-latents');
  assert.equal(trellis.links.project, 'https://microsoft.github.io/TRELLIS/');
  assert.equal(trellis.links.code, 'https://github.com/Microsoft/TRELLIS');
  assert.equal(trellis2.links.project, 'https://microsoft.github.io/TRELLIS.2/');
  assert.equal(trellis2.links.code, 'https://github.com/microsoft/TRELLIS.2');
});

test('legacy blog links are exposed as explanation lists', () => {
  const legacyPaper = papers.find((paper) => paper.links.blog);
  const normalizedPaper = embodiedRoadmap.papers.find((paper) => paper.id === legacyPaper.id);
  assert.ok(Array.isArray(normalizedPaper.links.explanations));
  assert.ok(normalizedPaper.links.explanations.some((explanation) => explanation.url === legacyPaper.links.blog));
  assert.equal(normalizedPaper.links.blog, undefined);
});

test('standalone paper files can be loaded without editing the aggregate file', async (context) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'research-roadmaps-'));
  context.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.mkdir(path.join(directory, 'papers'));
  await fs.writeFile(path.join(directory, 'papers', 'example-paper.yaml'), YAML.stringify({ id: 'example-paper', title: 'Example Paper' }));

  assert.deepEqual(await readStandalonePapers(directory), [{ id: 'example-paper', title: 'Example Paper' }]);
});

test('standalone explanation files can be appended independently', async (context) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'research-roadmaps-explanation-'));
  context.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.mkdir(path.join(directory, 'explanations', 'example-paper'), { recursive: true });
  const explanation = { id: 'example-guide', paperId: 'example-paper', title: 'Example Guide', url: 'https://example.org/guide' };
  await fs.writeFile(path.join(directory, 'explanations', 'example-paper', 'example-guide.yaml'), YAML.stringify(explanation));
  assert.deepEqual(await readStandaloneExplanations(directory), [explanation]);
});

test('the catalogue includes active and empty research domains', async () => {
  const roadmaps = await listRoadmaps();
  assert.equal(roadmaps.length, 15);
  assert.equal(roadmaps[0].id, 'embodied-ai');
  assert.ok(roadmaps.some((item) => item.id === '3d-aigc' && item.papers.length === 27));
  assert.ok(roadmaps.some((item) => item.id === 'computer-vision' && item.papers.length === 0));
});

test('empty domains inherit shared institutions for first-paper contributions', async () => {
  const computerVision = await loadRoadmap('computer-vision');
  assert.equal(computerVision.papers.length, 0);
  assert.ok(computerVision.institutions.some((institution) => institution.id === 'nvidia'));
});

test('every full domain declares a reviewable category and boundary', async () => {
  const roadmaps = await listRoadmaps();
  const categories = new Set(roadmaps.map((item) => item.category));
  assert.deepEqual(categories, new Set(['task-domain', 'method-system', 'cross-cutting']));
  for (const item of roadmaps) {
    assert.ok(item.scope.include.length > 0, `${item.id} has no inclusion boundary`);
    assert.ok(item.scope.exclude.length > 0, `${item.id} has no exclusion boundary`);
    assert.ok(item.scope.relatedDomains.every((id) => roadmaps.some((candidate) => candidate.id === id)), `${item.id} has an unknown related domain`);
  }
});

test('revised empty domains separate previously mixed research problems', async () => {
  const largeLanguageModels = await loadRoadmap('large-language-models');
  assert.ok(largeLanguageModels.tracks.some((track) => track.id === 'knowledge'));
  assert.ok(largeLanguageModels.tracks.some((track) => track.id === 'adaptation'));
  const reinforcementLearning = await loadRoadmap('reinforcement-learning');
  assert.ok(reinforcementLearning.tracks.some((track) => track.id === 'offline'));
  assert.ok(reinforcementLearning.tracks.some((track) => track.id === 'imitation'));
  assert.ok(reinforcementLearning.tracks.some((track) => track.id === 'exploration'));
});
