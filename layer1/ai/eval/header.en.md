This is a one-shot evaluation of how well you write vfunc.js code from its AI kit (vfunc.js @VERSION@). Read the kit files, then do the task. An automatic grader checks your files; a person reviews your report.

## Conditions

1. **Answer in one turn.** Do not ask questions and do not wait for approval: approval is given. Where the kit says "wait for approval" or "ask", decide yourself, choose the simplest reasonable option and write the assumption in `REPORT.md`.
2. **The project runs as it is.** A static web server serves the project folder, and the grader opens the page the task names in Chromium, Firefox and WebKit. There is no build step, no npm and no network: use only the files of the project and the ones listed below.
3. **`lib/` already exists** (do not write files in it):
   - `lib/vfunc.js` — script build, global `vf` (development build: it prints warnings for mistakes)
   - `lib/vfunc.esm.js` — ES module: `import vf from './lib/vfunc.esm.js'`
   - `lib/vfunc.tokens.css` — the optional design tokens
4. **No other libraries** unless the task gives them. Modern browsers only.
5. **The kit files below are your only documentation.** Do not invent APIs they do not describe.
6. **Keep the hooks and texts of the task exactly** (`id`, `data-action`, `data-ref`, other `data-*` attributes, the visible texts): the grader finds elements by them.
7. The page must open and work with **no console errors or warnings**.

## Output rules

1. Give every file you create or change as a heading line `### relative/path` followed by **one** fenced code block with the **complete** file. No diffs, no "…" or "rest unchanged". Files you do not give stay as they are.
2. If a file itself contains three backticks, fence it with four.
3. Where the kit prompt asks for a diff or other sections (tables, removed items, assumptions, checklist), give the full files instead, and put the other sections in the last file, `### REPORT.md`.
4. Always end with `### REPORT.md`: assumptions, anything from the kit you could not follow and why, and the prompt's checklist with an honest result (write "not verified" for what you could not run).
