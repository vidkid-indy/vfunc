// SPDX-License-Identifier: Apache-2.0
// Navigation components, ListView and Carousel: markup and aria of the WAI-ARIA patterns, keyboard,
// callbacks, timers released on destroy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { window, flush, click } from '../../layer1/test/setup-dom.js';
import vf from '../../layer1/src/vfunc.js';
import {
  vsBreadcrumb, vsPagination, vfPagination, vsTabs, vfTabs, vsAccordion, vfAccordion,
  vsStepper, vfStepper, vsListView, vfListView, vfCarousel
} from '../src/index.js';
import { pageList } from '../src/components/pagination.js';

function parse(markup) {
  const holder = document.createElement('div');
  holder.innerHTML = String(markup);
  assert.equal(holder.children.length, 1, 'one root element');
  return holder.firstElementChild;
}

function mounted(instance) {
  document.body.appendChild(instance.$node);
  return instance;
}

function key(element, name) {
  element.dispatchEvent(new window.KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
}

function recorder() {
  const calls = [];
  const fn = (e) => calls.push(e);
  fn.calls = calls;
  return fn;
}

const EVIL = '"><img src=x onerror=alert(1)>';

test('every navigation vs* escapes its text', () => {
  const markup = [
    vsBreadcrumb({ items: [{ label: EVIL, href: 'javascript:alert(1)' }, { label: EVIL }] }),
    vsPagination({ total: 50, label: EVIL }),
    vsTabs({ label: EVIL, tabs: [{ id: EVIL, label: EVIL, content: EVIL }] }),
    vsAccordion({ items: [{ id: EVIL, title: EVIL, content: EVIL }] }),
    vsStepper({ label: EVIL, steps: [EVIL, { label: EVIL, description: EVIL }] }),
    vsListView({ label: EVIL, items: [EVIL, { title: EVIL, description: EVIL }], selectable: 'single' })
  ];
  for (const m of markup) assert.equal(parse(m).querySelector('img'), null, String(m));
  assert.equal(parse(markup[0]).querySelector('a').getAttribute('href'), '#', 'hrefs go through vf.safeUrl');
});

test('vsBreadcrumb: nav label, links, the last item is the current page', () => {
  const nav = parse(vsBreadcrumb({ items: [{ label: 'Home', href: '#/' }, { label: 'Docs' }, { label: 'API', href: '#/api' }] }));
  assert.equal(nav.tagName, 'NAV');
  assert.equal(nav.getAttribute('aria-label'), 'Breadcrumb');
  const items = nav.querySelectorAll('li');
  assert.equal(items[0].querySelector('a').getAttribute('href'), '#/');
  assert.equal(items[1].querySelector('a'), null, 'no href: text');
  assert.equal(items[2].querySelector('a'), null, 'the current page is not a link');
  assert.equal(items[2].querySelector('[aria-current="page"]').textContent, 'API');
});

test('pageList: first, last, the window around the page and the gaps', () => {
  assert.deepEqual(pageList(1, 1, 1), [1]);
  assert.deepEqual(pageList(5, 10, 1), [1, 0, 4, 5, 6, 0, 10]);
  assert.deepEqual(pageList(3, 10, 1), [1, 2, 3, 4, 0, 10], 'no gap for a single hidden page');
  assert.deepEqual(pageList(10, 10, 1), [1, 0, 9, 10]);
});

test('vsPagination and vfPagination: labels, current page, disabled ends, onChange, setTotal', async () => {
  const nav = parse(vsPagination({ total: 95, page: 1 }));
  const buttons = nav.querySelectorAll('button');
  assert.equal(buttons[0].getAttribute('aria-label'), 'Previous page');
  assert.equal(buttons[0].disabled, true);
  assert.equal(nav.querySelector('[aria-current="page"]').textContent, '1');
  assert.equal(nav.querySelector('[aria-current="page"]').getAttribute('aria-label'), 'Page 1');
  assert.equal(buttons[buttons.length - 1].getAttribute('data-page'), '2');
  const onChange = recorder();
  const pager = mounted(vfPagination({ total: 95, onChange }));
  click(pager.$node.querySelector('[data-page="10"]'));
  await flush();
  assert.equal(pager.getValue(), 10);
  assert.equal(pager.$node.querySelector('[data-action="page"][aria-label="Next page"]').disabled, true);
  pager.setTotal(30);
  await flush();
  assert.equal(pager.getValue(), 3, 'the page is clamped to the new last page');
  assert.deepEqual(onChange.calls.map((e) => e.data.page), [10]);
  pager.destroy();
});

test('vsTabs: tablist, tabs and panels linked, roving tabindex, first enabled tab by default', () => {
  const root = parse(vsTabs({ id: 't', label: 'Settings', tabs: [{ id: 'a', label: 'A', disabled: true }, { id: 'b', label: 'B', content: 'bee' }, { id: 'c', label: 'C' }] }));
  assert.equal(root.querySelector('[role="tablist"]').getAttribute('aria-label'), 'Settings');
  const tabs = root.querySelectorAll('[role="tab"]');
  assert.deepEqual(Array.from(tabs).map((t) => t.getAttribute('aria-selected')), ['false', 'true', 'false']);
  assert.deepEqual(Array.from(tabs).map((t) => t.getAttribute('tabindex')), ['-1', '0', '-1']);
  const panel = root.querySelector('#' + tabs[1].getAttribute('aria-controls'));
  assert.equal(panel.getAttribute('role'), 'tabpanel');
  assert.equal(panel.getAttribute('aria-labelledby'), tabs[1].id);
  assert.equal(panel.hidden, false);
  assert.equal(panel.textContent, 'bee');
  assert.equal(root.querySelectorAll('[role="tabpanel"][hidden]').length, 2);
});

test('vfTabs: click, arrow keys skip disabled tabs and wrap, Home/End, focus follows, onChange', () => {
  const onChange = recorder();
  const t = mounted(vfTabs({ tabs: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B', disabled: true }, { id: 'c', label: 'C' }], onChange }));
  const tab = (i) => t.$node.querySelectorAll('[role="tab"]')[i];
  click(tab(2));
  assert.equal(t.getValue(), 'c');
  assert.equal(document.activeElement, tab(2));
  key(tab(2), 'ArrowRight');
  assert.equal(t.getValue(), 'a', 'wraps to the first');
  assert.equal(document.activeElement, tab(0));
  key(tab(0), 'ArrowRight');
  assert.equal(t.getValue(), 'c', 'skips the disabled tab');
  key(tab(2), 'Home');
  assert.equal(t.getValue(), 'a');
  key(tab(0), 'End');
  assert.equal(t.getValue(), 'c');
  assert.deepEqual(onChange.calls.map((e) => e.data.id), ['c', 'a', 'c', 'a', 'c']);
  t.select('a');
  assert.equal(t.getValue(), 'a');
  assert.equal(onChange.calls.length, 5, 'select from code does not call onChange');
  t.destroy();
});

test('vsAccordion and vfAccordion: aria-expanded, region panels, one or multiple open, onToggle', async () => {
  const root = parse(vsAccordion({ id: 'x', headingLevel: 4, items: [{ id: 'a', title: 'A', content: 'aa', open: true }, { id: 'b', title: 'B', content: 'bb' }] }));
  const buttons = root.querySelectorAll('h4 > button');
  assert.equal(buttons.length, 2);
  assert.equal(buttons[0].getAttribute('aria-expanded'), 'true');
  const panel = root.querySelector('#' + buttons[1].getAttribute('aria-controls'));
  assert.equal(panel.getAttribute('role'), 'region');
  assert.equal(panel.hidden, true);
  const onToggle = recorder();
  const acc = mounted(vfAccordion({ items: [{ id: 'a', title: 'A', open: true }, { id: 'b', title: 'B' }], onToggle }));
  click(acc.$node.querySelector('[data-value="b"]'));
  await flush();
  assert.deepEqual(acc.getValue(), ['b'], 'one open at a time');
  click(acc.$node.querySelector('[data-value="b"]'));
  await flush();
  assert.deepEqual(acc.getValue(), []);
  assert.deepEqual(onToggle.calls.map((e) => [e.data.id, e.data.open]), [['b', true], ['b', false]]);
  acc.setValue(['a']);
  await flush();
  assert.equal(acc.$node.querySelector('[data-value="a"]').getAttribute('aria-expanded'), 'true');
  const multi = mounted(vfAccordion({ multiple: true, items: [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }] }));
  multi.open('a');
  multi.open('b');
  await flush();
  assert.deepEqual(multi.getValue(), ['a', 'b']);
  acc.destroy();
  multi.destroy();
});

test('vsStepper and vfStepper: states, aria-current="step", clickable steps', async () => {
  const list = parse(vsStepper({ steps: ['Cart', { label: 'Ship', description: 'Address' }, 'Pay'], active: 1 }));
  const steps = list.querySelectorAll('li');
  assert.deepEqual(Array.from(steps).map((s) => s.getAttribute('data-state')), ['complete', 'current', 'upcoming']);
  assert.equal(steps[1].getAttribute('aria-current'), 'step');
  assert.match(steps[0].textContent, /Completed/);
  assert.equal(list.querySelector('button'), null);
  const onChange = recorder();
  const s = mounted(vfStepper({ steps: ['a', 'b', 'c'], clickable: true, onChange }));
  click(s.$node.querySelector('[data-index="2"]'));
  await flush();
  assert.equal(s.getValue(), 2);
  s.prev();
  s.prev();
  s.prev();
  await flush();
  assert.equal(s.getValue(), 0, 'clamped at the first step');
  assert.deepEqual(onChange.calls.map((e) => e.data.index), [2]);
  s.destroy();
});

test('vsListView: plain list, listbox with options, custom render, empty state', () => {
  const plain = parse(vsListView({ items: ['a', { title: 'B', description: 'bee' }] }));
  assert.equal(plain.tagName, 'UL');
  assert.equal(plain.hasAttribute('role'), false);
  assert.equal(plain.querySelector('.vf-list-view__description').textContent, 'bee');
  const box = parse(vsListView({ label: 'Users', selectable: 'multiple', selected: ['2'], items: [{ id: 1, title: 'A' }, { id: 2, title: 'B' }] }));
  assert.equal(box.getAttribute('role'), 'listbox');
  assert.equal(box.getAttribute('aria-multiselectable'), 'true');
  const options = box.querySelectorAll('[role="option"]');
  assert.deepEqual(Array.from(options).map((o) => o.getAttribute('aria-selected')), ['false', 'true']);
  assert.deepEqual(Array.from(options).map((o) => o.getAttribute('tabindex')), ['-1', '0'], 'the selected option is in the tab order');
  const custom = parse(vsListView({ items: [{ n: 1 }], render: (item) => vf.html`<b>${item.n}</b>` }));
  assert.equal(custom.querySelector('b').textContent, '1');
  const empty = parse(vsListView({ items: [], emptyText: 'No users' }));
  assert.equal(empty.getAttribute('data-state'), 'empty');
  assert.equal(empty.querySelector('.vf-empty-state__title').textContent, 'No users');
});

test('vfListView: click and keys select, arrows move the focus, onSelect gives keys and items', () => {
  const onSelect = recorder();
  const items = [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }, { id: 'c', title: 'C' }];
  const list = mounted(vfListView({ items, selectable: 'single', render: (item) => vf.html`<i>${item.title}</i>`, onSelect }));
  assert.equal(list.$node.querySelector('i').textContent, 'A', 'the render prop survives the state copy');
  click(list.$node.querySelector('[data-value="b"]'));
  assert.equal(list.getValue(), 'b');
  assert.equal(document.activeElement, list.$node.querySelector('[data-value="b"]'));
  key(document.activeElement, 'ArrowDown');
  assert.equal(document.activeElement, list.$node.querySelector('[data-value="c"]'));
  assert.equal(document.activeElement.getAttribute('tabindex'), '0');
  key(document.activeElement, ' ');
  assert.equal(list.getValue(), 'c');
  assert.deepEqual(onSelect.calls.map((e) => e.data.value), ['b', 'c']);
  assert.deepEqual(onSelect.calls[1].data.items, [items[2]]);
  list.destroy();
});

test('vfCarousel: slides, controls and messages, loop, onChange, autoplay paused on hover, released on destroy', async () => {
  const onChange = recorder();
  const c = mounted(vfCarousel({ label: 'News', items: [{ content: 'one' }, { content: 'two' }, { src: 'javascript:x' }], onChange }));
  const root = c.$node;
  assert.equal(root.getAttribute('aria-roledescription'), 'carousel');
  assert.equal(root.getAttribute('aria-label'), 'News');
  const slides = () => c.$node.querySelectorAll('.vf-carousel__slide');
  assert.equal(slides()[0].getAttribute('aria-roledescription'), 'slide');
  assert.equal(slides()[0].getAttribute('aria-label'), '1 of 3');
  assert.equal(slides()[1].hidden, true);
  assert.equal(slides()[2].querySelector('img').getAttribute('src'), '#');
  assert.equal(slides()[2].querySelector('img').getAttribute('alt'), '');
  click(c.$node.querySelector('[data-action="prev"]'));
  await flush();
  assert.equal(c.getValue(), 2, 'loops to the last');
  click(c.$node.querySelector('[data-action="go"][data-index="0"]'));
  await flush();
  assert.equal(c.getValue(), 0);
  assert.deepEqual(onChange.calls.map((e) => e.data.index), [2, 0]);
  c.destroy();

  const auto = vfCarousel({ label: 'Auto', autoplay: 30, items: [{ content: '1' }, { content: '2' }, { content: '3' }] });
  await auto.mount(document.body);
  assert.equal(auto.$node.querySelector('[data-action="rotation"]').textContent, 'Pause');
  assert.equal(auto.$node.querySelector('.vf-carousel__slides').getAttribute('aria-live'), 'off');
  await new Promise((r) => setTimeout(r, 45));
  assert.ok(auto.getValue() >= 1, 'rotated');
  auto.$node.dispatchEvent(new window.MouseEvent('mouseenter'));
  const held = auto.getValue();
  await new Promise((r) => setTimeout(r, 45));
  assert.equal(auto.getValue(), held, 'hover holds the rotation');
  click(auto.$node.querySelector('[data-action="rotation"]'));
  await flush();
  assert.equal(auto.$node.querySelector('[data-action="rotation"]').textContent, 'Play');
  assert.equal(auto.$node.querySelector('.vf-carousel__slides').getAttribute('aria-live'), 'polite');
  auto.play();
  auto.destroy();
  await new Promise((r) => setTimeout(r, 45));
  assert.equal(auto.getValue(), held, 'no timer after destroy');
});
