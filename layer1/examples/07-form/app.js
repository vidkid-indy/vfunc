// SPDX-License-Identifier: Apache-2.0
// 07 form — read, validate and reset a form without re-rendering it.
// 폼을 다시 그리지 않고 값 읽기·검사·초기화. 입력값과 커서가 흔들리지 않습니다.

const RULES = {
  name: (v) => (String(v).trim() ? '' : 'Enter your name. / 이름을 입력하세요.'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email. / 올바른 이메일을 입력하세요.'),
  password: (v) => (String(v).length >= 8 ? '' : 'At least 8 characters. / 8자 이상 입력하세요.'),
  agree: (v) => (v === true ? '' : 'Please agree to the terms. / 약관에 동의해 주세요.')
};

function validate(values) {
  const errors = {};
  for (const key in RULES) {
    const message = RULES[key](values[key]);
    if (message) errors[key] = message;
  }
  return errors;
}

/** Shows errors with aria-invalid and text only (CSS styles the state). / 상태 속성과 텍스트만 바꿉니다. */
function showErrors(inst, errors) {
  for (const key in RULES) {
    const control = inst.ids[key];
    const message = errors[key] || '';
    control.setAttribute('aria-invalid', message ? 'true' : 'false');
    inst.refs['error-' + key].textContent = message;
  }
}

function showResult(inst, state, message) {
  const box = inst.refs.result;
  box.hidden = !message;
  box.setAttribute('data-state', state);
  box.textContent = message;
}

vf.attach('#signup', {
  delegates: [
    {
      selector: '[data-action="submit"]',
      eventType: 'submit',
      onEvent: (e) => {
        e.event.preventDefault();
        const inst = e.sender;
        const values = vf.form.values(inst.$node);   // { name, email, password, plan, agree, source }
        const errors = validate(values);
        showErrors(inst, errors);
        const firstError = Object.keys(RULES).filter((key) => errors[key])[0];
        if (firstError) {
          showResult(inst, 'error', 'Please fix the highlighted fields. / 표시된 항목을 고쳐 주세요.');
          inst.ids[firstError].focus();
          return;
        }
        // To show or log values, leave the password out. Never log form values in real apps.
        // 값을 화면에 보이거나 기록할 때는 비밀번호를 뺍니다. 실제 앱에서는 폼 값을 로그로 남기지 마세요.
        const safe = vf.form.values(inst.$node, { skipPassword: true });
        showResult(inst, 'success', 'Welcome, ' + safe.name + ' (' + safe.plan + ') / 가입되었습니다.');
      }
    },
    {
      selector: '[data-action="reset"]',
      eventType: 'click',
      onEvent: (e) => {
        vf.form.reset(e.sender.$node);  // hidden #source stays; #plan goes back to user-default
        showErrors(e.sender, {});
        showResult(e.sender, 'info', '');
        e.sender.ids.name.focus();
      }
    }
  ]
});
