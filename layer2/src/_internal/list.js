// SPDX-License-Identifier: Apache-2.0
//
// The official keyed list plugin (layer1/plugins/list.js, D-044) as layer 2 uses it (D-045), installed on
// the engine layer 2 sees. Besides _internal/vf.js this is the only file that imports layer 1: the
// plugin is public API and has no imports, so every build bundles it as it is.

import vf from './vf.js';
import vfList from '../../../layer1/plugins/list.js';

export const list = vfList.install(vf);
