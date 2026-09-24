// SPDX-License-Identifier: Apache-2.0
// Data access in one place. Swap the URL for your server API. / 데이터 접근은 한곳에.
let cache = null;

export async function getProducts() {
  if (!cache) {
    const response = await fetch('./data/products.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    cache = await response.json();
  }
  return cache;
}

export async function getProduct(id) {
  const list = await getProducts();
  return list.filter((p) => p.id === id)[0] || null;
}
