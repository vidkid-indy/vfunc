// SPDX-License-Identifier: Apache-2.0
// 16 legacy-ie — app code in ES5: no arrow functions, const/let, template literals or classes.
// Markup is built with vf.tpl('{key}', data): the same escaping as vf.html.
// ES5 앱 코드입니다. 마크업은 vf.tpl로 만들고, vf.html과 같은 이스케이프가 적용됩니다.
(function () {
  'use strict';

  var tasks = [
    { id: 1, text: 'Open this page in Edge IE mode / Edge IE 모드로 열기', done: false },
    { id: 2, text: '<b>not bold</b> — escaped / 이스케이프됨', done: false }
  ];
  var nextId = 3;
  var current = null;

  document.getElementById('env').appendChild(document.createTextNode(
    'vfunc ' + vf.version + ' · documentMode: ' + (document.documentMode || '-')));

  function taskRow(task) {
    return vf.tpl(
      '<li class="task" data-id="{id}" data-state="{state}">' +
      '<label><input type="checkbox" id="task-{id}" data-action="toggle" {checked}> ' +
      '<span class="task__text">{text}</span></label></li>',
      { id: task.id, state: task.done ? 'done' : 'open', checked: task.done ? 'checked' : '', text: task.text });
  }

  function tasksPage() {
    return vf.vfunc({
      state: { tasks: tasks },
      render: function (s) {
        var rows = [];
        for (var i = 0; i < s.tasks.length; i++) rows.push(taskRow(s.tasks[i]));
        return vf.tpl(
          '<form data-action="add"><input class="input" data-ref="input" placeholder="New task / 새 할 일">' +
          ' <button class="btn btn-primary" type="submit">Add / 추가</button></form>' +
          '<ul class="tasks" data-ref="list">{rows}</ul>' +
          '<p data-ref="left">{left} left / 남음</p>',
          { rows: rows, left: countOpen(s.tasks) });
      },
      delegates: [
        {
          selector: '[data-action="add"]',
          eventType: 'submit',
          onEvent: function (e) {
            e.event.preventDefault();
            var value = e.sender.refs.input.value.replace(/^\s+|\s+$/g, '');
            if (!value) return;
            tasks = tasks.concat({ id: nextId++, text: value, done: false });
            e.sender.setState({ tasks: tasks });
          }
        },
        {
          selector: '[data-action="toggle"]',
          eventType: 'click',
          onEvent: function (e) {
            var id = Number(e.target.id.replace('task-', ''));
            var next = [];
            for (var i = 0; i < tasks.length; i++) {
              var t = tasks[i];
              next.push(t.id === id ? { id: t.id, text: t.text, done: !t.done } : t);
            }
            tasks = next;
            e.sender.setState({ tasks: tasks });
          }
        }
      ]
    });
  }

  function countOpen(list) {
    var n = 0;
    for (var i = 0; i < list.length; i++) if (!list[i].done) n++;
    return n;
  }

  function aboutPage() {
    return vf.vfunc({
      render: function () {
        return vf.tpl('<h2 data-ref="heading">About</h2><p>Built with vfunc {version} (legacy build). / legacy 빌드로 동작 중.</p>',
          { version: vf.version });
      }
    });
  }

  function show(page) {
    if (current) current.destroy();
    current = page;
    page.mount('#view');
  }

  var router = vf.router({
    mode: 'hash', // hash mode: the recommended mode for IE / IE에서는 hash 모드 권장
    routes: {
      '/': function () { show(tasksPage()); },
      '/about': function () { show(aboutPage()); }
    },
    notFound: function () { router.replace('/'); },
    onChange: function (ctx) {
      var links = vf.$$('[data-link]', document.getElementById('nav'));
      for (var i = 0; i < links.length; i++) {
        // IE11 supports attribute selectors, so CSS styles [aria-current] directly.
        // IE11도 속성 선택자를 지원하므로 CSS가 [aria-current]를 바로 꾸밉니다.
        if (links[i].getAttribute('href') === '#' + ctx.path) links[i].setAttribute('aria-current', 'page');
        else links[i].removeAttribute('aria-current');
      }
    }
  });

  router.start();
})();
