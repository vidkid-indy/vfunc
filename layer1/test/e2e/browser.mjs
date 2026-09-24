// SPDX-License-Identifier: Apache-2.0
//
// Picks the browser engine for the browser tests. VF_BROWSER=chromium (default) | firefox | webkit.
// CI runs all three (plan N12). Install once: `npx playwright install chromium firefox webkit`.

import { chromium, firefox, webkit } from 'playwright';

const ENGINES = { chromium: chromium, firefox: firefox, webkit: webkit };

export const ENGINE = process.env.VF_BROWSER || 'chromium';

/** Launches the selected engine. */
export function launchBrowser() {
  const type = ENGINES[ENGINE];
  if (!type) throw new Error('Unknown VF_BROWSER "' + ENGINE + '" (use chromium, firefox or webkit)');
  return type.launch();
}
