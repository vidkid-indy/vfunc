// SPDX-License-Identifier: Apache-2.0
//
// Entry of dist/plugins/shortcut.min.js (<script>): exposes the plugin as window.vfShortcut so that
// plain scripts can call vf.use(vfShortcut). An existing vfShortcut is never replaced.

import vfShortcut from '../layer1/plugins/shortcut.js';

if (typeof window !== 'undefined' && !window.vfShortcut) window.vfShortcut = vfShortcut;
