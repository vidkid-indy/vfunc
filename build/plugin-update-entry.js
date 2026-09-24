// SPDX-License-Identifier: Apache-2.0
//
// Entry of dist/plugins/update.min.js (<script>): exposes the plugin as window.vfUpdate so that
// plain scripts can call vf.use(vfUpdate, options). An existing vfUpdate is never replaced.

import vfUpdate from '../layer1/plugins/update.js';

if (typeof window !== 'undefined' && !window.vfUpdate) window.vfUpdate = vfUpdate;
