# Design: tokens and DESIGN.md

Whenever the design arrives, the logic should not change. Example 19 puts three skins on one app without changing a line of JavaScript.

## Separation rules

1. Behaviour on `data-action` · `data-ref` · `id`; looks on classes (`<block>__<element>`).
2. State as `aria-*` or `data-state`; CSS styles those attributes.
3. No colors, fonts, spacing or shadows in JavaScript.
4. CSS reads only `var(--vf-*)` tokens; raw values live only in the token file.
5. `DESIGN.md` is the source; the token file is derived from it.
6. A design task never changes logic.

## Tokens — `css/vfunc.tokens.css`

An optional, neutral skin with light and dark themes. Token names are public API.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vfunc@@VERSION@/css/vfunc.tokens.css">
<link rel="stylesheet" href="./brand.css">   <!-- override tokens here -->
```

| Group | Examples |
|---|---|
| Colors | `--vf-color-primary`, `--vf-color-surface`, `--vf-color-text-muted`, `--vf-color-danger-soft` |
| Charts | `--vf-chart-1` … `--vf-chart-8` |
| Shape | `--vf-space-1..7`, `--vf-radius-md`, `--vf-shadow-2` |
| Type | `--vf-font-body`, `--vf-font-size-md`, `--vf-font-weight-strong` |

- The dark theme follows the OS; `<html data-theme="dark">` forces it. Apply a saved theme before the first paint from an external script in `<head>`.
- The main text and background pairs of the default skin pass WCAG AA in light and dark.
- When a library needs a color (charts), read the token: `getComputedStyle(document.documentElement).getPropertyValue('--vf-chart-1')`.

## The DESIGN.md workflow

| Situation | Do |
|---|---|
| Design material in any format | `prompt-design-normalize` → a standard `DESIGN.md` |
| New app with a design | `prompt-new-app-with-design`: tokens and CSS first, then code |
| Design arrives later | `prompt-apply-design`: tokens and CSS only, confirm no JS change, `--scope` per screen |
| Published HTML arrives for finished screens | `prompt-merge-published-html`: replace only the render markup, with a hook mapping table |

The prompts and the `DESIGN.md` template are in [Working with AI](ai.md). With Tailwind, map `@theme` onto the tokens (example 13).
