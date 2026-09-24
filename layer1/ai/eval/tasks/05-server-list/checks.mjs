// SPDX-License-Identifier: Apache-2.0
// Task 05 — server list with loading, error, empty and untrusted data.
import { assert, text, count, visible, waitCount, waitAttr, routeJson } from '../../tools/helpers.mjs';

const DATA = '**/data/servers.json';
const ROWS = '[data-ref="list"] [data-id]';
const THREE = [
  { id: 'a', name: 'Alpha', region: 'kr', status: 'up', url: 'https://a.example.com/' },
  { id: 'b', name: 'Beta', region: 'kr', status: 'down', url: 'https://b.example.com/' },
  { id: 'c', name: 'Gamma', region: 'us', status: 'maintenance', url: 'http://c.example.com/' }
];
// The status text without a Retry button that may sit inside the status element (the task allows both).
const STATUS = '[data-ref="status"]';
async function waitStatus(page, expected) {
  const read = () => page.$eval(STATUS, (el) => {
    const copy = el.cloneNode(true);
    copy.querySelectorAll('button').forEach((b) => b.remove());
    return copy.textContent.replace(/\s+/g, ' ').trim();
  }).catch(() => '(no element)');
  for (let i = 0; i < 80; i++) {
    if ((await read()) === expected) return;
    await page.waitForTimeout(50);
  }
  assert.fail(STATUS + ': expected "' + expected + '", got "' + (await read()) + '"');
}
// Messages the browser itself prints for a failed request (the check causes them on purpose).
const BROWSER_FAILURE = /HTTP 500|status of 500|Failed to load resource|request failed|Fetch API cannot load|NetworkError|ERR_FAILED|cancelled/i;

export default [
  {
    name: 'shows the loading state (aria-busy, text) and then the list',
    async before(page) { await routeJson(page, DATA, () => ({ delay: 800, body: THREE })); },
    async run(page) {
      await waitAttr(page, '#servers', 'aria-busy', 'true');
      await waitStatus(page, 'Loading servers…');
      await waitCount(page, ROWS, 3);
      await waitAttr(page, '#servers', 'aria-busy', 'false');
      await waitStatus(page, 'Showing 3 of 3');
      assert.equal(await page.getAttribute('[data-ref="status"]', 'role'), 'status');
    }
  },
  {
    name: 'an HTTP error shows the message and Retry loads again',
    async before(page, env) {
      env.allow(BROWSER_FAILURE);
      await routeJson(page, DATA, (n) => (n === 0 ? { status: 500 } : { delay: 300, body: THREE }));
    },
    async run(page) {
      await waitStatus(page, 'Could not load servers.');
      await waitAttr(page, '#servers', 'aria-busy', 'false');
      assert.equal(await count(page, ROWS), 0);
      await page.click('[data-action="retry"]');
      await waitAttr(page, '#servers', 'aria-busy', 'true');
      await waitCount(page, ROWS, 3);
      await waitStatus(page, 'Showing 3 of 3');
      assert.equal(await visible(page, '[data-action="retry"]'), 0, 'no Retry after success');
    }
  },
  {
    name: 'a network error shows the same message',
    async before(page, env) {
      env.allow(BROWSER_FAILURE);
      await page.route(DATA, (route) => route.abort());
    },
    async run(page) {
      await waitStatus(page, 'Could not load servers.');
      assert.equal(await visible(page, '[data-action="retry"]'), 1);
    }
  },
  {
    name: 'an empty list says "No servers yet."',
    async before(page) { await routeJson(page, DATA, () => ({ body: [] })); },
    async run(page) {
      await waitStatus(page, 'No servers yet.');
      await waitAttr(page, '#servers', 'aria-busy', 'false');
      assert.equal(await count(page, ROWS), 0);
      assert.equal(await visible(page, '[data-action="retry"]'), 0);
    }
  },
  {
    name: 'untrusted fields stay text; unsafe URLs and unknown statuses are neutralized',
    async before(page) {
      await routeJson(page, DATA, () => ({ body: [
        { id: 'x1', name: '<img src=x onerror=alert(1)>', region: '<b>eu</b>', status: '<script>', url: 'javascript:alert(1)' },
        { id: 'x2', name: 'Good', region: 'kr', status: 'up', url: 'https://example.com/a?b=1&c=2' }
      ] }));
    },
    async run(page) {
      await waitCount(page, ROWS, 2);
      assert.equal(await count(page, '[data-ref="list"] img, [data-ref="list"] b, [data-ref="list"] script'), 0, 'no markup from data');
      assert.equal(await text(page, '[data-id="x1"] [data-ref="name"]'), '<img src=x onerror=alert(1)>');
      assert.equal(await page.getAttribute('[data-id="x1"] [data-ref="badge"]', 'data-state'), 'unknown');
      assert.equal(await text(page, '[data-id="x1"] [data-ref="badge"]'), 'Unknown');
      const bad = await page.$$eval('[data-id="x1"] a', (as) => as.map((a) => a.href).filter((h) => /^\s*javascript:/i.test(h)));
      assert.deepEqual(bad, [], 'no javascript: link');
      assert.equal(await page.getAttribute('[data-id="x2"] [data-ref="link"]', 'href'), 'https://example.com/a?b=1&c=2');
      assert.equal(await text(page, '[data-id="x2"] [data-ref="badge"]'), 'Up');
    }
  },
  {
    name: 'the status filter narrows the list and the "Showing" text',
    async run(page) {
      await waitCount(page, ROWS, 4);
      await waitStatus(page, 'Showing 4 of 4');
      await page.selectOption('[data-action="status-filter"]', 'down');
      await waitStatus(page, 'Showing 1 of 4');
      const ids = await page.$$eval(ROWS, (els) => els
        .filter((e) => !e.closest('[hidden]') && e.getBoundingClientRect().height > 0)
        .map((e) => e.getAttribute('data-id')));
      assert.deepEqual(ids, ['s3']);
      await page.selectOption('[data-action="status-filter"]', 'up');
      await waitStatus(page, 'Showing 2 of 4');
      await page.selectOption('[data-action="status-filter"]', 'all');
      await waitStatus(page, 'Showing 4 of 4');
    }
  }
];
