// SPDX-License-Identifier: Apache-2.0
import vf from '../../../dist/vfunc.esm.js';

export default function homePage(ctx, router) {
  return vf.vfunc({
    render: () => vf.html`
      <section class="card">
        <h1 class="card__title" data-ref="heading">Welcome / 환영합니다</h1>
        <p>This sample is the standard SPA structure: <code>app.js</code> + <code>store.js</code> + <code>pages/*.js</code>. /
          이 예제가 SPA 표준 구조입니다.</p>
        <a class="btn" data-variant="primary" data-link href="${router.href('/products')}">Browse products / 상품 보기</a>
      </section>`
  });
}
