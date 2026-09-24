// SPDX-License-Identifier: Apache-2.0
// Language and theme. The theme is one attribute on <html>; tokens do the rest.
// 언어와 테마. 테마는 <html>의 속성 하나이고 나머지는 토큰이 처리합니다.
import vf from '../lib/vf.js';
import { LOCALES } from '../config.js';

const THEME_KEY = 'app-theme';

function applyTheme(theme) {
  if (theme === 'light' || theme === 'dark') document.documentElement.setAttribute('data-theme', theme);
  else document.documentElement.removeAttribute('data-theme');
  try {
    if (theme === 'system') window.localStorage.removeItem(THEME_KEY);
    else window.localStorage.setItem(THEME_KEY, theme);
  } catch (e) { /* storage unavailable */ }
}

export default function settingsPage() {
  return vf.vfunc({
    state: { theme: document.documentElement.getAttribute('data-theme') || 'system' },
    render: (s) => vf.html`
      <section class="panel">
        <h1 class="panel__title" data-ref="heading">${vf.t('settings.title')}</h1>
        <fieldset class="choices">
          <legend class="choices__label">${vf.t('settings.language')}</legend>
          ${LOCALES.map((l) => vf.html`
            <label class="choices__option"><input type="radio" name="locale" id="${'locale-' + l}" value="${l}" data-action="locale"
              ${vf.i18n.locale() === l ? 'checked' : ''}> ${vf.t('settings.locale.' + l)}</label>`)}
        </fieldset>
        <fieldset class="choices">
          <legend class="choices__label">${vf.t('settings.theme')}</legend>
          ${['system', 'light', 'dark'].map((t) => vf.html`
            <label class="choices__option"><input type="radio" name="theme" id="${'theme-' + t}" value="${t}" data-action="theme"
              ${s.theme === t ? 'checked' : ''}> ${vf.t('settings.themes.' + t)}</label>`)}
        </fieldset>
      </section>`,
    delegates: [
      { selector: '[data-action="locale"]', eventType: 'change', onEvent: (e) => vf.i18n.set(e.target.value) },
      { selector: '[data-action="theme"]', eventType: 'change', onEvent: (e) => { applyTheme(e.target.value); e.sender.theme = e.target.value; } }
    ]
  });
}
