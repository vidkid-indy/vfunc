// SPDX-License-Identifier: Apache-2.0
//
// The shape shared by the vf* functions (D-030): a vf.vfunc whose root is the vs* markup
// (replaceRoot), state copied from the props, callbacks kept out of the state, and an id fixed
// at creation so a refresh keeps ids (and the engine can give focus back).

import vf from './vf.js';
import { uid, present, extend } from './common.js';

/** The props without functions (callbacks stay in the closure), plus a stable id. */
export function stateOf(p, prefix, extra) {
  const state = {};
  for (const key in p) {
    if (Object.prototype.hasOwnProperty.call(p, key) && typeof p[key] !== 'function') state[key] = p[key];
  }
  state.id = present(p.id) ? String(p.id) : uid(prefix);
  return extend(state, extra);
}

/**
 * @param {Object} spec - state, render, delegates, events, methods, onMount, onUpdate, onDestroy
 * @returns {Object} the vfunc instance; getValue/setValue unless spec.methods has its own
 */
export function instance(spec) {
  const methods = extend({
    getValue: function () { return this.state.value; },
    setValue: function (value) { this.setState({ value: value }); }
  }, spec.methods);
  // The engine reads instance.x from state before methods: a prop named like a method would hide it.
  for (const name in methods) {
    if (Object.prototype.hasOwnProperty.call(methods, name) && Object.prototype.hasOwnProperty.call(spec.state, name)) {
      delete spec.state[name];
    }
  }
  return vf.vfunc({
    replaceRoot: true,
    state: spec.state,
    render: spec.render,
    delegates: spec.delegates || [],
    events: spec.events,
    childs: spec.childs,
    methods: methods,
    onMount: spec.onMount,
    onUpdate: spec.onUpdate,
    onDestroy: spec.onDestroy
  });
}

/** Whether a key event belongs to an IME composition (Korean, Japanese, Chinese input). */
export function composing(event) {
  return !!(event && (event.isComposing || event.keyCode === 229));
}

/** A delegate selector for an element id (rule 21: hooks are ids, data-action, data-ref). */
export function idSelector(id) {
  return '[id="' + String(id).replace(/["\\]/g, '\\$&') + '"]';
}

/** The main control: the element with the instance's fixed id (the root itself or inside it). */
export function control(sender) {
  const root = sender.$node;
  return root.id === sender.state.id ? root : (sender.ids[sender.state.id] || null);
}

/** The first element inside the root with this data-action. */
export function actionPart(sender, action) {
  return sender.$node.querySelector('[data-action="' + action + '"]');
}
