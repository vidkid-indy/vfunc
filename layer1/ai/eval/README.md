# vfunc.js LLM evaluation set

Fourteen tasks (ten for the engine, four for the layer 2 components) that show how well an AI model writes vfunc.js code from the AI kit alone, graded automatically in three browser engines. Korean: [README.ko.md](README.ko.md). Results are published on the website (Working with AI → Evaluation set).

| # | Task | Kit prompt | What it checks most |
|---|---|---|---|
| 01 | Counter and greeting | — | escaping, focus and caret while typing, `disabled` |
| 02 | To-do list | add-feature | delegation, keyboard focus, `aria-pressed` values |
| 03 | Convert a published dashboard | html-to-vfunc | adopt vs. `attach` + `render`, CSS and markup kept, CSP |
| 04 | Sign-up form validation | add-feature | `aria-invalid` / `aria-describedby`, focus, no password leaks |
| 05 | Server list | add-feature | loading, error and empty states, untrusted data, `vf.safeUrl` |
| 06 | SPA scaffold | spa-scaffold | router, `aria-current`, focus, `store.set` merge, en/ko |
| 07 | Port a React component | migrate-from-react-vue | same behaviour, no React left, tokens |
| 08 | Chart.js inside a component | add-feature | `onMount` / `onUpdate` / `onDestroy`, `data-vf-keep`, token colors |
| 09 | Apply a DESIGN.md | design/apply-design | JS unchanged, computed styles in light and dark |
| 10 | Fix seven bugs | debug | the traps found by earlier independent runs |
| 11 | Admin dashboard (layer 2) | add-feature | `vfSearchInput`, `vfGrid` (sort, search, selection), `vfChart` with its data table |
| 12 | Profile form (layer 2) | add-feature | `vs*` field props (`label`, `hint`, `error`), values kept across the error re-render |
| 13 | Delete with a confirmation (layer 2) | add-feature | `vfConfirm` (`danger`, Escape), one `vfToast`, focus after a delete |
| 14 | Leaflet as an app wrapper (layer 2 kit) | integrate-third-party | L1 wrapper on `app`, `data-vf-keep`, `map.remove()`, escaped tooltips (CDN) |

Layer 2 tasks have `"layer": 2` in `task.json`: their bundle adds `components.md` to the kit and lists the layer 2 files of `lib/`, the grader copies those files from `layer2/dist`, and the kit prompt may come from `layer2/ai`.

## How it works

- **One file per task (a bundle).** `node layer1/ai/eval/tools/bundle.mjs` writes `build/out/eval/bundles/{en,ko}/<task>.md`: the evaluation header (conditions and output rules), the kit (`AGENTS.template.md`, `llms.txt` or `llms.ko.txt`, the task's prompt), the task text and its input files. Reference answers and checks are never in a bundle. Bundles are generated, not committed.
- **One answer per task.** The model gives every file as `### path` + one code block and ends with `### REPORT.md`. It answers in one turn: the header tells it not to wait for approval.
- **Automatic grading.** `node layer1/ai/eval/tools/grade.mjs <run folder>` extracts each answer into `build/out/eval/<run>/<task>/` (the task's files, the answer on top, `lib/` from `layer1/dist`), runs the static checks, serves the folder and runs the task's checks in Chromium, Firefox and WebKit. Every check opens a fresh page; the console must stay free of errors and warnings, and the DOM must have valid `aria-*` values, unique ids and no `undefined`.
- **A task passes** when every check passes in all three engines and there is no static error.

## Run a model by hand

1. `npm install` and, once, `npx playwright install chromium firefox webkit`.
2. `node layer1/ai/eval/tools/bundle.mjs` (or `--lang en` / `--lang ko`, or task numbers).
3. For each task, start a **new chat**, paste the whole bundle and send it. Do not add anything.
4. If the model asks a question instead of answering, reply exactly `Proceed with your best assumptions and list them.` (Korean bundle: `가장 타당한 가정으로 진행하고 가정을 적어 주세요.`) and count it as a follow-up. Send nothing else.
5. Save the model's whole reply, unedited, as `results/<yyyymmdd>-<model>-<lang>/answers/<NN>.md` (for example `answers/03.md`). If the reply is cut off, ask `Continue.` once, append the rest, and note it.
6. Write `run.json` in the same folder (below), then grade: `node layer1/ai/eval/tools/grade.mjs layer1/ai/eval/results/<run>`. Add `--engines chromium` for a quick look; a published result uses all three. Task 08 needs network access (Chart.js from the CDN).
7. Read `results.md` and the answers' `REPORT.md`, fill in the manual scores (the `rubric` of each `task.json`, 0–2 points each) and notes in `run.json`, then run `grade.mjs <run folder> --report` to rewrite `results.md` without grading again.

Grading all fourteen tasks in three engines takes about 5 minutes for good answers and up to 15 minutes when many checks fail (a failing check waits for its time limit).

```json
{
  "model": "Example Model",
  "modelVersion": "2026-09",
  "service": "chat web app | API | Claude Code subagent",
  "date": "2026-09-24",
  "lang": "en",
  "kit": "1.0.0-rc.5",
  "settings": "default settings, extended thinking on",
  "tasks": {
    "01": { "followUps": 0, "manual": { "spec": 2, "idiom": 2, "report": 1 }, "notes": "" }
  }
}
```

`kit` is the vfunc.js version the bundles were made from (`package.json` at that time). Results are not edited afterwards: when the kit changes, run again into a new folder.

## Files

| Path | Holds |
|---|---|
| `header.en.md`, `header.ko.md` | the conditions and output rules at the top of every bundle |
| `tasks/index.json` | the task order |
| `tasks/NN-name/task.json` | prompt, entry page, project and reference files, files that must stay the same, static options, manual rubric |
| `tasks/NN-name/task.en.md`, `task.ko.md` | the task text; it fixes the hooks and texts the checks use |
| `tasks/NN-name/input/` | input files (task 03 reads sample 14 `before/` directly) |
| `tasks/NN-name/checks.mjs` | the behaviour checks (Playwright) |
| `tasks/NN-name/reference/answer.md` | a reference answer in the answer format, used only by the tests |
| `tools/` | `bundle.mjs`, `extract.mjs`, `static.mjs`, `grade.mjs`, `report.mjs`, `helpers.mjs` |
| `results/<run>/` | `run.json`, `answers/NN.md`, `results.json`, `results.md` |

## Tests

- `layer1/test/eval.test.js` (`npm test`): task folders in both languages, bundles with the kit and without reference answers, answer parsing, static rules, the report, committed results.
- `layer1/test/e2e/eval.e2e.js` (`npm run test:examples`, every engine in CI): every reference answer passes, and an unchanged task 10 fails all seven bug checks.
- Committed model answers are not graded in CI: they were made with the kit of their time.

## Adding or changing a task

- Write both languages with the same hooks; the task text must name every hook and text a check uses.
- Checks select by `id`, `data-action`, `data-ref` and other `data-*` attributes (reading a publisher's classes is fine when the check is about keeping them).
- The reference answer must pass in all three engines, and an answer that changes nothing must fail.
- Grading only uses the tools the repository allows (Playwright); no API keys.
