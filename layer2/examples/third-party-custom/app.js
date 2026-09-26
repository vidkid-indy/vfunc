// SPDX-License-Identifier: Apache-2.0
//
// The Leaflet sample page: the same places at levels L0, L1 and L2 of the third-party guide.
/* global vf */

import { mapL0 } from './l0.js';
import { vfPlacesMap } from './l1.js';
import { vfMapLeaflet } from './vfunc-map-leaflet.js';

const PLACES = [
  { id: 'city-hall', name: 'Seoul City Hall', lat: 37.5663, lng: 126.9779 },
  { id: 'namsan', name: 'N Seoul Tower', lat: 37.5512, lng: 126.9882 },
  { id: 'coex', name: 'COEX', lat: 37.5115, lng: 127.0595 }
];

function log(text) {
  vf.$('#log').textContent = text;
}

mapL0(vf, log).mount('#map-l0');

vfPlacesMap(vf, { places: PLACES, onSelect: (place) => log('l1 select ' + place.id) }).mount('#map-l1');

const map = vfMapLeaflet(vf, {
  id: 'places-map',
  label: 'Places in Seoul',
  markers: PLACES.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, label: p.name })),
  onMarkerClick: (e) => log('l2 marker ' + e.data.marker.id)
});
map.mount('#map-l2');

vf.attach('#l2-buttons', {
  render: () => vf.html`${vf.vsButton({ label: 'Only COEX', action: 'only-coex', id: 'only-coex' })}${vf.vsButton({ label: 'All places', action: 'all', id: 'all-places' })}`,
  delegates: [
    { selector: '[data-action="only-coex"]', eventType: 'click', onEvent: () => { map.setMarkers([{ id: 'coex', lat: 37.5115, lng: 127.0595, label: 'COEX' }]); log('l2 markers 1'); } },
    { selector: '[data-action="all"]', eventType: 'click', onEvent: () => { map.setMarkers(PLACES.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, label: p.name }))); log('l2 markers 3'); } }
  ]
});
