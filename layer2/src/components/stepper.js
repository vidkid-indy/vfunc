// SPDX-License-Identifier: Apache-2.0
//
// Stepper — Tier P (vsStepper + vfStepper). Spec reference: pilot components/navigation/VfStepper.js
// (rewritten: an ordered list with aria-current="step", data-state per step, hooks on data-action).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { cls, present, emit } from '../_internal/common.js';
import { stateOf, instance } from '../_internal/instance.js';

const html = vf.html;

function clampIndex(index, count) {
  return Math.max(0, Math.min(count - 1, Math.floor(Number(index) || 0)));
}

/**
 * The steps of a process: complete, current (aria-current="step") and upcoming.
 * @param {Object} props
 * @param {Array<string|{label: *, description?: *}>} props.steps
 * @param {number} [props.active=0] - the current step's index
 * @param {boolean} [props.clickable] - steps are buttons (data-action "step", data-index)
 * @param {string} [props.label] - the list's aria-label
 *   Also: id, ref, className
 * @returns {SafeHtml}
 */
export function vsStepper(props) {
  const p = props || {};
  const steps = p.steps || [];
  const active = clampIndex(p.active, steps.length);
  const items = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i] != null && typeof steps[i] === 'object' && !(steps[i] instanceof vf.SafeHtml) ? steps[i] : { label: steps[i] };
    const state = i < active ? 'complete' : i === active ? 'current' : 'upcoming';
    const inner = html`<span class="vf-stepper__marker" aria-hidden="true">${state === 'complete' ? html`&#10003;` : i + 1}</span><span class="vf-stepper__text"><span class="vf-stepper__label">${step.label}</span>${state === 'complete' ? html`<span class="vf-visually-hidden"> ${msg('stepper.complete')}</span>` : ''}${present(step.description) ? html`<span class="vf-stepper__description">${step.description}</span>` : ''}</span>`;
    items.push(html`<li ${attrs({ class: 'vf-stepper__step', 'data-state': state, 'aria-current': state === 'current' ? 'step' : null })}>${p.clickable
      ? html`<button ${attrs({ type: 'button', class: 'vf-stepper__button', 'data-action': 'step', 'data-index': i })}>${inner}</button>`
      : html`<span class="vf-stepper__button">${inner}</span>`}</li>`);
  }
  return html`<ol ${attrs({ class: cls('vf-stepper', p.className), id: p.id, 'data-ref': p.ref, 'aria-label': p.label })}>${items}</ol>`;
}

/**
 * vsStepper with behavior: next / prev / goTo from code; with `clickable`, clicking a step goes
 * there and calls onChange.
 * @param {Object} props - vsStepper props, plus onChange ({ sender, event, data: { index } })
 * @returns {Object} instance with getValue() → index, setValue(index), next(), prev(), goTo(index)
 */
export function vfStepper(props) {
  const p = props || {};
  function go(sender, index) {
    const next = clampIndex(index, (sender.state.steps || []).length);
    if (next !== sender.state.active) sender.setState({ active: next });
    return next;
  }
  return instance({
    state: stateOf(p, 'stepper', { active: clampIndex(p.active, (p.steps || []).length) }),
    render: function (s) { return vsStepper(s); },
    delegates: [{
      selector: '[data-action="step"]',
      eventType: 'click',
      onEvent: function (e) {
        const before = e.sender.state.active;
        const index = go(e.sender, e.target.getAttribute('data-index'));
        if (index !== before) emit(p.onChange, e.sender, e.event, { index: index });
      }
    }],
    methods: {
      getValue: function () { return this.state.active; },
      setValue: function (index) { go(this, index); },
      goTo: function (index) { go(this, index); },
      next: function () { go(this, this.state.active + 1); },
      prev: function () { go(this, this.state.active - 1); }
    }
  });
}
