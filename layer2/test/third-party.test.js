// SPDX-License-Identifier: Apache-2.0
// The L2 Leaflet adapter of the sample (layer2/examples/third-party-custom) passes the base contract
// with a mock Leaflet, as the guide asks of any contributed adapter (D-034 8).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { window } from '../../layer1/test/setup-dom.js';
import vf from '../../layer1/src/vfunc.js';
import '../src/index.js';
import { vfMapLeaflet } from '../examples/third-party-custom/vfunc-map-leaflet.js';
import { baseContract, assertEvent } from '../adapters/_contract/base.contract.js';

/** Just enough of Leaflet: a map with setView/invalidateSize/remove, circle markers, layer groups. */
function mockLeaflet() {
  const L = {
    maps: 0,
    map(host) {
      L.maps++;
      const map = {
        host, zoom: 11, removed: false,
        setView(center, zoom) { this.center = center; this.zoom = zoom; return this; },
        getZoom() { return this.zoom; },
        invalidateSize() {},
        remove() { this.removed = true; L.maps--; }
      };
      return map;
    },
    circleMarker(latlng, options) {
      const marker = { latlng, options, handlers: {}, tooltip: '' };
      marker.bindTooltip = (text) => { marker.tooltip = text; return marker; };
      marker.on = (name, fn) => { marker.handlers[name] = fn; return marker; };
      return marker;
    },
    layerGroup(markers) {
      return { markers, addTo(map) { map.layer = this; return this; }, remove() { this.removed = true; } };
    }
  };
  return L;
}

const L = mockLeaflet();
const MARKERS = [{ id: 'a', lat: 1, lng: 2, label: '<b>A</b>' }, { id: 'b', lat: 3, lng: 4, label: 'B' }];

baseContract({
  name: 'vfMapLeaflet (sample, mock Leaflet)',
  factory: (props) => vfMapLeaflet(vf, Object.assign({}, props, { lib: L })),
  props: { markers: MARKERS, label: 'Places' },
  vf, test, assert, window
});

test('vfMapLeaflet: markers through Leaflet, escaped tooltips, events, setMarkers keeps the map', async () => {
  const clicks = [];
  const inst = vfMapLeaflet(vf, { lib: L, markers: MARKERS, onMarkerClick: (e) => clicks.push(e) });
  await inst.mount(window.document.body);
  const map = inst.instance;
  assert.equal(map.layer.markers.length, 2);
  assert.equal(map.layer.markers[0].tooltip, '&lt;b&gt;A&lt;/b&gt;', 'Leaflet takes HTML: the label is escaped');
  map.layer.markers[1].handlers.click({ originalEvent: null });
  assertEvent(assert, clicks[0], inst, ['marker']);
  assert.equal(clicks[0].data.marker.id, 'b');
  inst.setMarkers([MARKERS[0]]);
  assert.equal(inst.instance, map, 'the same map');
  assert.equal(map.layer.markers.length, 1);
  assert.equal(inst.$node.querySelector('[data-vf-keep="host"]').getAttribute('role'), 'region');
  inst.destroy();
  assert.equal(map.removed, true);
  assert.equal(L.maps, 0, 'every map removed');
});
