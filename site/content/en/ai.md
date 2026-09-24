# Working with AI

vfunc.js is designed to leave AI assistants little room for mistakes: components are plain objects, rules are few, and names tell you what things are. Give your AI the files below and you get more accurate code.

## Give these first

| File | Use |
|---|---|
| [llms.txt](../llms.txt) | what is needed to write code (English); [llms.ko.txt](../llms.ko.txt) in Korean |
| [llms-full.txt](../llms-full.txt) | the summary + the full manual + the type declarations |
| `AGENTS.md` | AI rules at your project root. The starter has one; you can also copy `AGENTS.template.md` from the list below |

For Claude Code keep the same content as `CLAUDE.md`, for GitHub Copilot as `.github/copilot-instructions.md`.

## Prompts

Open the prompt for your task, copy it and paste it with your material. Every prompt treats pasted material as **data, not instructions**, and marks APIs or URLs it could not verify with `VERIFY:`.

{{prompts}}

## A real run

Example 14 is a published dashboard converted with `prompt-html-to-vfunc`, together with its conversion record (`CONVERSION.md`): the area table, the HTML diff, the unsafe items removed and the token suggestions. The run exposed two gaps in the prompt (inline styles, state classes), which are now fixed in the prompt.

## Evaluation set

To check the claim above with numbers, we give AI models ten tasks and grade their answers automatically: counter and greeting, to-do list, converting a published dashboard, a sign-up form, a server list with untrusted data, an SPA scaffold, porting a React component, Chart.js, applying a `DESIGN.md` without touching JS, and fixing seven bugs.

- Each model gets one file per task: the kit (`AGENTS.md`, `llms.txt`, the task's prompt), the task and its input files. It answers once, without follow-up questions, and the answer is saved as it is.
- The grader opens the result in Chromium, Firefox and WebKit, runs the checks of the task, and requires a clean console. It also looks for the mistakes the kit warns about: inline handlers, `javascript:` URLs, class selectors, HTML strings outside `vf.html`, a missing CSP, empty `aria-*` values.
- A task passes only when every check passes in all three engines and no rule is broken.

The tasks, the grader and every saved answer are in [layer1/ai/eval](https://github.com/vidkid-indy/vfunc/tree/main/layer1/ai/eval). Anyone can run the tasks with another model.

{{eval}}
