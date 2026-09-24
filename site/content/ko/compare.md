# 비교: Vanilla · vfunc · React/Vue

같은 기능(할 일 추가와 목록)을 세 방식으로 쓰면 차이가 드러납니다. 어느 쪽이 항상 낫다는 뜻은 아닙니다. 목적에 맞게 고르세요.

## Vanilla JS

```js
const list = document.querySelector('#list');
const items = [];
document.querySelector('#add').addEventListener('click', () => {
  const input = document.querySelector('#text');
  items.push(input.value);
  list.innerHTML = items.map((t) => '<li>' + t + '</li>').join('');  // 이스케이프 누락 → XSS
  input.value = '';
});
```

- 도구가 필요 없지만, 이스케이프·이벤트 정리·상태와 화면의 동기화를 매번 직접 해야 합니다.
- 화면이 커질수록 "어디서 무엇을 다시 그리는지"가 흩어집니다.

## vfunc.js

```js
const todo = vf.vfunc({
  state: { items: [] },
  render: (s) => vf.html`
    <form data-action="add"><input data-ref="text"><button>Add</button></form>
    <ul>${s.items.map((t) => vf.html`<li>${t}</li>`)}</ul>`,
  delegates: [{ selector: '[data-action="add"]', eventType: 'submit', onEvent: (e) => {
    e.event.preventDefault();
    e.sender.setState({ items: e.sender.items.concat(e.sender.refs.text.value) });
  } }]
});
todo.mount('#app');
```

- 빌드가 없고, 이스케이프는 `vf.html`이 위치에 맞게 해 줍니다.
- 상태를 바꾸면 한 번만 다시 그리고, 이벤트는 루트의 위임 하나가 처리합니다.

## React

```jsx
function Todo() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); setItems([...items, text]); setText(''); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} /><button>Add</button>
      </form>
      <ul>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </>
  );
}
```

- JSX와 번들러가 필요합니다. 생태계와 도구가 가장 풍부합니다.
- Virtual DOM이 바뀐 부분만 갱신하므로 큰 목록에 강합니다.

## 어떤 경우에 무엇을

| | Vanilla | vfunc.js | React / Vue |
|---|---|---|---|
| 빌드 | 없음 | 없음 | 필요 |
| 크기(gzip) | 0 | 약 9KB | 약 34~45KB + 앱 |
| 이스케이프 | 직접 | 위치별 자동 | 자동(JSX/템플릿) |
| 기존 HTML에 동작만 붙이기 | 직접 | `vf.attach` | 어려움 |
| 큰 목록 성능 | 직접 최적화 | 불리함(전체 교체, [FAQ](faq.md) 참고) | 유리 |
| IE11 | 직접 | legacy 파일 | 사실상 불가 |
| 생태계·채용 | — | 작음 | 큼 |

vfunc.js가 잘 맞는 곳: 서버 렌더링 페이지나 퍼블리싱 HTML에 동작을 붙일 때, 사내 시스템처럼 빌드 파이프라인을 두기 어려울 때, AI와 함께 빠르게 화면을 만들 때, IE를 아직 지원해야 할 때.
