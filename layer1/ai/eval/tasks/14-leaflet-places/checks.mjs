// SPDX-License-Identifier: Apache-2.0
// Task 14 — Leaflet 1.9.4 as an app wrapper (L1). Leaflet comes from the CDN (network needed).
// The grader reads Leaflet's own DOM (.leaflet-container, path.leaflet-interactive, .leaflet-tooltip).
import { assert, count, text, waitText, waitCount, mark, sameElement } from '../../tools/helpers.mjs';

const MAP = '#map-slot [data-vf-keep].leaflet-container, #map-slot [data-vf-keep] .leaflet-container';
const MARKERS = '#map-slot path.leaflet-interactive';

// Firefox warns about deprecated MouseEvent members that Leaflet 1.9.4 itself reads: vendor code.
const before = (page, env) => env.allow(/is deprecated.*leaflet@1\.9\.4|leaflet@1\.9\.4.*is deprecated/);

const opacities = (page) => page.$$eval(MARKERS, (ps) => ps.map((p) => p.getAttribute('fill-opacity')));

export default [
  {
    name: 'the wrapper is app.vfPlacesMap (not on vf); the map is in a data-vf-keep element with one marker per place and no tiles',
    before,
    async run(page) {
      await waitCount(page, MARKERS, 3);
      assert.equal(await page.evaluate(() => typeof (window.app && window.app.vfPlacesMap)), 'function', 'app.vfPlacesMap');
      assert.equal(await page.evaluate(() => 'vfPlacesMap' in vf), false, 'nothing added to vf');
      assert.equal(await count(page, MAP), 1, 'one Leaflet map inside a data-vf-keep element');
      assert.equal(await count(page, 'img.leaflet-tile'), 0, 'no tile layer');
      assert.deepEqual(await opacities(page), ['0.4', '0.4', '0.4'], 'nothing selected at the start');
      assert.equal(await text(page, '[data-ref="current"]'), 'No place selected');
    }
  },
  {
    name: 'a marker click selects the place (onSelect → the page)',
    before,
    async run(page) {
      await waitCount(page, MARKERS, 3);
      await page.locator(MARKERS).nth(2).click();
      await waitText(page, '[data-ref="current"]', 'Selected: Namsan Tower');
      await page.waitForFunction((sel) => Array.from(document.querySelectorAll(sel)).map((p) => p.getAttribute('fill-opacity')).join() === '0.4,0.4,1', MARKERS);
    }
  },
  {
    name: 'a list button selects and highlights the marker; names are text in the page and in the tooltip',
    before,
    async run(page) {
      await waitCount(page, MARKERS, 3);
      await mark(page, MAP, 'map');
      await page.click('#places [data-action="select"][data-id="p2"]');
      await waitText(page, '[data-ref="current"]', 'Selected: Cafe <b>Moon</b>');
      assert.equal(await count(page, '[data-ref="current"] b'), 0, 'the name is text');
      await page.waitForFunction((sel) => Array.from(document.querySelectorAll(sel)).map((p) => p.getAttribute('fill-opacity')).join() === '0.4,1,0.4', MARKERS);
      await sameElement(page, 'map', 'the map element survives the selection');
      await page.locator(MARKERS).nth(1).hover();
      await page.waitForSelector('.leaflet-tooltip');
      assert.equal(await text(page, '.leaflet-tooltip'), 'Cafe <b>Moon</b>', 'the tooltip shows the name as text');
      assert.equal(await count(page, '.leaflet-tooltip b'), 0, 'no markup from the name');
    }
  },
  {
    name: 'hiding destroys the map; showing creates a new one with nothing selected (twice)',
    before,
    async run(page) {
      await waitCount(page, MARKERS, 3);
      await page.click('#places [data-action="select"][data-id="p1"]');
      await waitText(page, '[data-ref="current"]', 'Selected: Seoul Station');
      for (let i = 0; i < 2; i++) {
        await page.click('[data-action="toggle-map"]');
        await waitCount(page, '.leaflet-container', 0);
        await waitText(page, '[data-action="toggle-map"]', 'Show map');
        await page.click('[data-action="toggle-map"]');
        await waitCount(page, MARKERS, 3);
        await waitText(page, '[data-action="toggle-map"]', 'Hide map');
        assert.equal(await count(page, '.leaflet-container'), 1, 'one map');
        assert.deepEqual(await opacities(page), ['0.4', '0.4', '0.4'], 'a new map has nothing selected');
      }
    }
  }
];
