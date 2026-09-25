# Evaluation results — Claude Sonnet 5

| | |
|---|---|
| Model | Claude Sonnet 5 (claude-sonnet-5) |
| Service | Claude Code subagent (reads the bundle, writes the answer; no other tools) |
| Run date | 2026-09-25 |
| Language | ko |
| Kit version (run) | 1.0.0-rc.7 |
| Graded | 2026-09-25 with vfunc.js 1.0.0-rc.7 in chromium, firefox, webkit |
| Settings | First run of the Korean bundles (Korean kit: AGENTS ko, llms.ko.txt, ko prompts, Korean task texts), with the rc.7 kit that stresses tokens in new CSS and render on the smallest changing element. One new session per task, no follow-up messages, unedited answers. A session limit (HTTP 429) stopped the sessions of tasks 02, 03, 06 and 07 after they had written their complete answers; tasks 08, 09 and 10 ran again after the limit reset. Manual scores are not filled in yet. |

**8 / 10 tasks passed · 83 / 83 checks passed**

| Task | Checks | Static errors | Follow-ups | Pass |
|---|---|---|---|---|
| 01-counter-greeting | 8 / 8 | 0 | 0 | yes |
| 02-todo | 9 / 9 | 0 | 0 | yes |
| 03-dashboard-conversion | 10 / 10 | 0 | 0 | yes |
| 04-signup-form | 8 / 8 | 0 | 0 | yes |
| 05-server-list | 8 / 8 | 0 | 0 | yes |
| 06-spa-scaffold | 8 / 8 | 0 | 0 | yes |
| 07-react-port | 9 / 9 | 0 | 0 | yes |
| 08-chartjs | 6 / 6 | 1 | 0 | **no** |
| 09-design-apply | 8 / 8 | 0 | 0 | yes |
| 10-bug-fix | 9 / 9 | 1 | 0 | **no** |

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

Answer: `answers/06.md` · files: `index.html`, `store.js`, `api.js`, `components/header.js`, `pages/home.js`, `pages/servers.js`, `pages/server.js`, `pages/not-found.js`, `app.js`, `locales/en.json`, `locales/ko.json`, `styles/base.css`, `styles/components/header.css`, `styles/pages/servers.css`, `styles/pages/server.css`

All checks passed.


## 07-react-port — Port a React component

Answer: `answers/07.md` · files: `index.html`, `app.js`, `styles/app.css`

All checks passed.


## 08-chartjs — Chart.js inside a component

Answer: `answers/08.md` · files: `app.js`

All checks passed.

Static findings:

- error `class-selector` app.js:121 — vf.attach(document.querySelector('.page__head'), {

Manual review:

- notes: All behaviour checks pass; the toggle button is attached through a class selector (.page__head).


## 09-design-apply — Apply a DESIGN.md without touching JS

Answer: `answers/09.md` · files: `styles/tokens.css`, `styles/app.css`, `design/STATUS.md`

All checks passed.


## 10-bug-fix — Fix seven bugs

Answer: `answers/10.md` · files: `app.js`, `store.js`

All checks passed.

Static findings:

- error `html-string` app.js lines 73, 73, 73 — e.sender.refs['comment-list'].innerHTML = comments.map((c) => '<li class="comments__item">' + vf.esc(c) + '</li>').join('');

Manual review:

- notes: All seven bugs fixed; the comment list is built by string concatenation with vf.esc and innerHTML (escaped, but against the kit rule).
