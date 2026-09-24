Reference answer for the grader tests (not part of any bundle).

### app.js

```js
// My tasks — the page script. The to-do list lives in #todo.
let nextId = 1;

const FILTERS = [['all', 'All'], ['open', 'Open'], ['done', 'Done']];
const shows = (filter, item) => filter === 'all' || (filter === 'done') === item.done;

vf.attach('#todo', {
  state: { items: [], filter: 'all' },
  render: (s) => {
    const shown = s.items.filter((item) => shows(s.filter, item));
    return vf.html`
      <form class="todo__form" data-action="add">
        <label class="todo__label" for="todo-input">New task</label>
        <input class="todo__input" id="todo-input" data-ref="input" autocomplete="off">
        <button class="todo__button" type="submit">Add</button>
      </form>
      <div class="todo__filters" role="group" aria-label="Filter">
        ${FILTERS.map((f) => vf.html`<button class="todo__filter" type="button" data-action="filter" data-filter="${f[0]}" aria-pressed="${s.filter === f[0]}">${f[1]}</button>`)}
      </div>
      <ul class="todo__list" data-ref="list">${shown.map((item) => vf.html`
        <li class="todo__item" data-id="${item.id}" data-state="${item.done ? 'done' : 'open'}">
          <input type="checkbox" id="todo-${item.id}" data-action="toggle" aria-label="Done" ${item.done ? 'checked' : ''}>
          <span class="todo__text" data-ref="text">${item.text}</span>
          <button class="todo__remove" type="button" data-action="remove">Remove</button>
        </li>`)}</ul>
      ${shown.length === 0 ? vf.html`<p class="todo__empty" data-ref="empty">Nothing here.</p>` : ''}
      <p class="todo__left"><span data-ref="left">${s.items.filter((item) => !item.done).length}</span> left</p>`;
  },
  methods: {
    add(text) {
      const value = String(text || '').trim();
      if (!value) return;
      // Render now so the new, empty input can take the focus for the next task.
      this.state.items = this.items.concat({ id: nextId++, text: value, done: false });
      this.refresh();
      this.refs.input.focus();
    },
    toggle(id) {
      this.setState({ items: this.items.map((item) => (item.id === id ? { id: item.id, text: item.text, done: !item.done } : item)) });
    },
    remove(id) {
      this.setState({ items: this.items.filter((item) => item.id !== id) });
    }
  },
  delegates: [
    {
      selector: '[data-action="add"]',
      eventType: 'submit',
      onEvent: (e) => {
        e.event.preventDefault();
        e.sender.add(e.sender.refs.input.value);
      }
    },
    { selector: '[data-action="filter"]', eventType: 'click', onEvent: (e) => e.sender.setState({ filter: e.target.getAttribute('data-filter') }) },
    { selector: '[data-action="toggle"]', eventType: 'change', onEvent: (e) => e.sender.toggle(Number(e.target.closest('[data-id]').getAttribute('data-id'))) },
    { selector: '[data-action="remove"]', eventType: 'click', onEvent: (e) => e.sender.remove(Number(e.target.closest('[data-id]').getAttribute('data-id'))) }
  ]
});
```

### style.css

```css
body { margin: 0; background: var(--vf-color-bg); color: var(--vf-color-text); font-family: var(--vf-font-body); line-height: var(--vf-line-height); }
.page { max-width: 36rem; margin: var(--vf-space-6) auto; padding: 0 var(--vf-space-4); }
.page__title { font-size: var(--vf-font-size-2xl); font-weight: var(--vf-font-weight-strong); }
.todo { padding: var(--vf-space-4); background: var(--vf-color-surface); border: 1px solid var(--vf-color-border); border-radius: var(--vf-radius-lg); }
.todo__form, .todo__filters { display: flex; gap: var(--vf-space-2); margin-bottom: var(--vf-space-3); }
.todo__list { list-style: none; margin: 0; padding: 0; }
.todo__item { display: flex; align-items: center; gap: var(--vf-space-2); padding: var(--vf-space-2) 0; }
.todo__item[data-state="done"] .todo__text { text-decoration: line-through; color: var(--vf-color-text-muted); }
.todo__filter[aria-pressed="true"] { background: var(--vf-color-primary-soft); }
.todo__empty, .todo__left { color: var(--vf-color-text-muted); }
```

### REPORT.md

Reference solution.
