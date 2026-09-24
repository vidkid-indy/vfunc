// SPDX-License-Identifier: Apache-2.0
// Runs in <head> before the first paint so a saved theme does not flash. An external file
// because the CSP forbids inline scripts. / 첫 화면 전에 저장된 테마를 적용합니다(CSP 때문에 외부 파일).
(function () {
  try {
    var saved = window.localStorage.getItem('app-theme');
    if (saved === 'light' || saved === 'dark') document.documentElement.setAttribute('data-theme', saved);
  } catch (e) { /* storage unavailable */ }
})();
