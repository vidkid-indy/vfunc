// 3단계: 완료 표시와 삭제. 목록의 버튼은 data-action으로 구분하고, 어느 항목인지는 data-id로 찾습니다.
let nextId = 1;

const row = (item) => vf.html`
  <li class="todo__item" data-id="${item.id}" data-state="${item.done ? 'done' : 'open'}">
    <input type="checkbox" id="done-${item.id}" data-action="toggle" ${item.done ? 'checked' : ''}>
    <label class="todo__text" for="done-${item.id}">${item.text}</label>
    <button class="todo__remove" type="button" data-action="remove" aria-label="삭제">✕</button>
  </li>`;

// 이벤트가 일어난 줄의 data-id를 숫자로 돌려줍니다.
const idOf = (e) => Number(e.target.closest('[data-id]').getAttribute('data-id'));

const todo = vf.vfunc({
  state: { items: [] },
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
