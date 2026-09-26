// SPDX-License-Identifier: Apache-2.0
//
// L0 — Leaflet used directly in one component: create the map in onMount (the element is in the
// page), remove it in onDestroy. The map lives in a data-vf-keep element, so a refresh keeps it.
/* global L */

export function mapL0(vf, log) {
  let map = null;
  return vf.vfunc({
    render: () => vf.html`<div class="byol-map" data-vf-keep="map" id="l0-host"></div>`,
    onMount(self) {
      map = L.map(self.$node.querySelector('[data-vf-keep="map"]'), { attributionControl: false }).setView([37.5665, 126.978], 11);
      L.circleMarker([37.5665, 126.978], { radius: 8 }).addTo(map).on('click', () => log('l0 click Seoul'));
    },
    onDestroy() {
      if (map) map.remove();
      map = null;
    }
  });
}
