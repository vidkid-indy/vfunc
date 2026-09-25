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

const active = () => page.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.getAttribute('data-action') || document.activeElement.textContent));
const activeText = () => page.evaluate(() => document.activeElement && document.activeElement.textContent);
// WebKit does not focus a button on click, so openers are pressed from the keyboard: the focus
// then returns to them as it does for keyboard and screen reader users (CI rule: user actions).
const press = async (selector) => { await page.focus(selector); await page.keyboard.press('Enter'); };
const locked = () => page.evaluate(() => document.documentElement.getAttribute('data-vf-scroll-lock'));

test('vfModal: focus moves in, Tab stays inside, Escape closes and returns focus', async () => {
  await press('#open-modal');
  await page.waitForSelector('#edit-dialog');
  assert.equal(await active(), 'first');
  assert.equal(await locked(), 'true');
  // DOM order: close (header), first, last, Cancel, Save. From first: last → Cancel → Save.
  for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
  assert.equal(await active(), 'modal-save');
  await page.keyboard.press('Tab');
  assert.equal(await active(), 'close', 'Tab wraps to the first control of the dialog');
  await page.keyboard.press('Shift+Tab');
  assert.equal(await active(), 'modal-save', 'Shift+Tab wraps to the last');
  await page.keyboard.press('Escape');
  await waitLog('modal escape');
  assert.equal(await page.locator('#edit').count(), 0, 'taken out of the page');
  assert.equal(await active(), 'open-modal');
  assert.equal(await locked(), null);
});

test('vfModal footer action shows a toast; the toast is announced in a live region', async () => {
  await press('#open-modal');
  await page.click('#modal-save');
  await waitLog('modal save');
  const region = page.locator('.vf-toast-region');
  assert.equal(await region.getAttribute('aria-live'), 'polite');
  await page.waitForFunction(() => document.querySelector('.vf-toast-region').textContent.indexOf('Profile saved') >= 0);
  await page.click('.vf-toast-region [data-action="dismiss"]');
});

test('vfDrawer opens from the end side and closes on the backdrop', async () => {
  await press('#open-drawer');
  await page.waitForSelector('#filters-dialog');
  assert.equal(await page.getAttribute('#filters', 'data-side'), 'end');
  await page.mouse.click(5, 5);
  await waitLog('drawer backdrop');
  assert.equal(await active(), 'open-drawer');
});

test('vfConfirm: danger starts on cancel; Enter on Delete answers true, Escape answers false', async () => {
  await press('#open-confirm');
  await page.waitForSelector('[role="alertdialog"]');
  assert.equal(await active(), 'cancel');
  await page.keyboard.press('Tab');
  assert.equal(await active(), 'confirm');
  await page.keyboard.press('Enter');
  await waitLog('confirm true');
  await press('#open-confirm');
  await page.waitForSelector('[role="alertdialog"]');
  await page.keyboard.press('Escape');
  await waitLog('confirm false');
  assert.equal(await active(), 'open-confirm');
});

test('vfDropdown: keyboard menu button, typeahead, Escape back to the trigger', async () => {
  await page.focus('#actions-trigger');
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.getAttribute('#actions-trigger', 'aria-expanded'), 'true');
  assert.equal(await activeText(), 'Rename');
  await page.keyboard.press('d');
  assert.equal(await activeText(), 'Duplicate');
  await page.keyboard.press('Escape');
  assert.equal(await active(), 'actions-trigger');
  assert.equal(await page.isVisible('#actions-menu'), false);
  await page.keyboard.press('ArrowUp');
  assert.equal(await activeText(), 'Delete', 'ArrowUp opens on the last item');
  await page.keyboard.press('Enter');
  await waitLog('menu delete');
  assert.equal(await active(), 'actions-trigger');
});

test('vfDropdown: the menu sits next to the trigger on the side it says, inside the viewport', async () => {
  await press('#actions-trigger');
  const box = await page.evaluate(() => {
    const t = document.getElementById('actions-trigger').getBoundingClientRect();
    const menu = document.getElementById('actions-menu');
    const m = menu.getBoundingClientRect();
    return { side: menu.getAttribute('data-placement'), t: { top: t.top, bottom: t.bottom }, m: { top: m.top, bottom: m.bottom, right: m.right },
      width: window.innerWidth, height: window.innerHeight };
  });
  // Near the bottom of the window the menu flips above the trigger.
  if (box.side === 'bottom') assert.ok(box.m.top >= box.t.bottom, 'below the trigger');
  else assert.ok(box.m.bottom <= box.t.top, 'above the trigger (flipped)');
  assert.ok(box.m.top >= 0 && box.m.bottom <= box.height, 'inside the viewport vertically');
  assert.ok(box.m.right <= box.width, 'inside the viewport horizontally');
  await page.mouse.click(5, 5);
  assert.equal(await page.isVisible('#actions-menu'), false, 'an outside click closes');
});

test('vfSplitButton: main click and a menu item', async () => {
  await page.click('#save-main');
  await waitLog('split click save');
  await press('#save-trigger');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await waitLog('split select close');
});

test('vfPopover: focus into the content, Escape back to the trigger', async () => {
  await press('#help-trigger');
  assert.equal(await page.getAttribute('#help-panel', 'role'), 'dialog');
  assert.equal(await activeText(), 'Go to inputs');
  await page.keyboard.press('Escape');
  await waitLog('popover escape');
  assert.equal(await active(), 'help-trigger');
});

test('core list screen: vsTable sort buttons and vsPagination driven by app state', async () => {
  const firstName = () => page.evaluate(() => document.querySelector('#simple-list tbody tr td').textContent);
  assert.equal(await firstName(), 'Ada 1');
  await press('#simple-list [data-action="sort"][data-value="age"]');
  await waitLog('list sort age');
  assert.equal(await page.getAttribute('#simple-list th[aria-sort="ascending"] [data-action="sort"]', 'data-value'), 'age');
  assert.equal(await active(), 'sort', 'the focus stays on a sort button after the refresh');
  await press('#simple-pages [data-page="2"]');
  await waitLog('list page 2');
  assert.equal(await page.locator('#simple-list tbody tr').count(), 5);
  assert.equal(await page.locator('#simple-list svg.vf-sparkline[role="img"]').count(), 5);
});

test('vfGrid: sort, select all on the page, a row click; the header stays on top while scrolling', async () => {
  await press('#people [data-action="sort"][data-value="age"]');
  await waitLog('grid sort age asc');
  await page.check('#people [data-action="select-all"]');
  await page.waitForFunction(() => document.getElementById('log').textContent.indexOf('grid select ') === 0);
  assert.equal((await page.textContent('#log')).split(',').length, 8, 'the 8 rows of the page');
  await page.click('#people tbody tr:nth-child(2) td:last-child');
  await page.waitForFunction(() => document.getElementById('log').textContent.indexOf('grid row ') === 0);
  const sticky = await page.evaluate(() => {
    const box = document.getElementById('people-scroll');
    box.scrollTop = 200;
    const head = box.querySelector('th').getBoundingClientRect().top;
    return { head: head, box: box.getBoundingClientRect().top, max: box.style.maxHeight };
  });
  assert.equal(sticky.max, '280px');
  assert.ok(Math.abs(sticky.head - sticky.box) < 3, 'the header is at the top of the scroll box');
  await press('#people-pages [data-page="3"]');
  assert.equal(await page.textContent('#people .vf-grid__range'), '17–24 of 24');
});

test('vfChart: keyboard focus shows the tooltip, Enter-less click reports, legend toggles, type switch', async () => {
  await page.focus('#sales [data-action="mark"]');
  assert.equal(await page.isVisible('#sales-tooltip'), true);
  assert.equal(await page.textContent('#sales-tooltip'), '2025, Jan: 12');
  await page.click('#sales [data-action="mark"][data-s="1"][data-index="2"]');
  await waitLog('chart 2026 Mar 24');
  await press('#sales [data-action="toggle-series"][data-index="0"]');
  await page.waitForFunction(() => document.querySelectorAll('#sales rect').length === 6);
  assert.equal(await page.getAttribute('#sales [data-action="toggle-series"][data-index="0"]', 'aria-pressed'), 'false');
  await page.click('#chart-types [data-value="donut"]');
  await waitLog('chart type donut');
  assert.equal(await page.locator('#sales .vf-chart__slice').count(), 6);
  const width = await page.evaluate(() => document.querySelector('#sales svg').getAttribute('viewBox').split(' ')[2]);
  assert.equal(Number(width), await page.evaluate(() => document.getElementById('sales').clientWidth), 'drawn at its own width');
  assert.equal(await page.locator('#sales .vf-visually-hidden table').count(), 1, 'a data table for screen readers');
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
