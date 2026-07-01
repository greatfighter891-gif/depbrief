// Minimal semver handling — deliberately not the full spec (no build metadata,
// no range satisfaction). Good enough for "what kind of bump is this" between
// two concrete version strings, which is all depbrief needs.

const CORE_RE = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?/;

function parse(version) {
  const cleaned = String(version).replace(/^[\^~>=<v]+/, '').trim();
  const m = CORE_RE.exec(cleaned);
  if (!m) return null;
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    prerelease: m[4] || null,
    raw: cleaned,
  };
}

// Returns 'major' | 'minor' | 'patch' | 'none' | 'downgrade' | 'unknown'
function classifyBump(fromVersion, toVersion) {
  const from = parse(fromVersion);
  const to = parse(toVersion);
  if (!from || !to) return 'unknown';

  if (to.major > from.major) return 'major';
  if (to.major < from.major) return 'downgrade';
  if (to.minor > from.minor) return from.major === 0 ? 'major' : 'minor';
  if (to.minor < from.minor) return 'downgrade';
  if (to.patch > from.patch) return 'patch';
  if (to.patch < from.patch) return 'downgrade';
  if (from.prerelease && !to.prerelease) return 'patch';
  return 'none';
}

module.exports = { parse, classifyBump };
