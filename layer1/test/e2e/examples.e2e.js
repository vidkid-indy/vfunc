// SPDX-License-Identifier: Apache-2.0
//
// Smoke tests of every sample in layer1/examples with Playwright (Chromium), run by
// `npm run test:examples`. A sample passes when it has no console error or warning, no page
// error, no failed request, and its own checks below pass.
// Samples that load a CDN library need network access.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { startServer, ROOT } from './serve.mjs';
import { CHECKS } from './checks.mjs';

const EXAMPLES = join(ROOT, 'layer1', 'examples');
const samples = readdirSync(EXAMPLES, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^\d\d-/.test(d.name) && existsSync(join(EXAMPLES, d.name, 'index.html')))
  .map((d) => d.name)
  .sort();

let browser;
let server;

before(async () => {
  server = await startServer();
  browser = await chromium.launch();
});

after(async () => {
  if (browser) await browser.close();
  if (server) await server.close();
});

/** Opens a page and records every problem the page reports. */
export async function openPage(path, options) {
  const context = await browser.newContext(options && options.context);
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') problems.push('console.' + msg.type() + ': ' + msg.text());
  });
  page.on('pageerror', (err) => problems.push('page error: ' + err.message));
  page.on('requestfailed', (req) => problems.push('request failed: ' + req.url() + ' ' + (req.failure() && req.failure().errorText)));
  page.on('response', (res) => { if (res.status() >= 400) problems.push('HTTP ' + res.status() + ': ' + res.url()); });
  await page.goto(server.origin + path, { waitUntil: 'load' });
  return { page, context, problems };
}

test('every sample has its own checks', () => {
  assert.deepEqual(samples.filter((name) => !CHECKS[name]), []);
});

test('the sample index links every sample', async () => {
  const { page, context, problems } = await openPage('/layer1/examples/');
  const links = await page.$$eval('a[href]', (anchors) => anchors.map((a) => a.getAttribute('href')));
  await context.close();
  assert.deepEqual(problems, []);
  assert.deepEqual(samples.filter((name) => links.indexOf('./' + name + '/') < 0), []);
});

for (const name of samples) {
  test(name, async () => {
    const check = CHECKS[name];
    const { page, context, problems } = await openPage('/layer1/examples/' + name + '/', check && check.open);
    try {
      if (check) await check.run(page, { server: server, problems: problems, openPage: openPage });
      await page.waitForTimeout(50);
      assert.deepEqual(problems, []);
    } finally {
      await context.close();
    }
  });
}
