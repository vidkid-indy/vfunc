// SPDX-License-Identifier: Apache-2.0
//
// Modal and Drawer — Tier F (vfModal, vfDrawer), one implementation (D-032). Spec reference: pilot
// components/overlays/VModal.js and VDrawer.js (rewritten: no <dialog> so IE11 takes the same path,
// focus kept inside and returned, Escape for the top layer only, page scroll locked, messages
// instead of fixed text, no inline styles).
// The overlay is put into document.body on open() and taken out on close().

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { oneOf } from '../_internal/props.js';
import { cls, present, emit } from '../_internal/common.js';
import { stateOf, instance, idSelector } from '../_internal/instance.js';
import { isInstance } from '../_internal/slots.js';
import { pushLayer, removeLayer, lockScroll, unlockScroll, focusables, trapTab, restoreFocus } from '../_internal/overlay.js';

const html = vf.html;

const SIZES = ['md', 'sm', 'lg'];
const SIDES = ['end', 'start', 'bottom'];
const OWN_ACTIONS = { close: 1, backdrop: 1 };

function render(s) {
  const base = s.id;
  const titleId = base + '-title';
  const dismissible = s.dismissible !== false;
  const close = dismissible
    ? html`<button ${attrs({ type: 'button', class: 'vf-modal__close', 'data-action': 'close', 'aria-label': msg('modal.close', s.closeLabel) })}><span aria-hidden="true">&times;</span></button>`
    : '';
  const title = present(s.title) ? html`<h2 ${attrs({ class: 'vf-modal__title', id: titleId })}>${s.title}</h2>` : '';
  const footer = present(s.footer) ? html`<div class="vf-modal__footer">${s.footer}</div>` : '';
  return html`<div ${attrs({
    class: cls(s.kind === 'drawer' ? 'vf-modal vf-drawer' : 'vf-modal', s.className),
    id: base,
    'data-ref': s.ref,
    'data-size': s.size,
    'data-side': s.kind === 'drawer' ? s.side : null
  })}><div class="vf-modal__backdrop" data-action="backdrop"></div><div ${attrs({
    class: 'vf-modal__dialog',
    id: base + '-dialog',
    role: s.role || 'dialog',
    'aria-modal': true,
    'aria-labelledby': present(s.title) ? titleId : null,
    'aria-label': present(s.title) ? null : s.label,
    'aria-describedby': s.describedBy,
    tabindex: -1
  })}>${title || close ? html`<div class="vf-modal__header">${title}${close}</div>` : ''}<div ${attrs({ class: 'vf-modal__body', id: base + '-body' })}>${isInstance(s.content) ? '' : s.content}</div>${footer}</div></div>`;
}

/**
 * The shared implementation. `extra` is internal (vfConfirm): role, describedBy, onAction(sender,
 * action, event), onClose(reason), open(doOpen) wrapping open() (its result is returned).
 * @returns {Object} instance
 */
export function createModal(p, kind, extra) {
  const x = extra || {};
  let layer = null;
  let returnTo = null;
  let mounted = false;

  function dialog(sender) {
    return sender.ids[sender.state.id + '-dialog'] || null;
  }
  function firstFocus(sender) {
    const d = dialog(sender);
    if (!d) return;
    const wanted = present(sender.state.initialFocus) ? sender.refs[sender.state.initialFocus] : null;
    if (wanted) return wanted.focus();
    const list = focusables(d);
    for (let i = 0; i < list.length; i++) {
      if (list[i].getAttribute('data-action') !== 'close') return list[i].focus();
    }
    d.focus();
  }
  function open(sender, event) {
    if (layer) return;
    returnTo = document.activeElement;
    if (!mounted) {
      mounted = true;
      sender.mount(document.body);
    } else {
      document.body.appendChild(sender.$node);
    }
    lockScroll();
    layer = {
      close: function (reason, ev) {
        if (sender.state.dismissible !== false) close(sender, reason, ev);
      }
    };
    pushLayer(layer);
    firstFocus(sender);
    emit(p.onOpen, sender, event, {});
  }
  /** Releases the layer; true when it was open. */
  function release() {
    if (!layer) return false;
    removeLayer(layer);
    unlockScroll();
    layer = null;
    return true;
  }
  function close(sender, reason, event) {
    if (!release()) return;
    const node = sender.$node;
    if (node.parentNode) node.parentNode.removeChild(node);
    restoreFocus(returnTo);
    returnTo = null;
    emit(p.onClose, sender, event, { reason: reason });
    if (x.onClose) x.onClose(reason);
  }

  const state = stateOf(p, kind, {
    kind: kind,
    size: oneOf((kind === 'drawer' ? 'vfDrawer' : 'vfModal') + ' size', p.size, SIZES),
    side: kind === 'drawer' ? oneOf('vfDrawer side', p.side, SIDES) : null,
    role: x.role,
    describedBy: x.describedBy
  });
  return instance({
    state: state,
    render: render,
    childs: isInstance(p.content) ? [{ targetId: state.id + '-body', component: p.content }] : undefined,
    delegates: [
      { selector: '[data-action="close"]', eventType: 'click', onEvent: function (e) { close(e.sender, 'close', e.event); } },
      {
        selector: '[data-action="backdrop"]',
        eventType: 'click',
        onEvent: function (e) { if (e.sender.state.dismissible !== false) close(e.sender, 'backdrop', e.event); }
      },
      {
        selector: '[data-action]',
        eventType: 'click',
        onEvent: function (e) {
          const action = e.target.getAttribute('data-action');
          if (OWN_ACTIONS[action]) return;
          if (x.onAction) x.onAction(e.sender, action, e.event);
          emit(p.onAction, e.sender, e.event, { action: action });
        }
      },
      { selector: idSelector(state.id + '-dialog'), eventType: 'keydown', onEvent: function (e) { trapTab(e.event, dialog(e.sender)); } }
    ],
    methods: {
      open: function () {
        const self = this;
        if (x.open) return x.open(function () { open(self, null); });
        open(self, null);
      },
      close: function (reason) { close(this, reason || 'code', null); },
      isOpen: function () { return !!layer; }
    },
    onDestroy: function () {
      if (release()) restoreFocus(returnTo);
    }
  });
}

/**
 * A modal dialog.
 * @param {Object} props
 * @param {string|SafeHtml} [props.title] - names the dialog (else `label`)
 * @param {string} [props.label] - aria-label when there is no title
 * @param {*} [props.content] - markup, or a vfunc instance (appended as a child)
 * @param {*} [props.footer] - markup such as buttons with data-action (reported by onAction)
 * @param {'md'|'sm'|'lg'} [props.size='md'] - `data-size`
 * @param {boolean} [props.dismissible=true] - close button, Escape and backdrop close it
 * @param {string} [props.initialFocus] - data-ref of the element to focus on open
 * @param {string} [props.closeLabel] - replaces the `modal.close` message
 * @param {function} [props.onOpen] - ({ sender, event, data: {} })
 * @param {function} [props.onClose] - ({ sender, event, data: { reason } }): close, escape, backdrop, code …
 * @param {function} [props.onAction] - a click on an element with data-action inside: ({ data: { action } })
 *   Also: id, ref, className
 * @returns {Object} instance with open(), close(reason?), isOpen()
 */
export function vfModal(props) {
  return createModal(props || {}, 'modal');
}

/**
 * vfModal as a panel at one side of the screen.
 * @param {Object} props - vfModal props, plus side: 'end' (default) | 'start' | 'bottom' (`data-side`)
 * @returns {Object} instance with open(), close(reason?), isOpen()
 */
export function vfDrawer(props) {
  return createModal(props || {}, 'drawer');
}
