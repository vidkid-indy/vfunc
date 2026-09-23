// SPDX-License-Identifier: Apache-2.0
//
// The global `vf` of the <script> builds (dist/vfunc.js, dist/vfunc.min.js).
// For type checking plain scripts, reference this file:
//   /// <reference path="./node_modules/vfunc/types/global.d.ts" />

import type { Vf } from './vfunc';

declare global {
  const vf: Vf;
  interface Window {
    vf: Vf;
  }
}

export {};
