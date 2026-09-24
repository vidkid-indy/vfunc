// SPDX-License-Identifier: Apache-2.0
// A company plugin: installed with vf.use, reachable as vf.ext.company (plan section I, level C5).
// Rules it follows: no members on the vf root, public API only, no design values in JS,
// user-visible text through message keys. / 회사 플러그인 예시. vf 루트를 건드리지 않고 공개 API만 씁니다.

export default {
  name: 'company',
  version: '1.0.0',
  requires: '^1.0.0',
  install(vf, options) {
    const duration = options.duration || 3000;

    // Default messages; the app may override them with vf.i18n.add later. / 앱이 나중에 덮어쓸 수 있는 기본 메시지
    vf.i18n.add('en', { company: { saved: 'Saved.', failed: 'Something went wrong.', close: 'Close' } });
    vf.i18n.add('ko', { company: { saved: '저장했습니다.', failed: '문제가 생겼습니다.', close: '닫기' } });

    let stack = null;
    function container() {
      if (!stack) {
        stack = vf.el('div', { className: 'toast-stack' });
        stack.setAttribute('aria-live', 'polite');
        stack.setAttribute('data-ref', 'toasts');
        document.body.appendChild(stack);
      }
      return stack;
    }

    /** Shows a message. `kind`: 'info' | 'success' | 'error' → data-state for the CSS. */
    function toast(message, kind) {
      const item = vf.node(vf.html`
        <div class="toast" role="status" data-state="${kind || 'info'}">
          <span class="toast__text">${message}</span>
          <button class="toast__close" type="button" data-action="close-toast" aria-label="${vf.t('company.close')}">×</button>
        </div>`);
      const close = () => { if (item.parentNode) item.parentNode.removeChild(item); };
      item.querySelector('[data-action="close-toast"]').addEventListener('click', close);
      container().appendChild(item);
      setTimeout(close, duration);
      return close;
    }

    // Whatever install returns becomes vf.ext.company. / 반환값이 vf.ext.company가 됩니다.
    return {
      toast: toast,
      saved: () => toast(vf.t('company.saved'), 'success'),
      failed: () => toast(vf.t('company.failed'), 'error')
    };
  }
};
