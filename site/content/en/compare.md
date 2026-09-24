# Compare: Vanilla · vfunc · React/Vue

The same feature (add a to-do, show the list) written three ways shows the differences. None is always better; choose for the job.

## Vanilla JS

```js
const list = document.querySelector('#list');
const items = [];
document.querySelector('#add').addEventListener('click', () => {
  const input = document.querySelector('#text');
  items.push(input.value);
  list.innerHTML = items.map((t) => '<li>' + t + '</li>').join('');  // no escaping → XSS
  input.value = '';
});
```

- No tools needed, but escaping, listener cleanup and keeping state and screen in sync are on you every time.
- As screens grow, "what re-renders where" spreads out.

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

- No build; `vf.html` escapes each value for its position.
- A state change renders once; one delegated listener on the root handles events.

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

- Needs JSX and a bundler. The richest ecosystem and tooling.
- The virtual DOM updates only what changed, which helps with large lists.

## What to use when

| | Vanilla | vfunc.js | React / Vue |
|---|---|---|---|
| Build | none | none | required |
| Size (gzip) | 0 | about 9 KB | about 34–45 KB + app |
| Escaping | by hand | automatic, by position | automatic (JSX / templates) |
| Behaviour on existing HTML | by hand | `vf.attach` | hard |
| Large lists | optimize by hand | weaker (full replace, see [FAQ](faq.md)) | strong |
| IE11 | by hand | legacy file | practically no |
| Ecosystem, hiring | — | small | large |

vfunc.js fits well when you add behaviour to server-rendered or published HTML, when a build pipeline is hard to set up (intranets), when you build screens quickly with AI, and when IE still has to work.
