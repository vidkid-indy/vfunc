# Evaluation results — Claude Sonnet 5

| | |
|---|---|
| Model | Claude Sonnet 5 (claude-sonnet-5) |
| Service | Claude Code subagent (reads the bundle, writes the answer; no other tools) |
| Run date | 2026-09-26 |
| Language | ko |
| Kit version (run) | 1.0.0-rc.8 |
| Graded | 2026-09-26 with vfunc.js 1.0.0-rc.8 in chromium, firefox, webkit |
| Settings | Fourteen tasks with the Korean bundles (Korean kit: AGENTS ko, llms.ko.txt, ko prompts, Korean task texts; the layer 2 tasks add ai/ko/components.md and the layer 2 lib/ files). One new session per task, no follow-up messages, unedited answers. A session limit (HTTP 429) stopped the sessions of tasks 03, 05, 06, 07 and 08 after they had written their complete answers (each ends with REPORT.md and closes every code block); they were not run again. Manual scores are not filled in yet. |

**9 / 14 tasks passed · 101 / 109 checks passed**

| Task | Checks | Static errors | Follow-ups | Pass |
|---|---|---|---|---|
| 01-counter-greeting | 8 / 8 | 1 | 0 | **no** |
| 02-todo | 9 / 9 | 0 | 0 | yes |
| 03-dashboard-conversion | 9 / 10 | 2 | 0 | **no** |
| 04-signup-form | 8 / 8 | 0 | 0 | yes |
| 05-server-list | 8 / 8 | 0 | 0 | yes |
| 06-spa-scaffold | 1 / 8 | 4 | 0 | **no** |
| 07-react-port | 9 / 9 | 0 | 0 | yes |
| 08-chartjs | 6 / 6 | 0 | 0 | yes |
| 09-design-apply | 8 / 8 | 0 | 0 | yes |
| 10-bug-fix | 9 / 9 | 2 | 0 | **no** |
| 11-admin-dashboard | 7 / 7 | 0 | 0 | yes |
| 12-profile-form | 6 / 6 | 0 | 0 | yes |
| 13-delete-confirm | 7 / 7 | 0 | 0 | yes |
| 14-leaflet-places | 6 / 6 | 1 | 0 | **no** |

## 01-counter-greeting — Counter and greeting

Answer: `answers/01.md` · files: `index.html`, `app.js`, `style.css`

All checks passed.

Static findings:

- error `css-raw` style.css lines 4, 5, 23, 25, 30, 35, 38, 39, 48, 59, 63, 74, 76, 77 — raw color outside tokens.css
- warn `css-raw` style.css lines 3, 12, 21, 22, 24, 34, 36, 68, 73, 73, 75 — raw size outside tokens.css

Manual review:

- notes: All behaviour checks pass; the new style.css uses raw colors instead of tokens.


## 02-todo — To-do list

Answer: `answers/02.md` · files: `app.js`

All checks passed.


## 03-dashboard-conversion — Convert a published dashboard

Answer: `answers/03.md` · files: `index.html`, `app.js`

Failed checks:

- no console errors or warnings: chromium: console.error: [vfunc] vf.html: "" is not allowed as an interpolated tag name.; firefox: console.error: [vfunc] vf.html: "" is not allowed as an interpolated tag name.; webkit: console.error: [vfunc] vf.html: "" is not allowed as an interpolated tag name.

Static findings:

- error `class-selector` app.js lines 22, 82, 119 — var userMenu = vf.attach(vf.$('.topbar__user'), {
- error `html-string` app.js lines 73, 73 — markup built by string concatenation

Manual review:

- notes: One console error (an empty interpolated tag name in vf.html); vf.attach targets found by class (vf.$('.topbar__user')); markup built by concatenation.


## 04-signup-form — Sign-up form validation

Answer: `answers/04.md` · files: `index.html`, `app.js`, `style.css`

All checks passed.


## 05-server-list — Server list: loading, error, empty and untrusted data

Answer: `answers/05.md` · files: `app.js`, `style.css`

All checks passed.


## 06-spa-scaffold — SPA scaffold: router, store, two languages

Answer: `answers/06.md` · files: `index.html`, `app.js`, `store.js`, `api.js`, `pages/home.js`, `pages/servers.js`, `pages/server.js`, `pages/not-found.js`, `locales/en.json`, `locales/ko.json`, `styles/tokens.css`, `styles/base.css`, `styles/components/nav.css`, `styles/pages/servers.css`, `styles/pages/server.css`

Failed checks:

- home: title, intro and the current nav link: chromium: #view h1: expected "Status board", got "(no element)"; firefox: #view h1: expected "Status board", got "(no element)"; webkit: #view h1: expected "Status board", got "(no element)"
- a nav link opens the server list and moves the focus to #view: chromium: #view h1: expected "Status board", got "(no element)"; firefox: #view h1: expected "Status board", got "(no element)"; webkit: #view h1: expected "Status board", got "(no element)"
- server pages open by URL; unknown ids and routes show their messages: chromium: #view h1: expected "Oregon batch", got "(no element)"; firefox: #view h1: expected "Oregon batch", got "(no element)"; webkit: #view h1: expected "Oregon batch", got "(no element)"
- favorites are shared state that survives navigation: chromium: [data-action="favorite"]: expected "Add to favorites", got "(no element)"; firefox: [data-action="favorite"]: expected "Add to favorites", got "(no element)"; webkit: [data-action="favorite"]: expected "Add to favorites", got "(no element)"
- switching to Korean translates everything, sets <html lang> and survives a reload: chromium: #view h1: expected "Status board", got "(no element)"; firefox: #view h1: expected "Status board", got "(no element)"; webkit: #view h1: expected "Status board", got "(no element)"
- a language switch keeps the favorites (partial store update): chromium: #view h1: expected "Frankfurt API", got "(no element)"; firefox: #view h1: expected "Frankfurt API", got "(no element)"; webkit: #view h1: expected "Frankfurt API", got "(no element)"
- no console errors or warnings: chromium: console.error: [vfunc] error: ReferenceError: Cannot access 'storeUnsubscribe' before initialization     at vfunc.onMount (http://127.0.0.1:10101/06-spa-scaffold/app.js:86:24)     at safeCall (http://127.0.0.1:10101/06-spa-scaffold/lib/vfunc.esm.js:31:15)     at proto._hook (http://127.0.0.1:10101/06-spa-scaffold/lib/vfunc.esm.js:647:11)     at proto._mountHook (http://127.0.0.1:10101/06-spa-scaffold/lib/vfunc.esm.js:973:8)     at Object.attach (http://127.0.0.1:10101/06-spa-scaffold/lib/vfunc.esm.js:1023:12)     at main (http://127.0.0.1:10101/06-spa-scaffold/app.js:48:20); firefox: console.error: [vfunc] error: JSHandle@object; webkit: console.error: [vfunc] error: ReferenceError: Cannot access 'storeUnsubscribe' before initialization.

Static findings:

- error `css-raw` styles/base.css lines 5, 6 — raw color outside tokens.css
- error `css-raw` styles/components/nav.css lines 8, 17, 22, 30, 39, 40, 46, 47, 48 — raw color outside tokens.css
- error `css-raw` styles/pages/server.css lines 9, 13, 17, 21, 25, 26, 32, 33, 34 — raw color outside tokens.css
- error `css-raw` styles/pages/servers.css lines 15, 20, 24, 28, 32, 37, 41 — raw color outside tokens.css

Manual review:

- notes: onMount reads a variable declared later (ReferenceError), so no page renders; raw colors in the new CSS files.


## 07-react-port — Port a React component

Answer: `answers/07.md` · files: `index.html`, `app.js`, `styles/product-filter.css`

All checks passed.


## 08-chartjs — Chart.js inside a component

Answer: `answers/08.md` · files: `app.js`, `style.css`

All checks passed.


## 09-design-apply — Apply a DESIGN.md without touching JS

Answer: `answers/09.md` · files: `styles/tokens.css`, `styles/app.css`, `design/STATUS.md`

All checks passed.


## 10-bug-fix — Fix seven bugs

Answer: `answers/10.md` · files: `app.js`, `store.js`

All checks passed.

Static findings:

- error `html-string` app.js:73 — e.sender.refs['comment-list'].innerHTML = comments.map((c) => vf.html`<li class="comments__item">${c}</li>`).join('');
- error `instance-property` app.js:93 — inst._timer = setInterval(() => {

Manual review:

- notes: All seven bugs fixed; the comment list is vf.html items joined into innerHTML, and a timer is kept as inst._timer.


## 11-admin-dashboard — Admin dashboard with layer 2

Answer: `answers/11.md` · files: `app.js`

All checks passed.


## 12-profile-form — Profile form with vs* fields

Answer: `answers/12.md` · files: `app.js`

All checks passed.


## 13-delete-confirm — Delete with a confirmation

Answer: `answers/13.md` · files: `app.js`

All checks passed.


## 14-leaflet-places — Leaflet as an app wrapper (L1)

Answer: `answers/14.md` · files: `places-map.js`, `app.js`

All checks passed.

Static findings:

- error `class-selector` app.js:34 — var page = vf.attach(document.querySelector('.page'), {

Manual review:

- notes: All behaviour checks pass; the page is attached through a class selector (document.querySelector('.page')).
