// SPDX-License-Identifier: Apache-2.0
//
// Types of the official keyboard shortcut plugin (layer1/plugins/shortcut.js, D-030).
//   import vfShortcut from 'vfunc/plugins/shortcut';
//   const keys = vf.use(vfShortcut);
//   const off = keys.add('mod+k', () => openSearch(), { label: 'Search' });

import type { VfPlugin } from '../vfunc';

export interface ShortcutOptions {
  /** Where keydown is listened to. Default document. */
  target?: EventTarget;
  /** Treat `mod` as meta (true) or ctrl (false). Default: detected from the platform. */
  apple?: boolean;
}

export interface ShortcutAddOptions {
  /** Shown by list(), for a help screen. */
  label?: string;
  /** Also run while typing in inputs, textareas, selects and editable elements. Default false. */
  allowInInput?: boolean;
  /** Default true. */
  preventDefault?: boolean;
}

export interface ShortcutApi {
  /**
   * `combo`: modifiers ctrl, alt, shift, meta, mod (meta on Apple devices, ctrl elsewhere) and one
   * key as KeyboardEvent.key names it ('k', 'enter', 'escape', 'arrowup', 'f2', '?', 'space').
   * Keys of an IME composition never match. The newest shortcut of a combo wins.
   * Returns a function that removes the shortcut.
   */
  add(combo: string, handler: (event: KeyboardEvent, info: { combo: string; label: string }) => void, options?: ShortcutAddOptions): () => void;
  /** Removes the shortcuts of a combo, or only the one with this handler. */
  remove(combo: string, handler?: (...args: any[]) => void): void;
  /** One row per combo in canonical form ('ctrl+shift+k'), sorted. */
  list(): Array<{ combo: string; label: string }>;
  /** The canonical form of a combo, or '' when it is not valid. */
  parse(combo: string): string;
  /** Removes the listener and every shortcut. */
  destroy(): void;
}

declare const vfShortcut: VfPlugin<ShortcutApi, ShortcutOptions>;
export default vfShortcut;
