// SPDX-License-Identifier: Apache-2.0
//
// Live instances in the slots of a vf* component (D-038). The engine writes an instance that is
// put into markup as a static copy (its outerHTML, without state or listeners), so a vf* takes the
// instances out of its slots: the markup gets the empty slot element (it has an id), and each
// instance joins the owner's `childs`. It then survives the owner's re-renders, gets onMount with
// it and is destroyed with it. Only the instances given when the vf* is created are attached.
// vs* functions return markup and cannot do this: their slots take markup only.

/** A vfunc instance. */
export function isInstance(value) {
  return !!(value && value.isvfunc);
}

/**
 * The items for rendering: an instance in a slot becomes '' (it is in the slot through childs).
 * Guards a later setState({ tabs: … }) that passes the same instances again.
 */
export function markupOnly(items, key) {
  return slotChilds(items, key, function () { return ''; }).items;
}

/**
 * @param {Array<Object>} items - the slot owners (tabs, accordion items, slides …)
 * @param {string} key - the slot of each item (e.g. 'content')
 * @param {function(number): string} idOf - the id of the element that holds item i's slot
 * @returns {{ items: Array<Object>, childs: Array<{targetId: string, component: Object}> }}
 *   the items with their instances replaced by '', and the `childs` entries for the instances
 */
export function slotChilds(items, key, idOf) {
  const out = [];
  const childs = [];
  for (let i = 0; i < (items || []).length; i++) {
    const item = items[i];
    if (!item || !isInstance(item[key])) {
      out.push(item);
      continue;
    }
    const copy = {};
    for (const k in item) if (Object.prototype.hasOwnProperty.call(item, k)) copy[k] = item[k];
    copy[key] = '';
    out.push(copy);
    childs.push({ targetId: idOf(i), component: item[key] });
  }
  return { items: out, childs: childs };
}
