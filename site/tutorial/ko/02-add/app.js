// 2단계: 할 일 추가. 입력한 내용을 목록(state.items)에 넣으면 목록이 다시 그려집니다.
let nextId = 1;

const todo = vf.vfunc({
  state: { items: [] },
  render: (s) => vf.html`
    <form class="todo__form" data-action="add">
      <input class="todo__input" name="text" data-ref="input" aria-label="할 일"
             placeholder="할 일을 입력하세요" autocomplete="off" required>
      <button class="todo__button" type="submit">추가</button>
    </form>
    <ul class="todo__list">
      ${s.items.map((item) => vf.html`<li class="todo__item">${item.text}</li>`)}
    </ul>`,
  delegates: [{
    selector: '[data-action="add"]',
    eventType: 'submit',
    onEvent: (e) => {
      e.event.preventDefault();                   // 폼 제출로 페이지가 새로고침되지 않게 합니다
      const text = e.sender.refs.input.value.trim();
      if (!text) return;
      e.sender.items = e.sender.items.concat({ id: nextId++, text: text });
    }
  }]
});

todo.mount('#app');
