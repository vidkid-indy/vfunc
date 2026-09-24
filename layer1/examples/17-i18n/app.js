// SPDX-License-Identifier: Apache-2.0
// 17 i18n — vf.i18n, vf.t (placeholders, plurals) and vf.fmt. / 다국어, 치환·복수형, 포맷.
// A component renders as soon as it is created, so create components after setup() has loaded
// the messages. / 컴포넌트는 만들 때 바로 렌더하므로, 메시지를 불러온 뒤(setup 이후)에 만듭니다.

const PRICE = 12900;

function createCart() {
  return vf.vfunc({
    state: { count: 0, updated: new Date() },
    // vf.t returns plain text; vf.html escapes it. / vf.t는 평문이고 vf.html이 이스케이프합니다.
    render: (s) => vf.html`
      <h2 class="card__title">${vf.t('cart.title')}</h2>
      <p data-ref="items">${vf.t('cart.items', { count: s.count })}</p>
      <p data-ref="total">${vf.t('cart.total', { amount: vf.fmt.currency(s.count * PRICE, 'KRW') })}</p>
      <p class="muted" data-ref="updated">${vf.t('cart.updated', { when: vf.fmt.date(s.updated, { dateStyle: 'medium', timeStyle: 'short' }) })}</p>
      <div class="row">
        <button class="btn" type="button" data-action="add" data-variant="primary">${vf.t('cart.add')}</button>
        <button class="btn" type="button" data-action="clear">${vf.t('cart.clear')}</button>
      </div>`,
    delegates: [
      { selector: '[data-action="add"]', eventType: 'click', onEvent: (e) => e.sender.setState({ count: e.sender.count + 1, updated: new Date() }) },
      { selector: '[data-action="clear"]', eventType: 'click', onEvent: (e) => e.sender.setState({ count: 0, updated: new Date() }) }
    ]
  });
}

function createPicker() {
  return vf.vfunc({
    state: { locale: vf.i18n.locale() },
    render: (s) => vf.html`
      <span class="field__label">${vf.t('lang.label')}:</span>
      <button class="btn" type="button" data-action="locale" data-locale="ko" aria-pressed="${s.locale === 'ko' ? 'true' : 'false'}">한국어</button>
      <button class="btn" type="button" data-action="locale" data-locale="en" aria-pressed="${s.locale === 'en' ? 'true' : 'false'}">English</button>`,
    delegates: [{
      selector: '[data-action="locale"]',
      eventType: 'click',
      onEvent: (e) => vf.i18n.set(e.target.getAttribute('data-locale'))
    }]
  });
}

vf.i18n.setup({
  locales: ['ko', 'en'],       // allow-list / 허용 목록
  fallback: 'en',
  // Loaded when a locale is first used; only allowed locales get here. / 허용된 로케일만 불러옵니다.
  load: (locale) => fetch('./locales/' + locale + '.json').then((r) => r.json()),
  persist: 'vf-example-locale' // remember the choice / 선택 기억
}).then(() => {
  const cart = createCart();
  const picker = createPicker();
  cart.mount('#cart');
  picker.mount('#lang');
  vf.i18n.apply();

  // On a locale change: re-render components, re-translate the published markup.
  // 로케일이 바뀌면 컴포넌트를 다시 렌더하고 퍼블리싱 마크업을 다시 번역합니다.
  vf.i18n.subscribe((locale) => {
    picker.setState({ locale: locale });
    cart.refresh();
    vf.i18n.apply();
  });
});
