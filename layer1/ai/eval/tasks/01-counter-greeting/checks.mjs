// SPDX-License-Identifier: Apache-2.0
// Task 01 — counter and greeting.
import { assert, text, count, waitText, waitAttr, expectFocus } from '../../tools/helpers.mjs';

const clickTimes = async (page, selector, n) => { for (let i = 0; i < n; i++) await page.click(selector); };

export default [
  {
    name: 'the input has the visible label "Your name"',
    async run(page) {
      assert.equal(await page.getByLabel('Your name').getAttribute('id'), 'name');
    }
  },
  {
    name: 'greets a stranger when the input is empty',
    async run(page) {
      await waitText(page, '[data-ref="greeting"]', 'Hello, stranger!');
      await page.fill('#name', '   ');
      await waitText(page, '[data-ref="greeting"]', 'Hello, stranger!');
    }
  },
  {
    name: 'follows every keystroke without losing focus or characters',
    async run(page) {
      await page.click('#name');
      await page.keyboard.type('Jiwoo Lee', { delay: 20 });
      await waitText(page, '[data-ref="greeting"]', 'Hello, Jiwoo Lee!');
      assert.equal(await page.inputValue('#name'), 'Jiwoo Lee');
      await expectFocus(page, '#name');
      await page.keyboard.press('Home');
      await page.keyboard.type('Dr ');
      assert.equal(await page.inputValue('#name'), 'Dr Jiwoo Lee', 'the caret stays where it was');
    }
  },
  {
    name: 'shows the name as text, not markup',
    async run(page) {
      await page.fill('#name', '<b>Kim</b>');
      await waitText(page, '[data-ref="greeting"]', 'Hello, <b>Kim</b>!');
      assert.equal(await count(page, '[data-ref="greeting"] b'), 0);
    }
  },
  {
    name: 'counts up and down, never below zero',
    async run(page) {
      await waitText(page, '[data-ref="count"]', '0');
      await waitAttr(page, '[data-ref="count"]', 'data-state', 'zero');
      assert.equal(await page.isDisabled('[data-action="dec"]'), true, 'dec is disabled at 0');
      await clickTimes(page, '[data-action="inc"]', 3);
      await waitText(page, '[data-ref="count"]', '3');
      await waitAttr(page, '[data-ref="count"]', 'data-state', 'positive');
      await clickTimes(page, '[data-action="dec"]', 3);
      await waitText(page, '[data-ref="count"]', '0');
      assert.equal(await page.isDisabled('[data-action="dec"]'), true, 'dec is disabled again');
      await page.$eval('[data-action="dec"]', (el) => el.click());
      await page.waitForTimeout(50);
      assert.equal(await text(page, '[data-ref="count"]'), '0');
    }
  },
  {
    name: 'reset goes back to zero',
    async run(page) {
      await clickTimes(page, '[data-action="inc"]', 2);
      await waitText(page, '[data-ref="count"]', '2');
      await page.click('[data-action="reset"]');
      await waitText(page, '[data-ref="count"]', '0');
      await waitAttr(page, '[data-ref="count"]', 'data-state', 'zero');
      assert.equal(await page.isDisabled('[data-action="dec"]'), true);
    }
  }
];
