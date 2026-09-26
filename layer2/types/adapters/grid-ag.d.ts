// SPDX-License-Identifier: Apache-2.0
//
// vfGridAg — the G-1 grid contract on AG Grid Community (MIT; load ag-grid-community 36.x yourself).
//   <script>: vfunc.js, the AG Grid script, then vfunc-grid-ag.js. AG Grid injects <style> elements
//   and uses data: images for icons, so the page's CSP is one of:
//   - a nonce made per response: ag-grid-community.min.noStyle.js, options: { styleNonce },
//     style-src 'self' 'nonce-…'; img-src 'self' data:
//   - a static page: ag-grid-community.min.js, style-src 'self' 'unsafe-inline'; font-src 'self' data:;
//     img-src 'self' data:
//   - a static page with a strict style-src: vfGridTabulator or vfGrid instead.
//   ES modules: import { vfGridAg } from 'vfunc/adapters/grid-ag'

import type { VfuncInstance } from '../../../layer1/types/vfunc';
import type { VfGridProps, VfGridMethods } from '../vfunc-ui-data';

export interface VfGridAgProps<T = any> extends VfGridProps<T> {
  /** The AG Grid library object; default the global `agGrid`. */
  lib?: unknown;
  /** AG Grid grid options, merged over the adapter's (e.g. { animateRows: false }, { styleNonce }). */
  options?: Record<string, unknown>;
}

/** `.instance` is the AG Grid API (GridApi) after mount. Enterprise features need an AG Grid license. */
export declare function vfGridAg<T = any>(props: VfGridAgProps<T>): VfuncInstance & VfGridMethods<T>;
export default vfGridAg;

declare module '../../../layer1/types/vfunc' {
  interface Vf {
    readonly vfGridAg: typeof vfGridAg;
  }
}
