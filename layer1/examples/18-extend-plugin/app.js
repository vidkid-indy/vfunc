// SPDX-License-Identifier: Apache-2.0
// 18 extend-plugin — extend vfunc without editing it: C1 config, C2 styles (brand.css),
// C5 plugin (vf.use → vf.ext.company). / vfunc를 고치지 않고 확장하기.
import vf from '../../dist/vfunc.esm.js';
import companyPlugin from './company-plugin.js';

// C1 — settings: unsafe interpolation throws during development. / 개발 중에는 위험한 보간에서 예외
vf.config({ strict: true });

// C5 — plugin. Options go to install(vf, options). / 옵션은 install로 전달됩니다.
vf.use(companyPlugin, { duration: 4000 });

// The app overrides one of the plugin's messages (deep merge; later wins). / 앱이 플러그인 메시지 하나를 덮어씀
vf.i18n.add('en', { company: { saved: 'Your changes are saved.' } });

vf.i18n.setup({ locales: ['en', 'ko'], locale: 'en' }).then(() => {
  const panel = vf.vfunc({
    render: () => vf.html`
      <h2 class="card__title">vf.ext.company</h2>
      <div class="row">
        <button class="btn" type="button" data-action="saved" data-variant="primary">Save / 저장</button>
        <button class="btn" type="button" data-action="failed" data-variant="danger">Fail / 실패</button>
        <button class="btn" type="button" data-action="custom">Custom toast</button>
      </div>
      <h2 class="card__title">Rules / 규칙</h2>
      <ul class="list">
        <li class="list__item" data-ref="readonly">${readonlyCheck()}</li>
        <li class="list__item" data-ref="strict">${strictCheck()}</li>
        <li class="list__item" data-ref="ext">vf.ext: ${Object.keys(vf.ext).join(', ')}</li>
      </ul>`,
    delegates: [
      { selector: '[data-action="saved"]', eventType: 'click', onEvent: () => vf.ext.company.saved() },
      { selector: '[data-action="failed"]', eventType: 'click', onEvent: () => vf.ext.company.failed() },
      { selector: '[data-action="custom"]', eventType: 'click', onEvent: () => vf.ext.company.toast('<b>not bold</b> — escaped', 'info') }
    ]
  });
  panel.mount('#app');
});

/** Official vf members are read-only: extensions cannot replace them. / 공식 멤버는 읽기 전용 */
function readonlyCheck() {
  try {
    vf.html = null; // ES modules are strict: this throws / 모듈은 strict라 예외
    return 'vf.html was replaced (unexpected)';
  } catch (err) {
    return 'vf.html = … → TypeError: official members are read-only / 공식 멤버는 읽기 전용';
  }
}

/** With strict: true, an unsafe interpolation throws instead of being dropped. / strict면 예외 */
function strictCheck() {
  try {
    vf.html`<a onclick="${'alert(1)'}">x</a>`;
    return 'not blocked (unexpected)';
  } catch (err) {
    return 'onclick="${…}" → Error with vf.config({ strict: true }) / strict 모드에서 예외';
  }
}
