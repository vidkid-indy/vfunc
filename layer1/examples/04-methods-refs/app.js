// SPDX-License-Identifier: Apache-2.0
// 04 methods-refs — call methods from outside; find own elements with refs.
// 밖에서 메서드 호출하기, refs로 자기 요소 찾기.

const notes = vf.vfunc({
  state: { items: [] },
  render: (s) => vf.html`
    <h2 class="card__title">Notes / 메모 (<span data-ref="count">${s.items.length}</span>)</h2>
    <form class="row" data-action="submit">
      <input class="field__input" data-ref="input" placeholder="Write a note / 메모 입력" autocomplete="off">
      <button class="btn" type="submit" data-variant="primary">Save / 저장</button>
    </form>
    <ul class="list" data-ref="list">
      ${s.items.map((note) => vf.html`<li class="list__item"><span class="list__text">${note}</span></li>`)}
    </ul>`,
  // Public API of this component. / 이 컴포넌트의 공개 기능
  methods: {
    add(text) {
      const value = String(text || '').trim();
      if (value) this.setState({ items: this.items.concat(value) });
    },
    clear() { this.setState({ items: [] }); },
    focusInput() { this.refs.input.focus(); },   // refs: data-ref="input"
    count() { return this.items.length; }
  },
  delegates: [{
    selector: '[data-action="submit"]',
    eventType: 'submit',
    onEvent: (e) => {
      e.event.preventDefault();
      e.sender.add(e.sender.refs.input.value);
    }
  }]
});

notes.mount('#notes');

// The toolbar is published HTML: attach only adds behaviour, the markup stays.
// 도구 모음은 기존 HTML입니다. attach는 동작만 더하고 마크업은 그대로 둡니다.
vf.attach('#toolbar', {
  delegates: [
    { selector: '[data-action="add-sample"]', eventType: 'click', onEvent: () => notes.add('Note #' + (notes.count() + 1)) },
    { selector: '[data-action="focus"]', eventType: 'click', onEvent: () => notes.focusInput() },
    // Methods are bound, so they can be passed around as callbacks. / 메서드는 바인딩되어 콜백으로 넘길 수 있습니다.
    { selector: '[data-action="clear"]', eventType: 'click', onEvent: notes.clear }
  ]
});
