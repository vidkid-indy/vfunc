# 01 hello

The smallest vfunc.js page: one `<script>` tag and one component. `esm.html` shows the same component as an ES module.
가장 작은 vfunc.js 페이지입니다. `<script>` 한 줄과 컴포넌트 하나로 끝납니다. `esm.html`은 같은 컴포넌트를 ES 모듈로 보여 줍니다.

| File / 파일 | Shows / 보여 주는 것 |
|---|---|
| `index.html` + `app.js` | global `vf` from `dist/vfunc.js` / 전역 `vf` |
| `esm.html` + `app.esm.js` | `import vf from '…/vfunc.esm.js'` |

## Load it in your project / 내 프로젝트에서 불러오기

```html
<!-- Production: exact version + SRI / 운영: 정확한 버전 + SRI -->
<script src="https://cdn.jsdelivr.net/npm/vfunc@1.0.0-rc.2/dist/vfunc.min.js"
        integrity="sha384-UeQW7ievyV8iCu5aVhO1m9GaBzCEqNGRhgaXopQv6bK0gGVbtZpU1DnMIBd94h9e"
        crossorigin="anonymous"></script>
```

```js
// npm i vfunc
import vf from 'vfunc';
```

## Points / 핵심

- `render` returns `vf.html` markup: every value is escaped for where it lands. / `vf.html`은 값을 위치에 맞게 이스케이프합니다.
- Events are bound with `delegates` on `data-action`, never on CSS classes. / 이벤트는 `data-action`에 겁니다(CSS 클래스 금지).
- `e.sender.name = …` schedules one render; focus and caret are restored. / 상태 대입은 렌더를 예약하고 포커스를 복원합니다.
