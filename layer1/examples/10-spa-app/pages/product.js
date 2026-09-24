// SPDX-License-Identifier: Apache-2.0
import vf from '../../../dist/vfunc.esm.js';
import { getProduct } from '../api.js';
import { addToCart } from '../store.js';

export default function productPage(ctx, router) {
  return vf.vfunc({
    state: { status: 'loading', product: null, added: false },
    render: (s) => {
      if (s.status === 'loading') return vf.html`<section class="card"><p class="muted" role="status">Loading…</p></section>`;
      if (!s.product) {
        return vf.html`<section class="card"><h1 class="card__title" data-ref="heading">Not found / 없는 상품</h1>
          <a data-link href="${router.href('/products')}">← Products</a></section>`;
      }
      return vf.html`
        <section class="card">
          <a data-link href="${router.href('/products')}">← Products / 상품 목록</a>
          <h1 class="card__title" data-ref="heading">${s.product.name}</h1>
          <p>${s.product.text}</p>
          <p class="product-card__price">${vf.fmt.currency(s.product.price, 'KRW')}</p>
          <button class="btn" type="button" data-variant="primary" data-action="add">Add to cart / 담기</button>
          ${s.added ? vf.html`<span class="muted" data-ref="added" role="status">Added. / 담았습니다.</span>` : ''}
        </section>`;
    },
    delegates: [{
      selector: '[data-action="add"]',
      eventType: 'click',
      onEvent: (e) => { addToCart(e.sender.product); e.sender.added = true; }
    }],
    onMount: async (inst) => {
      inst.setState({ status: 'ready', product: await getProduct(ctx.params.id) });
    }
  });
}
