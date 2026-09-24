// SPDX-License-Identifier: Apache-2.0
// 14 before-after-conversion — the result of running prompt-html-to-vfunc.md on ../before/.
// The published HTML stays; only the six dynamic areas of the area table get behaviour.
// 퍼블리싱 HTML은 그대로 두고, 영역 판별표의 동적 영역 여섯 곳에만 동작을 붙였습니다. (CONVERSION.md)
import vf from '../../../dist/vfunc.esm.js';
import { loadDashboard } from './api.js';

const LABELS = { paid: 'Paid', shipped: 'Shipped', refunded: 'Refunded' };

// ① User menu — adopted (no render): open/close, Escape, outside click, sign out. / 채택
function setMenu(inst, open) {
  inst.ids.userMenu.hidden = !open;
  inst.refs['menu-button'].setAttribute('aria-expanded', open ? 'true' : 'false');
}
let closeOutside = null;
vf.attach('#user-menu', {
  delegates: [
    { selector: '[data-action="menu"]', eventType: 'click', onEvent: (e) => setMenu(e.sender, e.sender.ids.userMenu.hidden) },
    {
      selector: '[data-action="sign-out"]',
      eventType: 'click',
      onEvent: (e) => {
        e.event.preventDefault();
        setMenu(e.sender, false);
        e.sender.refs['menu-button'].textContent = 'Signed out';  // VERIFY: call the real sign-out API
      }
    }
  ],
  onMount: (inst) => {
    closeOutside = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'click' && inst.$node.contains(event.target)) return;
      setMenu(inst, false);
    };
    document.addEventListener('click', closeOutside);
    document.addEventListener('keydown', closeOutside);
  },
  onDestroy: () => {
    document.removeEventListener('click', closeOutside);
    document.removeEventListener('keydown', closeOutside);
  }
});

// ② KPI cards — replaced (render): values come from the server. / 대체: 값은 서버에서
const kpis = vf.attach('#kpis', {
  state: { items: null },
  render: (s) => vf.html`
    <section class="kpis" id="kpis" aria-busy="${s.items ? 'false' : 'true'}">${(s.items || []).map((k) => vf.html`
      <div class="kpi">
        <p class="kpi__label">${k.label}</p>
        <p class="kpi__value">${k.kind === 'currency' ? vf.fmt.currency(k.value, 'KRW') : vf.fmt.number(k.value)}</p>
        <p class="${'kpi__delta ' + (k.delta >= 0 ? 'kpi__delta--up' : 'kpi__delta--down')}" data-state="${k.delta >= 0 ? 'up' : 'down'}">${(k.delta >= 0 ? '+' : '') + k.delta.toFixed(1) + '%'}</p>
      </div>`)}</section>`
});

// ③ Summary tabs — adopted: the publisher's CSS shows the active tab with a class, so the class is
// toggled for looks (aria-selected carries the state; selectors never use the class).
// 채택: 퍼블리셔 CSS가 클래스로 활성 탭을 표시하므로 모양용으로 토글합니다. 셀렉터는 클래스를 쓰지 않습니다.
let summaryTexts = {};
vf.attach('#summary-panel', {
  delegates: [{
    selector: '[data-action="tab"]',
    eventType: 'click',
    onEvent: (e) => {
      const name = e.target.getAttribute('data-tab');
      vf.$$('[data-action="tab"]', e.sender.$node).forEach((tab) => {
        const on = tab === e.target;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.classList.toggle('tabs__tab--active', on);
      });
      e.sender.refs['summary-text'].textContent = summaryTexts[name] || '';  // text only, never HTML
    }
  }]
});

// ④ Orders table body — replaced (render). Table rows must be parsed inside a table, hence tag: 'table'.
// 대체: 표의 행은 table 안에서 파싱해야 하므로 tag: 'table'
const orders = vf.attach('#orders-body', {
  tag: 'table',
  state: { items: [], status: '', q: '' },
  render: (s) => {
    const q = s.q.trim().toLowerCase();
    const shown = s.items.filter((o) => (!s.status || o.status === s.status) &&
      (!q || String(o.id).indexOf(q.replace('#', '')) >= 0 || o.customer.toLowerCase().indexOf(q) >= 0));
    return vf.html`
      <tbody id="orders-body">${shown.length === 0
        ? vf.html`<tr><td colspan="4" data-ref="empty">No orders match.</td></tr>`
        : shown.map((o) => vf.html`
          <tr data-id="${o.id}">
            <td>#${o.id}</td><td>${o.customer}</td>
            <td><span class="${'badge badge--' + o.status}" data-state="${o.status}">${LABELS[o.status] || o.status}</span></td>
            <td class="orders__num">${vf.fmt.currency(o.total, 'KRW')}</td>
          </tr>`)}</tbody>`;
  }
});

// ⑤ Filters — the status select (adopted panel) and the global search box (adopted input).
// 필터: 상태 선택(패널 채택)과 상단 검색창(입력칸 채택)
vf.attach('#orders-panel', {
  delegates: [{ selector: '[data-action="filter"]', eventType: 'change', onEvent: (e) => orders.setState({ status: e.target.value }) }]
});
vf.attach('#order-search', {
  delegates: [{ selector: '[data-action="search"]', eventType: 'input', onEvent: (e) => orders.setState({ q: e.target.value }) }]
});

loadDashboard().then((data) => {
  kpis.setState({ items: data.kpis });
  summaryTexts = data.summary;
  orders.setState({ items: data.orders });
});
