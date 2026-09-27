// 4단계: 저장. 목록이 바뀔 때마다 브라우저(localStorage)에 저장하고, 페이지를 열 때 불러옵니다.
const KEY = 'vfunc-tutorial-todo';

// 저장된 값은 바깥 데이터이므로 필요한 필드만 골라 씁니다.
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
    <button class="todo__remove" type="button" data-action="remove" aria-label="삭제">✕</button>
  </li>`;

const idOf = (e) => Number(e.target.closest('[data-id]').getAttribute('data-id'));

const todo = vf.vfunc({
  state: { items: saved },
  render: (s) => {
    const left = s.items.filter((item) => !item.done).length;
    return vf.html`
      <form class="todo__form" data-action="add">
        <input class="todo__input" name="text" data-ref="input" aria-label="할 일"
               placeholder="할 일을 입력하세요" autocomplete="off" required>
        <button class="todo__button" type="submit">추가</button>
      </form>
      <ul class="todo__list">${s.items.map(row)}</ul>
      <p class="todo__footer">남은 일 <strong data-ref="left">${left}</strong>개</p>`;
  },
  // 다시 그릴 때마다 호출됩니다. 여기서 저장합니다.
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
