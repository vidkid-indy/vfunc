# 11 css-tokens-theme

- `css/vfunc.tokens.css` is an optional, neutral skin with light and dark themes. The engine never needs it. / 선택형 중립 스킨입니다.
- Token names (`--vf-color-primary`, `--vf-space-3`, `--vf-shadow-2`, `--vf-chart-1..8`, …) are public API. / 토큰 이름은 공개 API입니다.
- Dark mode follows the OS; `<html data-theme="light|dark">` forces a theme. The picker changes only that attribute. / 다크 모드는 OS를 따르고, 속성으로 강제할 수 있습니다.
- `theme-early.js` runs in `<head>` so a saved theme is applied before the first paint. It is a file, not an inline script, because of the CSP. / 첫 화면 전에 적용하며, CSP 때문에 외부 파일입니다.
- Rule: JS holds no colors, fonts or spacing; CSS reads only `var(--vf-*)`. / JS에는 디자인 값을 넣지 않습니다.
- Restyle the whole app by editing tokens only — see samples 18 and 19. / 토큰만 바꿔 전체 디자인을 바꾸는 예는 18·19.
