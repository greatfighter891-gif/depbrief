const assert = require('assert');
const { classifyBump } = require('../lib/semver');
const { computeVerdict } = require('../lib/verdict');

let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`ok - ${name}`);
  } catch (err) {
    console.error(`FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

test('patch bump', () => {
  assert.strictEqual(classifyBump('1.2.3', '1.2.4'), 'patch');
});

test('minor bump', () => {
  assert.strictEqual(classifyBump('1.2.3', '1.3.0'), 'minor');
});

test('major bump', () => {
  assert.strictEqual(classifyBump('1.2.3', '2.0.0'), 'major');
});

test('0.x minor bump counts as major (semver 0.x is unstable)', () => {
  assert.strictEqual(classifyBump('0.2.3', '0.3.0'), 'major');
});

test('0.x patch bump stays patch', () => {
  assert.strictEqual(classifyBump('0.2.3', '0.2.4'), 'patch');
});

test('downgrade detected', () => {
  assert.strictEqual(classifyBump('2.0.0', '1.9.0'), 'downgrade');
});

test('same version is none', () => {
  assert.strictEqual(classifyBump('1.2.3', '1.2.3'), 'none');
});

test('handles range-prefixed versions (^, ~, v)', () => {
  assert.strictEqual(classifyBump('^1.2.3', 'v1.3.0'), 'minor');
});

test('unparseable version returns unknown', () => {
  assert.strictEqual(classifyBump('not-a-version', '1.0.0'), 'unknown');
});

test('verdict: target has vuln -> AVOID beats everything else', () => {
  const v = computeVerdict({
    name: 'x', from: '1.0.0', to: '1.0.1',
    currentHasVuln: true, targetHasVuln: true, targetDeprecated: true,
  });
  assert.strictEqual(v.verdict, 'AVOID');
});

test('verdict: current has vuln, target clean -> URGENT', () => {
  const v = computeVerdict({
    name: 'x', from: '1.0.0', to: '1.0.1',
    currentHasVuln: true, targetHasVuln: false, targetDeprecated: false,
  });
  assert.strictEqual(v.verdict, 'URGENT');
});

test('verdict: major bump, no vulns -> REVIEW', () => {
  const v = computeVerdict({
    name: 'x', from: '1.0.0', to: '2.0.0',
    currentHasVuln: false, targetHasVuln: false, targetDeprecated: false,
  });
  assert.strictEqual(v.verdict, 'REVIEW');
});

test('verdict: deprecated target, minor bump -> CAUTION', () => {
  const v = computeVerdict({
    name: 'x', from: '1.0.0', to: '1.1.0',
    currentHasVuln: false, targetHasVuln: false, targetDeprecated: true,
  });
  assert.strictEqual(v.verdict, 'CAUTION');
});

test('verdict: patch bump, nothing wrong -> SAFE', () => {
  const v = computeVerdict({
    name: 'x', from: '1.0.0', to: '1.0.1',
    currentHasVuln: false, targetHasVuln: false, targetDeprecated: false,
  });
  assert.strictEqual(v.verdict, 'SAFE');
});

test('verdict: downgrade -> CAUTION', () => {
  const v = computeVerdict({
    name: 'x', from: '2.0.0', to: '1.9.0',
    currentHasVuln: false, targetHasVuln: false, targetDeprecated: false,
  });
  assert.strictEqual(v.verdict, 'CAUTION');
});

console.log(`\n${passed} passing`);
if (process.exitCode === 1) {
  console.error('\nSome tests failed.');
  process.exit(1);
}
