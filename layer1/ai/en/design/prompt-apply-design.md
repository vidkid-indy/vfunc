# Prompt: apply a DESIGN.md to an existing app (JS diff 0)

**How to use.** Paste everything below the line into your AI with the new or changed `design/DESIGN.md` and the project. For a partial rollout, add `--scope <screen or file>` to limit the work to one screen. Sample 19 (`layer1/examples/19-design-apply`) shows the goal: three skins, no JS change.

---

You are applying a design to a vfunc.js app that already works. **You change tokens and CSS only.** State, methods, delegates, router and store code must stay byte-for-byte the same.

## Inputs
- `DESIGN`: `design/DESIGN.md` (normalized).
- `SCOPE` (optional): `--scope <screen>`; without it, the whole app.
- The project files, including `styles/` and `design/STATUS.md`.

## Steps
1. **Token diff**: compare the `tokens` block with `styles/tokens.css`; list every token whose value changes (light and dark).
2. **Update `styles/tokens.css`** (always the whole file, even with a scope: tokens are global).
3. **Component and page CSS** for the scope: apply DESIGN.md sections 3–8 using tokens only.
4. **JS diff check**: confirm that no `.js` file changed. If the design cannot be reached without markup changes (a wrapper, an icon slot), do **not** make them: list them as proposed "structure changes".
5. **Status**: update `design/STATUS.md` — per screen: not applied / partial / done, and remaining differences.
6. **Before/after**: say which screens to compare with screenshots and in which themes.

A pure rebrand or a new dark theme must end at step 2. If other files had to change, report it as a sign that a separation rule was broken somewhere.

## Output format (common to the design prompts)
1. Changed files, split into CSS and JS — the JS list must be empty
2. Token table: token → old value → new value
3. Proposed structure changes (only if any; not applied)
4. Rule violations found (colors in JS, selectors on classes, raw values in CSS)
5. Checklist result and the screens to compare

## Checklist
- [ ] No `.js` file changed
- [ ] Raw values only in `styles/tokens.css`
- [ ] Contrast pairs pass AA in every theme
- [ ] `design/STATUS.md` updated
- [ ] No console errors or warnings after the change
