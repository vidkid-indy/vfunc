// SPDX-License-Identifier: Apache-2.0
//
// A cart built from the app's own components (shop-ui.js) next to the official ones. The log line
// is read by the browser test (layer2/test/e2e/examples.e2e.js).

import vf from '../../../layer1/dist/vfunc.esm.js';
import '../../dist/vfunc-ui.esm.js';
import { vsPriceTag, vfCartLine } from './shop-ui.js';

const html = vf.html;
const log = (text) => { vf.$('#log').textContent = text; };

const ITEMS = [
  { id: 'mug', name: 'Enamel mug', price: 12, was: 15 },
  { id: 'notebook', name: 'Dot notebook', price: 9 },
  { id: 'pen', name: 'Fine pen', price: 4, was: 5 }
];

const lines = ITEMS.map((item) => vfCartLine({
  item: item,
  onChange: (e) => { summary.refresh(); log(e.data.id + ' ' + e.data.qty + ' ' + e.data.total); }
}));
lines.forEach((line) => line.mount('#lines'));

const total = () => lines.reduce((sum, line, i) => sum + line.getValue() * ITEMS[i].price, 0);
const toast = vf.vfToast();

const summary = vf.attach('#summary', {
  render: () => html`
    <span class="cart__label">Total</span>
    ${vsPriceTag({ amount: total(), ref: 'total' })}
    ${vf.vsButton({ label: 'Check out', variant: 'primary', action: 'checkout', disabled: total() === 0 })}`,
  delegates: [{
    selector: '[data-action="checkout"]',
    eventType: 'click',
    onEvent: () => { toast.show({ message: 'Order placed: ' + vf.fmt.currency(total(), 'USD'), variant: 'success' }); log('checkout ' + total()); }
  }]
});
