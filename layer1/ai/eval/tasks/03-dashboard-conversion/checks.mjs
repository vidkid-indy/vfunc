// SPDX-License-Identifier: Apache-2.0
// Task 03 — convert the published dashboard of sample 14.
// The structure check reads the publisher's classes on purpose: they must survive the conversion.
import { assert, text, count, waitText, waitAttr, expectFocus } from '../../tools/helpers.mjs';

const MENU = '[data-action="menu"]';

/** Texts of the visible table rows. */
const rows = (page) => page.$$eval('tbody tr', (trs) => trs
  .filter((tr) => !tr.closest('[hidden]') && tr.getBoundingClientRect().height > 0)
  .map((tr) => tr.textContent.replace(/\s+/g, ' ').trim()));
const orders = async (page) => (await rows(page)).filter((r) => /#10\d\d/.test(r));

async function waitOrders(page, n) {
  for (let i = 0; i < 40; i++) {
    if ((await orders(page)).length === n) return;
    await page.waitForTimeout(50);
  }
  assert.fail('expected ' + n + ' visible orders, got: ' + JSON.stringify(await rows(page)));
}

async function menuOpen(page, open) {
  await waitAttr(page, MENU, 'aria-expanded', open ? 'true' : 'false');
  assert.equal(await page.$eval('#userMenu', (el) => el.hidden), !open, open ? '#userMenu shown' : '#userMenu hidden');
}

async function search(page, value) {
  await page.fill('[data-action="search"]', '');
  await page.click('[data-action="search"]');
  await page.keyboard.type(value, { delay: 15 });
}

export default [
  {
    name: 'the menu button opens and closes the menu (aria-expanded, hidden)',
    async run(page) {
      await menuOpen(page, false);
      await page.click(MENU);
      await menuOpen(page, true);
      await page.click(MENU);
      await menuOpen(page, false);
    }
  },
  {
    name: 'Escape and a click outside close the menu',
    async run(page) {
      await page.click(MENU);
      await menuOpen(page, true);
      await page.keyboard.press('Escape');
      await menuOpen(page, false);
      await page.click(MENU);
      await menuOpen(page, true);
      await page.click('h1');
      await menuOpen(page, false);
    }
  },
  {
    name: 'Sign out closes the menu and shows "Signed out"',
    async run(page) {
      await page.click(MENU);
      await menuOpen(page, true);
      await page.click('[data-action="sign-out"]');
      await menuOpen(page, false);
      await waitText(page, MENU, 'Signed out');
    }
  },
  {
    name: 'tabs switch the summary with aria-selected and the active class',
    async run(page) {
      await page.click('[data-action="tab"][data-tab="month"]');
      await waitText(page, '#summary', 'This month: 1,204 orders, 3.4% refunds.');
      await waitAttr(page, '[data-action="tab"][data-tab="month"]', 'aria-selected', 'true');
      await waitAttr(page, '[data-action="tab"][data-tab="week"]', 'aria-selected', 'false');
      assert.equal(await page.$eval('[data-tab="month"]', (el) => el.classList.contains('tabs__tab--active')), true, 'active class on month');
      assert.equal(await page.$eval('[data-tab="week"]', (el) => el.classList.contains('tabs__tab--active')), false, 'no active class on week');
      await page.click('[data-action="tab"][data-tab="week"]');
      await waitText(page, '#summary', 'Orders are up this week. Most sales came from the keyboard line.');
      await waitAttr(page, '[data-action="tab"][data-tab="week"]', 'aria-selected', 'true');
    }
  },
  {
    name: 'search filters by customer or order number while typing, focus kept',
    async run(page) {
      await waitOrders(page, 3);
      await search(page, 'MINSU');
      await waitOrders(page, 1);
      assert.match((await orders(page))[0], /Minsu Kim/);
      await expectFocus(page, '[data-action="search"]', 'while typing');
      await search(page, '#1041');
      await waitOrders(page, 1);
      assert.match((await orders(page))[0], /Seoyeon Park/);
      await search(page, '1040');
      await waitOrders(page, 1);
      assert.match((await orders(page))[0], /Jiho Choi/);
      await page.fill('[data-action="search"]', '');
      await page.dispatchEvent('[data-action="search"]', 'input');
      await waitOrders(page, 3);
    }
  },
  {
    name: 'the status filter combines with the search; no match shows "No orders match."',
    async run(page) {
      await page.selectOption('[data-action="filter"]', 'refunded');
      await waitOrders(page, 1);
      assert.match((await orders(page))[0], /Jiho Choi/);
      await search(page, 'minsu');
      await waitOrders(page, 0);
      assert.deepEqual(await rows(page), ['No orders match.']);
      await page.selectOption('[data-action="filter"]', '');
      await waitOrders(page, 1);
    }
  },
  {
    name: 'search text is never markup',
    async run(page) {
      await search(page, '<img src=x onerror=alert(1)>');
      await waitOrders(page, 0);
      assert.equal(await count(page, 'img'), 0);
    }
  },
  {
    name: 'the published structure and texts stay (no element rebuilt or nested)',
    async run(page) {
      const mark = (selector, name) => page.$eval(selector, (el, n) => el.setAttribute('data-eval-mark', n), name);
      await mark('table', 'table');
      await mark('tbody', 'tbody');
      await mark('#summary', 'summary');
      await mark('#userMenu', 'menu');
      await page.click('[data-action="tab"][data-tab="month"]');
      await search(page, 'k');
      await page.selectOption('[data-action="filter"]', 'paid');
      await page.click(MENU);
      await page.waitForTimeout(100);
      for (const name of ['table', 'tbody', 'summary', 'menu']) {
        assert.equal(await count(page, '[data-eval-mark="' + name + '"]'), 1, 'the published ' + name + ' element was replaced');
      }
      const counts = await page.evaluate(() => ['.kpi', '.tabs', '.tabs__tab', '.panel', '.panel__body', 'table', 'tbody', 'thead', '.topbar__user-btn', '.sidebar__link']
        .map((s) => s + '=' + document.querySelectorAll(s).length).join(' '));
      assert.equal(counts, '.kpi=4 .tabs=1 .tabs__tab=2 .panel=2 .panel__body=1 table=1 tbody=1 thead=1 .topbar__user-btn=1 .sidebar__link=4');
      const body = await page.evaluate(() => document.body.innerText);
      for (const t of ['ACME Admin', 'Customers', 'Reports', 'Revenue', '₩12,480,000', '342', '+8.2%', 'New customers', 'Recent orders', '© ACME — a fictional company for this sample']) {
        assert.ok(body.indexOf(t) >= 0, 'text kept: ' + t);
      }
      assert.equal(await text(page, 'h1'), 'Dashboard');
    }
  }
];
