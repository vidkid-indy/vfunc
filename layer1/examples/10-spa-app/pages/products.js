// SPDX-License-Identifier: Apache-2.0
import vf from '../../../dist/vfunc.esm.js';
import { getProducts } from '../api.js';
import { addToCart } from '../store.js';

export default function productsPage(ctx, router) {
  return vf.vfunc({
    state: { status: 'loading', items: [] },
    render: (s) => vf.html`
      <section class="card">
        <h1 class="card__title" data-ref="heading">Products / 상품</h1>
        ${s.status === 'loading' ? vf.html`<p class="muted" role="status">Loading… / 불러오는 중…</p>` : ''}
        ${s.status === 'error' ? vf.html`<p class="notice" data-state="error" role="alert">Could not load. / 불러오지 못했습니다.</p>` : ''}
        <ul class="products" data-ref="list">${s.items.map((p) => vf.html`
          <li class="card product-card" data-id="${p.id}">
            <a data-link href="${router.href('/products/' + encodeURIComponent(p.id))}"><strong>${p.name}</strong></a>
            <span class="product-card__price">${vf.fmt.currency(p.price, 'KRW')}</span>
            <button class="btn" type="button" data-action="add">Add to cart / 담기</button>
          </li>`)}</ul>
      </section>`,
    delegates: [{
      selector: '[data-action="add"]',
      eventType: 'click',
      onEvent: (e) => {
        const id = e.target.closest('[data-id]').getAttribute('data-id');
        addToCart(e.sender.items.filter((p) => p.id === id)[0]);
      }
    }],
    // Pages are mounted by the router, so onMount runs: load data here. / 데이터는 onMount에서 불러옵니다.
    onMount: async (inst) => {
      try {
        inst.setState({ status: 'ready', items: await getProducts() });
      } catch (err) {
        inst.setState({ status: 'error' });
      }
    }
  });
}
