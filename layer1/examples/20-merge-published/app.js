// SPDX-License-Identifier: Apache-2.0
// AFTER the merge: same logic, the publisher's view. / 병합 후: 같은 로직, 퍼블리셔 화면
import { createOrderSummary } from './logic.js';
import publishedView from './views/published.js';

createOrderSummary(publishedView).mount('#app');
