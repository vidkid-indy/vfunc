// SPDX-License-Identifier: Apache-2.0
//
// The grid contract on vfGridAg under a strict style-src (csp-nonce.html): AG Grid's noStyle build
// injects nothing when it loads, and the grid puts the nonce from options.styleNonce on the <style>
// elements it injects, so the page needs no 'unsafe-inline'. Any CSP violation fails the page
// (violations are also console errors, which the e2e test counts).

import vf from '../../../layer1/dist/vfunc.esm.js';
import '../../dist/vfunc-ui.esm.js';
import { vfGridAg } from '../../dist/vfunc-grid-ag.esm.js';
import { agGridSuite } from './ag-grid.suite.js';
import { SAMPLE_ROWS } from './grid.contract.js';
import { test, assert, run } from './runner.js';

// Fixed for the test page only; a server makes a new one for every response.
const NONCE = 'vfContractNonce';

const common = { vf, test, assert, window };

test('AG Grid injects its styles with the nonce and the grid is styled', async () => {
  const inst = vfGridAg({
    lib: window.agGrid,
    columns: [{ key: 'name', label: 'Name' }],
    data: SAMPLE_ROWS,
    options: { styleNonce: NONCE }
  });
  await inst.mount(document.getElementById('stage'));
  try {
    const styles = Array.from(document.querySelectorAll('style'));
    assert.ok(styles.length > 0, 'AG Grid added <style> elements');
    assert.ok(styles.every((el) => el.nonce === NONCE), 'every <style> carries the nonce');
    const root = inst.$node.querySelector('.ag-root-wrapper');
    assert.ok(root, 'the grid is rendered');
    // A div is a block until AG Grid's injected CSS makes the wrapper a flex box.
    assert.equal(getComputedStyle(root).display, 'flex', 'the injected styles apply');
  } finally {
    inst.destroy();
  }
});

agGridSuite(common, { name: '— CSP nonce', options: { styleNonce: NONCE } });

test('no CSP violation (csp-watch.js records them from the start)', () => {
  assert.deepEqual(window.__cspViolations, []);
});

run(document.getElementById('results'), document.getElementById('summary'));
