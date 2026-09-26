// SPDX-License-Identifier: Apache-2.0
// Task 13 — delete with a vfConfirm, a vfToast and focus management (layer 2).
// Dialogs are opened with the keyboard (focus + Enter): WebKit does not focus a clicked button.
import { assert, count, text, waitText, waitCount, expectFocus } from '../../tools/helpers.mjs';

const dialog = (page) => page.locator('[role="alertdialog"]');

async function openDelete(page, id) {
  await page.focus('#delete-' + id);
  await page.keyboard.press('Enter');
  await dialog(page).waitFor({ state: 'visible' });
}

async function confirmDelete(page, id) {
  await openDelete(page, id);
  await dialog(page).getByRole('button', { name: 'Delete', exact: true }).click();
  await dialog(page).waitFor({ state: 'detached' }).catch(() => dialog(page).waitFor({ state: 'hidden' }));
}

export default [
  {
    name: 'the list, the buttons and the count',
    async run(page) {
      await waitCount(page, '#files li', 3);
      assert.deepEqual(await page.$$eval('#files [data-action="delete"]', (bs) => bs.map((b) => [b.id, b.getAttribute('aria-label'), b.textContent.trim()])), [
        ['delete-f1', 'Delete report.pdf', 'Delete'],
        ['delete-f2', 'Delete photo.png', 'Delete'],
        ['delete-f3', 'Delete notes.txt', 'Delete']
      ]);
      assert.equal(await text(page, '[data-ref="count"]'), '3 files');
    }
  },
  {
    name: 'the confirm: alertdialog with the title and message, focus on Cancel; Escape changes nothing and returns the focus',
    async run(page) {
      await waitCount(page, '#files li', 3);
      await openDelete(page, 'f2');
      const body = await dialog(page).innerText();
      assert.ok(body.indexOf('Delete photo.png?') >= 0, 'title');
      assert.ok(body.indexOf('This cannot be undone.') >= 0, 'message');
      assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Cancel', 'danger: the focus starts on Cancel');
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('[role="alertdialog"]') || document.querySelector('[role="alertdialog"]').offsetParent === null);
      await expectFocus(page, '#delete-f2', 'back to the Delete button');
      assert.equal(await count(page, '#files li'), 3);
    }
  },
  {
    name: 'Cancel changes nothing',
    async run(page) {
      await waitCount(page, '#files li', 3);
      await openDelete(page, 'f1');
      await dialog(page).getByRole('button', { name: 'Cancel', exact: true }).click();
      await expectFocus(page, '#delete-f1', 'back to the Delete button');
      assert.equal(await count(page, '#files li'), 3);
      assert.equal(await text(page, '[data-ref="count"]'), '3 files');
    }
  },
  {
    name: 'confirming deletes, counts, shows the toast and focuses the next Delete button',
    async run(page) {
      await waitCount(page, '#files li', 3);
      await confirmDelete(page, 'f2');
      await waitCount(page, '#files li', 2);
      assert.equal(await count(page, '#delete-f2'), 0);
      await waitText(page, '[data-ref="count"]', '2 files');
      await page.getByText('Deleted photo.png').first().waitFor({ state: 'visible' });
      await expectFocus(page, '#delete-f3', 'the next file');
    }
  },
  {
    name: 'deleting the last file focuses the previous one; deleting everything focuses the heading',
    async run(page) {
      await waitCount(page, '#files li', 3);
      await confirmDelete(page, 'f3');
      await waitCount(page, '#files li', 2);
      await expectFocus(page, '#delete-f2', 'the previous file');
      await confirmDelete(page, 'f2');
      await waitText(page, '[data-ref="count"]', '1 file');
      await expectFocus(page, '#delete-f1', 'the only file left');
      await confirmDelete(page, 'f1');
      await waitCount(page, '#files li', 0);
      await waitText(page, '[data-ref="count"]', '0 files');
      await expectFocus(page, '#files-title', 'the heading');
    }
  }
];
