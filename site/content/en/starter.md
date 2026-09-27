# Build apps with the starter and AI

The starter is a vfunc app skeleton you copy and use as it is. This page shows how to take the starter and have an AI coding tool (Claude Code, Cursor, Codex, Copilot or a chat AI) add features, with ten practice projects. The [tutorial](tutorial.md) first makes the AI's code easier to read.

## What the starter has

| Path | What |
|---|---|
| `index.html` | the CSP security line, styles, one `app.js` |
| `app.js` | layout, router (screen changes), the update plugin. A new screen is one route line here |
| `pages/*.js` | one file per screen: `(ctx, router) => component` |
| `store.js` · `api.js` | shared state and the functions that change it · every server call |
| `locales/{en,ko}.json` | English and Korean texts |
| `styles/tokens.css` | design tokens (light and dark), derived from `design/DESIGN.md` |
| `AGENTS.md` · `AGENTS.ko.md` | **the rules the AI reads**: structure, security and design |
| `docs/llms.txt` · `docs/llms-full.txt` | the vfunc reference for AI tools |
| `tools/design-check.mjs` | design rules check (raw colors, class selectors, contrast) |
| `tools/release.mjs` · `deploy/` | versioned releases and server cache settings |
| `lib/` | copies of the vfunc files. Do not edit |

Everything the AI needs is in the folder: the rules in `AGENTS.md`, the API in `docs/llms.txt`, and a structure that is already decided. The AI only fills in the places that are already there.

## Get the starter

With Node.js, one command (name `my-app` as you like):

```bash
npx degit vidkid-indy/vfunc/layer1/starter my-app
cd my-app
python -m http.server 8080
```

Without Node.js, download **Code → Download ZIP** from the [repository](https://github.com/vidkid-indy/vfunc), unzip it and copy just the `layer1/starter` folder. Start a server in that folder and open `http://localhost:8080/`: an app with home, list and settings screens appears.

## First setup

1. **Fill in section 0 of `AGENTS.md`**: a one-line description of the app, the answer language and the target browsers. `AGENTS.ko.md` is the Korean version.
2. **Point your tool at the rules.**
   - Codex, Cursor and others read `AGENTS.md` directly.
   - For Claude Code, copy `AGENTS.md` to `CLAUDE.md`.
   - For GitHub Copilot, copy it to `.github/copilot-instructions.md`.
3. (Optional) **Decide the design.** Write colors, fonts and shapes in `design/DESIGN.md` and have the AI regenerate `styles/tokens.css`. The design prompts are in the [AI kit](ai.md).
4. Change the app name and the home texts in `locales/en.json` and `ko.json`.

## Hand it to the AI

With an **AI tool that opens folders** (Claude Code, Cursor, Codex, a Copilot agent), open the starter folder and begin like this. The AI reads `AGENTS.md` and `docs/llms.txt` itself.

```text
This folder is the vfunc.js starter. Read AGENTS.md and docs/llms.txt first and follow the rules.

App: <one-line description>
Screens: <the screens and what each one does>
Data: <where it is stored, e.g. the browser's localStorage / sql.js>

How to work:
- Show me the files and screens you plan first, and write code after I agree.
- A new screen is a file in pages/ plus one route line in app.js. Put every text in both locales, en and ko.
Done when:
- Opened with python -m http.server 8080, the browser console shows no errors or warnings
- node tools/design-check.mjs passes (when Node is installed)
- It works in English and Korean, and in the light and dark themes
```

With a **chat AI** (ChatGPT, Claude and others on the web), attach `AGENTS.md`, `docs/llms.txt` and the files to change (`app.js`, the related `pages/*.js`) and paste the same request. Ask for **whole files** in the answer; pasting fragments invites mistakes.

- Asking for **one screen at a time** works better than asking for the whole app at once.
- For common tasks (add a screen, convert existing HTML, move from React or Vue, debug, deployment setup), paste a prompt from the [AI kit](ai.md).
- When the AI invents an API, the console shows an error. Give the AI that error text as it is and let it fix the code.

## Check the result

| Check | How |
|---|---|
| A clean console | F12 → Console shows no red errors and no yellow warnings (the development vfunc warns about mistakes) |
| Every screen works | Press every button and fill every input once. Also reload, go back and type an address directly |
| Both languages, both themes | the language switch in the header, the OS dark mode |
| Design rules | `node tools/design-check.mjs` reports colors outside the tokens, elements found by class and low contrast |
| Security rules | no `innerHTML =`, `onclick=` or `eval` in the code; every `vf.unsafeHtml` has a comment saying why |
| Escaped input | typing `<img src=x onerror=alert(1)>` into an input shows it as text |

When something is wrong, give the AI the symptom together with the debug prompt from the [AI kit](ai.md). The kit also lists the mistakes AI tools make most (anti-patterns).

## Add components (vfunc-ui)

The starter has the engine only. For [components](components.md) such as tables, charts and confirm dialogs, add their files to `lib/`.

1. Save these files (open each in the browser and **Save as**). They must all be the same version.
   - into `lib/`: `https://cdn.jsdelivr.net/npm/vfunc@@VERSION@/dist/vfunc-ui.esm.js`, the Korean texts `…/dist/vfunc-ui.locale.ko.esm.js`, and for grids and charts `…/dist/vfunc-ui-data.esm.js`
   - into `styles/`: `https://cdn.jsdelivr.net/npm/vfunc@@VERSION@/css/vfunc-ui.css`
2. Load the components in `lib/vf.js`. These files import `vfunc.esm.js` from the same folder, so there stays one engine.
3. In `index.html`, link `vfunc-ui.css` on the line after `tokens.css`.

```js
// lib/vf.js
import './vfunc-ui.esm.js';
import './vfunc-ui.locale.ko.esm.js';
export { default } from './vfunc.esm.js';
```

- For production switch the engine and the components **together** to the min files (`vfunc.esm.min.js`, `vfunc-ui.esm.min.js`). Switching only one loads the engine twice.
- Plugins (list, shortcut) come the same way: put `…/dist/plugins/list.esm.js` in `lib/plugins/` and register it with `vf.use` (like the starter's update plugin).
- Tell the AI that vfunc-ui is in lib/, and give it the component list `ai/en/components.md` (in the npm package or the [AI kit](ai.md)).

## When you need a database (sql.js)

Projects marked ◆ use SQLite. This page suggests [sql.js](https://github.com/sql-js/sql.js) (MIT license), which runs SQLite inside the browser with no server. It is not part of vfunc; the app loads it.

1. Get `sql-wasm.js` and `sql-wasm.wasm` of the same version and put them in `lib/sql/` (from `dist/` of the `sql.js` npm package or a GitHub release). Keep its license file with them.
2. In `index.html`, load `<script src="./lib/sql/sql-wasm.js"></script>` before `app.js`. It creates the global `initSqlJs`.
3. Add `'wasm-unsafe-eval'` to `script-src` in the CSP. It allows WebAssembly only and is not `'unsafe-eval'`.

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'">
```

Ask the AI like this:

```text
Store the data in SQLite inside the browser with sql.js (lib/sql/sql-wasm.js, global initSqlJs).
- Put initialization (initSqlJs({ locateFile: (f) => new URL('./lib/sql/' + f, location.href).href })),
  the tables and the read and write functions in one db.js module; screens use it only through store.js.
- After every change save db.export() to IndexedDB, and load it at start.
- Never build SQL by joining values; always bind them (?).
- Import and export: buttons to open and save a .sqlite file.
```

- A sql.js database lives in memory; without saving it is gone on reload. The IndexedDB step in the request does that.
- Use the `.js` and `.wasm` files of the same version. To load them from a CDN, pin the version, add `integrity`, and add that address to the CSP.

## Ten practice projects

All of them are front end only. Difficulty goes from ★ (easy) to ★★★. Copy the details below into the request's "App · Screens · Data".

| # | Project | Difficulty | Screens and features | What you practice |
|---|---|---|---|---|
| 1 | **Markdown viewer** | ★★ | open or drop an `.md` file, table of contents, code blocks, dark mode | the File API, third-party code (marked + DOMPurify), safe HTML |
| 2 | **Kanban board** | ★★ | to do · doing · done columns, add and move cards (buttons and dragging), localStorage | state, event delegation, the list plugin |
| 3 | **Household budget** ◆ | ★★★ | income and spending, monthly totals, a chart by category, CSV export | forms, `vf.fmt` currency, vfChart, sql.js |
| 4 | **Notes** ◆ | ★★ | note list and editor, tags, search, Markdown preview | router, store, sql.js |
| 5 | **CSV and JSON viewer** | ★★ | open a file as a table, sort, filter, pages, export | vfGrid, the File API |
| 6 | **Pomodoro timer** | ★ | 25/5-minute timer, today's log, a sound at the end | cleaning up timers (`onDestroy`), the shortcut plugin |
| 7 | **Vocabulary cards** ◆ | ★★ | add words, flip cards, a quiz, review missed words | screen changes, state flow, sql.js |
| 8 | **Photo gallery** | ★★ | open local images, a grid, a lightbox, arrow keys | vfModal, keyboard access, `URL.createObjectURL` |
| 9 | **Survey builder** ◆ | ★★★ | edit questions → answer screen → result charts | dynamic forms, vfChart, sql.js |
| 10 | **GitHub repository dashboard** | ★★ | stars, issues and languages of a repository as cards and charts | fetch, loading and error states, CSP `connect-src` |

What to add to the request for each project:

- **1 Markdown viewer**: the HTML made from Markdown goes into `vf.unsafeHtml` only after DOMPurify has cleaned it, with a comment saying so. Pin both libraries' versions and keep them in `lib/`, or load them from a CDN with `integrity`.
- **2 Kanban**: cards move with buttons (←, →) as well as by dragging, for keyboard users.
- **5 CSV and JSON viewer**: large files (10,000 rows) show page by page so the screen does not freeze.
- **6 Timer**: stop the timer when leaving the screen (`onDestroy`), and keep the time right after the tab was hidden.
- **8 Gallery**: photos stay in the browser and are never sent to a server.
- **10 Dashboard**: the GitHub API limits requests per hour without a login. Keep results for a while (cache) and show a message when the limit is hit. Add `https://api.github.com` to CSP `connect-src`.
- **◆ projects**: add the request from "When you need a database" above.

## Tell us how it went

Share what you built with the starter and AI in [GitHub Discussions](https://github.com/vidkid-indy/vfunc/discussions). These details help us improve the kit:

- the AI tool and model, and the project you chose
- your first request, and how many rounds it took to fix
- where the AI went wrong (console error text, invented APIs, broken rules)
- a screenshot or a repository link of the result (optional)
