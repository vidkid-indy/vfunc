// SPDX-License-Identifier: Apache-2.0
// Input components of Tiers P and F (D-030): vs* markup, vf* behavior, callbacks { sender, event, data },
// getValue/setValue without onChange, ids kept across refreshes, timers released on destroy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { window, flush, click } from '../../layer1/test/setup-dom.js';
import vf from '../../layer1/src/vfunc.js';
import {
  vsNumberInput, vfNumberInput, vsSearchInput, vfSearchInput, vsPasswordInput, vfPasswordInput,
  vsChipsInput, vfChipsInput, vsRating, vfRating, vsSelectButton, vfSelectButton,
  vsMaskedInput, vfMaskedInput, vsDatePicker, vfDatePicker, vsTimePicker, vfTimePicker, vfDateRangePicker
} from '../src/index.js';
import { applyMask, unmask } from '../src/components/masked-input.js';
import { isoDate, isoTime } from '../src/_internal/dates.js';

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

function fire(element, type, init) {
  const Ctor = type.indexOf('key') === 0 ? window.KeyboardEvent
    : type === 'input' && window.InputEvent ? window.InputEvent : window.Event;
  element.dispatchEvent(new Ctor(type, Object.assign({ bubbles: true, cancelable: true }, init || {})));
}

function type(input, value, eventType) {
  input.value = value;
  fire(input, eventType || 'input');
}

function recorder() {
  const calls = [];
  const fn = (e) => calls.push(e);
  fn.calls = calls;
  return fn;
}

test('every vf* returns an instance whose root is its vs* markup; vs* are SafeHtml', () => {
  const pairs = [[vsNumberInput, vfNumberInput], [vsSearchInput, vfSearchInput], [vsPasswordInput, vfPasswordInput],
    [vsChipsInput, vfChipsInput], [vsRating, vfRating], [vsSelectButton, vfSelectButton],
    [vsMaskedInput, vfMaskedInput, { mask: '000' }], [vsDatePicker, vfDatePicker], [vsTimePicker, vfTimePicker]];
  for (const [vs, vfn, extra] of pairs) {
    assert.ok(vs(extra || {}) instanceof vf.SafeHtml, vs.name);
    const instance = vfn(Object.assign({ className: 'mine' }, extra || {}));
    assert.equal(instance.isvfunc, true, vfn.name);
    assert.match(instance.$node.className, /mine/, vfn.name + ' root is the vs* markup');
    assert.equal(typeof instance.getValue, 'function');
    instance.destroy();
  }
  assert.equal(vfDateRangePicker({}).$node.tagName, 'FIELDSET');
});

test('vsNumberInput: buttons with messages, disabled at the limits', () => {
  const root = parse(vsNumberInput({ value: 1, min: 1, max: 3, name: 'qty' }));
  const [down, up] = root.querySelectorAll('button');
  assert.equal(down.getAttribute('data-action'), 'decrement');
  assert.equal(down.getAttribute('aria-label'), 'Decrease');
  assert.equal(down.disabled, true);
  assert.equal(up.disabled, false);
  assert.equal(up.getAttribute('tabindex'), '-1', 'the arrow keys of the input do the stepping');
  assert.equal(root.querySelector('input').getAttribute('aria-describedby'), null);
  assert.equal(down.getAttribute('aria-controls'), root.querySelector('input').id || null);
});

test('vfNumberInput: steps, clamps, rounds to the step, onChange only for user changes', async () => {
  const onChange = recorder();
  const n = mounted(vfNumberInput({ value: 0.1, step: 0.1, max: 0.3, onChange }));
  const id = n.$node.querySelector('input').id;
  click(n.$node.querySelector('[data-action="increment"]'));
  await flush();
  assert.equal(n.getValue(), 0.2, '0.1 + 0.1 without float noise');
  click(n.$node.querySelector('[data-action="increment"]'));
  click(n.$node.querySelector('[data-action="increment"]'));
  await flush();
  assert.equal(n.getValue(), 0.3, 'clamped to max');
  assert.equal(n.$node.querySelector('input').id, id, 'the id stays across refreshes');
  assert.equal(n.$node.querySelector('[data-action="increment"]').disabled, true);
  type(n.$node.querySelector('input'), '9', 'change');
  assert.equal(n.$node.querySelector('input').value, '0.3', 'typed values are clamped on commit');
  assert.deepEqual(onChange.calls.map((e) => e.data.value), [0.2, 0.3]);
  assert.equal(onChange.calls[0].sender, n);
  assert.ok(onChange.calls[0].event);
  n.setValue(5);
  await flush();
  assert.equal(n.getValue(), 0.3);
  assert.equal(onChange.calls.length, 2, 'setValue does not call onChange');
  n.destroy();
});

test('vfNumberInput: from empty the first step lands on min', async () => {
  const n = mounted(vfNumberInput({ min: 10 }));
  assert.equal(n.getValue(), null);
  click(n.$node.querySelector('[data-action="increment"]'));
  await flush();
  assert.equal(n.getValue(), 10);
  n.destroy();
});

test('vsSearchInput: accessible name without a label, clear button hidden while empty', () => {
  const root = parse(vsSearchInput({}));
  const input = root.querySelector('input');
  assert.equal(input.type, 'search');
  assert.equal(input.getAttribute('aria-label'), 'Search');
  assert.equal(root.querySelector('[data-action="clear"]').hidden, true);
  assert.equal(parse(vsSearchInput({ value: 'x' })).querySelector('[data-action="clear"]').hidden, false);
  assert.equal(parse(vsSearchInput({ label: 'Find' })).querySelector('input').hasAttribute('aria-label'), false);
});

test('vfSearchInput: debounced onSearch, not while composing, Enter at once, clear and Escape', async () => {
  const onSearch = recorder();
  const onClear = recorder();
  const s = mounted(vfSearchInput({ debounce: 20, onSearch, onClear }));
  const input = s.$node.querySelector('input');
  type(input, 'a');
  type(input, 'ab');
  assert.equal(onSearch.calls.length, 0);
  assert.equal(s.$node.querySelector('[data-action="clear"]').hidden, false);
  await new Promise((r) => setTimeout(r, 40));
  assert.deepEqual(onSearch.calls.map((e) => e.data.value), ['ab']);
  input.value = 'abㅎ';
  fire(input, 'input', { isComposing: true });
  await new Promise((r) => setTimeout(r, 40));
  assert.equal(onSearch.calls.length, 1, 'no search while an IME composes');
  input.value = 'ab한';
  fire(input, 'compositionend');
  fire(input, 'keydown', { key: 'Enter' });
  assert.deepEqual(onSearch.calls.map((e) => e.data.value), ['ab', 'ab한'], 'Enter searches at once');
  click(s.$node.querySelector('[data-action="clear"]'));
  assert.equal(input.value, '');
  assert.equal(onClear.calls.length, 1);
  assert.deepEqual(onSearch.calls.map((e) => e.data.value), ['ab', 'ab한', '']);
  type(input, 'z');
  fire(input, 'keydown', { key: 'Escape' });
  assert.equal(input.value, '');
  assert.equal(onClear.calls.length, 2);
  type(input, 'late');
  s.destroy();
  await new Promise((r) => setTimeout(r, 40));
  assert.equal(onSearch.calls.filter((e) => e.data.value === 'late').length, 0, 'destroy cancels the timer');
});

test('vfPasswordInput: the toggle changes the type in place and keeps the value', () => {
  const onToggle = recorder();
  const p = mounted(vfPasswordInput({ name: 'pw', onToggle }));
  const input = p.$node.querySelector('input');
  assert.equal(input.type, 'password');
  assert.equal(input.getAttribute('autocomplete'), 'current-password');
  type(input, 'secret');
  const button = p.$node.querySelector('[data-action="toggle-visibility"]');
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.equal(button.textContent, 'Show');
  click(button);
  assert.equal(p.$node.querySelector('input'), input, 'not re-rendered');
  assert.equal(input.type, 'text');
  assert.equal(input.value, 'secret');
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.equal(button.textContent, 'Hide');
  assert.deepEqual(onToggle.calls.map((e) => e.data.visible), [true]);
  assert.equal(p.getValue(), 'secret');
  p.toggle(false);
  assert.equal(input.type, 'password');
  p.destroy();
});

test('vsChipsInput: tags with remove buttons and one hidden input per chip', () => {
  const root = parse(vsChipsInput({ name: 'tags', value: ['a', 'b"c'] }));
  assert.equal(root.querySelectorAll('.vf-tag').length, 2);
  assert.deepEqual(Array.from(root.querySelectorAll('input[type="hidden"]')).map((i) => i.value), ['a', 'b"c']);
  assert.equal(root.querySelector('[data-action="remove"]').getAttribute('data-value'), 'a');
  assert.equal(parse(vsChipsInput({ value: ['a'], max: 1 })).querySelector('input[type="text"]').disabled, true);
});

test('vfChipsInput: Enter and comma add, duplicates and IME Enter ignored, Backspace and remove button', async () => {
  const onChange = recorder();
  const c = mounted(vfChipsInput({ value: ['ui'], onChange }));
  let input = c.$node.querySelector('input[type="text"]');
  input.value = '  api  ';
  fire(input, 'keydown', { key: 'Enter' });
  await flush();
  assert.deepEqual(c.getValue(), ['ui', 'api']);
  input = c.$node.querySelector('input[type="text"]');
  input.value = 'ui';
  fire(input, 'keydown', { key: ',' });
  input.value = '한글';
  fire(input, 'keydown', { key: 'Enter', isComposing: true });
  await flush();
  assert.deepEqual(c.getValue(), ['ui', 'api'], 'no duplicate, nothing while composing');
  input = c.$node.querySelector('input[type="text"]');
  input.value = '';
  fire(input, 'keydown', { key: 'Backspace' });
  await flush();
  assert.deepEqual(c.getValue(), ['ui']);
  click(c.$node.querySelector('[data-action="remove"]'));
  await flush();
  assert.deepEqual(c.getValue(), []);
  assert.deepEqual(onChange.calls.map((e) => e.data.value), [['ui', 'api'], ['ui'], []]);
  assert.equal(c.add('x'), true);
  c.remove('x');
  assert.equal(onChange.calls.length, 5, 'add/remove from code report too (they are user actions by API)');
  c.destroy();
});

test('vsRating and vfRating: radios with values, readonly image, onChange', async () => {
  const root = parse(vsRating({ value: 2, max: 4, name: 'score' }));
  assert.equal(root.tagName, 'FIELDSET');
  assert.equal(root.querySelector('legend').textContent, 'Rating');
  const radios = root.querySelectorAll('input[type="radio"]');
  assert.equal(radios.length, 4);
  assert.equal(radios[1].checked, true);
  assert.equal(root.querySelectorAll('[data-state="on"]').length, 2);
  assert.equal(root.querySelector('.vf-visually-hidden:not(input)').textContent, '1 of 4');
  const ro = parse(vsRating({ value: 3, readonly: true }));
  assert.equal(ro.getAttribute('role'), 'img');
  assert.equal(ro.getAttribute('aria-label'), '3 of 5');
  const onChange = recorder();
  const r = mounted(vfRating({ onChange }));
  const name = r.$node.querySelector('input').name;
  const third = r.$node.querySelectorAll('input')[2];
  third.checked = true;
  fire(third, 'change');
  await flush();
  assert.equal(r.getValue(), 3);
  assert.equal(r.$node.querySelector('input').name, name, 'the generated name stays');
  assert.equal(r.$node.querySelectorAll('[data-state="on"]').length, 3);
  assert.deepEqual(onChange.calls.map((e) => e.data.value), [3]);
  r.destroy();
});

test('vsSelectButton and vfSelectButton: aria-pressed, single and multiple', async () => {
  const root = parse(vsSelectButton({ label: 'Period', options: ['day', 'week'], value: 'week', name: 'p' }));
  const group = root.querySelector('[role="group"]');
  assert.equal(group.getAttribute('aria-labelledby'), root.querySelector('.vf-field__label').id);
  assert.deepEqual(Array.from(group.querySelectorAll('button')).map((b) => b.getAttribute('aria-pressed')), ['false', 'true']);
  assert.equal(group.querySelector('input[type="hidden"]').value, 'week');
  const onChange = recorder();
  const single = mounted(vfSelectButton({ ariaLabel: 'Period', options: ['day', 'week'], value: 'week', onChange }));
  assert.equal(single.$node.getAttribute('aria-label'), 'Period');
  click(single.$node.querySelector('[data-value="day"]'));
  await flush();
  assert.equal(single.getValue(), 'day');
  click(single.$node.querySelector('[data-value="day"]'));
  assert.equal(onChange.calls.length, 1, 'choosing the chosen option does nothing');
  const multi = mounted(vfSelectButton({ multiple: true, options: ['a', 'b', 'c'], value: ['a'] }));
  click(multi.$node.querySelector('[data-value="c"]'));
  await flush();
  click(multi.$node.querySelector('[data-value="a"]'));
  await flush();
  assert.deepEqual(multi.getValue(), ['c']);
  single.destroy();
  multi.destroy();
});

test('applyMask and unmask', () => {
  assert.equal(applyMask('01012345678', '000-0000-0000'), '010-1234-5678');
  assert.equal(applyMask('010', '000-0000-0000'), '010', 'no trailing literal before more input');
  assert.equal(applyMask('0101', '000-0000-0000'), '010-1');
  assert.equal(applyMask('010-12x34', '000-0000-0000'), '010-1234');
  assert.equal(applyMask('ab1234', 'aa-0000'), 'ab-1234');
  assert.equal(unmask('010-1234-5678', '000-0000-0000'), '01012345678');
});

test('vfMaskedInput: formats while typing, keeps the caret, raw value, onInput and onChange', () => {
  const onInput = recorder();
  const onChange = recorder();
  const m = mounted(vfMaskedInput({ mask: '000-0000-0000', value: '0101234', onInput, onChange }));
  const input = m.$node;
  assert.equal(input.value, '010-1234');
  assert.equal(input.getAttribute('inputmode'), 'numeric');
  assert.equal(input.getAttribute('maxlength'), '13');
  input.focus();
  input.value = '010-12345';
  input.setSelectionRange(9, 9);
  fire(input, 'input');
  assert.equal(input.value, '010-1234-5');
  assert.equal(input.selectionStart, 10, 'the caret moves past the inserted literal');
  assert.equal(m.getValue(), '010-1234-5');
  assert.equal(m.getRawValue(), '01012345');
  fire(input, 'change');
  assert.deepEqual(onInput.calls.map((e) => e.data), [{ value: '010-1234-5', raw: '01012345' }]);
  assert.deepEqual(onChange.calls.map((e) => e.data.raw), ['01012345']);
  m.destroy();
});

test('date and time helpers normalize typed text and reject impossible values', () => {
  assert.equal(isoDate('2026.1.5'), '2026-01-05');
  assert.equal(isoDate('2026/12/31'), '2026-12-31');
  assert.equal(isoDate('2026-02-30'), '');
  assert.equal(isoDate(new Date(2026, 0, 2)), '2026-01-02');
  assert.equal(isoDate('tomorrow'), '');
  assert.equal(isoTime('9:5'), '09:05');
  assert.equal(isoTime('23:59:30'), '23:59:30');
  assert.equal(isoTime('24:00'), '');
});

test('vsDatePicker and vfDatePicker: native input, Date values, normalization, aria-invalid', () => {
  const input = parse(vsDatePicker({ value: new Date(2026, 4, 1), min: '2026-1-1', name: 'due' }));
  assert.equal(input.getAttribute('type'), 'date');
  assert.equal(input.getAttribute('value'), '2026-05-01');
  assert.equal(input.getAttribute('min'), '2026-01-01');
  assert.equal(input.getAttribute('placeholder'), 'YYYY-MM-DD');
  const onChange = recorder();
  const d = mounted(vfDatePicker({ label: 'Due', onChange }));
  const field = d.$node.querySelector('input');
  // IE11 has no date input: the browser keeps whatever text was typed.
  field.setAttribute('type', 'text');
  type(field, '2026.3.4', 'change');
  assert.equal(field.value, '2026-03-04');
  assert.equal(d.getValue(), '2026-03-04');
  assert.equal(d.getDate().getDate(), 4);
  assert.equal(onChange.calls[0].data.value, '2026-03-04');
  assert.ok(onChange.calls[0].data.date instanceof Date);
  type(field, 'soon', 'change');
  assert.equal(field.getAttribute('aria-invalid'), 'true');
  assert.equal(onChange.calls.length, 1);
  d.destroy();
});

test('vsTimePicker and vfTimePicker', () => {
  const input = parse(vsTimePicker({ value: '9:30', step: 900 }));
  assert.equal(input.getAttribute('type'), 'time');
  assert.equal(input.getAttribute('value'), '09:30');
  assert.equal(input.getAttribute('step'), '900');
  const onChange = recorder();
  const t = mounted(vfTimePicker({ onChange }));
  t.$node.setAttribute('type', 'text');
  type(t.$node, '7:5', 'change');
  assert.equal(t.getValue(), '07:05');
  assert.deepEqual(onChange.calls.map((e) => e.data.value), ['07:05']);
  t.destroy();
});

test('vfDateRangePicker: labelled inputs, end min follows start, end never before start', async () => {
  const onChange = recorder();
  const r = mounted(vfDateRangePicker({ label: 'Period', names: ['from', 'to'], start: '2026-03-10', end: '2026-03-20', onChange }));
  const start = r.$node.querySelector('[data-action="start"]');
  assert.equal(r.$node.querySelector('legend').textContent, 'Period');
  assert.equal(start.name, 'from');
  assert.equal(r.$node.querySelector('label[for="' + start.id + '"]').textContent, 'Start date');
  assert.equal(r.$node.querySelector('[data-action="end"]').getAttribute('min'), '2026-03-10');
  type(start, '2026-03-25', 'change');
  await flush();
  assert.deepEqual(r.getValue(), { start: '2026-03-25', end: '2026-03-25' });
  assert.equal(r.$node.querySelector('[data-action="end"]').getAttribute('min'), '2026-03-25');
  assert.equal(onChange.calls[0].data.end, '2026-03-25');
  r.setValue({ start: '2026-04-02', end: '2026-04-01' });
  await flush();
  assert.deepEqual(r.getValue(), { start: '2026-04-02', end: '2026-04-02' });
  assert.equal(onChange.calls.length, 1);
  r.destroy();
});
