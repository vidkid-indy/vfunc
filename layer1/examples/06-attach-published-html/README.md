# 06 attach-published-html — the core idea / 핵심 개념

"Keep your HTML, control only what you need." The page is a publisher's static HTML. vfunc controls two areas and leaves everything else alone.
"HTML은 그대로, 제어할 곳만 vfunc로." 퍼블리셔가 만든 정적 페이지에서 두 영역만 vfunc가 제어합니다.

| Area / 영역 | Mode / 방식 | Why / 이유 |
|---|---|---|
| `#product-search` (form) | `vf.attach` **without** `render`: adopt / 채택 | The markup, typed values and styles stay; only `delegates` are added. / 마크업·입력값·스타일 유지, 동작만 추가 |
| `#product-results` | `vf.attach` **with** `render`: replace / 대체 | The list changes with the data, so it is rendered from state. / 데이터에 따라 바뀌므로 상태에서 렌더 |

- Behaviour is bound to `id`, `data-action` and `data-ref` — never to the publisher's classes. A redesign cannot break it. / 동작은 `id`·`data-action`·`data-ref`에만 겁니다. 퍼블리셔의 클래스가 바뀌어도 깨지지 않습니다.
- `vf.form.values(form)` reads `{ q, category }` from the controls with ids. / id가 있는 컨트롤의 값을 읽습니다.
- Prices use `vf.fmt.currency` (Intl). / 가격은 `vf.fmt.currency`로 포맷합니다.

Production CDN and ESM lines: see [01 hello](../01-hello/README.md).
