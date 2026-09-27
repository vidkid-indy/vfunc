// SPDX-License-Identifier: Apache-2.0
//
// Shared by the three benchmark pages (naive, recommended, vanilla): the same rows from the same seed,
// the same sizes, and the ready mark the runner waits for. Not part of the library (not on `vf`).
// `?n=100` scales every operation down (the smoke test); the default is the js-framework-benchmark size.

(function (global) {
  'use strict';

  const ADJECTIVES = ['pretty', 'large', 'big', 'small', 'tall', 'short', 'long', 'handsome', 'plain', 'quaint', 'clean',
    'elegant', 'easy', 'angry', 'crazy', 'helpful', 'mushy', 'odd', 'unsightly', 'adorable', 'important', 'inexpensive',
    'cheap', 'expensive', 'fancy'];
  const COLOURS = ['red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple', 'brown', 'white', 'black', 'orange'];
  const NOUNS = ['table', 'chair', 'house', 'bbq', 'desk', 'car', 'pony', 'cookie', 'sandwich', 'burger', 'pizza', 'mouse',
    'keyboard'];

  const param = Number(new URLSearchParams(global.location.search).get('n'));
  const size = param >= 10 && param <= 1000 ? Math.floor(param) : 1000;

  let seed = 1;
  let nextId = 1;
  const pick = (list) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return list[seed % list.length];
  };

  /** `count` new rows { id, label }; ids keep counting up across calls, as in js-framework-benchmark. */
  function build(count) {
    const rows = new Array(count);
    for (let i = 0; i < count; i++) rows[i] = { id: nextId++, label: pick(ADJECTIVES) + ' ' + pick(COLOURS) + ' ' + pick(NOUNS) };
    return rows;
  }

  /** Every 10th row gets ' !!!' (new row objects; the others are the same objects). */
  function updateEvery10th(rows) {
    return rows.map((row, i) => (i % 10 === 0 ? { id: row.id, label: row.label + ' !!!' } : row));
  }

  /** Rows 2 and size - 1 (1-based) change places when there are enough rows; a new array. */
  function swap(rows) {
    if (rows.length < size) return rows;
    const next = rows.slice();
    const a = next[1];
    next[1] = next[size - 2];
    next[size - 2] = a;
    return next;
  }

  /** Called by each page once it has drawn its first screen: records the time after the next frame. */
  function ready() {
    requestAnimationFrame(() => requestAnimationFrame(() => { api.readyAt = performance.now(); }));
  }

  const api = { size: size, build: build, updateEvery10th: updateEvery10th, swap: swap, ready: ready, readyAt: 0 };
  global.benchData = api;
})(window);
