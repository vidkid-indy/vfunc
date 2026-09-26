// SPDX-License-Identifier: Apache-2.0
//
// The Leaflet sample (layer2/examples/third-party-custom) in a real browser: L0, L1 and L2 maps
// draw, markers answer clicks, the L2 adapter updates without a new map, no console problems.
// Needs network access (Leaflet from jsDelivr).

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

test('the Leaflet sample: three levels, marker clicks, L2 updates in place', async () => {
  const context = await browser.newContext({ locale: 'en-US', viewport: { width: 1100, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error' && msg.type() !== 'warning') return;
    // Firefox warns about deprecated MouseEvent members that Leaflet 1.9.4 reads: vendor code, not ours.
    if (msg.type() === 'warning' && /is deprecated/.test(msg.text()) && /leaflet@1\.9\.4\/dist\/leaflet\.js/.test(msg.text())) return;
    problems.push('console.' + msg.type() + ': ' + msg.text());
  });
  page.on('pageerror', (err) => problems.push('page error: ' + err.message));
  page.on('requestfailed', (req) => problems.push('request failed: ' + req.url()));
  const waitLog = (text) => page.waitForFunction((t) => document.getElementById('log').textContent === t, text);
  try {
    await page.goto(server.origin + '/layer2/examples/third-party-custom/', { waitUntil: 'load' });
    await page.waitForSelector('#map-l2 .leaflet-interactive');
    for (const id of ['#map-l0', '#map-l1', '#map-l2']) {
      assert.ok(await page.locator(id + ' .leaflet-container').count() >= 1, id + ' has a Leaflet map');
    }
    await page.locator('#map-l0 .leaflet-interactive').first().click();
    await waitLog('l0 click Seoul');
    await page.locator('#map-l1 .leaflet-interactive').first().click();
    await page.waitForFunction(() => document.getElementById('log').textContent.indexOf('l1 select ') === 0);
    assert.equal(await page.locator('#map-l2 .leaflet-interactive').count(), 3);
    await page.click('#only-coex');
    await waitLog('l2 markers 1');
    assert.equal(await page.locator('#map-l2 .leaflet-interactive').count(), 1);
    await page.locator('#map-l2 .leaflet-interactive').first().click();
    await waitLog('l2 marker coex');
    assert.equal(await page.getAttribute('#places-map [data-vf-keep="host"]', 'aria-label'), 'Places in Seoul');
    assert.deepEqual(problems, []);
  } finally {
    await context.close();
  }
});
