Reference answer for the grader tests (not part of any bundle).

### styles/tokens.css

```css
/* Derived from design/DESIGN.md ("Pine"). Raw values live only here. */
:root {
  color-scheme: light dark;
  --vf-color-primary: #0f766e;
  --vf-color-primary-hover: #115e59;
  --vf-color-primary-active: #134e4a;
  --vf-color-primary-soft: #f0fdfa;
  --vf-color-on-primary: #ffffff;
  --vf-color-success: #059669;
  --vf-color-success-soft: #e7f6ee;
  --vf-color-success-text: #1f6f43;
  --vf-color-warning: #d97706;
  --vf-color-warning-soft: #fffbeb;
  --vf-color-warning-text: #b45309;
  --vf-color-danger: #dc2626;
  --vf-color-danger-soft: #fef2f2;
  --vf-color-danger-text: #b91c1c;
  --vf-color-info: #2563eb;
  --vf-color-info-soft: #eff6ff;
  --vf-color-info-text: #1d4ed8;
  --vf-color-bg: #f6f7f4;
  --vf-color-surface: #ffffff;
  --vf-color-surface-muted: #f1f5f9;
  --vf-color-overlay: rgba(15, 23, 42, 0.5);
  --vf-color-text: #1c2521;
  --vf-color-text-muted: #4b5a53;
  --vf-color-text-disabled: #94a3b8;
  --vf-color-text-inverse: #ffffff;
  --vf-color-border: #dde3dd;
  --vf-color-border-strong: #c3cdc6;
  --vf-color-focus: #0d9488;
  --vf-focus-ring: 0 0 0 3px rgba(13, 148, 136, 0.35);
  --vf-chart-1: #2563eb;
  --vf-chart-2: #d97706;
  --vf-chart-3: #059669;
  --vf-chart-4: #dc2626;
  --vf-chart-5: #7c3aed;
  --vf-chart-6: #0891b2;
  --vf-chart-7: #db2777;
  --vf-chart-8: #65a30d;
  --vf-shadow-1: 0 1px 2px rgba(15, 23, 42, 0.06);
  --vf-shadow-2: 0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1);
  --vf-shadow-3: 0 10px 15px -3px rgba(15, 23, 42, 0.12), 0 4px 6px -4px rgba(15, 23, 42, 0.1);
  --vf-radius-sm: 4px;
  --vf-radius-md: 10px;
  --vf-radius-lg: 16px;
  --vf-radius-full: 9999px;
  --vf-space-1: 4px;
  --vf-space-2: 8px;
  --vf-space-3: 12px;
  --vf-space-4: 16px;
  --vf-space-5: 24px;
  --vf-space-6: 32px;
  --vf-space-7: 48px;
  --vf-font-body: "Source Sans 3", system-ui, -apple-system, "Segoe UI", sans-serif;
  --vf-font-mono: ui-monospace, "Cascadia Code", Consolas, "D2Coding", monospace;
  --vf-font-size-xs: 12px;
  --vf-font-size-sm: 13px;
  --vf-font-size-md: 14px;
  --vf-font-size-lg: 16px;
  --vf-font-size-xl: 20px;
  --vf-font-size-2xl: 24px;
  --vf-font-weight-normal: 400;
  --vf-font-weight-strong: 600;
  --vf-line-height: 1.5;
  --vf-duration-fast: 0.15s;
  --vf-duration-base: 0.2s;
  --vf-easing: ease;
  --vf-z-dropdown: 1000;
  --vf-z-popover: 1100;
  --vf-z-drawer: 1200;
  --vf-z-modal: 1300;
  --vf-z-toast: 1400;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --vf-color-primary: #2dd4bf;
    --vf-color-primary-hover: #5eead4;
    --vf-color-primary-active: #99f6e4;
    --vf-color-primary-soft: #042f2e;
    --vf-color-on-primary: #042f2e;
    --vf-color-success: #34d399;
    --vf-color-success-soft: #0f2e1f;
    --vf-color-success-text: #86efac;
    --vf-color-warning: #fbbf24;
    --vf-color-warning-soft: #422006;
    --vf-color-warning-text: #fcd34d;
    --vf-color-danger: #f87171;
    --vf-color-danger-soft: #450a0a;
    --vf-color-danger-text: #fca5a5;
    --vf-color-info: #60a5fa;
    --vf-color-info-soft: #172554;
    --vf-color-info-text: #93c5fd;
    --vf-color-bg: #0c1411;
    --vf-color-surface: #15201b;
    --vf-color-surface-muted: #273449;
    --vf-color-overlay: rgba(2, 6, 23, 0.7);
    --vf-color-text: #e6ede9;
    --vf-color-text-muted: #a3b3ab;
    --vf-color-text-disabled: #64748b;
    --vf-color-text-inverse: #0f172a;
    --vf-color-border: #26332d;
    --vf-color-border-strong: #3a4a42;
    --vf-color-focus: #2dd4bf;
    --vf-focus-ring: 0 0 0 3px rgba(96, 165, 250, 0.45);
    --vf-chart-1: #60a5fa;
    --vf-chart-2: #fbbf24;
    --vf-chart-3: #34d399;
    --vf-chart-4: #f87171;
    --vf-chart-5: #a78bfa;
    --vf-chart-6: #22d3ee;
    --vf-chart-7: #f472b6;
    --vf-chart-8: #a3e635;
    --vf-shadow-1: 0 1px 2px rgba(0, 0, 0, 0.4);
    --vf-shadow-2: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4);
    --vf-shadow-3: 0 10px 15px -3px rgba(0, 0, 0, 0.55), 0 4px 6px -4px rgba(0, 0, 0, 0.45);
  }
}

:root[data-theme="dark"] {
  color-scheme: dark;
  --vf-color-primary: #2dd4bf;
  --vf-color-primary-hover: #5eead4;
  --vf-color-primary-active: #99f6e4;
  --vf-color-primary-soft: #042f2e;
  --vf-color-on-primary: #042f2e;
  --vf-color-success: #34d399;
  --vf-color-success-soft: #0f2e1f;
  --vf-color-success-text: #86efac;
  --vf-color-warning: #fbbf24;
  --vf-color-warning-soft: #422006;
  --vf-color-warning-text: #fcd34d;
  --vf-color-danger: #f87171;
  --vf-color-danger-soft: #450a0a;
  --vf-color-danger-text: #fca5a5;
  --vf-color-info: #60a5fa;
  --vf-color-info-soft: #172554;
  --vf-color-info-text: #93c5fd;
  --vf-color-bg: #0c1411;
  --vf-color-surface: #15201b;
  --vf-color-surface-muted: #273449;
  --vf-color-overlay: rgba(2, 6, 23, 0.7);
  --vf-color-text: #e6ede9;
  --vf-color-text-muted: #a3b3ab;
  --vf-color-text-disabled: #64748b;
  --vf-color-text-inverse: #0f172a;
  --vf-color-border: #26332d;
  --vf-color-border-strong: #3a4a42;
  --vf-color-focus: #2dd4bf;
  --vf-focus-ring: 0 0 0 3px rgba(96, 165, 250, 0.45);
  --vf-chart-1: #60a5fa;
  --vf-chart-2: #fbbf24;
  --vf-chart-3: #34d399;
  --vf-chart-4: #f87171;
  --vf-chart-5: #a78bfa;
  --vf-chart-6: #22d3ee;
  --vf-chart-7: #f472b6;
  --vf-chart-8: #a3e635;
  --vf-shadow-1: 0 1px 2px rgba(0, 0, 0, 0.4);
  --vf-shadow-2: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4);
  --vf-shadow-3: 0 10px 15px -3px rgba(0, 0, 0, 0.55), 0 4px 6px -4px rgba(0, 0, 0, 0.45);
}

:root[data-theme="light"] {
  color-scheme: light;
}
```

### styles/app.css

```css
body { margin: 0; background: var(--vf-color-bg); color: var(--vf-color-text); font-family: var(--vf-font-body); line-height: var(--vf-line-height); }
.page { max-width: 32rem; margin: var(--vf-space-6) auto; padding: 0 var(--vf-space-4); }

.card { padding: var(--vf-space-5); background: var(--vf-color-surface); border: 1px solid var(--vf-color-border); border-radius: var(--vf-radius-lg); box-shadow: var(--vf-shadow-2); }
.card__title { margin: 0 0 var(--vf-space-2); font-size: var(--vf-font-size-xl); font-weight: var(--vf-font-weight-strong); }
.card__text { color: var(--vf-color-text-muted); }
.card__actions { display: flex; justify-content: flex-end; gap: var(--vf-space-2); margin-top: var(--vf-space-4); }

.button { padding: var(--vf-space-2) var(--vf-space-4); border: 1px solid var(--vf-color-border-strong); border-radius: var(--vf-radius-full); background: var(--vf-color-surface); color: var(--vf-color-text); font: inherit; }
.button[data-variant="primary"] { border-color: transparent; background: var(--vf-color-primary); color: var(--vf-color-on-primary); }
.button[data-variant="primary"]:hover { background: var(--vf-color-primary-hover); }
.button:focus-visible, .toggle:focus-visible { outline: none; box-shadow: var(--vf-focus-ring); }

.toggle { padding: var(--vf-space-1) var(--vf-space-3); border: 1px solid var(--vf-color-border-strong); border-radius: var(--vf-radius-full); background: var(--vf-color-surface); color: var(--vf-color-text); font: inherit; }
.toggle[aria-pressed="true"] { border-color: transparent; background: var(--vf-color-primary); color: var(--vf-color-on-primary); }

.list { list-style: none; margin: var(--vf-space-4) 0 0; padding: 0; }
.list__item { display: flex; justify-content: space-between; padding: var(--vf-space-2) 0; border-top: 1px solid var(--vf-color-border); }
.badge { padding: 0 var(--vf-space-2); border-radius: var(--vf-radius-full); font-size: var(--vf-font-size-xs); }
.badge[data-state="on"] { background: var(--vf-color-success-soft); color: var(--vf-color-success-text); }
.badge[data-state="off"] { background: var(--vf-color-surface-muted); color: var(--vf-color-text-muted); }

.notice[data-state="success"] { margin: var(--vf-space-3) 0 0; padding: var(--vf-space-2) var(--vf-space-3); border-radius: var(--vf-radius-md); background: var(--vf-color-success-soft); color: var(--vf-color-success-text); }
```

### design/STATUS.md

```markdown
# Design status

| Screen | Status | Remaining differences |
|---|---|---|
| Settings | done | none |
```

### REPORT.md

Reference solution.
