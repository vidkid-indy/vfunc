// SPDX-License-Identifier: Apache-2.0
// 11 css-tokens-theme — the theme is one attribute on <html>; CSS tokens do the rest.
// 테마는 <html>의 속성 하나이고, 나머지는 CSS 토큰이 처리합니다. JS에는 색 값이 없습니다.

const KEY = 'vf-example-theme';

function applyTheme(theme) {
  if (theme === 'light' || theme === 'dark') document.documentElement.setAttribute('data-theme', theme);
  else document.documentElement.removeAttribute('data-theme');  // 'system': follow the OS
  try {
    if (theme === 'system') window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, theme);
  } catch (e) { /* storage unavailable */ }
}

const picker = vf.vfunc({
  state: { theme: document.documentElement.getAttribute('data-theme') || 'system' },
  render: (s) => vf.html`
    <fieldset class="picker" aria-label="Theme">
      <legend class="card__title">Theme / 테마</legend>
      ${['system', 'light', 'dark'].map((value) => vf.html`
        <label class="picker__option">
          <input type="radio" name="theme" id="theme-${value}" value="${value}" data-action="theme" ${s.theme === value ? 'checked' : ''}>
          ${value === 'system' ? 'System / 시스템' : value === 'light' ? 'Light / 밝게' : 'Dark / 어둡게'}
        </label>`)}
    </fieldset>`,
  delegates: [{
    selector: '[data-action="theme"]',
    eventType: 'change',
    onEvent: (e) => { applyTheme(e.target.value); e.sender.theme = e.target.value; }
  }]
});

picker.mount('#theme-picker');
