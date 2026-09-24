// SPDX-License-Identifier: Apache-2.0
// AFTER: the publisher's markup (published/order.html) with the existing hooks put back.
// Logic (logic.js) is untouched. Every hook from the dev view is here; see the README mapping table.
// 이후: 퍼블리셔 마크업에 기존 훅(data-action, data-ref, data-id)을 다시 단 화면. 로직은 그대로입니다.
import vf from '../../../dist/vfunc.esm.js';

export default function publishedView(s, c) {
  const count = s.items.reduce((n, item) => n + item.qty, 0);
  return vf.html`
    <aside class="order">
      <header class="order__head"><h2 class="order__title">Your order</h2><span class="order__count">${count} items</span></header>
      <div class="order__lines">${s.items.map((item) => vf.html`
        <div class="line" data-id="${item.id}">
          <div class="line__info"><p class="line__name">${item.name}</p><p class="line__unit">${c.money(item.price)} each</p></div>
          <div class="stepper">
            <button class="stepper__btn" type="button" id="${'dec-' + item.id}" data-action="dec" aria-label="Less">−</button>
            <span class="stepper__value" data-ref="${'qty-' + item.id}">${item.qty}</span>
            <button class="stepper__btn" type="button" id="${'inc-' + item.id}" data-action="inc" aria-label="More">+</button>
          </div>
          <p class="line__price">${c.money(item.price * item.qty)}</p>
        </div>`)}</div>
      <form class="coupon" data-action="apply-coupon">
        <input class="coupon__input" data-ref="coupon" value="${s.coupon}" placeholder="Promo code" aria-label="Promo code">
        <button class="coupon__btn" type="submit">Apply</button>
      </form>
      <p class="coupon__msg" data-ref="message" data-state="${s.message || 'none'}">${s.message === 'ok' ? 'Coupon applied.' : s.message === 'invalid' ? 'Unknown coupon.' : ''}</p>
      <dl class="totals">
        <div class="totals__row"><dt>Subtotal</dt><dd>${c.money(c.subtotal)}</dd></div>
        <div class="totals__row"><dt>Discount</dt><dd>−${c.money(c.discount)}</dd></div>
        <div class="totals__row totals__row--grand"><dt>Total</dt><dd data-ref="total">${c.money(c.total)}</dd></div>
      </dl>
    </aside>`;
}
