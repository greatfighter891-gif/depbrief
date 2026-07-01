# depbrief

One verdict per dependency upgrade — semver bump class, known vulnerabilities, deprecation status. No GitHub App to install, no account, no config.

```
$ npx depbrief

[AVOID]    lodash 4.17.20 -> 4.17.21 (patch)
           - the version you would upgrade to has a known unpatched vulnerability
[REVIEW]   express 4.18.2 -> 5.0.0 (major)
           - major version bump — breaking changes are likely, check the changelog
[URGENT]   axios 0.21.1 -> 0.21.4 (patch)
           - current version has a known vulnerability — upgrading resolves it
[SAFE]     chalk 5.2.0 -> 5.3.0 (minor)
           - minor bump, no known vulnerabilities, not deprecated

4 of 41 dependencies have updates available (37 already up to date).
```

## Why

`npm outdated` tells you what's outdated. `npm audit` tells you what's *currently* vulnerable. Neither tells you, in one line, whether upgrading from A to B is the kind of thing you can merge without looking, or the kind of thing that needs a human. Renovate and Dependabot solve this well but require installing a GitHub App and living in PRs — `depbrief` is the same idea as a 2-second local command, for the moment before you even open one.

## What it checks, per dependency

- **Semver bump class** — patch / minor / major (0.x minor bumps are treated as major, since semver itself makes no compatibility promise below 1.0).
- **Known vulnerabilities** — queries [OSV.dev](https://osv.dev) (free, no API key) for both the current and target version.
- **Deprecation** — checks whether the target version is marked deprecated on the npm registry.

These combine into one of five verdicts, worst first: `AVOID` (target itself has a known vuln) > `URGENT` (current version has a known vuln) > `REVIEW` (major bump) > `CAUTION` (deprecated target, or a downgrade) > `SAFE`.

## Install / usage

```bash
# scan the current project's package.json + lockfile
npx depbrief

# check one upgrade directly, no project needed
npx depbrief express 4.18.2 5.0.0

# machine-readable output
npx depbrief --json

# CI gate: fail the build on anything AVOID or URGENT
npx depbrief --fail-on AVOID,URGENT
```

Needs network access (npm registry + OSV.dev, both public and free). Zero runtime dependencies — uses Node's built-in `fetch`.

## Limitations (v1)

- Semver parsing is deliberately minimal (no build-metadata, no range satisfaction) — it classifies two concrete versions, it doesn't resolve ranges.
- No changelog summarization yet — verdicts are based on structured signals (bump class, OSV, deprecation), not parsed release notes. That's a reasonable v2 direction if there's demand.

## Contributing

Issues and PRs welcome. Decision logic lives in `lib/verdict.js` and `lib/semver.js`, both pure/offline and unit tested — network I/O is isolated in `lib/npmRegistry.js` and `lib/osv.js`.

## License

MIT
