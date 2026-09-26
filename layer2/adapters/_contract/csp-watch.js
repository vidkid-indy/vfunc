// SPDX-License-Identifier: Apache-2.0
//
// Loaded before the vendor scripts of csp-nonce.html, so a violation while they load is recorded too.
window.__cspViolations = [];
document.addEventListener('securitypolicyviolation', function (e) {
  window.__cspViolations.push(e.violatedDirective + ' ' + (e.blockedURI || 'inline'));
}, true);
