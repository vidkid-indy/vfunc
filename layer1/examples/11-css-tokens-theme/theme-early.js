// SPDX-License-Identifier: Apache-2.0
// Runs in <head> before the page is drawn, so a saved dark theme does not flash white.
// It is an external file because the page's CSP does not allow inline scripts (rule 20).
// 화면을 그리기 전에 저장된 테마를 적용합니다. CSP 때문에 인라인이 아닌 외부 파일입니다.
(function () {
  try {
    var saved = window.localStorage.getItem('vf-example-theme');
    if (saved === 'light' || saved === 'dark') document.documentElement.setAttribute('data-theme', saved);
  } catch (e) { /* storage unavailable */ }
})();
