// SPDX-License-Identifier: Apache-2.0
// Instances in the slots of vf* components stay alive (D-038): they sit in their slot element,
// keep their node and state across the owner's re-renders, get onMount once with the owner and are
// destroyed with it. vfModal / vfDrawer did this first; vfTabs, vfAccordion, vfCarousel and
// vfPopover share the helper (_internal/slots.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flush, click } from '../../layer1/test/setup-dom.js';
import vf from '../../layer1/src/vfunc.js';
import { vfTabs, vfAccordion, vfCarousel, vfPopover, vfModal } from '../src/index.js';
import { slotChilds, isInstance } from '../src/_internal/slots.js';

/** A counter instance that records its lifecycle. */
function probe() {
  const log = { mount: 0, destroy: 0 };
  const inst = vf.vfunc({
    state: { count: 0 },
    render: (s) => vf.html`<button type="button" data-action="inc">${s.count}</button>`,
    delegates: [{ selector: '[data-action="inc"]', eventType: 'click', onEvent: (e) => { e.sender.count++; } }],
    onMount: () => { log.mount++; },
    onDestroy: () => { log.destroy++; }
  });
  inst.log = log;
  return inst;
}

async function check(name, owner, child, slotId, rerender) {
  await owner.mount(document.body);
  const slot = () => document.getElementById(slotId);
  assert.ok(slot() && slot().contains(child.$node), name + ': the instance is in its slot');
  assert.equal(child.log.mount, 1, name + ': onMount with the owner');
  click(child.$node.querySelector('[data-action="inc"]'));
  await flush();
  const node = child.$node;
  await rerender();
  await flush();
  assert.ok(slot().contains(node), name + ': the same node after the owner re-renders');
  assert.equal(child.state.count, 1, name + ': state kept');
  click(slot().querySelector('[data-action="inc"]'));
  await flush();
  assert.equal(child.state.count, 2, name + ': listeners still work');
  assert.equal(child.log.mount, 1, name + ': onMount only once');
  owner.destroy();
  assert.equal(child.log.destroy, 1, name + ': destroyed with the owner');
}

test('slotChilds takes the instances out and leaves markup alone', () => {
  const a = probe();
  const items = [{ id: 'x', content: 'text' }, { id: 'y', content: a }];
  const out = slotChilds(items, 'content', (i) => 'slot-' + i);
  assert.deepEqual(out.items, [{ id: 'x', content: 'text' }, { id: 'y', content: '' }]);
  assert.equal(out.items[0], items[0], 'items without an instance are not copied');
  assert.equal(items[1].content, a, 'the given items are not changed');
  assert.deepEqual(out.childs, [{ targetId: 'slot-1', component: a }]);
  assert.equal(isInstance(a), true);
  assert.equal(isInstance(vf.html`<b></b>`), false);
});

test('vfTabs: an instance in a tab panel survives tab changes', async () => {
  const child = probe();
  const tabs = vfTabs({ id: 't', tabs: [{ id: 'a', label: 'A', content: vf.html`<p>A</p>` }, { id: 'b', label: 'B', content: child }], active: 'b' });
  await check('vfTabs', tabs, child, 't-panel-1', () => { tabs.select('a'); tabs.select('b'); });
});

test('vfTabs: passing the same instance again in setState draws no static copy', async () => {
  const child = probe();
  const tabs = vfTabs({ id: 't2', tabs: [{ id: 'a', label: 'A', content: child }] });
  await tabs.mount(document.body);
  tabs.setState({ tabs: [{ id: 'a', label: 'Renamed', content: child }] });
  await flush();
  const panel = document.getElementById('t2-panel-0');
  assert.equal(panel.querySelectorAll('[data-action="inc"]').length, 1, 'one button: the live one');
  assert.ok(panel.contains(child.$node));
  assert.match(document.getElementById('t2-tab-0').textContent, /Renamed/);
  tabs.destroy();
});

test('vfAccordion: an instance in a panel survives toggling', async () => {
  const child = probe();
  const acc = vfAccordion({ id: 'acc', items: [{ id: 'one', title: 'One', content: child, open: true }] });
  await check('vfAccordion', acc, child, 'acc-panel-0', () => { acc.close('one'); acc.open('one'); });
});

test('vfCarousel: an instance in a slide survives moving', async () => {
  const child = probe();
  const car = vfCarousel({ id: 'car', label: 'Slides', items: [{ content: child }, { content: vf.html`<p>2</p>` }] });
  await check('vfCarousel', car, child, 'car-slide-0', () => { car.next(); car.prev(); });
});

test('vfPopover: an instance as the content survives opening and closing', async () => {
  const child = probe();
  const pop = vfPopover({ id: 'pop', trigger: { label: 'More' }, title: 'More', content: child });
  await check('vfPopover', pop, child, 'pop-body', () => { pop.open(); pop.close(); pop.refresh(); });
});

test('vfModal: an instance as the content survives opening, closing and refresh', async () => {
  const child = probe();
  const modal = vfModal({ id: 'dlg', title: 'Edit', content: child });
  modal.open();
  await flush();
  assert.ok(document.getElementById('dlg-body').contains(child.$node));
  click(child.$node.querySelector('[data-action="inc"]'));
  await flush();
  modal.refresh();
  await flush();
  assert.equal(child.state.count, 1);
  modal.close();
  modal.destroy();
  assert.equal(child.log.destroy, 1);
});
