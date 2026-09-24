# 20 merge-published — published HTML arrives after development / 개발 후 퍼블리싱 HTML 도착

A common case in agency projects: the screen already works, then the publisher's HTML arrives (plan K-4 ⑤). Keep the logic, replace only the `render` markup, and put the existing hooks back. / 로직은 그대로 두고 render 마크업만 퍼블리싱 마크업으로 바꾸며 기존 훅을 다시 답니다.

| File / 파일 | Role / 역할 |
|---|---|
| `logic.js` | state, methods, delegates — **unchanged** / 변경 없음 |
| `views/dev.js` → `before.html` | the developer's first view / 개발자의 첫 화면 |
| `published/order.html` | the publisher's static HTML, kept as the source / 퍼블리셔 원본 |
| `views/published.js` → `index.html` | the merged view / 병합 결과 |
| `published.css` | the publisher's CSS with raw values replaced by tokens / 원시 값을 토큰으로 바꾼 CSS |

## Selector mapping / 셀렉터 매핑표

| Hook / 훅 | Before (`views/dev.js`) | After (published markup) |
|---|---|---|
| `data-id="{id}"` | `li.list__item` | `div.line` |
| `data-action="dec"` / `"inc"` (+ `id="dec-{id}"` / `"inc-{id}"`) | `button.btn` | `button.stepper__btn` |
| `data-ref="qty-{id}"` | `span` | `span.stepper__value` |
| `data-action="apply-coupon"` (submit) | `form.row` | `form.coupon` |
| `data-ref="coupon"` | `input.field__input` | `input.coupon__input` |
| `data-ref="message"` | `p` | `p.coupon__msg` (+ `data-state` for the color) |
| `data-ref="total"` | `span` in the total line | `dd` in `.totals__row--grand` |

- Our browser test runs the same clicks on both pages and checks the same results. / 테스트가 두 페이지에서 같은 동작과 결과를 확인합니다.
- If the published markup needs a structure change the logic depends on, report it as a separate "structure change" and commit it separately (rule 21). / 로직이 기대는 구조를 바꿔야 하면 "구조 변경"으로 따로 보고하고 커밋도 나눕니다.
