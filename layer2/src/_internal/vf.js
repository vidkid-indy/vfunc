// SPDX-License-Identifier: Apache-2.0
//
// The engine as layer 2 sees it: the only place that imports layer 1 (rule 16).
// The build swaps this module (maintainer decisions D-029):
//   <script> files      window.vf, which vfunc.js put there first
//   ES modules          the engine file next to the layer 2 file (vfunc.esm.js / vfunc.esm.min.js)
//   vfunc-all files     the engine source, bundled
// Layer 2 code uses the default export only, and only the public API (types/vfunc.d.ts).

export { default } from '../../../layer1/src/vfunc.js';
