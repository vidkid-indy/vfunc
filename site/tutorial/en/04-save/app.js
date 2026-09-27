// Step 4: save. Every time the list changes it is saved in the browser (localStorage) and loaded when the page opens.
const KEY = 'vfunc-tutorial-todo';

// Saved values come from outside the code, so keep only the fields we need.
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY)) || [];
    return saved.map((item) => ({ id: Number(item.id), text: String(item.text), done: item.done === true }));
  } catch (err) {
    return [];
  }
}

const saved = load();
let nextId = saved.reduce((max, item) => Math.max(max, item.id), 0) + 1;

const row = (item) => vf.html`
  <li class="todo__item" data-id="${item.id}" data-state="${item.done ? 'done' : 'open'}">
    <input type="checkbox" id="done-${item.id}" data-action="toggle" ${item.done ? 'checked' : ''}>
    <label class="todo__text" for="done-${item.id}">${item.text}</label>
    <button class="todo__remove" type="button" data-action="remove" aria-label="Delete">✕</button>
  </li>`;

const idOf = (e) => Number(e.target.closest('[data-id]').getAttribute('data-id'));

const todo = vf.vfunc({
  state: { items: saved },
  render: (s) => {
    const left = s.items.filter((item) => !item.done).length;
    return vf.html`
      <form class="todo__form" data-action="add">
        <input class="todo__input" name="text" data-ref="input" aria-label="To-do"
               placeholder="What needs doing?" autocomplete="off" required>
        <button class="todo__button" type="submit">Add</button>
      </form>
      <ul class="todo__list">${s.items.map(row)}</ul>
      <p class="todo__footer"><strong data-ref="left">${left}</strong> left</p>`;
  },
  // Called after every render. Save here.
  onUpdate: (inst) => {
    localStorage.setItem(KEY, JSON.stringify(inst.items));
  },
  methods: {
    add(text) {
      this.items = this.items.concat({ id: nextId++, text: text, done: false });
    },
    toggle(id) {
      this.items = this.items.map((item) => (item.id === id ? { id: item.id, text: item.text, done: !item.done } : item));
    },
    remove(id) {
      this.items = this.items.filter((item) => item.id !== id);
    }
  },
  delegates: [
    {
      selector: '[data-action="add"]',
      eventType: 'submit',
      onEvent: (e) => {
        e.event.preventDefault();
        const text = e.sender.refs.input.value.trim();
        if (text) e.sender.add(text);
      }
    },
    { selector: '[data-action="toggle"]', eventType: 'change', onEvent: (e) => e.sender.toggle(idOf(e)) },
    { selector: '[data-action="remove"]', eventType: 'click', onEvent: (e) => e.sender.remove(idOf(e)) }
  ]
});

todo.mount('#app');
