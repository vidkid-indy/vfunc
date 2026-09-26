# Third-party integration

How to use existing libraries — maps, editors, charts, grids — in a vfunc app. There are four official adapters; for any other library, follow the steps below. Layer 2 is a preview and is published on npm with 1.0.0.

## Integration levels

| Level | When | Result |
|---|---|---|
| L0 direct use | one screen | the vendor object created inside `vf.vfunc({ onMount, onUpdate, onDestroy })` |
| L1 app wrapper | several screens of one app | your app's `vfXxx(props)` factory with the props it needs |
| L2 contract adapter | swap engines by name, contribute it | `vf{Kind}{Vendor}` that keeps the kind's contract and passes the contract tests |

A Leaflet sample with the three levels side by side is in `layer2/examples/third-party-custom/`.

## Official adapters

They keep the same contracts as the built-in `vf.vfGrid` and `vf.vfChart`, so switching is a change of name. The vendor library is not bundled: the app loads it first (pass it as `lib` or use its global).

| Adapter | File | Vendor (checked version) | License | IE11 |
|---|---|---|---|---|
| `vf.vfGridAg` | `vfunc-grid-ag.js` | AG Grid Community 36.2.0 | MIT | no |
| `vf.vfGridTabulator` | `vfunc-grid-tabulator.js` | Tabulator 6.5.3 | MIT | no |
| `vf.vfChartChartjs` | `vfunc-chart-chartjs.js` | Chart.js 4.5.1 | MIT | no |
| `vf.vfChartEcharts` | `vfunc-chart-echarts.js` | Apache ECharts 6.1.0 | Apache-2.0 | no |

```html
<script src="https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js"
        integrity="sha384-C2iskrW/uPW46KzOjrvJIQo4YkV8lkD+QS0CrDN18IIPIpT/g2USu8bTP3nvmIAD" crossorigin="anonymous"></script>
<script src="vfunc.min.js"></script>
<script src="vfunc-chart-echarts.min.js"></script>
```

- For IE11, use the built-in `vfGrid` and `vfChart`: the current versions of the four vendors do not support it.
- AG Grid Enterprise features need a separate commercial license from AG Grid; the adapter uses Community only.
- AG Grid 33 and later inject their own `<style>` elements and use `data:` images for the theme icons. Pick the page's CSP for your case. In every case `script-src` has no `'unsafe-inline'`.
  - **The server can make a nonce for every response (stays strict):** load `ag-grid-community.min.noStyle.js`, which injects no styles when it loads, and pass the same nonce as `options: { styleNonce: nonce }`. The CSP is `style-src 'self' 'nonce-…'; img-src 'self' data:`. Make a new nonce for every request; never a fixed value.
  - **A static page (no nonce):** `ag-grid-community.min.js` with `style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:`. This file also injects the legacy theme CSS and icon fonts when it loads.
  - **A static page whose `style-src` must stay strict too:** use `vf.vfGridTabulator` or the built-in `vf.vfGrid` instead of AG Grid.
- Chart.js cannot change the type of a chart in place, so `setType` creates a new chart; `.instance` is always the current one.
- Colors come from the `--vf-chart-1`–`8` tokens, so charts follow the dark theme.

## Steps

The numbers match the `TODO(n)` comments of the adapter template `layer2/adapters/_template/vfunc-kind-vendor.js`.

1. **License:** MIT, Apache-2.0, BSD and ISC can be used as they are. The GPL family affects how the app may ship. Revenue-based or commercial-only licenses are out. Add it to the app's NOTICE.
2. **Version and loading:** from a CDN, an exact version with `integrity` (SRI) and `crossorigin`. The library from the `lib` prop, else its global. Wait for asynchronous loading.
3. **Host element:** mark the element the vendor draws in with `data-vf-keep`. Never mix vendor DOM into `render` output.
4. **Create** in `onMount`, from props turned into vendor options.
5. **Update:** methods such as `setData` call the vendor's update API; do not create it again.
6. **Events:** vendor events go to props callbacks as `{ sender, event, data }`.
7. **Destroy** in `onDestroy`: the vendor's destroy, and every listener, observer, subscription and timer you added.
8. **Size:** `ResizeObserver` (else window resize) calls the vendor's resize.
9. **Theme:** read the `--vf-*` tokens and pass them as the vendor's colors and fonts; no color values in JS.
10. **Locale:** `vf.i18n.subscribe` changes the vendor's locale.
11. **XSS:** where the vendor takes HTML strings, give it `vf.esc` text or nodes built with `vf.html`.
12. **`.instance`:** expose the vendor object; say its features are outside the contract.
13. **Browsers:** state the vendor's support as it is.
14. **Check:** pass the contract tests, make a sample page, and create and destroy it 100 times to look for leaks.

## Common traps

- The vendor DOM disappears when a parent refreshes → use `data-vf-keep`
- Initialized twice when mounted again
- A document listener or a timer survives destroy
- Creating it before the library has loaded
- XSS through a vendor renderer or tooltip
- A strict CSP blocks a library that injects styles or fonts

## Contract tests

Give the `base`, `grid` and `chart` suites in `layer2/adapters/_contract/` a factory and functions that press the UI, and they check the contract. The base contract checks `.instance`, `refresh`, `destroy` (twice), `lib` injection, the callback shape, listeners and timers left after 100 create/destroy cycles, survival of a parent refresh, and no logged errors.

- node + happy-dom: a small mock of the vendor checks the adapter's wiring.
- Browser: `contract.html` runs the same suites with the real vendors from the CDN. The official adapters pass in Chromium, Firefox and WebKit.

## Bringing it in with AI

Give the prompt `layer2/ai/en/prompt-integrate-third-party.md` (Korean: `layer2/ai/ko/…`) the library name and exact version, its documentation link and the level you want: it writes the component or adapter, a sample page and the contract test setup by the steps above. Check the result with the contract tests.
