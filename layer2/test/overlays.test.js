// SPDX-License-Identifier: Apache-2.0
// Overlays (D-032): dialog roles, focus in and back, Tab kept inside, Escape for the top layer,
// scroll lock, the menu button keyboard, popover, toast timers, confirm Promise.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { window, flush, click } from '../../layer1/test/setup-dom.js';
import vf from '../../layer1/src/vfunc.js';
import { vfModal, vfDrawer, vfConfirm, vfToast, vfDropdown, vfPopover, vsSplitButton, vfSplitButton } from '../src/index.js';

function key(element, name, init) {
  const event = new window.KeyboardEvent('keydown', Object.assign({ key: name, bubbles: true, cancelable: true }, init || {}));
  element.dispatchEvent(event);
  return event;
}

function recorder() {
  const calls = [];
  const fn = (e) => calls.push(e);
  fn.calls = calls;
  return fn;
}

function opener() {
  const button = document.createElement('button');
  button.textContent = 'open';
  document.body.appendChild(button);
  button.focus();
  return button;
}

const locked = () => document.documentElement.getAttribute('data-vf-scroll-lock') === 'true';

test('vfModal: added to body on open, dialog roles, focus in, Escape closes and returns focus', () => {
  const back = opener();
  const onClose = recorder();
  const modal = vfModal({
    title: 'Edit',
    content: vf.html`<input data-ref="name">`,
    footer: vf.vsButton({ label: 'Save', action: 'save' }),
    onClose
  });
  assert.equal(document.body.contains(modal.$node), false, 'not in the page before open');
  modal.open();
  assert.equal(modal.isOpen(), true);
  assert.equal(document.body.contains(modal.$node), true);
  const dialog = modal.$node.querySelector('[role="dialog"]');
  assert.equal(dialog.getAttribute('aria-modal'), 'true');
  assert.equal(dialog.getAttribute('aria-labelledby'), modal.$node.querySelector('h2').id);
  assert.equal(document.activeElement, modal.refs.name, 'the first control, not the close button');
  assert.equal(locked(), true);
  key(document.activeElement, 'Escape');
  assert.equal(modal.isOpen(), false);
  assert.equal(document.body.contains(modal.$node), false);
  assert.equal(document.activeElement, back, 'focus returns to the opener');
  assert.equal(locked(), false);
  assert.deepEqual(onClose.calls.map((e) => e.data.reason), ['escape']);
  modal.open();
  assert.equal(document.body.contains(modal.$node), true, 'opens again');
  click(modal.$node.querySelector('[data-action="backdrop"]'));
  assert.equal(modal.isOpen(), false);
  assert.equal(onClose.calls[1].data.reason, 'backdrop');
  modal.destroy();
  back.remove();
});

test('vfModal: Tab and Shift+Tab stay inside; onAction reports footer buttons; not dismissible ignores Escape', () => {
  const onAction = recorder();
  const modal = vfModal({ title: 'T', content: vf.html`<input data-ref="a">`, footer: vf.vsButton({ label: 'OK', action: 'ok' }), onAction, dismissible: false });
  modal.open();
  assert.equal(modal.$node.querySelector('[data-action="close"]'), null, 'no close button');
  const ok = modal.$node.querySelector('[data-action="ok"]');
  ok.focus();
  const forward = key(ok, 'Tab');
  assert.equal(forward.defaultPrevented, true);
  assert.equal(document.activeElement, modal.refs.a, 'wraps to the first');
  key(modal.refs.a, 'Tab', { shiftKey: true });
  assert.equal(document.activeElement, ok, 'wraps to the last');
  key(ok, 'Escape');
  assert.equal(modal.isOpen(), true, 'Escape does nothing when not dismissible');
  click(ok);
  assert.deepEqual(onAction.calls.map((e) => e.data.action), ['ok']);
  modal.close();
  assert.equal(modal.isOpen(), false);
  modal.destroy();
});

test('stacked layers: Escape closes only the top one; the scroll lock counts', () => {
  const a = vfModal({ title: 'A' });
  const b = vfDrawer({ title: 'B', side: 'start' });
  a.open();
  b.open();
  assert.equal(b.$node.getAttribute('data-side'), 'start');
  assert.match(b.$node.className, /vf-drawer/);
  key(document.activeElement || document.body, 'Escape');
  assert.equal(b.isOpen(), false);
  assert.equal(a.isOpen(), true);
  assert.equal(locked(), true, 'still locked for A');
  key(document.body, 'Escape');
  assert.equal(a.isOpen(), false);
  assert.equal(locked(), false);
  a.destroy();
  b.destroy();
});

test('vfModal: an instance as content is a child, destroyed with the modal', () => {
  let destroyed = 0;
  const child = vf.vfunc({ tag: 'p', innerHTML: 'child', onDestroy: () => { destroyed++; } });
  const modal = vfModal({ title: 'T', content: child });
  modal.open();
  assert.equal(modal.$node.querySelector('.vf-modal__body p').textContent, 'child');
  modal.destroy();
  assert.equal(destroyed, 1);
  assert.equal(locked(), false, 'destroy while open releases the lock');
});

test('vfConfirm: alertdialog, danger focuses cancel, the Promise answers', async () => {
  const ask = vfConfirm({ title: 'Delete?', message: 'Cannot be undone', variant: 'danger', confirmLabel: 'Delete' });
  const first = ask.open();
  assert.equal(ask.open(), first, 'the same Promise while open');
  const dialog = ask.$node.querySelector('[role="alertdialog"]');
  assert.equal(dialog.getAttribute('aria-describedby'), ask.$node.querySelector('.vf-confirm__message').id);
  assert.equal(document.activeElement.getAttribute('data-action'), 'cancel');
  assert.equal(ask.$node.querySelector('[data-action="confirm"]').getAttribute('data-variant'), 'danger');
  assert.equal(ask.$node.querySelector('[data-action="confirm"]').textContent, 'Delete');
  click(ask.$node.querySelector('[data-action="confirm"]'));
  assert.equal(await first, true);
  const second = ask.open();
  key(document.activeElement, 'Escape');
  assert.equal(await second, false);
  const plain = vfConfirm({ title: 'Go?' });
  const third = plain.open();
  assert.equal(document.activeElement.getAttribute('data-action'), 'confirm');
  assert.equal(plain.$node.querySelector('[data-action="cancel"]').textContent, 'Cancel');
  click(plain.$node.querySelector('[data-action="cancel"]'));
  assert.equal(await third, false);
  ask.destroy();
  plain.destroy();
});

test('vfToast: a live region in body, show / dismiss / max, timers, held while hovered, action', async () => {
  const toast = vfToast({ duration: 30, max: 2 });
  const region = toast.$node;
  assert.equal(document.body.contains(region), true);
  assert.equal(region.getAttribute('aria-live'), 'polite');
  assert.equal(region.getAttribute('aria-label'), 'Notifications');
  const first = toast.show({ message: 'One' });
  toast.show({ message: 'Two', variant: 'danger' });
  toast.show({ message: 'Three', duration: 0 });
  await flush();
  assert.equal(toast.$node, region, 'the live region is never replaced');
  assert.deepEqual(Array.from(region.querySelectorAll('.vf-toast__message')).map((n) => n.textContent), ['Two', 'Three'], 'max 2: the oldest went');
  assert.equal(region.querySelector('#' + first), null);
  assert.equal(region.querySelector('.vf-toast[data-variant="danger"]').getAttribute('role'), 'alert');
  region.dispatchEvent(new window.MouseEvent('mouseenter'));
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(region.querySelectorAll('.vf-toast').length, 2, 'held while hovered');
  region.dispatchEvent(new window.MouseEvent('mouseleave'));
  await new Promise((r) => setTimeout(r, 60));
  assert.deepEqual(Array.from(region.querySelectorAll('.vf-toast__message')).map((n) => n.textContent), ['Three'], 'duration 0 stays');
  const clicks = recorder();
  const id = toast.show({ message: 'Undo?', duration: 0, action: { label: 'Undo', onClick: clicks } });
  await flush();
  click(region.querySelector('[data-action="toast-action"]'));
  await flush();
  assert.deepEqual(clicks.calls.map((e) => e.data.id), [id]);
  assert.equal(region.querySelector('#' + id), null, 'gone after its action');
  click(region.querySelector('[data-action="dismiss"]'));
  await flush();
  assert.equal(region.querySelectorAll('.vf-toast').length, 0);
  toast.destroy();
});

test('vfDropdown: menu button aria, open on ArrowDown, arrows, letters, Enter selects and returns focus', () => {
  const onSelect = recorder();
  const dd = vfDropdown({
    trigger: { label: 'Actions' },
    items: [{ label: 'Rename', action: 'rename' }, { separator: true }, { label: 'Archive', action: 'archive', disabled: true }, { label: 'Delete', action: 'delete', danger: true }],
    onSelect
  });
  document.body.appendChild(dd.$node);
  const trigger = () => dd.ids[dd.state.id + '-trigger'];
  const menu = () => dd.ids[dd.state.id + '-menu'];
  assert.equal(trigger().getAttribute('aria-haspopup'), 'menu');
  assert.equal(trigger().getAttribute('aria-expanded'), 'false');
  assert.equal(menu().hidden, true);
  assert.equal(menu().getAttribute('aria-labelledby'), trigger().id);
  key(trigger(), 'ArrowDown');
  assert.equal(dd.isOpen(), true);
  assert.equal(trigger().getAttribute('aria-expanded'), 'true');
  assert.equal(menu().hidden, false);
  assert.ok(menu().style.top !== '', 'placed with coordinates');
  assert.equal(document.activeElement.textContent, 'Rename');
  key(document.activeElement, 'ArrowUp');
  assert.equal(document.activeElement.textContent, 'Delete', 'wraps to the last');
  key(document.activeElement, 'a');
  assert.equal(document.activeElement.textContent, 'Archive', 'first letter');
  key(document.activeElement, 'Enter');
  assert.equal(dd.isOpen(), true, 'a disabled item is not chosen');
  key(document.activeElement, 'End');
  key(document.activeElement, 'Enter');
  assert.equal(dd.isOpen(), false);
  assert.equal(document.activeElement, trigger(), 'focus back on the trigger');
  assert.deepEqual(onSelect.calls.map((e) => e.data.action), ['delete']);
  click(trigger());
  assert.equal(dd.isOpen(), true, 'a click opens');
  key(document.activeElement, 'Escape');
  assert.equal(dd.isOpen(), false);
  assert.equal(document.activeElement, trigger());
  click(trigger());
  document.body.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true }));
  assert.equal(dd.isOpen(), false, 'an outside press closes');
  dd.destroy();
});

test('vsSplitButton and vfSplitButton: main button and menu, onClick and onSelect', () => {
  const holder = document.createElement('div');
  holder.innerHTML = String(vsSplitButton({ id: 's', label: 'Save', action: 'save', items: [{ label: 'Draft', action: 'draft' }] }));
  const group = holder.firstElementChild;
  assert.equal(group.getAttribute('role'), 'group');
  assert.equal(group.querySelector('#s-main').getAttribute('data-action'), 'save');
  assert.equal(group.querySelector('#s-trigger').getAttribute('aria-label'), 'More options');
  assert.equal(group.querySelector('#s-menu').hidden, true);
  const onClick = recorder();
  const onSelect = recorder();
  const split = vfSplitButton({ label: 'Save', action: 'save', items: [{ label: 'Draft', action: 'draft' }], onClick, onSelect });
  document.body.appendChild(split.$node);
  click(split.ids[split.state.id + '-main']);
  assert.deepEqual(onClick.calls.map((e) => e.data.action), ['save']);
  click(split.ids[split.state.id + '-trigger']);
  click(split.$node.querySelector('[data-action="menu-item"]'));
  assert.deepEqual(onSelect.calls.map((e) => e.data.action), ['draft']);
  assert.equal(split.isOpen(), false);
  split.destroy();
});

test('vfPopover: non-modal dialog, focus in, close button and Escape return focus', () => {
  const onClose = recorder();
  const pop = vfPopover({ trigger: { label: 'Help' }, title: 'Tips', content: vf.html`<a href="#x">more</a>`, onClose });
  document.body.appendChild(pop.$node);
  const trigger = () => pop.ids[pop.state.id + '-trigger'];
  const panel = () => pop.ids[pop.state.id + '-panel'];
  assert.equal(trigger().getAttribute('aria-haspopup'), 'dialog');
  click(trigger());
  assert.equal(pop.isOpen(), true);
  assert.equal(panel().getAttribute('role'), 'dialog');
  assert.equal(panel().hasAttribute('aria-modal'), false);
  assert.equal(panel().getAttribute('aria-labelledby'), pop.$node.querySelector('.vf-popover__title').id);
  assert.equal(document.activeElement.textContent, 'more', 'focus on the content');
  key(document.activeElement, 'Escape');
  assert.equal(pop.isOpen(), false);
  assert.equal(document.activeElement, trigger());
  click(trigger());
  click(pop.$node.querySelector('[data-action="close"]'));
  assert.equal(pop.isOpen(), false);
  assert.deepEqual(onClose.calls.map((e) => e.data.reason), ['escape', 'close']);
  pop.destroy();
});
