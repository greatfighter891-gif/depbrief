#!/usr/bin/env node

const { analyzeProject, analyzePair } = require('../lib/index');
const { printReport, printJson } = require('../lib/report');

function parseArgs(argv) {
  const args = { positional: [], json: false, failOn: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') args.json = true;
    else if (a === '--fail-on') args.failOn = argv[++i];
    else if (a === '-h' || a === '--help') args.help = true;
    else args.positional.push(a);
  }
  return args;
}

function printHelp() {
  console.log(`depbrief - one verdict per dependency upgrade (semver bump, known vulns, deprecation)

Usage:
  depbrief                        Scan package.json + lockfile in the current directory
  depbrief <pkg> <from> <to>      Check a single upgrade directly, no project needed
  depbrief --json                 Machine-readable output
  depbrief --fail-on AVOID,URGENT Exit non-zero if any result matches these verdicts (for CI)

Verdicts: AVOID > URGENT > REVIEW > CAUTION > SAFE
`);
}

const VERDICT_RANK = { AVOID: 0, URGENT: 1, REVIEW: 2, CAUTION: 3, SAFE: 4 };

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  let results;
  let meta = {};

  if (args.positional.length === 3) {
    const [name, from, to] = args.positional;
    results = await analyzePair(name, from, to);
  } else if (args.positional.length === 0) {
    const projectResult = await analyzeProject(process.cwd());
    if (!projectResult) {
      console.log('No package.json found in the current directory.');
      process.exitCode = 1;
      return;
    }
    results = projectResult.results;
    meta = { upToDateCount: projectResult.upToDateCount, totalCount: projectResult.totalCount };
  } else {
    console.error('Usage: depbrief | depbrief <pkg> <from> <to>. Run depbrief --help for details.');
    process.exitCode = 1;
    return;
  }

  if (args.json) {
    printJson(results);
  } else {
    printReport(results, { useColor: process.stdout.isTTY, ...meta });
  }

  if (args.failOn) {
    const failVerdicts = new Set(args.failOn.split(',').map((s) => s.trim().toUpperCase()));
    if (results.some((r) => failVerdicts.has(r.verdict))) {
      process.exitCode = 1;
    }
  }
}

main().catch((err) => {
  console.error(`depbrief error: ${err.message}`);
  process.exitCode = 1;
});
