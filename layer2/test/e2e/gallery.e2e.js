// SPDX-License-Identifier: Apache-2.0
//
// The layer 2 gallery (layer2/examples/gallery) in a real browser (VF_BROWSER, default Chromium),
// run by `npm run test:examples`: no console error or warning, and the keyboard and pointer
// behavior of the vf* components. Selectors use id, data-action and data-ref only (rule 21);
// roles and aria attributes are what the components promise.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launchBrowser } from '../../../layer1/test/e2e/browser.mjs';
import { startServer } from '../../../layer1/test/e2e/serve.mjs';

let browser;
let server;
let page;
let context;
const problems = [];

before(async () => {
  server = await startServer();
  browser = await launchBrowser();
  context = await browser.newContext({ locale: 'en-US' });
  page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') problems.push('console.' + msg.type() + ': ' + msg.text());
  });
  page.on('pageerror', (err) => problems.push('page error: ' + err.message));
  page.on('requestfailed', (req) => problems.push('request failed: ' + req.url()));
  page.on('response', (res) => { if (res.status() >= 400) problems.push('HTTP ' + res.status() + ': ' + res.url()); });
  await page.goto(server.origin + '/layer2/examples/gallery/', { waitUntil: 'load' });
});

after(async () => {
  if (context) await context.close();
  if (browser) await browser.close();
  if (server) await server.close();
});

const waitLog = (text) => page.waitForFunction((t) => document.getElementById('log').textContent === t, text);

test('the gallery renders every section without console problems', async () => {
  await page.waitForSelector('#settings [role="tablist"]');
  assert.equal(await page.locator('#users[role="listbox"]').count(), 1);
  assert.equal(await page.locator('#news[aria-roledescription="carousel"]').count(), 1);
  assert.deepEqual(problems, []);
});

test('native controls: the selected option and escaped textarea text', async () => {
  assert.equal(await page.evaluate(() => document.getElementById('role').value), 'user');
  assert.equal(await page.locator('textarea').first().inputValue(), '<b>not bold</b>');
  assert.equal(await page.evaluate(() => document.getElementById('nick').getAttribute('aria-invalid')), 'true');
});

test('vfNumberInput: buttons step and stop at max', async () => {
  // From 1 to the max 5; then the button is disabled.
  for (let i = 0; i < 4; i++) await page.click('#number [data-action="increment"]');
  await waitLog('number 5');
  assert.equal(await page.inputValue('#qty'), '5');
  assert.equal(await page.isDisabled('#number [data-action="increment"]'), true);
});

test('vfSearchInput: the "/" shortcut focuses it, typing searches after the debounce, Escape clears', async () => {
  await page.click('#log');
  await page.keyboard.press('/');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'q');
  await page.keyboard.type('ada');
  await waitLog('search ada');
  await page.keyboard.press('Escape');
  await waitLog('search ');
  assert.equal(await page.inputValue('#q'), '');
});

test('vfChipsInput: Enter adds a chip and keeps the focus in the input', async () => {
  await page.fill('#tags', 'api');
  await page.press('#tags', 'Enter');
  await waitLog('chips ui,api');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'tags');
  assert.equal(await page.locator('#chips [data-action="remove"]').count(), 2);
});

test('vfMaskedInput formats while typing', async () => {
  await page.click('#phone');
  await page.keyboard.type('01012345678');
  assert.equal(await page.inputValue('#phone'), '010-1234-5678');
  await waitLog('masked 01012345678');
});

test('vfTabs: arrow keys skip the disabled tab and move the focus', async () => {
  await page.click('#settings-tab-1');
  await waitLog('tab security');
  await page.keyboard.press('ArrowRight');
  await waitLog('tab about');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'settings-tab-3');
  assert.equal(await page.getAttribute('#settings-tab-3', 'aria-selected'), 'true');
  assert.equal(await page.isVisible('#settings-panel-3'), true);
  assert.equal(await page.isVisible('#settings-panel-1'), false);
  await page.keyboard.press('Home');
  await waitLog('tab profile');
});

test('vfListView: arrow keys move, Space selects', async () => {
  await page.click('#users-option-0');
  await waitLog('list a');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press(' ');
  await waitLog('list b');
  assert.equal(await page.getAttribute('#users-option-1', 'aria-selected'), 'true');
});

test('vfAccordion, vfStepper, vfPagination, vfCarousel respond to clicks', async () => {
  await page.click('#faq [data-value="ie"]');
  await waitLog('accordion ie true');
  assert.equal(await page.getAttribute('#faq-trigger-0', 'aria-expanded'), 'false', 'one open at a time');
  await page.click('#stepper [data-index="2"]');
  await waitLog('step 2');
  await page.click('#pages [data-page="12"]');
  await waitLog('page 12');
  await page.click('#news [data-action="next"]');
  await waitLog('carousel 1');
});

test('switching the language re-renders the messages', async () => {
  await page.click('#lang [data-value="ko"]');
  await page.waitForFunction(() => document.querySelector('#pages').getAttribute('aria-label') === '페이지 이동');
  assert.equal(await page.getAttribute('#number [data-action="increment"]', 'aria-label'), '증가');
  assert.equal(await page.evaluate(() => document.documentElement.lang), 'ko');
  await page.click('#lang [data-value="en"]');
  await page.waitForFunction(() => document.querySelector('#pages').getAttribute('aria-label') === 'Pagination');
  assert.deepEqual(problems, []);
});
