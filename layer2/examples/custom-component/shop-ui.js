// SPDX-License-Identifier: Apache-2.0
//
// The app's own components (extension level C3: official components inside yours). They live in
// the app's module, not on the vf root (vf.* is reserved, EXTENDING.md), and follow the same rules
// as layer 2: vs* returns SafeHtml, vf* returns an instance whose callbacks get
// { sender, event, data }, hooks on id / data-ref / data-action, classes <block>__<element>,
// colors and sizes in CSS tokens only (style.css).

import vf from '../../../layer1/dist/vfunc.esm.js';
import '../../dist/vfunc-ui.esm.js';

const html = vf.html;

/**
 * A price with an optional old price and a discount badge (vsBadge + vf.fmt).
 * @param {{ amount: number, currency?: string, was?: number, id?: string, ref?: string }} props
 * @returns {SafeHtml}
 */
export function vsPriceTag(props) {
  const p = props || {};
  const currency = p.currency || 'USD';
  const off = p.was > p.amount ? Math.round((1 - p.amount / p.was) * 100) : 0;
  // Optional attributes as whole (quoted, escaped) fragments: vf.html would write id="" for a missing value.
  const hooks = html`${p.id ? html` id="${p.id}"` : ''}${p.ref ? html` data-ref="${p.ref}"` : ''}`;
  return html`<span class="price-tag"${hooks}>
    <span class="price-tag__amount">${vf.fmt.currency(p.amount, currency)}</span>
    ${off ? html`<s class="price-tag__was">${vf.fmt.currency(p.was, currency)}</s> ${vf.vsBadge({ label: '-' + off + '%', variant: 'danger' })}` : ''}
  </span>`;
}

/**
 * One cart line: the item, a vfNumberInput for the quantity (kept through `childs`) and the line
 * total as a vsPriceTag.
 * @param {{ item: { id: string, name: string, price: number, was?: number }, qty?: number, max?: number,
 *           onChange?: function({ sender, event, data: { id, qty, total } }) }} props
 * @returns {Object} instance with getValue() → qty and setValue(qty) (no onChange)
 */
export function vfCartLine(props) {
  const p = props || {};
  const item = p.item;
  const qty = vf.vfNumberInput({ id: 'qty-' + item.id, label: 'Quantity', value: p.qty || 1, min: 0, max: p.max || 9,
    onChange: (e) => {
      self.setState({ qty: e.data.value || 0 });
      if (p.onChange) p.onChange({ sender: self, event: e.event, data: { id: item.id, qty: self.state.qty, total: self.state.qty * item.price } });
    } });
  const self = vf.vfunc({
    tag: 'li',
    opts: { className: 'cart-line' },
    state: { qty: p.qty || 1 },
    render: (s) => html`
      <span class="cart-line__name">${item.name}</span>
      <div id="${'qty-slot-' + item.id}"></div>
      ${vsPriceTag({ amount: s.qty * item.price, was: item.was ? s.qty * item.was : undefined, ref: 'total' })}`,
    childs: [{ targetId: 'qty-slot-' + item.id, component: qty }],
    methods: {
      getValue() { return this.state.qty; },
      setValue(value) { qty.setValue(value); this.setState({ qty: value }); }
    }
  });
  return self;
}
