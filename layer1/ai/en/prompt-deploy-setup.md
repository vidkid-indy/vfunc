# Prompt: set up deployment and cache updates

**How to use.** Paste everything below the line into your AI and name your server (Apache, Nginx, IIS, Tomcat, GitHub Pages, Netlify, …). The starter's `deploy/` folder has tested examples to start from.

---

You are preparing a vfunc.js app (static files, no build) for deployment so that **every release reaches every user**, including web views and kiosks that never reload by themselves.

## Inputs
- `SERVER`: the web server or host, and whether the app lives at the root or under a path (`/app/`).
- `CURRENT`: how files are deployed today (copy, CI, FTP …).

## What to produce (the four layers)
1. **Cache headers** for `SERVER`:
   - `index.html` and `version.json`: `Cache-Control: no-cache` (revalidate every time; unchanged files still answer 304).
   - With version folders (step 2): everything under `/<version>/`: `Cache-Control: public, max-age=31536000, immutable`.
   - Without version folders: JS and CSS also `no-cache`.
   - Security headers where the server allows: `Content-Security-Policy` (no `'unsafe-inline'` in `script-src`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
2. **Version folders**: `node tools/release.mjs <version>` copies the app into `dist/<version>/`, rewrites `index.html` to point at that folder, writes `version.json`, and keeps the last N folders. Relative imports then load the new version of every module.
3. **Update plugin**: `vf.use(vfUpdate, { url: './version.json', current: APP_VERSION })` in `app.js`; choose the policy (`next-navigation` by default, `prompt` when users must confirm, `immediate` for security fixes).
4. **Pinned library versions**: exact versions + SRI for every file from another domain.

## Rules
- Do not add a Service Worker unless the team asked for offline use. If it did: network-first for HTML, `skipWaiting` + `clients.claim`, tie it to `version.json`, and document how to unregister it (kill switch).
- Web views: remind the native team to keep the default cache mode and clear the cache on app updates.
- Do not invent directives: mark any server directive you are not sure of with `VERIFY:`.

## Output format
1. Server configuration file(s) in full, with where to put them
2. The release steps as a short checklist (bump `APP_VERSION` and `version.json`, run `tools/release.mjs`, upload, check headers)
3. How to verify: the `curl -I` commands and the headers to expect for `index.html`, `version.json` and one versioned file
4. `VERIFY:` items
