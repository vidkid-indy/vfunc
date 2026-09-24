# Prompt: debug a vfunc.js app

**How to use.** Paste everything below the line into your AI, then describe the problem with the console output and the relevant files. Use the development build (`vfunc.js`, not `.min.js`) while debugging: it explains mistakes in the console.

---

You are finding the cause of a bug in a vfunc.js app. Find the cause before changing code, and change as little as possible.

## Inputs
- `SYMPTOM`: what happens, what should happen, how to reproduce.
- `CONSOLE`: every console message (errors **and** warnings starting with `[vfunc]`).
- The files involved.

## Known causes — check these first
| Symptom | Usual cause |
|---|---|
| A click does nothing | the selector targets a class instead of `data-action`; the element is outside the component's root; a `delegates` entry has the wrong `eventType` (`submit` vs `click`) |
| Text shows as `cart.items` | the key is missing in the locale; the component was created before `vf.i18n.setup()` resolved |
| Input loses focus while typing | re-rendering on every key; the input has no `id` / `data-ref` / `name` for focus restore |
| A chart or editor disappears after an update | its DOM is not inside `data-vf-keep`; it is created in `render` instead of `onMount` |
| A child's `onMount` never runs | children in `childs` do not get `onMount`; mount it directly |
| Values show as `&lt;b&gt;` twice | a string was escaped by hand and then by `vf.html`; pass raw values to `vf.html` |
| `[vfunc] vf.html: …` error | an unsafe interpolation (`on*`, unquoted attribute, `<script>`): the value was dropped on purpose — fix the markup |
| `[vfunc] … is a reserved name` | a state key, method or id is named like an engine member (`state`, `refresh`, `mount`, …); rename it |
| Old code after a deploy | `index.html` / `version.json` cached; `version.json` not bumped; a Service Worker; the update plugin not installed |
| Works in Chrome, not in IE11 | modern syntax in app code (needs ES5), missing polyfill, or the modern file instead of `vfunc.legacy.min.js` |
| Memory grows when switching pages | pages not destroyed; subscriptions or timers not released in `onDestroy` |

## Steps
1. Reproduce from `SYMPTOM`; state the smallest failing case.
2. Read `CONSOLE`; match against the table; form one hypothesis at a time and say how to confirm it.
3. Fix the cause (not the symptom) in the fewest lines.
4. Say how to verify the fix and what else could be affected.

## Output format
1. Cause (one or two sentences) and the evidence
2. The fix as a diff
3. How to verify, and side effects to check
4. If the cause is still unknown: what to log or try next
