# Evaluation results — Claude Sonnet 5

| | |
|---|---|
| Model | Claude Sonnet 5 (claude-sonnet-5) |
| Service | Claude Code subagent (reads the bundle, writes the answer; no other tools) |
| Run date | 2026-09-27 |
| Language | ko |
| Kit version (run) | 1.0.0 |
| Graded | 2026-09-27 with vfunc.js 1.0.0 in chromium, firefox, webkit |
| Settings | Fourteen tasks with the Korean bundles and the 1.0.0 kit (Korean kit: AGENTS ko, llms.ko.txt, ko prompts, Korean task texts; the layer 2 tasks add ai/ko/components.md and the layer 2 lib/ files): a regression run after the kit additions of stage 2 Phase 6. One new session per task, no follow-up messages, unedited answers. A session limit (HTTP 429) stopped the sessions of tasks 03 to 07. The answers of 04, 05, 06 and 07 were complete (each ends with REPORT.md and closes every code block) and were kept; the answer of 03 had no REPORT.md, so task 03 was run again in a new session and only that answer is used. Manual scores (rubric of each task.json, 0-2 per item) by the maintainer's AI assistant, reviewed by the maintainer (2026-09-27). |

**10 / 14 tasks passed · 96 / 109 checks passed · manual review 96 / 108 points**

| Task | Checks | Static errors | Follow-ups | Manual | Pass |
|---|---|---|---|---|---|
| 01-counter-greeting | 8 / 8 | 0 | 0 | 4 / 6 | yes |
| 02-todo | 9 / 9 | 0 | 0 | 8 / 8 | yes |
| 03-dashboard-conversion | 10 / 10 | 0 | 0 | 8 / 8 | yes |
| 04-signup-form | 8 / 8 | 0 | 0 | 8 / 8 | yes |
| 05-server-list | 8 / 8 | 0 | 0 | 8 / 8 | yes |
| 06-spa-scaffold | 1 / 8 | 0 | 0 | 6 / 8 | **no** |
| 07-react-port | 9 / 9 | 1 | 0 | 4 / 6 | **no** |
| 08-chartjs | 6 / 6 | 0 | 0 | 8 / 8 | yes |
| 09-design-apply | 8 / 8 | 0 | 0 | 8 / 8 | yes |
| 10-bug-fix | 9 / 9 | 2 | 0 | 6 / 8 | **no** |
| 11-admin-dashboard | 7 / 7 | 0 | 0 | 8 / 8 | yes |
| 12-profile-form | 6 / 6 | 0 | 0 | 8 / 8 | yes |
| 13-delete-confirm | 1 / 7 | 0 | 0 | 5 / 8 | **no** |
| 14-leaflet-places | 6 / 6 | 0 | 0 | 7 / 8 | yes |

## 01-counter-greeting — Counter and greeting

Answer: `answers/01.md` · files: `index.html`, `app.js`, `style.css`

All checks passed.

Manual review:

- spec: 2
- idiom: 1
- report: 1
- notes: Manual review: The greeting skips state (textContent); style.css has raw values (system-ui, bold, 1.5rem) while the checklist says tokens only. The Korean kit lists no token names.


## 02-todo — To-do list

Answer: `answers/02.md` · files: `app.js`, `style.css`

All checks passed.

Manual review:

- spec: 2
- minimal: 2
- idiom: 2
- report: 2


## 03-dashboard-conversion — Convert a published dashboard

Answer: `answers/03.md` · files: `index.html`, `app.js`

All checks passed.

Manual review:

- html-kept: 2
- smallest-tool: 2
- area-table: 2
- report: 2
- notes: Second session: the first one stopped at a session limit (HTTP 429) before writing REPORT.md.


## 04-signup-form — Sign-up form validation

Answer: `answers/04.md` · files: `index.html`, `app.js`, `style.css`

All checks passed.

Manual review:

- spec: 2
- adopt: 2
- privacy: 2
- report: 2


## 05-server-list — Server list: loading, error, empty and untrusted data

Answer: `answers/05.md` · files: `app.js`, `style.css`

All checks passed.

Manual review:

- spec: 2
- structure: 2
- untrusted: 2
- report: 2


## 06-spa-scaffold — SPA scaffold: router, store, two languages

Answer: `answers/06.md` · files: `index.html`, `app.js`, `store.js`, `api.js`, `components/header.js`, `pages/home.js`, `pages/servers.js`, `pages/server-detail.js`, `pages/not-found.js`, `locales/en.json`, `locales/ko.json`, `data/servers.json`, `styles/tokens.css`, `styles/base.css`, `styles/components/header.css`, `styles/pages/home.css`, `styles/pages/servers.css`, `styles/pages/server-detail.css`

Failed checks:

- home: title, intro and the current nav link: chromium: #view h1: expected "Status board", got "(no element)"; firefox: #view h1: expected "Status board", got "(no element)"; webkit: #view h1: expected "Status board", got "(no element)"
- a nav link opens the server list and moves the focus to #view: chromium: #view h1: expected "Status board", got "(no element)"; firefox: #view h1: expected "Status board", got "(no element)"; webkit: #view h1: expected "Status board", got "(no element)"
- server pages open by URL; unknown ids and routes show their messages: chromium: #view h1: expected "Oregon batch", got "(no element)"; firefox: #view h1: expected "Oregon batch", got "(no element)"; webkit: #view h1: expected "Oregon batch", got "(no element)"
- favorites are shared state that survives navigation: chromium: [data-action="favorite"]: expected "Add to favorites", got "(no element)"; firefox: [data-action="favorite"]: expected "Add to favorites", got "(no element)"; webkit: [data-action="favorite"]: expected "Add to favorites", got "(no element)"
- switching to Korean translates everything, sets <html lang> and survives a reload: chromium: #view h1: expected "Status board", got "(no element)"; firefox: #view h1: expected "Status board", got "(no element)"; webkit: #view h1: expected "Status board", got "(no element)"
- a language switch keeps the favorites (partial store update): chromium: #view h1: expected "Frankfurt API", got "(no element)"; firefox: #view h1: expected "Frankfurt API", got "(no element)"; webkit: #view h1: expected "Frankfurt API", got "(no element)"
- no console errors or warnings: chromium: console.error: [vfunc] error: TypeError: ctx.route is not a function     at onChange (http://127.0.0.1:14832/06-spa-scaffold/app.js:45:41)     at safeCall (http://127.0.0.1:14832/06-spa-scaffold/lib/vfunc.esm.js:31:15)     at resolve (http://127.0.0.1:14832/06-spa-scaffold/lib/vfunc.esm.js:1153:21)     at Object.start (http://127.0.0.1:14832/06-spa-scaffold/lib/vfunc.esm.js:1210:7)     at http://127.0.0.1:14832/06-spa-scaffold/app.js:83:10; firefox: console.error: [vfunc] error: JSHandle@object; webkit: console.error: [vfunc] error: TypeError: ctx.route is not a function. (In 'ctx.route(ctx)', 'ctx.route' is "/") \| console.error: [vfunc] error: TypeError: ctx.route is not a function. (In 'ctx.route(ctx)', 'ctx.route' is "/servers/:id")

Static findings:

- warn `css-raw` styles/pages/servers.css lines 17, 21, 25 — raw size outside tokens.css

Manual review:

- structure: 2
- lifecycle: 1
- messages: 1
- report: 2
- notes: Manual review: Guesses an undocumented ctx.route in the router onChange (marked VERIFY); nav.servers reused as the region label; guessed token names. The Korean kit has no router or i18n code example.


## 07-react-port — Port a React component

Answer: `answers/07.md` · files: `index.html`, `app.js`, `styles.css`

All checks passed.

Static findings:

- error `css-raw` styles.css lines 22, 41, 54, 69, 70 — raw color outside tokens.css
- warn `css-raw` styles.css lines 3, 9, 15, 16, 21, 21, 23, 29, 31, 52, 53, 67, 68, 71 — raw size outside tokens.css

Manual review:

- mapping: 2
- design: 1
- report: 1
- notes: Manual review: Raw fallback values on every token, a token that does not exist; Intl instead of vf.fmt.currency (the Korean kit shows no arguments); no mapping table.


## 08-chartjs — Chart.js inside a component

Answer: `answers/08.md` · files: `app.js`, `style.css`

All checks passed.

Manual review:

- lifecycle: 2
- ownership: 2
- tokens: 2
- report: 2


## 09-design-apply — Apply a DESIGN.md without touching JS

Answer: `answers/09.md` · files: `styles/tokens.css`, `styles/app.css`, `design/STATUS.md`

All checks passed.

Manual review:

- token-table: 2
- violations: 2
- status: 2
- report: 2


## 10-bug-fix — Fix seven bugs

Answer: `answers/10.md` · files: `app.js`, `store.js`

All checks passed.

Static findings:

- error `html-string` app.js lines 90, 90, 90 — e.sender.refs['comment-list'].innerHTML = comments.map((c) => '<li class="comments__item">' + vf.esc(c) + '</li>').join('');
- error `instance-property` app.js:110 — inst._timer = setInterval(() => {

Manual review:

- causes: 2
- minimal: 2
- verify: 1
- report: 1
- notes: Manual review: Keeps inst._timer and builds the comment list as a string for innerHTML with vf.esc; no way to verify each fix; the report says no rule was broken for the timer.


## 11-admin-dashboard — Admin dashboard with layer 2

Answer: `answers/11.md` · files: `app.js`

All checks passed.

Manual review:

- spec: 2
- components: 2
- no-rebuild: 2
- report: 2


## 12-profile-form — Profile form with vs* fields

Answer: `answers/12.md` · files: `app.js`

All checks passed.

Manual review:

- spec: 2
- fields: 2
- values: 2
- report: 2


## 13-delete-confirm — Delete with a confirmation

Answer: `answers/13.md` · files: `app.js`

Failed checks:

- the list, the buttons and the count: chromium: #files li: expected 3 elements, got 0; firefox: #files li: expected 3 elements, got 0; webkit: #files li: expected 3 elements, got 0
- the confirm: alertdialog with the title and message, focus on Cancel; Escape changes nothing and returns the focus: chromium: #files li: expected 3 elements, got 0; firefox: #files li: expected 3 elements, got 0; webkit: #files li: expected 3 elements, got 0
- Cancel changes nothing: chromium: #files li: expected 3 elements, got 0; firefox: #files li: expected 3 elements, got 0; webkit: #files li: expected 3 elements, got 0
- confirming deletes, counts, shows the toast and focuses the next Delete button: chromium: #files li: expected 3 elements, got 0; firefox: #files li: expected 3 elements, got 0; webkit: #files li: expected 3 elements, got 0
- deleting the last file focuses the previous one; deleting everything focuses the heading: chromium: #files li: expected 3 elements, got 0; firefox: #files li: expected 3 elements, got 0; webkit: #files li: expected 3 elements, got 0
- no console errors or warnings: chromium: page error: Missing } in template expression; firefox: page error: missing } in template string; webkit: page error: Unexpected token ')'. Expected a closing '}' following an expression in template literal.

Manual review:

- spec: 0
- overlays: 2
- cleanup: 1
- report: 2
- notes: Manual review: A syntax error (an extra parenthesis in render) leaves the list empty; a new vfConfirm on every click, never destroyed.


## 14-leaflet-places — Leaflet as an app wrapper (L1)

Answer: `answers/14.md` · files: `places-map.js`, `app.js`

All checks passed.

Manual review:

- lifecycle: 2
- namespace: 2
- xss-tokens: 2
- report: 1
- notes: Manual review: No license verdict in the report.
