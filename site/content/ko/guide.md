# 핵심 개념

## 컴포넌트

`vf.vfunc(options)`가 컴포넌트를 만듭니다. `new`를 붙여도, 붙이지 않아도 됩니다.

```js
const box = vf.vfunc({
  tag: 'section',                         // 루트 요소, 기본 'div'
  state: { open: false },                 // 상태
  render: (s) => vf.html`<button type="button" data-action="toggle"
    aria-expanded="${s.open ? 'true' : 'false'}">Details</button>
    ${s.open ? vf.html`<p data-ref="body">More text</p>` : ''}`,
  methods: { close() { this.open = false; } },
  delegates: [{ selector: '[data-action="toggle"]', eventType: 'click',
                onEvent: (e) => { e.sender.open = !e.sender.open; } }]
});
box.mount('#app');
```

- **상태**: `box.open`은 `box.state.open`과 같습니다. 대입하거나 `setState({…})`를 부르면 다시 그리기가 예약되고, 같은 tick의 변경은 한 번만 그립니다.
- **메서드**: 인스턴스에 바인딩되어 `box.close()`로 부르고, 콜백으로 떼어 넘겨도 동작합니다.
- **요소 찾기**: `data-ref="body"` → `box.refs.body`, `id="save"` → `box.ids.save`.

## 이벤트

| 방식 | 쓰는 곳 |
|---|---|
| `delegates: [{ selector, eventType, onEvent }]` | 루트에 리스너 하나. `closest(selector)`로 찾고 루트 밖은 무시. 목록의 모든 행을 이것 하나로 |
| `events: [{ id, eventType, onEvent }]` | 특정 요소에 직접(예: 스크롤, focus) |

이벤트 객체는 `{ sender, event, eventType, target, id, data }`입니다. **셀렉터는 `data-action`·`data-ref`·`id`에만 거세요.** CSS 클래스에 걸면 디자인을 바꿀 때 기능이 깨집니다.

## 기존 HTML 제어 — `vf.attach`

vfunc의 핵심 개념입니다. 퍼블리셔가 만든 HTML을 다시 쓰지 않고 동작만 붙입니다.

```js
// render가 없으면: 기존 요소를 그대로 채택(마크업·입력값·스타일 유지)
vf.attach('#search', {
  delegates: [{ selector: '[data-action="search"]', eventType: 'submit',
                onEvent: (e) => { e.event.preventDefault(); run(vf.form.values(e.sender.$node)); } }]
});

// render가 있으면: 새 마크업으로 대체(데이터에 따라 바뀌는 영역)
const results = vf.attach('#results', { state: { items: [] }, render: (s) => vf.html`…` });
```

## 안전한 HTML — `vf.html`

`vf.html`은 값이 들어가는 **위치**를 보고 처리합니다.

| 위치 | 처리 |
|---|---|
| 요소 내용 `<p>${x}</p>` | HTML 이스케이프. 배열은 이어 붙이고, `vf.html` 결과는 마크업으로 |
| 따옴표 속성 `title="${x}"` | 이스케이프 |
| URL 속성 `href`, `src`, `action` … | 이스케이프 + `vf.safeUrl`(`javascript:` 차단) |
| 태그 안 `<button ${x}>` | `disabled` 같은 속성 이름만 |
| `on*` 속성, `<script>`, 따옴표 없는 속성 | **거부**: 값을 빼고 콘솔에 알림(`vf.config({ strict: true })`면 예외) |

- 템플릿 리터럴을 쓸 수 없는 ES5 코드에서는 `vf.tpl('<a href="{url}">{label}</a>', data)`이 같은 보호를 합니다.
- `vf.unsafeHtml(markup)`은 **직접 작성한** 마크업(아이콘 SVG 등)에만, 이유를 주석으로 남기고 씁니다.

## 라이프사이클과 서드파티 위젯

| 훅 | 시점 | 할 일 |
|---|---|---|
| `onMount` | `mount()`·`vf.attach()`로 페이지에 들어간 직후 | 차트·에디터 만들기, 데이터 불러오기, 구독 |
| `onUpdate` | 다시 그릴 때마다 | 위젯에 새 상태 반영 |
| `onDestroy` | `destroy()` 시작 시 | 위젯·타이머·구독 정리 |

다시 그려도 사라지면 안 되는 요소(차트 캔버스 등)는 `data-vf-keep="chart"`로 표시합니다. 새로 만들지 않고 그 요소를 옮깁니다. 자세한 예는 [예제 15](examples.md)입니다.

## 자식과 슬롯

`childs: [{ targetId: 'main', component: child }]`는 자식을 `id="main"` 요소에 붙이고, 부모가 다시 그려도 자식을 옮겨 붙여 상태를 유지합니다. 엔진은 자식을 자동으로 정리하지 않으므로 부모의 `onDestroy`에서 `child.destroy()`를 부르세요.

## 폼

`vf.form.values(form)`은 id가 있는 입력의 값을 `{ id: value }`로 읽습니다(체크박스는 boolean). `vf.form.reset(form)`은 값을 비웁니다. 값을 로그로 남기지 말고, 화면에 보일 때는 `{ skipPassword: true }`로 비밀번호를 빼세요.

## 자주 하는 실수

- `render`에서 `vf.html` 없이 문자열을 만들기 → 이스케이프되지 않습니다.
- 목록의 행마다 컴포넌트를 만들기 → 위임 하나로 처리하세요.
- 입력할 때마다 `setState` → 값만 저장하고 제출 때 그리세요.
- 표의 행을 그리는 컴포넌트에 `tag: 'table'`을 주지 않기 → `<tr>`이 사라집니다.
- 클라이언트 라우트로 권한을 막았다고 생각하기 → 권한은 서버에서 검사합니다.
