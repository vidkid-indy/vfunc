// SPDX-License-Identifier: Apache-2.0
//
// A settings form: vs* fields rendered by one form component whose values live outside it (so a
// re-render keeps what was typed), a vfChipsInput kept through `childs`, validation shown with the
// `error` prop, vfConfirm before a reset and vfToast after saving. The app texts are messages in
// two languages; the components' own texts come from their built-in messages (vfunc-ui.locale.ko.js).
// The log line is read by the browser test (layer2/test/e2e/examples.e2e.js).
/* global vf */

(function () {
  'use strict';

  const html = vf.html;
  const t = vf.t;
  const log = (text) => { vf.$('#log').textContent = text; };

  vf.i18n.add('en', {
    settings: {
      title: 'Settings', profile: 'Profile', notifications: 'Notifications',
      name: 'Name', email: 'Email', emailHint: 'We send receipts here.', language: 'Language', bio: 'About you',
      emailOn: 'Email notifications', pushOn: 'Push notifications', digest: 'Summary', daily: 'Daily', weekly: 'Weekly', never: 'Never',
      topics: 'Topics', topicsHint: 'Enter or comma adds a topic.',
      save: 'Save', reset: 'Reset', saved: 'Settings saved', resetTitle: 'Reset every setting?',
      resetMessage: 'Your changes are lost.', resetDone: 'Settings reset',
      required: 'Enter your name.', invalidEmail: 'Enter an email address like name@example.com.'
    }
  });
  vf.i18n.add('ko', {
    settings: {
      title: '설정', profile: '프로필', notifications: '알림',
      name: '이름', email: '이메일', emailHint: '영수증을 이 주소로 보냅니다.', language: '언어', bio: '소개',
      emailOn: '이메일 알림', pushOn: '푸시 알림', digest: '요약', daily: '매일', weekly: '매주', never: '받지 않음',
      topics: '관심 주제', topicsHint: 'Enter나 쉼표로 추가합니다.',
      save: '저장', reset: '초기화', saved: '설정을 저장했습니다', resetTitle: '모든 설정을 초기화할까요?',
      resetMessage: '바꾼 내용이 사라집니다.', resetDone: '설정을 초기화했습니다',
      required: '이름을 입력하세요.', invalidEmail: 'name@example.com 같은 이메일 주소를 입력하세요.'
    }
  });

  const DEFAULTS = { name: 'Ada', email: 'ada@example.com', language: 'en', bio: '', emailOn: true, pushOn: false, digest: 'weekly' };
  // The values live outside the component: every render starts from what the user typed.
  let values = Object.assign({}, DEFAULTS);
  let errors = {};

  const topicTexts = () => ({ label: t('settings.topics'), hint: t('settings.topicsHint') });
  const topics = vf.vfChipsInput(Object.assign({ id: 'topics', name: 'topics', value: ['release', 'security'], max: 8 }, topicTexts()));

  function validate() {
    const out = {};
    if (!values.name.trim()) out.name = t('settings.required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) out.email = t('settings.invalidEmail');
    return out;
  }

  const form = vf.vfunc({
    tag: 'form',
    opts: { className: 'settings__form', noValidate: true },
    render: () => html`
      ${vf.vsCard({ title: t('settings.profile'), body: html`
        <div class="settings__fields">
          ${vf.vsInput({ id: 'name', name: 'name', label: t('settings.name'), value: values.name, required: true, error: errors.name })}
          ${vf.vsInput({ id: 'email', name: 'email', type: 'email', label: t('settings.email'), hint: t('settings.emailHint'),
            value: values.email, required: true, autocomplete: 'email', error: errors.email })}
          ${vf.vsSelect({ id: 'language', name: 'language', label: t('settings.language'), value: values.language,
            options: [{ value: 'en', label: 'English' }, { value: 'ko', label: '한국어' }] })}
          ${vf.vsTextarea({ id: 'bio', name: 'bio', label: t('settings.bio'), rows: 3, value: values.bio })}
        </div>` })}
      ${vf.vsCard({ title: t('settings.notifications'), body: html`
        <div class="settings__fields">
          ${vf.vsSwitch({ id: 'email-on', name: 'emailOn', label: t('settings.emailOn'), checked: values.emailOn })}
          ${vf.vsSwitch({ id: 'push-on', name: 'pushOn', label: t('settings.pushOn'), checked: values.pushOn })}
          ${vf.vsRadioGroup({ id: 'digest', name: 'digest', label: t('settings.digest'), value: values.digest, direction: 'horizontal',
            options: [{ value: 'daily', label: t('settings.daily') }, { value: 'weekly', label: t('settings.weekly') }, { value: 'never', label: t('settings.never') }] })}
          <div id="topics-slot"></div>
        </div>` })}
      <div class="settings__actions">
        ${vf.vsButton({ label: t('settings.reset'), action: 'reset', variant: 'ghost' })}
        ${vf.vsButton({ label: t('settings.save'), type: 'submit', variant: 'primary', id: 'save' })}
      </div>`,
    childs: [{ targetId: 'topics-slot', component: topics }],
    events: [
      // Listeners on the form itself: no selector, the field's name tells which value changed.
      { eventType: 'input', onEvent: (e) => read(e.event.target) },
      { eventType: 'change', onEvent: (e) => read(e.event.target) },
      { eventType: 'submit', onEvent: (e) => { e.event.preventDefault(); save(); } }
    ],
    delegates: [{ selector: '[data-action="reset"]', eventType: 'click', onEvent: () => { reset(); } }]
  });

  function read(field) {
    if (!field.name || !Object.prototype.hasOwnProperty.call(DEFAULTS, field.name)) return;
    values[field.name] = field.type === 'checkbox' ? field.checked : field.value;
  }

  const toast = vf.vfToast();

  function save() {
    errors = validate();
    form.refresh();
    const invalid = Object.keys(errors);
    if (invalid.length) {
      document.getElementById(invalid[0]).focus();
      log('invalid ' + invalid.join(','));
      return;
    }
    // A real app sends this to its server; the server checks it again.
    const data = Object.assign({}, values, { topics: topics.getValue() });
    toast.show({ message: t('settings.saved'), variant: 'success' });
    log('saved ' + JSON.stringify(data));
  }

  async function reset() {
    const dialog = vf.vfConfirm({ title: t('settings.resetTitle'), message: t('settings.resetMessage'), variant: 'danger' });
    const ok = await dialog.open();
    dialog.destroy();
    if (!ok) { log('reset cancelled'); return; }
    values = Object.assign({}, DEFAULTS);
    errors = {};
    topics.setValue(['release', 'security']);
    form.refresh();
    toast.show({ message: t('settings.resetDone') });
    log('reset');
  }

  vf.vfSelectButton({ id: 'langs', ariaLabel: 'Language', value: 'en', size: 'sm',
    options: [{ value: 'en', label: 'English' }, { value: 'ko', label: '한국어' }],
    onChange: (e) => { vf.i18n.set(e.data.value); } }).mount('#lang');

  vf.i18n.setup({ locale: 'en', locales: ['en', 'ko'] }).then(() => {
    form.mount('#form');
    vf.i18n.subscribe(() => {
      vf.$('#title').textContent = t('settings.title');
      if (Object.keys(errors).length) errors = validate();
      topics.setState(topicTexts());
      form.refresh();
    });
  });
}());
