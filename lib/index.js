const { loadProject } = require('./discover');
const { fetchPackageMetadata, getLatestVersion, isVersionDeprecated } = require('./npmRegistry');
const { queryVulnerabilities } = require('./osv');
const { computeVerdict } = require('./verdict');

const CONCURRENCY = 8;

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function analyzeDependency(name, from, to) {
  const meta = await fetchPackageMetadata(name);
  const targetDeprecated = meta ? isVersionDeprecated(meta, to) : false;

  const vulnMap = await queryVulnerabilities([
    { name, version: from },
    { name, version: to },
  ]);

  return computeVerdict({
    name,
    from,
    to,
    currentHasVuln: vulnMap.get(`${name}@${from}`) || false,
    targetHasVuln: vulnMap.get(`${name}@${to}`) || false,
    targetDeprecated,
  });
}

async function analyzePair(name, from, to) {
  return [await analyzeDependency(name, from, to)];
}

async function analyzeProject(dir) {
  const project = loadProject(dir);
  if (!project) return null;

  const entries = [...project.installed.entries()];
  const withLatest = await mapWithConcurrency(entries, CONCURRENCY, async ([name, current]) => {
    const meta = await fetchPackageMetadata(name);
    const latest = meta ? getLatestVersion(meta) : null;
    return { name, current, latest };
  });

  const toCheck = withLatest.filter((d) => d.latest && d.latest !== d.current);

  const results = await mapWithConcurrency(toCheck, CONCURRENCY, ({ name, current, latest }) =>
    analyzeDependency(name, current, latest)
  );

  return { results, upToDateCount: withLatest.length - toCheck.length, totalCount: withLatest.length };
}

module.exports = { analyzeProject, analyzePair };
