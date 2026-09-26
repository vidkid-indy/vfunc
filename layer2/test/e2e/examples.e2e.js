// SPDX-License-Identifier: Apache-2.0
//
// The layer 2 examples (layer2/examples: dashboard, settings-form, landing, legacy-ie,
// custom-component, and the index) in a real browser (VF_BROWSER, default Chromium), run by
// `npm run test:examples`: a CSP meta tag, no inline script, SRI on every external file, no console
// error or warning (a CSP violation is one), and the main behavior of each page. Selectors use id,
// data-action and data-ref (rule 21); roles and aria attributes are what the components promise.
// The dashboard loads Tabulator and Chart.js from jsDelivr (network).

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

/** Opens an example with the page rules checked; runs `fn(page)`; fails on any console problem. */
async function example(path, fn) {
  const context = await browser.newContext({ locale: 'en-US' });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') problems.push('console.' + msg.type() + ': ' + msg.text()); });
  page.on('pageerror', (err) => problems.push('page error: ' + err.message));
  page.on('requestfailed', (req) => problems.push('request failed: ' + req.url()));
  page.on('response', (res) => { if (res.status() >= 400) problems.push('HTTP ' + res.status() + ': ' + res.url()); });
  try {
    await page.goto(server.origin + path, { waitUntil: 'load' });
    assert.equal(await page.locator('meta[http-equiv="Content-Security-Policy"]').count(), 1, 'CSP meta tag');
    const csp = await page.getAttribute('meta[http-equiv="Content-Security-Policy"]', 'content');
    assert.doesNotMatch(csp, /unsafe-inline/, 'no unsafe-inline');
    assert.equal(await page.$$eval('script:not([src])', (els) => els.length), 0, 'no inline script');
    assert.equal(await page.$$eval('script[src^="http"], link[rel="stylesheet"][href^="http"]',
      (els) => els.filter((e) => !e.integrity || e.crossOrigin !== 'anonymous').length), 0, 'SRI and crossorigin on external files');
    if (fn) await fn(page);
    assert.deepEqual(problems, []);
  } finally {
    await context.close();
  }
}

const waitLog = (page, text) => page.waitForFunction((t) => document.getElementById('log').textContent === t, text);
const logText = (page) => page.evaluate(() => document.getElementById('log').textContent);

test('index: links to every example folder', async () => {
  await example('/layer2/examples/', async (page) => {
    const links = await page.$$eval('a[href^="./"]', (els) => els.map((a) => a.getAttribute('href')));
    assert.deepEqual(links.sort(), ['./custom-component/', './dashboard/', './gallery/', './landing/', './legacy-ie/', './settings-form/', './third-party-custom/']);
  });
});

test('dashboard: built-in grid and chart, then the Tabulator and Chart.js adapters with the same props', async () => {
  await example('/layer2/examples/dashboard/', async (page) => {
    await page.waitForSelector('#orders tbody tr');
    assert.equal(await page.locator('#stats > *').count(), 3, 'three stat cards');
    assert.equal(await page.locator('#orders tbody tr').count(), 8, 'first page of 8');
    await page.click('#orders [data-action="sort"][data-value="amount"]');
    await waitLog(page, 'sort amount asc');
    assert.equal(await page.locator('#sales [role="img"]').count() >= 1, true, 'the SVG chart');

    await page.click('#engines [data-value="vendor"]');
    await waitLog(page, 'engine vendor');
    await page.waitForFunction(() => document.querySelectorAll('#grid [data-vf-keep] [role="row"]').length > 1);
    assert.equal(await page.locator('#orders').count(), 1, 'the adapter keeps the id');
    assert.equal(await page.locator('#chart canvas[role="img"]').count(), 1, 'Chart.js canvas');
    await page.click('#chart-types [data-value="line"]');
    await waitLog(page, 'chart type line');

    await page.click('#engines [data-value="builtin"]');
    await waitLog(page, 'engine builtin');
    assert.equal(await page.locator('#orders tbody tr').count(), 8, 'built-in again');
    assert.equal(await page.locator('#grid [data-vf-keep]').count(), 0, 'the adapter left nothing behind');
  });
});

test('settings-form: validation with the error prop, save with a toast, reset after a confirm, Korean', async () => {
  await example('/layer2/examples/settings-form/', async (page) => {
    await page.waitForSelector('#email');
    await page.fill('#email', 'not-an-email');
    await page.click('#save');
    await waitLog(page, 'invalid email');
    assert.equal(await page.getAttribute('#email', 'aria-invalid'), 'true');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'email', 'focus on the first invalid field');
    assert.equal(await page.inputValue('#email'), 'not-an-email', 'the typed value survives the re-render');

    await page.fill('#email', 'ada@example.org');
    await page.fill('#topics', 'design');
    await page.press('#topics', 'Enter');
    await page.click('#save');
    await page.waitForFunction(() => document.getElementById('log').textContent.indexOf('saved ') === 0);
    const saved = JSON.parse((await logText(page)).slice(6));
    assert.equal(saved.email, 'ada@example.org');
    assert.deepEqual(saved.topics, ['release', 'security', 'design']);
    await page.getByText('Settings saved').waitFor();

    await page.focus('[data-action="reset"]');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[role="alertdialog"]');
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('data-action')), 'cancel', 'danger: focus starts on cancel');
    await page.click('[role="alertdialog"] [data-action="confirm"]');
    await waitLog(page, 'reset');
    assert.equal(await page.inputValue('#email'), 'ada@example.com');
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('data-action')), 'reset', 'focus returns to the reset button');

    await page.click('#langs [data-value="ko"]');
    await page.waitForFunction(() => document.getElementById('title').textContent === '설정');
    assert.match(await page.innerText('label[for="name"]'), /이름/);
  });
});

test('landing: scroll buttons move the focus, the accordion and carousel work, the sign-up form validates', async () => {
  await example('/layer2/examples/landing/', async (page) => {
    await page.waitForSelector('#cta [data-action="go"]');
    await page.click('#cta [data-action="go"] >> nth=0');
    await waitLog(page, 'go pricing');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'pricing');

    await page.click('#questions [data-action="toggle"] >> nth=1');
    await waitLog(page, 'faq export true');

    await page.click('#quotes-carousel [data-action="next"]');
    await waitLog(page, 'quote 1');

    await page.click('#signup [type="submit"]');
    await waitLog(page, 'signup invalid');
    assert.equal(await page.getAttribute('#signup-email', 'aria-invalid'), 'true');
    await page.fill('#signup-email', 'reader@example.com');
    await page.click('#signup [type="submit"]');
    await waitLog(page, 'signup ok');
    await page.getByText('Thanks! Check your inbox.').waitFor();
    assert.equal(await page.inputValue('#signup-email'), '', 'cleared after a success');
  });
});

test('legacy-ie: ES5 on vfunc-all.legacy.min.js — grid, modal on row click, chart, Korean', async () => {
  await example('/layer2/examples/legacy-ie/', async (page) => {
    await page.waitForSelector('#branches tbody tr');
    assert.equal(await page.locator('#branches tbody tr').count(), 5);
    await page.click('#branches [data-action="sort"][data-value="visits"]');
    await waitLog(page, 'sort visits asc');
    await page.click('#branches tbody tr >> nth=0');
    await page.waitForSelector('#details[role="dialog"], [role="dialog"]');
    assert.equal(await page.locator('[role="dialog"] dl').count(), 1, 'vsDescriptions in the dialog');
    await page.keyboard.press('Escape');
    await page.waitForSelector('[role="dialog"]', { state: 'detached' });
    assert.equal(await page.locator('#visits [role="img"]').count() >= 1, true, 'the chart');
    await page.click('#langs [data-value="ko"]');
    await page.waitForFunction(() => document.getElementById('title').textContent === '지점 보고서');
    assert.match(await page.innerText('#branches thead'), /지점/);
  });
});

test('custom-component: the app components update the line and the total, CSS-only brand changes', async () => {
  await example('/layer2/examples/custom-component/', async (page) => {
    await page.waitForSelector('#qty-slot-mug [data-action="increment"]');
    assert.equal(await page.innerText('#summary [data-ref="total"]'), '$25.00');
    await page.click('#qty-slot-mug [data-action="increment"]');
    await waitLog(page, 'mug 2 24');
    assert.equal(await page.innerText('#summary [data-ref="total"]'), '$37.00');
    assert.match(await page.innerText('#lines [data-ref="total"] >> nth=0'), /-20%/, 'the discount badge');
    assert.equal(await page.evaluate(() => document.getElementById('qty-mug').value), '2', 'the child input kept through childs');
    await page.click('#summary [data-action="checkout"]');
    await waitLog(page, 'checkout 37');
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('#summary [data-action="checkout"]')).borderRadius), '9999px', 'C2 rule wins');
  });
});
