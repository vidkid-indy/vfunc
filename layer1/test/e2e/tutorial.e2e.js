// SPDX-License-Identifier: Apache-2.0
//
// The tutorial's step pages (site/tutorial/<lang>/NN-name/, site page "tutorial") in the VF_BROWSER
// engine: each step opens with no console problem and does what the page says it does.
// With VF_TUTORIAL_SHOTS=1 (Chromium) the same run saves the screenshots the page shows into
// site/tutorial/img/<lang>/. Run it after changing a step or the design tokens, then commit the images.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { launchBrowser, ENGINE } from './browser.mjs';
import { startServer, ROOT } from './serve.mjs';
import { buildSite } from '../../../build/site.mjs';

const SHOTS = process.env.VF_TUTORIAL_SHOTS === '1';
const LANGS = ['ko', 'en'];
const VIEWPORT = { width: 720, height: 460 };

// The words each language's steps use (the pages are written in the reader's language).
const WORDS = {
  ko: { name: '민지', greeting: '안녕하세요, 민지님!', items: ['장보기', '운동 30분', '책 읽기'], added: '추가했습니다', remove: '삭제', empty: '할 일이 없습니다' },
  en: { name: 'Alex', greeting: 'Hello, Alex!', items: ['Buy groceries', 'Walk 30 minutes', 'Read a book'], added: 'Added', remove: 'Delete', empty: 'Nothing to do' }
};

let browser;
let server;
let dir;

before(async () => {
  dir = mkdtempSync(join(tmpdir(), 'vf-tutorial-'));
  buildSite(dir);
  server = await startServer(dir);
  browser = await launchBrowser();
});

after(async () => {
  if (browser) await browser.close();
  if (server) await server.close();
  if (dir) rmSync(dir, { recursive: true, force: true });
});

async function open(lang, step, options, saved) {
  const context = await browser.newContext(Object.assign({ viewport: VIEWPORT, locale: lang === 'ko' ? 'ko-KR' : 'en-US' }, options));
  // A list saved by step 4 or 5 before the page opens (the key the steps use).
  if (saved) await context.addInitScript((items) => localStorage.setItem('vfunc-tutorial-todo', items), JSON.stringify(saved));
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') problems.push('console.' + msg.type() + ': ' + msg.text()); });
  page.on('pageerror', (err) => problems.push('page error: ' + err.message));
  page.on('response', (res) => { if (res.status() >= 400) problems.push('HTTP ' + res.status() + ': ' + res.url()); });
  await page.goto(server.origin + '/tutorial/' + lang + '/' + step + '/');
  // The picture ends below the app's content; `whole` keeps the full screen (dialogs, toasts).
  const shot = async (name, whole) => {
    if (!SHOTS || ENGINE !== 'chromium') return;
    const folder = join(ROOT, 'site', 'tutorial', 'img', lang);
    mkdirSync(folder, { recursive: true });
    await page.waitForTimeout(300);
    const bottom = await page.evaluate(() => document.getElementById('app').getBoundingClientRect().bottom);
    const height = whole ? VIEWPORT.height : Math.min(VIEWPORT.height, Math.ceil(bottom) + 40);
    await page.screenshot({ path: join(folder, name + '.png'), animations: 'disabled', clip: { x: 0, y: 0, width: VIEWPORT.width, height: height } });
  };
  return { page, context, problems, shot };
}

async function add(page, text) {
  await page.fill('[data-ref="input"]', text);
  await page.press('[data-ref="input"]', 'Enter');
}

const count = (page, selector) => page.locator(selector).count();

const STEPS = {
  '01-hello': async (lang, w) => {
    const { page, context, problems, shot } = await open(lang, '01-hello');
    await page.fill('#name', w.name);
    await page.waitForFunction((g) => document.querySelector('[data-ref="greeting"]').textContent === g, w.greeting);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'name', 'focus stays in the input');
    await shot('01-hello');
    await context.close();
    return problems;
  },

  '02-add': async (lang, w) => {
    const { page, context, problems, shot } = await open(lang, '02-add');
    await add(page, w.items[0]);
    await add(page, w.items[1]);
    await page.waitForFunction(() => document.querySelectorAll('li').length === 2);
    assert.equal(await page.inputValue('[data-ref="input"]'), '', 'the input is empty again');
    await shot('02-add');
    await context.close();
    return problems;
  },

  '03-done': async (lang, w) => {
    const { page, context, problems, shot } = await open(lang, '03-done');
    for (const item of w.items) await add(page, item);
    await page.waitForFunction(() => document.querySelectorAll('[data-id]').length === 3);
    await page.check('#done-1');
    await page.waitForFunction(() => document.querySelector('[data-id="1"]').getAttribute('data-state') === 'done');
    assert.equal(await page.innerText('[data-ref="left"]'), '2');
    await shot('03-done');
    await page.click('[data-id="3"] [data-action="remove"]');
    await page.waitForFunction(() => document.querySelectorAll('[data-id]').length === 2);
    assert.equal(await page.innerText('[data-ref="left"]'), '1');
    await context.close();
    return problems;
  },

  '04-save': async (lang, w) => {
    const { page, context, problems, shot } = await open(lang, '04-save');
    for (const item of w.items) await add(page, item);
    await page.waitForFunction(() => document.querySelectorAll('[data-id]').length === 3);
    await page.check('#done-2');
    await page.waitForFunction(() => document.querySelector('[data-id="2"]').getAttribute('data-state') === 'done');
    await page.reload();
    await page.waitForFunction(() => document.querySelectorAll('[data-id]').length === 3);
    assert.equal(await page.getAttribute('[data-id="2"]', 'data-state'), 'done', 'kept after a reload');
    await add(page, 'x');
    await page.waitForFunction(() => document.querySelector('[data-id="4"]') !== null);   // ids go on after the saved ones
    await page.click('[data-id="4"] [data-action="remove"]');
    await page.waitForFunction(() => document.querySelectorAll('[data-id]').length === 3);
    await shot('04-save');
    await context.close();
    return problems;
  },

  '05-components': async (lang, w) => {
    const { page, context, problems, shot } = await open(lang, '05-components');
    await page.getByText(w.empty).waitFor();
    await shot('05-empty');
    await add(page, w.items[0]);
    await add(page, w.items[1]);
    await page.waitForFunction(() => document.querySelectorAll('[data-id]').length === 2);
    await page.getByText(w.added + ': ' + w.items[1]).waitFor();
    await shot('05-toast', true);
    await page.click('[data-id="1"] [data-action="remove"]');
    const dialog = page.getByRole('alertdialog');
    await dialog.waitFor();
    assert.match(await dialog.innerText(), new RegExp(w.items[0]));
    await shot('05-confirm', true);
    await page.keyboard.press('Escape');                                  // no: the item stays
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await count(page, '[data-id]'), 2);
    await page.click('[data-id="1"] [data-action="remove"]');
    await dialog.getByRole('button', { name: w.remove, exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-id]').length === 1);
    await context.close();

    // The same page in the dark theme (tokens follow the OS setting).
    const dark = await open(lang, '05-components', { colorScheme: 'dark' },
      w.items.map((text, i) => ({ id: i + 1, text: text, done: i === 1 })));
    await dark.page.waitForFunction(() => document.querySelectorAll('[data-id]').length === 3);
    await dark.shot('05-dark');
    await dark.context.close();
    return problems.concat(dark.problems);
  }
};

test('every step of both languages has a check, and the languages have the same steps', () => {
  const steps = LANGS.map((lang) => readdirSync(join(ROOT, 'site', 'tutorial', lang)).filter((n) => /^\d\d-/.test(n)).sort());
  assert.deepEqual(steps[1], steps[0]);
  assert.deepEqual(steps[0].filter((name) => !STEPS[name]), []);
});

for (const lang of LANGS) {
  for (const name of Object.keys(STEPS)) {
    test(lang + ' ' + name, async () => {
      const problems = await STEPS[name](lang, WORDS[lang]);
      assert.deepEqual(problems, []);
    });
  }
}
