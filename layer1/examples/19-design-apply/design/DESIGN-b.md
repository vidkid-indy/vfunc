# DESIGN B — Studio

> Sample design source for `skins/b.css` (sample 19). / 예제 19의 `skins/b.css` 원본입니다.

## 1. Tone / 톤
A dark tool look: near-black surfaces, cyan accent, sharp corners, monospace type, no shadows. / 어두운 도구 느낌, 시안 강조, 각진 모서리, 고정폭 글꼴, 그림자 없음.

## 2. Tokens / 토큰

```tokens
{
  "dark": {
    "--vf-color-primary": "#22d3ee",
    "--vf-color-primary-hover": "#67e8f9",
    "--vf-color-primary-active": "#a5f3fc",
    "--vf-color-primary-soft": "#083344",
    "--vf-color-on-primary": "#082f49",
    "--vf-color-bg": "#0b0f19",
    "--vf-color-surface": "#111827",
    "--vf-color-surface-muted": "#1f2937",
    "--vf-color-text": "#f9fafb",
    "--vf-color-text-muted": "#9ca3af",
    "--vf-color-border": "#1f2937",
    "--vf-color-border-strong": "#374151",
    "--vf-radius-md": "2px",
    "--vf-radius-lg": "4px",
    "--vf-shadow-2": "none",
    "--vf-font-body": "ui-monospace, \"Cascadia Code\", Consolas, \"D2Coding\", monospace"
  },
  "light": "not provided: the brand is always dark / 제공하지 않음(항상 다크)"
}
```

## 9. Accessibility / 접근성
`#082f49` on `#22d3ee` is 7.7:1; muted text on the surface is 7.0:1 (WCAG AA). / WCAG AA 충족.
