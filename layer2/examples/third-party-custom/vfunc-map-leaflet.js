// SPDX-License-Identifier: Apache-2.0
//
// L2 — vfMapLeaflet: a Leaflet (BSD-2-Clause) adapter that keeps the base contract of the adapter
// kit, made from layer2/adapters/_template (the TODO numbers below). It passes the base contract
// suite (layer2/test/third-party.test.js with a mock Leaflet; the page shows the real one).
// Leaflet 1.9 is not bundled: load it (dist/leaflet.js → global L, dist/leaflet.css) or pass `lib`.
//
// Props: center [lat, lng], zoom, markers [{ id, lat, lng, label }], label (the map's aria-label),
// onMarkerClick ({ sender, event, data: { marker } }), lib.
// Methods: setMarkers(markers), setView(center, zoom), resize(), refresh(), destroy(); .instance = L.Map.

export function vfMapLeaflet(vf, props) {
  const p = props || {};
  let map = null;
  let layer = null;
  let stopSize = null;
  let stopLocale = null;

  function lib() {
    // TODO(2) done: `lib` first, then the global.
    const L = p.lib || (typeof window !== 'undefined' ? window.L : null);
    if (!L) throw new Error('[sample] vfMapLeaflet: load Leaflet first or pass it as `lib`.');
    return L;
  }

  function emit(callback, event, data) {
    // TODO(6) done: { sender, event, data }.
    if (typeof callback === 'function') callback({ sender: instance, event: event || null, data: data || {} });
  }

  function drawMarkers(L) {
    if (!map) return;
    if (layer) layer.remove();
    // TODO(9) done: the color from a token.
    const color = window.getComputedStyle(document.documentElement).getPropertyValue('--vf-chart-1').trim() || undefined;
    layer = L.layerGroup((instance.state.markers || []).map((m) =>
      L.circleMarker([m.lat, m.lng], { radius: 8, color: color, fillColor: color, fillOpacity: 0.7 })
        .bindTooltip(vf.esc(m.label || '')) // TODO(11) done: Leaflet takes HTML, so the text is escaped.
        .on('click', (e) => emit(p.onMarkerClick, e.originalEvent, { marker: m }))));
    layer.addTo(map);
  }

  const instance = vf.vfunc({
    replaceRoot: true,
    state: { id: p.id || 'map-leaflet', markers: (p.markers || []).slice(), instance: null },
    // TODO(3) done: Leaflet draws only inside the data-vf-keep host.
    render: (s) => vf.html`<div class="vf-adapter vf-map-leaflet" id="${s.id}"><div class="vf-adapter__host" data-vf-keep="host" role="region" aria-label="${p.label || vf.t('chart.label')}"></div></div>`,
    methods: {
      // TODO(5) done: updates go through Leaflet; the map is not created again.
      setMarkers(markers) {
        this.state.markers = (markers || []).slice();
        if (map) drawMarkers(lib());
      },
      setView(center, zoom) { if (map) map.setView(center, zoom == null ? map.getZoom() : zoom); },
      resize() { if (map) map.invalidateSize(); }
    },
    onMount(self) {
      const L = lib();
      const host = self.$node.querySelector('[data-vf-keep="host"]');
      // TODO(4) done: created when the element is in the page.
      map = L.map(host, { attributionControl: false }).setView(p.center || [37.55, 126.99], p.zoom == null ? 11 : p.zoom);
      self.state.instance = map; // TODO(12) done
      drawMarkers(L);
      // TODO(8) done: size changes.
      if (typeof ResizeObserver === 'function') {
        const observer = new ResizeObserver(() => { if (map) map.invalidateSize(); });
        observer.observe(host);
        stopSize = () => observer.disconnect();
      } else {
        const onResize = () => { if (map) map.invalidateSize(); };
        window.addEventListener('resize', onResize);
        stopSize = () => window.removeEventListener('resize', onResize);
      }
      // TODO(10) done: the region's name follows the locale when no label is given.
      stopLocale = vf.i18n.subscribe(() => { if (!p.label) host.setAttribute('aria-label', vf.t('chart.label')); });
    },
    onDestroy(self) {
      // TODO(7) done: everything added is released.
      if (stopLocale) stopLocale();
      if (stopSize) stopSize();
      if (map) map.remove();
      map = null;
      layer = null;
      stopSize = null;
      stopLocale = null;
      self.state.instance = null;
    }
  });
  return instance;
}

// TODO(13) done: Leaflet 1.9 supports current browsers (not IE11 in this sample, which is an ES module).
// TODO(14) done: base contract suite, this page, 100 create/destroy cycles in the suite.
