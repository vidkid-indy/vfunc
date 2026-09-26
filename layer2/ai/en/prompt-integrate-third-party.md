# Prompt: bring a third-party library into vfunc.js

**How to use.** Paste everything below the line into your AI with the library name and version, its documentation link or type definitions, and the level you want. The AI should also have `llms.txt` (layer 1) and the adapter template `layer2/adapters/_template/vfunc-kind-vendor.js`.

---

You are wrapping a third-party browser library (a map, an editor, a date picker, a chart, a grid …) so a vfunc.js app can use it. Follow the steps in order and do not skip the checks.

## Inputs
- `LIBRARY`: the name and the **exact version** (for example `leaflet@1.9.4`).
- `DOCS`: its documentation URL or type definitions. Use only APIs you can see there; if something is missing, ask.
- `LEVEL`: L0, L1 or L2 (below). If it is not given, recommend one and wait.
- `KIND` (L2 only): `grid`, `chart`, `editor`, or another kind (base contract only).

## Levels
| Level | When | Result |
|---|---|---|
| L0 direct use | one screen | a `vf.vfunc({ onMount, onUpdate, onDestroy })` component that creates the vendor object itself |
| L1 app wrapper | several screens of one app | an app factory `vfXxx(props)` with the props the app needs |
| L2 contract adapter | swap engines by name, or contribute it | `vf<Kind><Vendor>` that keeps the kind's contract and passes the contract tests |

## Steps
1. **License.** MIT, Apache-2.0, BSD and ISC can be used. GPL/LGPL/AGPL change how the app may ship: say so and stop. Revenue-based or commercial-only licenses are out. Tell the user to add the library to the app's NOTICE.
2. **Version and loading.** A CDN `<script>` with the exact version, `integrity` (SRI) and `crossorigin`, or an ES module import. Take the library from `props.lib` first, then its global. If it loads asynchronously, wait for it.
3. **Host element.** The vendor draws only inside an element marked `data-vf-keep`. Never put vendor DOM into `render` output.
4. **Create** the vendor object in `onMount` (the element is in the page), from props turned into vendor options.
5. **Update** through the vendor's API (`setData` → the vendor's update call). Do not create the vendor object again, except where the vendor cannot change something in place (say which and why).
6. **Events.** Vendor events become props callbacks that receive `{ sender, event, data }`.
7. **Destroy** in `onDestroy`: the vendor's destroy call, and every listener, observer, subscription and timer you added.
8. **Size.** `ResizeObserver` on the host, else `window` resize, calling the vendor's resize.
9. **Theme.** Give the vendor colors and fonts from the `--vf-*` tokens (`getComputedStyle(document.documentElement).getPropertyValue(...)`). No color literals in JS.
10. **Locale.** `vf.i18n.subscribe` → the vendor's locale or texts; visible text comes from message keys.
11. **XSS.** Where the vendor takes HTML strings (cells, tooltips, popups, labels), pass `vf.esc(text)` or a DOM node built from `vf.html` markup, never raw data.
12. **`.instance`.** Expose the vendor object (`state.instance`), and say that its features are outside the contract.
13. **Browsers.** State the vendor's browser support; most current libraries do not support IE11 (point IE users to the built-in `vf.vfGrid` / `vf.vfChart`).
14. **Check.** L2: run the contract suites in `layer2/adapters/_contract` (node with a small mock of the library, and `contract.html` in browsers with the real one); every level: a sample page with no console errors, and 100 create/destroy cycles without leaks.

## Contracts (L2)
- **Base (every kind):** `.instance`, `refresh()`, `destroy()` (twice is safe), `lib` injection, callbacks with `{ sender, event, data }`, nothing left after destroy, survives a parent refresh.
- **Grid:** props `columns [{ key, label, align, sortable, render(row) }]`, `data`, `pageSize`, `selectable`, `height`, `onRowClick`, `onSelect`, `onSort`, `options`, `lib`; methods `setData`, `getData`, `setColumns`, `getSelection`, `clearSelection`, `setPage`, `refresh`, `destroy`.
- **Chart:** props `type ('bar' | 'line' | 'area' | 'pie' | 'donut')`, `data { labels, series: [{ name, data }] }`, `height`, `onClick`, `options`, `lib`; methods `setData`, `setType`, `resize`, `destroy`. Colors from `--vf-chart-1 … 8`.
- **Editor:** `getValue`, `setValue`, `setReadOnly`, `focus`, `onChange`.

## Common traps
- The vendor DOM disappears when a parent refreshes → it is not inside `data-vf-keep`.
- Initialized twice on a second mount → create only in `onMount`, and only once per mount.
- A `document` listener or a timer survives `destroy`.
- Creating the vendor object before its library has loaded.
- XSS through a vendor renderer or tooltip that takes HTML.
- A strict CSP blocks a library that injects `<style>` or fonts (for example AG Grid 33+): say which CSP directives the page needs; if the library takes a nonce option (AG Grid: `styleNonce` with its noStyle build), show the nonce setup first; `script-src` stays without `'unsafe-inline'`.

## Output format
1. License verdict and the level (asked or recommended)
2. Loading snippet (CDN tags with SRI, or the import)
3. The component or adapter file, complete, with the step numbers as comments
4. A sample page (HTML with a CSP meta tag, external script) that uses it
5. L2: the contract test setup (mock library, actions) for `layer2/adapters/_contract`
6. Report: the checklist result and what you could not verify

## Checklist
- [ ] License allowed and named; NOTICE mentioned
- [ ] Exact version, SRI and `crossorigin` on CDN tags
- [ ] Vendor DOM only inside `data-vf-keep`; created in `onMount`, destroyed in `onDestroy`
- [ ] Updates without re-creating (or the exception explained)
- [ ] Callbacks receive `{ sender, event, data }`
- [ ] Colors from tokens; visible text from message keys
- [ ] HTML given to the vendor escaped or built with `vf.html`
- [ ] `.instance` exposed; browser support stated
- [ ] No console errors or warnings; 100 create/destroy cycles clean
