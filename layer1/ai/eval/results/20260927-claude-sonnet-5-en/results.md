# Evaluation results — Claude Sonnet 5

| | |
|---|---|
| Model | Claude Sonnet 5 (claude-sonnet-5) |
| Service | Claude Code subagent (reads the bundle, writes the answer; no other tools) |
| Run date | 2026-09-27 |
| Language | en |
| Kit version (run) | 1.0.0 |
| Graded | 2026-09-26 with vfunc.js 1.0.0 in chromium, firefox, webkit |
| Settings | Fourteen tasks with the 1.0.0 kit: a regression run after the kit additions of stage 2 Phase 6 (llms.txt common mistakes: never mount an attach instance, attach and vf.$ targets by hooks, no joined vf.html into innerHTML, no fallback colors in JS). One new session per task, no follow-up messages, unedited answers. Manual scores (rubric of each task.json, 0-2 per item) by the maintainer's AI assistant, reviewed by the maintainer (2026-09-27). |

**13 / 14 tasks passed · 107 / 109 checks passed · manual review 100 / 108 points**

| Task | Checks | Static errors | Follow-ups | Manual | Pass |
|---|---|---|---|---|---|
| 01-counter-greeting | 8 / 8 | 0 | 0 | 5 / 6 | yes |
| 02-todo | 9 / 9 | 0 | 0 | 8 / 8 | yes |
| 03-dashboard-conversion | 10 / 10 | 0 | 0 | 8 / 8 | yes |
| 04-signup-form | 8 / 8 | 0 | 0 | 7 / 8 | yes |
| 05-server-list | 8 / 8 | 0 | 0 | 8 / 8 | yes |
| 06-spa-scaffold | 6 / 8 | 0 | 0 | 7 / 8 | **no** |
| 07-react-port | 9 / 9 | 0 | 0 | 4 / 6 | yes |
| 08-chartjs | 6 / 6 | 0 | 0 | 8 / 8 | yes |
| 09-design-apply | 8 / 8 | 0 | 0 | 8 / 8 | yes |
| 10-bug-fix | 9 / 9 | 0 | 0 | 6 / 8 | yes |
| 11-admin-dashboard | 7 / 7 | 0 | 0 | 8 / 8 | yes |
| 12-profile-form | 6 / 6 | 0 | 0 | 7 / 8 | yes |
| 13-delete-confirm | 7 / 7 | 0 | 0 | 8 / 8 | yes |
| 14-leaflet-places | 6 / 6 | 0 | 0 | 8 / 8 | yes |

## 01-counter-greeting — Counter and greeting

Answer: `answers/01.md` · files: `index.html`, `app.js`, `style.css`

All checks passed.

Static findings:

- warn `css-raw` style.css:11 — raw size outside tokens.css

Manual review:

- spec: 2
- idiom: 2
- report: 1
- notes: Manual review: The checklist says px only for borders, but style.css has max-width: 480px.


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


## 04-signup-form — Sign-up form validation

Answer: `answers/04.md` · files: `index.html`, `app.js`, `style.css`

All checks passed.

Manual review:

- spec: 2
- adopt: 1
- privacy: 2
- report: 2
- notes: Manual review: The terms row markup was changed (field--check removed, a new wrapper), reported with the reason.


## 05-server-list — Server list: loading, error, empty and untrusted data

Answer: `answers/05.md` · files: `app.js`, `style.css`

All checks passed.

Manual review:

- spec: 2
- structure: 2
- untrusted: 2
- report: 2


## 06-spa-scaffold — SPA scaffold: router, store, two languages

Answer: `answers/06.md` · files: `index.html`, `app.js`, `store.js`, `api.js`, `components/header.js`, `pages/home.js`, `pages/servers.js`, `pages/serverDetail.js`, `pages/notFound.js`, `locales/en.json`, `locales/ko.json`, `styles/base.css`, `styles/components/header.css`, `styles/pages/home.css`, `styles/pages/servers.css`, `styles/pages/server-detail.css`

Failed checks:

- switching to Korean translates everything, sets <html lang> and survives a reload: chromium: #view h1: expected "상태 보드", got "Status board"; firefox: #view h1: expected "상태 보드", got "Status board"; webkit: #view h1: expected "상태 보드", got "Status board"
- a language switch keeps the favorites (partial store update): chromium: [data-action="favorite"]: expected "즐겨찾기에서 빼기", got "Remove from favorites"; firefox: [data-action="favorite"]: expected "즐겨찾기에서 빼기", got "Remove from favorites"; webkit: [data-action="favorite"]: expected "즐겨찾기에서 빼기", got "Remove from favorites"

Manual review:

- structure: 2
- lifecycle: 2
- messages: 1
- report: 2
- notes: Manual review: After a locale switch only the header refreshes, so the page keeps English texts.


## 07-react-port — Port a React component

Answer: `answers/07.md` · files: `index.html`, `app.js`, `styles.css`

All checks passed.

Manual review:

- mapping: 2
- design: 1
- report: 1
- notes: Manual review: Sold out is styled through a modifier class; the report has no mapping table.


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

Answer: `answers/10.md` · files: `index.html`, `app.js`, `store.js`

All checks passed.

Manual review:

- causes: 2
- minimal: 1
- verify: 1
- report: 2
- notes: Manual review: Moved #notice in index.html (not needed); no way to verify each fix.


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
- fields: 1
- values: 2
- report: 2
- notes: Manual review: No required prop on the required fields.


## 13-delete-confirm — Delete with a confirmation

Answer: `answers/13.md` · files: `app.js`

All checks passed.

Manual review:

- spec: 2
- overlays: 2
- cleanup: 2
- report: 2


## 14-leaflet-places — Leaflet as an app wrapper (L1)

Answer: `answers/14.md` · files: `places-map.js`, `app.js`

All checks passed.

Manual review:

- lifecycle: 2
- namespace: 2
- xss-tokens: 2
- report: 2
