// SPDX-License-Identifier: Apache-2.0
// Installs a happy-dom window as the global DOM for node:test.
import { Window } from 'happy-dom';

const window = new Window({ url: 'https://example.test/' });

const globals = ['window', 'document', 'Node', 'Element', 'HTMLElement', 'Event', 'MouseEvent', 'DocumentFragment'];
for (const name of globals) {
  globalThis[name] = name === 'window' ? window : window[name];
}

export { window };

/** Waits until queued microtasks (scheduled refreshes) have run. */
export function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Dispatches a bubbling click on an element. */
export function click(element) {
  element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
}

/** Captures console.warn calls made while fn runs. */
export function captureWarnings(fn) {
  const messages = [];
  const original = console.warn;
  console.warn = (...args) => { messages.push(args.join(' ')); };
  try { fn(); } finally { console.warn = original; }
  return messages;
}
