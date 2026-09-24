// SPDX-License-Identifier: Apache-2.0
//
// Grades a run of the evaluation set (maintainer decision D-024).
//
//   node layer1/ai/eval/tools/grade.mjs <run folder> [--engines chromium,firefox,webkit] [--tasks 01,02]
//
// The run folder holds answers/NN*.md (one saved answer per task) and run.json (who ran what).
// For each answer: extract the files into build/out/eval/<run>/<task>/, run the static checks,
// open the page in each engine and run the task's checks plus the common ones (console, DOM).
// Writes results.json and results.md into the run folder.
//
// A task passes when every behaviour check passes in every engine, the console stays clean,
// the DOM is clean, no file that must stay the same changed, and there is no static error.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';
import { ROOT, loadTask, loadTasks, extractAnswer } from './extract.mjs';
import { staticCheck } from './static.mjs';
import { startServer } from '../../../test/e2e/serve.mjs';
import { report } from './report.mjs';

export const ENGINES = { chromium: chromium, firefox: firefox, webkit: webkit };
const CHECK_TIMEOUT = 20000;
const version = () => JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;

/** Runs in the page after each check: invalid aria values, duplicate ids, leaked "undefined". */
function domProbe() {
  const ALLOWED = {
    'aria-pressed': ['true', 'false', 'mixed'],
    'aria-checked': ['true', 'false', 'mixed'],
    'aria-invalid': ['true', 'false', 'grammar', 'spelling'],
    'aria-current': ['page', 'step', 'location', 'date', 'time', 'true', 'false']
  };
  const BOOLEAN = ['aria-selected', 'aria-expanded', 'aria-hidden', 'aria-disabled', 'aria-busy', 'aria-required',
    'aria-readonly', 'aria-modal', 'aria-multiselectable', 'aria-atomic', 'aria-multiline'];
  const issues = [];
  const describe = (el) => '<' + el.tagName.toLowerCase() + (el.id ? ' id="' + el.id + '"' : '') +
    (el.getAttribute('data-action') ? ' data-action="' + el.getAttribute('data-action') + '"' : '') +
    (el.getAttribute('data-ref') ? ' data-ref="' + el.getAttribute('data-ref') + '"' : '') + '>';
  for (const el of document.querySelectorAll('*')) {
    for (const attr of el.attributes) {
      const allowed = ALLOWED[attr.name] || (BOOLEAN.indexOf(attr.name) >= 0 ? ['true', 'false'] : null);
      if (allowed && allowed.indexOf(attr.value) < 0) issues.push(describe(el) + ' ' + attr.name + '="' + attr.value + '"');
    }
  }
  const seen = {};
  for (const el of document.querySelectorAll('[id]')) {
    if (seen[el.id]) issues.push('duplicate id "' + el.id + '"');
    seen[el.id] = true;
  }
  const body = document.body ? document.body.innerText : '';
  const leak = /(^|\W)(undefined|NaN|\[object Object\])(\W|$)/.exec(body);
  if (leak) issues.push('the page shows "' + leak[2] + '"');
  return issues;
}

async function runCheck(browser, server, taskPath, check) {
  const context = await browser.newContext(Object.assign({ locale: 'en-US' }, check.context));
  context.setDefaultTimeout(5000);
  context.setDefaultNavigationTimeout(30000); // a CDN file may be slow the first time
  const page = await context.newPage();
  const problems = [];
  const allowed = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') problems.push('console.' + msg.type() + ': ' + msg.text());
  });
  page.on('pageerror', (err) => problems.push('page error: ' + err.message));
  // An injected script that runs (alert) or a dialog the task did not ask for.
  page.on('dialog', (dialog) => { problems.push('dialog: ' + dialog.message()); dialog.dismiss().catch(() => {}); });
  page.on('requestfailed', (req) => problems.push('request failed: ' + req.url().replace(server.origin, '') + ' ' + (req.failure() && req.failure().errorText)));
  page.on('response', (res) => { if (res.status() >= 400) problems.push('HTTP ' + res.status() + ': ' + res.url().replace(server.origin, '')); });
  const env = {
    origin: server.origin,
    url: (path) => server.origin + taskPath + (path || ''),
    // A check that causes an error on purpose (an HTTP 500) names the messages it expects.
    allow: (pattern) => allowed.push(pattern),
    problems: problems
  };
  const result = { name: check.name, pass: false };
  try {
    if (check.before) await check.before(page, env);
    await page.goto(env.url(check.path || ''), { waitUntil: 'load' });
    await Promise.race([
      check.run(page, env),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timed out after ' + CHECK_TIMEOUT + ' ms')), CHECK_TIMEOUT))
    ]);
    result.pass = true;
  } catch (err) {
    result.error = String(err && err.message || err).split('\n')[0].slice(0, 300);
  }
  let dom = [];
  try {
    await page.waitForTimeout(50);
    dom = await page.evaluate(domProbe);
  } catch (err) {
    dom = ['could not inspect the page: ' + String(err.message).split('\n')[0]];
  }
  await context.close();
  const unexpected = problems.filter((p) => !allowed.some((re) => re.test(p)));
  return { result: result, problems: unexpected, dom: dom };
}

/** Grades one engine of one task. */
async function gradeEngine(browser, server, task, taskPath) {
  const checks = (await import(pathToFileURL(join(task.dir, 'checks.mjs')).href + '?t=' + Date.now())).default;
  const out = { checks: [], console: [], dom: [] };
  for (const check of checks) {
    const r = await runCheck(browser, server, taskPath, check);
    out.checks.push(r.result);
    for (const p of r.problems) if (out.console.indexOf(p) < 0) out.console.push(p);
    for (const d of r.dom) if (out.dom.indexOf(d) < 0) out.dom.push(d);
  }
  return out;
}

/**
 * Grades answers. `answers`: [{ task (id), markdown, source? }]. Options: `engines` (names),
 * `work` (folder for the extracted projects). Resolves with the results object.
 */
export async function gradeAnswers(answers, options) {
  const opts = options || {};
  const engines = opts.engines || Object.keys(ENGINES);
  const work = resolve(opts.work || join(ROOT, 'build/out/eval/work'));
  const tasks = answers.map((a) => {
    const task = loadTask(a.task);
    const extracted = a.markdown === null ? null : extractAnswer(a.markdown, task, join(work, task.id));
    const findings = extracted ? staticCheck(extracted.workFiles, Object.assign({ skip: task.mustKeep }, task.static)) : [];
    if (extracted) for (const p of extracted.keepViolations) findings.push({ rule: 'must-keep', severity: 'error', file: p, line: 0, text: 'this file must stay byte-for-byte the same' });
    return { task: task, source: a.source || null, extracted: extracted, static: findings, engines: {} };
  });

  const server = await startServer(work);
  try {
    for (const name of engines) {
      const browser = await ENGINES[name].launch();
      try {
        for (const t of tasks) {
          if (!t.extracted) continue;
          t.engines[name] = await gradeEngine(browser, server, t.task, '/' + t.task.id + '/' + t.task.entry);
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    await server.close();
  }

  const results = {
    kit: version(),
    graded: new Date().toISOString().slice(0, 10),
    engines: engines,
    tasks: tasks.map((t) => summarize(t, engines))
  };
  results.summary = {
    tasks: results.tasks.length,
    tasksPassed: results.tasks.filter((t) => t.pass).length,
    checks: results.tasks.reduce((n, t) => n + t.checks.total, 0),
    checksPassed: results.tasks.reduce((n, t) => n + t.checks.passed, 0)
  };
  return results;
}

function summarize(t, engines) {
  const out = {
    id: t.task.id,
    title: t.task.title.en,
    answer: t.source,
    files: t.extracted ? t.extracted.files : [],
    notes: t.extracted ? t.extracted.notes : ['no answer'],
    static: t.static,
    engines: t.engines
  };
  const names = t.extracted ? t.engines[engines[0]].checks.map((c) => c.name) : [];
  const perCheck = names.map((name, i) => ({
    name: name,
    pass: engines.every((e) => t.engines[e].checks[i].pass),
    failed: engines.filter((e) => !t.engines[e].checks[i].pass).map((e) => e + ': ' + t.engines[e].checks[i].error)
  }));
  const consoleClean = !!t.extracted && engines.every((e) => t.engines[e].console.length === 0);
  const domClean = !!t.extracted && engines.every((e) => t.engines[e].dom.length === 0);
  perCheck.push({ name: 'no console errors or warnings', pass: consoleClean, failed: consoleClean ? [] : engines.filter((e) => t.engines[e] && t.engines[e].console.length).map((e) => e + ': ' + t.engines[e].console.join(' | ')) });
  perCheck.push({ name: 'clean DOM (aria values, unique ids, no "undefined")', pass: domClean, failed: domClean ? [] : engines.filter((e) => t.engines[e] && t.engines[e].dom.length).map((e) => e + ': ' + t.engines[e].dom.join(' | ')) });
  const staticErrors = t.static.filter((f) => f.severity === 'error').length;
  out.results = perCheck;
  out.checks = { passed: perCheck.filter((c) => c.pass).length, total: perCheck.length };
  out.staticErrors = staticErrors;
  out.pass = !!t.extracted && out.checks.passed === out.checks.total && staticErrors === 0;
  return out;
}

/** Reads a run folder: run.json and answers/NN*.md. */
export function readRun(dir, only) {
  const run = existsSync(join(dir, 'run.json')) ? JSON.parse(readFileSync(join(dir, 'run.json'), 'utf8')) : {};
  const files = existsSync(join(dir, 'answers')) ? readdirSync(join(dir, 'answers')).filter((f) => /^\d\d.*\.md$/.test(f)) : [];
  const answers = loadTasks()
    .filter((task) => !only || only.indexOf(task.id.slice(0, 2)) >= 0)
    .map((task) => {
      const file = files.filter((f) => f.slice(0, 2) === task.id.slice(0, 2))[0];
      return { task: task.id, markdown: file ? readFileSync(join(dir, 'answers', file), 'utf8') : null, source: file ? 'answers/' + file : null };
    });
  return { run: run, answers: answers };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  let dir = null;
  let engines = null;
  let only = null;
  let reportOnly = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--engines') engines = args[++i].split(',');
    else if (args[i] === '--tasks') only = args[++i].split(',').map((s) => s.padStart(2, '0'));
    else if (args[i] === '--report') reportOnly = true;
    else dir = resolve(args[i]);
  }
  if (!dir || !existsSync(dir)) {
    console.error('usage: node layer1/ai/eval/tools/grade.mjs <run folder> [--engines chromium,firefox,webkit] [--tasks 01,02] [--report]');
    process.exit(2);
  }
  if (reportOnly) {
    // Rewrites results.md from results.json and the current run.json (after adding manual scores).
    const saved = JSON.parse(readFileSync(join(dir, 'results.json'), 'utf8'));
    saved.run = readRun(dir).run;
    writeFileSync(join(dir, 'results.json'), JSON.stringify(saved, null, 2) + '\n');
    writeFileSync(join(dir, 'results.md'), report(saved));
    console.log('Rewrote ' + join(dir, 'results.md'));
    process.exit(0);
  }
  const { run, answers } = readRun(dir, only);
  const results = await gradeAnswers(answers, { engines: engines, work: join(ROOT, 'build/out/eval', basename(dir)) });
  results.run = run;
  writeFileSync(join(dir, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  writeFileSync(join(dir, 'results.md'), report(results));
  console.log(results.summary.tasksPassed + '/' + results.summary.tasks + ' tasks passed, ' +
    results.summary.checksPassed + '/' + results.summary.checks + ' checks. See ' + join(dir, 'results.md'));
}
