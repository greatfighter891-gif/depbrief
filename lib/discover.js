const fs = require('fs');
const path = require('path');

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function depNamesFromPackageJson(pkg) {
  return Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
}

// Returns Map<name, installedVersion> using whatever source is available,
// preferring the lockfile (exact resolved versions) over node_modules.
function resolveInstalledVersions(dir, names) {
  const resolved = new Map();

  const lock = readJson(path.join(dir, 'package-lock.json'));
  if (lock && lock.packages) {
    // npm lockfileVersion 2/3
    for (const name of names) {
      const entry = lock.packages[`node_modules/${name}`];
      if (entry && entry.version) resolved.set(name, entry.version);
    }
  } else if (lock && lock.dependencies) {
    // npm lockfileVersion 1
    for (const name of names) {
      const entry = lock.dependencies[name];
      if (entry && entry.version) resolved.set(name, entry.version);
    }
  }

  for (const name of names) {
    if (resolved.has(name)) continue;
    const pkgJsonPath = path.join(dir, 'node_modules', name, 'package.json');
    const pkg = readJson(pkgJsonPath);
    if (pkg && pkg.version) resolved.set(name, pkg.version);
  }

  return resolved;
}

function loadProject(dir) {
  const pkg = readJson(path.join(dir, 'package.json'));
  if (!pkg) return null;
  const names = depNamesFromPackageJson(pkg);
  const installed = resolveInstalledVersions(dir, names);
  return { names, installed };
}

module.exports = { loadProject };
