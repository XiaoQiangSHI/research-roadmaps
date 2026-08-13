import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

export type EvolutionStage = { id: string; label: string };
export type DomainCategory = 'task-domain' | 'method-system' | 'cross-cutting';
export type DomainScope = { include: string[]; exclude: string[]; relatedDomains: string[] };
export type Track = {
  id: string;
  index: string;
  name: string;
  color: string;
  problem: string;
  evolution: EvolutionStage[];
};

export type Institution = {
  id: string;
  name: string;
  shortName: string;
  type: 'company' | 'university' | 'research-institute' | 'community';
  website?: string;
  logo: { kind: 'brand' | 'text'; value: string };
};

export type Paper = {
  id: string;
  title: string;
  date: string;
  arxiv: string;
  track: string;
  relatedTracks?: string[];
  stage?: string;
  summary: string;
  problem: string;
  solution: string;
  institutions: { primary: string[]; collaborators?: string[] };
  links: { paper: string; project?: string; code?: string; blog?: string };
  classification: { confidence: 'high' | 'medium' | 'low' | 'editorial'; rationale: string };
  sources: Array<{ type: string; url: string }>;
};

type FullRoadmapFile = {
  id: string;
  name: string;
  description: string;
  kind: 'full';
  category: DomainCategory;
  scope: DomainScope;
  period: { start: string; end: string };
  tracks: Track[];
  editorial?: { note?: string; maintainers?: string[] };
};

type ViewRoadmapFile = {
  id: string;
  name: string;
  description: string;
  kind: 'view';
  source: string;
  includeTracks: string[];
  category?: DomainCategory;
  scope?: DomainScope;
  editorial?: { note?: string; maintainers?: string[] };
};

type RoadmapFile = FullRoadmapFile | ViewRoadmapFile;

export type ResolvedRoadmap = {
  id: string;
  name: string;
  description: string;
  kind: 'full' | 'view';
  category?: DomainCategory;
  scope?: DomainScope;
  source?: string;
  period: { start: string; end: string };
  tracks: Track[];
  papers: Paper[];
  institutions: Institution[];
  editorial?: { note?: string; maintainers?: string[] };
};

const datasetsDir = path.resolve(process.cwd(), 'datasets');

async function readYaml<T>(filePath: string): Promise<T> {
  return YAML.parse(await fs.readFile(filePath, 'utf8')) as T;
}

async function readOptionalYaml<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return await readYaml<T>(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return fallback;
    throw error;
  }
}

function mergeInstitutions(shared: Institution[], local: Institution[]): Institution[] {
  const institutions = new Map(shared.map((institution) => [institution.id, institution]));
  for (const institution of local) institutions.set(institution.id, institution);
  return [...institutions.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function readStandalonePapers(datasetDir: string): Promise<Paper[]> {
  const papersDir = path.join(datasetDir, 'papers');
  let entries;
  try {
    entries = await fs.readdir(papersDir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  return Promise.all(entries
    .filter((entry) => entry.isFile() && /\.ya?ml$/i.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => readYaml<Paper>(path.join(papersDir, entry.name))));
}

export async function listRoadmapIds(): Promise<string[]> {
  const entries = await fs.readdir(datasetsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
    .map((entry) => entry.name)
    .sort();
}

async function readRoadmapFile(id: string): Promise<RoadmapFile> {
  return readYaml<RoadmapFile>(path.join(datasetsDir, id, 'roadmap.yaml'));
}

export async function loadRoadmap(id: string): Promise<ResolvedRoadmap> {
  const definition = await readRoadmapFile(id);
  if (definition.kind === 'view') {
    const source = await loadRoadmap(definition.source);
    const included = new Set(definition.includeTracks);
    const tracks = source.tracks.filter((track) => included.has(track.id));
    const papers = source.papers.filter((paper) => included.has(paper.track));
    const usedInstitutions = new Set(papers.flatMap((paper) => [
      ...paper.institutions.primary,
      ...(paper.institutions.collaborators || [])
    ]));
    return {
      ...definition,
      category: definition.category || source.category,
      scope: definition.scope || source.scope,
      period: source.period,
      tracks,
      papers,
      institutions: source.institutions.filter((institution) => usedInstitutions.has(institution.id))
    };
  }

  const datasetDir = path.join(datasetsDir, id);
  const [{ papers }, standalonePapers, sharedInstitutions, localInstitutions] = await Promise.all([
    readOptionalYaml<{ papers: Paper[] }>(path.join(datasetDir, 'papers.yaml'), { papers: [] }),
    readStandalonePapers(datasetDir),
    readOptionalYaml<{ institutions: Institution[] }>(path.join(datasetsDir, '_shared', 'institutions.yaml'), { institutions: [] }),
    readOptionalYaml<{ institutions: Institution[] }>(path.join(datasetDir, 'institutions.yaml'), { institutions: [] })
  ]);
  return {
    ...definition,
    papers: [...papers, ...standalonePapers].sort((a, b) => a.date.localeCompare(b.date)),
    institutions: mergeInstitutions(sharedInstitutions.institutions, localInstitutions.institutions)
  };
}

export async function listRoadmaps(): Promise<ResolvedRoadmap[]> {
  const roadmaps = await Promise.all((await listRoadmapIds()).map(loadRoadmap));
  return roadmaps.sort((a, b) => b.papers.length - a.papers.length || a.name.localeCompare(b.name, 'zh-CN'));
}
