// SPDX-License-Identifier: Apache-2.0
// The root page picks a language: the saved choice, then the browser language. Without
// JavaScript the page shows both links. / 저장된 선택 → 브라우저 언어 순으로 언어를 고릅니다.
(function () {
  var lang = '';
  try { lang = window.localStorage.getItem('vf-site-lang') || ''; } catch (e) { /* storage unavailable */ }
  if (lang !== 'ko' && lang !== 'en') {
    var nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    lang = nav.indexOf('ko') === 0 ? 'ko' : 'en';
  }
  window.location.replace('./' + lang + '/index.html');
})();
