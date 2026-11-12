// SPDX-License-Identifier: Apache-2.0
//
// The landing page (/ko/, /en/, D-048) in the VF_BROWSER engine: the live demo works, the numbers are
// the build's, and it fits a phone. With VF_SITE_SHOTS=1 (Chromium) the run also saves the component
// gallery picture the page shows (site/assets/img/gallery.png); commit it after the gallery changes.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { launchBrowser, ENGINE } from './browser.mjs';
import { startServer, ROOT } from './serve.mjs';
import { buildSite, landingNumbers } from '../../../build/site.mjs';

let browser;
let server;
let dir;

before(async () => {
  dir = mkdtempSync(join(tmpdir(), 'vf-landing-'));
  buildSite(dir);
  server = await startServer(dir);
  browser = await launchBrowser();
});

after(async () => {
  if (browser) await browser.close();
  if (server) await server.close();
  if (dir) rmSync(dir, { recursive: true, force: true });
});

async function open(path, options) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') problems.push('console.' + msg.type() + ': ' + msg.text()); });
  page.on('pageerror', (err) => problems.push('page error: ' + err.message));
  page.on('response', (res) => { if (res.status() >= 400) problems.push('HTTP ' + res.status() + ': ' + res.url()); });
  await page.goto(server.origin + path);
  return { page, context, problems };
}

for (const lang of ['ko', 'en']) {
  test(lang + ' landing: live demo, build numbers, menu on a phone', async () => {
    const { page, context, problems } = await open('/' + lang + '/index.html');
    try {
      await page.waitForSelector('#home-demo[data-state="live"]');
      await page.fill('#demo-name', '<b>Kim</b>');
      await page.waitForFunction(() => document.querySelector('[data-ref="greeting"]').textContent.indexOf('<b>Kim</b>') >= 0);
      assert.equal(await page.locator('[data-ref="greeting"] b').count(), 0, 'escaped, not bold');
      await page.click('#home-demo [data-action="add"]');
      await page.waitForFunction(() => document.querySelector('[data-ref="count"]').textContent === '1');
      const n = landingNumbers(lang);
      const text = await page.innerText('#content');
      for (const value of [n.engine, n.ui, n.components]) assert.ok(text.indexOf(value) >= 0, 'shows ' + value);
      assert.equal(await page.locator('#content h2').count(), 8);
      assert.deepEqual(problems, []);
    } finally {
      await context.close();
    }

    const phone = await open('/' + lang + '/index.html', { viewport: { width: 360, height: 740 } });
    try {
      assert.equal(await phone.page.isVisible('#site-nav'), false);
      await phone.page.click('#nav-toggle');
      assert.equal(await phone.page.isVisible('#site-nav'), true, 'the menu opens the docs navigation');
      assert.deepEqual(phone.problems, []);
    } finally {
      await phone.context.close();
    }
  });
}

test('gallery picture for the landing page', { skip: process.env.VF_SITE_SHOTS !== '1' || ENGINE !== 'chromium' }, async () => {
  const { page, context, problems } = await open('/layer2/examples/gallery/index.html', { viewport: { width: 1100, height: 640 } });
  try {
    await page.waitForTimeout(500);
    const folder = join(ROOT, 'site', 'assets', 'img');
    mkdirSync(folder, { recursive: true });
    await page.screenshot({ path: join(folder, 'gallery.png'), animations: 'disabled' });
    assert.deepEqual(problems, []);
  } finally {
    await context.close();
  }
});
