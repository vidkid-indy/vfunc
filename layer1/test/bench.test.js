// SPDX-License-Identifier: Apache-2.0
//
// The performance benchmark (layer1/bench, plan N2): its tables and its committed results.
// The pages themselves are checked in real browsers by e2e/bench.e2e.js.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENGINES, FOLDER_NAME, OPS, VARIANTS, cpuSlug, renderMarkdown, stats, summaryRows } from '../bench/report.mjs';

const BENCH = fileURLToPath(new URL('../bench/', import.meta.url));

function sample() {
  const op = (median) => ({ median: median, min: median - 1, max: median + 1, frameMedian: median + 10, layout: [], frame: [] });
  const ops = {};
  for (const o of OPS) ops[o.key] = { naive: op(40), recommended: op(20), vanilla: op(10) };
  return {
    format: 1,
    date: '2026-09-27',
    vfunc: '1.0.1',
    environment: { os: 'Test OS', cpu: 'Test CPU', cores: 4, memory: '8 GB', node: '24.0.0', playwright: '1.63.0' },
    settings: { runs: 10, warmup: 5, size: 1000 },
    size: { naive: 4096, recommended: 4096, vanilla: 1024 },
    engines: { chromium: { browser: '1.0', ops: ops, startup: { naive: stats([5]), recommended: stats([5]), vanilla: stats([4]) }, memory: { naive: 2097152, recommended: 2097152, vanilla: 1048576 } } }
  };
}

test('stats: median of odd and even counts, min and max', () => {
  assert.deepEqual(stats([3, 1, 2]), { median: 2, min: 1, max: 3 });
  assert.deepEqual(stats([4, 1, 3, 2]), { median: 2.5, min: 1, max: 4 });
  assert.deepEqual(stats([1.234]), { median: 1.2, min: 1.2, max: 1.2 });
});

test('cpuSlug and folder names', () => {
  assert.equal(cpuSlug('Intel(R) Core(TM) i5-7200U CPU @ 2.50GHz'), 'i5-7200u');
  assert.equal(cpuSlug('AMD Ryzen 7 5800X 8-Core Processor'), 'ryzen-7-5800x');
  assert.equal(cpuSlug('Apple M2'), 'apple-m2');
  assert.ok(FOLDER_NAME.test('20260927-win32-i5-7200u'));
  assert.ok(!FOLDER_NAME.test('2026-09-27-win'));
  assert.ok(!FOLDER_NAME.test('20260927-Win32'));
});

test('summary rows: every operation, startup, memory and size, with ratios to vanilla', () => {
  const rows = summaryRows(sample(), 'chromium', 'en');
  assert.equal(rows.length, OPS.length + 3);
  assert.deepEqual(rows[0], ['create rows', '40.0 (4.0×)', '20.0 (2.0×)', '10.0']);
  assert.deepEqual(rows[rows.length - 1], ['script size (gzip)', '4.00 KB', '4.00 KB', '1.00 KB']);
  assert.equal(summaryRows(sample(), 'chromium', 'ko')[0][0], '행 만들기');
  for (const row of rows) assert.equal(row.length, VARIANTS.length + 1);
});

test('results.md names the environment, every operation and every engine that ran', () => {
  const md = renderMarkdown(sample());
  assert.match(md, /Test OS, Test CPU, vfunc 1\.0\.1/);
  for (const op of OPS) assert.ok(md.includes('| ' + op.en + ' |'), op.key);
  assert.match(md, /## chromium 1\.0/);
  assert.doesNotMatch(md, /## firefox/);
});

test('committed results are complete and results.md is up to date', () => {
  const dir = join(BENCH, 'results');
  const runs = existsSync(dir) ? readdirSync(dir) : [];
  for (const name of runs) {
    assert.ok(FOLDER_NAME.test(name), 'folder name ' + name);
    const results = JSON.parse(readFileSync(join(dir, name, 'results.json'), 'utf8'));
    assert.equal(results.format, 1, name);
    for (const engine of Object.keys(results.engines)) {
      assert.ok(ENGINES.includes(engine), name + ' ' + engine);
      for (const op of OPS) for (const v of VARIANTS) assert.equal(typeof results.engines[engine].ops[op.key][v.key].median, 'number', name + ' ' + engine + ' ' + op.key + ' ' + v.key);
    }
    assert.equal(readFileSync(join(dir, name, 'results.md'), 'utf8'), renderMarkdown(results), name + ': run `node layer1/bench/run.mjs` again or regenerate results.md');
  }
});

test('the three pages load the same data, CSS and tokens; the vfunc pages use the production build', () => {
  for (const v of VARIANTS) {
    const html = readFileSync(join(BENCH, 'pages', v.key, 'index.html'), 'utf8');
    assert.match(html, /http-equiv="Content-Security-Policy"/, v.key);
    assert.doesNotMatch(html, /unsafe-inline/, v.key);
    assert.match(html, /<script src="\.\.\/\.\.\/data\.js"><\/script>/, v.key);
    assert.match(html, /href="\.\.\/\.\.\/bench\.css"/, v.key);
    assert.match(html, /href="\.\.\/\.\.\/\.\.\/css\/vfunc\.tokens\.css"/, v.key);
    assert.equal(/dist\/vfunc\.min\.js/.test(html), v.key !== 'vanilla', v.key);
  }
});
