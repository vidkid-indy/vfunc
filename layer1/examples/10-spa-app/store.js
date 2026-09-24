// SPDX-License-Identifier: Apache-2.0
// Shared state of the app: one store, changed only through these functions.
// 앱의 공용 상태: store 하나, 이 함수들로만 바꿉니다. 토큰 같은 비밀값은 store에 두지 않습니다.
import vf from '../../dist/vfunc.esm.js';

export const cart = vf.store({ items: [] }); // [{ id, name, price, qty }]

export function addToCart(product) {
  cart.set((s) => {
    const found = s.items.filter((item) => item.id === product.id)[0];
    const items = found
      ? s.items.map((item) => (item.id === product.id ? Object.assign({}, item, { qty: item.qty + 1 }) : item))
      : s.items.concat({ id: product.id, name: product.name, price: product.price, qty: 1 });
    return { items: items };
  });
}

export function removeFromCart(id) {
  cart.set((s) => ({ items: s.items.filter((item) => item.id !== id) }));
}

export const cartCount = (s) => s.items.reduce((sum, item) => sum + item.qty, 0);
export const cartTotal = (s) => s.items.reduce((sum, item) => sum + item.qty * item.price, 0);
