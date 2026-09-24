// SPDX-License-Identifier: Apache-2.0
//
// The starter template in the VF_BROWSER engine (npm run test:examples): the app itself, the design preview,
// and the release flow of plan O-3 — deploy v1, deploy v2 into a new version folder, and see the
// open page switch to v2 (including a changed sub-module) on the next screen change.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './browser.mjs';
import { startServer } from './serve.mjs';
import { release } from '../../starter/tools/release.mjs';

const STARTER = fileURLToPath(new URL('../../starter/', import.meta.url));

let browser;
let server;

before(async () => {
  server = await startServer();
  browser = await launchBrowser();
});

after(async () => {
  if (browser) await browser.close();
  if (server) await server.close();
});

async function open(origin, path, contextOptions, beforeGoto) {
  const context = await browser.newContext(Object.assign({ locale: 'en-US' }, contextOptions));
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') problems.push('console.' + msg.type() + ': ' + msg.text()); });
  page.on('pageerror', (err) => problems.push('page error: ' + err.message));
  page.on('requestfailed', (req) => problems.push('request failed: ' + req.url()));
  page.on('response', (res) => { if (res.status() >= 400) problems.push('HTTP ' + res.status() + ': ' + res.url()); });
  if (beforeGoto) await beforeGoto(page);
  await page.goto(origin + path);
  return { page, context, problems };
}

const text = (page, selector) => page.locator(selector).first().innerText();

test('starter: pages, store, i18n and theme work with no console problems', async () => {
  const { page, context, problems } = await open(server.origin, '/layer1/starter/');
  try {
    await page.waitForSelector('#view [data-ref="heading"]');
    assert.equal(await text(page, '#view [data-ref="heading"]'), 'Welcome');
    assert.match(await text(page, '#view [data-ref="version"]'), /1\.0\.0/);
    await page.click('#view [data-link]');
    await page.waitForSelector('#view [data-ref="list"] [data-id]');
    assert.equal(await page.locator('#view [data-id]').count(), 3);
    await page.fill('#view [data-ref="name"]', '<b>New</b>');
    await page.press('#view [data-ref="name"]', 'Enter');
    await page.waitForFunction(() => document.querySelectorAll('#view [data-id]').length === 4);
    assert.equal(await page.locator('#view [data-ref="list"] b').count(), 0, 'escaped');
    await page.focus('#fav-i2'); // keyboard: Safari does not focus buttons on click
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => /1 favorite/.test(document.querySelector('[data-ref="favorites"]').textContent));
    assert.equal(await page.getAttribute('#fav-i2', 'aria-pressed'), 'true');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'fav-i2', 'focus kept');
    await page.click('#top [href="#/settings"]');
    await page.waitForSelector('#locale-ko');
    await page.check('#locale-ko');
    await page.waitForFunction(() => document.documentElement.lang === 'ko');
    assert.equal(await text(page, '#view [data-ref="heading"]'), '설정');
    assert.match(await text(page, '[data-ref="favorites"]'), /즐겨찾기 1개/);
    await page.check('#theme-dark');
    assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
    await page.reload();
    await page.waitForSelector('#view [data-ref="heading"]');
    assert.equal(await text(page, '#view [data-ref="heading"]'), '설정', 'locale remembered');
    assert.equal(await page.getAttribute('html', 'data-theme'), 'dark', 'theme remembered before paint');
    await page.evaluate(() => { location.hash = '#/missing'; });
    await page.waitForFunction(() => document.querySelector('#view [data-ref="heading"]').textContent === '없는 페이지');
    assert.deepEqual(problems, []);
  } finally {
    await context.close();
  }
});

test('starter: design preview opens cleanly', async () => {
  const { page, context, problems } = await open(server.origin, '/layer1/starter/design-preview.html');
  try {
    assert.equal(await page.locator('.swatch').count(), 9);
    assert.deepEqual(problems, []);
  } finally {
    await context.close();
  }
});

test('starter: a new release in a version folder reaches an open page on the next screen change', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'vf-release-'));
  const site = await startServer(join(dir, 'dist'));
  try {
    cpSync(STARTER, dir, { recursive: true, filter: (src) => !/[\\/]dist([\\/]|$)/.test(src.slice(STARTER.length)) });
    release(dir, { version: '1.0.0' });

    const { page, context, problems } = await open(site.origin, '/', {}, (p) => p.clock.install());
    try {
      await page.waitForSelector('#view [data-ref="version"]');
      assert.match(await text(page, '#view [data-ref="version"]'), /1\.0\.0/);
      await page.evaluate(() => { window.__openedBefore = true; });

      // v2: change config.js and a page module (a sub-module that ?v= could never reach). / 하위 모듈 변경
      const config = join(dir, 'config.js');
      writeFileSync(config, readFileSync(config, 'utf8').replace("APP_VERSION = '1.0.0'", "APP_VERSION = '1.0.1'"));
      const home = join(dir, 'pages', 'home.js');
      writeFileSync(home, readFileSync(home, 'utf8').replace("vf.t('home.title')", "vf.t('home.title') + ' (v2)'"));
      release(dir, { version: '1.0.1' });

      await page.clock.fastForward('01:00');                  // past minGap / 최소 간격 지남
      await page.click('#top [href="#/items"]');              // this navigation triggers the check
      await page.waitForSelector('#view [data-ref="list"]');
      await page.waitForTimeout(200);                         // let version.json arrive
      const reloaded = page.waitForEvent('load');
      await page.click('#top [href="#/"]');                   // next navigation → reload into v2
      await reloaded;
      await page.waitForSelector('#view [data-ref="heading"]');
      assert.equal(await page.evaluate(() => window.__openedBefore), undefined, 'the page was replaced');
      assert.equal(await text(page, '#view [data-ref="heading"]'), 'Welcome (v2)', 'the changed sub-module is loaded');
      assert.match(await text(page, '#view [data-ref="version"]'), /1\.0\.1/);
      assert.deepEqual(problems, []);
    } finally {
      await context.close();
    }
  } finally {
    await site.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
