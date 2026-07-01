const { classifyBump } = require('./semver');

/**
 * Pure decision logic — no network I/O — so it's unit-testable with
 * plain fixture objects.
 *
 * input: {
 *   name, from, to,
 *   currentHasVuln: boolean,   // known OSV vuln affects the *current* version
 *   targetHasVuln: boolean,    // known OSV vuln affects the *target* version
 *   targetDeprecated: boolean, // npm registry marks target version deprecated
 * }
 */
function computeVerdict(input) {
  const bump = classifyBump(input.from, input.to);
  const reasons = [];

  if (input.targetHasVuln) {
    reasons.push('the version you would upgrade to has a known unpatched vulnerability');
    return { name: input.name, from: input.from, to: input.to, bump, verdict: 'AVOID', reasons };
  }

  if (input.currentHasVuln) {
    reasons.push('current version has a known vulnerability — upgrading resolves it');
    if (bump === 'major') reasons.push('this is also a major version bump — review the changelog');
    return { name: input.name, from: input.from, to: input.to, bump, verdict: 'URGENT', reasons };
  }

  if (bump === 'major') {
    reasons.push('major version bump — breaking changes are likely, check the changelog');
    return { name: input.name, from: input.from, to: input.to, bump, verdict: 'REVIEW', reasons };
  }

  if (input.targetDeprecated) {
    reasons.push('target version is marked deprecated on the npm registry');
    return { name: input.name, from: input.from, to: input.to, bump, verdict: 'CAUTION', reasons };
  }

  if (bump === 'downgrade' || bump === 'unknown') {
    reasons.push(bump === 'downgrade' ? 'this would downgrade the package' : "couldn't parse one of the versions");
    return { name: input.name, from: input.from, to: input.to, bump, verdict: 'CAUTION', reasons };
  }

  reasons.push(`${bump} bump, no known vulnerabilities, not deprecated`);
  return { name: input.name, from: input.from, to: input.to, bump, verdict: 'SAFE', reasons };
}

const VERDICT_ORDER = ['AVOID', 'URGENT', 'REVIEW', 'CAUTION', 'SAFE'];

module.exports = { computeVerdict, VERDICT_ORDER };
