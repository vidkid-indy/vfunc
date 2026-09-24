// SPDX-License-Identifier: Apache-2.0
import vf from '../lib/vf.js';

export default function notFoundPage(ctx, router) {
  return vf.vfunc({
    render: () => vf.html`
      <section class="panel">
        <h1 class="panel__title" data-ref="heading">${vf.t('notFound.title')}</h1>
        <p><code>${ctx.path}</code> · <a data-link href="${router.href('/')}">${vf.t('nav.home')}</a></p>
      </section>`
  });
}
