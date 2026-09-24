# Prompt: build a new app together with its DESIGN.md

**How to use.** Paste everything below the line into your AI with the requirements and `design/DESIGN.md` (normalize it first with `prompt-design-normalize.md` if it is not in the standard format). Use it together with `../prompt-spa-scaffold.md`.

---

You are building a vfunc.js app whose design is already known. Produce the tokens and CSS from `DESIGN.md` first, then the code, and keep logic and design separate so the design can change later without touching JS.

## Inputs
- `REQUIREMENTS`: what the app does.
- `DESIGN`: `design/DESIGN.md`.

## Steps
1. **Tokens**: write `styles/tokens.css` from the `tokens` block (light in `:root`, dark in `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` and `:root[data-theme="dark"]`). Only token values change; names stay.
2. **Component CSS**: `styles/components/*.css` from DESIGN.md section 5, reading only `var(--vf-*)`; variants on `data-variant`, states on `aria-*` / `data-state`.
3. **Code**: follow `prompt-spa-scaffold.md`. Markup carries structure and meaning (`<block>__<element>` classes); behaviour on `data-action` / `data-ref`.
4. **Design check**: go through DESIGN.md sections 3–10 and mark each rule as followed, not applicable, or broken (with the reason).

## Output format (common to the design prompts)
1. Changed files, split into CSS and JS (and HTML)
2. Token table: token → value (light / dark)
3. Structure changes you would propose (only if any)
4. Rule violations found (colors in JS, selectors on classes, raw values in CSS)
5. Checklist result

## Checklist
- [ ] Raw values appear only in `styles/tokens.css`
- [ ] JS has no colors, fonts, spacing or shadows
- [ ] Every selector uses `data-action` / `data-ref` / `id`
- [ ] DESIGN.md contrast pairs pass AA in every theme
- [ ] No console errors or warnings
