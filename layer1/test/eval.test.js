// SPDX-License-Identifier: Apache-2.0
// The LLM evaluation set (layer1/ai/eval, maintainer decision D-024): task folders are complete in
// both languages, bundles carry the kit and never the reference answers, answers are extracted as
// the output rules say, the static checks find what they should, and committed results are valid.
// The browser side (reference answers pass in every engine) is layer1/test/e2e/eval.e2e.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { EVAL, loadTasks, inputPath, parseAnswer, pathFrom, extractAnswer, readInputs, promptPath, libFor } from '../ai/eval/tools/extract.mjs';
import { buildBundle, fenced, kitFiles, LANGS } from '../ai/eval/tools/bundle.mjs';
import { staticCheck, scanJs, selectsByClass } from '../ai/eval/tools/static.mjs';
import { report } from '../ai/eval/tools/report.mjs';

const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const tasks = loadTasks();
const reference = (task) => read(join(task.dir, 'reference', 'answer.md'));

test('fourteen tasks (four of layer 2), each with task.json, texts in both languages, checks and a reference answer', () => {
  assert.equal(tasks.length, 14);
  assert.deepEqual(tasks.filter((t) => t.layer === 2).map((t) => t.id.slice(0, 2)), ['11', '12', '13', '14']);
  const folders = readdirSync(join(EVAL, 'tasks'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  assert.deepEqual(folders, tasks.map((t) => t.id));
  for (const task of tasks) {
    for (const file of ['task.en.md', 'task.ko.md', 'checks.mjs', 'reference/answer.md']) {
      assert.ok(existsSync(join(task.dir, file)), task.id + '/' + file);
    }
    assert.ok(task.title.en && task.title.ko, task.id + ' title');
    assert.ok(task.rubric.length >= 3 && task.rubric.every((r) => r.id && r.en && r.ko), task.id + ' rubric');
    for (const kind of ['project', 'reference']) {
      for (const path of Object.keys(task[kind] || {})) assert.ok(existsSync(inputPath(task, task[kind][path])), task.id + ' ' + kind + ' ' + path);
    }
    for (const path of task.mustKeep || []) assert.ok(task.project[path], task.id + ' mustKeep ' + path + ' is a project file');
    if (task.prompt) {
      for (const lang of LANGS) assert.ok(existsSync(promptPath(task, lang)), task.id + ' prompt ' + lang);
    }
  }
});

test('both languages of a task name the same hooks and texts', () => {
  // Placeholders (`id="<field id>-error"`) are translated, so they are left out.
  const hooks = (s) => (s.match(/`[^`]*(data-[a-z-]+|id)="[^"`]*"[^`]*`/g) || []).filter((h) => h.indexOf('<') < 0).sort();
  for (const task of tasks) {
    const en = read(join(task.dir, 'task.en.md'));
    const ko = read(join(task.dir, 'task.ko.md'));
    assert.deepEqual(hooks(ko), hooks(en), task.id);
  }
});

test('a bundle carries the header, the kit, the task and its inputs', () => {
  for (const task of tasks) {
    for (const lang of LANGS) {
      const bundle = buildBundle(task, lang);
      assert.ok(bundle.indexOf('### REPORT.md') >= 0, 'output rules');
      assert.ok(bundle.indexOf(read(join(EVAL, '..', lang, 'AGENTS.template.md')).split('\n')[0]) >= 0, task.id + ' ' + lang + ' AGENTS');
      assert.ok(bundle.indexOf(read(join(EVAL, '..', lang === 'ko' ? 'llms.ko.txt' : 'llms.txt')).split('\n')[2]) >= 0, task.id + ' ' + lang + ' llms');
      assert.ok(bundle.indexOf(read(join(task.dir, 'task.' + lang + '.md')).trim()) >= 0, task.id + ' ' + lang + ' task text');
      if (task.prompt) {
        const prompt = read(promptPath(task, lang));
        assert.ok(bundle.indexOf(prompt.slice(prompt.indexOf('\n---\n') + 5).trim().split('\n')[0]) >= 0, task.id + ' ' + lang + ' prompt');
      }
      for (const f of readInputs(task, 'project').concat(readInputs(task, 'reference'))) {
        assert.ok(bundle.indexOf(f.content) >= 0, task.id + ' ' + lang + ' input ' + f.path);
      }
      assert.ok(bundle.indexOf('@VERSION@') < 0 && bundle.indexOf('@LIB@') < 0, 'version and lib/ list filled in');
      // Layer 2 tasks (D-039): the component list and the layer 2 lib/ files; layer 1 tasks: neither.
      const components = read(join(EVAL, '..', '..', '..', 'layer2', 'ai', lang, 'components.md')).split('\n')[0];
      assert.equal(bundle.indexOf(components) >= 0, task.layer === 2, task.id + ' ' + lang + ' components.md');
      assert.equal(bundle.indexOf('`lib/vfunc-ui.js`') >= 0, task.layer === 2, task.id + ' ' + lang + ' lib/ list');
      assert.ok(bundle.indexOf('`lib/vfunc.js`') >= 0, task.id + ' ' + lang + ' lib/vfunc.js listed');
    }
  }
});

test('a bundle never contains the reference answer or the checks', () => {
  for (const task of tasks) {
    const inputs = readInputs(task, 'project').concat(readInputs(task, 'reference')).map((f) => f.content)
      .concat(LANGS.map((lang) => read(join(task.dir, 'task.' + lang + '.md')))).join('\n');
    const own = parseAnswer(reference(task)).files
      .map((f) => f.content)
      .join('\n')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 40 && inputs.indexOf(l) < 0);
    assert.ok(own.length > 0, task.id + ': the reference answer has lines of its own');
    for (const lang of LANGS) {
      const bundle = buildBundle(task, lang);
      // A line the kit itself shows (a documented example) is not a leak.
      const kit = kitFiles(task, lang).map((f) => f.content).join('\n');
      assert.deepEqual(own.filter((l) => bundle.indexOf(l) >= 0 && kit.indexOf(l) < 0), [], task.id + ' ' + lang);
      assert.ok(bundle.indexOf('tools/helpers.mjs') < 0, 'no checks');
    }
  }
});

test('fenced blocks cannot be closed by their content', () => {
  assert.equal(fenced('a', 'js'), '```js\na\n```');
  assert.equal(fenced('```tokens\n{}\n```', 'markdown'), '````markdown\n```tokens\n{}\n```\n````');
});

test('answers: file headings, fences, the report and every deviation', () => {
  const md = [
    'Intro text.',
    '### `index.html`',
    '```html',
    '<p>hi</p>',
    '```',
    '### app.js (new)',
    '',
    '````js',
    'const a = "```";',
    '````',
    '**style.css**',
    '```css',
    'a {}',
    '```',
    '### lib/vfunc.js',
    '```js',
    'x',
    '```',
    '### ../evil.js',
    '```js',
    'x',
    '```',
    '### app.js',
    '```js',
    'const b = 1;',
    '// ...',
    '```',
    '### 2. Area table',
    'text',
    '### REPORT.md',
    'Plain report, no fence.',
    ''
  ].join('\n');
  const r = parseAnswer(md);
  assert.deepEqual(r.files.map((f) => f.path), ['index.html', 'style.css', 'app.js']);
  assert.equal(r.files[2].content, 'const b = 1;\n// ...\n', 'the last copy wins');
  assert.equal(r.report, 'Plain report, no fence.\n');
  assert.ok(r.notes.some((n) => /style\.css.*### heading/.test(n)), 'bold file name noted');
  assert.ok(r.notes.some((n) => /lib\/vfunc\.js.*ignored/.test(n)), 'lib ignored');
  assert.ok(r.notes.some((n) => /app\.js.*given twice/.test(n)), 'duplicate noted');
  assert.ok(r.notes.some((n) => /app\.js.*elision/.test(n)), 'elision noted');
  assert.equal(pathFrom('../evil.js'), null);
  assert.equal(pathFrom('/etc/passwd'), null);
  assert.equal(pathFrom('C:\\x.js'), null);
  assert.equal(pathFrom('File: pages/home.js'), 'pages/home.js');
  const unclosed = parseAnswer('### a.js\n```js\nx\n');
  assert.ok(unclosed.notes.some((n) => /not closed/.test(n)));
  assert.ok(unclosed.notes.some((n) => /no REPORT/.test(n)));
});

test('every reference answer follows the output rules exactly', () => {
  for (const task of tasks) {
    const r = parseAnswer(reference(task));
    assert.deepEqual(r.notes, [], task.id);
    assert.ok(r.files.length > 0 && r.report !== null, task.id);
  }
});

test('extraction: project files, the answer on top, lib/ from dist, must-keep violations', () => {
  const task = tasks.filter((t) => t.id === '09-design-apply')[0];
  const out = mkdtempSync(join(tmpdir(), 'vf-eval-'));
  try {
    const r = extractAnswer('### app.js\n```js\n// changed\n```\n### REPORT.md\n```markdown\nok\n```\n', task, out);
    assert.deepEqual(r.keepViolations, ['app.js']);
    assert.ok(existsSync(join(out, 'lib', 'vfunc.esm.js')) && existsSync(join(out, 'lib', 'vfunc.js')) && existsSync(join(out, 'lib', 'vfunc.tokens.css')));
    assert.equal(read(join(out, 'styles', 'app.css')), read(join(task.dir, 'input', 'app.css')), 'untouched project files are copied');
    assert.equal(read(join(out, 'REPORT.md')), 'ok\n');
    assert.equal(existsSync(join(out, 'lib', 'vfunc-ui.js')), false, 'a layer 1 task gets no layer 2 files');
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
  const task2 = tasks.filter((t) => t.id === '11-admin-dashboard')[0];
  const out2 = mkdtempSync(join(tmpdir(), 'vf-eval-'));
  try {
    extractAnswer('### REPORT.md\n\nok\n', task2, out2);
    for (const path of Object.keys(libFor(task2))) assert.ok(existsSync(join(out2, path)), 'layer 2 task: ' + path);
    assert.ok(existsSync(join(out2, 'lib', 'vfunc-ui.css')) && existsSync(join(out2, 'lib', 'vfunc-ui-data.esm.js')));
  } finally {
    rmSync(out2, { recursive: true, force: true });
  }
});

test('scanJs blanks comments, keeps lines, and knows tagged templates and regex literals', () => {
  const src = 'const a = 1; // onclick="x"\n/* <b> */ const r = /`<b>`/g;\nconst t = vf.html`<b>${a}</b>`;\nconst u = `<i>${html`<b></b>`}</i>`;\n';
  const s = scanJs(src);
  assert.equal(s.code.split('\n').length, src.split('\n').length);
  assert.ok(s.code.indexOf('onclick') < 0 && s.code.indexOf('<b> */') < 0);
  const tags = s.templates.map((t) => t.tag).sort();
  assert.deepEqual(tags, ['', 'html', 'vf.html']);
});

test('static checks: each rule fires on its mistake and not on correct code', () => {
  const rules = (files, options) => staticCheck(files, options).filter((f) => f.severity === 'error').map((f) => f.rule).sort();
  const js = (content) => [{ path: 'app.js', content: content }];
  const csp = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\'">';
  const page = (body) => [{ path: 'index.html', content: '<!DOCTYPE html><html><head>' + csp + '</head><body>' + body + '</body></html>' }];

  assert.deepEqual(rules(js('vf.vfunc({ render: (s) => vf.html`<button data-action="go" aria-pressed="${s.on}">${s.name}</button>`,\n  delegates: [{ selector: \'[data-action="go"]\', eventType: \'click\' }] });\nel.innerHTML = \'\';\nconst c = getComputedStyle(document.documentElement).getPropertyValue(\'--vf-chart-1\');')), []);
  assert.deepEqual(rules(page('<button data-action="x">Go</button><script src="./app.js"></script>')), []);

  assert.deepEqual(rules(js('delegates: [{ selector: \'.btn-remove\', eventType: \'click\' }]')), ['class-selector']);
  assert.deepEqual(rules(js('root.querySelector(".card__title")')), ['class-selector']);
  assert.deepEqual(rules(js('e.target.closest(\'[data-id] .row\')')), ['class-selector']);
  assert.equal(selectsByClass('[data-x=".y"]'), false);
  assert.equal(selectsByClass('#delete-${next.id}'), false, 'a template expression is not a class');
  assert.equal(selectsByClass('.row-${n}'), true);
  assert.deepEqual(rules(js('const b = vf.$(`#delete-${next.id}`);\n')), []);
  assert.deepEqual(rules(js('list.innerHTML = items.map((i) => i.name).join("")')), ['html-string']);
  assert.deepEqual(staticCheck(js('list.innerHTML =\n  String(vf.html`<li>${x}</li>`);')).map((f) => f.rule + ':' + f.severity), ['html-string:warn'], 'escaped by vf.html');
  assert.deepEqual(rules(js('const row = `<li>${name}</li>`;')), ['html-string']);
  assert.deepEqual(rules(js('const row = \'<li>\' + name + \'</li>\';')), ['html-string']);
  assert.deepEqual(rules(js('el.insertAdjacentHTML("beforeend", x)')), ['html-string']);
  assert.deepEqual(rules(js('eval(code); setTimeout("go()", 10); new Function("a", "b")')), ['eval']);
  assert.deepEqual(rules(js('a.href = "javascript:void(0)"')), ['javascript-url']);
  assert.deepEqual(rules(js('vf.myHelper = () => 1; Element.prototype.x = 1;')), ['vf-mutation']);
  assert.deepEqual(rules(js('btn.setAttribute("aria-expanded", "")')), ['aria-value']);
  assert.deepEqual(rules(js('vf.html`<button aria-expanded="${open ? \'true\' : \'\'}">x</button>`')), ['aria-value']);
  assert.deepEqual(rules(js('chart.color = "#2563eb"; el.style.color = c;')), ['design-in-js']);
  assert.deepEqual(rules(js('onMount: (inst) => { inst._timer = setInterval(f, 100); }')), ['instance-property']);
  assert.deepEqual(staticCheck(js('cache._last = 1;')).map((f) => f.rule + ':' + f.severity), ['instance-property:warn']);
  assert.deepEqual(rules(js('const orders = [{ id: "#1042" }, { id: "#104" }];')), ['design-in-js'], '"#104" looks like a color, "#1042" does not');
  assert.deepEqual(rules([{ path: 'locales/en.json', content: '{ "nav.home": "Home" }' }]), ['locale-file']);
  assert.deepEqual(rules([{ path: 'locales/en.json', content: '{ "nav": { "home": "Home" } }' }]), []);
  assert.deepEqual(rules([{ path: 'data/items.json', content: '{ "a.b": 1 }' }]), [], 'only locale files');

  assert.deepEqual(rules(page('<button onclick="go()">Go</button>')), ['inline-handler']);
  assert.deepEqual(rules(page('<a href="javascript:void(0)">x</a>')), ['javascript-url']);
  assert.deepEqual(rules(page('<ul style="display:none"></ul>')), ['csp']);
  assert.deepEqual(rules(page('<script>go()</script>')), ['csp']);
  assert.deepEqual(rules([{ path: 'index.html', content: '<html><body></body></html>' }]), ['csp']);
  assert.deepEqual(rules([{ path: 'index.html', content: '<meta http-equiv="Content-Security-Policy" content="script-src \'self\' \'unsafe-inline\'">' }]), ['csp']);
  assert.deepEqual(rules(page('<button aria-pressed="">x</button>')), ['aria-value']);
  assert.deepEqual(rules(page('<script src="https://cdn.jsdelivr.net/npm/chart.js/dist/chart.umd.min.js"></script>')), ['cdn-sri']);
  assert.deepEqual(rules(page('<script src="https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js" integrity="sha384-x" crossorigin="anonymous"></script>')), []);

  const css = (content, options) => rules([{ path: 'styles/app.css', content: content }], options);
  assert.deepEqual(css('.a { color: #fff; border: 1px solid var(--vf-color-border); }'), ['css-raw']);
  assert.deepEqual(css('.a { padding: 12px; }'), []);
  assert.deepEqual(css('.a { padding: 12px; }', { cssStrict: true }), ['css-raw']);
  assert.deepEqual(rules([{ path: 'styles/tokens.css', content: ':root { --vf-color-primary: #000; --vf-brand-x: 1px; }' }]), []);
  assert.deepEqual(staticCheck([{ path: 'styles/tokens.css', content: ':root { --vf-brand-x: 1px; }' }]).map((f) => f.rule), ['unknown-token']);
  assert.deepEqual(rules([{ path: 'app.css', content: 'a { color: red; } .b { color: #000; }' }], { skip: ['app.css'] }), [], 'skipped file');
  assert.deepEqual(rules(js('import React from "react";'), { forbid: [{ pattern: 'from\\s+[\'"]react', message: 'React' }] }), ['task-rule']);
});

test('the report lists every task with its result', () => {
  const md = report({
    run: { model: 'Test model', date: '2026-09-24', lang: 'en', kit: '1.0.0', tasks: { '01': { followUps: 1, manual: { spec: 2 }, notes: 'ok' } } },
    kit: '1.0.0',
    graded: '2026-09-24',
    engines: ['chromium'],
    summary: { tasks: 1, tasksPassed: 0, checks: 3, checksPassed: 2 },
    tasks: [{ id: '01-counter-greeting', title: 'Counter', answer: 'answers/01.md', files: ['app.js'], notes: [], pass: false, checks: { passed: 2, total: 3 }, staticErrors: 1,
      results: [{ name: 'a', pass: true, failed: [] }, { name: 'b', pass: false, failed: ['chromium: boom'] }],
      static: [{ rule: 'csp', severity: 'error', file: 'index.html', line: 1, lines: [1], text: 'no CSP' }] }]
  });
  assert.match(md, /\| 01-counter-greeting \| 2 \/ 3 \| 1 \| 1 \| \*\*no\*\* \|/);
  assert.match(md, /- b: chromium: boom/);
  assert.match(md, /- error `csp` index\.html:1 — no CSP/);
  assert.match(md, /- spec: 2/);
});

test('committed results are complete', () => {
  const dir = join(EVAL, 'results');
  if (!existsSync(dir)) return;
  const ids = tasks.map((t) => t.id);
  for (const run of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const base = join(dir, run.name);
    assert.ok(/^\d{8}-[a-z0-9.-]+-(en|ko)$/.test(run.name), 'folder name <date>-<model>-<lang>: ' + run.name);
    const info = JSON.parse(read(join(base, 'run.json')));
    for (const key of ['model', 'service', 'date', 'lang', 'kit']) assert.ok(info[key], run.name + ' run.json ' + key);
    const results = JSON.parse(read(join(base, 'results.json')));
    assert.ok(results.summary && results.tasks.length > 0, run.name + ' results.json');
    for (const t of results.tasks) assert.ok(ids.indexOf(t.id) >= 0, run.name + ' task ' + t.id);
    assert.ok(existsSync(join(base, 'results.md')), run.name + ' results.md');
  }
});
