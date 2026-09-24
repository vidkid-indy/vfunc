// SPDX-License-Identifier: Apache-2.0
// Task 10 — seven seeded bugs, one check each (the traps found by the independent runs, D-023).
import { assert, text, count, waitText, waitCount, waitAttr, expectFocus } from '../../tools/helpers.mjs';

const TASK = (id) => '#tasks [data-id="' + id + '"]';

export default [
  {
    name: 'bug 1: attach + render fills #notice instead of nesting a second one',
    async run(page) {
      await waitText(page, '#notice', 'Open tasks: 2');
      await page.click(TASK('t1') + ' [data-action="toggle"]');
      await waitText(page, '#notice', 'Open tasks: 1');
      assert.equal(await count(page, '[id="notice"]'), 1, 'one #notice');
      assert.equal(await count(page, '#notice section, #notice .notice'), 0, 'nothing nested');
    }
  },
  {
    name: 'bug 2: the Details button says aria-expanded "false" / "true"',
    async run(page) {
      await waitAttr(page, '[data-action="details"]', 'aria-expanded', 'false');
      assert.equal(await page.$eval('#details', (el) => el.hidden), true);
      await page.click('[data-action="details"]');
      await waitAttr(page, '[data-action="details"]', 'aria-expanded', 'true');
      assert.equal(await page.$eval('#details', (el) => el.hidden), false);
      await page.click('[data-action="details"]');
      await waitAttr(page, '[data-action="details"]', 'aria-expanded', 'false');
    }
  },
  {
    name: 'bug 3: switching the language keeps the theme (store.set is a shallow merge)',
    async run(page) {
      await waitText(page, '[data-ref="theme"]', 'light');
      await page.click('[data-action="theme"]');
      await waitText(page, '[data-ref="theme"]', 'dark');
      await page.click('[data-action="lang"][data-lang="ko"]');
      await waitText(page, '[data-ref="lang"]', 'ko');
      await waitText(page, '[data-ref="theme"]', 'dark');
      await page.click('[data-action="theme"]');
      await waitText(page, '[data-ref="theme"]', 'light');
      await waitText(page, '[data-ref="lang"]', 'ko');
    }
  },
  {
    name: 'bug 4: closing the clock stops its timer',
    async run(page) {
      await page.waitForFunction(() => {
        const el = document.querySelector('[data-ref="updates"]');
        return el && Number(el.textContent) >= 2;
      });
      await page.click('[data-action="close-clock"]');
      await waitCount(page, '[data-action="close-clock"]', 0);
      await page.waitForTimeout(300);
      const before = await text(page, '[data-ref="updates"]');
      await page.waitForTimeout(1000);
      assert.equal(await text(page, '[data-ref="updates"]'), before, 'the counter stopped');
    }
  },
  {
    name: 'bug 5: Remove works (delegation on data-action, not a class)',
    async run(page) {
      await waitCount(page, '#tasks [data-id]', 3);
      await page.click(TASK('t2') + ' [data-action="remove"]');
      await waitCount(page, '#tasks [data-id]', 2);
      assert.equal(await count(page, TASK('t2')), 0);
      await waitText(page, '#notice', 'Open tasks: 1');
    }
  },
  {
    name: 'bug 6: comments are text, never markup',
    async run(page) {
      await page.fill('[data-ref="comment"]', '<b>hi</b>');
      await page.press('[data-ref="comment"]', 'Enter');
      await page.fill('[data-ref="comment"]', '<img src=x onerror=alert(1)>');
      await page.press('[data-ref="comment"]', 'Enter');
      await waitCount(page, '[data-ref="comment-list"] li', 2);
      assert.equal(await count(page, '[data-ref="comment-list"] b, [data-ref="comment-list"] img'), 0);
      const texts = await page.$$eval('[data-ref="comment-list"] li', (lis) => lis.map((li) => li.textContent.trim()));
      assert.deepEqual(texts, ['<b>hi</b>', '<img src=x onerror=alert(1)>']);
    }
  },
  {
    name: 'bug 7: Space on a task checkbox keeps the focus there',
    async run(page) {
      const box = TASK('t2') + ' [data-action="toggle"]';
      await page.focus(box);
      await page.keyboard.press('Space');
      await waitAttr(page, TASK('t2'), 'data-state', 'done');
      await expectFocus(page, box, 'after the toggle');
      await page.keyboard.press('Space');
      await waitAttr(page, TASK('t2'), 'data-state', 'open');
      await expectFocus(page, box, 'after the second toggle');
    }
  }
];
