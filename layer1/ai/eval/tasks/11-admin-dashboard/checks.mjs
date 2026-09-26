// SPDX-License-Identifier: Apache-2.0
// Task 11 — admin dashboard with layer 2 (vfSearchInput, vfGrid, vfChart).
import { readFileSync } from 'node:fs';
import { assert, count, text, waitText, waitCount } from '../../tools/helpers.mjs';

// The task's data, read from data.js as text (no evaluation).
const DATA = readFileSync(new URL('./input/data.js', import.meta.url), 'utf8');
const USERS = [];
DATA.replace(/\{ id: '(\w+)', name: '([^']+)', email: '([^']+)', role: '(\w+)', joined: '([\d-]+)' \}/g, (m, id, name, email, role, joined) => {
  USERS.push({ id, name, email, role, joined });
  return m;
});
const MONTHS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
const LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const ROWS = '#users-grid tbody tr';
const firstRow = (page) => text(page, ROWS);
const rowTexts = (page) => page.$$eval(ROWS, (rows) => rows.map((r) => r.textContent.replace(/\s+/g, ' ').trim()));

async function search(page, value) {
  await page.fill('#q', value);
  await page.dispatchEvent('#q', 'input');
}

export default [
  {
    name: 'the grid shows 10 of the 30 users with the caption, the columns and a role badge',
    async run(page) {
      assert.equal(USERS.length, 30, 'data.js read');
      await waitCount(page, ROWS, 10);
      assert.equal(await text(page, '#users-grid caption'), 'Users');
      const heads = await page.$$eval('#users-grid thead th', (ths) => ths.map((th) => th.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean));
      assert.deepEqual(heads, ['Name', 'Email', 'Role', 'Joined']);
      assert.match(await firstRow(page), /Ada Kim/);
      const badge = await page.$$eval(ROWS + ':first-child td', (tds) => {
        const cell = tds.filter((td) => td.textContent.trim() === 'admin')[0];
        return cell ? cell.children.length : -1;
      });
      assert.ok(badge >= 1, 'the role is an element (vsBadge), not plain text');
      assert.equal(await text(page, '[data-ref="selected"]'), '0 selected');
    }
  },
  {
    name: 'sorting by name and by joined date',
    async run(page) {
      await waitCount(page, ROWS, 10);
      await page.click('#users-grid [data-action="sort"][data-value="name"]');
      await page.click('#users-grid [data-action="sort"][data-value="name"]');
      await page.waitForFunction((sel) => /Yuki Jung/.test(document.querySelector(sel).textContent), ROWS);
      await page.click('#users-grid [data-action="sort"][data-value="joined"]');
      const byJoined = USERS.slice().sort((a, b) => (a.joined < b.joined ? -1 : a.joined > b.joined ? 1 : 0));
      await page.waitForFunction((a) => {
        const rows = document.querySelectorAll(a.sel);
        return rows.length > 1 && rows[0].textContent.indexOf(a.one) >= 0 && rows[1].textContent.indexOf(a.two) >= 0;
      }, { sel: ROWS, one: byJoined[0].name, two: byJoined[1].name });
    }
  },
  {
    name: 'searching filters by name (ignoring case) and goes back to page 1; clearing shows everyone',
    async run(page) {
      await waitCount(page, ROWS, 10);
      await page.click('#users [data-action="page"][data-page="2"]');
      await page.waitForFunction((sel) => !/Ada Kim/.test(document.querySelector(sel).textContent), ROWS);
      await search(page, 'LI');
      const expected = USERS.filter((u) => u.name.toLowerCase().indexOf('li') >= 0).map((u) => u.name);
      await waitCount(page, ROWS, expected.length);
      const rows = await rowTexts(page);
      for (const name of expected) assert.ok(rows.some((r) => r.indexOf(name) >= 0), name + ' is shown');
      await search(page, 'a');
      await page.waitForFunction((sel) => /Ada Kim/.test(document.querySelector(sel).textContent), ROWS);
      await search(page, '');
      await waitCount(page, ROWS, 10);
      assert.match(await firstRow(page), /Ada Kim/);
    }
  },
  {
    name: 'selecting rows updates the selected count',
    async run(page) {
      await waitCount(page, ROWS, 10);
      const boxes = page.locator('#users-grid [data-action="select-row"]');
      await boxes.nth(0).check();
      await boxes.nth(2).check();
      await waitText(page, '[data-ref="selected"]', '2 selected');
      await boxes.nth(0).uncheck();
      await waitText(page, '[data-ref="selected"]', '1 selected');
    }
  },
  {
    name: 'the chart counts sign-ups per month, with its label and data table',
    async run(page) {
      await waitCount(page, '#signups-chart [data-action="mark"]', 6);
      assert.equal(await count(page, '#signups-chart svg[aria-label="Sign-ups per month"]'), 1, 'the chart label');
      const expected = MONTHS.map((m) => String(USERS.filter((u) => u.joined.indexOf(m) === 0).length));
      const table = await page.$$eval('#signups-chart table tbody tr', (rows) => rows.map((r) => Array.from(r.cells).map((c) => c.textContent.trim())));
      assert.deepEqual(table.map((r) => r[0]), LABELS, 'month labels');
      assert.deepEqual(table.map((r) => r[r.length - 1]), expected, 'sign-ups per month');
      const head = await page.$$eval('#signups-chart table thead th', (ths) => ths.map((th) => th.textContent.trim()));
      assert.ok(head.indexOf('Sign-ups') >= 0, 'the series name');
    }
  }
];
