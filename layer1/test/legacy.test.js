// SPDX-License-Identifier: Apache-2.0
// dist/vfunc.legacy.min.js in an IE11-like page: no Promise, no Element.closest (only
// msMatchesSelector), window === the global object. The real check is the manual run in
// Edge IE mode (layer1/test/browser.html); this keeps the obvious breakages out of CI.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Window } from 'happy-dom';
import SimplePromise from '../src/polyfills/promise.js';

const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const legacy = readFileSync(new URL('../dist/vfunc.legacy.min.js', import.meta.url), 'utf8');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms || 20));

/** A page whose global object has only what IE11 would have for our purposes. */
function iePage(options) {
  const o = options || {};
  const keepPromise = o.nativePromise;
  const page = new Window({ url: o.url || 'https://example.test/' });
  if (o.body) page.document.body.innerHTML = o.body;
  const logs = { warn: [], error: [] };
  const sandbox = {
    document: page.document,
    location: page.location,
    history: page.history,
    navigator: page.navigator,
    localStorage: page.localStorage,
    addEventListener: page.addEventListener.bind(page),
    removeEventListener: page.removeEventListener.bind(page),
    MouseEvent: page.MouseEvent, // happy-dom has no IE-style initMouseEvent
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    console: {
      warn: (...args) => logs.warn.push(args.join(' ')),
      error: (...args) => logs.error.push(args.join(' ')),
      log: () => {}
    }
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  const context = createContext(sandbox);
  if (!keepPromise) runInContext('delete globalThis.Promise;', context);

  // IE11: no Element.prototype.closest / matches, only msMatchesSelector. happy-dom shares the
  // Element class between windows, so an earlier call may have patched it already.
  const proto = page.Element.prototype;
  const matches = proto.msMatchesSelector || proto.matches;
  Object.defineProperty(proto, 'closest', { value: undefined, configurable: true, writable: true });
  Object.defineProperty(proto, 'matches', { value: undefined, configurable: true, writable: true });
  Object.defineProperty(proto, 'msMatchesSelector', { value: matches, configurable: true, writable: true });

  const before = Object.keys(sandbox);
  if (o.load === false) return { sandbox: sandbox, page: page, logs: logs, context: context };
  runInContext(legacy, context, { filename: 'vfunc.legacy.min.js' });
  const added = Object.keys(sandbox).filter((key) => before.indexOf(key) < 0).sort();
  return { vf: sandbox.vf, sandbox: sandbox, page: page, logs: logs, added: added, context: context };
}

function click(page, element) {
  element.dispatchEvent(new page.MouseEvent('click', { bubbles: true }));
}

test('the legacy file is stamped and adds only vf and the missing Promise to the global object', () => {
  assert.ok(legacy.startsWith('/*! vfunc.js v' + pkg.version + ' | Apache-2.0'));
  const { vf, sandbox, added } = iePage();
  assert.equal(vf.version, pkg.version);
  assert.deepEqual(added, ['Promise', 'vf']);
  assert.equal(typeof sandbox.Promise.resolve, 'function');
});

test('a native Promise is kept', () => {
  const { added, context } = iePage({ nativePromise: true });
  assert.deepEqual(added, ['vf']);
  assert.match(runInContext('String(Promise)', context), /native code/);
});

test('components, delegates (closest fallback) and batched setState work', async () => {
  const { vf, page } = iePage();
  const seen = [];
  const box = vf.vfunc({
    state: { count: 0 },
    render: function (s) { return vf.tpl('<button data-action="inc"><span data-ref="n">{count}</span></button>', s); },
    delegates: [{ selector: '[data-action="inc"]', eventType: 'click', onEvent: function (e) {
      seen.push(e.target.getAttribute('data-action'));
      e.sender.setState({ count: e.sender.count + 1 });
      e.sender.setState({ count: e.sender.count + 1 });
    } }]
  });
  let mounted = null;
  box.mount(page.document.body).then(function (inst) { mounted = inst; });
  click(page, box.refs.n); // the click lands on the <span> inside the button
  assert.deepEqual(seen, ['inc']);
  await wait();
  assert.equal(mounted, box);
  assert.equal(box.refs.n.textContent, '2');
});

test('vf.tpl keeps the security rules and reports briefly', () => {
  const { vf, logs } = iePage();
  const out = String(vf.tpl('<a href="{u}" title="{t}">{t}</a>', { u: 'javascript:alert(1)', t: '<b>"x"</b>' }));
  assert.equal(out, '<a href="#" title="&lt;b&gt;&quot;x&quot;&lt;/b&gt;">&lt;b&gt;&quot;x&quot;&lt;/b&gt;</a>');
  vf.tpl('<div onclick="{x}"></div>', { x: 'alert(1)' });
  assert.equal(logs.error.length, 1);
  assert.match(logs.error[0], /blocked an unsafe value/);
  assert.deepEqual(logs.warn, []);
});

test('hash router, link interception, store and i18n work without native Promise', async () => {
  const { vf, page } = iePage();
  const seen = [];
  const r = vf.router({ routes: {
    '/': function () { seen.push('home'); },
    '/users/:id': function (ctx) { seen.push('user ' + ctx.params.id); }
  } });
  r.start();
  page.document.body.innerHTML = '<a data-link href="#/users/7"><i>go</i></a>';
  click(page, page.document.querySelector('i'));
  await wait();
  r.stop();
  assert.deepEqual(seen, ['home', 'user 7']);

  const s = vf.store({ n: 0 });
  let calls = 0;
  s.subscribe(function () { calls += 1; });
  s.set({ n: 1 });
  s.set({ n: 2 });
  await wait();
  assert.equal(calls, 1);
  assert.equal(s.get('n'), 2);

  // Await the polyfilled Promise itself: a fixed wait was flaky under load.
  const chosen = await vf.i18n.setup({ locales: ['ko', 'en'], locale: 'ko', messages: { ko: { hi: '안녕 {name}' } } });
  assert.equal(chosen, 'ko');
  assert.equal(vf.t('hi', { name: '민수' }), '안녕 민수');
});

test('data-vf-keep, attach and form helpers work', () => {
  const { vf, page } = iePage();
  const box = vf.vfunc({
    state: { label: 'a' },
    render: function (s) { return vf.tpl('<p>{label}</p><div data-vf-keep="chart"></div>', s); }
  });
  box.mount(page.document.body);
  const kept = box.$node.querySelector('[data-vf-keep]');
  kept.textContent = 'drawn by a third-party widget';
  box.label = 'b';
  box.refresh();
  assert.equal(box.$node.querySelector('[data-vf-keep]'), kept);
  assert.equal(box.$node.querySelector('p').textContent, 'b');

  page.document.body.innerHTML = '<form id="f"><input id="name" value="Kim"><input id="ok" type="checkbox" checked>' +
    '<button type="button" data-action="save">save</button></form>';
  let values = null;
  vf.attach('#f', { delegates: [{ selector: '[data-action="save"]', eventType: 'click',
    onEvent: function (e) { values = vf.form.values(e.sender.$node); } }] });
  click(page, page.document.querySelector('button'));
  assert.equal(JSON.stringify(values), '{"name":"Kim","ok":true}'); // object from the page's realm
});

// ---- the manual test page (browser.html + browser-tests.js) -----------------------------------

const pageBody = readFileSync(new URL('./browser.html', import.meta.url), 'utf8')
  .replace(/^[\s\S]*<body>|<script[\s\S]*$/g, '');
const pageTests = readFileSync(new URL('./browser-tests.js', import.meta.url), 'utf8');

/** Runs browser-tests.js; the <script> it adds is intercepted and the dist file run in its place. */
function runTestPage(file, options) {
  const env = iePage(Object.assign({ url: 'https://example.test/layer1/test/browser.html?file=' + file,
    body: pageBody, load: false }, options));
  const head = env.page.document.getElementsByTagName('head')[0];
  let script = null;
  head.appendChild = (element) => { script = element; return element; };
  runInContext(pageTests, env.context, { filename: 'browser-tests.js' });
  assert.ok(script, 'the page adds a <script> for the file under test');
  assert.equal(script.src.split('/').pop(), file);
  runInContext(readFileSync(new URL('../dist/' + file, import.meta.url), 'utf8'), env.context, { filename: file });
  script.onload();
  return new Promise((resolve) => {
    const started = Date.now();
    const summary = env.page.document.getElementById('summary');
    (function poll() {
      if (/^(PASS|FAIL)/.test(summary.textContent) || Date.now() - started > 15000) {
        const rows = Array.prototype.map.call(env.page.document.querySelectorAll('#results li'), (li) => li.textContent);
        resolve({ title: summary.textContent, failed: rows.filter((r) => r.indexOf('FAIL') === 0), count: rows.length });
      } else {
        setTimeout(poll, 20);
      }
    })();
  });
}

test('the manual test page passes with the legacy file in an IE-like page', async () => {
  const result = await runTestPage('vfunc.legacy.min.js');
  assert.deepEqual(result.failed, []);
  assert.match(result.title, /^PASS (\d+)\/\1 /);
  assert.equal(result.count, (pageTests.match(/^ {2}test\('/gm) || []).length, 'every test of the page ran');
});

for (const [label, relative] of [['the test page script', './browser-tests.js'], ['sample 16 app code', '../examples/16-legacy-ie/app.es5.js']]) {
  test(label + ' is ES5, so IE11 can parse it', () => {
    const cli = fileURLToPath(new URL('../../node_modules/es-check/lib/cli/index.js', import.meta.url));
    const target = fileURLToPath(new URL(relative, import.meta.url)).split('\\').join('/');
    const run = spawnSync(process.execPath, [cli, 'es5', target, '--checkFeatures', '--allowList', 'Promise,PromiseResolve'],
      { encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr || run.stdout);
  });
}

test('the manual test page passes with the modern files', async () => {
  for (const file of ['vfunc.min.js', 'vfunc.js']) {
    const result = await runTestPage(file, { nativePromise: true });
    assert.deepEqual(result.failed, [], file);
    assert.match(result.title, /^PASS/, file);
  }
});

// ---- the Promise polyfill itself --------------------------------------------------------------

test('polyfill: then chains, adopts thenables, and routes errors to catch', async () => {
  const log = [];
  await new Promise((done) => {
    SimplePromise.resolve(1)
      .then((v) => v + 1)
      .then((v) => ({ then: (ok) => ok(v * 10) }))
      .then((v) => { log.push(v); throw new Error('boom'); })
      .then(() => log.push('skipped'))
      .catch((err) => { log.push(err.message); return 'recovered'; })
      .finally(() => log.push('finally'))
      .then((v) => { log.push(v); done(); });
  });
  assert.deepEqual(log, [20, 'boom', 'finally', 'recovered']);
});

test('polyfill: callbacks run asynchronously and settle only once', async () => {
  const log = [];
  const p = new SimplePromise((resolve, reject) => { resolve('a'); resolve('b'); reject(new Error('c')); });
  p.then((v) => log.push(v));
  log.push('sync');
  await wait();
  assert.deepEqual(log, ['sync', 'a']);
});

test('polyfill: all, race, reject and self-resolution', async () => {
  const all = await new Promise((done) => {
    SimplePromise.all([1, SimplePromise.resolve(2), new SimplePromise((r) => setTimeout(() => r(3), 5))]).then(done);
  });
  assert.deepEqual(all, [1, 2, 3]);
  const empty = await new Promise((done) => SimplePromise.all([]).then(done));
  assert.deepEqual(empty, []);
  const first = await new Promise((done) => {
    SimplePromise.race([new SimplePromise((r) => setTimeout(() => r('slow'), 20)), SimplePromise.resolve('fast')]).then(done);
  });
  assert.equal(first, 'fast');
  const reason = await new Promise((done) => SimplePromise.reject(new Error('no')).then(null, done));
  assert.equal(reason.message, 'no');
  const self = await new Promise((done) => {
    const p = SimplePromise.resolve().then(() => p);
    p.then(null, done);
  });
  assert.ok(self instanceof TypeError);
  assert.throws(() => SimplePromise(() => {}), TypeError);
});
