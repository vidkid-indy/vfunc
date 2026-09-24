// SPDX-License-Identifier: Apache-2.0
// Task 02 — to-do list.
import { assert, text, count, visible, waitText, waitCount, waitAttr, expectFocus } from '../../tools/helpers.mjs';

const ITEMS = '[data-ref="list"] [data-id]';

async function add(page, value) {
  const before = await count(page, ITEMS);
  await page.fill('[data-ref="input"]', value);
  await page.press('[data-ref="input"]', 'Enter');
  await waitCount(page, ITEMS, before + 1);
}

const idOf = (page, n) => page.locator(ITEMS).nth(n).getAttribute('data-id');

async function filterIs(page, name) {
  for (const f of ['all', 'open', 'done']) {
    await waitAttr(page, '[data-action="filter"][data-filter="' + f + '"]', 'aria-pressed', f === name ? 'true' : 'false');
  }
}

export default [
  {
    name: 'adds with Enter; the input is emptied and keeps the focus',
    async run(page) {
      assert.equal(await page.getByLabel('New task').getAttribute('data-ref'), 'input', 'label "New task"');
      await add(page, 'Buy milk');
      assert.equal(await page.inputValue('[data-ref="input"]'), '');
      await expectFocus(page, '[data-ref="input"]');
      await add(page, '  Call mom  ');
      assert.equal((await page.locator(ITEMS).nth(1).locator('[data-ref="text"]').innerText()).trim(), 'Call mom', 'trimmed');
      await waitText(page, '[data-ref="left"]', '2');
      const ids = [await idOf(page, 0), await idOf(page, 1)];
      assert.notEqual(ids[0], ids[1], 'unique data-id');
    }
  },
  {
    name: 'adds with the Add button; ignores empty text',
    async run(page) {
      await page.fill('[data-ref="input"]', 'Water plants');
      await page.getByRole('button', { name: 'Add', exact: true }).click();
      await waitCount(page, ITEMS, 1);
      await page.fill('[data-ref="input"]', '   ');
      await page.press('[data-ref="input"]', 'Enter');
      await page.waitForTimeout(100);
      assert.equal(await count(page, ITEMS), 1);
    }
  },
  {
    name: 'shows task text as text, not markup',
    async run(page) {
      await add(page, '<img src=x onerror=alert(1)>');
      assert.equal(await count(page, '[data-ref="list"] img'), 0);
      assert.equal(await text(page, ITEMS + ' [data-ref="text"]'), '<img src=x onerror=alert(1)>');
    }
  },
  {
    name: 'toggles with the keyboard and keeps the focus on the checkbox',
    async run(page) {
      await add(page, 'One');
      await add(page, 'Two');
      const id = await idOf(page, 1);
      assert.equal(await page.locator(ITEMS).nth(1).getAttribute('data-state'), 'open');
      await page.focus('#todo-' + id);
      await page.keyboard.press('Space');
      await waitAttr(page, '[data-ref="list"] [data-id="' + id + '"]', 'data-state', 'done');
      await expectFocus(page, '#todo-' + id, 'after the toggle');
      assert.equal(await page.isChecked('#todo-' + id), true);
      await waitText(page, '[data-ref="left"]', '1');
      await page.keyboard.press('Space');
      await waitAttr(page, '[data-ref="list"] [data-id="' + id + '"]', 'data-state', 'open');
      await waitText(page, '[data-ref="left"]', '2');
    }
  },
  {
    name: 'filters with aria-pressed "true"/"false"',
    async run(page) {
      await filterIs(page, 'all');
      await add(page, 'A');
      await add(page, 'B');
      await add(page, 'C');
      await page.click('#todo-' + (await idOf(page, 0)));
      await page.click('[data-action="filter"][data-filter="open"]');
      await filterIs(page, 'open');
      assert.equal(await visible(page, ITEMS), 2, 'open shows 2');
      await page.click('[data-action="filter"][data-filter="done"]');
      await filterIs(page, 'done');
      assert.equal(await visible(page, ITEMS), 1, 'done shows 1');
      await page.click('[data-action="filter"][data-filter="all"]');
      await filterIs(page, 'all');
      assert.equal(await visible(page, ITEMS), 3, 'all shows 3');
    }
  },
  {
    name: 'shows "Nothing here." only when the filter shows nothing',
    async run(page) {
      await waitText(page, '[data-ref="empty"]', 'Nothing here.');
      assert.equal(await visible(page, '[data-ref="empty"]'), 1);
      await add(page, 'Something');
      await page.waitForTimeout(50);
      assert.equal(await visible(page, '[data-ref="empty"]'), 0, 'hidden with a task');
      await page.click('[data-action="filter"][data-filter="done"]');
      await waitText(page, '[data-ref="empty"]', 'Nothing here.');
      assert.equal(await visible(page, '[data-ref="empty"]'), 1, 'shown when the filter matches nothing');
    }
  },
  {
    name: 'removes a task and updates the count',
    async run(page) {
      await add(page, 'Keep');
      await add(page, 'Drop');
      const id = await idOf(page, 1);
      await page.click('[data-ref="list"] [data-id="' + id + '"] [data-action="remove"]');
      await waitCount(page, ITEMS, 1);
      assert.equal(await text(page, ITEMS + ' [data-ref="text"]'), 'Keep');
      await waitText(page, '[data-ref="left"]', '1');
    }
  }
];
