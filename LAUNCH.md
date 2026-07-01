# Launch checklist & copy

Fill in `<GITHUB_URL>` once the repo is public.

## 0. Prerequisites — DONE (2026-07-01)
- [x] GitHub repo live: https://github.com/greatfighter891-gif/depbrief
- [x] Published to npm: https://www.npmjs.com/package/depbrief — verified `npx depbrief@latest` installs and runs correctly from the registry.

## 1. Show HN — ON HOLD
New accounts are temporarily gated from posting Show HN (HN's anti-spam measure during a signup surge). Plan: participate normally on HN for a while (comments on other posts) to build a bit of history, then retry. Not urgent — revisit later.

**Title (must be ≤80 chars for HN), for whenever we retry:** Show HN: depbrief - a verdict for each dependency upgrade (vulns, semver)

**Body:**
> `npm outdated` tells you what's outdated. `npm audit` tells you what's currently vulnerable. Neither tells you, in one line, whether upgrading from version A to B is safe to merge blind or needs a human to look. Renovate/Dependabot solve this but need a GitHub App installed and live in your PR flow — I wanted the same signal as a 2-second local command before that.
>
> `npx depbrief` scans your package.json + lockfile, hits the npm registry and OSV.dev (both free, no auth) for each outdated dependency, and prints one verdict: AVOID / URGENT / REVIEW / CAUTION / SAFE, with the reason. `npx depbrief <pkg> <from> <to>` checks one upgrade directly without a project.
>
> Zero runtime dependencies. Feedback and false-positive reports very welcome — v0.1.
>
> GitHub: <GITHUB_URL>

## 2. r/node — POSTED (2026-07-01)
https://www.reddit.com/r/node/comments/1ukybss/built_a_cli_that_gives_a_plain_verdict_on_whether/

**Title:** Built a CLI that gives a plain verdict on whether a dependency upgrade is safe

**Body:**
> Same idea as `npm outdated` + `npm audit` combined into one per-package verdict, plus semver bump classification. `npx depbrief` in any repo. No GitHub App, no config, no dependencies. <GITHUB_URL>

## 3. dev.to (SEO article)
**Title:** npm outdated tells you what changed. It doesn't tell you if it's safe.

Outline:
1. The gap: `npm outdated`/`npm audit` each give one slice; deciding "should I merge this bump" still requires manual changelog reading.
2. What a good verdict needs: bump class, vuln status of *both* versions (not just current — the lodash 4.17.21 example is a good hook, since even the latest version has known unpatched GHSA advisories), deprecation.
3. Introduce depbrief, walk through the lodash/left-pad examples from the README.
4. CTA: `npx depbrief`, link to GitHub.

## Distribution notes
- Same organic-only plan as the mandate requires (no existing audience): npm/GitHub discoverability + Show HN + subreddits + one SEO article.
- The lodash 4.17.21-still-has-known-CVEs example is a strong, concrete hook for the HN/Reddit posts — leads with a surprising, verifiable fact rather than an abstract pitch.
- Track signal: GitHub stars, npm weekly downloads, issues asking for a GitHub Action / CI mode (`--fail-on` already exists for this — if there's demand, a prebuilt GitHub Action wrapping it is the natural paid-tier-adjacent next step, though the CLI itself should stay free).
