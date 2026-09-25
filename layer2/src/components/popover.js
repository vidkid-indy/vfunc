// SPDX-License-Identifier: Apache-2.0
//
// Popover — Tier F (vfPopover only). Spec reference: pilot components/molecules/VPopover.js
// (rewritten: a non-modal dialog next to its trigger; focus moves in on open and back to the
// trigger on Escape; an outside press or focus leaving the popover closes it, D-032).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { cls, extend, present, emit } from '../_internal/common.js';
import { stateOf, instance, idSelector } from '../_internal/instance.js';
import { placementOf } from '../_internal/position.js';
import { floatControl } from '../_internal/floating.js';
import { focusables } from '../_internal/overlay.js';
import { vsButton } from './button.js';

const html = vf.html;

function render(s) {
  const panelId = s.id + '-panel';
  const titleId = s.id + '-title';
  const trigger = vsButton(extend({}, s.trigger, {
    id: s.id + '-trigger',
    action: 'popover',
    aria: { haspopup: 'dialog', expanded: !!s.expanded, controls: panelId }
  }));
  const title = present(s.title) ? html`<p ${attrs({ class: 'vf-popover__title', id: titleId })}>${s.title}</p>` : '';
  return html`<div ${attrs({ class: cls('vf-popover', s.className), id: s.id, 'data-ref': s.ref })}>${trigger}<div ${attrs({
    class: 'vf-popover__panel',
    id: panelId,
    role: 'dialog',
    tabindex: -1,
    'aria-labelledby': present(s.title) ? titleId : null,
    'aria-label': present(s.title) ? null : s.label,
    hidden: !s.expanded
  })}><div class="vf-popover__header">${title}<button ${attrs({
    type: 'button',
    class: 'vf-popover__close',
    'data-action': 'close',
    'aria-label': msg('modal.close')
  })}><span aria-hidden="true">&times;</span></button></div><div class="vf-popover__body">${s.content}</div></div></div>`;
}

/**
 * A panel of content next to a button.
 * @param {Object} props
 * @param {Object} props.trigger - vsButton props of the trigger
 * @param {*} props.content - markup (vf.html)
 * @param {string|SafeHtml} [props.title] - names the panel
 * @param {string} [props.label] - names the panel when there is no title
 * @param {'bottom-start'|'bottom-end'|'top-start'|'top-end'} [props.placement='bottom-start']
 * @param {function} [props.onOpen] - ({ sender, event, data: {} })
 * @param {function} [props.onClose] - ({ sender, event, data: { reason } })
 *   Also: id, ref, className
 * @returns {Object} instance with open(), close(), isOpen()
 */
export function vfPopover(props) {
  const p = props || {};
  const ctrl = floatControl({
    panel: function (s) { return s.ids[s.state.id + '-panel'] || null; },
    trigger: function (s) { return s.ids[s.state.id + '-trigger'] || null; },
    onClose: function (s, reason, event) { emit(p.onClose, s, event, { reason: reason }); }
  });
  function open(sender, event) {
    if (ctrl.isOpen()) return;
    ctrl.open(sender);
    const panel = sender.ids[sender.state.id + '-panel'];
    if (panel) {
      const list = focusables(panel);
      // The close button comes first in the markup; start on the content when it has a control.
      (list.length > 1 ? list[1] : panel).focus();
    }
    emit(p.onOpen, sender, event, {});
  }
  const state = stateOf(p, 'popover', { trigger: p.trigger || {}, expanded: false, placement: placementOf(p.placement) });
  return instance({
    state: state,
    render: render,
    delegates: [
      {
        selector: '[data-action="popover"]',
        eventType: 'click',
        onEvent: function (e) {
          if (ctrl.isOpen()) ctrl.close('toggle', e.event, true);
          else open(e.sender, e.event);
        }
      },
      { selector: '[data-action="close"]', eventType: 'click', onEvent: function (e) { ctrl.close('close', e.event, true); } },
      {
        selector: idSelector(state.id),
        eventType: 'focusout',
        onEvent: function (e) {
          const next = e.event.relatedTarget;
          if (ctrl.isOpen() && next && !e.sender.$node.contains(next)) ctrl.close('blur', e.event, false);
        }
      }
    ],
    methods: {
      open: function () { open(this, null); },
      close: function () { ctrl.close('code', null, false); },
      isOpen: function () { return ctrl.isOpen(); }
    },
    onUpdate: function () { ctrl.reposition(); },
    onDestroy: function () { ctrl.stop(); }
  });
}
