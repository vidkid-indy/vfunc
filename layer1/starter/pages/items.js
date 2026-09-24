// SPDX-License-Identifier: Apache-2.0
// A list page: loading / error / empty / ready states, one delegated listener for every row,
// a form read without re-rendering, and a store subscription released in onDestroy.
// 목록 페이지: 상태 네 가지, 행 전체에 위임 하나, 다시 그리지 않고 읽는 폼, onDestroy에서 구독 해제.
import vf from '../lib/vf.js';
import { listItems, saveItem } from '../api.js';
import { app, toggleFavorite, isFavorite } from '../store.js';

export default function itemsPage(ctx, router) {
  let unsubscribe = null;
  return vf.vfunc({
    state: { status: 'loading', items: [], favorites: app.get('favorites') },
    render: (s) => vf.html`
      <section class="panel">
        <h1 class="panel__title" data-ref="heading">${vf.t('items.title')}</h1>
        <form class="items__form" data-action="add">
          <input class="input" data-ref="name" name="name" placeholder="${vf.t('items.placeholder')}" aria-label="${vf.t('items.placeholder')}" autocomplete="off">
          <button class="button" type="submit" data-variant="primary">${vf.t('items.add')}</button>
        </form>
        ${s.status === 'loading' ? vf.html`<p class="muted" role="status" data-ref="status">${vf.t('common.loading')}</p>` : ''}
        ${s.status === 'error' ? vf.html`<p class="notice" data-state="error" role="alert" data-ref="status">${vf.t('common.error')}</p>` : ''}
        ${s.status === 'ready' && s.items.length === 0 ? vf.html`<p class="muted" data-ref="status">${vf.t('items.empty')}</p>` : ''}
        <ul class="items__list" data-ref="list">${s.items.map((item) => vf.html`
          <li class="items__row" data-id="${item.id}" data-state="${isFavorite(s, item.id) ? 'favorite' : 'normal'}">
            <span class="items__name">${item.name}</span>
            <span class="muted">${vf.fmt.date(item.created, { dateStyle: 'medium' })}</span>
            <button class="button" type="button" id="${'fav-' + item.id}" data-action="favorite"
                    aria-pressed="${isFavorite(s, item.id) ? 'true' : 'false'}">${vf.t('items.favorite')}</button>
          </li>`)}</ul>
        <p class="muted" data-ref="count">${vf.t('items.count', { count: s.items.length })}</p>
      </section>`,
    delegates: [
      {
        selector: '[data-action="add"]',
        eventType: 'submit',
        onEvent: async (e) => {
          e.event.preventDefault();
          const name = e.sender.refs.name.value.trim();
          if (!name) return;
          const item = await saveItem({ id: 'i' + Date.now(), name: name, created: new Date().toISOString().slice(0, 10) });
          e.sender.setState({ items: e.sender.items.concat(item) });
        }
      },
      {
        selector: '[data-action="favorite"]',
        eventType: 'click',
        onEvent: (e) => toggleFavorite(e.target.closest('[data-id]').getAttribute('data-id'))
      }
    ],
    onMount: async (inst) => {
      unsubscribe = app.subscribe((state) => inst.setState({ favorites: state.favorites }));
      try {
        inst.setState({ status: 'ready', items: await listItems() });
      } catch (err) {
        inst.setState({ status: 'error' });
      }
    },
    onDestroy: () => { if (unsubscribe) unsubscribe(); }
  });
}
