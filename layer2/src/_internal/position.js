// SPDX-License-Identifier: Apache-2.0
//
// Places a floating panel (menu, popover) next to its trigger with position: fixed, so an
// `overflow: hidden` ancestor does not clip it (D-032). The side flips when there is no room, the
// panel stays inside the viewport, and start/end follow the text direction. The gap between
// trigger and panel is CSS (margin by [data-placement]), so JS holds only computed coordinates,
// which differ per instance (rule 21).

const PLACEMENTS = ['bottom-start', 'bottom-end', 'top-start', 'top-end'];

export function placementOf(value) {
  return PLACEMENTS.indexOf(value) >= 0 ? value : PLACEMENTS[0];
}

/**
 * @param {HTMLElement} panel - position: fixed, visible (so it can be measured)
 * @param {Element} anchor - the trigger
 * @param {string} placement - 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
 */
export function place(panel, anchor, placement) {
  const parts = placementOf(placement).split('-');
  let side = parts[0];
  const a = anchor.getBoundingClientRect();
  const width = panel.offsetWidth;
  const height = panel.offsetHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  if (side === 'bottom' && a.bottom + height > vh && a.top - height >= 0) side = 'top';
  else if (side === 'top' && a.top - height < 0 && a.bottom + height <= vh) side = 'bottom';
  const rtl = window.getComputedStyle && window.getComputedStyle(anchor).direction === 'rtl';
  const alignLeft = (parts[1] === 'start') !== !!rtl;
  let left = alignLeft ? a.left : a.right - width;
  if (left + width > vw) left = vw - width;
  if (left < 0) left = 0;
  const top = side === 'top' ? a.top - height : a.bottom;
  panel.style.top = Math.round(top) + 'px';
  panel.style.left = Math.round(left) + 'px';
  panel.setAttribute('data-placement', side);
}
