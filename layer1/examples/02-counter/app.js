// SPDX-License-Identifier: Apache-2.0
// 02 counter — state, render, setState. / 상태, 렌더, setState.

let renders = 0;

const counter = vf.vfunc({
  state: { count: 0, step: 1 },
  render: (s) => {
    renders++;
    // State goes to data-state / aria-*; the color lives in CSS. / 상태는 속성으로, 색은 CSS에.
    return vf.html`
      <div class="row">
        <button class="btn" type="button" data-action="dec" aria-label="Decrease">−</button>
        <output class="counter__value" data-ref="value" aria-live="polite"
                data-state="${s.count < 0 ? 'negative' : 'normal'}">${s.count}</output>
        <button class="btn" type="button" data-action="inc" aria-label="Increase">+</button>
        <button class="btn" type="button" data-action="add-ten">+10 (one render / 렌더 1회)</button>
        <button class="btn" type="button" data-action="reset">Reset / 초기화</button>
      </div>
      <p class="counter__renders muted">Renders so far / 지금까지 렌더: <span data-ref="renders">${renders}</span></p>`;
  },
  delegates: [
    { selector: '[data-action="inc"]', eventType: 'click', onEvent: (e) => { e.sender.count += e.sender.step; } },
    { selector: '[data-action="dec"]', eventType: 'click', onEvent: (e) => { e.sender.count -= e.sender.step; } },
    {
      selector: '[data-action="add-ten"]',
      eventType: 'click',
      // Ten changes in the same tick → one render. / 같은 tick의 변경 10번 → 렌더 1번.
      onEvent: (e) => { for (let i = 0; i < 10; i++) e.sender.setState({ count: e.sender.count + 1 }); }
    },
    { selector: '[data-action="reset"]', eventType: 'click', onEvent: (e) => { e.sender.setState({ count: 0 }); } }
  ]
});

counter.mount('#app');
