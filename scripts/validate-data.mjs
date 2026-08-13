import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import YAML from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const datasetsDir = path.join(root, 'datasets');
const schemasDir = path.join(root, 'schemas');
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
addFormats(ajv);

const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));
const readYaml = async (file) => YAML.parse(await fs.readFile(file, 'utf8'));
const [roadmapSchema, papersSchema, institutionsSchema] = await Promise.all([
  readJson(path.join(schemasDir, 'roadmap.schema.json')),
  readJson(path.join(schemasDir, 'papers.schema.json')),
  readJson(path.join(schemasDir, 'institutions.schema.json'))
]);

const validators = {
  roadmap: ajv.compile(roadmapSchema),
  papers: ajv.compile(papersSchema),
  institutions: ajv.compile(institutionsSchema)
};

const entries = await fs.readdir(datasetsDir, { withFileTypes: true });
const datasetIds = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith('_')).map((entry) => entry.name);
const errors = [];
const fullDatasets = new Map();
const viewDatasets = [];

function validateDocument(datasetId, kind, data) {
  const valid = validators[kind](data);
  if (!valid) {
    for (const error of validators[kind].errors || []) errors.push(`${datasetId}/${kind}: ${error.instancePath || '/'} ${error.message}`);
  }
}

function duplicates(values) {
  const seen = new Set();
  return [...new Set(values.filter((value) => seen.size === seen.add(value).size))];
}

for (const datasetId of datasetIds) {
  const directory = path.join(datasetsDir, datasetId);
  const roadmap = await readYaml(path.join(directory, 'roadmap.yaml'));
  validateDocument(datasetId, 'roadmap', roadmap);
  if (roadmap.id !== datasetId) errors.push(`${datasetId}: roadmap.id must match directory name`);
  if (roadmap.kind === 'view') {
    viewDatasets.push(roadmap);
    continue;
  }

  const [papers, institutions] = await Promise.all([
    readYaml(path.join(directory, 'papers.yaml')),
    readYaml(path.join(directory, 'institutions.yaml'))
  ]);
  validateDocument(datasetId, 'papers', papers);
  validateDocument(datasetId, 'institutions', institutions);
  fullDatasets.set(datasetId, { roadmap, papers: papers.papers || [], institutions: institutions.institutions || [] });

  for (const duplicate of duplicates((papers.papers || []).map((paper) => paper.id))) errors.push(`${datasetId}: duplicate paper id ${duplicate}`);
  for (const duplicate of duplicates((papers.papers || []).map((paper) => paper.arxiv))) errors.push(`${datasetId}: duplicate arXiv id ${duplicate}`);
  for (const duplicate of duplicates((roadmap.tracks || []).map((track) => track.id))) errors.push(`${datasetId}: duplicate track id ${duplicate}`);
  for (const duplicate of duplicates((institutions.institutions || []).map((institution) => institution.id))) errors.push(`${datasetId}: duplicate institution id ${duplicate}`);

  const trackIds = new Set((roadmap.tracks || []).map((track) => track.id));
  const institutionIds = new Set((institutions.institutions || []).map((institution) => institution.id));
  for (const paper of papers.papers || []) {
    if (!trackIds.has(paper.track)) errors.push(`${datasetId}/${paper.id}: unknown track ${paper.track}`);
    for (const related of paper.relatedTracks || []) if (!trackIds.has(related)) errors.push(`${datasetId}/${paper.id}: unknown related track ${related}`);
    for (const institution of [...paper.institutions.primary, ...(paper.institutions.collaborators || [])]) {
      if (!institutionIds.has(institution)) errors.push(`${datasetId}/${paper.id}: unknown institution ${institution}`);
    }
    const sourceUrls = new Set(paper.sources.map((source) => source.url));
    if (!sourceUrls.has(paper.links.paper)) errors.push(`${datasetId}/${paper.id}: paper link must also appear in sources`);
  }
}

for (const view of viewDatasets) {
  const source = fullDatasets.get(view.source);
  if (!source) {
    errors.push(`${view.id}: unknown or non-full source dataset ${view.source}`);
    continue;
  }
  const trackIds = new Set(source.roadmap.tracks.map((track) => track.id));
  for (const track of view.includeTracks) if (!trackIds.has(track)) errors.push(`${view.id}: source ${view.source} has no track ${track}`);
}

if (errors.length) {
  console.error(`Data validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const paperCount = [...fullDatasets.values()].reduce((sum, dataset) => sum + dataset.papers.length, 0);
console.log(`Validated ${fullDatasets.size} full dataset(s), ${viewDatasets.length} view(s), and ${paperCount} paper records.`);
