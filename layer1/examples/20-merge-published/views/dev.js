// SPDX-License-Identifier: Apache-2.0
// BEFORE: the developer's plain view, written before any design existed.
// 이전: 디자인이 없을 때 개발자가 만든 수수한 화면
import vf from '../../../dist/vfunc.esm.js';

export default function devView(s, c) {
  return vf.html`
    <section class="card">
      <h2 class="card__title">Order summary</h2>
      <ul class="list">${s.items.map((item) => vf.html`
        <li class="list__item" data-id="${item.id}">
          <span class="list__text">${item.name}</span>
          <button class="btn" type="button" id="${'dec-' + item.id}" data-action="dec" aria-label="Less">−</button>
          <span data-ref="${'qty-' + item.id}">${item.qty}</span>
          <button class="btn" type="button" id="${'inc-' + item.id}" data-action="inc" aria-label="More">+</button>
          <span>${c.money(item.price * item.qty)}</span>
        </li>`)}</ul>
      <form class="row" data-action="apply-coupon">
        <input class="field__input" data-ref="coupon" value="${s.coupon}" placeholder="Coupon (WELCOME10)">
        <button class="btn" type="submit">Apply</button>
      </form>
      <p data-ref="message">${s.message === 'ok' ? 'Coupon applied.' : s.message === 'invalid' ? 'Unknown coupon.' : ''}</p>
      <p>Subtotal ${c.money(c.subtotal)} · Discount ${c.money(c.discount)}</p>
      <p><strong>Total <span data-ref="total">${c.money(c.total)}</span></strong></p>
    </section>`;
}
