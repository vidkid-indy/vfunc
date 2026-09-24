// SPDX-License-Identifier: Apache-2.0
// Shared state, changed only through the functions below. Never put tokens or secrets here.
// 공용 상태입니다. 아래 함수로만 바꾸고, 토큰이나 비밀값은 두지 않습니다.
import vf from './lib/vf.js';

export const app = vf.store({ favorites: [] }); // item ids

export function toggleFavorite(id) {
  app.set((s) => ({
    favorites: s.favorites.indexOf(id) >= 0 ? s.favorites.filter((f) => f !== id) : s.favorites.concat(id)
  }));
}

export const isFavorite = (s, id) => s.favorites.indexOf(id) >= 0;
