// SPDX-License-Identifier: Apache-2.0
//
// Confirm — Tier F (vfConfirm only). Spec reference: pilot components/overlays/VConfirmDialog.js
// (rewritten on vfModal: role="alertdialog", open() returns a Promise of the answer, and a
// dangerous action starts on the cancel button, D-032).

import vf from '../_internal/vf.js';
import { msg } from '../_internal/messages.js';
import { present, uid } from '../_internal/common.js';
import { createModal } from './modal.js';
import { vsButton } from './button.js';

const html = vf.html;

/**
 * A yes/no question in a modal dialog.
 * @param {Object} props
 * @param {string|SafeHtml} props.title
 * @param {string|SafeHtml} [props.message]
 * @param {string} [props.confirmLabel] - replaces the `confirm.ok` message
 * @param {string} [props.cancelLabel] - replaces the `confirm.cancel` message
 * @param {'primary'|'danger'} [props.variant='primary'] - danger: red confirm button, focus starts on cancel
 *   Also: id, className
 * @returns {Object} instance with open() → Promise<boolean> (Escape and the backdrop answer false)
 */
export function vfConfirm(props) {
  const p = props || {};
  const danger = p.variant === 'danger';
  const base = present(p.id) ? String(p.id) : uid('confirm');
  const messageId = base + '-message';
  let settle = null;
  let pending = null;
  let answer = false;

  return createModal({
    id: base,
    title: p.title,
    className: p.className,
    size: 'sm',
    content: present(p.message) ? html`<p class="vf-confirm__message" id="${messageId}">${p.message}</p>` : '',
    footer: html`${vsButton({ label: msg('confirm.cancel', p.cancelLabel), action: 'cancel', ref: 'cancel' })}${vsButton({
      label: msg('confirm.ok', p.confirmLabel), action: 'confirm', ref: 'confirm', variant: danger ? 'danger' : 'primary'
    })}`,
    initialFocus: danger ? 'cancel' : 'confirm'
  }, 'modal', {
    role: 'alertdialog',
    describedBy: present(p.message) ? messageId : null,
    open: function (doOpen) {
      if (pending) return pending;
      pending = new Promise(function (resolve) { settle = resolve; });
      doOpen();
      return pending;
    },
    onAction: function (sender, action) {
      if (action !== 'confirm' && action !== 'cancel') return;
      answer = action === 'confirm';
      sender.close(action);
    },
    onClose: function () {
      const done = settle;
      const result = answer;
      settle = null;
      pending = null;
      answer = false;
      if (done) done(result);
    }
  });
}
