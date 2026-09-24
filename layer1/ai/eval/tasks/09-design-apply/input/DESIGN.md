# DESIGN.md — Pine settings

> The single source of design for this project. `styles/tokens.css` is derived from the `tokens` block below. Tokens that are not listed keep their current (neutral) values.

## 1. Brand and tone
- Personality: calm, natural, trustworthy
- Audience and context: account owners on desktops and phones

## 2. Tokens

```tokens
{
  "light": {
    "--vf-color-primary": "#0f766e",
    "--vf-color-primary-hover": "#115e59",
    "--vf-color-primary-active": "#134e4a",
    "--vf-color-primary-soft": "#f0fdfa",
    "--vf-color-on-primary": "#ffffff",
    "--vf-color-success-soft": "#e7f6ee",
    "--vf-color-success-text": "#1f6f43",
    "--vf-color-bg": "#f6f7f4",
    "--vf-color-surface": "#ffffff",
    "--vf-color-text": "#1c2521",
    "--vf-color-text-muted": "#4b5a53",
    "--vf-color-border": "#dde3dd",
    "--vf-color-border-strong": "#c3cdc6",
    "--vf-color-focus": "#0d9488",
    "--vf-focus-ring": "0 0 0 3px rgba(13, 148, 136, 0.35)",
    "--vf-radius-md": "10px",
    "--vf-radius-lg": "16px",
    "--vf-font-body": "\"Source Sans 3\", system-ui, -apple-system, \"Segoe UI\", sans-serif"
  },
  "dark": {
    "--vf-color-primary": "#2dd4bf",
    "--vf-color-primary-hover": "#5eead4",
    "--vf-color-primary-active": "#99f6e4",
    "--vf-color-primary-soft": "#042f2e",
    "--vf-color-on-primary": "#042f2e",
    "--vf-color-success-soft": "#0f2e1f",
    "--vf-color-success-text": "#86efac",
    "--vf-color-bg": "#0c1411",
    "--vf-color-surface": "#15201b",
    "--vf-color-text": "#e6ede9",
    "--vf-color-text-muted": "#a3b3ab",
    "--vf-color-border": "#26332d",
    "--vf-color-border-strong": "#3a4a42",
    "--vf-color-focus": "#2dd4bf"
  }
}
```

## 3. Typography
| Role | Size token | Weight | Use |
|---|---|---|---|
| Page title | `--vf-font-size-xl` | strong | one per screen |
| Body | `--vf-font-size-md` | normal | default text |

## 4. Space, corners, shadows
- Card padding `--vf-space-5`.
- Corners: inputs `--vf-radius-md`, **buttons and toggles are pills (`--vf-radius-full`)**, cards `--vf-radius-lg`.
- Shadows: cards are raised, `--vf-shadow-2`.

## 5. Component rules
| Component | Variants (attribute) | States (attribute) | Notes |
|---|---|---|---|
| Button | `data-variant="primary"` | `:hover` uses `--vf-color-primary-hover` | pill |
| Toggle | — | `aria-pressed="true"` uses `--vf-color-primary` / `--vf-color-on-primary` | pill |
| Card | — | — | surface + border + `--vf-shadow-2` |
| Notice | `data-state="success"` | — | `--vf-color-success-soft` background, `--vf-color-success-text` text |

## 9. Accessibility
- Visible focus (`--vf-focus-ring`) on every button.

## 10. Do / Don't
| Do | Don't |
|---|---|
| Use tokens in every CSS rule | Hex or px values outside `tokens.css` |
