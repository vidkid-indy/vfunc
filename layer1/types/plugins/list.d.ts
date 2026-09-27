// SPDX-License-Identifier: Apache-2.0
//
// Types of the official keyed list plugin (layer1/plugins/list.js, D-044).
//   import vfList from 'vfunc/plugins/list';
//   const list = vf.use(vfList);
//   const rows = list.create('#tbody', { key: (item) => item.id, render: (item) => vf.html`<tr>…</tr>` });
//   rows.set(items);

import type { SafeHtml, VfPlugin } from '../vfunc';

export interface ListOptions<T> {
  /** The item's key, unique in the list (string or number). Items without one are skipped. */
  key: (item: T) => string | number;
  /**
   * One element for the item, built with vf.html (a plain string is escaped as text, so it is not a row).
   * It is parsed inside the container's own tag, so a <tbody> container takes <tr> rows.
   */
  render: (item: T) => SafeHtml;
  /** Items to draw right away. */
  items?: T[];
}

export interface ListInstance<T> {
  /**
   * Shows the items in this order. An item whose key was shown before and is the same object keeps its
   * element; a new object for a key draws that row again; rows are moved to the new order; missing
   * keys are removed. Treat items as immutable, or call refresh(key) after changing one in place.
   */
  set(items: T[]): void;
  /** Draws one item again (its data changed in place), or every item without a key. */
  refresh(key?: string | number): void;
  /** The items shown, in order. */
  items(): T[];
  /** The row element of a key (it carries data-vf-key), or null. */
  element(key: string | number): Element | null;
  /** Removes the rows this list drew; later calls do nothing. */
  destroy(): void;
}

export interface ListApi {
  /**
   * A keyed list in `container`, the direct parent of the rows (tbody, ul, div …): an element, or a
   * selector for vf.$ ('#id', '[data-ref="x"]'). Put nothing else in it; inside a component mark it
   * with data-vf-keep. Returns null (and warns) when the container is not found.
   */
  create<T>(container: Element | string, options: ListOptions<T>): ListInstance<T> | null;
}

declare const vfList: VfPlugin<ListApi, Record<string, never>>;
export default vfList;
