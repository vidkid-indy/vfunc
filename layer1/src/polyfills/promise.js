// SPDX-License-Identifier: Apache-2.0
//
// A small Promise for IE11, bundled only into dist/vfunc.legacy.min.js (D-004, D-017).
// Written for this project (no third-party code). Installed on the global object only when
// there is no native Promise, so your ES5 code can use the same Promise as the engine.
// Supports: new Promise(executor), then, catch, finally, Promise.resolve/reject/all/race.
// Not included: unhandled-rejection reporting, Promise.allSettled/any, subclassing.

var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;

var root = typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : undefined);

/** Runs fn after the current script, like a microtask (IE10+ has setImmediate). */
var defer = root && typeof root.setImmediate === 'function'
  ? function (fn) { root.setImmediate(fn); }
  : function (fn) { setTimeout(fn, 0); };

function isFunction(value) {
  return typeof value === 'function';
}

function SimplePromise(executor) {
  if (!(this instanceof SimplePromise)) throw new TypeError('Promise must be called with new');
  if (!isFunction(executor)) throw new TypeError('Promise executor is not a function');
  this._state = PENDING;
  this._value = undefined;
  this._handlers = [];
  var self = this;
  var done = false;
  try {
    executor(function (value) {
      if (done) return;
      done = true;
      resolvePromise(self, value);
    }, function (reason) {
      if (done) return;
      done = true;
      settle(self, REJECTED, reason);
    });
  } catch (err) {
    if (!done) {
      done = true;
      settle(self, REJECTED, err);
    }
  }
}

/** The Promise Resolution Procedure: adopts thenables, rejects on self-resolution. */
function resolvePromise(promise, value) {
  if (value === promise) {
    settle(promise, REJECTED, new TypeError('A promise cannot be resolved with itself'));
    return;
  }
  if (value && (typeof value === 'object' || isFunction(value))) {
    var then;
    try {
      then = value.then;
    } catch (err) {
      settle(promise, REJECTED, err);
      return;
    }
    if (isFunction(then)) {
      var called = false;
      try {
        then.call(value, function (next) {
          if (called) return;
          called = true;
          resolvePromise(promise, next);
        }, function (reason) {
          if (called) return;
          called = true;
          settle(promise, REJECTED, reason);
        });
      } catch (err) {
        if (!called) {
          called = true;
          settle(promise, REJECTED, err);
        }
      }
      return;
    }
  }
  settle(promise, FULFILLED, value);
}

function settle(promise, state, value) {
  if (promise._state !== PENDING) return;
  promise._state = state;
  promise._value = value;
  var handlers = promise._handlers;
  promise._handlers = [];
  for (var i = 0; i < handlers.length; i++) schedule(promise, handlers[i]);
}

function schedule(promise, handler) {
  defer(function () {
    var callback = promise._state === FULFILLED ? handler.onFulfilled : handler.onRejected;
    if (!isFunction(callback)) {
      if (promise._state === FULFILLED) resolvePromise(handler.next, promise._value);
      else settle(handler.next, REJECTED, promise._value);
      return;
    }
    var result;
    try {
      result = callback(promise._value);
    } catch (err) {
      settle(handler.next, REJECTED, err);
      return;
    }
    resolvePromise(handler.next, result);
  });
}

SimplePromise.prototype.then = function (onFulfilled, onRejected) {
  var next = new SimplePromise(function () {});
  var handler = { onFulfilled: onFulfilled, onRejected: onRejected, next: next };
  if (this._state === PENDING) this._handlers.push(handler);
  else schedule(this, handler);
  return next;
};

SimplePromise.prototype['catch'] = function (onRejected) {
  return this.then(undefined, onRejected);
};

SimplePromise.prototype['finally'] = function (onFinally) {
  return this.then(function (value) {
    return SimplePromise.resolve(isFunction(onFinally) ? onFinally() : undefined).then(function () { return value; });
  }, function (reason) {
    return SimplePromise.resolve(isFunction(onFinally) ? onFinally() : undefined).then(function () { throw reason; });
  });
};

SimplePromise.resolve = function (value) {
  if (value instanceof SimplePromise) return value;
  return new SimplePromise(function (resolve) { resolve(value); });
};

SimplePromise.reject = function (reason) {
  return new SimplePromise(function (resolve, reject) { reject(reason); });
};

SimplePromise.all = function (items) {
  return new SimplePromise(function (resolve, reject) {
    var list = Array.prototype.slice.call(items);
    var results = new Array(list.length);
    var remaining = list.length;
    if (remaining === 0) {
      resolve(results);
      return;
    }
    function settleAt(index) {
      return function (value) {
        results[index] = value;
        remaining -= 1;
        if (remaining === 0) resolve(results);
      };
    }
    for (var i = 0; i < list.length; i++) SimplePromise.resolve(list[i]).then(settleAt(i), reject);
  });
};

SimplePromise.race = function (items) {
  return new SimplePromise(function (resolve, reject) {
    var list = Array.prototype.slice.call(items);
    for (var i = 0; i < list.length; i++) SimplePromise.resolve(list[i]).then(resolve, reject);
  });
};

if (root && !isFunction(root.Promise)) root.Promise = SimplePromise;

export default SimplePromise;
