// SPDX-License-Identifier: Apache-2.0
// Page setup, not app logic: picks a skin stylesheet from an allow-list and marks the current
// link. Runs in <head> so the skin applies before the first paint.
// 앱 로직이 아니라 페이지 설정입니다. 허용 목록에서 스킨을 골라 첫 화면 전에 적용합니다.
(function () {
  var SKINS = { a: './skins/a.css', b: './skins/b.css' };
  var match = /[?&]skin=([a-z]+)/.exec(window.location.search);
  var name = match && SKINS.hasOwnProperty(match[1]) ? match[1] : 'neutral';
  document.documentElement.setAttribute('data-skin', name);
  if (name !== 'neutral') {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = SKINS[name];
    document.head.appendChild(link);
  }
  document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll('[data-skin]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-skin') === name && links[i].tagName === 'A') links[i].setAttribute('aria-current', 'page');
    }
  });
})();
