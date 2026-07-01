const REGISTRY_BASE = 'https://registry.npmjs.org';

const cache = new Map();

async function fetchPackageMetadata(name) {
  if (cache.has(name)) return cache.get(name);
  const url = `${REGISTRY_BASE}/${encodeURIComponent(name).replace('%40', '@')}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) {
      const empty = null;
      cache.set(name, empty);
      return empty;
    }
    throw new Error(`npm registry returned ${res.status} for ${name}`);
  }
  const json = await res.json();
  cache.set(name, json);
  return json;
}

function getLatestVersion(meta) {
  return meta && meta['dist-tags'] ? meta['dist-tags'].latest : null;
}

function isVersionDeprecated(meta, version) {
  if (!meta || !meta.versions || !meta.versions[version]) return false;
  return Boolean(meta.versions[version].deprecated);
}

module.exports = { fetchPackageMetadata, getLatestVersion, isVersionDeprecated };
