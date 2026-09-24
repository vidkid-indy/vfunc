# Evaluation results — Claude Sonnet 5

| | |
|---|---|
| Model | Claude Sonnet 5 (claude-sonnet-5) |
| Service | Claude Code subagent (reads the bundle, writes the answer; no other tools) |
| Run date | 2026-09-25 |
| Language | en |
| Kit version (run) | 1.0.0-rc.6 |
| Graded | 2026-09-24 with vfunc.js 1.0.0-rc.6 in chromium, firefox, webkit |
| Settings | Second run, after the engine and kit changes of 1.0.0-rc.6. Same conditions as the first run: one new session per task, no follow-up messages, unedited answers. Task 10's bug 7 was reworked before this run (open tasks listed first). Manual scores are not filled in yet. |

**6 / 10 tasks passed · 71 / 83 checks passed**

| Task | Checks | Static errors | Follow-ups | Pass |
|---|---|---|---|---|
| 01-counter-greeting | 8 / 8 | 1 | 0 | **no** |
| 02-todo | 9 / 9 | 0 | 0 | yes |
| 03-dashboard-conversion | 6 / 10 | 0 | 0 | **no** |
| 04-signup-form | 7 / 8 | 0 | 0 | **no** |
| 05-server-list | 8 / 8 | 0 | 0 | yes |
| 06-spa-scaffold | 1 / 8 | 0 | 0 | **no** |
| 07-react-port | 9 / 9 | 0 | 0 | yes |
| 08-chartjs | 6 / 6 | 0 | 0 | yes |
| 09-design-apply | 8 / 8 | 0 | 0 | yes |
| 10-bug-fix | 9 / 9 | 0 | 0 | yes |

## 01-counter-greeting — Counter and greeting

Answer: `answers/01.md` · files: `index.html`, `app.js`, `style.css`

All checks passed.

Static findings:

- error `css-raw` style.css lines 11, 26, 30 — raw color outside tokens.css
- warn `css-raw` style.css:12 — raw size outside tokens.css

Manual review:

- notes: Works in every engine; style.css again uses raw colors instead of tokens.


## 02-todo — To-do list

Answer: `answers/02.md` · files: `app.js`, `style.css`

All checks passed.

Manual review:

- notes: All checks pass (setState with a function now works).


## 03-dashboard-conversion — Convert a published dashboard

Answer: `answers/03.md` · files: `index.html`, `app.js`

Failed checks:

- the menu button opens and closes the menu (aria-expanded, hidden): chromium: [data-action="menu"] aria-expanded: expected "true", got "false"; firefox: [data-action="menu"] aria-expanded: expected "true", got "false"; webkit: [data-action="menu"] aria-expanded: expected "true", got "false"
- Escape and a click outside close the menu: chromium: [data-action="menu"] aria-expanded: expected "true", got "false"; firefox: [data-action="menu"] aria-expanded: expected "true", got "false"; webkit: [data-action="menu"] aria-expanded: expected "true", got "false"
- Sign out closes the menu and shows "Signed out": chromium: [data-action="menu"] aria-expanded: expected "true", got "false"; firefox: [data-action="menu"] aria-expanded: expected "true", got "false"; webkit: [data-action="menu"] aria-expanded: expected "true", got "false"
- tabs switch the summary with aria-selected and the active class: chromium: #summary: expected "This month: 1,204 orders, 3.4% refunds.", got "Orders are up this week. Most sales came from the keyboard line."; firefox: #summary: expected "This month: 1,204 orders, 3.4% refunds.", got "Orders are up this week. Most sales came from the keyboard line."; webkit: #summary: expected "This month: 1,204 orders, 3.4% refunds.", got "Orders are up this week. Most sales came from the keyboard line."

Manual review:

- notes: The user menu and the tabs are adopted with vf.attach (no render) and keep their state in the component; the DOM is updated in onUpdate, which never runs for a component without render, so the menu and tabs do not change.


## 04-signup-form — Sign-up form validation

Answer: `answers/04.md` · files: `index.html`, `app.js`, `style.css`

Failed checks:

- a valid submit hides the form and welcomes; the password is never shown or logged: chromium: [data-ref="done"]: expected "Welcome, <i>me</i>@example.com!", got ""; firefox: [data-ref="done"]: expected "Welcome, <i>me</i>@example.com!", got ""; webkit: [data-ref="done"]: expected "Welcome, <i>me</i>@example.com!", got ""

Manual review:

- notes: Reads vf.$('[data-ref="done"]')[0], treating vf.$ as returning an array (it returns the first element), so the welcome text is never shown.


## 05-server-list — Server list: loading, error, empty and untrusted data

Answer: `answers/05.md` · files: `app.js`, `style.css`

All checks passed.

Manual review:

- notes: All checks pass.


## 06-spa-scaffold — SPA scaffold: router, store, two languages

Answer: `answers/06.md` · files: `index.html`, `app.js`, `store.js`, `api.js`, `pages/home.js`, `pages/servers.js`, `pages/server.js`, `pages/not-found.js`, `locales/en.json`, `locales/ko.json`, `styles/base.css`, `styles/components/header.css`, `styles/pages/servers.css`

Failed checks:

- home: title, intro and the current nav link: chromium: #view h1: expected "Status board", got "(no element)"; firefox: #view h1: expected "Status board", got "(no element)"; webkit: #view h1: expected "Status board", got "(no element)"
- a nav link opens the server list and moves the focus to #view: chromium: #view h1: expected "Status board", got "(no element)"; firefox: #view h1: expected "Status board", got "(no element)"; webkit: #view h1: expected "Status board", got "(no element)"
- server pages open by URL; unknown ids and routes show their messages: chromium: #view h1: expected "Oregon batch", got "(no element)"; firefox: #view h1: expected "Oregon batch", got "(no element)"; webkit: #view h1: expected "Oregon batch", got "(no element)"
- favorites are shared state that survives navigation: chromium: [data-action="favorite"]: expected "Add to favorites", got "(no element)"; firefox: [data-action="favorite"]: expected "Add to favorites", got "(no element)"; webkit: [data-action="favorite"]: expected "Add to favorites", got "(no element)"
- switching to Korean translates everything, sets <html lang> and survives a reload: chromium: #view h1: expected "Status board", got "(no element)"; firefox: #view h1: expected "Status board", got "(no element)"; webkit: #view h1: expected "Status board", got "(no element)"
- a language switch keeps the favorites (partial store update): chromium: #view h1: expected "Frankfurt API", got "(no element)"; firefox: #view h1: expected "Frankfurt API", got "(no element)"; webkit: #view h1: expected "Frankfurt API", got "(no element)"
- no console errors or warnings: chromium: page error: buttons.forEach is not a function; firefox: page error: buttons.forEach is not a function; webkit: page error: TypeError: buttons.forEach is not a function. (In 'buttons.forEach((btn) => {     const pressed = btn.getAttribute('data-locale') === currentLocale;     btn.setAttribute('aria-pressed', pressed ? 'tru...

Manual review:

- notes: Calls forEach on vf.$(…), treating it as an array; the page error stops the app before the first page renders.


## 07-react-port — Port a React component

Answer: `answers/07.md` · files: `index.html`, `app.js`, `styles.css`

All checks passed.

Manual review:

- notes: All checks pass.


## 08-chartjs — Chart.js inside a component

Answer: `answers/08.md` · files: `app.js`, `style.css`

All checks passed.

Manual review:

- notes: All checks pass (setState with a function now works).


## 09-design-apply — Apply a DESIGN.md without touching JS

Answer: `answers/09.md` · files: `styles/tokens.css`, `styles/app.css`, `design/STATUS.md`

All checks passed.

Manual review:

- notes: All checks pass.


## 10-bug-fix — Fix seven bugs

Answer: `answers/10.md` · files: `app.js`, `store.js`

All checks passed.

Manual review:

- notes: All seven bugs fixed with no rule broken.
