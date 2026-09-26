// SPDX-License-Identifier: Apache-2.0
//
// vfGridTabulator — the G-1 grid contract on Tabulator (MIT; load tabulator-tables 6.x yourself).
//   <script>: vfunc.js, the Tabulator script and CSS, then vfunc-grid-tabulator.js
//   ES modules: import { vfGridTabulator } from 'vfunc/adapters/grid-tabulator'

import type { VfuncInstance } from '../../../layer1/types/vfunc';
import type { VfGridProps, VfGridMethods } from '../vfunc-ui-data';

export interface VfGridTabulatorProps<T = any> extends VfGridProps<T> {
  /** The Tabulator class; default the global `Tabulator`. */
  lib?: unknown;
  /** Tabulator options, merged over the adapter's. */
  options?: Record<string, unknown>;
}

/**
 * `.instance` is the Tabulator table after mount. Tabulator builds asynchronously: setData,
 * setColumns and setPage return the vendor's promise once it is built.
 */
export declare function vfGridTabulator<T = any>(props: VfGridTabulatorProps<T>): VfuncInstance & VfGridMethods<T>;
export default vfGridTabulator;

declare module '../../../layer1/types/vfunc' {
  interface Vf {
    readonly vfGridTabulator: typeof vfGridTabulator;
  }
}
