// SPDX-License-Identifier: Apache-2.0
// Applies the saved theme before the first paint (external file: the CSP forbids inline scripts).
(function () {
  try {
    var saved = window.localStorage.getItem('vf-site-theme');
    if (saved === 'light' || saved === 'dark') document.documentElement.setAttribute('data-theme', saved);
  } catch (e) { /* storage unavailable */ }
})();
