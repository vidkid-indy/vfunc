### Apply a DESIGN.md without touching JS

`DESIGN`: `design/DESIGN.md` (the "Pine" design) below. `SCOPE`: the whole app (one screen). The app works today with the neutral tokens; apply the design with the prompt.

- `app.js` and `design/DESIGN.md` must stay byte-for-byte the same.
- `styles/tokens.css` is derived from the `tokens` block: the light values, the dark values of the OS dark theme (`prefers-color-scheme: dark`) and the same dark values for `<html data-theme="dark">`. Tokens that the block does not list keep their current values.
- Apply sections 3–5 of the design in `styles/app.css`, which must read only `var(--vf-*)` tokens: no hex, `rgb()` or pixel values above 2px outside `tokens.css`.
- Update `design/STATUS.md`.

The grader compares computed styles with the design (colors, font, corners, shadows, padding) in the light theme, the OS dark theme and `data-theme="dark"`, and checks that the app still works.
