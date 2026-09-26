Reference answer for the grader tests (not part of any bundle).

### places-map.js

```js
// L1 app wrapper for Leaflet 1.9.4 (BSD-2-Clause): app.vfPlacesMap(props). Not on vf (reserved).
/* global L */
(function () {
  'use strict';

  const app = window.app || (window.app = {});
  const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  app.vfPlacesMap = function vfPlacesMap(props) {
    const p = props || {};
    let map = null;       // owned by this instance (closure), not an instance property
    let markers = {};

    function highlight(id) {
      for (const key of Object.keys(markers)) markers[key].setStyle({ fillOpacity: key === id ? 1 : 0.4 });
    }

    const self = vf.vfunc({
      render: () => vf.html`<div class="places-map" data-vf-keep="map"></div>`,
      methods: {
        select(id) { highlight(String(id)); }
      },
      onMount(inst) {
        const host = inst.$node.querySelector('[data-vf-keep="map"]');
        map = L.map(host, { attributionControl: false });
        const color = token('--vf-color-primary');
        const bounds = [];
        for (const place of p.places || []) {
          const marker = L.circleMarker([place.lat, place.lng], { radius: 9, color: color, fillColor: color, fillOpacity: 0.4 })
            .bindTooltip(vf.esc(place.name)) // Leaflet tooltips take HTML: escape the name (XSS)
            .on('click', (ev) => {
              highlight(place.id);
              if (p.onSelect) p.onSelect({ sender: self, event: ev.originalEvent || null, data: { id: place.id } });
            })
            .addTo(map);
          markers[place.id] = marker;
          bounds.push([place.lat, place.lng]);
        }
        if (bounds.length) map.fitBounds(bounds, { padding: [40, 40] });
      },
      onDestroy() {
        if (map) map.remove(); // removes the markers and their listeners
        map = null;
        markers = {};
      }
    });
    return self;
  };
}());
```

### app.js

```js
// Places — the page script. Leaflet is loaded as the global `L`.
const PLACES = [
  { id: 'p1', name: 'Seoul Station', lat: 37.5547, lng: 126.9707 },
  { id: 'p2', name: 'Cafe <b>Moon</b>', lat: 37.5665, lng: 126.978 },
  { id: 'p3', name: 'Namsan Tower', lat: 37.5512, lng: 126.9882 }
];

(function () {
  'use strict';

  const current = vf.$('[data-ref="current"]');
  const toggle = vf.$('[data-action="toggle-map"]');
  let map = null;

  function show(id) {
    const place = PLACES.filter((x) => x.id === id)[0];
    current.textContent = place ? 'Selected: ' + place.name : 'No place selected';
  }

  function create() {
    map = app.vfPlacesMap({ places: PLACES, onSelect: (e) => show(e.data.id) });
    map.mount('#map-slot');
  }
  create();

  vf.attach('#places', {
    delegates: [{
      selector: '[data-action="select"]',
      eventType: 'click',
      onEvent: (e) => {
        const id = e.target.getAttribute('data-id');
        if (map) map.select(id);
        show(id);
      }
    }]
  });

  toggle.addEventListener('click', () => {
    if (map) {
      map.destroy();
      map = null;
      toggle.textContent = 'Show map';
    } else {
      create();
      toggle.textContent = 'Hide map';
    }
  });
}());
```

### REPORT.md

Reference answer. License: BSD-2-Clause (allowed; mention it in the app's NOTICE). Level L1: an app wrapper on the app's own `app` object. The map is created in onMount inside a data-vf-keep element and removed in onDestroy; tooltips escape the names; the marker color comes from `--vf-color-primary`.
