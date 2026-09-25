// SPDX-License-Identifier: Apache-2.0
//
// What the overlays share (D-032): the stack of open layers (Escape closes the top one only),
// focus containment and return, and the page scroll lock. One code path for every browser,
// IE11 included: no <dialog>, no inert.

const layers = [];
let locks = 0;
let listening = false;

const FOCUSABLE = 'a[href], button, input, select, textarea, iframe, [tabindex], [contenteditable="true"]';

function onKeyDown(event) {
  const key = event.key;
  if ((key !== 'Escape' && key !== 'Esc') || !layers.length) return;
  const top = layers[layers.length - 1];
  event.preventDefault();
  top.close('escape', event);
}

/**
 * Registers an open layer; the newest is the top one.
 * @param {{ root: Element, close: function(string, Event): void }} layer
 */
export function pushLayer(layer) {
  layers.push(layer);
  if (!listening && typeof document !== 'undefined') {
    document.addEventListener('keydown', onKeyDown);
    listening = true;
  }
}

export function removeLayer(layer) {
  const i = layers.indexOf(layer);
  if (i >= 0) layers.splice(i, 1);
  if (!layers.length && listening) {
    document.removeEventListener('keydown', onKeyDown);
    listening = false;
  }
}

export function isTopLayer(layer) {
  return layers.length > 0 && layers[layers.length - 1] === layer;
}

/** Locks the page scroll while at least one modal layer is open (CSS: [data-vf-scroll-lock]). */
export function lockScroll() {
  locks += 1;
  if (locks === 1) document.documentElement.setAttribute('data-vf-scroll-lock', 'true');
}

export function unlockScroll() {
  if (locks === 0) return;
  locks -= 1;
  if (locks === 0) document.documentElement.removeAttribute('data-vf-scroll-lock');
}

/** Focusable elements inside `root`, in order: enabled, not hidden, tabindex not negative. */
export function focusables(root) {
  const out = [];
  const list = root.querySelectorAll(FOCUSABLE);
  for (let i = 0; i < list.length; i++) {
    const el = list[i];
    if (el.disabled || el.getAttribute('tabindex') === '-1') continue;
    if (el.tagName === 'INPUT' && el.type === 'hidden') continue;
    if (el.tagName === 'A' && !el.getAttribute('href')) continue;
    let hidden = false;
    for (let node = el; node && node !== root.parentNode; node = node.parentNode) {
      if (node.nodeType === 1 && node.hasAttribute('hidden')) { hidden = true; break; }
    }
    if (!hidden) out.push(el);
  }
  return out;
}

/** Keeps Tab and Shift+Tab inside `root` (a modal dialog). */
export function trapTab(event, root) {
  if (event.key !== 'Tab') return;
  const list = focusables(root);
  if (!list.length) {
    event.preventDefault();
    root.focus();
    return;
  }
  const first = list[0];
  const last = list[list.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === root)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/** Focuses `el` when it is still in the page (the element that opened a layer). */
export function restoreFocus(el) {
  if (el && typeof el.focus === 'function' && document.documentElement.contains(el)) el.focus();
}
