// SPDX-License-Identifier: Apache-2.0
//
// Runs the benchmark pages (naive, recommended, vanilla) in real browsers and writes
// layer1/bench/results/<yyyymmdd>-<environment>/results.json and results.md.
//
//   node layer1/bench/run.mjs [--engines chromium,firefox,webkit] [--runs 10] [--warmup 5] [--env <name>] [--out <dir>]
//
// Each measurement: set the table up (not timed), then click the button in the page and take
// `layout` = click → render → forced style and layout, and `frame` = click → second animation frame.
// The numbers depend on the machine; CI does not check them (the smoke test is bench.e2e.js).

import { chromium, firefox, webkit } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { cpus, platform, release, totalmem, type } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { startServer } from '../test/e2e/serve.mjs';
import { ENGINES, FOLDER_NAME, OPS, VARIANTS, cpuSlug, renderMarkdown, stats } from './report.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../..');
const TYPES = { chromium: chromium, firefox: firefox, webkit: webkit };

// What each operation needs before the timed click, and what it clicks (i = run number).
const PLAN = {
  create: { setup: ['clear'], click: () => '#run' },
  createLots: { setup: ['clear'], click: () => '#runlots' },
  append: { setup: ['clear', 'run'], click: () => '#add' },
  update: { setup: ['clear', 'run'], click: () => '#update' },
  select: { setup: ['clear', 'run'], click: (i) => '#tbody tr:nth-child(' + (2 + (i % 10)) + ') [data-action="select"]' },
  swap: { setup: ['clear', 'run'], click: () => '#swaprows' },
  remove: { setup: ['clear', 'run'], click: (i) => '#tbody tr:nth-child(' + (4 + (i % 10)) + ') [data-action="remove"]' },
  clear: { setup: ['run'], click: () => '#clear' }
};
const SETUP_BUTTON = { clear: '#clear', run: '#run' };

function args() {
  const out = { engines: ENGINES.slice(), runs: 10, warmup: 5, env: '', out: join(HERE, 'results') };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i + 1];
    if (argv[i] === '--engines') { out.engines = value.split(','); i++; }
    else if (argv[i] === '--runs') { out.runs = Number(value); i++; }
    else if (argv[i] === '--warmup') { out.warmup = Number(value); i++; }
    else if (argv[i] === '--env') { out.env = value; i++; }
    else if (argv[i] === '--out') { out.out = value; i++; }
    else throw new Error('Unknown option ' + argv[i]);
  }
  for (const e of out.engines) if (!TYPES[e]) throw new Error('Unknown engine ' + e);
  if (!(out.runs >= 1) || !(out.warmup >= 0)) throw new Error('--runs must be 1 or more, --warmup 0 or more');
  return out;
}

function environment() {
  const require = createRequire(import.meta.url);
  const cpu = cpus()[0] ? cpus()[0].model.trim() : 'unknown';
  return {
    os: type() + ' ' + release() + ' (' + platform() + ')',
    cpu: cpu,
    cores: cpus().length,
    memory: Math.round(totalmem() / 1073741824) + ' GB',
    node: process.versions.node,
    playwright: require('playwright/package.json').version
  };
}

/** Gzip bytes of the page's own scripts (the library and app.js; data.js is the shared harness). */
function scriptSize(variant) {
  const page = join(HERE, 'pages', variant);
  const html = readFileSync(join(page, 'index.html'), 'utf8');
  let total = 0;
  for (const m of html.matchAll(/<script src="([^"]+)"/g)) {
    if (/data\.js$/.test(m[1])) continue;
    total += gzipSync(readFileSync(join(page, m[1])), { level: 9 }).length;
  }
  return total;
}

// In the page: click, let the render's microtasks run, force style and layout, then wait two frames.
const MEASURE = async (selector) => {
  const el = document.querySelector(selector);
  if (!el) throw new Error('missing ' + selector);
  const t0 = performance.now();
  el.click();
  for (let i = 0; i < 5; i++) await Promise.resolve();
  void document.body.offsetHeight;
  const t1 = performance.now();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  return { layout: t1 - t0, frame: performance.now() - t0 };
};

async function openPage(context, origin, variant) {
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') problems.push(msg.text()); });
  page.on('pageerror', (err) => problems.push(err.message));
  await page.goto(origin + '/layer1/bench/pages/' + variant + '/');
  await page.waitForFunction(() => window.benchData && window.benchData.readyAt > 0);
  return { page, problems };
}

async function measureOp(context, origin, variant, key, settings) {
  const { page, problems } = await openPage(context, origin, variant);
  const layout = [];
  const frame = [];
  try {
    for (let i = 0; i < settings.warmup + settings.runs; i++) {
      for (const step of PLAN[key].setup) await page.evaluate(MEASURE, SETUP_BUTTON[step]);
      const t = await page.evaluate(MEASURE, PLAN[key].click(i));
      if (i >= settings.warmup) { layout.push(t.layout); frame.push(t.frame); }
    }
  } finally {
    await page.close();
  }
  if (problems.length) throw new Error(variant + ' ' + key + ': ' + problems.join('; '));
  const s = stats(layout);
  const f = stats(frame);
  return { median: s.median, min: s.min, max: s.max, frameMedian: f.median, layout: layout.map(round), frame: frame.map(round) };
}

const round = (x) => Math.round(x * 100) / 100;

async function measureStartup(context, origin, variant, settings) {
  const samples = [];
  for (let i = 0; i < settings.warmup + settings.runs; i++) {
    const { page } = await openPage(context, origin, variant);
    const t = await page.evaluate(() => window.benchData.readyAt);
    await page.close();
    if (i >= settings.warmup) samples.push(t);
  }
  return Object.assign(stats(samples), { samples: samples.map(round) });
}

/** JS heap after creating the rows, after a garbage collection (Chromium DevTools protocol only). */
async function measureMemory(context, origin, variant) {
  const { page } = await openPage(context, origin, variant);
  try {
    await page.evaluate(MEASURE, '#run');
    const cdp = await context.newCDPSession(page);
    await cdp.send('HeapProfiler.collectGarbage');
    await cdp.send('Performance.enable');
    const { metrics } = await cdp.send('Performance.getMetrics');
    return metrics.find((m) => m.name === 'JSHeapUsedSize').value;
  } finally {
    await page.close();
  }
}

async function main() {
  const settings = args();
  const env = environment();
  const date = new Date().toISOString().slice(0, 10);
  const name = date.replace(/-/g, '') + '-' + (settings.env || platform() + '-' + cpuSlug(env.cpu));
  if (!FOLDER_NAME.test(name)) throw new Error('Result folder name "' + name + '" must be <yyyymmdd>-<lowercase-name>');
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const server = await startServer();
  const size = await (async () => {
    // The page size (1000 unless ?n= is given); read from data.js through one page load.
    const b = await chromium.launch();
    try {
      const { page } = await openPage(await b.newContext(), server.origin, 'vanilla');
      return await page.evaluate(() => window.benchData.size);
    } finally { await b.close(); }
  })();
  const results = {
    format: 1,
    date: date,
    vfunc: pkg.version,
    environment: env,
    settings: { runs: settings.runs, warmup: settings.warmup, size: size },
    size: {},
    engines: {}
  };
  for (const v of VARIANTS) results.size[v.key] = scriptSize(v.key);
  try {
    for (const engine of settings.engines) {
      const browser = await (engine === 'firefox'
        ? TYPES[engine].launch({ firefoxUserPrefs: { 'privacy.bounceTrackingProtection.mode': 0 } })
        : TYPES[engine].launch());
      const e = results.engines[engine] = { browser: browser.version(), ops: {}, startup: {} };
      try {
        const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1280, height: 800 } });
        for (const op of OPS) {
          e.ops[op.key] = {};
          for (const v of VARIANTS) {
            e.ops[op.key][v.key] = await measureOp(context, server.origin, v.key, op.key, settings);
            console.log(engine.padEnd(9) + op.key.padEnd(11) + v.key.padEnd(12) + e.ops[op.key][v.key].median.toFixed(1) + ' ms');
          }
        }
        for (const v of VARIANTS) e.startup[v.key] = await measureStartup(context, server.origin, v.key, settings);
        if (engine === 'chromium') {
          e.memory = {};
          for (const v of VARIANTS) e.memory[v.key] = await measureMemory(context, server.origin, v.key);
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    await server.close();
  }
  const dir = join(settings.out, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  writeFileSync(join(dir, 'results.md'), renderMarkdown(results));
  console.log('bench: ' + relative(ROOT, dir));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
