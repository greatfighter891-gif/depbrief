const OSV_BATCH_URL = 'https://api.osv.dev/v1/querybatch';

// pairs: [{ name, version }]. Returns Map key `${name}@${version}` -> boolean (has known vuln).
async function queryVulnerabilities(pairs) {
  const result = new Map();
  if (pairs.length === 0) return result;

  const queries = pairs.map((p) => ({
    package: { name: p.name, ecosystem: 'npm' },
    version: p.version,
  }));

  const res = await fetch(OSV_BATCH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ queries }),
  });

  if (!res.ok) {
    throw new Error(`OSV.dev returned ${res.status}`);
  }

  const json = await res.json();
  const results = json.results || [];
  pairs.forEach((p, i) => {
    const entry = results[i];
    const hasVuln = Boolean(entry && Array.isArray(entry.vulns) && entry.vulns.length > 0);
    result.set(`${p.name}@${p.version}`, hasVuln);
  });
  return result;
}

module.exports = { queryVulnerabilities };
