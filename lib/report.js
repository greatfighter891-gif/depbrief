const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
};

const VERDICT_COLOR = {
  AVOID: COLORS.magenta,
  URGENT: COLORS.red,
  REVIEW: COLORS.yellow,
  CAUTION: COLORS.yellow,
  SAFE: COLORS.green,
};

function printReport(results, { useColor = true, upToDateCount, totalCount } = {}) {
  const c = (code, s) => (useColor ? `${code}${s}${COLORS.reset}` : s);

  if (results.length === 0) {
    console.log('All dependencies are up to date.');
    return;
  }

  const order = ['AVOID', 'URGENT', 'REVIEW', 'CAUTION', 'SAFE'];
  const sorted = [...results].sort((a, b) => order.indexOf(a.verdict) - order.indexOf(b.verdict));

  console.log('');
  for (const r of sorted) {
    const tag = c(VERDICT_COLOR[r.verdict], `[${r.verdict}]`.padEnd(10));
    console.log(`${tag} ${c(COLORS.bold, r.name)} ${r.from} -> ${r.to} (${r.bump})`);
    for (const reason of r.reasons) {
      console.log(`           ${c(COLORS.gray, '-')} ${reason}`);
    }
  }
  console.log('');
  if (typeof totalCount === 'number') {
    console.log(`${results.length} of ${totalCount} dependencies have updates available (${upToDateCount} already up to date).`);
  }
}

function printJson(results) {
  console.log(JSON.stringify(results, null, 2));
}

module.exports = { printReport, printJson };
