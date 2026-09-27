// SPDX-License-Identifier: Apache-2.0
//
// Entry of dist/plugins/list.min.js (<script>): exposes the plugin as window.vfList so that
// plain scripts can call vf.use(vfList). An existing vfList is never replaced.

import vfList from '../layer1/plugins/list.js';

if (typeof window !== 'undefined' && !window.vfList) window.vfList = vfList;
