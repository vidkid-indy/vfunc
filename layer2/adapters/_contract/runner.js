// SPDX-License-Identifier: Apache-2.0
//
// A tiny test runner with the node:test / node:assert subset the contract suites use, so the same
// suites run in a browser page (contract.html). Results go to the page and to window.__contract.

const tests = [];

export function test(name, fn) {
  tests.push({ name: name, fn: fn });
}

function fail(message, actual, expected) {
  const error = new Error(message + (arguments.length > 1 ? ' — actual: ' + JSON.stringify(actual) + ', expected: ' + JSON.stringify(expected) : ''));
  error.name = 'AssertionError';
  throw error;
}

export const assert = {
  ok(value, message) { if (!value) fail(message || 'expected a truthy value', value, true); },
  equal(actual, expected, message) { if (actual !== expected) fail(message || 'not equal', actual, expected); },
  notEqual(actual, expected, message) { if (actual === expected) fail(message || 'equal', actual, expected); },
  deepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(message || 'not deep-equal', actual, expected);
  },
  doesNotThrow(fn, message) {
    try { fn(); } catch (err) { fail((message || 'threw') + ': ' + err.message); }
  }
};

/** Runs every registered test in order; resolves with { passed, failed, failures }. */
export async function run(list, summary) {
  const result = { done: false, passed: 0, failed: 0, failures: [] };
  window.__contract = result;
  for (const t of tests) {
    const li = document.createElement('li');
    li.textContent = t.name;
    list.appendChild(li);
    try {
      await t.fn();
      result.passed += 1;
      li.setAttribute('data-state', 'pass');
    } catch (err) {
      result.failed += 1;
      result.failures.push(t.name + ': ' + (err && err.message));
      li.setAttribute('data-state', 'fail');
      li.textContent = t.name + ' — ' + (err && err.message);
    }
  }
  result.done = true;
  summary.textContent = (result.failed ? 'FAIL ' : 'PASS ') + result.passed + '/' + tests.length;
  return result;
}
