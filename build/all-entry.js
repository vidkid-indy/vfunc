// SPDX-License-Identifier: Apache-2.0
//
// Entry of dist/vfunc-all.js and vfunc-all.min.js (layers 1 + 2 in one <script> file): the
// engine joins window.vf first, then layer 2 adds its members to the same object.

import './iife-entry.js';
import '../layer2/src/index.js';
