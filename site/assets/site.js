// SPDX-License-Identifier: Apache-2.0
//
// The site's "islands": the pages are static HTML built from Markdown, and vfunc controls only the
// parts that need behaviour — "keep your HTML, control only what you need", on our own site.
// 사이트의 섬: 페이지는 정적 HTML이고, 동작이 필요한 곳만 vfunc가 제어합니다.
import vf from '../lib/vfunc.esm.min.js';

const body = document.body;
const lang = body.getAttribute('data-lang') || 'en';
const store = {
  get(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } },
  set(key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ } }
};

// ① Theme: system → light → dark. The attribute on <html> is all; tokens do the rest.
const THEMES = ['system', 'light', 'dark'];
vf.attach('#theme-toggle', {
  delegates: [{
    selector: '[data-action="theme"]',
    eventType: 'click',
    onEvent: (e) => {
      const current = document.documentElement.getAttribute('data-theme') || 'system';
      const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
      if (next === 'system') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', next);
      store.set('vf-site-theme', next);
      e.target.setAttribute('data-state', next);
      e.target.setAttribute('title', next);
    }
  }],
  onMount: (inst) => inst.$node.setAttribute('data-state', document.documentElement.getAttribute('data-theme') || 'system')
});

// ② Navigation on small screens. / 작은 화면의 메뉴
vf.attach('#nav-toggle', {
  delegates: [{
    selector: '[data-action="nav"]',
    eventType: 'click',
    onEvent: (e) => {
      const open = e.target.getAttribute('aria-expanded') !== 'true';
      e.target.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.getElementById('site-nav').setAttribute('data-state', open ? 'open' : 'closed');
    }
  }]
});

// ③ Remember the language when the reader switches. / 언어 전환을 기억
const other = vf.$('[data-ref="other-lang"]');
if (other) other.addEventListener('click', () => store.set('vf-site-lang', other.getAttribute('hreflang')));
store.set('vf-site-lang', lang);

// ④ Copy buttons on every code block and prompt. / 코드 블록 복사 버튼
vf.attach('#content', {
  delegates: [{
    selector: '[data-action="copy"]',
    eventType: 'click',
    onEvent: (e) => {
      const block = e.target.closest('[data-copy-root]');
      const code = block ? block.querySelector('pre') : null;
      if (!code) return;
      const label = e.target.textContent;
      const done = () => {
        e.target.textContent = body.getAttribute('data-copied-label') || 'Copied';
        e.target.setAttribute('data-state', 'copied');
        setTimeout(() => { e.target.textContent = label; e.target.removeAttribute('data-state'); }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code.textContent).then(done, () => {});
    }
  }]
});

// ⑤ Search: headings of every page in this language, loaded on first use. / 첫 입력 때 색인을 불러옴
let index = null;
const results = vf.attach('#search-results', {
  state: { query: '', hits: [], empty: '' },
  render: (s) => vf.html`
    <div class="search-results" id="search-results" aria-live="polite" data-state="${s.query ? 'open' : 'closed'}">
      ${!s.query ? '' : s.hits.length === 0 ? vf.html`<p class="search-results__empty">${s.empty}</p>` : vf.html`
        <ul class="search-results__list">${s.hits.map((h) => vf.html`
          <li><a class="search-results__link" data-ref="hit" href="${h.href}">${h.title}${h.section ? vf.html` <span class="muted">· ${h.section}</span>` : ''}</a></li>`)}</ul>`}
    </div>`
});

function search(query) {
  const q = query.trim().toLowerCase();
  if (!q) return results.setState({ query: '', hits: [] });
  const load = index ? Promise.resolve(index)
    : fetch(new URL('search-' + lang + '.json', import.meta.url)).then((r) => r.json()).then((data) => (index = data));
  load.then((data) => {
    const hits = [];
    for (const page of data.pages) {
      if (page.title.toLowerCase().indexOf(q) >= 0) hits.push({ href: './' + page.url, title: page.title, section: '' });
      for (const h of page.headings) {
        if (hits.length >= 12) break;
        if (h.text.toLowerCase().indexOf(q) >= 0 && h.text !== page.title) hits.push({ href: './' + page.url + '#' + h.id, title: page.title, section: h.text });
      }
    }
    results.setState({ query: q, hits: hits.slice(0, 12), empty: data.noResults });
  });
}

vf.attach('#site-search', {
  delegates: [
    { selector: '[data-action="search"]', eventType: 'input', onEvent: (e) => search(e.event.target.value) },
    { selector: '[data-action="search"]', eventType: 'submit', onEvent: (e) => {
      e.event.preventDefault();
      const first = vf.$('[data-ref="hit"]');
      if (first) window.location.href = first.getAttribute('href');
    } }
  ]
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') results.setState({ query: '', hits: [] });
});

// ⑥ The home page demo: a live component, escaping included. / 홈 데모
if (vf.$('#home-demo')) {
  const L = lang === 'ko'
    ? { title: '직접 해 보세요', name: '이름', hello: '안녕하세요', clicks: '클릭', add: '+1', hint: '<b>굵게</b>를 입력해 보세요. 이스케이프되어 글자로 보입니다.' }
    : { title: 'Try it', name: 'Name', hello: 'Hello', clicks: 'clicks', add: '+1', hint: 'Type <b>bold</b>: it is escaped and shown as text.' };
  vf.attach('#home-demo', {
    state: { name: 'vfunc', count: 0 },
    render: (s) => vf.html`
      <div class="demo" id="home-demo" data-state="live">
        <p class="demo__title">${L.title}</p>
        <label class="demo__field">${L.name} <input class="demo__input" id="demo-name" value="${s.name}" data-action="name" autocomplete="off"></label>
        <p class="demo__output" data-ref="greeting">${L.hello}, <strong>${s.name}</strong>!</p>
        <p><button class="demo__button" type="button" data-action="add">${L.add}</button> <span data-ref="count">${s.count}</span> ${L.clicks}</p>
        <p class="muted">${L.hint}</p>
      </div>`,
    delegates: [
      { selector: '[data-action="name"]', eventType: 'input', onEvent: (e) => { e.sender.name = e.target.value; } },
      { selector: '[data-action="add"]', eventType: 'click', onEvent: (e) => { e.sender.count++; } }
    ]
  });
}
