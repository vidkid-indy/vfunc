// Step 2: add to-dos. Put what was typed into the list (state.items) and the list is drawn again.
let nextId = 1;

const todo = vf.vfunc({
  state: { items: [] },
  render: (s) => vf.html`
    <form class="todo__form" data-action="add">
      <input class="todo__input" name="text" data-ref="input" aria-label="To-do"
             placeholder="What needs doing?" autocomplete="off" required>
      <button class="todo__button" type="submit">Add</button>
    </form>
    <ul class="todo__list">
      ${s.items.map((item) => vf.html`<li class="todo__item">${item.text}</li>`)}
    </ul>`,
  delegates: [{
    selector: '[data-action="add"]',
    eventType: 'submit',
    onEvent: (e) => {
      e.event.preventDefault();                   // keep the form from reloading the page
      const text = e.sender.refs.input.value.trim();
      if (!text) return;
      e.sender.items = e.sender.items.concat({ id: nextId++, text: text });
    }
  }]
});

todo.mount('#app');
