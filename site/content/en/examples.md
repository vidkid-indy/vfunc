# Examples

The 21 engine examples (layer 1) and the 7 component examples (layer 2) all run without a build, and each folder's README explains it. Every example follows the rules — CSP meta tag, external scripts, `data-action` / `data-ref`, `vf.html`, token-only CSS — and the repository's browser tests check for zero console errors or warnings and the main behaviour.

{{examples}}

- Layer 1's 12, 13 and 15 and layer 2's dashboard and third-party-custom load Bootstrap, Tailwind, Chart.js, Tabulator and Leaflet from a CDN with exact versions and SRI (network needed).
- Layer 1's 16 and layer 2's legacy-ie are for IE11 / Edge IE mode: reopen them in IE mode in Edge to check. legacy-ie is a dashboard with layer 2 instances that also runs in IE.
- Layer 1's 14 is a published dashboard converted with the AI prompt; `before/` is the page exactly as delivered.
- Layer 2's custom-component shows your own components built from the official ones (extension level C3).

To run them yourself, clone the repository, run `python -m http.server 8080` at its root and open `http://localhost:8080/layer1/examples/` and `http://localhost:8080/layer2/examples/`.
