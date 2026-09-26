// SPDX-License-Identifier: Apache-2.0
//
// The adapter contract page (layer2/adapters/_contract/contract.html) in a real browser
// (VF_BROWSER, default Chromium), run by `npm run test:examples`: the built-in vfGrid / vfChart and
// the four official adapters with the real vendors from jsDelivr (D-034 7). Needs network access.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launchBrowser } from '../../../layer1/test/e2e/browser.mjs';
import { startServer } from '../../../layer1/test/e2e/serve.mjs';

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

test('every adapter passes the grid / chart contract with its real vendor', async () => {
  const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1200, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') problems.push('console.' + msg.type() + ': ' + msg.text()); });
  page.on('pageerror', (err) => problems.push('page error: ' + err.message));
  page.on('requestfailed', (req) => problems.push('request failed: ' + req.url()));
  try {
    await page.goto(server.origin + '/layer2/adapters/_contract/contract.html', { waitUntil: 'load' });
    await page.waitForFunction(() => window.__contract && window.__contract.done, null, { timeout: 180000 });
    const result = await page.evaluate(() => window.__contract);
    assert.deepEqual(result.failures, []);
    assert.ok(result.passed >= 45, '45 checks (6 suites): ' + result.passed);
    assert.deepEqual(problems, []);
  } finally {
    await context.close();
  }
});
