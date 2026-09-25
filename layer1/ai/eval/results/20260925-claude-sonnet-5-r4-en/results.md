# Evaluation results — Claude Sonnet 5

| | |
|---|---|
| Model | Claude Sonnet 5 (claude-sonnet-5) |
| Service | Claude Code subagent (reads the bundle, writes the answer; no other tools) |
| Run date | 2026-09-25 |
| Language | en |
| Kit version (run) | 1.0.0-rc.7 |
| Graded | 2026-09-25 with vfunc.js 1.0.0-rc.7 in chromium, firefox, webkit |
| Settings | Fourth run, with the rc.7 kit that stresses tokens in new CSS and render on the smallest changing element (no engine change since the third run). Same conditions: one new session per task, no follow-up messages, unedited answers. Manual scores are not filled in yet. |

**7 / 10 tasks passed · 79 / 83 checks passed**

| Task | Checks | Static errors | Follow-ups | Pass |
|---|---|---|---|---|
| 01-counter-greeting | 8 / 8 | 0 | 0 | yes |
| 02-todo | 9 / 9 | 0 | 0 | yes |
| 03-dashboard-conversion | 10 / 10 | 0 | 0 | yes |
| 04-signup-form | 6 / 8 | 0 | 0 | **no** |
| 05-server-list | 8 / 8 | 0 | 0 | yes |
| 06-spa-scaffold | 6 / 8 | 0 | 0 | **no** |
| 07-react-port | 9 / 9 | 0 | 0 | yes |
| 08-chartjs | 6 / 6 | 0 | 0 | yes |
| 09-design-apply | 8 / 8 | 0 | 0 | yes |
| 10-bug-fix | 9 / 9 | 2 | 0 | **no** |

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

Failed checks:

- a valid submit hides the form and welcomes; the password is never shown or logged: chromium: [data-ref="done"]: expected "Welcome, <i>me</i>@example.com!", got ""; firefox: [data-ref="done"]: expected "Welcome, <i>me</i>@example.com!", got ""; webkit: [data-ref="done"]: expected "Welcome, <i>me</i>@example.com!", got ""
- no console errors or warnings: chromium: console.error: [vfunc] error: TypeError: Cannot set properties of undefined (setting 'textContent')     at onEvent (http://127.0.0.1:4188/04-signup-form/app.js:81:28)     at proto._dispatch (http://127.0.0.1:4188/04-signup-form/lib/vfunc.js:892:7)     at HTMLFormElement.<anonymous> (http://127.0.0.1:4188/04-signup-form/lib/vfunc.js:907:17); firefox: console.error: [vfunc] error: JSHandle@object; webkit: console.error: [vfunc] error: TypeError: undefined is not an object (evaluating 'done.textContent = 'Welcome, ' + email + '!'')

Manual review:

- notes: Reads e.sender.refs.done for an element outside the form, but refs only cover the component root; the welcome step throws.


## 05-server-list — Server list: loading, error, empty and untrusted data

Answer: `answers/05.md` · files: `app.js`

All checks passed.


## 06-spa-scaffold — SPA scaffold: router, store, two languages

Answer: `answers/06.md` · files: `index.html`, `app.js`, `store.js`, `api.js`, `pages/home.js`, `pages/servers.js`, `pages/serverDetail.js`, `pages/notFound.js`, `locales/en.json`, `locales/ko.json`, `styles/base.css`, `styles/components/header.css`, `styles/pages/servers.css`, `styles/pages/server-detail.css`

Failed checks:

- switching to Korean translates everything, sets <html lang> and survives a reload: chromium: #view h1: expected "상태 보드", got "Status board"; firefox: #view h1: expected "상태 보드", got "Status board"; webkit: #view h1: expected "상태 보드", got "Status board"
- a language switch keeps the favorites (partial store update): chromium: [data-action="favorite"]: expected "즐겨찾기에서 빼기", got "Remove from favorites"; firefox: [data-action="favorite"]: expected "즐겨찾기에서 빼기", got "Remove from favorites"; webkit: [data-action="favorite"]: expected "즐겨찾기에서 빼기", got "Remove from favorites"

Manual review:

- notes: Calls vf.i18n.set(locale) and re-renders at once without waiting for the locale to load, so the Korean texts never appear; it replaced persist with its own localStorage key because the kit does not describe persist.


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

Answer: `answers/10.md` · files: `index.html`, `app.js`, `store.js`

All checks passed.

Static findings:

- error `html-string` app.js lines 76, 76, 76 — e.sender.refs['comment-list'].innerHTML = comments.map((c) => '<li class="comments__item">' + vf.esc(c) + '</li>').join('');
- error `instance-property` app.js:96 — inst._timer = setInterval(() => {

Manual review:

- notes: All seven bugs fixed; keeps inst._timer and builds the comment list by string concatenation with vf.esc.
