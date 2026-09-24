# DESIGN A — Warm

> Sample design source for `skins/a.css` (sample 19). The full `DESIGN.md` template comes with the AI prompt kit.
> 예제 19의 `skins/a.css` 원본입니다. 전체 `DESIGN.md` 템플릿은 AI 프롬프트 킷과 함께 제공됩니다.

## 1. Tone / 톤
Friendly and calm: warm paper background, orange accent, soft rounded cards, serif type. / 따뜻한 종이색 배경, 주황 강조, 둥근 카드, 세리프.

## 2. Tokens / 토큰

```tokens
{
  "light": {
    "--vf-color-primary": "#c2410c",
    "--vf-color-primary-hover": "#9a3412",
    "--vf-color-primary-active": "#7c2d12",
    "--vf-color-primary-soft": "#ffedd5",
    "--vf-color-on-primary": "#ffffff",
    "--vf-color-bg": "#fffaf3",
    "--vf-color-surface": "#ffffff",
    "--vf-color-surface-muted": "#fdf2e4",
    "--vf-color-text": "#292524",
    "--vf-color-text-muted": "#57534e",
    "--vf-color-border": "#f1e3d0",
    "--vf-color-border-strong": "#e7cfb0",
    "--vf-color-focus": "#ea580c",
    "--vf-radius-md": "12px",
    "--vf-radius-lg": "20px",
    "--vf-font-body": "Georgia, \"Noto Serif KR\", serif"
  },
  "dark": "same as light (this brand has no dark theme) / 다크 테마 없음"
}
```

## 9. Accessibility / 접근성
White on `#c2410c` is 5.2:1, body text on the background 14.6:1, muted text on the surface 7.6:1 (WCAG AA). / WCAG AA 충족.
