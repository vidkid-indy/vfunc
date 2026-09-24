# 19 design-apply — "the design can come later" / 디자인은 나중에 와도 된다

One app, three skins, **no JS change** (plan section K). / 같은 앱, 스킨 세 개, **JS 변경 0**.

| Skin / 스킨 | Source / 원본 | Stylesheet / 스타일 |
|---|---|---|
| Neutral / 중립 | `css/vfunc.tokens.css` | — |
| A · Warm | `design/DESIGN-a.md` | `skins/a.css` |
| B · Studio | `design/DESIGN-b.md` | `skins/b.css` |

Why it works / 가능한 이유:
1. Behaviour is bound to `data-action` / `data-ref`, never to classes. / 동작은 클래스에 걸지 않습니다.
2. `render` markup carries structure and meaning; state is `aria-pressed` / `data-state`. / 상태는 속성으로.
3. `app.js` holds no colors, fonts or spacing; `app.css` reads only `var(--vf-*)`. / JS에 디자인 값이 없습니다.
4. `DESIGN.md` is the source of truth; the skin file is derived from its `tokens` block. / `DESIGN.md`가 원본, 스킨은 파생물.

Our browser test opens the three skins, clicks the same buttons and checks that the **rendered DOM is identical** while the computed colors differ. / 테스트가 세 스킨에서 렌더된 DOM이 같고 색만 다른지 확인합니다.

`skin.js` only picks a stylesheet from an allow-list (`?skin=a|b`); it is page setup, not app logic. / `skin.js`는 페이지 설정일 뿐 앱 로직이 아닙니다.
