// Step 5: use components (vfunc-ui). Buttons and the empty screen are vs* (markup); the toast and the confirm dialog are vf* (instances).
const KEY = 'vfunc-tutorial-todo';

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
let toast;   // the notification area: one per page (made at the very end)

const row = (item) => vf.html`
  <li class="todo__item" data-id="${item.id}" data-state="${item.done ? 'done' : 'open'}">
    <input type="checkbox" id="done-${item.id}" data-action="toggle" ${item.done ? 'checked' : ''}>
    <label class="todo__text" for="done-${item.id}">${item.text}</label>
    ${vf.vsButton({ label: 'Delete', variant: 'ghost', size: 'sm', action: 'remove' })}
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
        ${vf.vsButton({ label: 'Add', type: 'submit', variant: 'primary' })}
      </form>
      ${s.items.length
        ? vf.html`<ul class="todo__list">${s.items.map(row)}</ul>
                  <p class="todo__footer"><strong data-ref="left">${left}</strong> left</p>`
        : vf.vsEmptyState({ title: 'Nothing to do', description: 'Type a to-do above and press Add.' })}`;
  },
  onUpdate: (inst) => {
    localStorage.setItem(KEY, JSON.stringify(inst.items));
  },
  methods: {
    add(text) {
      this.items = this.items.concat({ id: nextId++, text: text, done: false });
      toast.show({ message: 'Added: ' + text, variant: 'success' });
    },
    toggle(id) {
      this.items = this.items.map((item) => (item.id === id ? { id: item.id, text: item.text, done: !item.done } : item));
    },
    // Ask once before deleting. open() waits for the answer (true or false).
    async remove(id) {
      const item = this.items.find((x) => x.id === id);
      const dialog = vf.vfConfirm({ title: 'Delete this?', message: item.text, variant: 'danger', confirmLabel: 'Delete' });
      const ok = await dialog.open();
      dialog.destroy();
      if (!ok) return;
      this.items = this.items.filter((x) => x.id !== id);
      toast.show({ message: 'Deleted' });
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

toast = vf.vfToast();
todo.mount('#app');
