// SPDX-License-Identifier: Apache-2.0
//
// Toast — Tier F (vfToast only). Spec reference: pilot components/overlays/VToast.js (rewritten:
// one notification region per page that the app creates once and calls show() on, D-032).
// The region is a live region that stays the same element (only its inside is drawn again), so
// screen readers announce new toasts. danger and warning toasts are role="alert". Toasts stay
// while the pointer or the focus is inside the region.

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { oneOf } from '../_internal/props.js';
import { present, uid, extend, emit } from '../_internal/common.js';

const html = vf.html;

const POSITIONS = ['bottom-end', 'bottom-start', 'bottom-center', 'top-end', 'top-start', 'top-center'];
const VARIANTS = ['info', 'success', 'warning', 'danger'];

function renderItems(s) {
  const out = [];
  for (let i = 0; i < s.items.length; i++) {
    const t = s.items[i];
    const action = t.action && present(t.action.label)
      ? html`<button ${attrs({ type: 'button', class: 'vf-toast__action', 'data-action': 'toast-action', 'data-value': t.id })}>${t.action.label}</button>`
      : '';
    out.push(html`<div ${attrs({
      class: 'vf-toast',
      id: t.id,
      'data-variant': t.variant,
      role: t.variant === 'danger' || t.variant === 'warning' ? 'alert' : null
    })}><div class="vf-toast__body">${present(t.title) ? html`<p class="vf-toast__title">${t.title}</p>` : ''}<p class="vf-toast__message">${t.message}</p></div>${action}<button ${attrs({
      type: 'button',
      class: 'vf-toast__dismiss',
      'data-action': 'dismiss',
      'data-value': t.id,
      'aria-label': msg('toast.dismiss')
    })}><span aria-hidden="true">&times;</span></button></div>`);
  }
  return html`${out}`;
}

/**
 * The notification region. Create it once; it is added to document.body at once.
 * @param {Object} [props]
 * @param {'bottom-end'|'bottom-start'|'bottom-center'|'top-end'|'top-start'|'top-center'} [props.position='bottom-end']
 * @param {number} [props.duration=4000] - ms before a toast goes; 0 keeps it until dismissed
 * @param {number} [props.max=3] - the oldest goes when more are shown
 * @param {string} [props.label] - the region's aria-label; replaces `toast.region`
 * @returns {Object} instance with show({ message, title?, variant?, duration?, action?: { label, onClick } }) → id,
 *   dismiss(id), clear()
 */
export function vfToast(props) {
  const p = props || {};
  const base = uid('toast');
  const timers = {};
  let held = false;
  let count = 0;

  function stopTimer(id) {
    if (timers[id]) clearTimeout(timers[id]);
    delete timers[id];
  }
  function startTimer(self, t) {
    stopTimer(t.id);
    if (held || !(t.duration > 0)) return;
    timers[t.id] = setTimeout(function () { self.dismiss(t.id); }, t.duration);
  }
  function hold(self, on) {
    held = on;
    for (let i = 0; i < self.state.items.length; i++) {
      if (on) stopTimer(self.state.items[i].id);
      else startTimer(self, self.state.items[i]);
    }
  }
  function find(self, id) {
    for (let i = 0; i < self.state.items.length; i++) if (self.state.items[i].id === id) return self.state.items[i];
    return null;
  }

  const toaster = vf.vfunc({
    tag: 'div',
    state: {
      items: [],
      duration: p.duration == null ? 4000 : Math.max(0, Number(p.duration) || 0),
      max: Math.max(1, Math.floor(Number(p.max) || 3))
    },
    render: renderItems,
    events: [
      { eventType: 'mouseenter', onEvent: function (e) { hold(e.sender, true); } },
      { eventType: 'mouseleave', onEvent: function (e) { hold(e.sender, false); } },
      { eventType: 'focusin', onEvent: function (e) { hold(e.sender, true); } },
      {
        eventType: 'focusout',
        onEvent: function (e) {
          const next = e.event.relatedTarget;
          if (!next || !e.sender.$node.contains(next)) hold(e.sender, false);
        }
      }
    ],
    delegates: [
      { selector: '[data-action="dismiss"]', eventType: 'click', onEvent: function (e) { e.sender.dismiss(e.target.getAttribute('data-value')); } },
      {
        selector: '[data-action="toast-action"]',
        eventType: 'click',
        onEvent: function (e) {
          const id = e.target.getAttribute('data-value');
          const t = find(e.sender, id);
          if (t && t.action) emit(t.action.onClick, e.sender, e.event, { id: id });
          e.sender.dismiss(id);
        }
      }
    ],
    methods: {
      show: function (options) {
        const o = options || {};
        count += 1;
        const t = {
          id: base + '-' + count,
          title: o.title,
          message: o.message,
          variant: oneOf('vfToast variant', o.variant, VARIANTS),
          duration: o.duration == null ? this.state.duration : Math.max(0, Number(o.duration) || 0),
          action: o.action ? extend({}, o.action) : null
        };
        const items = this.state.items.concat([t]);
        while (items.length > this.state.max) stopTimer(items.shift().id);
        this.setState({ items: items });
        startTimer(this, t);
        return t.id;
      },
      dismiss: function (id) {
        stopTimer(id);
        const items = [];
        for (let i = 0; i < this.state.items.length; i++) if (this.state.items[i].id !== id) items.push(this.state.items[i]);
        if (items.length !== this.state.items.length) this.setState({ items: items });
      },
      clear: function () {
        for (const id in timers) if (Object.prototype.hasOwnProperty.call(timers, id)) stopTimer(id);
        this.setState({ items: [] });
      }
    },
    onUpdate: function (self) {
      self.$node.setAttribute('aria-label', msg('toast.region', p.label));
    },
    onDestroy: function () {
      for (const id in timers) if (Object.prototype.hasOwnProperty.call(timers, id)) stopTimer(id);
    }
  });
  // The root is the live region itself and is never replaced (no replaceRoot).
  const root = toaster.$node;
  root.className = 'vf-toast-region';
  root.id = base;
  root.setAttribute('role', 'region');
  root.setAttribute('aria-live', 'polite');
  root.setAttribute('aria-label', msg('toast.region', p.label));
  root.setAttribute('data-position', oneOf('vfToast position', p.position, POSITIONS));
  toaster.mount(document.body);
  return toaster;
}
