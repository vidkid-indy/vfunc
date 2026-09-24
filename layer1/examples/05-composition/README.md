# 05 composition

- `childs: [{ targetId: 'main', component }]` puts a child into the element with that id (a slot). / 자식을 해당 id 요소(슬롯)에 붙입니다.
- When the layout renders again ("Rename layout"), children are **moved** back into the new markup: their state and listeners stay. Click +1, then rename: the counts remain. / 레이아웃이 다시 렌더하면 자식은 새 마크업으로 **옮겨지고** 상태와 리스너가 유지됩니다.
- `innerHTML` is for fixed markup you wrote; for data use `render` with `vf.html`. / `innerHTML`은 직접 작성한 고정 마크업용입니다.
- The engine does not destroy children automatically: the layout's `onDestroy` does it. / 자식 정리는 부모의 `onDestroy`에서 합니다.

Production CDN and ESM lines: see [01 hello](../01-hello/README.md).
