# Evaluation results — Claude Sonnet 5

| | |
|---|---|
| Model | Claude Sonnet 5 (claude-sonnet-5) |
| Service | Claude Code subagent (reads the bundle, writes the answer; no other tools) |
| Run date | 2026-09-24 |
| Language | en |
| Kit version (run) | 1.0.0-rc.5 |
| Graded | 2026-09-24 with vfunc.js 1.0.0-rc.5 in chromium, firefox, webkit |
| Settings | Trial run of the evaluation set. One new session per task, no follow-up messages. The answers are unedited. Manual scores are not filled in yet. |

**3 / 10 tasks passed · 66 / 83 checks passed**

| Task | Checks | Static errors | Follow-ups | Pass |
|---|---|---|---|---|
| 01-counter-greeting | 8 / 8 | 1 | 0 | **no** |
| 02-todo | 2 / 9 | 1 | 0 | **no** |
| 03-dashboard-conversion | 10 / 10 | 0 | 0 | yes |
| 04-signup-form | 8 / 8 | 0 | 0 | yes |
| 05-server-list | 8 / 8 | 0 | 0 | yes |
| 06-spa-scaffold | 1 / 8 | 2 | 0 | **no** |
| 07-react-port | 8 / 9 | 0 | 0 | **no** |
| 08-chartjs | 4 / 6 | 0 | 0 | **no** |
| 09-design-apply | 8 / 8 | 1 | 0 | **no** |
| 10-bug-fix | 9 / 9 | 1 | 0 | **no** |

## 01-counter-greeting — Counter and greeting

Answer: `answers/01.md` · files: `index.html`, `app.js`, `style.css`

All checks passed.

Static findings:

- error `css-raw` style.css lines 11, 33, 37 — raw color outside tokens.css

Manual review:

- notes: Works in every engine; style.css uses raw colors (#ccc, #888, #0a7) instead of tokens.


## 02-todo — To-do list

Answer: `answers/02.md` · files: `app.js`, `style.css`

Failed checks:

- adds with Enter; the input is emptied and keeps the focus: chromium: [data-ref="list"] [data-id]: expected 1 elements, got 0; firefox: [data-ref="list"] [data-id]: expected 1 elements, got 0; webkit: [data-ref="list"] [data-id]: expected 1 elements, got 0
- adds with the Add button; ignores empty text: chromium: [data-ref="list"] [data-id]: expected 1 elements, got 0; firefox: [data-ref="list"] [data-id]: expected 1 elements, got 0; webkit: [data-ref="list"] [data-id]: expected 1 elements, got 0
- shows task text as text, not markup: chromium: [data-ref="list"] [data-id]: expected 1 elements, got 0; firefox: [data-ref="list"] [data-id]: expected 1 elements, got 0; webkit: [data-ref="list"] [data-id]: expected 1 elements, got 0
- toggles with the keyboard and keeps the focus on the checkbox: chromium: [data-ref="list"] [data-id]: expected 1 elements, got 0; firefox: [data-ref="list"] [data-id]: expected 1 elements, got 0; webkit: [data-ref="list"] [data-id]: expected 1 elements, got 0
- filters with aria-pressed "true"/"false": chromium: [data-ref="list"] [data-id]: expected 1 elements, got 0; firefox: [data-ref="list"] [data-id]: expected 1 elements, got 0; webkit: [data-ref="list"] [data-id]: expected 1 elements, got 0
- shows "Nothing here." only when the filter shows nothing: chromium: [data-ref="list"] [data-id]: expected 1 elements, got 0; firefox: [data-ref="list"] [data-id]: expected 1 elements, got 0; webkit: [data-ref="list"] [data-id]: expected 1 elements, got 0
- removes a task and updates the count: chromium: [data-ref="list"] [data-id]: expected 1 elements, got 0; firefox: [data-ref="list"] [data-id]: expected 1 elements, got 0; webkit: [data-ref="list"] [data-id]: expected 1 elements, got 0

Static findings:

- error `setstate-argument` app.js lines 62, 84, 100 — setState called with a function (it takes an object)

Manual review:

- notes: Adds nothing: inst.setState(function (s) { … }) is ignored, because setState takes an object (vf.store's set takes a function). The engine gives no warning.


## 03-dashboard-conversion — Convert a published dashboard

Answer: `answers/03.md` · files: `index.html`, `app.js`

All checks passed.

Manual review:

- notes: All checks pass.


## 04-signup-form — Sign-up form validation

Answer: `answers/04.md` · files: `index.html`, `app.js`, `style.css`

All checks passed.

Manual review:

- notes: All checks pass.


## 05-server-list — Server list: loading, error, empty and untrusted data

Answer: `answers/05.md` · files: `app.js`, `style.css`

All checks passed.

Manual review:

- notes: All checks pass. The Retry button sits inside the status element, which the task allows (the check was relaxed after this run to read the status text without the button).


## 06-spa-scaffold — SPA scaffold: router, store, two languages

Answer: `answers/06.md` · files: `index.html`, `app.js`, `store.js`, `api.js`, `pages/home.js`, `pages/servers.js`, `pages/server-detail.js`, `pages/not-found.js`, `locales/en.json`, `locales/ko.json`, `styles/base.css`, `styles/components/header.css`, `styles/pages/home.css`, `styles/pages/servers.css`, `styles/pages/server-detail.css`

Failed checks:

- home: title, intro and the current nav link: chromium: #view h1: expected "Status board", got "(no element)"; firefox: #view h1: expected "Status board", got "(no element)"; webkit: #view h1: expected "Status board", got "(no element)"
- a nav link opens the server list and moves the focus to #view: chromium: #view h1: expected "Status board", got "(no element)"; firefox: #view h1: expected "Status board", got "(no element)"; webkit: #view h1: expected "Status board", got "(no element)"
- server pages open by URL; unknown ids and routes show their messages: chromium: #view h1: expected "Oregon batch", got "(no element)"; firefox: #view h1: expected "Oregon batch", got "(no element)"; webkit: #view h1: expected "Oregon batch", got "(no element)"
- favorites are shared state that survives navigation: chromium: [data-action="favorite"]: expected "Add to favorites", got "(no element)"; firefox: [data-action="favorite"]: expected "Add to favorites", got "(no element)"; webkit: [data-action="favorite"]: expected "Add to favorites", got "(no element)"
- switching to Korean translates everything, sets <html lang> and survives a reload: chromium: #view h1: expected "Status board", got "(no element)"; firefox: #view h1: expected "Status board", got "(no element)"; webkit: #view h1: expected "Status board", got "(no element)"
- a language switch keeps the favorites (partial store update): chromium: #view h1: expected "Frankfurt API", got "(no element)"; firefox: #view h1: expected "Frankfurt API", got "(no element)"; webkit: #view h1: expected "Frankfurt API", got "(no element)"
- no console errors or warnings: chromium: console.warning: [vfunc] i18n: missing message "nav.home" for "en". \| console.warning: [vfunc] i18n: missing message "nav.servers" for "en". \| console.warning: [vfunc] i18n: missing message "favorites.label" for "en". \| console.warning: [vfunc] i18n: missing message "home.title" for "en". \| console.warning: [vfunc] i18n: missing message "home.intro" for "en". \| console.warning: [vfunc] i18n: missing message "server.favorite.add" for "en".; firefox: console.warning: [vfunc] i18n: missing message "nav.home" for "en". \| console.warning: [vfunc] i18n: missing message "nav.servers" for "en". \| console.warning: [vfunc] i18n: missing message "favorites.label" for "en". \| console.warning: [vfunc] i18n: missing message "home.title" for "en". \| console.warning: [vfunc] i18n: missing message "home.intro" for "en". \| console.warning: [vfunc] i18n: missing message "server.favorite.add" for "en".; webkit: console.warning: [vfunc] i18n: missing message "nav.home" for "en". \| console.warning: [vfunc] i18n: missing message "nav.servers" for "en". \| console.warning: [vfunc] i18n: missing message "favorites.label" for "en". \| console.warning: [vfunc] i18n: missing message "home.title" for "en". \| console.warning: [vfunc] i18n: missing message "home.intro" for "en". \| console.warning: [vfunc] i18n: missing message "server.favorite.add" for "en".

Static findings:

- error `locale-file` locales/en.json:2 — dotted top-level keys (nav.home, nav.servers, favorites.label…): vf.t reads "a.b" as nested objects
- error `locale-file` locales/ko.json:2 — dotted top-level keys (nav.home, nav.servers, favorites.label…): vf.t reads "a.b" as nested objects

Manual review:

- notes: Locale files use flat dotted keys ("nav.home"); vf.t reads "nav.home" as nested objects, so every text shows its key and the console warns about missing messages.


## 07-react-port — Port a React component

Answer: `answers/07.md` · files: `index.html`, `app.js`, `styles/product-filter.css`

Failed checks:

- search filters while typing, ignoring case, focus kept: chromium: expected products ["m2","m1"], got ["d1","k1","m2","k2","d2","m1"]; firefox: expected products ["m2","m1"], got ["d1","k1","m2","k2","d2","m1"]; webkit: expected products ["m2","m1"], got ["d1","k1","m2","k2","d2","m1"]

Manual review:

- notes: The search input re-renders on every key but has no id, data-ref or name, so the focus is not restored and typing stops after the first character. The report flagged focus restoration as not verified.


## 08-chartjs — Chart.js inside a component

Answer: `answers/08.md` · files: `app.js`, `style.css`

Failed checks:

- hiding destroys the component and the chart; showing starts again: chromium: chart not as expected: null; firefox: chart not as expected: null; webkit: chart not as expected: null
- no console errors or warnings: chromium: console.warning: [vfunc] attach: target element not found.; firefox: console.warning: [vfunc] attach: target element not found.; webkit: console.warning: [vfunc] attach: target element not found.

Manual review:

- notes: The chart component is vf.attach('#sales', …); destroy() removes #sales itself, so showing the chart again finds no target.


## 09-design-apply — Apply a DESIGN.md without touching JS

Answer: `answers/09.md` · files: `styles/tokens.css`, `styles/app.css`, `design/STATUS.md`

All checks passed.

Static findings:

- error `css-raw` styles/app.css lines 14, 14, 23, 23 — raw size outside tokens.css

Manual review:

- notes: Design applied correctly in light, OS dark and data-theme="dark"; two padding values stay in px in app.css.


## 10-bug-fix — Fix seven bugs

Answer: `answers/10.md` · files: `index.html`, `app.js`, `store.js`

All checks passed.

Static findings:

- error `instance-property` app.js:109 — inst._timer = setInterval(() => {

Manual review:

- notes: All seven bugs fixed, but bug 4 keeps the timer on inst._timer (an own property on the instance) and only fixes the typo.
