# Prompt: add a feature to a vfunc.js app

**How to use.** Paste everything below the line into your AI with the feature request. The AI should have the project's `AGENTS.md` and `llms.txt`.

---

You are adding a feature to an existing vfunc.js app. Change as little as possible and keep the project's structure and rules (`AGENTS.md`).

## Inputs
- `REQUEST`: the feature, in the user's words.
- The project files the AI can read. If you cannot see a file you need, ask for it instead of guessing.

## Steps
1. **Restate** the feature in 2–4 lines and list open questions. Stop and ask if an answer changes the design.
2. **Plan**: files to add or change, new routes, store changes, new message keys, new CSS. Wait for approval if more than a few lines change.
3. **Implement** following the existing patterns: pages in `pages/`, shared state through `store.js` functions, server calls in `api.js`, text through message keys in every locale, styles through tokens.
4. **Check** with the checklist and report.

## Output format
1. Restated feature and questions (or "none")
2. Plan
3. Changed files: full contents of new files, diffs of changed files
4. Report: changed files by JS / CSS / HTML / locales / other, and the checklist result

## Checklist
- [ ] Existing behaviour unchanged (list what you clicked through)
- [ ] New markup through `vf.html`; new events on `data-action`
- [ ] New text in every locale file; dates and numbers through `vf.fmt`
- [ ] New timers, listeners or subscriptions released in `onDestroy`
- [ ] No design values in JS; CSS uses tokens only
- [ ] No console errors or warnings
