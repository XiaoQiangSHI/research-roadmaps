import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.resolve(root, '..', 'embodied-ai-paper-roadmap', 'index.html');
const outputDir = path.join(root, 'datasets', 'embodied-ai');

function readLiteral(source, name) {
  const marker = `const ${name} =`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Cannot find ${name} in legacy source`);
  const valueStart = source.indexOf(source.slice(start + marker.length).match(/[\[{]/)?.[0] || '', start + marker.length);
  const opening = source[valueStart];
  const closing = opening === '[' ? ']' : '}';
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let index = valueStart; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === "'" || character === '"' || character === '`') {
      quote = character;
      continue;
    }
    if (character === opening) depth += 1;
    if (character === closing) depth -= 1;
    if (depth === 0) return vm.runInNewContext(`(${source.slice(valueStart, index + 1)})`);
  }
  throw new Error(`Unclosed literal for ${name}`);
}

function slug(value) {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/π/g, 'pi')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'paper';
}

const institutionCatalog = [
  ['nvidia', 'NVIDIA', 'NVIDIA', 'company', 'brand', 'nvidia'],
  ['stanford', 'Stanford University', 'Stanford', 'university', 'text', 'SU'],
  ['caltech', 'California Institute of Technology', 'Caltech', 'university', 'text', 'CIT'],
  ['ut-austin', 'The University of Texas at Austin', 'UT Austin', 'university', 'text', 'UT'],
  ['imperial', 'Imperial College London', 'Imperial', 'university', 'text', 'ICL'],
  ['georgia-tech', 'Georgia Institute of Technology', 'Georgia Tech', 'university', 'text', 'GT'],
  ['uc-berkeley', 'University of California, Berkeley', 'UC Berkeley', 'university', 'text', 'UCB'],
  ['cmu', 'Carnegie Mellon University', 'CMU', 'university', 'text', 'CMU'],
  ['nyu', 'New York University', 'NYU', 'university', 'text', 'NYU'],
  ['upenn', 'University of Pennsylvania', 'UPenn', 'university', 'text', 'Penn'],
  ['umich', 'University of Michigan', 'Michigan', 'university', 'text', 'UM'],
  ['umass-amherst', 'University of Massachusetts Amherst', 'UMass', 'university', 'text', 'UM'],
  ['uw-madison', 'University of Wisconsin–Madison', 'UW–Madison', 'university', 'text', 'UW'],
  ['columbia', 'Columbia University', 'Columbia', 'university', 'text', 'CU'],
  ['sjtu', 'Shanghai Jiao Tong University', 'SJTU', 'university', 'text', 'SJTU'],
  ['tsinghua', 'Tsinghua University', 'Tsinghua', 'university', 'text', 'THU'],
  ['ustc', 'University of Science and Technology of China', 'USTC', 'university', 'text', 'USTC'],
  ['nus', 'National University of Singapore', 'NUS', 'university', 'text', 'NUS'],
  ['university-of-toronto', 'University of Toronto', 'U of T', 'university', 'text', 'UofT'],
  ['qizhi', 'Shanghai Qi Zhi Institute', 'Qi Zhi', 'research-institute', 'text', '期智'],
  ['kit', 'Karlsruhe Institute of Technology', 'KIT', 'research-institute', 'text', 'KIT'],
  ['physical-intelligence', 'Physical Intelligence', 'Physical Intelligence', 'company', 'text', 'π'],
  ['hugging-face', 'Hugging Face', 'Hugging Face', 'company', 'brand', 'huggingface'],
  ['bytedance', 'ByteDance', 'ByteDance', 'company', 'brand', 'bytedance'],
  ['alibaba', 'Alibaba Tongyi Lab', 'Alibaba Tongyi', 'company', 'brand', 'alibabacloud'],
  ['robbyant', 'Robbyant / Ant Group', 'Robbyant', 'company', 'text', '灵波'],
  ['horizon-robotics', 'Horizon Robotics', 'Horizon', 'company', 'text', '地平线'],
  ['wuwen-ai', 'WuwenAI', 'WuwenAI', 'company', 'text', '无问'],
  ['galbot', 'Galbot', 'Galbot', 'company', 'text', 'Galbot'],
  ['allen-ai', 'Allen Institute for AI', 'Ai2', 'research-institute', 'text', 'Ai2'],
  ['toyota-research', 'Toyota Research Institute', 'TRI', 'research-institute', 'text', 'TRI']
].map(([id, name, shortName, type, kind, value]) => ({ id, name, shortName, type, logo: { kind, value } }));

const primaryMap = {
  NVIDIA: ['nvidia'], Stanford: ['stanford'], Imperial: ['imperial'], UT: ['ut-austin'], 'UT+NV': ['ut-austin', 'nvidia'],
  Qizhi: ['qizhi'], UMass: ['umass-amherst'], CMU: ['cmu'], PI: ['physical-intelligence'], Berkeley: ['uc-berkeley'],
  HF: ['hugging-face'], SJTU: ['sjtu'], NUS: ['nus'], ByteDance: ['bytedance'], Alibaba: ['alibaba'],
  Robbyant: ['robbyant'], USTC: ['ustc'], KIT: ['kit'], Horizon: ['horizon-robotics']
};

const collaboratorMatchers = [
  ['NVIDIA', 'nvidia'], ['Caltech', 'caltech'], ['Stanford', 'stanford'], ['UT Austin', 'ut-austin'],
  ['Imperial', 'imperial'], ['Georgia Tech', 'georgia-tech'], ['UC Berkeley', 'uc-berkeley'], ['CMU', 'cmu'],
  ['Carnegie Mellon', 'cmu'], ['NYU', 'nyu'], ['UPenn', 'upenn'], ['University of Pennsylvania', 'upenn'],
  ['University of Michigan', 'umich'], ['UMass', 'umass-amherst'], ['UW Madison', 'uw-madison'], ['Columbia', 'columbia'],
  ['上海交通大学', 'sjtu'], ['SJTU', 'sjtu'], ['清华大学', 'tsinghua'], ['中国科学技术大学', 'ustc'],
  ['National University of Singapore', 'nus'], ['University of Toronto', 'university-of-toronto'], ['上海期智研究院', 'qizhi'],
  ['Karlsruhe', 'kit'], ['Physical Intelligence', 'physical-intelligence'], ['Hugging Face', 'hugging-face'],
  ['字节跳动', 'bytedance'], ['阿里巴巴', 'alibaba'], ['通义', 'alibaba'], ['蚂蚁集团', 'robbyant'],
  ['地平线机器人', 'horizon-robotics'], ['无问芯穹', 'wuwen-ai'], ['Galbot', 'galbot'],
  ['Allen Institute', 'allen-ai'], ['Toyota Research Institute', 'toyota-research']
];

const source = await fs.readFile(sourcePath, 'utf8');
const routes = readLiteral(source, 'routes');
const paperRows = readLiteral(source, 'paperRows');
const blogByArxiv = readLiteral(source, 'blogByArxiv');
const institutionByArxiv = readLiteral(source, 'institutionByArxiv');

const tracks = routes.map((route) => ({
  id: route.id,
  index: route.index,
  name: route.name,
  color: route.color,
  problem: route.problem,
  evolution: route.evolution.split(' → ').map((label, index) => ({ id: `${route.id}-${String(index + 1).padStart(2, '0')}`, label }))
}));

const usedIds = new Set();
const papers = paperRows.map(([date, title, track, summary, problem, solution, arxiv, directBlog]) => {
  const baseId = slug(title);
  let id = baseId;
  let suffix = 2;
  while (usedIds.has(id)) id = `${baseId}-${suffix++}`;
  usedIds.add(id);
  const [primaryKey, institutionLabel] = institutionByArxiv[arxiv];
  const primary = [...(primaryMap[primaryKey] || [])];
  const collaborators = [];
  for (const [needle, institutionId] of collaboratorMatchers) {
    if (institutionLabel.includes(needle) && !primary.includes(institutionId) && !collaborators.includes(institutionId)) collaborators.push(institutionId);
  }
  const blog = directBlog || (blogByArxiv[arxiv] ? `https://www.cnblogs.com/sxq-blog/p/${blogByArxiv[arxiv]}` : undefined);
  const links = { paper: `https://arxiv.org/abs/${arxiv}` };
  if (blog) links.blog = blog;
  return {
    id,
    title,
    date,
    arxiv,
    track,
    summary,
    problem,
    solution,
    institutions: { primary, ...(collaborators.length ? { collaborators } : {}) },
    links,
    classification: {
      confidence: 'editorial',
      rationale: `该工作的主要贡献与“${routes.find((route) => route.id === track).name}”线路最直接相关。`
    },
    sources: [
      { type: 'paper', url: links.paper },
      ...(blog ? [{ type: 'blog', url: blog }] : [])
    ]
  };
});

const roadmap = {
  id: 'embodied-ai',
  name: '具身智能论文发展路线图',
  description: '沿时间轴梳理具身智能的数据、策略、世界模型、控制、仿真迁移、智能体与开放世界研究线路。',
  kind: 'full',
  period: { start: '2022-01-01', end: '2026-08-01' },
  tracks,
  editorial: {
    note: '每篇论文只指定一条主线路；路线归属是便于理解技术演进的编辑判断。',
    maintainers: ['Open Research Roadmaps maintainers']
  }
};

await fs.mkdir(outputDir, { recursive: true });
await Promise.all([
  fs.writeFile(path.join(outputDir, 'roadmap.yaml'), YAML.stringify(roadmap, { lineWidth: 0 })),
  fs.writeFile(path.join(outputDir, 'papers.yaml'), YAML.stringify({ papers }, { lineWidth: 0 })),
  fs.writeFile(path.join(outputDir, 'institutions.yaml'), YAML.stringify({ institutions: institutionCatalog }, { lineWidth: 0 })),
  fs.writeFile(path.join(outputDir, 'references.yaml'), YAML.stringify({ generatedFrom: '../embodied-ai-paper-roadmap/index.html', generatedAt: new Date().toISOString(), note: '论文级来源记录在 papers.yaml 的 sources 字段。' }, { lineWidth: 0 }))
]);

console.log(`Migrated ${papers.length} papers, ${tracks.length} tracks and ${institutionCatalog.length} institutions.`);
