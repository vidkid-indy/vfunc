# Evaluation results — Claude Sonnet 5

| | |
|---|---|
| Model | Claude Sonnet 5 (claude-sonnet-5) |
| Service | Claude Code subagent (reads the bundle, writes the answer; no other tools) |
| Run date | 2026-09-26 |
| Language | en |
| Kit version (run) | 1.0.0-rc.8 |
| Graded | 2026-09-26 with vfunc.js 1.0.0-rc.8 in chromium, firefox, webkit |
| Settings | Fourteen tasks: the ten engine tasks (a regression run with the kit after stage 2 Phase 5: llms.txt has a layer 2 section) and the four new layer 2 tasks, whose bundles add components.md and the layer 2 lib/ files. One new session per task, no follow-up messages, unedited answers. Manual scores are not filled in yet. |

**12 / 14 tasks passed · 105 / 109 checks passed**

| Task | Checks | Static errors | Follow-ups | Pass |
|---|---|---|---|---|
| 01-counter-greeting | 8 / 8 | 0 | 0 | yes |
| 02-todo | 9 / 9 | 0 | 0 | yes |
| 03-dashboard-conversion | 10 / 10 | 0 | 0 | yes |
| 04-signup-form | 8 / 8 | 0 | 0 | yes |
| 05-server-list | 8 / 8 | 0 | 0 | yes |
| 06-spa-scaffold | 4 / 8 | 0 | 0 | **no** |
| 07-react-port | 9 / 9 | 0 | 0 | yes |
| 08-chartjs | 6 / 6 | 0 | 0 | yes |
| 09-design-apply | 8 / 8 | 0 | 0 | yes |
| 10-bug-fix | 9 / 9 | 0 | 0 | yes |
| 11-admin-dashboard | 7 / 7 | 0 | 0 | yes |
| 12-profile-form | 6 / 6 | 0 | 0 | yes |
| 13-delete-confirm | 7 / 7 | 0 | 0 | yes |
| 14-leaflet-places | 6 / 6 | 1 | 0 | **no** |

## 01-counter-greeting — Counter and greeting

Answer: `answers/01.md` · files: `index.html`, `app.js`, `style.css`

All checks passed.


## 02-todo — To-do list

Answer: `answers/02.md` · files: `app.js`, `style.css`

All checks passed.


## 03-dashboard-conversion — Convert a published dashboard

Answer: `answers/03.md` · files: `index.html`, `app.js`

All checks passed.


## 04-signup-form — Sign-up form validation

Answer: `answers/04.md` · files: `index.html`, `app.js`, `style.css`

All checks passed.


## 05-server-list — Server list: loading, error, empty and untrusted data

Answer: `answers/05.md` · files: `app.js`, `style.css`

All checks passed.


## 06-spa-scaffold — SPA scaffold: router, store, two languages

Answer: `answers/06.md` · files: `index.html`, `app.js`, `store.js`, `api.js`, `components/header.js`, `pages/home.js`, `pages/servers.js`, `pages/server-detail.js`, `pages/not-found.js`, `locales/en.json`, `locales/ko.json`, `styles/base.css`, `styles/components/header.css`, `styles/pages/home.css`, `styles/pages/servers.css`

Failed checks:

- favorites are shared state that survives navigation: chromium: [data-ref="fav-count"]: expected "1", got "0"; firefox: [data-ref="fav-count"]: expected "1", got "0"; webkit: [data-ref="fav-count"]: expected "1", got "0"
- switching to Korean translates everything, sets <html lang> and survives a reload: chromium: [data-action="locale"][data-locale="ko"] aria-pressed: expected "true", got "false"; firefox: [data-action="locale"][data-locale="ko"] aria-pressed: expected "true", got "false"; webkit: [data-action="locale"][data-locale="ko"] aria-pressed: expected "true", got "false"
- a language switch keeps the favorites (partial store update): chromium: [data-ref="fav-count"]: expected "1", got "0"; firefox: [data-ref="fav-count"]: expected "1", got "0"; webkit: [data-ref="fav-count"]: expected "1", got "0"
- no console errors or warnings: chromium: page error: Failed to execute 'appendChild' on 'Node': The new child element contains the parent.; firefox: page error: Node.appendChild: The new child is an ancestor of the parent; webkit: page error: HierarchyRequestError: The operation would yield an incorrect node tree.

Manual review:

- notes: The header is a vf.attach instance that is then mounted into its own element (HierarchyRequestError); favorites and the locale buttons fail after it. The kit did not say that an attach instance is never mounted (added to llms.txt after this run).


## 07-react-port — Port a React component

Answer: `answers/07.md` · files: `index.html`, `app.js`, `styles.css`

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


## 11-admin-dashboard — Admin dashboard with layer 2

Answer: `answers/11.md` · files: `app.js`

All checks passed.


## 12-profile-form — Profile form with vs* fields

Answer: `answers/12.md` · files: `app.js`

All checks passed.


## 13-delete-confirm — Delete with a confirmation

Answer: `answers/13.md` · files: `app.js`

All checks passed.

Manual review:

- notes: Graded again after a grader fix: the static check read vf.$(`#delete-${next.id}`) as a class selector (the ${...} expression). All checks pass.


## 14-leaflet-places — Leaflet as an app wrapper (L1)

Answer: `answers/14.md` · files: `places-map.js`, `app.js`

All checks passed.

Static findings:

- error `design-in-js` places-map.js:8 — return value ? value.trim() : '#1d4ed8';

Manual review:

- notes: All behaviour checks pass; a color literal in JS as the fallback of a missing token (the kit now says: not even as a fallback).
