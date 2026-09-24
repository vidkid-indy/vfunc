// SPDX-License-Identifier: Apache-2.0
// 06 attach-published-html — "keep your HTML, control only what you need".
// HTML은 그대로 두고, 제어가 필요한 곳만 vfunc로.

const PRODUCTS = [
  { name: '무선 키보드 / Wireless keyboard', category: 'input', price: 59000 },
  { name: '기계식 키보드 / Mechanical keyboard', category: 'input', price: 129000 },
  { name: '무선 마우스 / Wireless mouse', category: 'input', price: 29000 },
  { name: '27인치 모니터 / 27" monitor', category: 'display', price: 329000 },
  { name: '휴대용 모니터 / Portable monitor', category: 'display', price: 189000 }
];

// 1) The result area: an empty box in the published page → replaced by a component (render).
// 결과 영역: 퍼블리싱의 빈 상자를 render가 있는 컴포넌트로 대체합니다.
const results = vf.attach('#product-results', {
  state: { items: [], searched: false },
  render: (s) => vf.html`
    <section class="results" id="product-results" aria-live="polite">
      ${!s.searched ? '' : s.items.length === 0
        ? vf.html`<p class="results__empty" data-ref="empty">결과가 없습니다. / No results.</p>`
        : vf.html`<ul class="results__grid" data-ref="grid">${s.items.map((p) => vf.html`
            <li class="product">
              <div class="product__name">${p.name}</div>
              <div class="product__price">${vf.fmt.currency(p.price, 'KRW')}</div>
            </li>`)}</ul>`}
    </section>`
});

// 2) The search form: adopted as it is (no render) — markup, typed values and styles stay.
// 검색 폼: render 없이 그대로 채택합니다. 마크업·입력값·스타일이 유지됩니다.
vf.attach('#product-search', {
  delegates: [{
    selector: '[data-action="search"]', // the <form> itself; closest() matches the root too / 폼 자신
    eventType: 'submit',
    onEvent: (e) => {
      e.event.preventDefault();
      const values = vf.form.values(e.sender.$node);   // { q, category }
      const keyword = String(values.q).trim().toLowerCase();
      const items = PRODUCTS.filter((p) =>
        (!values.category || p.category === values.category) && p.name.toLowerCase().indexOf(keyword) >= 0);
      results.setState({ items: items, searched: true });
      // A text-only update of published markup: no re-render of the form.
      // 퍼블리싱 요소의 텍스트만 바꿉니다(폼은 다시 그리지 않음).
      e.sender.refs.summary.textContent = items.length + '개 상품 / ' + items.length + ' products';
    }
  }]
});
