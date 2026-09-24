// SPDX-License-Identifier: Apache-2.0
import vf from '../../../dist/vfunc.esm.js';
import { cart, removeFromCart, cartTotal } from '../store.js';

export default function cartPage(ctx, router) {
  let unsubscribe = null;
  return vf.vfunc({
    state: { items: cart.get().items },
    render: (s) => vf.html`
      <section class="card">
        <h1 class="card__title" data-ref="heading">Cart / 장바구니</h1>
        ${s.items.length === 0
          ? vf.html`<p class="muted" data-ref="empty">Empty. <a data-link href="${router.href('/products')}">Browse products</a></p>`
          : vf.html`<ul class="list" data-ref="list">${s.items.map((item) => vf.html`
              <li class="list__item" data-id="${item.id}">
                <span class="list__text">${item.name} × ${item.qty}</span>
                <span>${vf.fmt.currency(item.qty * item.price, 'KRW')}</span>
                <button class="btn" type="button" data-action="remove" data-variant="danger">Remove</button>
              </li>`)}</ul>
            <p><strong>Total / 합계: <span data-ref="total">${vf.fmt.currency(cartTotal(s), 'KRW')}</span></strong></p>`}
      </section>`,
    delegates: [{
      selector: '[data-action="remove"]',
      eventType: 'click',
      onEvent: (e) => removeFromCart(e.target.closest('[data-id]').getAttribute('data-id'))
    }],
    onMount: (inst) => { unsubscribe = cart.subscribe((state) => inst.setState({ items: state.items })); },
    // Pages are destroyed on navigation: always release subscriptions. / 페이지 이동 때 구독을 해제합니다.
    onDestroy: () => { if (unsubscribe) unsubscribe(); }
  });
}
