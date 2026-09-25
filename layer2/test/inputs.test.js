// SPDX-License-Identifier: Apache-2.0
// Input components of Tier S (D-030): field wrapper and aria links, escaping, native controls.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { captureWarnings } from '../../layer1/test/setup-dom.js';
import vf from '../../layer1/src/vfunc.js';
import { vsField, vsInput, vsTextarea, vsSelect, vsCheckbox, vsRadioGroup, vsSwitch, vsSlider, vsProgress } from '../src/index.js';

function parse(markup) {
  const holder = document.createElement('div');
  holder.innerHTML = String(markup);
  assert.equal(holder.children.length, 1, 'one root element');
  return holder.firstElementChild;
}

test('every input function returns SafeHtml', () => {
  for (const fn of [vsField, vsInput, vsTextarea, vsSelect, vsCheckbox, vsRadioGroup, vsSwitch, vsSlider, vsProgress]) {
    assert.ok(fn({}) instanceof vf.SafeHtml, fn.name);
  }
});

test('without label, hint or error the control is the root and takes className and the hooks', () => {
  const input = parse(vsInput({ name: 'q', value: 'a"b', id: 'q', ref: 'query', action: 'search', className: 'mine', describedBy: 'x' }));
  assert.equal(input.tagName, 'INPUT');
  assert.equal(input.className, 'vf-input mine');
  assert.equal(input.getAttribute('type'), 'text');
  assert.equal(input.value, 'a"b');
  assert.equal(input.getAttribute('data-ref'), 'query');
  assert.equal(input.getAttribute('data-action'), 'search');
  assert.equal(input.getAttribute('aria-describedby'), 'x');
  assert.equal(input.getAttribute('data-size'), 'md');
  assert.equal(input.hasAttribute('aria-invalid'), false);
});

test('label, hint and error wrap the control and link it (generated id, aria-describedby, aria-invalid)', () => {
  const root = parse(vsInput({ name: 'email', type: 'email', label: 'Email', hint: 'Work address', error: 'Required', required: true, className: 'wide' }));
  assert.equal(root.className, 'vf-field wide');
  assert.equal(root.getAttribute('data-state'), 'invalid');
  const input = root.querySelector('input');
  assert.match(input.id, /^vf-input-\d+$/);
  assert.equal(input.className, 'vf-input');
  assert.equal(root.querySelector('label').getAttribute('for'), input.id);
  assert.equal(input.getAttribute('aria-describedby'), input.id + '-hint ' + input.id + '-error');
  assert.equal(input.getAttribute('aria-invalid'), 'true');
  assert.equal(input.required, true);
  assert.equal(root.querySelector('#' + input.id + '-hint').textContent, 'Work address');
  assert.equal(root.querySelector('#' + input.id + '-error').textContent, 'Required');
  assert.ok(root.querySelector('.vf-field__required[aria-hidden="true"]'));
  const other = parse(vsInput({ label: 'A' })).querySelector('input');
  assert.notEqual(other.id, input.id, 'ids are unique');
});

test('text and attribute values are escaped everywhere', () => {
  const evil = '"><img src=x onerror=alert(1)>';
  const markup = [
    vsInput({ label: evil, hint: evil, error: evil, value: evil, placeholder: evil, name: evil }),
    vsTextarea({ label: evil, value: '</textarea><img src=x onerror=alert(1)>' }),
    vsSelect({ label: evil, options: [{ value: evil, label: evil }, { label: evil, options: [evil] }], placeholder: evil }),
    vsCheckbox({ label: evil, value: evil }),
    vsRadioGroup({ label: evil, options: [evil], name: evil }),
    vsSwitch({ label: evil }),
    vsField({ label: evil, control: () => evil })
  ];
  for (const m of markup) {
    const root = parse(m);
    assert.equal(root.querySelector('img'), null, String(m));
  }
  assert.equal(parse(vsTextarea({ value: '</textarea><b>x</b>' })).value, '</textarea><b>x</b>');
});

test('vsInput checks type and size; vsTextarea has rows', () => {
  assert.equal(parse(vsInput({ type: 'number', min: 1, max: 9, step: 2, size: 'sm' })).getAttribute('type'), 'number');
  let input;
  const warnings = captureWarnings(() => { input = parse(vsInput({ type: 'javascript', size: 'huge' })); });
  assert.equal(input.getAttribute('type'), 'text');
  assert.equal(input.getAttribute('data-size'), 'md');
  assert.equal(warnings.length, 2);
  assert.equal(parse(vsTextarea({})).getAttribute('rows'), '3');
  assert.equal(parse(vsTextarea({ rows: 6, readonly: true })).readOnly, true);
});

test('vsSelect: options, groups, placeholder, single and multiple values', () => {
  const select = parse(vsSelect({ name: 's', value: 2, placeholder: 'Pick', options: [1, 2, { value: 3, label: 'Three', disabled: true }, { label: 'More', options: ['x'] }] }));
  const options = select.querySelectorAll('option');
  assert.equal(options.length, 5);
  assert.equal(options[0].value, '');
  assert.equal(options[0].selected, false);
  // happy-dom picks the wrong option with 3+ options; check the markup (browsers: e2e).
  assert.deepEqual(Array.from(select.querySelectorAll('option[selected]')).map((o) => o.value), ['2']);
  assert.equal(options[3].disabled, true);
  assert.equal(options[3].textContent, 'Three');
  assert.equal(select.querySelector('optgroup').getAttribute('label'), 'More');
  assert.equal(select.hasAttribute('readonly'), false);
  const multi = parse(vsSelect({ multiple: true, value: ['a', 'c'], options: ['a', 'b', 'c'] }));
  assert.equal(multi.multiple, true);
  assert.deepEqual(Array.from(multi.querySelectorAll('option[selected]')).map((o) => o.value), ['a', 'c']);
});

test('vsCheckbox and vsSwitch: the label wraps a native checkbox; switch has role="switch"', () => {
  const box = parse(vsCheckbox({ label: 'Agree', name: 'agree', checked: true, action: 'agree' }));
  assert.equal(box.tagName, 'LABEL');
  assert.equal(box.className, 'vf-check');
  const input = box.querySelector('input');
  assert.equal(input.type, 'checkbox');
  assert.equal(input.checked, true);
  assert.equal(input.getAttribute('data-action'), 'agree');
  assert.equal(box.querySelector('.vf-check__label').textContent, 'Agree');
  const withError = parse(vsCheckbox({ label: 'Agree', error: 'Please agree' }));
  assert.equal(withError.className, 'vf-field');
  assert.equal(withError.querySelector('label.vf-field__label'), null, 'no second label');
  assert.equal(withError.querySelector('input').getAttribute('aria-invalid'), 'true');
  const sw = parse(vsSwitch({ label: 'Wi-Fi', checked: false }));
  assert.equal(sw.className, 'vf-switch');
  assert.equal(sw.querySelector('input').getAttribute('role'), 'switch');
  assert.ok(sw.querySelector('.vf-switch__track[aria-hidden="true"]'));
});

test('vsRadioGroup: fieldset and legend, one name, the checked value, hint linked to the group', () => {
  const group = parse(vsRadioGroup({ label: 'Plan', options: ['free', { value: 'pro', label: 'Pro', disabled: true }], value: 'free', hint: 'Change later', direction: 'horizontal' }));
  assert.equal(group.tagName, 'FIELDSET');
  assert.equal(group.querySelector('legend').textContent, 'Plan');
  assert.equal(group.getAttribute('data-direction'), 'horizontal');
  const radios = group.querySelectorAll('input[type="radio"]');
  assert.equal(radios.length, 2);
  assert.ok(radios[0].name && radios[0].name === radios[1].name, 'a generated shared name');
  assert.equal(radios[0].checked, true);
  assert.equal(radios[1].disabled, true);
  assert.equal(group.getAttribute('aria-describedby'), group.id + '-hint');
});

test('vsSlider and vsProgress are native controls; progress without value is indeterminate', () => {
  const slider = parse(vsSlider({ value: 30, label: 'Volume' })).querySelector('input');
  assert.equal(slider.type, 'range');
  assert.equal(slider.getAttribute('min'), '0');
  assert.equal(slider.getAttribute('max'), '100');
  const bar = parse(vsProgress({ value: 40, max: 80 }));
  assert.equal(bar.tagName, 'PROGRESS');
  assert.equal(bar.getAttribute('value'), '40');
  assert.equal(bar.getAttribute('max'), '80');
  assert.equal(parse(vsProgress({})).hasAttribute('value'), false);
  const labelled = parse(vsProgress({ value: 150, label: 'Upload', showValue: true }));
  assert.equal(labelled.querySelector('label').getAttribute('for'), labelled.querySelector('progress').id);
  assert.equal(labelled.querySelector('progress').getAttribute('value'), '100', 'clamped to max');
  assert.equal(labelled.querySelector('.vf-progress__value').textContent, '100%');
});

test('vsField gives the control its ids and aria values', () => {
  const root = parse(vsField({
    label: 'Color', hint: 'Pick one', error: 'Bad', required: true,
    control: (a) => vf.html`<input type="color" id="${a.id}" aria-describedby="${a.describedBy}" aria-invalid="${a.invalid}" data-required="${a.required}">`
  }));
  const input = root.querySelector('input');
  assert.equal(root.querySelector('label').getAttribute('for'), input.id);
  assert.equal(input.getAttribute('aria-describedby'), input.id + '-hint ' + input.id + '-error');
  assert.equal(input.getAttribute('aria-invalid'), 'true');
  assert.equal(input.getAttribute('data-required'), 'true');
  assert.equal(parse(vsField({ id: 'mine', control: (a) => vf.html`<input id="${a.id}">` })).querySelector('input').id, 'mine');
});
