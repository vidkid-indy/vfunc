// SPDX-License-Identifier: Apache-2.0
//
// Open / close of a floating panel inside a vf* instance (Dropdown, Popover, SplitButton; D-032):
// the `expanded` state (not `open`, which is a method name), placement next to the trigger while
// scrolling and resizing, closing on an outside press and on Escape (top layer only), and focus
// back to the trigger.

import { place } from './position.js';
import { pushLayer, removeLayer } from './overlay.js';

/**
 * @param {Object} o
 * @param {function(Object): ?HTMLElement} o.panel - the panel of an instance
 * @param {function(Object): ?HTMLElement} o.trigger - the trigger of an instance
 * @param {function(Object, string, ?Event): void} [o.onClose] - after closing (reason: 'escape',
 *   'outside', 'select', 'toggle', 'tab', 'close', 'code')
 */
export function floatControl(o) {
  let sender = null;
  let layer = null;

  function reposition() {
    if (!sender) return;
    const panel = o.panel(sender);
    const trigger = o.trigger(sender);
    if (panel && trigger) place(panel, trigger, sender.state.placement);
  }
  function outside(event) {
    if (sender && !sender.$node.contains(event.target)) close('outside', event, false);
  }
  function listen(on) {
    const method = on ? 'addEventListener' : 'removeEventListener';
    window[method]('resize', reposition);
    window[method]('scroll', reposition, true);
    document[method]('mousedown', outside, true);
  }
  function open(s) {
    if (sender) return;
    sender = s;
    s.state.expanded = true;
    s.refresh(); // now, so the panel can be measured and focused
    reposition();
    listen(true);
    layer = { close: function (reason, event) { close(reason, event, true); } };
    pushLayer(layer);
  }
  /** Stops listening; true when it was open. */
  function stop() {
    if (!sender) return false;
    listen(false);
    removeLayer(layer);
    layer = null;
    sender = null;
    return true;
  }
  function close(reason, event, focusTrigger) {
    const s = sender;
    if (!stop()) return;
    s.state.expanded = false;
    s.refresh();
    if (focusTrigger) {
      const trigger = o.trigger(s);
      if (trigger) trigger.focus();
    }
    if (o.onClose) o.onClose(s, reason, event || null);
  }
  return {
    open: open,
    close: close,
    isOpen: function () { return !!sender; },
    /** For onUpdate: a refresh draws a new panel without its coordinates. */
    reposition: reposition,
    /** For onDestroy: release listeners without drawing. */
    stop: stop
  };
}
