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

/** Opens a contract page, waits for its runner and returns { result, problems }. */
async function runPage(path) {
  const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1200, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') problems.push('console.' + msg.type() + ': ' + msg.text()); });
  page.on('pageerror', (err) => problems.push('page error: ' + err.message));
  page.on('requestfailed', (req) => problems.push('request failed: ' + req.url()));
  try {
    await page.goto(server.origin + path, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__contract && window.__contract.done, null, { timeout: 180000 });
    return { result: await page.evaluate(() => window.__contract), problems };
  } finally {
    await context.close();
  }
}

test('every adapter passes the grid / chart contract with its real vendor', async () => {
  const { result, problems } = await runPage('/layer2/adapters/_contract/contract.html');
  assert.deepEqual(result.failures, []);
  assert.ok(result.passed >= 45, '45 checks (6 suites): ' + result.passed);
  assert.deepEqual(problems, []);
});

test('vfGridAg passes the grid contract under a nonce-only style-src (D-035)', async () => {
  const { result, problems } = await runPage('/layer2/adapters/_contract/csp-nonce.html');
  assert.deepEqual(result.failures, []);
  assert.ok(result.passed >= 9, 'the nonce check, the grid suite and the violation check: ' + result.passed);
  assert.deepEqual(problems, []);
});
