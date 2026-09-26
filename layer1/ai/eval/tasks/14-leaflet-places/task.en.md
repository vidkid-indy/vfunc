### Leaflet as an app wrapper (L1)

`LIBRARY`: `leaflet@1.9.4` (already loaded by `index.html` as the global `L`; do not change `index.html`). `DOCS`: the Leaflet 1.9 API (`L.map`, `L.circleMarker`, `bindTooltip`, `setStyle`, `map.remove()`). `LEVEL`: **L1** (an app wrapper).

`REQUEST`: Write the map component in `places-map.js` and use it from `app.js` with the `PLACES` data.

**The wrapper**
- `places-map.js` puts a factory `app.vfPlacesMap(props)` on the app's own global object `app` (create `window.app` if it does not exist). Nothing is added to `vf`.
- Props: `places` (`[{ id, name, lat, lng }]`) and `onSelect`, called as `onSelect({ sender, event, data: { id } })` when a marker is clicked.
- It returns a vfunc instance whose Leaflet map lives in an element with `data-vf-keep`, is created when the instance is mounted and is removed (`map.remove()`) when the instance is destroyed. The instance has a method `select(id)`.
- The map shows every place (fit it to the bounds of the markers).
- One `L.circleMarker` per place, no tile layer (the page has no network access for tiles). Each marker has a tooltip with the place name **as text** (the names may contain `<`). The marker colors come from the token `--vf-color-primary`.
- The selected marker has `fillOpacity: 1`, the others `fillOpacity: 0.4` (at the start none is selected).

**The page** (`app.js`)
- Mount the map into `#map-slot`.
- A marker click and a list button (`data-action="select"` with `data-id`) both select that place: the marker is highlighted and `[data-ref="current"]` shows `Selected: <name>` (as text).
- The header button `data-action="toggle-map"` destroys the map instance (no Leaflet map remains in the page) and changes its text to `Show map`; clicking again creates a new instance with nothing selected, and the text goes back to `Hide map`.
