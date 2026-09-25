// SPDX-License-Identifier: Apache-2.0
// Phase 2 app features: vf.router, vf.store, vf.i18n / vf.t / vf.fmt, vf.use, protected API.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { window, flush, click, captureWarnings } from './setup-dom.js';
import vf from '../src/vfunc.js';

// ---- router -----------------------------------------------------------------------------------

test('hash router matches params, query and notFound', async () => {
  window.location.hash = '';
  const seen = [];
  const r = vf.router({
    routes: {
      '/': (ctx) => seen.push(['home', ctx.path]),
      '/users/:id': (ctx) => seen.push(['user', ctx.params.id, ctx.query.tab]),
      '/files/*': (ctx) => seen.push(['files', ctx.params.wildcard])
    },
    notFound: (ctx) => seen.push(['404', ctx.path])
  });
  r.start();
  r.go('/users/7?tab=posts');
  await flush();
  r.go('/files/a/b%20c');
  await flush();
  r.go('/nope');
  await flush();
  r.stop();
  assert.deepEqual(seen, [
    ['home', '/'],
    ['user', '7', 'posts'],
    ['files', 'a/b c'],
    ['404', '/nope']
  ]);
  assert.equal(r.current().path, '/nope');
});

test('router refuses javascript:, external and protocol-relative targets', async () => {
  window.location.hash = '#/';
  const seen = [];
  const r = vf.router({ routes: { '/': () => seen.push('/') } });
  r.start();
  const warnings = captureWarnings(() => {
    r.go('javascript:alert(1)');
    r.go('https://evil.test/');
    r.go('//evil.test/');
    r.go('users');
  });
  await flush();
  r.stop();
  assert.equal(warnings.length, 4);
  assert.equal(window.location.hash, '#/');
});

test('router follows data-link clicks and ignores other links', async () => {
  window.location.hash = '#/';
  document.body.innerHTML = '<a id="in" data-link href="#/about">in</a>' +
    '<a id="out" data-link href="https://other.test/">out</a>' +
    '<a id="newtab" data-link target="_blank" href="#/x">new</a>';
  const seen = [];
  const r = vf.router({ routes: { '/': () => {}, '/about': () => seen.push('about') } });
  r.start();
  click(document.getElementById('in'));
  await flush();
  click(document.getElementById('out'));
  click(document.getElementById('newtab'));
  await flush();
  r.stop();
  assert.deepEqual(seen, ['about']);
  document.body.innerHTML = '';
});

test('history router uses real paths under a base', async () => {
  window.history.replaceState({}, '', '/app/');
  const seen = [];
  const r = vf.router({ mode: 'history', base: '/app', routes: { '/': () => seen.push('home'), '/items/:id': (c) => seen.push(c.params.id) } });
  r.start();
  r.go('/items/3');
  assert.equal(window.location.pathname, '/app/items/3');
  assert.equal(r.href('/x'), '/app/x');
  r.stop();
  assert.deepEqual(seen, ['home', '3']);
});

test('router focuses the configured element after navigation', async () => {
  window.location.hash = '#/';
  document.body.innerHTML = '<main id="main"></main>';
  const r = vf.router({ routes: { '/': () => {}, '/b': () => {} }, focus: '#main' });
  r.start();
  r.go('/b');
  await flush();
  r.stop();
  assert.equal(document.activeElement.id, 'main');
  assert.equal(document.getElementById('main').getAttribute('tabindex'), '-1');
  document.body.innerHTML = '';
});

// ---- store ------------------------------------------------------------------------------------

test('store merges, batches notifications and unsubscribes', async () => {
  const s = vf.store({ count: 0 });
  const seen = [];
  const off = s.subscribe((state) => seen.push(state.count));
  s.set({ count: 1 });
  s.set((state) => ({ count: state.count + 1 }));
  await flush();
  assert.deepEqual(seen, [2]);
  assert.equal(s.get('count'), 2);
  off();
  s.set({ count: 3 });
  await flush();
  assert.deepEqual(seen, [2]);
});

test('store ignores prototype keys from outside data', async () => {
  const s = vf.store();
  s.set(JSON.parse('{"__proto__": {"polluted": 1}, "ok": 1}'));
  await flush();
  assert.equal({}.polluted, undefined);
  assert.equal(s.get('ok'), 1);
  assert.equal(s.get('toString'), undefined);
});

// ---- i18n -------------------------------------------------------------------------------------

test('i18n: setup, t with params and plurals, fallback and missing keys', async () => {
  const locale = await vf.i18n.setup({
    locale: 'ko',
    locales: ['ko', 'en'],
    messages: {
      en: { hello: 'Hello, {name}', cart: { items: { zero: 'No items', one: '{count} item', other: '{count} items' } }, onlyEn: 'EN' },
      ko: { hello: '안녕하세요, {name}님', cart: { items: { zero: '비어 있음', other: '{count}개' } } }
    }
  });
  assert.equal(locale, 'ko');
  assert.equal(document.documentElement.lang, 'ko');
  assert.equal(vf.t('hello', { name: '<b>' }), '안녕하세요, <b>님', 't returns plain text');
  assert.equal(String(vf.html`<p>${vf.t('hello', { name: '<b>' })}</p>`), '<p>안녕하세요, &lt;b&gt;님</p>');
  assert.equal(vf.t('cart.items', { count: 0 }), '비어 있음');
  assert.equal(vf.t('cart.items', { count: 3 }), '3개');
  assert.equal(vf.t('onlyEn'), 'EN', 'falls back to the fallback locale');
  const warnings = captureWarnings(() => assert.equal(vf.t('no.such.key'), 'no.such.key'));
  assert.equal(warnings.length, 1);
  await vf.i18n.set('en');
  assert.equal(vf.t('cart.items', { count: 1 }), '1 item');
});

test('i18n finds a whole dotted key as well as a nested path', async () => {
  await vf.i18n.setup({
    locale: 'en',
    locales: ['en'],
    messages: { en: { 'nav.home': 'Home', nav: { servers: 'Servers', home: 'nested loses' }, 'cart.items': { one: '{count} item', other: '{count} items' } } }
  });
  assert.equal(vf.t('nav.home'), 'Home', 'the whole key wins');
  assert.equal(vf.t('nav.servers'), 'Servers', 'nested path');
  assert.equal(vf.t('cart.items', { count: 2 }), '2 items', 'plurals under a whole key');
});

test('i18n refuses locales outside the allow-list and path-like values', async () => {
  await vf.i18n.setup({ locale: 'en', locales: ['en', 'ko'], messages: { en: {}, ko: {} } });
  let result;
  captureWarnings(() => { result = vf.i18n.set('../../etc/passwd'); });
  assert.equal(await result, 'en');
  captureWarnings(() => { result = vf.i18n.set('fr'); });
  assert.equal(await result, 'en');
  assert.equal(await vf.i18n.set('ko-KR'), 'ko', 'a region tag falls back to its base language');
});

test('i18n loads messages on demand, persists and notifies subscribers', async () => {
  window.localStorage.clear();
  const requested = [];
  await vf.i18n.setup({
    locale: 'en', locales: ['en', 'ja'], persist: true,
    messages: { en: { hi: 'hi' } },
    load: async (loc) => { requested.push(loc); return { hi: 'こんにちは' }; }
  });
  const seen = [];
  const off = vf.i18n.subscribe((loc) => seen.push(loc));
  await vf.i18n.set('ja');
  off();
  assert.deepEqual(requested, ['ja']);
  assert.equal(vf.t('hi'), 'こんにちは');
  assert.deepEqual(seen, ['ja']);
  assert.equal(window.localStorage.getItem('vf.locale'), 'ja');
  // A new setup without an explicit locale picks the persisted one.
  assert.equal(await vf.i18n.setup({ locales: ['en', 'ja'], persist: true, messages: { en: {}, ja: {} } }), 'ja');
});

test('i18n defaults sit below the app messages in any order and do not stop load', async () => {
  const requested = [];
  // Built-in defaults (as layer 2 adds them) before and after the app's messages.
  vf.i18n.add('de', { grid: { empty: 'Keine Daten', next: 'Weiter' } }, { defaults: true });
  vf.i18n.add('en', { grid: { empty: 'No data', next: 'Next', prev: 'Previous' } }, { defaults: true });
  await vf.i18n.setup({
    locale: 'en', locales: ['en', 'de'],
    messages: { en: { grid: { empty: 'Nothing here' } } },
    load: async (loc) => { requested.push(loc); return { grid: { next: 'Nächste' } }; }
  });
  vf.i18n.add('en', { grid: { empty: 'late default' } }, { defaults: true });
  assert.equal(vf.t('grid.empty'), 'Nothing here', 'the app wins even over defaults added later');
  assert.equal(vf.t('grid.next'), 'Next', 'a default fills what the app does not define');
  await vf.i18n.set('de');
  assert.deepEqual(requested, ['de'], 'defaults for a locale do not count as loaded');
  assert.equal(vf.t('grid.next'), 'Nächste', 'loaded app messages win');
  assert.equal(vf.t('grid.empty'), 'Keine Daten', 'then the locale defaults');
  assert.equal(vf.t('grid.prev'), 'Previous', 'then the fallback locale (app, then defaults)');
  await vf.i18n.set('en');
});

test('i18n messages cannot pollute prototypes', async () => {
  await vf.i18n.setup({ locale: 'en', messages: { en: JSON.parse('{"__proto__": {"polluted": 1}, "a": {"__proto__": {"x": 1}}}') } });
  assert.equal({}.polluted, undefined);
  assert.equal({}.x, undefined);
});

test('i18n.apply translates text and allowed attributes only, never as HTML', async () => {
  await vf.i18n.setup({ locale: 'en', messages: { en: { title: '<b>Hi</b>', ph: 'Your name', bad: 'javascript:alert(1)' } } });
  document.body.innerHTML = '<h1 data-i18n="title"></h1><input data-i18n-attr="placeholder:ph; href:bad; onclick:bad">';
  let warnings;
  warnings = captureWarnings(() => vf.i18n.apply());
  assert.equal(document.querySelector('h1').textContent, '<b>Hi</b>');
  assert.equal(document.querySelector('h1').children.length, 0);
  const input = document.querySelector('input');
  assert.equal(input.getAttribute('placeholder'), 'Your name');
  assert.equal(input.getAttribute('href'), null);
  assert.equal(input.getAttribute('onclick'), null);
  assert.equal(warnings.length, 2);
  document.body.innerHTML = '';
});

test('fmt follows the current locale', async () => {
  await vf.i18n.setup({ locale: 'en', messages: { en: {} } });
  assert.equal(vf.fmt.number(1234.5), '1,234.5');
  assert.match(vf.fmt.currency(1000, 'USD'), /\$1,000/);
  assert.equal(vf.fmt.date(new Date(Date.UTC(2026, 8, 24)), { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }), '09/24/2026');
  assert.equal(typeof vf.fmt.relative(-1, 'day'), 'string');
});

// ---- use / ext / protection -------------------------------------------------------------------

test('use installs a plugin into vf.ext and refuses duplicates and bad plugins', () => {
  const installed = vf.use({ name: 'greet', requires: '^1.0.0', install: (api, opts) => ({ hi: () => 'hi ' + opts.who }) }, { who: 'kim' });
  assert.equal(installed.hi(), 'hi kim');
  assert.equal(vf.ext.greet, installed);
  const warnings = captureWarnings(() => {
    vf.use({ name: 'greet', install: () => 1 });
    vf.use({ name: '__proto__', install: () => 1 });
    vf.use({ install: () => 1 });
  });
  assert.equal(warnings.length, 3);
  assert.equal(vf.ext.greet, installed);
});

test('official members cannot be replaced', () => {
  const original = vf.html;
  assert.throws(() => { 'use strict'; vf.html = () => 'evil'; }, TypeError);
  assert.throws(() => { delete vf.esc; }, TypeError);
  assert.throws(() => { vf.form.values = null; }, TypeError);
  assert.throws(() => { vf.i18n.set = null; }, TypeError);
  assert.equal(vf.html, original);
  vf.newLayer2Member = 1; // the object stays extensible for layer 2 and 3
  assert.equal(vf.newLayer2Member, 1);
  delete vf.newLayer2Member;
});
