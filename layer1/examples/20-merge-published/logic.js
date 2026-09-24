// SPDX-License-Identifier: Apache-2.0
// The order summary's logic: state, methods, delegates. It is the same file before and after the
// published HTML arrived; only the view (render) was replaced.
// 주문 요약의 로직입니다. 퍼블리싱 HTML이 오기 전과 후에 같은 파일이고, 화면(render)만 바뀌었습니다.
import vf from '../../dist/vfunc.esm.js';

const COUPONS = { WELCOME10: 0.1 };

export function createOrderSummary(view) {
  return vf.vfunc({
    replaceRoot: true,
    state: {
      items: [
        { id: 'kb', name: 'Wireless keyboard', price: 59000, qty: 1 },
        { id: 'ms', name: 'Wireless mouse', price: 29000, qty: 2 }
      ],
      coupon: '',
      rate: 0,
      message: ''
    },
    render: function (s) {
      const subtotal = s.items.reduce((sum, item) => sum + item.price * item.qty, 0);
      const discount = Math.round(subtotal * s.rate);
      return view(s, {
        money: (n) => vf.fmt.currency(n, 'KRW'),
        subtotal: subtotal,
        discount: discount,
        total: subtotal - discount
      });
    },
    methods: {
      change(id, delta) {
        this.setState({
          items: this.items
            .map((item) => (item.id === id ? Object.assign({}, item, { qty: item.qty + delta }) : item))
            .filter((item) => item.qty > 0)
        });
      },
      applyCoupon(code) {
        const key = String(code || '').trim().toUpperCase();
        if (Object.prototype.hasOwnProperty.call(COUPONS, key)) this.setState({ coupon: key, rate: COUPONS[key], message: 'ok' });
        else this.setState({ coupon: '', rate: 0, message: 'invalid' });
      }
    },
    // The hooks the views must provide: data-action, data-id, data-ref (see README). / 화면이 제공해야 할 훅
    delegates: [
      { selector: '[data-action="inc"]', eventType: 'click', onEvent: (e) => e.sender.change(rowId(e.target), 1) },
      { selector: '[data-action="dec"]', eventType: 'click', onEvent: (e) => e.sender.change(rowId(e.target), -1) },
      {
        selector: '[data-action="apply-coupon"]',
        eventType: 'submit',
        onEvent: (e) => { e.event.preventDefault(); e.sender.applyCoupon(e.sender.refs.coupon.value); }
      }
    ]
  });
}

function rowId(element) {
  return element.closest('[data-id]').getAttribute('data-id');
}
