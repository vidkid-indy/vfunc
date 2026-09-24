# Examples

All 21 examples run without a build, and each folder's README explains it. Every example follows the rules — CSP meta tag, external scripts, `data-action` / `data-ref`, `vf.html`, token-only CSS — and the repository's browser tests check for zero console errors or warnings and the main behaviour.

{{examples}}

- 12, 13 and 15 load Bootstrap, Tailwind and Chart.js from a CDN with exact versions and SRI (network needed).
- 16 is for IE11 / Edge IE mode: reopen it in IE mode in Edge to check.
- 14 is a published dashboard converted with the AI prompt; `before/` is the page exactly as delivered.

To run them yourself, clone the repository, run `python -m http.server 8080` at its root and open `http://localhost:8080/layer1/examples/`.
