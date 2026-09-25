// SPDX-License-Identifier: Apache-2.0
//
// The core layer 2 as the data file sees it (D-033): the engine's vf object with the core members
// (vsTable, vsPagination, vsEmptyState …) on it. The build swaps this module so the data file never
// bundles the core again:
//   <script> files      window.vf, which vfunc-ui.js filled first (else a clear error)
//   ES modules          import "./vfunc-ui.esm.js" next to the data file
//   vfunc-all files     this source: the core is bundled once
// Data components call core components as vf.vsTable(…), never by importing their modules.

import vf from './vf.js';
import '../index.js';

export default vf;
