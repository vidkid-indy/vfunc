# Deployment and cache

## Files

| File | Use |
|---|---|
| `vfunc.js` / `vfunc.min.js` | `<script>` development / production (global `vf`) |
| `vfunc.esm.js` / `vfunc.esm.min.js` | ES module development / production |
| `vfunc.legacy.min.js` | IE11 / Edge IE mode |
| `plugins/update.min.js`, `plugins/update.esm.js` | the update plugin |
| `css/vfunc.tokens.css` | optional tokens |

Every file has a source map. Files are minified, never obfuscated.

## CDN: exact version + SRI

{{install}}

`integrity` values differ per version and file; the ones above belong to the version this site was built from. Never load polyfills from a third-party CDN.

## Making every release arrive

Without a build there are no hashed file names, and `app.js?v=2` does not reach the modules it imports. Use four layers together:

1. **Cache headers**: `index.html` and `version.json` with `Cache-Control: no-cache`.
2. **Version folders**: copy each release into `/1.0.3/…` and point `index.html` at it. Every sub-module becomes the new version at once. The starter's `node tools/release.mjs 1.0.3` does it by copying only.
3. **The update plugin**: open pages switch to the new version on the next screen change.
4. **Pinned versions**: exact versions + SRI for every file from another domain.

| Path | Cache-Control |
|---|---|
| `/index.html`, `/version.json` | `no-cache` |
| `/<version>/…` | `public, max-age=31536000, immutable` |

Settings for Apache, Nginx, IIS, Tomcat, Netlify and GitHub Pages are in the starter's `deploy/` folder.

## Service Workers

The most common cause of "the update never arrives". Add one only if you need offline use: keep HTML network-first and prepare a way to unregister it.

## Security checklist

- Every page has a CSP meta tag without `'unsafe-inline'` in `script-src`; scripts and styles live in files.
- Permissions are checked on the server; no secrets in frontend code.
- User input and server data reach markup only through `vf.html`.
