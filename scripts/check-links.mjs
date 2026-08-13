import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const datasetsDir = path.join(root, 'datasets');
const directories = (await fs.readdir(datasetsDir, { withFileTypes: true })).filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'));
const urls = new Set();

for (const directory of directories) {
  const papersPath = path.join(datasetsDir, directory.name, 'papers.yaml');
  try {
    const { papers } = YAML.parse(await fs.readFile(papersPath, 'utf8'));
    for (const paper of papers) for (const source of paper.sources) urls.add(source.url);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

const failures = [];
const queue = [...urls];

async function request(url, method) {
  const response = await fetch(url, {
    method,
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
    headers: {
      'user-agent': 'Open-Research-Roadmaps-Link-Checker/0.1',
      ...(method === 'GET' ? { range: 'bytes=0-0' } : {})
    }
  });
  if (method === 'GET') await response.body?.cancel();
  return response;
}

const workers = Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const url = queue.shift();
    try {
      let response;
      try {
        response = await request(url, 'HEAD');
      } catch {
        response = await request(url, 'GET');
      }
      if (!response.ok && response.status !== 403) {
        response = await request(url, 'GET');
        if (!response.ok && response.status !== 403) failures.push(`${response.status} ${url}`);
      }
    } catch (error) {
      failures.push(`${error.name}: ${error.message} ${url}`);
    }
  }
});

await Promise.all(workers);
if (failures.length) {
  console.error(`Found ${failures.length} link issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Checked ${urls.size} source links.`);
