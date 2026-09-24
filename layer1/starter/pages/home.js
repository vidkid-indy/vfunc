// SPDX-License-Identifier: Apache-2.0
import vf from '../lib/vf.js';
import { APP_VERSION } from '../config.js';

export default function homePage(ctx, router) {
  return vf.vfunc({
    render: () => vf.html`
      <section class="panel">
        <h1 class="panel__title" data-ref="heading">${vf.t('home.title')}</h1>
        <p>${vf.t('home.lead')}</p>
        <p class="muted" data-ref="version">${vf.t('home.version', { version: APP_VERSION })}</p>
        <a class="button" data-variant="primary" data-link href="${router.href('/items')}">${vf.t('home.start')}</a>
      </section>`
  });
}
