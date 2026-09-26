# custom-component — your own components / 내 컴포넌트

A cart made of the app's own `vsPriceTag` (vsBadge + vf.fmt) and `vfCartLine` (vfNumberInput + vsPriceTag), with a brand color and rounder buttons from CSS only. / 앱의 vsPriceTag(vsBadge + vf.fmt)와 vfCartLine(vfNumberInput + vsPriceTag)으로 만든 장바구니. 브랜드 색과 버튼 모양은 CSS에서만 바꿉니다.

| Level / 수준 | Where / 위치 | What / 내용 |
|---|---|---|
| C1 settings / 설정 | `style.css` `:root` | `--vf-color-primary` for this app |
| C2 style / 스타일 | `style.css` | `.cart .vf-button` outside the vf layers wins without `!important` |
| C3 composition / 조합 | `shop-ui.js` | components built from the official ones |

- **Your components live in your module** (`shop-ui.js`), not on `vf`: the `vf.*` root is reserved. Share them across apps as a plugin under `vf.ext.<name>` (EXTENDING.md). / 내 컴포넌트는 내 모듈에 둡니다. vf 루트는 예약 영역입니다.
- They follow the layer 2 rules: `vs*` returns SafeHtml, `vf*` returns an instance with `getValue` / `setValue` and callbacks that get `{ sender, event, data }`; hooks on `id` / `data-ref` / `data-action`; classes `<block>__<element>`; colors and sizes as tokens. / layer2와 같은 규칙을 따릅니다.
- ES modules: `app.js` imports `vfunc.esm.js` and `vfunc-ui.esm.js`, as an npm project would (`import vf from 'vfunc'`, `import 'vfunc/ui'`). / npm 프로젝트와 같은 import 형태입니다.
