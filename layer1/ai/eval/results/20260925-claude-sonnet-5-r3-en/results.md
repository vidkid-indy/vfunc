# Evaluation results — Claude Sonnet 5

| | |
|---|---|
| Model | Claude Sonnet 5 (claude-sonnet-5) |
| Service | Claude Code subagent (reads the bundle, writes the answer; no other tools) |
| Run date | 2026-09-25 |
| Language | en |
| Kit version (run) | 1.0.0-rc.6 |
| Graded | 2026-09-24 with vfunc.js 1.0.0-rc.6 in chromium, firefox, webkit |
| Settings | Third run, after onUpdate for components without render (D-025 5) and the kit clarifications for vf.$ and hook arguments. Same conditions: one new session per task, no follow-up messages, unedited answers. In task 06 the model's first file write was cut off; it read its own answer file and appended the rest (two extra tool calls, no other files). Manual scores are not filled in yet. |

**8 / 10 tasks passed · 82 / 83 checks passed**

| Task | Checks | Static errors | Follow-ups | Pass |
|---|---|---|---|---|
| 01-counter-greeting | 8 / 8 | 1 | 0 | **no** |
| 02-todo | 9 / 9 | 0 | 0 | yes |
| 03-dashboard-conversion | 9 / 10 | 0 | 0 | **no** |
| 04-signup-form | 8 / 8 | 0 | 0 | yes |
| 05-server-list | 8 / 8 | 0 | 0 | yes |
| 06-spa-scaffold | 8 / 8 | 0 | 0 | yes |
| 07-react-port | 9 / 9 | 0 | 0 | yes |
| 08-chartjs | 6 / 6 | 0 | 0 | yes |
| 09-design-apply | 8 / 8 | 0 | 0 | yes |
| 10-bug-fix | 9 / 9 | 0 | 0 | yes |

## 01-counter-greeting — Counter and greeting

Answer: `answers/01.md` · files: `index.html`, `app.js`, `style.css`

All checks passed.

Static findings:

- error `css-raw` style.css lines 5, 6, 25, 37, 41, 52, 53 — raw color outside tokens.css
- warn `css-raw` style.css lines 3, 12, 13, 20, 24, 26, 31, 46, 50, 50, 51 — raw size outside tokens.css

Manual review:

- notes: Works in every engine; style.css uses raw colors instead of tokens (as in every run).


## 02-todo — To-do list

Answer: `answers/02.md` · files: `app.js`, `style.css`

All checks passed.


## 03-dashboard-conversion — Convert a published dashboard

Answer: `answers/03.md` · files: `index.html`, `app.js`

Failed checks:

- the published structure and texts stay (no element rebuilt or nested): chromium: the published summary element was replaced; firefox: the published summary element was replaced; webkit: the published summary element was replaced

Manual review:

- notes: The summary panel is attached with render and draws its whole inside again, so the published #summary element is rebuilt (the task asks to keep the published structure).


## 04-signup-form — Sign-up form validation

Answer: `answers/04.md` · files: `index.html`, `app.js`, `style.css`

All checks passed.


## 05-server-list — Server list: loading, error, empty and untrusted data

Answer: `answers/05.md` · files: `app.js`, `api.js`, `style.css`

All checks passed.


## 06-spa-scaffold — SPA scaffold: router, store, two languages

Answer: `answers/06.md` · files: `index.html`, `app.js`, `store.js`, `api.js`, `pages/home.js`, `pages/servers.js`, `pages/serverDetail.js`, `pages/notFound.js`, `locales/en.json`, `locales/ko.json`, `styles/base.css`, `styles/components/header.css`, `styles/pages/home.css`, `styles/pages/servers.css`, `styles/pages/server-detail.css`, `styles/pages/not-found.css`

All checks passed.

Static findings:

- warn `css-raw` styles/base.css:21 — raw size outside tokens.css

Manual review:

- notes: The answer file was completed with two extra tool calls after a cut-off write (see settings).


## 07-react-port — Port a React component

Answer: `answers/07.md` · files: `index.html`, `app.js`, `styles/product-filter.css`

All checks passed.


## 08-chartjs — Chart.js inside a component

Answer: `answers/08.md` · files: `index.html`, `app.js`, `style.css`

All checks passed.


## 09-design-apply — Apply a DESIGN.md without touching JS

Answer: `answers/09.md` · files: `styles/tokens.css`, `styles/app.css`, `design/STATUS.md`

All checks passed.


## 10-bug-fix — Fix seven bugs

Answer: `answers/10.md` · files: `app.js`, `store.js`

All checks passed.

Static findings:

- warn `html-string` app.js:88 — innerHTML from vf.html (safe; prefer render or vf.frag)

Manual review:

- notes: All seven bugs fixed. The comment list is written with innerHTML = String(vf.html`…`): safe, but not the idiom (warning).
