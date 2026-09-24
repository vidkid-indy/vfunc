# DESIGN.md — `<product name>`

> The single source of design for this project (plan K-3). `styles/tokens.css` is derived from the `tokens` block below; change this file first, then regenerate the tokens (prompt `prompt-apply-design.md`).
> Template for vfunc.js 1.0. Values below are the neutral defaults of `vfunc.tokens.css`. Mark guesses with `TBD:`.

## 1. Brand and tone
- Personality: `<calm, precise, friendly …>`
- Audience and context: `<office users on desktops, field staff on tablets …>`
- Words to avoid in UI copy: `<…>`

## 2. Tokens
Machine-readable. Keys map 1:1 to `--vf-*` variables. `light` is required; `dark` is optional (write `"same as light"` or omit if there is no dark theme).

```tokens
{
  "light": {
    "--vf-color-primary": "#2563eb",
    "--vf-color-primary-hover": "#1d4ed8",
    "--vf-color-primary-active": "#1e40af",
    "--vf-color-primary-soft": "#eff6ff",
    "--vf-color-on-primary": "#ffffff",
    "--vf-color-success": "#059669", "--vf-color-success-soft": "#ecfdf5", "--vf-color-success-text": "#047857",
    "--vf-color-warning": "#d97706", "--vf-color-warning-soft": "#fffbeb", "--vf-color-warning-text": "#b45309",
    "--vf-color-danger": "#dc2626", "--vf-color-danger-soft": "#fef2f2", "--vf-color-danger-text": "#b91c1c",
    "--vf-color-info": "#2563eb", "--vf-color-info-soft": "#eff6ff", "--vf-color-info-text": "#1d4ed8",
    "--vf-color-bg": "#f8fafc",
    "--vf-color-surface": "#ffffff",
    "--vf-color-surface-muted": "#f1f5f9",
    "--vf-color-overlay": "rgba(15, 23, 42, 0.5)",
    "--vf-color-text": "#0f172a",
    "--vf-color-text-muted": "#475569",
    "--vf-color-text-disabled": "#94a3b8",
    "--vf-color-text-inverse": "#ffffff",
    "--vf-color-border": "#e2e8f0",
    "--vf-color-border-strong": "#cbd5e1",
    "--vf-color-focus": "#3b82f6",
    "--vf-focus-ring": "0 0 0 3px rgba(59, 130, 246, 0.35)",
    "--vf-chart-1": "#2563eb", "--vf-chart-2": "#d97706", "--vf-chart-3": "#059669", "--vf-chart-4": "#dc2626",
    "--vf-chart-5": "#7c3aed", "--vf-chart-6": "#0891b2", "--vf-chart-7": "#db2777", "--vf-chart-8": "#65a30d",
    "--vf-shadow-1": "0 1px 2px rgba(15, 23, 42, 0.06)",
    "--vf-shadow-2": "0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)",
    "--vf-shadow-3": "0 10px 15px -3px rgba(15, 23, 42, 0.12), 0 4px 6px -4px rgba(15, 23, 42, 0.1)",
    "--vf-radius-sm": "4px", "--vf-radius-md": "6px", "--vf-radius-lg": "10px", "--vf-radius-full": "9999px",
    "--vf-space-1": "4px", "--vf-space-2": "8px", "--vf-space-3": "12px", "--vf-space-4": "16px",
    "--vf-space-5": "24px", "--vf-space-6": "32px", "--vf-space-7": "48px",
    "--vf-font-body": "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Noto Sans KR\", \"Malgun Gothic\", sans-serif",
    "--vf-font-mono": "ui-monospace, \"Cascadia Code\", Consolas, \"D2Coding\", monospace",
    "--vf-font-size-xs": "12px", "--vf-font-size-sm": "13px", "--vf-font-size-md": "14px",
    "--vf-font-size-lg": "16px", "--vf-font-size-xl": "20px", "--vf-font-size-2xl": "24px",
    "--vf-font-weight-normal": "400", "--vf-font-weight-strong": "600", "--vf-line-height": "1.5",
    "--vf-duration-fast": "0.15s", "--vf-duration-base": "0.2s", "--vf-easing": "ease",
    "--vf-z-dropdown": "1000", "--vf-z-popover": "1100", "--vf-z-drawer": "1200", "--vf-z-modal": "1300", "--vf-z-toast": "1400"
  },
  "dark": {
    "--vf-color-primary": "#60a5fa", "--vf-color-primary-hover": "#93c5fd", "--vf-color-primary-active": "#bfdbfe",
    "--vf-color-primary-soft": "#172554", "--vf-color-on-primary": "#0f172a",
    "--vf-color-bg": "#0f172a", "--vf-color-surface": "#1e293b", "--vf-color-surface-muted": "#273449",
    "--vf-color-text": "#f1f5f9", "--vf-color-text-muted": "#94a3b8", "--vf-color-text-disabled": "#64748b",
    "--vf-color-text-inverse": "#0f172a", "--vf-color-border": "#334155", "--vf-color-border-strong": "#475569",
    "--vf-color-focus": "#60a5fa"
  }
}
```

## 3. Typography
| Role | Size token | Weight | Use |
|---|---|---|---|
| Page title | `--vf-font-size-2xl` | strong | one per screen |
| Section title | `--vf-font-size-lg` | strong | cards, panels |
| Body | `--vf-font-size-md` | normal | default text |
| Small | `--vf-font-size-sm` | normal | hints, table meta |

## 4. Space, corners, shadows, breakpoints
- Spacing scale: `--vf-space-1..7`; card padding `--vf-space-4`, gap between sections `--vf-space-5`.
- Corners: inputs and buttons `--vf-radius-md`, cards `--vf-radius-lg`, pills `--vf-radius-full`.
- Shadows: resting cards `--vf-shadow-1`, raised panels `--vf-shadow-2`, dialogs and toasts `--vf-shadow-3`.
- Breakpoints: `<600px phone · 900px tablet>` (CSS media queries only; JS never reads them).

## 5. Component rules
| Component | Variants (attribute) | States (attribute) | Notes |
|---|---|---|---|
| Button | `data-variant="primary \| danger"` | `:disabled`, `aria-pressed` | one primary per area |
| Input | — | `aria-invalid="true"` | error text under the field |
| Card | — | — | surface + border + `--vf-shadow-1` |
| Table | — | `aria-sort`, `aria-selected` | row height `TBD:` |
| Navigation | — | `aria-current="page"` | |
| Dialog | — | `aria-modal` | `--vf-z-modal` |
| Notice / toast | `data-state="info \| success \| warning \| error"` | — | soft background + text token |

## 6. Layout patterns
`<app shell: top bar + side navigation + content; content width …>`

## 7. Icons and images
`<icon set, size (px), stroke; image ratios; alt text rules>`

## 8. Motion
`--vf-duration-fast` for hover and focus, `--vf-duration-base` for panels. Respect `prefers-reduced-motion`.

## 9. Accessibility
- Text contrast ≥ 4.5:1, large text and UI parts ≥ 3:1 (WCAG AA) in every theme. Check `on-primary` on `primary`, `*-text` on `*-soft`, `text-muted` on `surface`.
- Visible focus (`--vf-focus-ring`); never remove outlines without a replacement.
- State is never shown by color alone (icon, text or shape as well).

## 10. Do / Don't
| Do | Don't |
|---|---|
| Use tokens in every CSS rule | Hex or px values outside `tokens.css` |
| Show state with `aria-*` / `data-state` | Toggle classes from JS for state |
| One primary button per area | Several competing primary actions |
