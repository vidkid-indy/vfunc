// SPDX-License-Identifier: Apache-2.0
//
// L1 — an app wrapper: your own factory with the props your screens need (places, a selection
// callback). The contract is yours; keep it small. Colors come from the tokens (rule 21).
/* global L */

export function vfPlacesMap(vf, props) {
  const p = props || {};
  let map = null;
  let layer = null;

  function draw() {
    if (!map) return;
    if (layer) layer.remove();
    const color = window.getComputedStyle(document.documentElement).getPropertyValue('--vf-color-primary').trim();
    layer = L.layerGroup((p.places || []).map((place) =>
      L.circleMarker([place.lat, place.lng], { radius: 7, color: color, fillColor: color, fillOpacity: 0.6 })
        .bindTooltip(vf.esc(place.name)) // Leaflet tooltips take HTML: escape the text (XSS)
        .on('click', () => { if (p.onSelect) p.onSelect(place); })));
    layer.addTo(map);
  }

  return vf.vfunc({
    render: () => vf.html`<div class="byol-map" data-vf-keep="map"></div>`,
    methods: {
      setPlaces(places) {
        p.places = places;
        draw();
      }
    },
    onMount(self) {
      map = L.map(self.$node.querySelector('[data-vf-keep="map"]'), { attributionControl: false }).setView(p.center || [37.55, 126.99], p.zoom || 11);
      draw();
    },
    onDestroy() {
      if (map) map.remove();
      map = null;
      layer = null;
    }
  });
}
