# 04 methods-refs

- `methods` become the component's public API: `notes.add('…')`, `notes.clear()`, `notes.count()`. They are bound, so `onEvent: notes.clear` works. / `methods`는 컴포넌트의 공개 기능이 되고, 바인딩되어 콜백으로 넘길 수 있습니다.
- `refs` maps `data-ref="name"` to elements, refreshed on every render. Use it instead of ids when a component may appear twice. / `refs`는 `data-ref`를 요소로 연결합니다. 같은 컴포넌트를 두 번 써도 id처럼 충돌하지 않습니다.
- The toolbar is ordinary HTML controlled with `vf.attach` (see sample 06). / 도구 모음은 `vf.attach`로 제어하는 평범한 HTML입니다.

Production CDN and ESM lines: see [01 hello](../01-hello/README.md).
