// SPDX-License-Identifier: Apache-2.0
import vf from '../../../dist/vfunc.esm.js';

export default function notFoundPage(ctx, router) {
  return vf.vfunc({
    render: () => vf.html`
      <section class="card">
        <h1 class="card__title" data-ref="heading">Not found / 없는 페이지</h1>
        <p><code>${ctx.path}</code> · <a data-link href="${router.href('/')}">Home</a></p>
      </section>`
  });
}
