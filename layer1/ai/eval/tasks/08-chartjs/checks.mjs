// SPDX-License-Identifier: Apache-2.0
// Task 08 — Chart.js inside a component (needs network access for the CDN file).
import { assert, count, waitText, waitAttr } from '../../tools/helpers.mjs';

const REVENUE = [120, 135, 150, 142, 168, 181, 175, 190, 205, 198, 220, 236];
const ORDERS = [30, 32, 35, 33, 40, 44, 41, 46, 50, 48, 53, 57];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** The chart on [data-ref="chart"]: { id, labels, label, data, color, token1, token2 } or null. */
const chart = (page) => page.evaluate(() => {
  const canvas = document.querySelector('canvas[data-ref="chart"]');
  const c = canvas && window.Chart && window.Chart.getChart(canvas);
  if (!c) return null;
  const token = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const ds = c.data.datasets[0] || {};
  return { id: c.id, labels: c.data.labels.slice(), label: ds.label, data: (ds.data || []).slice(), color: String(ds.borderColor).trim(), token1: token('--vf-chart-1'), token2: token('--vf-chart-2') };
});

async function waitChart(page, want) {
  let last = null;
  for (let i = 0; i < 60; i++) {
    last = await chart(page);
    if (last && want(last)) return last;
    await page.waitForTimeout(50);
  }
  assert.fail('chart not as expected: ' + JSON.stringify(last));
}

const instances = (page) => page.evaluate(() => Object.keys(window.Chart.instances).length);

export default [
  {
    name: 'draws revenue for the first 6 months with the --vf-chart-1 color',
    async run(page) {
      const c = await waitChart(page, (x) => x.data.length === 6);
      assert.deepEqual(c.labels, MONTHS.slice(0, 6));
      assert.deepEqual(c.data, REVENUE.slice(0, 6));
      assert.equal(c.label, 'Revenue');
      assert.equal(c.color, c.token1, 'borderColor is --vf-chart-1');
      await waitText(page, '[data-ref="summary"]', 'Revenue: 6 months, last 181');
      await waitAttr(page, '[data-action="series"][data-series="revenue"]', 'aria-pressed', 'true');
      await waitAttr(page, '[data-action="series"][data-series="orders"]', 'aria-pressed', 'false');
      assert.equal(await instances(page), 1);
    }
  },
  {
    name: 'switching the series updates the same canvas and chart instance',
    async run(page) {
      const first = await waitChart(page, (x) => x.data.length === 6);
      await page.$eval('canvas[data-ref="chart"]', (el) => el.setAttribute('data-eval-mark', 'canvas'));
      await page.click('[data-action="series"][data-series="orders"]');
      const c = await waitChart(page, (x) => x.label === 'Orders');
      assert.deepEqual(c.data, ORDERS.slice(0, 6));
      assert.equal(c.color, c.token2, 'borderColor is --vf-chart-2');
      assert.equal(c.id, first.id, 'the same Chart.js instance');
      assert.equal(await count(page, 'canvas[data-ref="chart"][data-eval-mark="canvas"]'), 1, 'the same canvas element');
      await waitText(page, '[data-ref="summary"]', 'Orders: 6 months, last 44');
      await waitAttr(page, '[data-action="series"][data-series="orders"]', 'aria-pressed', 'true');
      await waitAttr(page, '[data-action="series"][data-series="revenue"]', 'aria-pressed', 'false');
      assert.equal(await instances(page), 1);
    }
  },
  {
    name: '"Add month" grows the chart up to 12 months, then is disabled',
    async run(page) {
      const first = await waitChart(page, (x) => x.data.length === 6);
      await page.click('[data-action="add-month"]');
      await page.click('[data-action="add-month"]');
      const c = await waitChart(page, (x) => x.data.length === 8);
      assert.deepEqual(c.labels, MONTHS.slice(0, 8));
      assert.deepEqual(c.data, REVENUE.slice(0, 8));
      assert.equal(c.id, first.id, 'the same Chart.js instance');
      await waitText(page, '[data-ref="summary"]', 'Revenue: 8 months, last 190');
      for (let i = 0; i < 4; i++) await page.click('[data-action="add-month"]');
      await waitChart(page, (x) => x.data.length === 12);
      assert.equal(await page.isDisabled('[data-action="add-month"]'), true);
      await page.click('[data-action="series"][data-series="orders"]');
      await waitChart(page, (x) => x.label === 'Orders' && x.data.length === 12);
    }
  },
  {
    name: 'hiding destroys the component and the chart; showing starts again',
    async run(page) {
      await waitChart(page, (x) => x.data.length === 6);
      await page.click('[data-action="add-month"]');
      await waitChart(page, (x) => x.data.length === 7);
      await page.click('[data-action="toggle-chart"]');
      await waitText(page, '[data-action="toggle-chart"]', 'Show chart');
      assert.equal(await count(page, 'canvas[data-ref="chart"]'), 0, 'no canvas');
      assert.equal(await instances(page), 0, 'no Chart.js instance left');
      await page.click('[data-action="toggle-chart"]');
      await waitText(page, '[data-action="toggle-chart"]', 'Hide chart');
      const c = await waitChart(page, (x) => x.data.length === 6);
      assert.equal(c.label, 'Revenue');
      assert.equal(await instances(page), 1);
      await page.click('[data-action="toggle-chart"]');
      await page.click('[data-action="toggle-chart"]');
      await waitChart(page, (x) => x.data.length === 6);
      assert.equal(await instances(page), 1, 'still one instance after two cycles');
    }
  }
];
