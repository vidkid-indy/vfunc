// SPDX-License-Identifier: Apache-2.0
// Task 07 — port of the React ProductFilter component.
import { assert, text, visible, waitText, expectFocus, routeJson } from '../../tools/helpers.mjs';

const DATA = '**/data/products.json';
const ITEM = '[data-ref="list"] [data-id]';

/** data-id of the visible products, in page order. */
const shown = (page) => page.$$eval(ITEM, (els) => els
  .filter((e) => !e.closest('[hidden]') && e.getBoundingClientRect().height > 0)
  .map((e) => e.getAttribute('data-id')));

async function waitShown(page, ids) {
  for (let i = 0; i < 40; i++) {
    if (JSON.stringify(await shown(page)) === JSON.stringify(ids)) return;
    await page.waitForTimeout(50);
  }
  assert.fail('expected products ' + JSON.stringify(ids) + ', got ' + JSON.stringify(await shown(page)));
}

async function type(page, value) {
  await page.fill('[data-action="search"]', '');
  await page.click('[data-action="search"]');
  await page.keyboard.type(value, { delay: 15 });
}

export default [
  {
    name: 'loads and lists the products sorted by name',
    async run(page) {
      await waitShown(page, ['d1', 'k1', 'm2', 'k2', 'd2', 'm1']);
      await waitText(page, '[data-ref="count"]', '6 products');
      assert.equal(await text(page, '[data-id="d1"] [data-ref="name"]'), '27" Monitor');
    }
  },
  {
    name: 'shows the loading and error states',
    async before(page, env) {
      env.allow(/HTTP 500|status of 500|Failed to load resource/i);
      await routeJson(page, DATA, () => ({ delay: 600, status: 500 }));
    },
    async run(page) {
      await waitText(page, '[data-ref="status"]', 'Loading products…');
      await waitText(page, '[data-ref="status"]', 'Could not load products.');
    }
  },
  {
    name: 'search filters while typing, ignoring case, focus kept',
    async run(page) {
      await waitShown(page, ['d1', 'k1', 'm2', 'k2', 'd2', 'm1']);
      await type(page, 'MOUSE');
      await waitShown(page, ['m2', 'm1']);
      await expectFocus(page, '[data-action="search"]', 'while typing');
      assert.equal(await page.inputValue('[data-action="search"]'), 'MOUSE');
      await waitText(page, '[data-ref="count"]', '2 products');
    }
  },
  {
    name: 'category and "In stock only" combine; the count is singular for one',
    async run(page) {
      await waitShown(page, ['d1', 'k1', 'm2', 'k2', 'd2', 'm1']);
      await page.selectOption('[data-action="category"]', 'monitor');
      await waitShown(page, ['d1', 'd2']);
      await page.check('[data-action="in-stock"]');
      await waitShown(page, ['d1']);
      await waitText(page, '[data-ref="count"]', '1 product');
      await page.selectOption('[data-action="category"]', 'all');
      await waitShown(page, ['d1', 'k1', 'm2', 'm1']);
    }
  },
  {
    name: 'sorts by price both ways',
    async run(page) {
      await waitShown(page, ['d1', 'k1', 'm2', 'k2', 'd2', 'm1']);
      await page.selectOption('[data-action="sort"]', 'price-asc');
      await waitShown(page, ['m1', 'k1', 'm2', 'k2', 'd2', 'd1']);
      await page.selectOption('[data-action="sort"]', 'price-desc');
      await waitShown(page, ['d1', 'd2', 'k2', 'm2', 'k1', 'm1']);
    }
  },
  {
    name: 'out-of-stock products are marked; prices are USD',
    async run(page) {
      await waitShown(page, ['d1', 'k1', 'm2', 'k2', 'd2', 'm1']);
      assert.equal(await page.getAttribute('[data-id="k2"]', 'data-state'), 'out');
      assert.equal(await page.getAttribute('[data-id="k1"]', 'data-state'), 'in');
      assert.ok((await text(page, '[data-id="k2"]')).indexOf('Sold out') >= 0, 'badge on k2');
      assert.ok((await text(page, '[data-id="k1"]')).indexOf('Sold out') < 0, 'no badge on k1');
      assert.equal(await text(page, '[data-id="k1"] [data-ref="price"]'), '$49.00');
      assert.equal(await text(page, '[data-id="k2"] [data-ref="price"]'), '$129.00');
    }
  },
  {
    name: 'no match shows "No products found." and "0 products"',
    async run(page) {
      await waitShown(page, ['d1', 'k1', 'm2', 'k2', 'd2', 'm1']);
      assert.equal(await visible(page, '[data-ref="empty"]'), 0, 'no empty message with products');
      await type(page, 'zzz');
      await waitText(page, '[data-ref="empty"]', 'No products found.');
      await waitText(page, '[data-ref="count"]', '0 products');
      assert.equal(await visible(page, '[data-ref="empty"]'), 1);
    }
  }
];
